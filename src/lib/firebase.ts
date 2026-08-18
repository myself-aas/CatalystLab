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
    }[];;
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

export interface SaveReportParams {
  url: string;
  engine: string;
  output: string;
  title?: string;
  summary?: string;
  score?: number;
  userId?: string;
  visitorId?: string;
  auditSessionId?: string;
}

export const saveReport = async (params: SaveReportParams): Promise<string> => {
  const path = `reports/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  try {
    const docRef = doc(db, "reports", path);
    await setDoc(docRef, {
      ...params,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    });
    return path;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const getReport = async (id: string): Promise<AuditReport | null> => {
  try {
    const docRef = doc(db, "reports", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AuditReport;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, id);
    throw error;
  }
};

export const updateReport = async (id: string, data: Partial<AuditReport>): Promise<void> => {
  const path = `reports/${id}`;
  try {
    const docRef = doc(db, "reports", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

export const deleteReport = async (id: string): Promise<boolean> => {
  const path = `reports/${id}`;
  try {
    const docRef = doc(db, "reports", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};

export const getReports = async (limit = 50): Promise<AuditReport[]> => {
  try {
    const q = query(collection(db, "reports"), orderBy("timestamp", "desc"), limit(limit));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AuditReport);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, null);
    throw error;
  }
};

// --- MONITORED SITES CRUD ---

export interface SaveMonitoredSiteParams {
  url: string;
  frequency: string; // hourly, daily, weekly
  alertThreshold: number;
  userId: string;
  active?: boolean;
}

export const saveMonitoredSite = async (params: SaveMonitoredSiteParams): Promise<string> => {
  const path = `monitored_sites/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  try {
    const docRef = doc(db, "monitored_sites", path);
    await setDoc(docRef, {
      ...params,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    });
    return path;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const getMonitoredSite = async (id: string): Promise<MonitoredSite | null> => {
  try {
    const docRef = doc(db, "monitored_sites", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as MonitoredSite;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, id);
    throw error;
  }
};

export const updateMonitoredSite = async (id: string, data: Partial<MonitoredSite>): Promise<void> => {
  const path = `monitored_sites/${id}`;
  try {
    const docRef = doc(db, "monitored_sites", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
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

export const getMonitoredSites = async (userId: string): Promise<MonitoredSite[]> => {
  try {
    const q = query(collection(db, "monitored_sites"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as MonitoredSite);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, null);
    throw error;
  }
};

// --- BLOG POSTS CRUD ---

export interface SaveBlogPostParams {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  tags: string[];
  published: boolean;
  slug: string;
};

export const saveBlogPost = async (params: SaveBlogPostParams): Promise<string> => {
  const path = `blog_posts/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  try {
    const docRef = doc(db, "blog_posts", path);
    await setDoc(docRef, {
      ...params,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    });
    return path;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const getBlogPost = async (id: string): Promise<BlogPost | null> => {
  try {
    const docRef = doc(db, "blog_posts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as BlogPost;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, id);
    throw error;
  }
};

export const updateBlogPost = async (id: string, data: Partial<BlogPost>): Promise<void> => {
  const path = `blog_posts/${id}`;
  try {
    const docRef = doc(db, "blog_posts", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

export const deleteBlogPost = async (id: string): Promise<boolean> => {
  const path = `blog_posts/${id}`;
  try {
    const docRef = doc(db, "blog_posts", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};

export const getBlogPosts = async (limit = 10, publishedOnly = true): Promise<BlogPost[]> => {
  try {
    let q = query(collection(db, "blog_posts"), orderBy("timestamp", "desc"), limit(limit));
    if (publishedOnly) {
      q = query(q, where("published", "==", true));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as BlogPost);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, null);
    throw error;
  }
};

export { onAuthStateChanged };
export type { User };