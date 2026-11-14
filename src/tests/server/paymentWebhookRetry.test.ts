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

function signLs(raw: string, secret: string) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
}

describe('Lemon Squeezy Webhook: Signature Verification, Idempotency & Out-of-Order Ordering', () => {
  const originalEnv = { ...process.env };
  const lsSecret = 'whsec_unit_test_lemonsqueezy_secret';
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
    process.env.PAYMENT_GATEWAY = 'lemonsqueezy';
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = lsSecret;
    process.env.LEMONSQUEEZY_STORE_ID = 'store_123';
    process.env.LEMONSQUEEZY_VARIANT_IDS = JSON.stringify({
      'pro:monthly': 'var_pro_monthly',
      'pro:annual': 'var_pro_annual',
      'starter:monthly': 'var_starter_monthly',
      'starter:annual': 'var_starter_annual',
    });

    const app = await createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  });

  afterEach(async () => {
    setSubscriptionStoreForTests(null);
    process.env = { ...originalEnv };
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('rejects webhook with invalid signature (401)', async () => {
    const uid = `usr_ls_${Date.now()}`;
    const custom = buildCheckoutCustomField(uid, 'pro', 'monthly', 'ord_ls_01');
    const order = JSON.stringify({
      meta: {
        event_name: 'order_created',
        event_time: '2026-11-14T10:00:00Z',
        custom_data: custom,
      },
      data: {
        id: `evt_ls_${uid}`,
        attributes: {
          custom_data: custom,
          user_email: 'test@example.com',
          first_order_item: { variant_id: 'var_pro_monthly' },
        },
      },
    });

    const res = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(order, 'wrong_secret') },
      body: order,
    });
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({ status: 'error' });
  });

  it('applies order_created as paid subscription (200 APPLIED)', async () => {
    const uid = `usr_ls_${Date.now()}`;
    const custom = buildCheckoutCustomField(uid, 'pro', 'monthly', 'ord_ls_01');
    const order = JSON.stringify({
      meta: {
        event_name: 'order_created',
        event_time: '2026-11-14T10:00:00Z',
        custom_data: custom,
      },
      data: {
        id: `evt_ls_${uid}`,
        attributes: {
          custom_data: custom,
          user_email: 'test@example.com',
          first_order_item: { variant_id: 'var_pro_monthly' },
        },
      },
    });

    const res = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(order, lsSecret) },
      body: order,
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ applied: true, reason: 'APPLIED' });
    const sub = subRecords.get(uid) as unknown as SubscriptionRecord;
    expect(sub?.planId).toBe('pro');
    expect(sub?.status).toBe('active');
    expect(sub?.billingCycle).toBe('monthly');
    expect(sub?.gateway).toBe('lemonsqueezy');
  });

  it('applies subscription_payment_success as renewed (200 APPLIED)', async () => {
    const uid = `usr_ls_${Date.now()}`;
    const custom = buildCheckoutCustomField(uid, 'pro', 'monthly', 'ord_ls_02');
    const order = JSON.stringify({
      meta: {
        event_name: 'subscription_payment_success',
        event_time: '2026-11-14T11:00:00Z',
        custom_data: custom,
      },
      data: {
        id: `evt_ls_${uid}`,
        attributes: {
          custom_data: custom,
          user_email: 'test@example.com',
          first_order_item: { variant_id: 'var_pro_monthly' },
        },
      },
    });

    const res = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(order, lsSecret) },
      body: order,
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ applied: true, reason: 'APPLIED' });
    const sub = subRecords.get(uid) as unknown as SubscriptionRecord;
    expect(sub?.planId).toBe('pro');
    expect(sub?.status).toBe('active');
  });

  it('applies subscription_cancelled as canceled (200 APPLIED)', async () => {
    const uid = `usr_ls_${Date.now()}`;
    const custom = buildCheckoutCustomField(uid, 'pro', 'monthly', 'ord_ls_03');
    const order = JSON.stringify({
      meta: {
        event_name: 'subscription_cancelled',
        event_time: '2026-11-14T12:00:00Z',
        custom_data: custom,
      },
      data: {
        id: `evt_ls_${uid}`,
        attributes: {
          custom_data: custom,
          user_email: 'test@example.com',
        },
      },
    });

    const res = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(order, lsSecret) },
      body: order,
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ applied: true, reason: 'APPLIED' });
    const sub = subRecords.get(uid) as unknown as SubscriptionRecord;
    expect(sub?.planId).toBe('free');
    expect(sub?.status).toBe('canceled');
  });

  it('applies subscription_payment_refunded as refunded (200 APPLIED)', async () => {
    const uid = `usr_ls_${Date.now()}`;
    const custom = buildCheckoutCustomField(uid, 'pro', 'monthly', 'ord_ls_04');
    const order = JSON.stringify({
      meta: {
        event_name: 'subscription_payment_refunded',
        event_time: '2026-11-14T13:00:00Z',
        custom_data: custom,
      },
      data: {
        id: `evt_ls_${uid}`,
        attributes: {
          custom_data: custom,
          user_email: 'test@example.com',
        },
      },
    });

    const res = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(order, lsSecret) },
      body: order,
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ applied: true, reason: 'APPLIED' });
    const sub = subRecords.get(uid) as unknown as SubscriptionRecord;
    expect(sub?.planId).toBe('free');
    expect(sub?.status).toBe('canceled');
  });

  it('deduplicates duplicate events (200 DUPLICATE_EVENT)', async () => {
    const uid = `usr_ls_${Date.now()}`;
    const custom = buildCheckoutCustomField(uid, 'pro', 'monthly', 'ord_ls_05');
    const order = JSON.stringify({
      meta: {
        event_name: 'order_created',
        event_time: '2026-11-14T10:00:00Z',
        custom_data: custom,
      },
      data: {
        id: `evt_ls_${uid}`,
        attributes: {
          custom_data: custom,
          user_email: 'test@example.com',
          first_order_item: { variant_id: 'var_pro_monthly' },
        },
      },
    });

    // First application
    const first = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(order, lsSecret) },
      body: order,
    });
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({ applied: true, reason: 'APPLIED' });

    // Duplicate retry
    const retry = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(order, lsSecret) },
      body: order,
    });
    expect(retry.status).toBe(200);
    await expect(retry.json()).resolves.toMatchObject({ applied: false, reason: 'DUPLICATE_EVENT' });
  });

  it('rejects stale out-of-order events (200 STALE_EVENT)', async () => {
    const uid = `usr_ls_${Date.now()}`;
    const custom = buildCheckoutCustomField(uid, 'pro', 'monthly', 'ord_ls_06');

    // First, apply a newer event
    const newerOrder = JSON.stringify({
      meta: {
        event_name: 'order_created',
        event_time: '2026-11-14T12:00:00Z',
        custom_data: custom,
      },
      data: {
        id: `evt_ls_newer_${uid}`,
        attributes: {
          custom_data: custom,
          user_email: 'test@example.com',
          first_order_item: { variant_id: 'var_pro_monthly' },
        },
      },
    });
    const newerRes = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(newerOrder, lsSecret) },
      body: newerOrder,
    });
    expect(newerRes.status).toBe(200);
    await expect(newerRes.json()).resolves.toMatchObject({ applied: true, reason: 'APPLIED' });

    // Then try to apply an older event
    const olderOrder = JSON.stringify({
      meta: {
        event_name: 'subscription_cancelled',
        event_time: '2026-11-14T10:00:00Z',
        custom_data: custom,
      },
      data: {
        id: `evt_ls_older_${uid}`,
        attributes: {
          custom_data: custom,
          user_email: 'test@example.com',
        },
      },
    });
    const olderRes = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(olderOrder, lsSecret) },
      body: olderOrder,
    });
    expect(olderRes.status).toBe(200);
    await expect(olderRes.json()).resolves.toMatchObject({ applied: false, reason: 'STALE_EVENT' });

    // Subscription should remain active (not downgraded)
    const sub = subRecords.get(uid) as unknown as SubscriptionRecord;
    expect(sub?.status).toBe('active');
    expect(sub?.planId).toBe('pro');
  });

  it('returns 503 during store outage so gateway retries', async () => {
    const uid = `usr_ls_${Date.now()}`;
    const custom = buildCheckoutCustomField(uid, 'pro', 'monthly', 'ord_ls_07');
    const order = JSON.stringify({
      meta: {
        event_name: 'order_created',
        event_time: '2026-11-14T10:00:00Z',
        custom_data: custom,
      },
      data: {
        id: `evt_ls_${uid}`,
        attributes: {
          custom_data: custom,
          user_email: 'test@example.com',
          first_order_item: { variant_id: 'var_pro_monthly' },
        },
      },
    });

    // Outage -> 503
    setSubscriptionStoreForTests(null);
    const outage = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(order, lsSecret) },
      body: order,
    });
    expect(outage.status).toBe(503);
    await expect(outage.json()).resolves.toMatchObject({ reason: 'STORE_UNAVAILABLE' });

    // Retry after store recovery -> 200 APPLIED
    setSubscriptionStoreForTests(memStore);
    const first = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-signature': signLs(order, lsSecret) },
      body: order,
    });
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({ applied: true, reason: 'APPLIED' });
    const sub = subRecords.get(uid) as unknown as SubscriptionRecord;
    expect(sub?.planId).toBe('pro');
  });
});