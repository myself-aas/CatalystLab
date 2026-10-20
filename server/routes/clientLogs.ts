import express, { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../core/logger';
import { getAttachedIdentity } from '../../src/lib/serverAuth';
import { captureClientError } from '../core/errorTracking';
import { clientIp } from '../core/rateLimit';
import { checkSharedWindowLimit } from '../core/sharedLimiter';

// Phase 3 (item 15) + Phase 4 (4.1/4.2): client error-reporting sink.
// Schema-validated, size-capped, shared-Redis rate-limited per identity/IP,
// and relayed through PII scrubbing to Sentry when configured.

const clientLogEventSchema = z.object({
  level: z.enum(['warn', 'error']),
  message: z.string().max(2000),
  stack: z.string().max(8000).optional(),
  href: z.string().max(500).optional(),
  userAgent: z.string().max(400).optional(),
  ts: z.number().int().nonnegative().optional(),
  context: z
    .record(z.string().max(64), z.union([z.string().max(500), z.number(), z.boolean(), z.null()]))
    .optional()
});

const clientLogPayloadSchema = z.object({
  events: z.array(clientLogEventSchema).min(1).max(25)
});

const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX_REQUESTS = 30;

export function registerClientLogRoutes(app: express.Express): void {
  app.post('/api/client-logs', express.json({ limit: '64kb' }), async (req: Request, res: Response) => {
    const identity = getAttachedIdentity(req);
    const identifier = identity?.uid ? `uid_${identity.uid}` : `ip_${clientIp(req)}`;

    let allowed = false;
    try {
      const decision = await checkSharedWindowLimit({
        namespace: 'client-logs',
        identifier,
        maxRequests: RATE_MAX_REQUESTS,
        windowMs: RATE_WINDOW_MS
      });
      allowed = decision.allowed;
    } catch {
      res.status(503).json({ success: false, error: 'Client log limiter unavailable.' });
      return;
    }

    if (!allowed) {
      res.status(429).json({ success: false, error: 'Too many log reports' });
      return;
    }

    const parsed = clientLogPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid client log payload' });
      return;
    }

    for (const event of parsed.data.events) {
      const logContext = {
        client: true,
        requestId: req.requestId,
        identifier,
        href: event.href,
        userAgent: event.userAgent,
        ts: event.ts,
        context: event.context
      };
      if (event.level === 'error') {
        logger.error(logContext, event.message + (event.stack ? `\n${event.stack}` : ''));
        captureClientError(event);
      } else {
        logger.warn(logContext, event.message);
      }
    }

    res.status(202).json({ success: true, accepted: parsed.data.events.length });
  });
}
