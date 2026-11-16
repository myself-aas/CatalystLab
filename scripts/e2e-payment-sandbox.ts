#!/usr/bin/env tsx
/**
 * CatalystLab End-to-End Sandbox Payment, 503 Store-Outage Retry, Duplicate
 * Idempotency, Out-of-Order Ordering & Q32 Feature-Gate Verifier
 * (Plan items 2.2, 2.4, 4.1, Q32 — Blocker #8).
 */
import crypto from 'crypto';
import http from 'http';
import { createApp } from '../server/app';
import { setDailyQuotaBackendForTests } from '../server/core/dailyQuota';
import {
  buildCheckoutCustomField,
  setSubscriptionStoreForTests,
  SUBSCRIPTION_COLLECTION,
  type SubscriptionRecord,
  type SubscriptionStore,
} from '../server/core/subscriptions';

function createInMemorySubscriptionStore() {
  const collections = new Map<string, Map<string, Record<string, unknown>>>();
  const getCol = (name: string) => {
    let col = collections.get(name);
    if (!col) {
      col = new Map();
      collections.set(name, col);
    }
    return col;
  };
  const store: SubscriptionStore = {
    async runTransaction<T>(fn: (tx: import('../server/core/subscriptions').StoreTransaction) => Promise<T>): Promise<T> {
      const staged: Array<{ collection: string; id: string; data: Record<string, unknown> }> = [];
      const result = await fn({
        get: async (collection, id) => {
          const item = getCol(collection).get(id);
          return {
            exists: item !== undefined,
            data: () => (item ? structuredClone(item) : undefined),
          };
        },
        set: (collection, id, data) => {
          staged.push({ collection, id, data: structuredClone(data) });
        },
      });
      for (const op of staged) {
        getCol(op.collection).set(op.id, op.data);
      }
      return result;
    },
  };
  return {
    store,
    readSubscription: (uid: string) =>
      getCol(SUBSCRIPTION_COLLECTION).get(uid) as SubscriptionRecord | undefined,
  };
}

async function postJson(
  baseUrl: string,
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): Promise<{ status: number; json: any }> {
  const raw = JSON.stringify(body);
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: raw,
  });
  return { status: res.status, json: await res.json() };
}

async function main() {
  const testUid = `usr_sandbox_${Date.now()}`;
  const memSubs = createInMemorySubscriptionStore();

  const quotaMap = new Map<string, number>();
  const mockQuotaBackend = {
    incr: async (key: string, units: number) => {
      const next = (quotaMap.get(key) || 0) + units;
      quotaMap.set(key, next);
      return next;
    },
    decr: async (key: string, units: number) => {
      const next = Math.max(0, (quotaMap.get(key) || 0) - units);
      quotaMap.set(key, next);
      return next;
    },
    get: async (key: string) => quotaMap.get(key) || 0,
  };

  process.env.NODE_ENV = 'production';
  process.env.APP_ORIGIN = 'https://staging.catalystlab.tech';

  const app = await createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    // 1. Verify Q32 fail-closed default when PAYMENTS_ENABLED=false
    process.env.PAYMENTS_ENABLED = 'false';
    setDailyQuotaBackendForTests(null);

    const blockedDisabled = await postJson(baseUrl, '/api/payments/create-checkout', {
      planId: 'pro',
      billingCycle: 'monthly',
      userId: testUid,
    });
    if (blockedDisabled.status !== 503 || blockedDisabled.json.code !== 'PAYMENTS_DISABLED') {
      throw new Error(`Expected 503 PAYMENTS_DISABLED, got ${blockedDisabled.status}: ${JSON.stringify(blockedDisabled.json)}`);
    }

    // 2. Verify production shared-state requirement when PAYMENTS_ENABLED=true without Upstash
    process.env.PAYMENTS_ENABLED = 'true';
    const blockedNoRedis = await postJson(baseUrl, '/api/payments/create-checkout', {
      planId: 'pro',
      billingCycle: 'monthly',
      userId: testUid,
    });
    if (blockedNoRedis.status !== 503 || blockedNoRedis.json.code !== 'PAYMENTS_SHARED_STATE_REQUIRED') {
      throw new Error(`Expected 503 PAYMENTS_SHARED_STATE_REQUIRED, got ${blockedNoRedis.status}: ${JSON.stringify(blockedNoRedis.json)}`);
    }

    // 3. Enable the shared Upstash-style quota backend so checkout is allowed.
    setDailyQuotaBackendForTests(mockQuotaBackend);

    // Lemon Squeezy is the single live gateway (owner decision D2).
    const lsWebhookSecret = 'whsec_ls_sandbox_' + crypto.randomBytes(16).toString('hex');
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = lsWebhookSecret;
    process.env.LEMONSQUEEZY_STORE_ID = 'store_sandbox_123';
    process.env.LEMONSQUEEZY_VARIANT_IDS = JSON.stringify({
      'pro:monthly': 'var_pro_monthly_sandbox',
      'pro:annual': 'var_pro_annual_sandbox',
      'starter:monthly': 'var_starter_monthly_sandbox',
      'starter:annual': 'var_starter_annual_sandbox',
    });
    process.env.LEMONSQUEEZY_SANDBOX_MODE = 'true';
    process.env.LEMONSQUEEZY_API_KEY = 'ls_sandbox_key_' + crypto.randomBytes(16).toString('hex');

    // 4. Lemon Squeezy sandbox checkout URL issued
    const lsCheckout = await postJson(baseUrl, '/api/payments/create-checkout', {
      planId: 'pro',
      billingCycle: 'monthly',
      userId: testUid,
      userEmail: 'founder@acme.io',
    });
    if (lsCheckout.status !== 200 || !lsCheckout.json.checkoutUrl || lsCheckout.json.gateway !== 'lemonsqueezy') {
      throw new Error(`Expected 200 Lemon Squeezy sandbox checkout URL, got ${lsCheckout.status}: ${JSON.stringify(lsCheckout.json)}`);
    }
    console.log('[e2e] Lemon Squeezy sandbox checkout URL issued');

    const lsCustomPassthrough = buildCheckoutCustomField(testUid, 'pro', 'monthly', lsCheckout.json.orderId);
    const lsOrderPayload = {
      meta: {
        event_name: 'order_created',
        event_time: '2026-11-14T10:00:00Z',
        custom_data: lsCustomPassthrough,
      },
      data: {
        id: `evt_ls_${Date.now()}`,
        attributes: {
          custom_data: lsCustomPassthrough,
          user_email: 'founder@acme.io',
          first_order_item: { variant_id: 'var_pro_monthly_sandbox' },
        },
      },
    };
    const rawLsOrder = JSON.stringify(lsOrderPayload);

    function signLsHeader(rawBody: string, secret: string): string {
      return 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    }

    // 5. Reject forged Lemon Squeezy signature with 401
    const lsForged = await postJson(baseUrl, '/api/payments/webhook/lemonsqueezy', lsOrderPayload, {
      'x-signature': signLsHeader(rawLsOrder, 'wrong_secret'),
    });
    if (lsForged.status !== 401) {
      throw new Error(`Expected 401 on forged Lemon Squeezy HMAC, got ${lsForged.status}`);
    }
    console.log('[e2e] Forged Lemon Squeezy HMAC rejected 401');

    // 6. Simulate temporary Firestore outage -> gateway receives HTTP 503 so it retries!
    setSubscriptionStoreForTests(null);
    const lsOutageAttempt = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signLsHeader(rawLsOrder, lsWebhookSecret),
      },
      body: rawLsOrder,
    });
    if (lsOutageAttempt.status !== 503) {
      throw new Error(`Expected 503 during store outage so gateway retries, got ${lsOutageAttempt.status}`);
    }
    console.log('[e2e] Transient store outage returns 503 for Lemon Squeezy');

    // 7. Restore store -> gateway retry #1 succeeds cleanly (`APPLIED`)
    setSubscriptionStoreForTests(memSubs.store);
    const lsRetrySuccess = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signLsHeader(rawLsOrder, lsWebhookSecret),
      },
      body: rawLsOrder,
    });
    const lsBodySuccess = await lsRetrySuccess.json();
    if (lsRetrySuccess.status !== 200 || lsBodySuccess.applied !== true || lsBodySuccess.reason !== 'APPLIED') {
      throw new Error(`Expected Lemon Squeezy retry #1 200 APPLIED, got ${lsRetrySuccess.status}: ${JSON.stringify(lsBodySuccess)}`);
    }
    if (memSubs.readSubscription(testUid)?.planId !== 'pro') {
      throw new Error('Expected active pro subscription in store after Lemon Squeezy webhook');
    }
    console.log('[e2e] Lemon Squeezy gateway retry activates pro entitlement');

    // 8. Duplicate gateway retry #2 -> idempotent 200 `DUPLICATE_EVENT`
    const lsRetryDuplicate = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signLsHeader(rawLsOrder, lsWebhookSecret),
      },
      body: rawLsOrder,
    });
    const lsBodyDuplicate = await lsRetryDuplicate.json();
    if (lsRetryDuplicate.status !== 200 || lsBodyDuplicate.reason !== 'DUPLICATE_EVENT') {
      throw new Error(`Expected Lemon Squeezy DUPLICATE_EVENT, got ${JSON.stringify(lsBodyDuplicate)}`);
    }
    console.log('[e2e] Lemon Squeezy duplicate webhook retry idempotent DUPLICATE_EVENT');

    // 9. Out-of-order stale event timestamp -> safely ignored (`STALE_EVENT`)
    const lsStalePayload = JSON.stringify({
      meta: {
        event_name: 'subscription_cancelled',
        event_time: '2026-11-13T00:00:00Z', // Older than the order_created
        custom_data: lsCustomPassthrough,
      },
      data: {
        id: `evt_ls_stale_${Date.now()}`,
        attributes: {
          custom_data: lsCustomPassthrough,
          user_email: 'founder@acme.io',
        },
      },
    });
    const lsStaleRes = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signLsHeader(lsStalePayload, lsWebhookSecret),
      },
      body: lsStalePayload,
    });
    const lsStaleBody = await lsStaleRes.json();
    if (lsStaleRes.status !== 200 || lsStaleBody.reason !== 'STALE_EVENT' || memSubs.readSubscription(testUid)?.status !== 'active') {
      throw new Error(`Expected Lemon Squeezy STALE_EVENT preserving active pro subscription, got ${JSON.stringify(lsStaleBody)}`);
    }
    console.log('[e2e] Lemon Squeezy out-of-order stale event monotonic STALE_EVENT');

    // 10. Newer subscription_payment_refunded revokes paid plan back to `free` (`status: "canceled"`)
    const lsRefundPayload = JSON.stringify({
      meta: {
        event_name: 'subscription_payment_refunded',
        event_time: '2026-11-15T00:00:00Z', // Newer than the order_created
        custom_data: lsCustomPassthrough,
      },
      data: {
        id: `evt_ls_refund_${Date.now()}`,
        attributes: {
          custom_data: lsCustomPassthrough,
          user_email: 'founder@acme.io',
        },
      },
    });
    const lsRefundRes = await fetch(`${baseUrl}/api/payments/webhook/lemonsqueezy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signLsHeader(lsRefundPayload, lsWebhookSecret),
      },
      body: lsRefundPayload,
    });
    const lsRefundBody = await lsRefundRes.json();
    if (lsRefundRes.status !== 200 || lsRefundBody.reason !== 'APPLIED' || memSubs.readSubscription(testUid)?.planId !== 'free') {
      throw new Error(`Expected Lemon Squeezy refund revocation to free tier, got ${JSON.stringify(lsRefundBody)}`);
    }
    console.log('[e2e] Lemon Squeezy refund issued revokes to free tier');

    console.log(
      JSON.stringify(
        {
          suite: 'catalystlab-payment-sandbox-and-webhook-resilience',
          status: 'passed',
          verifiedChecks: [
            'Q32_fail_closed_when_PAYMENTS_ENABLED_false',
            'Q32_fail_closed_in_prod_without_shared_Upstash_store',
            'lemonsqueezy_sandbox_checkout_url_issued',
            'lemonsqueezy_forged_hmac_rejected_401',
            'lemonsqueezy_transient_store_outage_returns_503',
            'lemonsqueezy_gateway_retry_activates_pro_entitlement',
            'lemonsqueezy_duplicate_webhook_retry_idempotent_DUPLICATE_EVENT',
            'lemonsqueezy_out_of_order_stale_event_monotonic_STALE_EVENT',
            'lemonsqueezy_refund_issued_revokes_to_free_tier',
          ],
        },
        null,
        2
      )
    );
  } finally {
    setDailyQuotaBackendForTests(null);
    setSubscriptionStoreForTests(null);
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('[e2e-payment-sandbox] FAILED:', err);
  process.exit(1);
});
