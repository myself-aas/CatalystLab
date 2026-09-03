import express, { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../core/logger';
import { getAttachedIdentity } from '../../src/lib/serverAuth';

// Phase 3 (item 15): client error-reporting sink. The browser logger batches
// warn/error events and beacons them here; each event is schema-validated,
// size-capped, rate-limited per identity/IP, and logged as structured JSON
// (no client PII: the facade redacts emails before sending).

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

const hits = new Map<string, number[]>();
function allow(identifier: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const recent = (hits.get(identifier) || []).filter((t) => t > windowStart);
  if (recent.length >= RATE_MAX_REQUESTS) {
    hits.set(identifier, recent);
    return false;
  }
  recent.push(now);
  hits.set(identifier, recent);
  // Opportunistic GC to keep the map bounded.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => t <= windowStart)) hits.delete(key);
    }
  }
  return true;
}

export function registerClientLogRoutes(app: express.Express): void {
  app.post('/api/client-logs', express.json({ limit: '64kb' }), (req: Request, res: Response) => {
    const identity = getAttachedIdentity(req);
    const forwarded =
      process.env.TRUST_PROXY === 'true' && typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : '';
    const identifier = identity?.uid || forwarded || req.socket.remoteAddress || 'unknown';

    if (!allow(identifier)) {
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
      } else {
        logger.warn(logContext, event.message);
      }
    }

    res.status(202).json({ success: true, accepted: parsed.data.events.length });
  });
}
