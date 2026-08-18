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
  collection, 
  addDoc, 
  setDoc,
  getDoc, 
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  updateDoc
} from 'firebase/firestore';
import type { AuditReport, BlogPost, MonitoredSite } from '../types';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "catalystlabhub",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:538496738631:web:750ab5420844d31a749862",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCEKst9X69ewBp3pLzL-ILHRo1kezYZkIU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "catalystlabhub.firebaseapp.com",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "ai-studio-catalystlab-6318f0cc-9ec3-41ff-a38f-2d22b7086f08",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "catalystlabhub.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "538496738631",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SBWC2NFQ0X"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google login failed:", error);
    throw error;
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

export const saveReport = async (
  url: string, 
  engine: string, 
  output: string, 
  extra: { title?: string; score?: number } = {}
): Promise<string> => {
  if (!auth.currentUser) throw new Error("Must be logged in to save reports");
  
  const path = "reports";
  try {
    const reportData: Omit<AuditReport, 'id'> = {
      url: String(url || '').substring(0, 500),
      engine: String(engine || 'master-audit').substring(0, 100),
      output: String(output || '').substring(0, 500000),
      ownerId: auth.currentUser.uid,
      ownerEmail: auth.currentUser.email || '',
      createdAt: Date.now(),
      ...(extra.title ? { title: String(extra.title).substring(0, 200) } : {}),
      ...(typeof extra.score === 'number' ? { score: extra.score } : {})
    };

    const docRef = await addDoc(collection(db, path), reportData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const getReport = async (reportId: string): Promise<AuditReport | null> => {
  if (!reportId) return null;
  const path = `reports/${reportId}`;
  try {
    const docRef = doc(db, "reports", reportId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<AuditReport, 'id'>) };
    }
    return null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, path);
    }
    return null;
  }
};

export const deleteReport = async (reportId: string): Promise<boolean> => {
  if (!auth.currentUser) throw new Error("Authentication required");
  if (!reportId) throw new Error("Report ID is required");
  const path = `reports/${reportId}`;
  try {
    const docRef = doc(db, "reports", reportId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};

export const getUserReports = async (): Promise<AuditReport[]> => {
  if (!auth.currentUser) return [];
  const path = "reports";
  try {
    const q = query(
      collection(db, path), 
      where("ownerId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const reports: AuditReport[] = [];
    querySnapshot.forEach((docSnap) => {
      reports.push({ id: docSnap.id, ...(docSnap.data() as Omit<AuditReport, 'id'>) });
    });
    reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return reports;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    throw error;
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
    // If not allowed, fallback to user reports
    try {
      return await getUserReports();
    } catch {
      return [];
    }
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

export { onAuthStateChanged };
export type { User };
