import crypto from 'crypto';
import http from 'http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../../server/app';
import { setDailyQuotaBackendForTests } from '../../../server/core/dailyQuota';
import {
  buildCheckoutCustomField,
  setSubscriptionStoreForTests,
  SUBSCRIPTION_COLLECTION,
  type SubscriptionRecord,
  type SubscriptionStore,
} from '../../../server/core/subscriptions';

function sign(raw: string, secret: string) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
}

describe('Payments Q32 Gate, 503 Outage Retry, Idempotency & Out-of-Order Ordering (Blocker #8)', () => {
  const originalEnv = { ...process.env };
  const secret = 'whsec_unit_test_2checkout_secret';
  let server: http.Server;
  let baseUrl: string;
  let subRecords: Map<string, Record<string, unknown>>;
  let memStore: SubscriptionStore;

  beforeEach(async () => {
    const collections = new Map<string, Map<string, Record<string, unknown>>>();
    const getCol = (name: string) => {
      let col = collections.get(name);
      if (!col) {
        col = new Map();
        collections.set(name, col);
      }
      return col;
    };
    subRecords = getCol(SUBSCRIPTION_COLLECTION);
    memStore = {
      async runTransaction<T>(fn: (tx: import('../../../server/core/subscriptions').StoreTransaction) => Promise<T>): Promise<T> {
        const ops: Array<{ c: string; id: string; data: Record<string, unknown> }> = [];
        const res = await fn({
          get: async (c, id) => {
            const v = getCol(c).get(id);
            return { exists: v !== undefined, data: () => (v ? structuredClone(v) : undefined) };
          },
          set: (c, id, data) => ops.push({ c, id, data: structuredClone(data) }),
        });
        for (const o of ops) getCol(o.c).set(o.id, o.data);
        return res;
      },
    };
    setSubscriptionStoreForTests(memStore);

    process.env.NODE_ENV = 'production';
    process.env.APP_ORIGIN = 'https://www.catalystlab.tech';
    process.env.PAYMENTS_WEBHOOK_SECRET_2CHECKOUT = secret;
    process.env.V2CHECKOUT_MERCHANT_CODE = '255999';
    process.env.V2CHECKOUT_SECRET_KEY = 'secret_key_test';

    const app = await createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  });

  afterEach(async () => {
    setDailyQuotaBackendForTests(null);
    setSubscriptionStoreForTests(null);
    process.env = { ...originalEnv };
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('blocks checkout when PAYMENTS_ENABLED=false OR when production lacks shared Upstash store (Q32)', async () => {
    process.env.PAYMENTS_ENABLED = 'false';
    setDailyQuotaBackendForTests(null);

    const r1 = await fetch(`${baseUrl}/api/payments/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: 'pro', billingCycle: 'monthly' }),
    });
    expect(r1.status).toBe(503);
    await expect(r1.json()).resolves.toMatchObject({ code: 'PAYMENTS_DISABLED' });

    process.env.PAYMENTS_ENABLED = 'true';
    const r2 = await fetch(`${baseUrl}/api/payments/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: 'pro', billingCycle: 'monthly' }),
    });
    expect(r2.status).toBe(503);
    await expect(r2.json()).resolves.toMatchObject({ code: 'PAYMENTS_SHARED_STATE_REQUIRED' });
  });

  it('returns 503 during store outage so gateway retries, then applies once and deduplicates retries', async () => {
    const uid = `usr_pay_${Date.now()}`;
    const custom = buildCheckoutCustomField(uid, 'pro', 'monthly', 'ord_unit_01');
    const order = JSON.stringify({
      message_id: `msg_order_${uid}`,
      message_type: 'ORDER_CREATED',
      timestamp: '2026-10-21T10:00:00Z',
      custom,
    });

    // Outage -> 503
    setSubscriptionStoreForTests(null);
    const outage = await fetch(`${baseUrl}/api/payments/webhook/2checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature-256': sign(order, secret) },
      body: order,
    });
    expect(outage.status).toBe(503);

    // Retry #1 after store recovery -> 200 APPLIED
    setSubscriptionStoreForTests(memStore);
    const first = await fetch(`${baseUrl}/api/payments/webhook/2checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature-256': sign(order, secret) },
      body: order,
    });
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({ applied: true, reason: 'APPLIED' });
    expect((subRecords.get(uid) as unknown as SubscriptionRecord)?.planId).toBe('pro');

    // Duplicate retry #2 -> 200 DUPLICATE_EVENT
    const retry = await fetch(`${baseUrl}/api/payments/webhook/2checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature-256': sign(order, secret) },
      body: order,
    });
    expect(retry.status).toBe(200);
    await expect(retry.json()).resolves.toMatchObject({ applied: false, reason: 'DUPLICATE_EVENT' });

    // Stale out-of-order cancel event -> 200 STALE_EVENT without downgrading pro
    const stale = JSON.stringify({
      message_id: `msg_stale_${uid}`,
      message_type: 'RECURRING_STOPPED',
      timestamp: '2026-10-20T00:00:00Z',
      custom,
    });
    const staleRes = await fetch(`${baseUrl}/api/payments/webhook/2checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature-256': sign(stale, secret) },
      body: stale,
    });
    expect(staleRes.status).toBe(200);
    await expect(staleRes.json()).resolves.toMatchObject({ applied: false, reason: 'STALE_EVENT' });
    expect((subRecords.get(uid) as unknown as SubscriptionRecord)?.status).toBe('active');
  });
});
