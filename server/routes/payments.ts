import express, { Request, Response } from 'express';
import { verifyHmacSha256 } from '../../src/lib/webhookSecurity';
import { logger } from '../core/logger';
import { priceForPlan } from '../core/pricing';
import {
  activeGateway,
  applyGatewayEvent,
  buildCheckoutCustomField,
  isGatewayEnabled,
  normalize2CheckoutEvent,
  normalizeDodoEvent,
  type ApplyOutcome,
  type GatewayEvent,
  type GatewayId
} from '../core/subscriptions';

// Payment gateways. Owner decisions (2026-10-19):
//   D1 — a signed gateway webhook writes the subscription. The client never
//        activates a paid plan and never reports its own entitlement.
//   D2 — 2Checkout is the single live gateway; Dodo Payments stays in the code
//        base but is disabled unless PAYMENT_GATEWAY=dodopay is set.
//   2.1 — prices come from `src/data/pricingData.ts` (server/core/pricing.ts),
//        the same source the pricing page renders.
// Everything fails closed: no credentials ⇒ no checkout, no durable write ⇒
// no entitlement, unknown plan ⇒ rejected.

/** Maps an application outcome onto the HTTP status the gateway should see. */
function outcomeStatus(outcome: ApplyOutcome): number {
  switch (outcome.reason) {
    case 'APPLIED':
    case 'DUPLICATE_EVENT':
    case 'STALE_EVENT':
    case 'IGNORED_EVENT':
      // Acknowledged: retrying would not change the result.
      return 200;
    case 'MISSING_OWNER':
    case 'MISSING_PLAN':
      // Signature valid but the payload cannot be attributed; a retry of the
      // same bytes will not help, so report it as unprocessable.
      return 422;
    case 'STORE_UNAVAILABLE':
    default:
      // Nothing was written: make the gateway retry.
      return 503;
  }
}

function outcomeBody(outcome: ApplyOutcome): Record<string, unknown> {
  const base: Record<string, unknown> = {
    status: outcome.applied || outcomeStatus(outcome) === 200 ? 'success' : 'error',
    received: true,
    applied: outcome.applied,
    reason: outcome.reason
  };
  if (outcome.detail) base.detail = outcome.detail;
  if (outcome.subscription) {
    // Only the fields a gateway or an operator needs; never the full document.
    base.subscription = {
      ownerId: outcome.subscription.ownerId,
      planId: outcome.subscription.planId,
      status: outcome.subscription.status,
      billingCycle: outcome.subscription.billingCycle,
      currentPeriodEndsAt: outcome.subscription.currentPeriodEndsAt
    };
  }
  return base;
}

async function handleGatewayWebhook(
  gateway: GatewayId,
  req: Request,
  res: Response,
  normalize: (payload: unknown, receivedAt: number) => GatewayEvent
): Promise<void> {
  try {
    if (!isGatewayEnabled(gateway)) {
      logger.warn({ gateway, active: activeGateway() }, '[Payments] Webhook for a disabled gateway');
      res.status(503).json({
        status: 'error',
        code: 'GATEWAY_DISABLED',
        error: `The ${gateway} gateway is disabled on this deployment. ${activeGateway()} is the single live gateway (owner decision D2).`
      });
      return;
    }

    // Verify the HMAC over the raw body before anything else is touched.
    const secret =
      (gateway === '2checkout'
        ? process.env.PAYMENTS_WEBHOOK_SECRET_2CHECKOUT || process.env.V2CHECKOUT_SECRET_KEY
        : process.env.PAYMENTS_WEBHOOK_SECRET_DODOPAY || process.env.DODOPAY_WEBHOOK_SECRET) ||
      process.env.PAYMENT_SIGNING_SECRET ||
      process.env.PAYMENTS_WEBHOOK_SECRET ||
      '';
    const rawBody = (req as express.Request & { rawBody?: Buffer }).rawBody || '';
    const verification = verifyHmacSha256(rawBody, req.headers['x-signature-256'] as string | undefined, secret);
    if (!verification.valid) {
      logger.warn({ gateway, reason: verification.reason }, '[Payments] Webhook rejected');
      res.status(secret ? 401 : 503).json({ status: 'error', error: verification.reason });
      return;
    }

    const event = normalize(req.body, Date.now());
    logger.info(
      { gateway, eventId: event.eventId, kind: event.kind, hasOwner: Boolean(event.ownerId) },
      '[Payments] Webhook verified'
    );

    const outcome = await applyGatewayEvent(event);
    res.status(outcomeStatus(outcome)).json(outcomeBody(outcome));
  } catch (err) {
    logger.error({ err, gateway }, '[Payments] Webhook processing error');
    res.status(500).json({ status: 'error', error: 'Webhook processing error' });
  }
}

export function registerPaymentRoutes(app: express.Express): void {

// --- CHECKOUT: 2Checkout (Verifone) is the live gateway (D2) ---
app.post('/api/payments/create-checkout', express.json(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId, billingCycle, gateway, userId, userEmail } = req.body || {};
    if (!planId) {
      res.status(400).json({ success: false, error: 'Missing planId' });
      return;
    }

    // 2.3: an unknown or tampered planId is rejected instead of silently
    // falling back to `pro`.
    const price = priceForPlan(planId, billingCycle);
    if (!price) {
      res.status(400).json({
        success: false,
        code: 'UNKNOWN_PLAN',
        error: `"${String(planId)}" is not a purchasable plan. See GET /api/plans for the catalog.`
      });
      return;
    }

    const live = activeGateway();
    // D2: the client cannot choose a gateway that is not live.
    const requested = typeof gateway === 'string' ? gateway.toLowerCase() : undefined;
    if (requested && requested !== live) {
      res.status(400).json({
        success: false,
        code: 'GATEWAY_NOT_AVAILABLE',
        error: `The "${requested}" gateway is disabled on this deployment. ${live} is the single live gateway.`
      });
      return;
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    // Merchant passthrough: the webhook attributes the payment from these
    // signed bytes, never from client input at webhook time (D1).
    const custom = buildCheckoutCustomField(
      typeof userId === 'string' ? userId : undefined,
      price.planId,
      price.billingCycle,
      orderId
    );

    if (live === '2checkout') {
      // SECURITY (Phase 0): no demo credential fallbacks. A paywall without
      // configured credentials must refuse to start a checkout, not fake one.
      const merchantCode = process.env.V2CHECKOUT_MERCHANT_CODE;
      if (!merchantCode) {
        res.status(503).json({
          success: false,
          code: 'PAYMENTS_NOT_CONFIGURED',
          error: 'Payments are not configured (missing V2CHECKOUT_MERCHANT_CODE).'
        });
        return;
      }
      const isSandbox = process.env.V2CHECKOUT_SANDBOX_MODE !== 'false';
      const host = isSandbox ? 'https://sandbox.2checkout.com' : 'https://secure.2checkout.com';
      const params = new URLSearchParams({
        merchant: merchantCode,
        tpi: '1',
        prod: price.planId,
        price: String(price.amount),
        currency: price.currency,
        custom,
        merchant_order_id: orderId,
        lang: 'en'
      });
      if (typeof userEmail === 'string' && userEmail.includes('@')) {
        params.set('email', userEmail);
      }

      res.json({
        success: true,
        gateway: '2checkout',
        mode: isSandbox ? 'sandbox' : 'live',
        checkoutUrl: `${host}/checkout/purchase?${params.toString()}`,
        orderId,
        amount: price.amount,
        currency: price.currency,
        planId: price.planId,
        planName: price.name,
        billingCycle: price.billingCycle
      });
      return;
    }

    // Dodo Payments: present in code, disabled unless it is the live gateway.
    const apiKey = process.env.DODOPAY_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        success: false,
        code: 'PAYMENTS_NOT_CONFIGURED',
        error: 'Payments are not configured (missing DODOPAY_API_KEY).'
      });
      return;
    }
    const isSandbox = process.env.DODOPAY_SANDBOX_MODE !== 'false';
    const host = isSandbox ? 'https://test.dodopayments.com' : 'https://checkout.dodopayments.com';
    const params = new URLSearchParams({
      amount: String(price.amount),
      currency: price.currency,
      plan: price.planId,
      custom,
      merchant_order_id: orderId
    });

    res.json({
      success: true,
      gateway: 'dodopay',
      mode: isSandbox ? 'sandbox' : 'live',
      checkoutUrl: `${host}/pay/${orderId}?${params.toString()}`,
      orderId,
      amount: price.amount,
      currency: price.currency,
      planId: price.planId,
      planName: price.name,
      billingCycle: price.billingCycle
    });
  } catch (err: any) {
    logger.error({ err }, '[Payments] Checkout initialization failed');
    res.status(500).json({ success: false, error: err.message || 'Payment initialization failed' });
  }
});

// --- WEBHOOKS: the only writer of a paid subscription (D1) ---
app.post('/api/payments/webhook/2checkout', express.json(), async (req: Request, res: Response): Promise<void> => {
  await handleGatewayWebhook('2checkout', req, res, (payload, receivedAt) => normalize2CheckoutEvent(payload, receivedAt));
});

app.post('/api/payments/webhook/dodopay', express.json(), async (req: Request, res: Response): Promise<void> => {
  await handleGatewayWebhook('dodopay', req, res, (payload, receivedAt) => normalizeDodoEvent(payload, receivedAt));
});

app.post('/api/payments/verify', express.json(), async (req: Request, res: Response): Promise<void> => {
  // SECURITY (Phase 0, fail closed): this endpoint previously returned
  // success for ANY payload, letting clients self-activate paid plans.
  // Entitlements are provisioned exclusively from signed gateway webhooks
  // (D1) and read back from the subscription of record.
  void req;
  res.status(503).json({
    success: false,
    code: 'PAYMENTS_VERIFICATION_UNAVAILABLE',
    error: 'Payment verification is not configured on this deployment. Entitlements are provisioned exclusively from signed gateway webhooks and read from GET /api/v1/users/me.'
  });
});

}
