// @vitest-environment node
// Owner decision (2026-10-19, question 1): the daily compute-unit ledger must
// be shared across API instances. Plan item 4.1 validator: two processes
// sharing the store enforce ONE budget, and the combined count is what denies.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import {
  chargeDailyUnits,
  isDistributedQuotaEnabled,
  quotaKey,
  readDailyUnits,
  resetDailyQuotaClient,
  setDailyQuotaBackendForTests,
  type DailyQuotaBackend
} from '@server/core/dailyQuota';
import {
  createEngineRateLimitMiddleware,
  dailyRateLimitStore,
  releaseLocalCharge,
  VISITOR_DAILY_UNITS
} from '@server/core/rateLimit';

class FakeQuotaBackend implements DailyQuotaBackend {
  readonly counters = new Map<string, number>();
  readonly ttls = new Map<string, number>();
  failNext = false;

  async incr(key: string, units: number, ttlSeconds: number): Promise<number> {
    if (this.failNext) throw new Error('upstash unreachable');
    const next = (this.counters.get(key) ?? 0) + units;
    this.counters.set(key, next);
    this.ttls.set(key, ttlSeconds);
    return next;
  }

  async decr(key: string, units: number): Promise<number> {
    const next = Math.max(0, (this.counters.get(key) ?? 0) - units);
    this.counters.set(key, next);
    return next;
  }

  async get(key: string): Promise<number> {
    return this.counters.get(key) ?? 0;
  }
}

function fakeReq(ip = '203.0.113.7'): Request {
  return {
    headers: {},
    query: {},
    body: {},
    socket: { remoteAddress: ip }
  } as unknown as Request;
}

interface FakeResponse {
  res: Response;
  statusCode: number | null;
  body: any;
  headers: Record<string, string>;
}

function fakeRes(): FakeResponse {
  const state: FakeResponse = { res: null as unknown as Response, statusCode: null, body: null, headers: {} };
  const res = {
    headersSent: false,
    setHeader: (name: string, value: string) => {
      state.headers[name.toLowerCase()] = String(value);
    },
    status: (code: number) => {
      state.statusCode = code;
      return res;
    },
    json: (payload: unknown) => {
      state.body = payload;
      return res;
    }
  };
  state.res = res as unknown as Response;
  return state;
}

let backend: FakeQuotaBackend;

beforeEach(() => {
  dailyRateLimitStore.clear();
  backend = new FakeQuotaBackend();
  setDailyQuotaBackendForTests(backend);
});

afterEach(() => {
  setDailyQuotaBackendForTests(null);
  resetDailyQuotaClient();
  dailyRateLimitStore.clear();
});

describe('daily quota ledger backend selection', () => {
  it('reports the shared backend when one is configured', () => {
    expect(isDistributedQuotaEnabled()).toBe(true);
  });

  it('falls back to the in-process ledger when Upstash is not configured', async () => {
    setDailyQuotaBackendForTests(null);
    resetDailyQuotaClient();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(isDistributedQuotaEnabled()).toBe(false);

    const charge = await chargeDailyUnits({
      identifier: 'vis_1.2.3.4',
      dateKey: '2026-10-19',
      ttlSeconds: 3600,
      units: 10,
      limit: 20
    });
    expect(charge.backend).toBe('memory');
    expect(charge.allowed).toBe(true);
    expect(charge.unitsUsed).toBeNull();

    const read = await readDailyUnits('vis_1.2.3.4', '2026-10-19');
    expect(read.backend).toBe('memory');
    expect(read.unitsUsed).toBeNull();
  });
});

describe('chargeDailyUnits', () => {
  it('accumulates against one shared counter and sets the TTL to UTC midnight', async () => {
    const key = quotaKey('user_42', '2026-10-19');
    const first = await chargeDailyUnits({ identifier: 'user_42', dateKey: '2026-10-19', ttlSeconds: 4321, units: 10, limit: 50 });
    const second = await chargeDailyUnits({ identifier: 'user_42', dateKey: '2026-10-19', ttlSeconds: 4320, units: 10, limit: 50 });

    expect(first.unitsUsed).toBe(10);
    expect(second.unitsUsed).toBe(20);
    expect(second.unitsRemaining).toBe(30);
    expect(backend.counters.get(key)).toBe(20);
    expect(backend.ttls.get(key)).toBe(4320);
  });

  it('denies at the boundary and refunds the denied charge', async () => {
    const params = { identifier: 'user_7', dateKey: '2026-10-19', ttlSeconds: 100, units: 15, limit: 20 };
    const first = await chargeDailyUnits(params);
    expect(first.allowed).toBe(true);
    expect(first.unitsUsed).toBe(15);

    const second = await chargeDailyUnits(params);
    expect(second.allowed).toBe(false);
    expect(second.unitsRemaining).toBe(0);
    // The denied attempt must not consume budget.
    expect(backend.counters.get(quotaKey('user_7', '2026-10-19'))).toBe(15);
  });

  it('never denies an unlimited tier but still records usage', async () => {
    const charge = await chargeDailyUnits({ identifier: 'superadmin_1', dateKey: '2026-10-19', ttlSeconds: 100, units: 500, limit: null });
    expect(charge.allowed).toBe(true);
    expect(charge.unitsRemaining).toBe(Number.POSITIVE_INFINITY);
    expect(charge.unitsUsed).toBe(500);
  });

  it('reads without charging when the request costs nothing (session dedup)', async () => {
    await chargeDailyUnits({ identifier: 'user_9', dateKey: '2026-10-19', ttlSeconds: 100, units: 5, limit: 20 });
    const free = await chargeDailyUnits({ identifier: 'user_9', dateKey: '2026-10-19', ttlSeconds: 100, units: 0, limit: 20 });
    expect(free.allowed).toBe(true);
    expect(free.unitsUsed).toBe(5);
    expect(backend.counters.get(quotaKey('user_9', '2026-10-19'))).toBe(5);
  });

  it('propagates a backend failure so the caller can fail closed', async () => {
    backend.failNext = true;
    await expect(
      chargeDailyUnits({ identifier: 'user_1', dateKey: '2026-10-19', ttlSeconds: 100, units: 1, limit: 20 })
    ).rejects.toThrow(/unreachable/);
  });
});

describe('releaseLocalCharge', () => {
  it('refunds the in-process ledger without going negative', () => {
    dailyRateLimitStore.set('2026-10-19_vis_x', {
      unitsUsed: 10,
      sessionCostMap: new Map(),
      requestTimestamps: [],
      lastUpdated: Date.now(),
      tier: 'visitor'
    });
    releaseLocalCharge('vis_x', '2026-10-19', 4);
    expect(dailyRateLimitStore.get('2026-10-19_vis_x')?.unitsUsed).toBe(6);
    releaseLocalCharge('vis_x', '2026-10-19', 100);
    expect(dailyRateLimitStore.get('2026-10-19_vis_x')?.unitsUsed).toBe(0);
    // Unknown identifiers and zero-cost refunds are no-ops.
    releaseLocalCharge('vis_missing', '2026-10-19', 5);
    releaseLocalCharge('vis_x', '2026-10-19', 0);
    expect(dailyRateLimitStore.get('2026-10-19_vis_x')?.unitsUsed).toBe(0);
  });
});

describe('4.1 validator: two instances, one shared budget', () => {
  it('enforces the combined count across processes', async () => {
    const cost = VISITOR_DAILY_UNITS / 2; // two master-sized charges fill a visitor budget
    const instanceA = createEngineRateLimitMiddleware({ cost });
    const instanceB = createEngineRateLimitMiddleware({ cost });
    const next: NextFunction = vi.fn();

    // Instance A (process 1) charges its share.
    const first = fakeRes();
    await instanceA(fakeReq(), first.res, next);
    expect(first.statusCode).toBeNull();
    expect(first.headers['x-ratelimit-backend']).toBe('upstash');
    expect(first.headers['x-ratelimit-used']).toBe(String(cost));

    // Emulate a second process: same client, empty in-process ledger.
    dailyRateLimitStore.clear();
    const second = fakeRes();
    await instanceB(fakeReq(), second.res, next);
    expect(second.statusCode).toBeNull();
    expect(second.headers['x-ratelimit-used']).toBe(String(cost * 2));

    // A third charge exceeds the ONE shared budget even though this process
    // has never seen the client.
    dailyRateLimitStore.clear();
    const third = fakeRes();
    await instanceB(fakeReq(), third.res, next);
    expect(third.statusCode).toBe(429);
    expect(third.body.rateLimitExceeded).toBe(true);
    expect(third.body.scope).toBe('daily');
    expect(third.body.backend).toBe('upstash');
    expect(third.body.remaining).toBe(0);
    // The denied request refunded its local charge as well.
    expect(backend.counters.get(quotaKey('vis_203.0.113.7', new Date().toISOString().split('T')[0]))).toBe(cost * 2);
  });

  it('keeps serving from the local ledger outside production when Upstash is down', async () => {
    backend.failNext = true;
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    const middleware = createEngineRateLimitMiddleware({ cost: 1 });
    const outcome = fakeRes();
    const next: NextFunction = vi.fn();
    await middleware(fakeReq(), outcome.res, next);
    expect(outcome.statusCode).toBeNull();
    expect(next).toHaveBeenCalled();
    if (previousEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnv;
  });

  it('fails closed in production when the shared ledger is unreachable', async () => {
    backend.failNext = true;
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const middleware = createEngineRateLimitMiddleware({ cost: 1 });
      const outcome = fakeRes();
      const next: NextFunction = vi.fn();
      await middleware(fakeReq('198.51.100.9'), outcome.res, next);
      expect(outcome.statusCode).toBe(503);
      expect(next).not.toHaveBeenCalled();
    } finally {
      if (previousEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousEnv;
    }
  });
});
