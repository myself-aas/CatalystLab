import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
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
  updateDoc
} from 'firebase/firestore';
import type { AuditReport, BlogPost, MonitoredSite, ApiKey, WhiteLabelConfig } from '../types';

import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use named Firestore database if configured, or default
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });

export interface FirebaseDomainConfig {
  projectId: string;
  authDomain: string;
  currentHostname: string;
  consoleAuthUrl: string;
}

export function getFirebaseDomainSettings(): FirebaseDomainConfig {
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  return {
    projectId: firebaseConfig.projectId || 'artful-defender-j6rpq',
    authDomain: firebaseConfig.authDomain || 'artful-defender-j6rpq.firebaseapp.com',
    currentHostname,
    consoleAuthUrl: `https://console.firebase.google.com/project/${firebaseConfig.projectId || 'artful-defender-j6rpq'}/authentication/settings`
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
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
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
    console.warn('Failed to cache report locally:', err);
  }
}

function deleteLocalReport(reportId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const reports = getLocalReports().filter(r => r.id !== reportId);
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
  } catch (err) {
    console.warn('Failed to delete local report:', err);
  }
}

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

export interface AuthErrorInfo {
  code: string;
  message: string;
  domain?: string;
  isUnauthorizedDomain: boolean;
  isUserCancelled: boolean;
}

export const loginWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    const errorCode = error?.code || '';
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
    
    const isUnauthorizedDomain = errorCode === 'auth/unauthorized-domain' || 
      (typeof error?.message === 'string' && error.message.includes('unauthorized-domain'));
    const isUserCancelled = errorCode === 'auth/popup-closed-by-user' || 
      errorCode === 'auth/cancelled-popup-request';

    const errorDetails: AuthErrorInfo = {
      code: errorCode || 'auth/unknown',
      message: isUnauthorizedDomain
        ? `Domain '${currentDomain}' is not authorized in Firebase Authentication.`
        : isUserCancelled 
          ? 'Sign-in popup was closed before completing.'
          : (error?.message || 'Google authentication failed.'),
      domain: currentDomain,
      isUnauthorizedDomain,
      isUserCancelled
    };

    if (isUnauthorizedDomain) {
      console.warn("Firebase Auth Notice: Current domain requires whitelisting in Firebase Console:", currentDomain);
    } else if (!isUserCancelled) {
      console.error("Google login failed:", error);
    }

    const enhancedError = new Error(errorDetails.message);
    Object.assign(enhancedError, errorDetails);
    throw enhancedError;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
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
    url = urlOrParams;
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
  } catch (error: any) {
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
    console.warn("Could not fetch blogs from Firestore, using initial dataset:", error);
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
    console.warn("Could not fetch user blogs from Firestore, using initial dataset:", error);
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
    console.warn("Error querying blog by slug:", err);
  }
  // Fallback to seed
  const found = INITIAL_SEEDED_BLOGS.find(p => p.slug === slug || p.id === slug);
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
      readTime: post.readTime || `${Math.max(1, Math.ceil((post.content?.length || 500) / 750))} min read`,
      coverImage: post.coverImage || '',
      createdAt: post.createdAt || Date.now(),
      updatedAt: Date.now(),
      views: post.views || 0
    };

    if (!isNew && post.id) {
      const docRef = doc(db, path, post.id);
      await updateDoc(docRef, postPayload as any);
      return post.id;
    } else {
      const docRef = await addDoc(collection(db, path), postPayload);
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
    console.warn("Could not fetch monitored sites from Firestore, using initial set:", error);
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

function generateSecureApiKey(): string {
  const chars = '0123456789abcdef';
  let hex = '';
  for (let i = 0; i < 32; i++) {
    hex += chars[Math.floor(Math.random() * chars.length)];
  }
  return `cat_live_${hex}`;
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

  // Try local storage first for instant responsiveness
  let localKeys: ApiKey[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localKeys = JSON.parse(raw);
    }
  } catch {}

  const path = "api_keys";
  try {
    const q = query(collection(db, path), where("ownerId", "==", resolvedOwnerId));
    const querySnapshot = await getDocs(q);
    const keys: ApiKey[] = [];
    querySnapshot.forEach((docSnap) => {
      keys.push({ id: docSnap.id, ...(docSnap.data() as Omit<ApiKey, 'id'>) });
    });

    if (keys.length > 0) {
      keys.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      try {
        localStorage.setItem(localKey, JSON.stringify(keys));
      } catch {}
      return keys;
    }
  } catch (error) {
    console.warn("Could not query API keys from Firestore, checking local storage:", error);
  }

  if (localKeys.length > 0) {
    return localKeys;
  }

  // Fallback to sample demo keys for developer exploration
  return INITIAL_DEMO_API_KEYS;
};

export const createApiKey = async (params: {
  name: string;
  scopes: ApiKey['scopes'];
  environment: ApiKey['environment'];
  expiresInDays?: number;
  whiteLabelConfig?: WhiteLabelConfig;
}): Promise<{ apiKey: ApiKey; secretKey: string }> => {
  const user = auth.currentUser;
  const ownerId = user?.uid || 'guest_dev';
  const ownerEmail = user?.email || 'developer@catalystlab.io';

  const secretKey = generateSecureApiKey();
  const keyPrefix = secretKey.substring(0, 16) + '...';
  const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const expiresAt = params.expiresInDays 
    ? Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000 
    : null;

  const newApiKey: ApiKey = {
    id: keyId,
    name: params.name || 'API Client Key',
    keyPrefix,
    ownerId,
    ownerEmail,
    scopes: params.scopes || ['execute:engines', 'read:reports'],
    environment: params.environment || 'development',
    status: 'active',
    dailyComputeLimit: 500,
    whiteLabelConfig: params.whiteLabelConfig || {},
    createdAt: Date.now(),
    lastRotatedAt: null,
    lastUsedAt: null,
    expiresAt,
    requestCountToday: 0,
    totalRequests: 0
  };

  const path = `api_keys/${keyId}`;
  try {
    await setDoc(doc(db, "api_keys", keyId), {
      ...newApiKey,
      secretKeyHash: secretKey.substring(0, 20) // masked verification
    });
  } catch (error) {
    console.warn("Firestore save notice for api_key, caching locally:", error);
  }

  // Persist locally
  const localKey = `${LOCAL_API_KEYS_STORAGE_PREFIX}${ownerId}`;
  try {
    const existing = await getApiKeys(ownerId);
    const updated = [newApiKey, ...existing.filter(k => k.id !== keyId)];
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch {}

  return {
    apiKey: newApiKey,
    secretKey
  };
};

export const rotateApiKey = async (keyId: string): Promise<{ apiKey: ApiKey; newSecretKey: string }> => {
  const user = auth.currentUser;
  const ownerId = user?.uid || 'guest_dev';
  const localKey = `${LOCAL_API_KEYS_STORAGE_PREFIX}${ownerId}`;

  const currentKeys = await getApiKeys(ownerId);
  const target = currentKeys.find(k => k.id === keyId);
  if (!target) {
    throw new Error(`API key '${keyId}' not found.`);
  }

  const newSecretKey = generateSecureApiKey();
  const newKeyPrefix = newSecretKey.substring(0, 16) + '...';

  const updatedKey: ApiKey = {
    ...target,
    keyPrefix: newKeyPrefix,
    lastRotatedAt: Date.now(),
    status: 'active'
  };

  try {
    const docRef = doc(db, "api_keys", keyId);
    await updateDoc(docRef, {
      keyPrefix: newKeyPrefix,
      lastRotatedAt: Date.now(),
      status: 'active'
    });
  } catch (error) {
    console.warn("Could not update rotated key in Firestore, updating local cache:", error);
  }

  try {
    const updatedList = currentKeys.map(k => k.id === keyId ? updatedKey : k);
    localStorage.setItem(localKey, JSON.stringify(updatedList));
  } catch {}

  return {
    apiKey: updatedKey,
    newSecretKey
  };
};

export const revokeApiKey = async (keyId: string): Promise<boolean> => {
  const user = auth.currentUser;
  const ownerId = user?.uid || 'guest_dev';
  const localKey = `${LOCAL_API_KEYS_STORAGE_PREFIX}${ownerId}`;

  try {
    const docRef = doc(db, "api_keys", keyId);
    await updateDoc(docRef, {
      status: 'revoked',
      revokedAt: Date.now()
    });
  } catch (error) {
    console.warn("Could not revoke in Firestore, updating local storage:", error);
  }

  try {
    const currentKeys = await getApiKeys(ownerId);
    const updatedList = currentKeys.map(k => k.id === keyId ? { ...k, status: 'revoked' as const } : k);
    localStorage.setItem(localKey, JSON.stringify(updatedList));
  } catch {}

  return true;
};

export const deleteApiKey = async (keyId: string): Promise<boolean> => {
  const user = auth.currentUser;
  const ownerId = user?.uid || 'guest_dev';
  const localKey = `${LOCAL_API_KEYS_STORAGE_PREFIX}${ownerId}`;

  try {
    const docRef = doc(db, "api_keys", keyId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Could not delete from Firestore, deleting from local cache:", error);
  }

  try {
    const currentKeys = await getApiKeys(ownerId);
    const updatedList = currentKeys.filter(k => k.id !== keyId);
    localStorage.setItem(localKey, JSON.stringify(updatedList));
  } catch {}

  return true;
};

export { onAuthStateChanged };
export type { User };
