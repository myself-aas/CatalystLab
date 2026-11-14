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
  buildLemonSqueezyCheckoutUrl,
  isGatewayEnabled,
  normalizeLemonSqueezyEvent,
  type ApplyOutcome,
  type GatewayId,
  type GatewayEvent
} from '../core/subscriptions';

// Payment gateways. Owner decisions (2026-10-19):
//   D1  — a signed gateway webhook writes the subscription. The client never
//         activates a paid plan and never reports its own entitlement.
//   D2  — Lemon Squeezy is the single live gateway.
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
  req: Request,
  res: Response
): Promise<void> {
  try {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
    const rawBody = (req as express.Request & { rawBody?: Buffer }).rawBody || '';
    // Lemon Squeezy uses 'X-Signature' header
    const signature = (req.headers['x-signature'] as string) || '';
    const verification = verifyHmacSha256(rawBody, signature, secret);
    if (!verification.valid) {
      logger.warn({ reason: verification.reason }, '[Payments] Lemon Squeezy webhook rejected');
      res.status(secret ? 401 : 503).json({ status: 'error', error: verification.reason });
      return;
    }

    const event = normalizeLemonSqueezyEvent(req.body, Date.now());
    logger.info(
      { eventId: event.eventId, kind: event.kind, hasOwner: Boolean(event.ownerId) },
      '[Payments] Lemon Squeezy webhook verified'
    );

    const outcome = await applyGatewayEvent(event);
    res.status(outcomeStatus(outcome)).json(outcomeBody(outcome));
  } catch (err) {
    logger.error({ err }, '[Payments] Lemon Squeezy webhook processing error');
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

      // Lemon Squeezy is the only supported gateway
      const apiKey = process.env.LEMONSQUEEZY_API_KEY;
      if (!apiKey) {
        res.status(503).json({
          success: false,
          code: 'PAYMENTS_NOT_CONFIGURED',
          error: 'Payments are not configured (missing LEMONSQUEEZY_API_KEY).'
        });
        return;
      }
      const isSandbox = process.env.LEMONSQUEEZY_SANDBOX_MODE !== 'false';
      const checkoutUrl = buildLemonSqueezyCheckoutUrl(price.planId, price.billingCycle, custom, isSandbox);
      if (!checkoutUrl) {
        res.status(503).json({
          success: false,
          code: 'PAYMENTS_NOT_CONFIGURED',
          error: 'Lemon Squeezy checkout URL could not be generated (missing variant ID or store ID).'
        });
        return;
      }

      res.json({
        success: true,
        gateway: 'lemonsqueezy',
        mode: isSandbox ? 'sandbox' : 'live',
        checkoutUrl,
        orderId,
        amount: price.amount,
        currency: price.currency,
        planId: price.planId,
        planName: price.name,
        billingCycle: price.billingCycle
      });
      return;
    } catch (err: unknown) {
      logger.error({ err }, '[Payments] Checkout initialization failed');
      res.status(500).json({ success: false, error: 'Payment initialization failed' });
    }
  });

  app.post('/api/payments/webhook/lemonsqueezy', express.json(), async (req: Request, res: Response): Promise<void> => {
    await handleGatewayWebhook(req, res);
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
