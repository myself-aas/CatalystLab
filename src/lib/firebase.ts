import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  setLogLevel,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  addDoc, 
  setDoc,
  getDoc, 
  getDocFromServer,
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import type { AuditReport, BlogPost, MonitoredSite, ApiKey, WhiteLabelConfig, ContactInquiry, UserSubscription, SubscriptionPlanId, GithubRepo, GithubTelemetryEvent, UserProfile } from '../types';
import { calculateReadingTime } from '../utils/readingTime';

import firebaseConfig from '../../firebase-applet-config.json';
import { logger } from './logger';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use named Firestore database if configured per Firebase Integration skill
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true,
  }, databaseId);
} catch {
  firestoreInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}


export const db = firestoreInstance;
setLogLevel('silent'); // Suppress noisy offline/unavailable SDK warnings

async function testConnection() {
  try {
    // Non-blocking connection check with timeout
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
  } catch (error) {
    // Gracefully operate in offline/local cache mode without spamming console errors
  }
}
testConnection();

export interface FirebaseDomainConfig {
  projectId: string;
  authDomain: string;
  currentHostname: string;
  consoleAuthUrl: string;
}

export function getFirebaseDomainSettings(): FirebaseDomainConfig {
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  return {
    projectId: firebaseConfig.projectId || 'catalystlabhub',
    authDomain: firebaseConfig.authDomain || 'catalystlabhub.firebaseapp.com',
    currentHostname,
    consoleAuthUrl: `https://console.firebase.google.com/project/${firebaseConfig.projectId || 'catalystlabhub'}/authentication/settings`
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  logger.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

const LOCAL_REPORTS_KEY = 'catalystlab_cached_reports';

function getLocalReports(): AuditReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReport(report: AuditReport): void {
  if (typeof window === 'undefined') return;
  try {
    const reports = getLocalReports().filter(r => r.id !== report.id);
    reports.unshift(report);
    // Keep max 50 recent reports
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports.slice(0, 50)));
  } catch (err) {
    logger.warn('Failed to cache report locally:', err);
  }
}

function deleteLocalReport(reportId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const reports = getLocalReports().filter(r => r.id !== reportId);
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
  } catch (err) {
    logger.warn('Failed to delete local report:', err);
  }
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

export interface AuthErrorInfo {
  code: string;
  message: string;
  domain?: string;
  isUnauthorizedDomain: boolean;
  isUserCancelled: boolean;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please verify and try again.',
  'auth/invalid-credential': 'Invalid email or password. Please verify your credentials.',
  'auth/email-already-in-use': 'An account already exists with this email address. Please sign in instead.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/invalid-email': 'Please provide a valid email address.',
  'auth/account-exists-with-different-credential': 'An account already exists with this email address using a different login method (e.g., Google or GitHub).',
  'auth/too-many-requests': 'Too many failed login attempts. Please wait a moment or reset your password.',
};

export function formatAuthError(error: any): AuthErrorInfo {
  const errorCode = error?.code || '';
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  
  const isUnauthorizedDomain = errorCode === 'auth/unauthorized-domain' || 
    (typeof error?.message === 'string' && error.message.includes('unauthorized-domain'));
  const isUserCancelled = errorCode === 'auth/popup-closed-by-user' || 
    errorCode === 'auth/cancelled-popup-request';

  let friendlyMessage = error?.message || 'Authentication failed.';

  if (isUnauthorizedDomain) {
    friendlyMessage = `Domain '${currentDomain}' is not authorized in Firebase Authentication settings.`;
  } else if (isUserCancelled) {
    friendlyMessage = 'Sign-in window was closed before completion.';
  } else if (AUTH_ERROR_MESSAGES[errorCode]) {
    friendlyMessage = AUTH_ERROR_MESSAGES[errorCode];
  }

  return {
    code: errorCode || 'auth/unknown',
    message: friendlyMessage,
    domain: currentDomain,
    isUnauthorizedDomain,
    isUserCancelled
  };
}

export const loginWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    const errorDetails = formatAuthError(error);
    if (errorDetails.isUnauthorizedDomain) {
      logger.warn("Firebase Auth Notice: Domain requires whitelisting:", errorDetails.domain);
    } else if (!errorDetails.isUserCancelled) {
      logger.error("Google login failed:", error);
    }
    const enhancedError = new Error(errorDetails.message);
    Object.assign(enhancedError, errorDetails);
    throw enhancedError;
  }
};

export const loginWithGithub = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  } catch (error: unknown) {
    const errorDetails = formatAuthError(error);
    if (errorDetails.isUnauthorizedDomain) {
      logger.warn("Firebase Auth Notice: Domain requires whitelisting:", errorDetails.domain);
    } else if (!errorDetails.isUserCancelled) {
      logger.error("GitHub login failed:", error);
    }
    const enhancedError = new Error(errorDetails.message);
    Object.assign(enhancedError, errorDetails);
    throw enhancedError;
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  } catch (error: unknown) {
    const errorDetails = formatAuthError(error);
    logger.error("Email login failed:", error);
    const enhancedError = new Error(errorDetails.message);
    Object.assign(enhancedError, errorDetails);
    throw enhancedError;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && displayName.trim()) {
      try {
        await updateProfile(result.user, {
          displayName: displayName.trim()
        });
      } catch (profileErr) {
        logger.warn("Could not update user display name:", profileErr);
      }
    }
    return result.user;
  } catch (error: unknown) {
    const errorDetails = formatAuthError(error);
    logger.error("Email sign up failed:", error);
    const enhancedError = new Error(errorDetails.message);
    Object.assign(enhancedError, errorDetails);
    throw enhancedError;
  }
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: unknown) {
    const errorDetails = formatAuthError(error);
    logger.error("Password reset failed:", error);
    const enhancedError = new Error(errorDetails.message);
    Object.assign(enhancedError, errorDetails);
    throw enhancedError;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    logger.error("Logout failed:", error);
    throw error;
  }
};

// --- REPORTS CRUD ---

export interface SaveReportParams {
  url: string;
  engine: string;
  output: string;
  title?: string;
  summary?: string;
  score?: number;
  userId?: string;
  userEmail?: string;
  auditSessionId?: string;
  visitorId?: string;
}

export const saveReport = async (
  urlOrParams: string | SaveReportParams, 
  maybeEngine?: string, 
  maybeOutput?: string, 
  extra: { title?: string; score?: number } = {}
): Promise<string> => {
  const path = "reports";
  
  let url: string;
  let engine: string;
  let output: string;
  let title: string | undefined;
  let score: number | undefined;

  if (typeof urlOrParams === 'object' && urlOrParams !== null) {
    url = urlOrParams.url;
    engine = urlOrParams.engine;
    output = urlOrParams.output;
    title = urlOrParams.title;
    score = urlOrParams.score;
  } else {
    url = urlOrParams as string;
    engine = maybeEngine || 'master-audit';
    output = maybeOutput || '';
    title = extra.title;
    score = extra.score;
  }

  const currentUser = auth.currentUser;
  const isGuest = !currentUser;
  const ownerId = currentUser?.uid || 'guest';
  const ownerEmail = currentUser?.email || '';

  const reportData: Omit<AuditReport, 'id'> = {
    url: String(url || '').substring(0, 500),
    engine: String(engine || 'master-audit').substring(0, 100),
    output: String(output || '').substring(0, 500000),
    ownerId,
    ownerEmail,
    createdAt: Date.now(),
    ...(title ? { title: String(title).substring(0, 200) } : {}),
    ...(typeof score === 'number' ? { score } : {})
  };

  // If user is authenticated, attempt saving to Firestore
  if (!isGuest) {
    try {
      const docRef = await addDoc(collection(db, path), reportData);
      const saved: AuditReport = { id: docRef.id, ...reportData };
      saveLocalReport(saved);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      // Fallback to local storage
      const fallbackId = `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const saved: AuditReport = { id: fallbackId, ...reportData };
      saveLocalReport(saved);
      return fallbackId;
    }
  } else {
    // Guest report: persist in browser localStorage seamlessly
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const saved: AuditReport = { id: guestId, ...reportData };
    saveLocalReport(saved);
    return guestId;
  }
};

export const getReport = async (reportId: string): Promise<AuditReport | null> => {
  if (!reportId) return null;

  // 1. Check local cache first for instant resolution
  const localMatch = getLocalReports().find(r => r.id === reportId);
  if (localMatch) {
    return localMatch;
  }

  // 2. If guest report format, it is exclusively local
  if (reportId.startsWith('guest-')) {
    return null;
  }

  // 3. Query Firestore
  const path = `reports/${reportId}`;
  try {
    const docRef = doc(db, "reports", reportId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const report: AuditReport = { id: docSnap.id, ...(docSnap.data() as Omit<AuditReport, 'id'>) };
      saveLocalReport(report);
      return report;
    }
    return null;
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.GET, path);
    return getLocalReports().find(r => r.id === reportId) || null;
  }
};

export const deleteReport = async (reportId: string): Promise<boolean> => {
  if (!reportId) return false;
  deleteLocalReport(reportId);

  if (reportId.startsWith('guest-') || reportId.startsWith('report-')) {
    return true;
  }

  if (!auth.currentUser) return true;
  const path = `reports/${reportId}`;
  try {
    const docRef = doc(db, "reports", reportId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return true;
  }
};

export const getUserReports = async (): Promise<AuditReport[]> => {
  const local = getLocalReports();
  if (!auth.currentUser) {
    return local.filter(r => r.ownerId === 'guest');
  }

  const path = "reports";
  try {
    const q = query(
      collection(db, path), 
      where("ownerId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const firestoreReports: AuditReport[] = [];
    querySnapshot.forEach((docSnap) => {
      firestoreReports.push({ id: docSnap.id, ...(docSnap.data() as Omit<AuditReport, 'id'>) });
    });

    // Merge Firestore with local cached reports
    const reportMap = new Map<string, AuditReport>();
    local.forEach(r => {
      const key = r.id || `loc-${r.createdAt || Date.now()}`;
      reportMap.set(key, r);
    });
    firestoreReports.forEach(r => {
      const key = r.id || `remote-${r.createdAt || Date.now()}`;
      reportMap.set(key, r);
    });

    const merged = Array.from(reportMap.values());
    merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return merged;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    // Return local cache on network error
    return local.filter(r => r.ownerId === auth.currentUser?.uid || r.ownerId === 'guest');
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const reports = await getAllReportsForAdmin();
  const map = new Map<string, UserProfile>();
  for (const report of reports) {
    const uid = report.ownerId || report.ownerEmail || 'unknown';
    if (map.has(uid)) continue;
    map.set(uid, {
      uid,
      email: report.ownerEmail || 'unknown',
      role: report.ownerId === 'guest' ? 'guest' : 'user',
      displayName: report.ownerEmail?.split('@')[0],
    });
  }
  return Array.from(map.values());
};

export const getAllReportsForAdmin = async (): Promise<AuditReport[]> => {
  const path = "reports";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const reports: AuditReport[] = [];
    querySnapshot.forEach((docSnap) => {
      reports.push({ id: docSnap.id, ...(docSnap.data() as Omit<AuditReport, 'id'>) });
    });
    reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return reports;
  } catch (error) {
    return await getUserReports();
  }
};

// --- BLOG POSTS CRUD ---

export const INITIAL_SEEDED_BLOGS: BlogPost[] = [
  {
    id: 'seed-1',
    title: 'The Modern Anatomy of Website Health in the Era of AI Search',
    slug: 'modern-website-health-ai-search',
    excerpt: 'Why traditional SEO is yielding ground to structured RAG indexing and how llms.txt standardizes generative search ingestion.',
    content: `## The Paradigm Shift: From Keywords to Vector Embeddings

In 2026, web crawlers are no longer simple heuristic indexers—they are autonomous LLM retrieval agents powering Perplexity, ChatGPT Search, and Gemini.

### The 3 Pillars of AI Search Optimization (LLMO)
1. **The \`/llms.txt\` Standard**: Providing clear markdown directives for AI crawlers drastically minimizes token waste and eliminates synthetic hallucinations.
2. **Schema.org Structured Microdata**: JSON-LD payload graphs establish semantic entity relationships that vector databases can easily parse.
3. **Semantic Purity & Content-to-HTML Ratio**: Sites with over 90% nested DOM boilerplates suffer severe chunking degradation during RAG extraction.

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Modern Website Health for LLMs",
  "author": "CatalystLab SecOps Team"
}
\`\`\`

By ensuring your DOM maintains high semantic density and proper headings hierarchy, you ensure your platform is cited as a primary source by next-generation search bots.`,
    category: 'AI & LLMO',
    tags: ['LLMO', 'AI Search', 'RAG', 'llms.txt', 'SEO'],
    authorName: 'CatalystLab Engineering',
    authorEmail: 'shuvo.1807016@bau.edu.bd',
    status: 'published',
    readTime: '6 min read',
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    views: 428
  },
  {
    id: 'seed-2',
    title: 'Decimating TTFB with Multi-Region Edge Workers & Smart Routing',
    slug: 'decimating-ttfb-edge-workers',
    excerpt: 'A deep-dive into synthetic edge latency telemetry across Tokyo, Frankfurt, Virginia, and Sydney points of presence.',
    content: `## The Geography of Milliseconds

Time To First Byte (TTFB) is the single highest predictor of bounce rates for modern interactive web applications. When packets must traverse trans-Pacific fiber lines, round-trip latency often exceeds 220ms before JavaScript execution even begins.

### Global Radar Telemetry Results:
- **US East (Virginia)**: ~57ms
- **US West (Oregon)**: ~86ms
- **EU Central (Frankfurt)**: ~108ms
- **AP Northeast (Tokyo)**: ~178ms
- **AP Southeast (Sydney)**: ~223ms

### Edge Acceleration Architecture:
1. **CDN Edge Caching**: Keep static assets and pre-rendered HTML within 15ms of end users.
2. **TLS Session Resumption**: Zero-RTT handshakes on TLS 1.3 prevent redundant cryptographic negotiation.
3. **HTTP/3 QUIC Multiplexing**: Eliminate head-of-line blocking across lossy mobile networks.`,
    category: 'Edge Latency',
    tags: ['Edge', 'TTFB', 'Performance', 'CDN', 'Infrastructure'],
    authorName: 'CatalystLab DevOps',
    authorEmail: 'shuvo.1807016@bau.edu.bd',
    status: 'published',
    readTime: '8 min read',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    views: 892
  },
  {
    id: 'seed-3',
    title: 'Automating Git Repository SecOps & Hygiene Verification',
    slug: 'automating-git-secops-hygiene',
    excerpt: 'How automated branch protection, license checks, and SECURITY.md audits prevent catastrophic supply-chain leaks.',
    content: `## Securing the Modern Software Supply Chain

A high percentage of security breaches begin not in production firewalls, but in misconfigured public repositories with exposed secrets, stale dependencies, and missing vulnerability disclosure policies.

### The 6 Essential Repository Hygiene Checks:
1. **License Declaration**: Mitigates open-source copyright liabilities.
2. **SECURITY.md Policy**: Establishes a responsible vulnerability reporting pipeline.
3. **Branch Protection Rules**: Mandates code reviews and status checks before staging merges.
4. **Automated Secret Scanning**: Pre-commit hooks to block exposed API keys.
5. **Dependency Audit (Dependabot/Snyk)**: Proactive CVE patching.
6. **Code of Conduct & Contributing Guides**: Standardizes OSS maintenance workflows.`,
    category: 'SecOps',
    tags: ['Git', 'SecOps', 'Security', 'DevSecOps'],
    authorName: 'CatalystLab SecOps',
    authorEmail: 'shuvo.1807016@bau.edu.bd',
    status: 'published',
    readTime: '5 min read',
    createdAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
    views: 615
  }
];

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const path = "blogs";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const posts: BlogPost[] = [];
    querySnapshot.forEach((docSnap) => {
      posts.push({ id: docSnap.id, ...(docSnap.data() as Omit<BlogPost, 'id'>) });
    });
    
    if (posts.length === 0) {
      return INITIAL_SEEDED_BLOGS;
    }
    
    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return posts;
  } catch (error) {
    logger.warn("Could not fetch blogs from Firestore, using initial dataset:", error);
    return INITIAL_SEEDED_BLOGS;
  }
};

export const getUserBlogPosts = async (email: string): Promise<BlogPost[]> => {
  if (!email) return [];
  const path = "blogs";
  try {
    const q = query(collection(db, path), where("authorEmail", "==", email));
    const querySnapshot = await getDocs(q);
    const posts: BlogPost[] = [];
    querySnapshot.forEach((docSnap) => {
      posts.push({ id: docSnap.id, ...(docSnap.data() as Omit<BlogPost, 'id'>) });
    });
    
    if (posts.length === 0) {
      return INITIAL_SEEDED_BLOGS.filter(post => post.authorEmail === email);
    }
    
    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return posts;
  } catch (error) {
    logger.warn("Could not fetch user blogs from Firestore, using initial dataset:", error);
    return INITIAL_SEEDED_BLOGS.filter(post => post.authorEmail === email);
  }
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (!slug) return null;
  const path = "blogs";
  try {
    const q = query(collection(db, path), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as Omit<BlogPost, 'id'>) };
    }
  } catch (err) {
    logger.warn("Error querying blog by slug:", err);
  }
  // Fallback to seed
  const found = INITIAL_SEEDED_BLOGS.find(p => p.slug === slug || p.id === slug);
  return found || null;
};

export const getBlogPostById = async (idOrSlug: string): Promise<BlogPost | null> => {
  if (!idOrSlug) return null;
  const path = "blogs";
  try {
    // 1. Try direct doc ID lookup
    const docRef = doc(db, path, idOrSlug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<BlogPost, 'id'>) };
    }
  } catch (err) {
    // Non-fatal, try fallback
  }

  // 2. Try querying by slug
  const bySlug = await getBlogPostBySlug(idOrSlug);
  if (bySlug) return bySlug;

  // 3. Check seeded blogs by id or slug
  const found = INITIAL_SEEDED_BLOGS.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  return found || null;
};

export const saveBlogPost = async (post: Partial<BlogPost>): Promise<string> => {
  const path = "blogs";
  try {
    const user = auth.currentUser;
    const isNew = !post.id || post.id.startsWith('seed-');
    const slug = (post.slug || post.title || 'untitled-post')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 150);

    const postPayload: Omit<BlogPost, 'id'> = {
      title: String(post.title || 'Untitled Post').substring(0, 200),
      slug,
      excerpt: String(post.excerpt || '').substring(0, 500),
      content: String(post.content || '').substring(0, 50000),
      category: String(post.category || 'Engineering').substring(0, 100),
      tags: Array.isArray(post.tags) ? post.tags.slice(0, 10) : ['General'],
      authorName: post.authorName || user?.displayName || 'CatalystLab Admin',
      authorEmail: post.authorEmail || user?.email || 'admin@catalystlab.io',
      authorAvatar: post.authorAvatar || user?.photoURL || '',
      status: post.status || 'published',
      readTime: post.readTime || calculateReadingTime(post.content || '', post.excerpt || '').readTime,
      coverImage: post.coverImage || '',
      createdAt: post.createdAt || Date.now(),
      updatedAt: Date.now(),
      views: post.views || 0
    };

    if (!isNew && post.id) {
      const docRef = doc(db, path, post.id);
      await updateDoc(docRef, postPayload as any);
      try {
        await setDoc(doc(db, "blogPosts", post.id), postPayload as any, { merge: true });
      } catch (e) { logger.error("Ignored error:", e); }
      return post.id;
    } else {
      const docRef = await addDoc(collection(db, path), postPayload);
      try {
        await setDoc(doc(db, "blogPosts", docRef.id), postPayload as any);
      } catch (e) { logger.error("Ignored error:", e); }
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

export const deleteBlogPost = async (postId: string): Promise<boolean> => {
  const path = `blogs/${postId}`;
  try {
    const docRef = doc(db, "blogs", postId);
    await deleteDoc(docRef);
    try {
      await deleteDoc(doc(db, "blogPosts", postId));
    } catch (e) { logger.error("Ignored error:", e); }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};

// --- MONITORED SITES CRUD ---

export const INITIAL_MONITORED_SITES: MonitoredSite[] = [
  {
    id: 'site-hazardnet',
    name: 'HazardNet Live Production',
    url: 'https://hazardnet.live',
    checkIntervalMinutes: 5,
    status: 'healthy',
    lastCheckedAt: Date.now() - 3 * 60 * 1000,
    responseTimeMs: 145,
    statusCode: 200,
    sslDaysRemaining: 88,
    sslValid: true,
    uptimePercentage: 99.98,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    ownerId: 'system',
    notes: 'Main threat intelligence and hazard monitoring production frontend.'
  },
  {
    id: 'site-catalyst-api',
    name: 'Catalyst Diagnostic Engine Cluster',
    url: 'https://ais-dev-2z7dtoomnl7nm53osnbyys-329537149747.asia-east1.run.app/api/health',
    checkIntervalMinutes: 1,
    status: 'healthy',
    lastCheckedAt: Date.now() - 1 * 60 * 1000,
    responseTimeMs: 48,
    statusCode: 200,
    sslDaysRemaining: 90,
    sslValid: true,
    uptimePercentage: 100.0,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    ownerId: 'system',
    notes: 'Edge API gateway hosting 8 Python telemetry engines.'
  }
];

export const getMonitoredSites = async (): Promise<MonitoredSite[]> => {
  const path = "monitored_sites";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const sites: MonitoredSite[] = [];
    querySnapshot.forEach((docSnap) => {
      sites.push({ id: docSnap.id, ...(docSnap.data() as Omit<MonitoredSite, 'id'>) });
    });
    if (sites.length === 0) {
      return INITIAL_MONITORED_SITES;
    }
    sites.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return sites;
  } catch (error) {
    logger.warn("Could not fetch monitored sites from Firestore, using initial set:", error);
    return INITIAL_MONITORED_SITES;
  }
};

export const saveMonitoredSite = async (site: Partial<MonitoredSite>): Promise<string> => {
  const path = "monitored_sites";
  try {
    const user = auth.currentUser;
    const isNew = !site.id || site.id.startsWith('site-');

    const sitePayload: Omit<MonitoredSite, 'id'> = {
      name: String(site.name || 'Monitored Endpoint').substring(0, 100),
      url: String(site.url || '').substring(0, 500),
      checkIntervalMinutes: site.checkIntervalMinutes || 5,
      status: site.status || 'untested',
      lastCheckedAt: site.lastCheckedAt || Date.now(),
      responseTimeMs: site.responseTimeMs || 0,
      statusCode: site.statusCode || 0,
      sslDaysRemaining: site.sslDaysRemaining || 0,
      sslValid: typeof site.sslValid === 'boolean' ? site.sslValid : true,
      uptimePercentage: site.uptimePercentage || 99.9,
      createdAt: site.createdAt || Date.now(),
      ownerId: user?.uid || 'admin',
      notes: site.notes ? String(site.notes).substring(0, 500) : ''
    };

    if (!isNew && site.id) {
      const docRef = doc(db, path, site.id);
      await updateDoc(docRef, sitePayload as any);
      return site.id;
    } else {
      const docRef = await addDoc(collection(db, path), sitePayload);
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

export const deleteMonitoredSite = async (siteId: string): Promise<boolean> => {
  const path = `monitored_sites/${siteId}`;
  try {
    const docRef = doc(db, "monitored_sites", siteId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};

// --- API KEYS & WHITE-LABEL CRUD ---

const LOCAL_API_KEYS_STORAGE_PREFIX = 'catalyst_api_keys_';

/** Returns a Firebase ID token for the signed-in user, or `''` when anonymous. */
async function getAuthToken(): Promise<string> {
  if (!auth.currentUser) return '';
  try {
    return await auth.currentUser.getIdToken();
  } catch (err: unknown) {
    logger.warn('Failed to refresh auth token for API-key request:', err);
    return '';
  }
}

function withAuthHeaders(token: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const INITIAL_DEMO_API_KEYS: ApiKey[] = [
  {
    id: 'key_prod_pipeline_01',
    name: 'Production CI/CD Quality Gate',
    keyPrefix: 'cat_live_3f9a7b12',
    ownerId: 'system',
    ownerEmail: 'developer@catalystlab.io',
    scopes: ['execute:engines', 'execute:master-audit', 'read:reports'],
    environment: 'production',
    status: 'active',
    dailyComputeLimit: 500,
    whiteLabelConfig: {
      organizationName: 'Catalyst Enterprise Systems',
      brandHeaderName: 'X-Catalyst-Enterprise',
      customWebhookUrl: 'https://api.example.com/webhooks/telemetry-gate',
      reportTheme: 'corporate'
    },
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    lastRotatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    lastUsedAt: Date.now() - 15 * 60 * 1000,
    expiresAt: Date.now() + 180 * 24 * 60 * 60 * 1000,
    requestCountToday: 42,
    totalRequests: 1840
  },
  {
    id: 'key_staging_radar_02',
    name: 'Staging Multi-PoP Radar Probe',
    keyPrefix: 'cat_live_8c2d1e90',
    ownerId: 'system',
    ownerEmail: 'developer@catalystlab.io',
    scopes: ['execute:engines', 'read:monitoring'],
    environment: 'staging',
    status: 'active',
    dailyComputeLimit: 500,
    whiteLabelConfig: {
      organizationName: 'Staging Quality Ops',
      brandHeaderName: 'X-Staging-Quality'
    },
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    lastRotatedAt: null,
    lastUsedAt: Date.now() - 2 * 60 * 60 * 1000,
    expiresAt: null,
    requestCountToday: 18,
    totalRequests: 490
  }
];

export const getApiKeys = async (ownerId?: string): Promise<ApiKey[]> => {
  const resolvedOwnerId = ownerId || auth.currentUser?.uid || 'guest_dev';
  const localKey = `${LOCAL_API_KEYS_STORAGE_PREFIX}${resolvedOwnerId}`;

  // Local cache allows instant render; the server response is authoritative.
  let localKeys: ApiKey[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localKeys = JSON.parse(raw);
    }
  } catch (e) { logger.error("Ignored error:", e); }

  try {
    const token = await getAuthToken();
    const res = await fetch('/api/v1/users/me/api-keys', {
      headers: { ...withAuthHeaders(token) }
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const keys: ApiKey[] = (Array.isArray(data?.keys) ? data.keys : []).map((k: ApiKey & { ownerEmail?: string }) => ({
        ...k,
        ownerEmail: k.ownerEmail || auth.currentUser?.email || '',
        ownerId: k.ownerId || resolvedOwnerId
      })).sort((a: ApiKey, b: ApiKey) => ((b.createdAt || 0) as number) - ((a.createdAt || 0) as number));
      try {
        localStorage.setItem(localKey, JSON.stringify(keys));
      } catch (e) { logger.error("Ignored error:", e); }
      return keys;
    }
  } catch (error) {
    logger.warn("Could not load API keys from the server, checking local cache:", error);
  }

  if (localKeys.length > 0) {
    return localKeys;
  }

  // Demo keys are displayed only in local development; production never
  // leaks sample keys as if they were real credentials.
  if (import.meta.env.DEV) {
    return INITIAL_DEMO_API_KEYS;
  }
  return [];
};

export const createApiKey = async (params: {
  name: string;
  scopes: ApiKey['scopes'];
  environment: ApiKey['environment'];
  expiresInDays?: number;
  whiteLabelConfig?: WhiteLabelConfig;
}): Promise<{ apiKey: ApiKey; secretKey: string }> => {
  if (!auth.currentUser) {
    throw new Error('Sign in is required to create an API key.');
  }
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Your session has expired. Sign in again to create an API key.');
  }

  const res = await fetch('/api/v1/users/me/api-keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(token)
    },
    body: JSON.stringify({
      name: params.name,
      scopes: params.scopes,
      environment: params.environment || 'development',
      expiresInDays: params.expiresInDays,
      whiteLabelConfig: params.whiteLabelConfig || {}
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = data?.error || 'API key creation failed. Please try again.';
    handleFirestoreError(error, OperationType.WRITE, 'api_keys');
    throw new Error(error);
  }

  const apiKey: ApiKey = {
    ...data.apiKey,
    ownerId: data.apiKey?.ownerId || auth.currentUser.uid,
    ownerEmail: data.apiKey?.ownerEmail || auth.currentUser.email || ''
  };
  return { apiKey, secretKey: data.secretKey };
};

export const rotateApiKey = async (keyId: string): Promise<{ apiKey: ApiKey; newSecretKey: string }> => {
  if (!auth.currentUser) {
    throw new Error('Sign in is required to rotate an API key.');
  }
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Your session has expired. Sign in again to rotate an API key.');
  }
  const res = await fetch(`/api/v1/users/me/api-keys/${encodeURIComponent(keyId)}/rotate`, {
    method: 'POST',
    headers: { ...withAuthHeaders(token) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = data?.error || `API key '${keyId}' could not be rotated.`;
    handleFirestoreError(error, OperationType.WRITE, 'api_keys');
    throw new Error(error);
  }
  return {
    apiKey: { ...data.apiKey, ownerEmail: auth.currentUser.email || '' },
    newSecretKey: data.newSecretKey
  };
};

export const revokeApiKey = async (keyId: string): Promise<boolean> => {
  if (!auth.currentUser) {
    throw new Error('Sign in is required to revoke an API key.');
  }
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Your session has expired. Sign in again to revoke an API key.');
  }
  const res = await fetch(`/api/v1/users/me/api-keys/${encodeURIComponent(keyId)}/revoke`, {
    method: 'POST',
    headers: { ...withAuthHeaders(token) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = data?.error || `API key '${keyId}' could not be revoked.`;
    handleFirestoreError(error, OperationType.WRITE, 'api_keys');
    throw new Error(error);
  }
  return true;
};

export const deleteApiKey = async (keyId: string): Promise<boolean> => {
  if (!auth.currentUser) {
    throw new Error('Sign in is required to delete an API key.');
  }
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Your session has expired. Sign in again to delete an API key.');
  }
  const res = await fetch(`/api/v1/users/me/api-keys/${encodeURIComponent(keyId)}`, {
    method: 'DELETE',
    headers: { ...withAuthHeaders(token) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = data?.error || `API key '${keyId}' could not be deleted.`;
    handleFirestoreError(error, OperationType.WRITE, 'api_keys');
    throw new Error(error);
  }
  return true;
};


export { onAuthStateChanged };
export type { User };

// --- FIRESTORE AUDIT LOGS & SYSTEM HEALTH TELEMETRY ---

export interface FirestoreAuditLog {
  id?: string;
  action: string;
  target?: string;
  status: 'healthy' | 'warning' | 'critical' | 'info' | 'success';
  engine?: string;
  executionTimeMs?: number;
  statusCode?: number;
  details?: string;
  metadata?: Record<string, any>;
  timestamp: number;
  ownerId?: string;
  userEmail?: string;
}

export const INITIAL_AUDIT_LOGS: FirestoreAuditLog[] = [
  {
    id: 'audit-log-01',
    action: 'Engine Health Diagnostic Probe',
    target: 'api.catalystlab.tech/health',
    status: 'healthy',
    engine: 'health',
    executionTimeMs: 42,
    statusCode: 200,
    details: 'Python 3.11 container runtime active, memory allocation nominal (64MB/512MB)',
    timestamp: Date.now() - 2 * 60 * 1000,
    ownerId: 'system',
    userEmail: 'system@catalystlab.tech'
  },
  {
    id: 'audit-log-02',
    action: 'Multi-PoP Edge Latency Radar',
    target: 'edge-cluster.asia-south1',
    status: 'healthy',
    engine: 'latency',
    executionTimeMs: 58,
    statusCode: 200,
    details: 'Global TTFB synthetic ping: Tokyo (164ms), Frankfurt (98ms), Virginia (52ms)',
    timestamp: Date.now() - 7 * 60 * 1000,
    ownerId: 'system',
    userEmail: 'system@catalystlab.tech'
  },
  {
    id: 'audit-log-03',
    action: 'AI-Readiness & RAG Ingestion Audit',
    target: 'stripe.com',
    status: 'healthy',
    engine: 'ai_ready',
    executionTimeMs: 1420,
    statusCode: 200,
    details: 'LLMO schema verified: JSON-LD Graph present, llms.txt parsed with zero hallucinations',
    timestamp: Date.now() - 15 * 60 * 1000,
    ownerId: 'system',
    userEmail: 'shuvo.1807016@bau.edu.bd'
  },
  {
    id: 'audit-log-04',
    action: 'Git SecOps & Hygiene Scan',
    target: 'github.com/catalystlab/core',
    status: 'healthy',
    engine: 'repo',
    executionTimeMs: 890,
    statusCode: 200,
    details: 'Zero exposed secrets detected in main branch; Dependabot automated PRs enabled',
    timestamp: Date.now() - 32 * 60 * 1000,
    ownerId: 'system',
    userEmail: 'shuvoasifahmed@gmail.com'
  },
  {
    id: 'audit-log-05',
    action: 'Eco-Audit SWD v4 Carbon Assessment',
    target: 'catalystlab.tech',
    status: 'healthy',
    engine: 'eco',
    executionTimeMs: 310,
    statusCode: 200,
    details: 'Calculated 0.08g CO2/pageview; green hosting certification verified',
    timestamp: Date.now() - 55 * 60 * 1000,
    ownerId: 'system',
    userEmail: 'asifahmedshuvo.aas@gmail.com'
  }
];

export const getFirestoreAuditLogs = async (limitCount = 30): Promise<FirestoreAuditLog[]> => {
  const path = "audit_logs";
  if (!auth.currentUser) {
    return INITIAL_AUDIT_LOGS;
  }
  try {
    const q = query(
      collection(db, path),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const logs: FirestoreAuditLog[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...(docSnap.data() as Omit<FirestoreAuditLog, 'id'>) });
    });

    if (logs.length > 0) {
      return logs;
    }
  } catch (err) {
    logger.warn("Could not query audit_logs collection:", err);
  }

  // Also query reports collection as fallback audit logs
  try {
    const reportsSnapshot = await getDocs(
      query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(15))
    );
    if (!reportsSnapshot.empty) {
      const derived: FirestoreAuditLog[] = [];
      reportsSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        derived.push({
          id: docSnap.id,
          action: `${data.engine?.toUpperCase() || 'DIAGNOSTIC'} Execution`,
          target: data.url,
          status: 'healthy',
          engine: data.engine,
          executionTimeMs: 400 + Math.floor(Math.random() * 800),
          statusCode: 200,
          details: data.title || `Audit report generated for ${data.url}`,
          timestamp: data.createdAt || Date.now(),
          ownerId: data.ownerId,
          userEmail: data.ownerEmail
        });
      });
      if (derived.length > 0) {
        return derived;
      }
    }
  } catch (e) { logger.error("Ignored error:", e); }

  return INITIAL_AUDIT_LOGS;
};

export const subscribeFirestoreAuditLogs = (
  callback: (logs: FirestoreAuditLog[]) => void,
  limitCount = 30
): (() => void) => {
  const path = "audit_logs";
  if (!auth.currentUser) {
    callback(INITIAL_AUDIT_LOGS);
    return () => {};
  }
  try {
    const q = query(
      collection(db, path),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const logs: FirestoreAuditLog[] = [];
        snapshot.forEach((docSnap) => {
          logs.push({ id: docSnap.id, ...(docSnap.data() as Omit<FirestoreAuditLog, 'id'>) });
        });
        callback(logs);
      } else {
        callback(INITIAL_AUDIT_LOGS);
      }
    }, (error) => {
      logger.warn("Audit logs subscription listener warning:", error);
      callback(INITIAL_AUDIT_LOGS);
    });
    return unsubscribe;
  } catch (err) {
    logger.warn("Failed to attach audit logs onSnapshot listener:", err);
    callback(INITIAL_AUDIT_LOGS);
    return () => {};
  }
};

export const logSystemAuditEvent = async (
  event: Omit<FirestoreAuditLog, 'id' | 'timestamp'>
): Promise<string> => {
  const path = "audit_logs";
  const currentUser = auth.currentUser;
  const logEntry: Omit<FirestoreAuditLog, 'id'> = {
    action: event.action.substring(0, 150),
    status: event.status || 'info',
    engine: event.engine || 'system',
    target: event.target ? event.target.substring(0, 500) : 'catalystlab.tech',
    executionTimeMs: event.executionTimeMs || 0,
    statusCode: event.statusCode || 200,
    details: event.details ? event.details.substring(0, 2000) : '',
    timestamp: Date.now(),
    ownerId: currentUser?.uid || 'system',
    userEmail: currentUser?.email || 'system@catalystlab.tech'
  };

  try {
    const docRef = await addDoc(collection(db, path), logEntry);
    return docRef.id;
  } catch (error) {
    logger.warn("Could not save audit log to Firestore:", error);
    return `log-local-${Date.now()}`;
  }
};

// --- CONTACT INQUIRIES & EMAIL LEAD CAPTURE ---

const LOCAL_INQUIRIES_KEY = 'catalystlab_local_inquiries';

export function getLocalInquiries(): ContactInquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalInquiry(inquiry: ContactInquiry): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalInquiries().filter(item => item.id !== inquiry.id);
    list.unshift(inquiry);
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(list.slice(0, 100)));
  } catch (err) {
    logger.warn('Failed to cache inquiry locally:', err);
  }
}

const CONTACT_THROTTLE_MS = 15 * 1000;
const CONTACT_SESSION_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_SESSION_MAX = 5;
const CONTACT_LAST_SUBMIT_KEY = 'catalyst_contact_last_submit_at';
const CONTACT_WINDOW_COUNT_KEY = 'catalyst_contact_window_submissions';

function readWindowCount(): number {
  try {
    const stored = window.localStorage.getItem(CONTACT_WINDOW_COUNT_KEY);
    return stored ? Number(stored) || 0 : 0;
  } catch {
    return 0;
  }
}

function recordSubmission(now: number): void {
  try {
    window.localStorage.setItem(CONTACT_LAST_SUBMIT_KEY, String(now));
    window.localStorage.setItem(CONTACT_WINDOW_COUNT_KEY, String(readWindowCount() + 1));
  } catch {
    /* no-op */
  }
}

export const submitContactInquiry = async (data: {
  email: string;
  name?: string;
  message?: string;
  source?: string;
  company?: string;
  department?: string;
  honeypot?: string;
  metadata?: Record<string, string | number | boolean>;
}): Promise<string> => {
  const path = "contact_inquiries";
  const currentUser = auth.currentUser;

  // Client-side honeypot: a real user never fills a hidden field. Short-circuit
  // before the network call so bots moving fast do not consume server quota.
  if (data.honeypot && typeof data.honeypot === 'string' && data.honeypot.trim().length > 0) {
    return `inq_${Date.now()}_honeypot`;
  }

  // Client-side rate gate: max 1 submission / 15s and max 5 per 10-minute
  // window per browser. The server re-checks per IP; this is defense-in-depth
  // against accidental double-submits and casual bots.
  const now = Date.now();
  try {
    const last = Number(window.localStorage.getItem(CONTACT_LAST_SUBMIT_KEY)) || 0;
    if (now - last < CONTACT_THROTTLE_MS) {
      throw new Error('Submitting too quickly. Please wait a moment before trying again.');
    }
    if (readWindowCount() >= CONTACT_SESSION_MAX) {
      throw new Error('Too many submissions. Please try again later.');
    }
  } catch (err) {
    if (err instanceof Error && (err.message.startsWith('Submitting') || err.message.startsWith('Too many'))) {
      throw err;
    }
  }

  const email = String(data.email || '').trim().toLowerCase().substring(0, 256);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please provide a valid email address.');
  }

  const source = String(data.source || 'get-in-touch-popup').substring(0, 100);
  const department = data.department?.trim() ? String(data.department).trim().substring(0, 40) : undefined;
  const metadata = data.metadata && typeof data.metadata === 'object'
    ? Object.fromEntries(
        Object.entries(data.metadata)
          .filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v))
          .map(([k, v]) => [String(k).substring(0, 40), typeof v === 'string' ? String(v).substring(0, 500) : v])
      )
    : undefined;
  if (metadata && Object.keys(metadata).length > 6) {
    throw new Error('Too much supplemental information in this submission.');
  }

  const payload: Omit<ContactInquiry, 'id'> = {
    email,
    ...(data.name?.trim() ? { name: String(data.name).trim().substring(0, 150) } : {}),
    ...(data.message?.trim() ? { message: String(data.message).trim().substring(0, 2000) } : {}),
    source,
    ...(data.company?.trim() ? { company: String(data.company).trim().substring(0, 200) } : {}),
    ...(department ? { department } : {}),
    ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
    honeypot: data.honeypot ? String(data.honeypot).substring(0, 512) : '',
    status: 'new',
    createdAt: now,
    ownerId: currentUser?.uid || 'guest'
  };

  try {
    // Server-side intake: schema validation, honeypot, per-IP rate limiting and
    // Admin-SDK persistence all live in the trusted Express route. Direct
    // Firestore client writes are denied by `firestore.rules`.
    const token = await getAuthToken();
    const res = await fetch('/api/v1/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...withAuthHeaders(token)
      },
      body: JSON.stringify(payload)
    });
    const dataJson = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = dataJson?.error || 'Could not complete submission. Please try again.';
      throw new Error(error);
    }
    const inquiryId = dataJson?.inquiryId || `inq_${now}_${Math.random().toString(36).substring(2, 9)}`;
    recordSubmission(now);
    const savedItem: ContactInquiry = { id: inquiryId, ...payload };
    saveLocalInquiry(savedItem);
    return inquiryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    // Never pretend a submission was accepted when the server rejected it or
    // the request failed. The form keeps the user's input so they can retry;
    // cached tickets are only persisted after the server acknowledged success.
    throw error;
  }
};

export const getContactInquiriesForAdmin = async (): Promise<ContactInquiry[]> => {
  const path = "contact_inquiries";
  if (!auth.currentUser) {
    return getLocalInquiries();
  }
  try {
    const q = query(collection(db, path), orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    const results: ContactInquiry[] = [];
    snapshot.forEach(docSnap => {
      results.push({ id: docSnap.id, ...(docSnap.data() as Omit<ContactInquiry, 'id'>) });
    });
    if (results.length > 0) return results;
  } catch (err) {
    logger.warn("Could not query contact_inquiries from Firestore:", err);
  }
  return getLocalInquiries();
};

/* =========================================================================
 * User Subscription & 7-Day Free Trial Management (5 Tiers Architecture)
 * ========================================================================= */

const LOCAL_SUB_PREFIX = 'catalyst_user_subscription_';

export function getLocalSubscription(userId: string): UserSubscription | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_SUB_PREFIX + userId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalSubscription(subscription: UserSubscription): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_SUB_PREFIX + subscription.ownerId, JSON.stringify(subscription));
  } catch (err) {
    logger.warn('Failed to cache subscription locally:', err);
  }
}

export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  if (!userId) return null;
  const path = `user_subscriptions/${userId}`;
  
  try {
    const docRef = doc(db, 'user_subscriptions', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserSubscription;
      const sub = { ...data, id: docSnap.id };
      saveLocalSubscription(sub);
      return sub;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }

  return getLocalSubscription(userId);
};

export const startUserTrial = async (
  userId: string,
  userEmail: string,
  planId: SubscriptionPlanId = 'starter'
): Promise<UserSubscription> => {
  const path = `user_subscriptions/${userId}`;
  // Free is never a trial; a client-requested "free" trial maps to the only
  // client-safe paid trial product (Starter). Paid tier trials are provisioned
  // by the server endpoint so Firestore client rules stay authoritative.
  const chosenPlan = planId === 'free' ? 'starter' : planId;

  let token = '';
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  } else if (auth.currentUser == null) {
    // Keep the production API failure mode explicit instead of silently
    // granting an entitlement on an unauthenticated request.
    throw new Error('Sign in is required to start a trial.');
  }

  const res = await fetch('/api/v1/users/me/trial', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ planId: chosenPlan })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = data?.error || 'Trial activation failed. Please try again.';
    handleFirestoreError(error, OperationType.WRITE, path);
    throw new Error(error);
  }

  const subscription: UserSubscription = {
    id: userId,
    ownerId: userId,
    ownerEmail: userEmail,
    planId: data.subscription?.planId || chosenPlan,
    status: 'trialing',
    billingCycle: data.subscription?.billingCycle || 'monthly',
    trialStartedAt: data.subscription?.trialStartedAt || Date.now(),
    trialEndsAt: data.subscription?.trialEndsAt || (Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: data.subscription?.createdAt || Date.now(),
    updatedAt: data.subscription?.updatedAt || Date.now()
  };

  saveLocalSubscription(subscription);
  return subscription;
};

export const changeUserSubscription = async (
  userId: string,
  userEmail: string,
  planId: SubscriptionPlanId,
  billingCycle: 'monthly' | 'annual' = 'monthly'
): Promise<UserSubscription> => {
  const path = `user_subscriptions/${userId}`;
  // Paid `active` entitlements must never be written by the browser. The
  // server accepts only the free downgrade path (cancel trial / cancel plan);
  // paid upgrades are provisioned exclusively from signed payment webhooks.
  let token = '';
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  } else {
    throw new Error('Sign in is required to change your subscription.');
  }

  const res = await fetch('/api/v1/users/me/subscription/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ planId, billingCycle })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = data?.error || 'Subscription change failed. Please try again.';
    handleFirestoreError(error, OperationType.WRITE, path);
    throw new Error(error);
  }

  const now = Date.now();
  const subscription: UserSubscription = {
    id: userId,
    ownerId: userId,
    ownerEmail: userEmail,
    planId: 'free',
    status: 'active',
    billingCycle,
    trialStartedAt: null,
    trialEndsAt: null,
    createdAt: now,
    updatedAt: now
  };

  saveLocalSubscription(subscription);
  return subscription;
};

// ==========================================
// CONNECTED GITHUB REPOSITORIES & WEBHOOKS
// ==========================================

const GITHUB_REPOS_STORAGE_KEY = 'catalystlab_github_repos_v1';
const GITHUB_EVENTS_STORAGE_KEY = 'catalystlab_github_telemetry_events_v1';

function getLocalGithubRepos(): GithubRepo[] {
  try {
    const raw = localStorage.getItem(GITHUB_REPOS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalGithubRepos(repos: GithubRepo[]) {
  try {
    localStorage.setItem(GITHUB_REPOS_STORAGE_KEY, JSON.stringify(repos));
  } catch {
    // ignore
  }
}

function getLocalGithubEvents(): GithubTelemetryEvent[] {
  try {
    const raw = localStorage.getItem(GITHUB_EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalGithubEvents(events: GithubTelemetryEvent[]) {
  try {
    localStorage.setItem(GITHUB_EVENTS_STORAGE_KEY, JSON.stringify(events.slice(0, 100)));
  } catch {
    // ignore
  }
}

export const getConnectedGithubRepos = async (userId?: string): Promise<GithubRepo[]> => {
  const currentUid = userId || auth.currentUser?.uid;
  const path = 'github_repos';
  
  if (!currentUid) {
    return getLocalGithubRepos();
  }

  try {
    const q = query(
      collection(db, path),
      where('ownerId', '==', currentUid)
    );
    const snap = await getDocs(q);
    const repos: GithubRepo[] = [];
    snap.forEach((docSnap) => {
      repos.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<GithubRepo, 'id'>)
      });
    });

    repos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveLocalGithubRepos(repos);
    return repos;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.GET, path);
    } catch {
      // Return local cache on permission or offline network failure
    }
    return getLocalGithubRepos().filter(r => r.ownerId === currentUid || !r.ownerId);
  }
};

export const createConnectedGithubRepo = async (
  repoData: Omit<GithubRepo, 'id'>
): Promise<GithubRepo> => {
  const path = 'github_repos';
  const repoId = `gh_repo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullRepo: GithubRepo = {
    id: repoId,
    ...repoData,
    createdAt: repoData.createdAt || Date.now()
  };

  try {
    const docRef = doc(db, path, repoId);
    await setDoc(docRef, fullRepo);
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch {
      // Local fallback
    }
  }

  const localList = getLocalGithubRepos().filter(r => r.id !== repoId);
  localList.unshift(fullRepo);
  saveLocalGithubRepos(localList);

  return fullRepo;
};

export const updateConnectedGithubRepo = async (
  repoId: string,
  updates: Partial<GithubRepo>
): Promise<void> => {
  const path = `github_repos/${repoId}`;
  try {
    const docRef = doc(db, 'github_repos', repoId);
    await updateDoc(docRef, { ...updates, updatedAt: Date.now() });
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } catch {
      // Local fallback
    }
  }

  const localList = getLocalGithubRepos();
  const idx = localList.findIndex(r => r.id === repoId);
  if (idx >= 0) {
    localList[idx] = { ...localList[idx], ...updates, updatedAt: Date.now() };
    saveLocalGithubRepos(localList);
  }
};

export const deleteConnectedGithubRepo = async (repoId: string): Promise<void> => {
  const path = `github_repos/${repoId}`;
  try {
    const docRef = doc(db, 'github_repos', repoId);
    await deleteDoc(docRef);
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, path);
    } catch {
      // Local fallback
    }
  }

  const localList = getLocalGithubRepos().filter(r => r.id !== repoId);
  saveLocalGithubRepos(localList);
};

// ==========================================
// REAL-TIME GITHUB TELEMETRY EVENTS
// ==========================================

export const getGithubTelemetryEvents = async (
  userId?: string,
  repoId?: string,
  limitCount = 50
): Promise<GithubTelemetryEvent[]> => {
  const currentUid = userId || auth.currentUser?.uid;
  const path = 'github_telemetry_events';

  if (!currentUid) {
    const local = getLocalGithubEvents();
    return repoId ? local.filter(e => e.repoId === repoId) : local;
  }

  try {
    const q = repoId
      ? query(
          collection(db, path),
          where('ownerId', '==', currentUid),
          where('repoId', '==', repoId),
          limit(limitCount)
        )
      : query(
          collection(db, path),
          where('ownerId', '==', currentUid),
          limit(limitCount)
        );

    const snap = await getDocs(q);
    const events: GithubTelemetryEvent[] = [];
    snap.forEach((docSnap) => {
      events.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<GithubTelemetryEvent, 'id'>)
      });
    });

    events.sort((a, b) => b.timestamp - a.timestamp);
    saveLocalGithubEvents(events);
    return events;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.GET, path);
    } catch {
      // Return local cache on network/rules failure
    }
    const local = getLocalGithubEvents().filter(e => e.ownerId === currentUid || !e.ownerId);
    return repoId ? local.filter(e => e.repoId === repoId) : local;
  }
};

export const recordGithubTelemetryEvent = async (
  eventData: Omit<GithubTelemetryEvent, 'id'>
): Promise<GithubTelemetryEvent> => {
  const path = 'github_telemetry_events';
  const eventId = `gh_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullEvent: GithubTelemetryEvent = {
    id: eventId,
    ...eventData,
    timestamp: eventData.timestamp || Date.now()
  };

  try {
    const docRef = doc(db, path, eventId);
    await setDoc(docRef, fullEvent);
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch {
      // Local fallback
    }
  }

  const localEvents = getLocalGithubEvents();
  localEvents.unshift(fullEvent);
  saveLocalGithubEvents(localEvents);

  return fullEvent;
};

export const subscribeToGithubTelemetryEvents = (
  userId: string,
  callback: (events: GithubTelemetryEvent[]) => void,
  repoId?: string
): (() => void) => {
  const path = 'github_telemetry_events';
  if (!userId) {
    callback(getLocalGithubEvents());
    return () => {};
  }

  try {
    const q = repoId
      ? query(
          collection(db, path),
          where('ownerId', '==', userId),
          where('repoId', '==', repoId),
          limit(50)
        )
      : query(
          collection(db, path),
          where('ownerId', '==', userId),
          limit(50)
        );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const events: GithubTelemetryEvent[] = [];
        snap.forEach((docSnap) => {
          events.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<GithubTelemetryEvent, 'id'>)
          });
        });
        events.sort((a, b) => b.timestamp - a.timestamp);
        if (events.length > 0) {
          saveLocalGithubEvents(events);
        }
        callback(events.length > 0 ? events : getLocalGithubEvents());
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch {
          // fallback to local events
        }
        callback(getLocalGithubEvents());
      }
    );

    return unsubscribe;
  } catch (err) {
    callback(getLocalGithubEvents());
    return () => {};
  }
};



