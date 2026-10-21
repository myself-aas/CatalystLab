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

function signHeader(rawBody: string, secret: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
}

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
  const webhookSecret = 'whsec_sandbox_e2e_' + crypto.randomBytes(16).toString('hex');
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
  process.env.PAYMENTS_WEBHOOK_SECRET_2CHECKOUT = webhookSecret;
  process.env.V2CHECKOUT_MERCHANT_CODE = '255000099999';
  process.env.V2CHECKOUT_SECRET_KEY = 'sandbox_secret_' + crypto.randomBytes(8).toString('hex');
  process.env.V2CHECKOUT_SANDBOX_MODE = 'true';

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

    // 3. Enable shared Upstash backend & issue signed 2Checkout sandbox URL
    setDailyQuotaBackendForTests(mockQuotaBackend);
    const checkout = await postJson(baseUrl, '/api/payments/create-checkout', {
      planId: 'pro',
      billingCycle: 'monthly',
      userId: testUid,
      userEmail: 'founder@acme.io',
    });
    if (checkout.status !== 200 || !checkout.json.checkoutUrl) {
      throw new Error(`Expected 200 sandbox checkout URL, got ${checkout.status}: ${JSON.stringify(checkout.json)}`);
    }

    const customPassthrough = buildCheckoutCustomField(testUid, 'pro', 'monthly', checkout.json.orderId);
    const orderPayload = {
      message_id: `msg_sale_${Date.now()}`,
      message_type: 'ORDER_CREATED',
      timestamp: '2026-10-21T10:00:00Z',
      sale_id: 'sale_2co_sandbox_001',
      customer_email: 'founder@acme.io',
      custom: customPassthrough,
    };
    const rawOrder = JSON.stringify(orderPayload);

    // 4. Reject forged signature with 401
    const forged = await postJson(baseUrl, '/api/payments/webhook/2checkout', orderPayload, {
      'x-signature-256': 'sha256=0000deadbeef',
    });
    if (forged.status !== 401) {
      throw new Error(`Expected 401 on forged HMAC, got ${forged.status}`);
    }

    // 5. Simulate temporary Firestore outage -> gateway receives HTTP 503 so it retries!
    setSubscriptionStoreForTests(null);
    const outageAttempt = await fetch(`${baseUrl}/api/payments/webhook/2checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature-256': signHeader(rawOrder, webhookSecret),
      },
      body: rawOrder,
    });
    if (outageAttempt.status !== 503) {
      throw new Error(`Expected 503 during store outage so gateway retries, got ${outageAttempt.status}`);
    }

    // 6. Restore store -> gateway retry #1 succeeds cleanly (`APPLIED`)
    setSubscriptionStoreForTests(memSubs.store);
    const retrySuccess = await fetch(`${baseUrl}/api/payments/webhook/2checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature-256': signHeader(rawOrder, webhookSecret),
      },
      body: rawOrder,
    });
    const bodySuccess = await retrySuccess.json();
    if (retrySuccess.status !== 200 || bodySuccess.applied !== true || bodySuccess.reason !== 'APPLIED') {
      throw new Error(`Expected retry #1 200 APPLIED, got ${retrySuccess.status}: ${JSON.stringify(bodySuccess)}`);
    }
    if (memSubs.readSubscription(testUid)?.planId !== 'pro') {
      throw new Error('Expected active pro subscription in store');
    }

    // 7. Duplicate gateway retry #2 -> idempotent 200 `DUPLICATE_EVENT`
    const retryDuplicate = await fetch(`${baseUrl}/api/payments/webhook/2checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature-256': signHeader(rawOrder, webhookSecret),
      },
      body: rawOrder,
    });
    const bodyDuplicate = await retryDuplicate.json();
    if (retryDuplicate.status !== 200 || bodyDuplicate.reason !== 'DUPLICATE_EVENT') {
      throw new Error(`Expected DUPLICATE_EVENT, got ${JSON.stringify(bodyDuplicate)}`);
    }

    // 8. Out-of-order stale event timestamp -> safely ignored (`STALE_EVENT`)
    const stalePayload = JSON.stringify({
      message_id: `msg_stale_${Date.now()}`,
      message_type: 'RECURRING_STOPPED',
      timestamp: '2026-10-20T00:00:00Z',
      custom: customPassthrough,
    });
    const staleRes = await fetch(`${baseUrl}/api/payments/webhook/2checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature-256': signHeader(stalePayload, webhookSecret),
      },
      body: stalePayload,
    });
    const staleBody = await staleRes.json();
    if (staleRes.status !== 200 || staleBody.reason !== 'STALE_EVENT' || memSubs.readSubscription(testUid)?.status !== 'active') {
      throw new Error(`Expected STALE_EVENT preserving active pro subscription, got ${JSON.stringify(staleBody)}`);
    }

    // 9. Newer REFUND_ISSUED revokes paid plan back to `free` (`status: "canceled"`)
    const refundPayload = JSON.stringify({
      message_id: `msg_refund_${Date.now()}`,
      message_type: 'REFUND_ISSUED',
      timestamp: '2026-10-22T00:00:00Z',
      custom: customPassthrough,
    });
    const refundRes = await fetch(`${baseUrl}/api/payments/webhook/2checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature-256': signHeader(refundPayload, webhookSecret),
      },
      body: refundPayload,
    });
    const refundBody = await refundRes.json();
    if (refundRes.status !== 200 || refundBody.reason !== 'APPLIED' || memSubs.readSubscription(testUid)?.planId !== 'free') {
      throw new Error(`Expected refund revocation to free tier, got ${JSON.stringify(refundBody)}`);
    }

    console.log(
      JSON.stringify(
        {
          suite: 'catalystlab-payment-sandbox-and-webhook-resilience',
          status: 'passed',
          verifiedChecks: [
            'Q32_fail_closed_when_PAYMENTS_ENABLED_false',
            'Q32_fail_closed_in_prod_without_shared_Upstash_store',
            '2checkout_sandbox_checkout_url_issued',
            'forged_hmac_rejected_401',
            'transient_store_outage_returns_503_triggering_gateway_retry',
            'gateway_retry_activates_pro_entitlement',
            'duplicate_webhook_retry_idempotent_DUPLICATE_EVENT',
            'out_of_order_stale_event_monotonic_STALE_EVENT',
            'refund_issued_revokes_to_free_tier',
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
