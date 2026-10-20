import crypto from 'crypto';
import express, { Request, Response } from 'express';
import { verifyHmacSha256 } from '../../src/lib/webhookSecurity';
import { logger } from '../core/logger';
import { isDistributedQuotaEnabled } from '../core/dailyQuota';
import { priceForPlan } from '../core/pricing';
import {
  activeGateway,
  applyGatewayEvent,
  buildCheckoutCustomField,
  isGatewayEnabled,
  normalize2CheckoutEvent,
  normalizeDodoEvent,
  type ApplyOutcome,
  type GatewayId,
  type GatewayEvent
} from '../core/subscriptions';

// Payment gateways. Owner decisions (2026-10-19):
//   D1  — a signed gateway webhook writes the subscription. The client never
//         activates a paid plan and never reports its own entitlement.
//   D2  — 2Checkout is the single live gateway; Dodo Payments stays in the code
//         base but is disabled unless PAYMENT_GATEWAY=dodopay is set.
//   Q32 — Paid checkout stays off until shared distributed state (4.1),
//         scheduled backups + verified restore (4.6), and webhook retry tests
//         are enabled on the live host via `PAYMENTS_ENABLED=true`.
//   2.1 — prices come from `src/data/pricingData.ts` (server/core/pricing.ts),
//         the same source the pricing page renders.

export function checkCheckoutReadiness():
  | { ready: true }
  | { ready: false; code: 'PAYMENTS_DISABLED' | 'PAYMENTS_SHARED_STATE_REQUIRED'; error: string } {
  const flag = (process.env.PAYMENTS_ENABLED || '').trim().toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'off') {
    return {
      ready: false,
      code: 'PAYMENTS_DISABLED',
      error: 'Paid checkout is explicitly disabled (PAYMENTS_ENABLED=false, owner decision Q32).'
    };
  }
  if (process.env.NODE_ENV === 'production') {
    if (flag !== 'true') {
      return {
        ready: false,
        code: 'PAYMENTS_DISABLED',
        error: 'Paid checkout is disabled in production until PAYMENTS_ENABLED=true is set after Q32 prerequisites.'
      };
    }
    if (!isDistributedQuotaEnabled()) {
      return {
        ready: false,
        code: 'PAYMENTS_SHARED_STATE_REQUIRED',
        error: 'Paid checkout requires shared distributed quota state (Upstash Redis) in production (plan 4.1 / Q32).'
      };
    }
  }
  return { ready: true };
}

/** Maps an application outcome onto the HTTP status the gateway should see. */
function outcomeStatus(outcome: ApplyOutcome): number {
  switch (outcome.reason) {
    case 'APPLIED':
    case 'DUPLICATE_EVENT':
    case 'STALE_EVENT':
    case 'IGNORED_EVENT':
      return 200;
    case 'MISSING_OWNER':
    case 'MISSING_PLAN':
      return 422;
    case 'STORE_UNAVAILABLE':
    default:
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
  app.post('/api/payments/create-checkout', express.json(), async (req: Request, res: Response): Promise<void> => {
    try {
      const { planId, billingCycle, gateway, userId, userEmail } = req.body || {};
      if (!planId) {
        res.status(400).json({ success: false, error: 'Missing planId' });
        return;
      }

      const price = priceForPlan(planId, billingCycle);
      if (!price) {
        res.status(400).json({
          success: false,
          code: 'UNKNOWN_PLAN',
          error: `"${String(planId)}" is not a purchasable plan. See GET /api/plans for the catalog.`
        });
      }

      if (!price) return;

      const live = activeGateway();
      const requested = typeof gateway === 'string' ? gateway.toLowerCase() : undefined;
      if (requested && requested !== live) {
        res.status(400).json({
          success: false,
          code: 'GATEWAY_NOT_AVAILABLE',
          error: `The "${requested}" gateway is disabled on this deployment. ${live} is the single live gateway.`
        });
        return;
      }

      const readiness = checkCheckoutReadiness();
      if (!readiness.ready) {
        res.status(503).json({
          success: false,
          code: readiness.code,
          error: readiness.error
        });
        return;
      }

      const orderId = `ord_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const custom = buildCheckoutCustomField(
        typeof userId === 'string' ? userId : undefined,
        price.planId,
        price.billingCycle,
        orderId
      );

      if (live === '2checkout') {
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
    } catch (err: unknown) {
      logger.error({ err }, '[Payments] Checkout initialization failed');
      res.status(500).json({ success: false, error: 'Payment initialization failed' });
    }
  });

  app.post('/api/payments/webhook/2checkout', express.json(), async (req: Request, res: Response): Promise<void> => {
    await handleGatewayWebhook('2checkout', req, res, (payload, receivedAt) => normalize2CheckoutEvent(payload, receivedAt));
  });

  app.post('/api/payments/webhook/dodopay', express.json(), async (req: Request, res: Response): Promise<void> => {
    await handleGatewayWebhook('dodopay', req, res, (payload, receivedAt) => normalizeDodoEvent(payload, receivedAt));
  });

  app.post('/api/payments/verify', express.json(), async (req: Request, res: Response): Promise<void> => {
    void req;
    res.status(503).json({
      success: false,
      code: 'PAYMENTS_VERIFICATION_UNAVAILABLE',
      error: 'Payment verification is not configured on this deployment. Entitlements are provisioned exclusively from signed gateway webhooks and read from GET /api/v1/users/me.'
    });
  });
}
