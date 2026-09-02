// @vitest-environment node
// Phase 3 (item 16): direct unit tests for the in-memory rate limiter core —
// identity resolution (spoof resistance), burst windowing, daily unit
// accounting, and the engine middleware contract.
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import {
  createEngineRateLimitMiddleware,
  dailyRateLimitStore,
  evaluateAndChargeRateLimit,
  resolveClientIdentity,
  VISITOR_BURST_MAX,
  VISITOR_DAILY_UNITS,
  PRO_DAILY_UNITS,
  FREE_USER_DAILY_UNITS,
  MASTER_AUDIT_COST
} from '@server/core/rateLimit';

// tls.connect is replaced so the certificate-parse branch is deterministic.
vi.mock('tls', async (importOriginal) => {
  const actual = await importOriginal<typeof import('tls')>();
  const mocked = { ...actual, connect: vi.fn() };
  return { ...mocked, default: mocked };
});

function fakeReq(headers: Record<string, string | undefined> = {}, verifiedIdentity?: unknown): Request {
  return {
    headers,
    query: {},
    body: {},
    socket: { remoteAddress: '203.0.113.7' },
    ...(verifiedIdentity !== undefined ? { verifiedIdentity } : {})
  } as unknown as Request;
}

function fakeRes(): Response & { headersSent: boolean; setHeader: ReturnType<typeof vi.fn> } {
  return {
    headersSent: false,
    setHeader: vi.fn()
  } as unknown as Response & { headersSent: boolean; setHeader: ReturnType<typeof vi.fn> };
}

beforeEach(() => {
  dailyRateLimitStore.clear();
  delete process.env.VALID_API_KEYS;
});

describe('resolveClientIdentity', () => {
  it('anonymous requests resolve to the visitor tier with visitor limits', () => {
    const identity = resolveClientIdentity(fakeReq());
    expect(identity.tier).toBe('visitor');
    expect(identity.limit).toBe(VISITOR_DAILY_UNITS);
    expect(identity.burstMax).toBe(VISITOR_BURST_MAX);
  });

  it('spoofed plan/role headers are ignored', () => {
    const identity = resolveClientIdentity(
      fakeReq({
        'x-user-email': 'shuvoasifahmed@gmail.com',
        'x-subscription-plan': 'enterprise',
        'x-trial-active': 'true',
        'x-user-role': 'superadmin'
      })
    );
    expect(identity.tier).toBe('visitor');
    expect(identity.limit).not.toBeNull();
  });

  it('a verified pro identity earns the pro tier (server-attached only)', () => {
    const identity = resolveClientIdentity(fakeReq({}, { uid: 'usr_1', plan: 'pro', isTrialActive: false }));
    expect(identity.tier).toBe('pro');
    expect(identity.limit).toBe(PRO_DAILY_UNITS);
    expect(identity.userId).toBe('usr_1');
  });

  it('a verified free identity earns the free tier', () => {
    const identity = resolveClientIdentity(fakeReq({}, { uid: 'usr_2', plan: 'free', isTrialActive: false }));
    expect(identity.tier).toBe('free');
    expect(identity.limit).toBe(FREE_USER_DAILY_UNITS);
  });

  it('a verified enterprise plan alone never resolves to superadmin', () => {
    const identity = resolveClientIdentity(fakeReq({}, { uid: 'usr_3', plan: 'enterprise' }));
    // Superadmin requires the explicit server-verified claim, not a plan string.
    expect(identity.tier).toBe('enterprise');
  });

  it('the server-verified superadmin claim grants the terminal tier', () => {
    const identity = resolveClientIdentity(fakeReq({}, { uid: 'usr_4', plan: 'free', isSuperadmin: true }));
    expect(identity.tier).toBe('superadmin');
    expect(identity.limit).toBeNull();
    expect(identity.burstMax).toBe(Infinity);
  });

  it('configured cat_live_ API keys earn api_pro via constant-time allowlist', () => {
    process.env.VALID_API_KEYS = 'cat_live_validkey123';
    const good = resolveClientIdentity(fakeReq({ 'x-api-key': 'cat_live_validkey123' }));
    expect(good.tier).toBe('api_pro');

    const bad = resolveClientIdentity(fakeReq({ 'x-api-key': 'cat_live_evilkey999' }));
    expect(bad.tier).toBe('visitor');
  });

  it('unconfigured deployments never grant the api_pro tier', () => {
    const sneaky = resolveClientIdentity(fakeReq({ 'x-api-key': 'cat_live_anything' }));
    expect(sneaky.tier).toBe('visitor');
  });
});

describe('evaluateAndChargeRateLimit', () => {
  it('charges the requested cost and reports remaining units', () => {
    const req = fakeReq();
    const res = fakeRes();
    const first = evaluateAndChargeRateLimit(req, res, 2);
    expect(first.allowed).toBe(true);
    expect(first.costCharged).toBe(2);
    expect(first.unitsUsed).toBe(2);
    expect(first.unitsRemaining).toBe(VISITOR_DAILY_UNITS - 2);
  });

  it('blocks requests once the burst window is saturated', () => {
    const req = fakeReq();
    for (let i = 0; i < VISITOR_BURST_MAX; i += 1) {
      const result = evaluateAndChargeRateLimit(req, fakeRes(), 1);
      expect(result.allowed).toBe(true);
    }
    const blocked = evaluateAndChargeRateLimit(req, fakeRes(), 1);
    expect(blocked.allowed).toBe(false);
    expect(blocked.burstExceeded).toBe(true);
    expect(blocked.costCharged).toBe(0);
  });

  it('separates budgets per identity (IP), not globally', () => {
    for (let i = 0; i < VISITOR_BURST_MAX; i += 1) {
      expect(evaluateAndChargeRateLimit(fakeReq(), fakeRes(), 1).allowed).toBe(true);
    }
    // A different client IP still has its full budget.
    const other = fakeReq({ 'x-forwarded-for': '198.51.100.9' });
    expect(evaluateAndChargeRateLimit(other, fakeRes(), 1).allowed).toBe(true);
  });
});

describe('createEngineRateLimitMiddleware', () => {
  it('calls next() and attaches rateLimitStatus when allowed', () => {
    const middleware = createEngineRateLimitMiddleware({ cost: 1 });
    const req = fakeReq();
    const res = fakeRes();
    const next = vi.fn() as unknown as NextFunction;
    (middleware as (r: Request, res: Response, n: NextFunction) => void)(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect((req as unknown as { rateLimitStatus?: { allowed: boolean } }).rateLimitStatus?.allowed).toBe(true);
  });

  it('answers 429 with the rate-limit envelope once exhausted', () => {
    const middleware = createEngineRateLimitMiddleware({ cost: MASTER_AUDIT_COST });
    const jsonSpy = vi.fn();
    const statusSpy = vi.fn(() => ({ json: jsonSpy }));
    let calls = 0;
    const req = fakeReq();
    do {
      const res = {
        headersSent: false,
        setHeader: vi.fn(),
        status: statusSpy,
        json: jsonSpy
      } as unknown as Response;
      void res;
      (middleware as (r: Request, res: Response, n: NextFunction) => void)(req, res, vi.fn() as unknown as NextFunction);
      calls += 1;
    } while (statusSpy.mock.calls.length === 0 && calls < 40);

    expect(statusSpy).toHaveBeenCalledWith(429);
    const envelope = jsonSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(envelope.rateLimitExceeded).toBe(true);
  });
});

describe('ssl detail probe', () => {
  it('parses a valid certificate and reports days remaining', async () => {
    const tls = await import('tls');
    const fakeSocket = {
      getPeerCertificate: () => ({
        valid_to: new Date(Date.now() + 90 * 86400_000).toUTCString(),
        issuer: { O: 'Test Authority' }
      }),
      destroy: () => {},
      end: () => {},
      on: () => {}
    };
    (tls.connect as unknown as Mock).mockImplementation(((_opts: unknown, cb?: () => void) => {
      // Fire after ssl.ts finishes binding `socket` (a synchronous callback
      // would race its const initialization).
      if (cb) queueMicrotask(cb);
      return fakeSocket;
    }) as unknown as typeof tls.connect);
    const { getSslDetails } = await import('@server/core/ssl');
    const result = await getSslDetails('example.com');
    expect(result.valid).toBe(true);
    expect(result.daysRemaining).toBeGreaterThanOrEqual(89);
    expect(result.issuer).toBe('Test Authority');
    (tls.connect as unknown as Mock).mockReset();
  });

  it('resolves invalid:false on connection failure', async () => {
    const tls = await import('tls');
    (tls.connect as unknown as Mock).mockImplementation(() => {
      throw new Error('ECONNREFUSED');
    });
    const { getSslDetails } = await import('@server/core/ssl');
    const result = await getSslDetails('unreachable.invalid');
    expect(result.valid).toBe(false);
    (tls.connect as unknown as Mock).mockReset();
  });
});
