import crypto from 'crypto';

/**
 * Result of a webhook signature verification attempt.
 */
export interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Verifies an HMAC-SHA256 webhook signature over the RAW request body.
 *
 * Expects GitHub-style signatures: ``sha256=<hex digest>``. The comparison is
 * constant-time (``crypto.timingSafeEqual``) and length-guarded so arbitrary
 * attacker input cannot leak timing information or crash the comparison.
 *
 * IMPORTANT: the signature must be computed over the raw bytes exactly as
 * received. Use the buffer captured by the body-parser ``verify`` callback
 * (``req.rawBody``), not a re-serialized JSON object.
 *
 * @param rawBody Raw request body buffer (or string) the signature was computed over.
 * @param signatureHeader Value of the ``x-hub-signature-256`` style header.
 * @param secret The per-repo / per-gateway webhook secret.
 */
export function verifyHmacSha256(
  rawBody: Buffer | string,
  signatureHeader: string | undefined | null,
  secret: string
): WebhookVerificationResult {
  if (!secret) {
    return { valid: false, reason: 'Webhook secret is not configured on the server.' };
  }
  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return { valid: false, reason: 'Missing webhook signature header.' };
  }

  const expected =
    'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(signatureHeader.trim(), 'utf8');

  if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
    return { valid: false, reason: 'Webhook signature mismatch.' };
  }
  return { valid: true };
}

/**
 * Signs a payload with HMAC-SHA256 in the same ``sha256=<hex>`` format.
 * Used by tests and local tooling to construct verifiable webhook requests.
 */
export function signHmacSha256(rawBody: Buffer | string, secret: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}
