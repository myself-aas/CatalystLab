import express, { Request, Response } from 'express';
import { verifyHmacSha256 } from '../../src/lib/webhookSecurity';
import { logger } from '../core/logger';

// Payment gateways (2Checkout / Dodo). Fail-closed: checkout requires real
// credentials, entitlements are never granted from client input, and
// webhooks verify HMAC signatures over the raw body.

export function registerPaymentRoutes(app: express.Express): void {

// --- PAYMENT GATEWAYS: 2Checkout (Verifone) & Dodo Payments (Backup) ---
app.post('/api/payments/create-checkout', express.json(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId, billingCycle, gateway, userId, userEmail } = req.body;
    if (!planId) {
      res.status(400).json({ success: false, error: 'Missing planId' });
      return;
    }

    const selectedGateway = gateway === 'dodopay' ? 'dodopay' : '2checkout';
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const pricingMap: Record<string, { monthly: number; annual: number; name: string }> = {
      starter: { monthly: 9, annual: 90, name: 'Starter Tier' },
      pro: { monthly: 19, annual: 190, name: 'Pro Tier' },
      team: { monthly: 49, annual: 490, name: 'Team Tier' },
      enterprise: { monthly: 99, annual: 990, name: 'Enterprise Tier' }
    };

    const planDetails = pricingMap[planId] || pricingMap.pro;
    const amount = billingCycle === 'annual' ? planDetails.annual : planDetails.monthly;

    if (selectedGateway === '2checkout') {
      // SECURITY (Phase 0): no demo credential fallbacks. A paywall without
      // configured credentials must refuse to start a checkout, not fake one.
      const merchantCode = process.env.V2CHECKOUT_MERCHANT_CODE;
      const isSandbox = process.env.V2CHECKOUT_SANDBOX_MODE !== 'false';
      if (!merchantCode) {
        res.status(503).json({ success: false, error: 'Payments are not configured (missing V2CHECKOUT_MERCHANT_CODE).' });
        return;
      }
      
      res.json({
        success: true,
        gateway: '2checkout',
        mode: isSandbox ? 'sandbox' : 'live',
        checkoutUrl: isSandbox 
          ? `https://sandbox.2checkout.com/checkout/purchase?merchant=${merchantCode}&tpi=1&prod=${planId}&price=${amount}`
          : `https://secure.2checkout.com/checkout/purchase?merchant=${merchantCode}&tpi=1&prod=${planId}&price=${amount}`,
        orderId,
        amount,
        currency: 'USD',
        planId,
        billingCycle
      });
      return;
    } else {
      const apiKey = process.env.DODOPAY_API_KEY;
      const isSandbox = process.env.DODOPAY_SANDBOX_MODE !== 'false';
      if (!apiKey) {
        res.status(503).json({ success: false, error: 'Payments are not configured (missing DODOPAY_API_KEY).' });
        return;
      }

      res.json({
        success: true,
        gateway: 'dodopay',
        mode: isSandbox ? 'sandbox' : 'live',
        checkoutUrl: isSandbox
          ? `https://test.dodopayments.com/pay/${orderId}?amount=${amount}&currency=USD&plan=${planId}`
          : `https://checkout.dodopayments.com/pay/${orderId}?amount=${amount}&currency=USD&plan=${planId}`,
        orderId,
        amount,
        currency: 'USD',
        planId,
        billingCycle
      });
      return;
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Payment initialization failed' });
  }
});

app.post('/api/payments/webhook/2checkout', express.json(), async (req: Request, res: Response): Promise<void> => {
  try {
    // SECURITY (Phase 0): verify HMAC over the raw body before processing.
    const secret = process.env.PAYMENTS_WEBHOOK_SECRET_2CHECKOUT || process.env.V2CHECKOUT_SECRET_KEY || process.env.PAYMENTS_WEBHOOK_SECRET || '';
    const verification = verifyHmacSha256((req as express.Request & { rawBody?: Buffer }).rawBody || '', req.headers['x-signature-256'] as string | undefined, secret);
    if (!verification.valid) {
      logger.warn({ reason: verification.reason }, '[2Checkout Webhook] Rejected');
      res.status(secret ? 401 : 503).json({ status: 'error', error: verification.reason });
      return;
    }
    const payload = req.body;
    logger.info('[2Checkout Webhook Verified]:', payload?.message_type || 'IPN_NOTIFICATION');
    res.status(200).json({ status: 'success', received: true });
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

app.post('/api/payments/webhook/dodopay', express.json(), async (req: Request, res: Response): Promise<void> => {
  try {
    // SECURITY (Phase 0): verify HMAC over the raw body before processing.
    const secret = process.env.PAYMENTS_WEBHOOK_SECRET_DODOPAY || process.env.DODOPAY_WEBHOOK_SECRET || process.env.PAYMENTS_WEBHOOK_SECRET || '';
    const verification = verifyHmacSha256((req as express.Request & { rawBody?: Buffer }).rawBody || '', req.headers['x-signature-256'] as string | undefined, secret);
    if (!verification.valid) {
      logger.warn({ reason: verification.reason }, '[DodoPay Webhook] Rejected');
      res.status(secret ? 401 : 503).json({ status: 'error', error: verification.reason });
      return;
    }
    const payload = req.body;
    logger.info('[DodoPay Webhook Verified]:', payload?.event || 'PAYMENT_SUCCEEDED');
    res.status(200).json({ status: 'success', received: true });
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

app.post('/api/payments/verify', express.json(), async (req: Request, res: Response): Promise<void> => {
  // SECURITY (Phase 0, fail closed): this endpoint previously returned
  // success for ANY payload, letting clients self-activate paid plans.
  // Real verification (gateway checkout-session lookup or verified webhook
  // ledger) lands in the payments phase; until then the answer is always
  // "not configured" and no entitlement is ever granted from client input.
  void req;
  res.status(503).json({
    success: false,
    code: 'PAYMENTS_VERIFICATION_UNAVAILABLE',
    error: 'Payment verification is not configured on this deployment. Entitlements are provisioned exclusively from signed gateway webhooks.'
  });
});

}
