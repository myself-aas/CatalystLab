// @vitest-environment node
// Owner decision D4: global aggregates stay public; per-domain analytics need a
// verified identity AND ownership of the domain. Plan item 3.1 validator: an
// anonymous request for another domain is refused.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request } from 'express';

const { dbState } = vi.hoisted(() => ({
  dbState: {
    available: true as boolean,
    domains: [] as { ownerId: string; domain: string }[],
    throwOnFind: false,
    findCount: 0
  }
}));

vi.mock('@/lib/analyticsEngine', () => ({
  getDbInstance: () =>
    dbState.available
      ? {
          collection: (name: string) => ({
            find: (filter: { ownerId: string }) => ({
              limit: () => ({
                toArray: async () => {
                  dbState.findCount += 1;
                  if (dbState.throwOnFind) throw new Error('mongo down');
                  if (name !== 'domains') return [];
                  return dbState.domains.filter((doc) => doc.ownerId === filter.ownerId);
                }
              })
            })
          })
        }
      : null,
  initAnalyticsDB: async () => null
}));

const {
  authorizeAnalyticsDomain,
  isGlobalDomainRequest,
  normalizeDomainKey,
  resetDomainOwnershipCache
} = await import('@server/core/domainAccess');

function fakeReq(identity?: { uid: string; isSuperadmin?: boolean } | null): Request {
  const req = { headers: {}, query: {}, body: {}, socket: { remoteAddress: '203.0.113.7' } } as unknown as Request;
  if (identity) {
    // serverAuth reads the attached identity from this symbol-free property.
    (req as unknown as Record<string, unknown>).verifiedIdentity = {
      uid: identity.uid,
      plan: 'free',
      isTrialActive: false,
      isSuperadmin: Boolean(identity.isSuperadmin)
    };
  }
  return req;
}

beforeEach(() => {
  dbState.available = true;
  dbState.throwOnFind = false;
  dbState.domains = [{ ownerId: 'uid_owner', domain: 'owner-site.com' }];
  dbState.findCount = 0;
  resetDomainOwnershipCache();
});

afterEach(() => {
  resetDomainOwnershipCache();
});

describe('domain key normalisation', () => {
  it('reduces URLs, ports and case to a bare hostname', () => {
    expect(normalizeDomainKey('https://Example.COM/path?q=1')).toBe('example.com');
    expect(normalizeDomainKey('http://example.com:8080/')).toBe('example.com');
    expect(normalizeDomainKey('example.com.')).toBe('example.com');
    expect(normalizeDomainKey('  example.com  ')).toBe('example.com');
    expect(normalizeDomainKey(undefined)).toBe('');
    expect(normalizeDomainKey(42)).toBe('');
  });

  it('treats the aggregate tokens as global', () => {
    for (const token of ['', 'all', '*', 'global', 'AGGREGATE', undefined]) {
      expect(isGlobalDomainRequest(token)).toBe(true);
    }
    expect(isGlobalDomainRequest('example.com')).toBe(false);
  });
});

describe('authorizeAnalyticsDomain', () => {
  it('keeps the global aggregate public and anonymous', async () => {
    const decision = await authorizeAnalyticsDomain(fakeReq(null), 'all');
    expect(decision.allowed).toBe(true);
    expect(decision.scope).toBe('global');
    expect(decision.domain).toBe('all');
  });

  it('refuses an anonymous per-domain read with 401', async () => {
    // The suite sets ALLOW_UNAUTH_DEMO=true for the demo surface. With that
    // flag off (every real deployment) the guard is default-deny.
    const previous = process.env.ALLOW_UNAUTH_DEMO;
    delete process.env.ALLOW_UNAUTH_DEMO;
    try {
      const decision = await authorizeAnalyticsDomain(fakeReq(null), 'owner-site.com');
      expect(decision.allowed).toBe(false);
      expect(decision.status).toBe(401);
      expect(decision.code).toBe('AUTH_REQUIRED');
    } finally {
      if (previous !== undefined) process.env.ALLOW_UNAUTH_DEMO = previous;
    }
  });

  it('documents the test-only demo escape hatch', async () => {
    // NODE_ENV=test + ALLOW_UNAUTH_DEMO=true is the only combination that
    // lets an anonymous caller read a per-domain number.
    expect(process.env.ALLOW_UNAUTH_DEMO).toBe('true');
    const decision = await authorizeAnalyticsDomain(fakeReq(null), 'owner-site.com');
    expect(decision.allowed).toBe(true);
    expect(decision.scope).toBe('domain');
  });

  it('allows the verified owner of the domain', async () => {
    const decision = await authorizeAnalyticsDomain(fakeReq({ uid: 'uid_owner' }), 'https://owner-site.com/');
    expect(decision.allowed).toBe(true);
    expect(decision.scope).toBe('domain');
    expect(decision.domain).toBe('owner-site.com');
  });

  it('refuses another customer domain with 403', async () => {
    const decision = await authorizeAnalyticsDomain(fakeReq({ uid: 'uid_intruder' }), 'owner-site.com');
    expect(decision.allowed).toBe(false);
    expect(decision.status).toBe(403);
    expect(decision.code).toBe('DOMAIN_NOT_OWNED');
  });

  it('lets a superadmin read any domain', async () => {
    const decision = await authorizeAnalyticsDomain(fakeReq({ uid: 'uid_root', isSuperadmin: true }), 'owner-site.com');
    expect(decision.allowed).toBe(true);
  });

  it('fails closed when the ownership store cannot answer', async () => {
    dbState.throwOnFind = true;
    const decision = await authorizeAnalyticsDomain(fakeReq({ uid: 'uid_owner' }), 'owner-site.com');
    expect(decision.allowed).toBe(false);
    expect(decision.status).toBe(503);
    expect(decision.code).toBe('OWNERSHIP_STORE_UNAVAILABLE');
  });

  it('caches an ownership decision so a hot endpoint does not query per request', async () => {
    const first = await authorizeAnalyticsDomain(fakeReq({ uid: 'uid_owner' }), 'owner-site.com');
    expect(first.allowed).toBe(true);
    expect(dbState.findCount).toBe(1);

    const second = await authorizeAnalyticsDomain(fakeReq({ uid: 'uid_owner' }), 'owner-site.com');
    expect(second.allowed).toBe(true);
    // Served from the bounded 30 s cache: no second ownership query.
    expect(dbState.findCount).toBe(1);

    resetDomainOwnershipCache();
    const third = await authorizeAnalyticsDomain(fakeReq({ uid: 'uid_owner' }), 'owner-site.com');
    expect(third.allowed).toBe(true);
    expect(dbState.findCount).toBe(2);
  });
});
