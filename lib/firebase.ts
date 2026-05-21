/**
 * Firebase v10+ Modular SDK Initialization
 * Implements tree-shakable imports, strict validation, multi-tab persistence,
 * and comprehensive error handling for production stability.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  type Auth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  onSnapshot,
  type Query
} from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

/**
 * FIREBASE CONFIGURATION VALIDATION
 * Throws explicit errors during initialization if env vars are missing
 */
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

type EnvVarKey = (typeof requiredEnvVars)[number];

function validateFirebaseConfig(): Record<EnvVarKey, string> {
  const config: Record<string, string | undefined> = {};
  const missingVars: string[] = [];

  requiredEnvVars.forEach((varKey) => {
    const value = process.env[varKey];
    if (!value || value.trim() === '') {
      missingVars.push(varKey);
    }
    config[varKey] = value;
  });

  if (missingVars.length > 0) {
    const errorMsg = [
      'CRITICAL: Firebase initialization failed.',
      'Missing required environment variables:',
      missingVars.map(v => `  - ${v}`).join('\n'),
      '',
      'Solution: Verify all NEXT_PUBLIC_FIREBASE_* variables are set in .env.local',
      'Documentation: https://firebase.google.com/docs/web/setup',
    ].join('\n');

    throw new Error(errorMsg);
  }

  return config as Record<EnvVarKey, string>;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate on client-side only
if (typeof window !== 'undefined') {
  try {
    validateFirebaseConfig();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * FIREBASE APP INITIALIZATION
 * Uses singleton pattern with multi-instance safety
 */
function initializeFirebaseApp(): FirebaseApp {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

const app = initializeFirebaseApp();

/**
 * FIRESTORE INITIALIZATION
 * - Enables persistent local cache with multi-tab manager
 * - Gracefully handles offline mode
 * - Maintains data consistency across browser tabs
 */
function initializeFirestoreInstance(): Firestore {
  if (typeof window === 'undefined') {
    // Server-side: return basic Firestore instance
    return getFirestore(app);
  }

  try {
    // Client-side: initialize with offline persistence
    const db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      }),
    });
    return db;
  } catch (error) {
    // If persistent cache fails, fall back to basic Firestore
    console.warn('Persistent local cache unavailable, using standard Firestore:', error);
    return getFirestore(app);
  }
}

export const db = initializeFirestoreInstance();

/**
 * AUTH INITIALIZATION
 * Enforces explicit browserLocalPersistence for all auth sessions
 */
export const auth = getAuth(app);

// Set auth persistence on client-side
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Auth persistence initialization failed:', error);
  });
}

/**
 * ANALYTICS INITIALIZATION
 * Safely initializes only in browser environment
 */
export const analyticsPromise: Promise<Analytics | null> = 
  typeof window !== 'undefined'
    ? isSupported().then((supported) => 
        supported ? getAnalytics(app) : null
      ).catch(() => null)
    : Promise.resolve(null);

/**
 * ERROR HANDLING TYPES & UTILITIES
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
  QUERY = 'query',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  timestamp: string;
  userAgent: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

/**
 * Handles and logs Firestore errors with full context
 * @throws Error with structured JSON for logging services
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null = null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
  };

  console.error('Firestore Error:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * OFFLINE STATE DETECTION
 * Returns current user from auth state
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * ASYNC AUTH STATE LISTENER
 * Ensures auth state is initialized before app renders
 */
export function onAuthReady(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * SNAPSHOT LISTENER WITH FALLBACK
 * Listens to query changes with graceful offline handling
 * Automatically falls back to persistent cache when offline
 */
export function setupQueryListener<T>(
  query: Query,
  onData: (data: T[]) => void,
  onError: (error: Error) => void
) {
  try {
    return onSnapshot(
      query,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          onData(data);
        } catch (error) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      },
      (error) => {
        console.warn('Query listener error (attempting offline cache):', error);
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError(err);
    throw err;
  }
}

export default app;
