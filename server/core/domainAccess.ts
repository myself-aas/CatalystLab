import type { Request } from 'express';
import { getAttachedIdentity } from '../../src/lib/serverAuth';
import { getDbInstance, initAnalyticsDB } from '../../src/lib/analyticsEngine';
import { isDemoUnauthAllowed } from './authz';
import { logger } from './logger';

// Owner decision D4 (2026-10-19): global aggregates stay public; per-domain
// analytics numbers require a verified identity AND ownership of that domain.
// An anonymous caller asking for someone else's traffic must get 401/403, not
// the numbers.

/** Domains that mean "the public, cross-customer aggregate". */
const GLOBAL_DOMAIN_TOKENS = new Set(['', 'all', '*', 'global', 'aggregate']);

export type DomainScope = 'global' | 'domain';

export interface DomainAccessDecision {
  allowed: boolean;
  scope: DomainScope;
  /** Normalised hostname for `domain` scope, or `all` for `global` scope. */
  domain: string;
  status?: 401 | 403 | 503;
  code?: 'AUTH_REQUIRED' | 'DOMAIN_NOT_OWNED' | 'OWNERSHIP_STORE_UNAVAILABLE';
  error?: string;
}

/**
 * Normalises a caller-supplied domain to a bare lowercase hostname so
 * `https://Example.com/path`, `Example.com:443` and `example.com` compare
 * equal.
 */
export function normalizeDomainKey(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let value = raw.trim().toLowerCase();
  if (!value) return '';
  if (value.includes('://')) {
    try {
      value = new URL(value).hostname;
    } catch {
      value = value.split('://')[1] || value;
    }
  }
  value = value.split('/')[0].split('?')[0].split('#')[0];
  // Strip a trailing dot (FQDN form) and an explicit port.
  value = value.replace(/:\d+$/, '').replace(/\.$/, '');
  return value;
}

export function isGlobalDomainRequest(raw: unknown): boolean {
  return GLOBAL_DOMAIN_TOKENS.has(normalizeDomainKey(raw));
}

/** Ownership lookups are cached briefly; both the cache and its entries are bounded. */
const OWNERSHIP_CACHE_TTL_MS = 30_000;
const OWNERSHIP_CACHE_MAX_ENTRIES = 500;
const ownershipCache = new Map<string, { owned: boolean; expiresAt: number }>();

/** Test hook: drop cached ownership decisions. */
export function resetDomainOwnershipCache(): void {
  ownershipCache.clear();
}

async function isDomainOwnedBy(uid: string, domain: string): Promise<boolean | null> {
  const cacheKey = `${uid}::${domain}`;
  const cached = ownershipCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.owned;

  const db = getDbInstance() || (await initAnalyticsDB());
  if (!db) {
    // Without the ownership store the question cannot be answered.
    return null;
  }

  let owned = false;
  try {
    const docs = await db
      .collection('domains')
      .find({ ownerId: uid })
      .limit(OWNERSHIP_CACHE_MAX_ENTRIES)
      .toArray();
    owned = docs.some((doc: any) => {
      const candidates = [doc?.domain, doc?.url, doc?.hostname, doc?.id];
      return candidates.some((candidate) => normalizeDomainKey(candidate) === domain);
    });
  } catch (err) {
    logger.warn({ err, uid, domain }, '[DomainAccess] Ownership lookup failed');
    return null;
  }

  if (ownershipCache.size >= OWNERSHIP_CACHE_MAX_ENTRIES) {
    // Bounded map (plan item 4.2): evict the oldest insertion.
    const oldest = ownershipCache.keys().next().value;
    if (oldest !== undefined) ownershipCache.delete(oldest);
  }
  ownershipCache.set(cacheKey, { owned, expiresAt: Date.now() + OWNERSHIP_CACHE_TTL_MS });
  return owned;
}

/**
 * Decides whether `requestedDomain` may be read by this caller.
 *
 * - global aggregate (`all`, empty): public, no identity required
 * - a specific domain: verified identity required, then superadmin or owner
 */
export async function authorizeAnalyticsDomain(
  req: Request,
  requestedDomain: unknown
): Promise<DomainAccessDecision> {
  if (isGlobalDomainRequest(requestedDomain)) {
    return { allowed: true, scope: 'global', domain: 'all' };
  }

  const domain = normalizeDomainKey(requestedDomain);
  const identity = getAttachedIdentity(req);

  if (!identity?.uid) {
    // The test/demo surface may run without identity; production never does.
    if (isDemoUnauthAllowed()) {
      return { allowed: true, scope: 'domain', domain };
    }
    return {
      allowed: false,
      scope: 'domain',
      domain,
      status: 401,
      code: 'AUTH_REQUIRED',
      error: 'Per-domain analytics require authentication. Use domain=all for the public aggregate.'
    };
  }

  if (identity.isSuperadmin) {
    return { allowed: true, scope: 'domain', domain };
  }

  const owned = await isDomainOwnedBy(identity.uid, domain);
  if (owned === null) {
    return {
      allowed: false,
      scope: 'domain',
      domain,
      status: 503,
      code: 'OWNERSHIP_STORE_UNAVAILABLE',
      error: 'Domain ownership could not be verified because the analytics store is unavailable.'
    };
  }
  if (!owned) {
    return {
      allowed: false,
      scope: 'domain',
      domain,
      status: 403,
      code: 'DOMAIN_NOT_OWNED',
      error: `You do not have access to analytics for ${domain}.`
    };
  }

  return { allowed: true, scope: 'domain', domain };
}
