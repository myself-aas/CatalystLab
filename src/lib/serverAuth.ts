import type { Request, Response, NextFunction } from 'express';

/**
 * Server-side identity verification for the Express API.
 *
 * Verifies Firebase ID tokens with firebase-admin and derives entitlements
 * (plan tier, trial state, superadmin) from server-controlled sources only:
 * cryptographically signed token custom claims and the Firestore
 * ``user_subscriptions`` collection. Client-supplied headers/body values are
 * never trusted. When Firebase Admin is not configured the verifier is
 * DISABLED and every request is treated as unauthenticated (fail closed).
 */

export interface VerifiedIdentity {
  uid: string;
  email?: string;
  plan: string;
  isTrialActive: boolean;
  isSuperadmin: boolean;
}

interface DecodedToken {
  uid?: string;
  sub?: string;
  email?: string;
  role?: string;
  superadmin?: boolean;
}

type VerifyTokenFn = (token: string) => Promise<DecodedToken>;

let cachedVerifier: VerifyTokenFn | null | undefined;
let cachedFirestore: import('firebase-admin/firestore').Firestore | null | undefined;

/**
 * Initializes (once) a firebase-admin token verifier from environment config.
 *
 * Supported configuration, in priority order:
 * - ``FIREBASE_SERVICE_ACCOUNT_JSON``: full service-account JSON, optionally base64-encoded
 * - ``FIREBASE_SERVICE_ACCOUNT_PATH`` / ``GOOGLE_APPLICATION_CREDENTIALS``: path to the JSON file
 *
 * Returns ``null`` when firebase-admin is unavailable or no credentials are
 * configured; callers must fail closed in that case.
 */
async function initVerifier(): Promise<VerifyTokenFn | null> {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  const credPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();

  if (!rawJson && !credPath) {
    return null;
  }

  try {
    const adminApp = await import('firebase-admin/app');
    const adminAuth = await import('firebase-admin/auth');

    if (adminApp.getApps().length === 0) {
      if (rawJson) {
        const json = rawJson.startsWith('{') ? rawJson : Buffer.from(rawJson, 'base64').toString('utf8');
        adminApp.initializeApp({ credential: adminApp.cert(JSON.parse(json)) });
      } else if (credPath) {
        adminApp.initializeApp({ credential: adminApp.cert(credPath) });
      }
    }
    return (token: string) => adminAuth.getAuth().verifyIdToken(token);
  } catch (err: unknown) {
    console.error('[ServerAuth] Firebase Admin initialization failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Extracts a Bearer ID token from the request and verifies it.
 *
 * @returns The verified ``uid``, or ``null`` when the request carries no
 *          verifiable identity. Never throws.
 */
export async function getVerifiedUid(req: Request): Promise<string | null> {
  const decoded = await getVerifiedToken(req);
  return decoded?.uid || decoded?.sub || null;
}

/**
 * Verifies the request's Bearer ID token and returns the full decoded token
 * (uid, email, custom claims), or ``null`` when absent/invalid/unconfigured.
 */
export async function getVerifiedToken(req: Request): Promise<DecodedToken | null> {
  const authHeader = req.headers['authorization'];
  const bearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const altHeader = typeof req.headers['x-auth-token'] === 'string' ? (req.headers['x-auth-token'] as string).trim() : '';
  const token = bearer || altHeader;

  if (!token) {
    return null;
  }

  if (cachedVerifier === undefined) {
    cachedVerifier = await initVerifier();
  }
  if (!cachedVerifier) {
    return null;
  }

  try {
    return await cachedVerifier(token);
  } catch {
    return null;
  }
}

// --- Entitlements (Firestore-backed, cached) ---------------------------------

const ENTITLEMENTS_TTL_MS = 60_000;
const ENTITLEMENTS_CACHE_MAX = 10_000;
const entitlementsCache = new Map<string, { data: { plan: string; isTrialActive: boolean }; expiresAt: number }>();

function cacheEntitlements(uid: string, data: { plan: string; isTrialActive: boolean }): void {
  if (entitlementsCache.size >= ENTITLEMENTS_CACHE_MAX) {
    const oldest = entitlementsCache.keys().next().value;
    if (oldest !== undefined) entitlementsCache.delete(oldest);
  }
  entitlementsCache.set(uid, { data, expiresAt: Date.now() + ENTITLEMENTS_TTL_MS });
}

async function getFirestore(): Promise<import('firebase-admin/firestore').Firestore | null> {
  if (cachedFirestore !== undefined) return cachedFirestore;
  try {
    const adminApp = await import('firebase-admin/app');
    if (adminApp.getApps().length === 0) {
      cachedFirestore = null;
      return null;
    }
    const adminFirestore = await import('firebase-admin/firestore');
    cachedFirestore = adminFirestore.getFirestore(adminApp.getApps()[0]);
    return cachedFirestore;
  } catch {
    cachedFirestore = null;
    return null;
  }
}

/**
 * Reads the user's subscription entitlements from Firestore
 * (``user_subscriptions`` where userId == uid), cached for 60 seconds.
 * Falls back to the free plan whenever Firestore is unavailable.
 */
export async function fetchEntitlements(uid: string): Promise<{ plan: string; isTrialActive: boolean }> {
  const cached = entitlementsCache.get(uid);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let data = { plan: 'free', isTrialActive: false };
  try {
    const db = await getFirestore();
    if (db) {
      const snapshot = await db
        .collection('user_subscriptions')
        .where('userId', '==', uid)
        .limit(1)
        .get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0].data();
        data = {
          plan: typeof doc.planId === 'string' ? doc.planId : 'free',
          isTrialActive: doc.status === 'trialing' || doc.isTrialActive === true
        };
      }
    }
  } catch (err: unknown) {
    console.warn('[ServerAuth] Entitlements lookup failed, defaulting to free tier:',
      err instanceof Error ? err.message : err);
  }

  cacheEntitlements(uid, data);
  return data;
}

/**
 * Pure tier/entitlement mapping from a verified identity.
 * Exported for unit testing.
 */
export function identityToEntitlements(identity: VerifiedIdentity, freeUnits: number): {
  tier: 'superadmin' | 'enterprise' | 'team' | 'pro' | 'starter' | 'free';
  limit: number | null;
  burstMax: number;
} {
  if (identity.isSuperadmin) {
    return { tier: 'superadmin', limit: null, burstMax: Infinity };
  }
  switch (identity.plan) {
    case 'enterprise':
      return { tier: 'enterprise', limit: 5000, burstMax: 500 };
    case 'team':
      return { tier: 'team', limit: 1500, burstMax: 300 };
    case 'pro':
      return { tier: 'pro', limit: 500, burstMax: 120 };
    case 'starter':
      return { tier: 'starter', limit: 150, burstMax: 60 };
    default:
      return { tier: 'free', limit: freeUnits, burstMax: 45 };
  }
}

/**
 * Express middleware: verifies the request's ID token (when present) and
 * attaches a ``verifiedIdentity`` for downstream resolvers. Anonymous
 * requests pass through untouched; requests bearing an INVALID token are
 * rejected with 401 (fail closed) instead of silently downgrading.
 */
export async function attachIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const hasCredentials =
    (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) ||
    typeof req.headers['x-auth-token'] === 'string';

  if (!hasCredentials) {
    next();
    return;
  }

  const decoded = await getVerifiedToken(req);
  if (!decoded || (!decoded.uid && !decoded.sub)) {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
    return;
  }

  const uid = decoded.uid || decoded.sub || '';
  const entitlements = await fetchEntitlements(uid);
  (req as Request & { verifiedIdentity?: VerifiedIdentity }).verifiedIdentity = {
    uid,
    email: decoded.email,
    plan: entitlements.plan,
    isTrialActive: entitlements.isTrialActive,
    // Superadmin ONLY via signed custom claims on the token (never email lists).
    isSuperadmin: decoded.role === 'superadmin' || decoded.superadmin === true
  };
  next();
}

/** Sync accessor for resolvers running after ``attachIdentity``. */
export function getAttachedIdentity(req: Request): VerifiedIdentity | null {
  return (req as Request & { verifiedIdentity?: VerifiedIdentity }).verifiedIdentity ?? null;
}

/** Test hook: reset cached verifier/Firestore handles between unit tests. */
export function resetVerifierCache(): void {
  cachedVerifier = undefined;
  cachedFirestore = undefined;
  entitlementsCache.clear();
}
