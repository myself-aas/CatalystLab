import http from 'http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../../server/app';
import {
  BoundedSlidingWindowStore,
  resetSharedLimiterLocalState,
  setSharedWindowBackendForTests,
} from '../../../server/core/sharedLimiter';
import { resetDailyQuotaClient } from '../../../server/core/dailyQuota';

describe('Two-Instance Shared State, Bounded Stores & Strict CSP Invariants (Plan 3.5, 3.7, 3.8, 4.1, 4.2)', () => {
  const originalEnv = { ...process.env };
  let serverA: http.Server;
  let serverB: http.Server;
  let urlA: string;
  let urlB: string;

  beforeEach(async () => {
    resetSharedLimiterLocalState();
    resetDailyQuotaClient();
    const sharedWindowCounters = new Map<string, number>();
    setSharedWindowBackendForTests({
      incrWindow: async (bucketKey: string) => {
        const next = (sharedWindowCounters.get(bucketKey) || 0) + 1;
        sharedWindowCounters.set(bucketKey, next);
        return next;
      },
    });

    process.env.NODE_ENV = 'production';
    process.env.TRUST_PROXY = 'true';
    process.env.TELEMETRY_INGEST_MAX_PER_MIN = '4';
    delete process.env.GITHUB_WEBHOOK_SECRET;

    const [appA, appB] = await Promise.all([createApp(), createApp()]);
    serverA = http.createServer(appA);
    serverB = http.createServer(appB);
    await Promise.all([
      new Promise<void>((r) => serverA.listen(0, '127.0.0.1', () => r())),
      new Promise<void>((r) => serverB.listen(0, '127.0.0.1', () => r())),
    ]);
    urlA = `http://127.0.0.1:${(serverA.address() as { port: number }).port}`;
    urlB = `http://127.0.0.1:${(serverB.address() as { port: number }).port}`;
  });

  afterEach(async () => {
    setSharedWindowBackendForTests(null);
    resetSharedLimiterLocalState();
    resetDailyQuotaClient();
    process.env = { ...originalEnv };
    await Promise.all([
      new Promise<void>((r) => serverA.close(() => r())),
      new Promise<void>((r) => serverB.close(() => r())),
    ]);
  });

  it('shares telemetry sliding-window rate limits across two independent Express instances (Plan 4.1)', async () => {
    const targets = [urlA, urlB, urlA, urlB];
    for (const target of targets) {
      const res = await fetch(`${target}/api/telemetry/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '203.0.113.200',
        },
        body: JSON.stringify({ eventType: 'vitals', url: 'https://www.catalystlab.tech/' }),
      });
      expect(res.status).toBeLessThan(400);
    }

    // 5th request hits serverA after 2 requests on serverA + 2 on serverB -> must hit shared limit (429)
    const fifth = await fetch(`${urlA}/api/telemetry/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '203.0.113.200',
      },
      body: JSON.stringify({ eventType: 'vitals', url: 'https://www.catalystlab.tech/' }),
    });
    expect(fifth.status).toBe(429);
  });

  it('enforces strict per-request nonce CSP with ZERO unsafe-inline and ZERO bare ws:/wss: (Plan 3.8)', async () => {
    const r1 = await fetch(`${urlA}/api/v1/system/health`);
    const r2 = await fetch(`${urlB}/api/v1/system/health`);
    const csp1 = r1.headers.get('content-security-policy') || '';
    const csp2 = r2.headers.get('content-security-policy') || '';

    expect(csp1).not.toContain("'unsafe-inline'");
    expect(csp1).not.toMatch(/(?:^|[\s;])connect-src[^;]*\sws:(?:\s|;|$)/i);
    expect(csp1).not.toMatch(/(?:^|[\s;])connect-src[^;]*\swss:(?:\s|;|$)/i);
    expect(csp1).not.toMatch(/(?:^|[\s;])img-src[^;]*\shttps:(?:\s|;|$)/i);
    expect(csp1).not.toBe(csp2);

    const body = await r1.json();
    expect(body.status).toBe('operational');
    expect(body.memoryUsageMb).toBeUndefined();
    expect(body.database).toBeUndefined();
  });

  it('fails closed on GitHub webhook in production when GITHUB_WEBHOOK_SECRET is unset & disables demo repo (Plan 3.7)', async () => {
    const res = await fetch(`${urlA}/api/v1/integrations/github/webhook?repoId=gh_repo_default_01`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zen: 'ping' }),
    });
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toMatchObject({ code: 'GITHUB_WEBHOOK_NOT_CONFIGURED' });
  });

  it('enforces hard key ceiling in BoundedSlidingWindowStore under high-cardinality flood (Plan 4.2)', () => {
    const store = new BoundedSlidingWindowStore(100);
    for (let i = 0; i < 600; i++) {
      store.check(`ip_flood_${i}`, 5, 60_000, 1_000_000);
    }
    expect(store.size).toBeLessThanOrEqual(100);
  });
});
