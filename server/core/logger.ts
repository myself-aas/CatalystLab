import pino from 'pino';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// Phase 3 (item 15): structured JSON logging with request IDs and header
// redaction. One line per request; level escalates with status code. All
// server console.* calls are replaced by this logger.

// Header/material that must never reach the logs.
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.headers["x-user-email"]',
  'req.headers["x-user-id"]',
  'password',
  '*.password',
  'token',
  '*.token',
  'refreshToken',
  '*.refreshToken'
];

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  redact: { paths: REDACT_PATHS, censor: '[redacted]' },
  base: { service: 'catalystlab-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  // stdSerializers project req/res down to method/url/headers/statusCode;
  // the redact paths above then strip credential headers. Never log the raw
  // Express objects (they carry body buffers, sockets, and internals).
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Correlation ID assigned (or honored from `x-request-id`) per request. */
      requestId?: string;
    }
  }
}

const REQ_ID_HEADER = 'x-request-id';

/**
 * Assigns a correlation ID to every request (honoring an inbound
 * `x-request-id` for trace propagation) and emits one structured log line
 * when the response finishes, with duration and status.
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const inbound = req.headers[REQ_ID_HEADER];
  const requestId = (typeof inbound === 'string' && /^[\w.-]{8,128}$/.test(inbound))
    ? inbound
    : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader(REQ_ID_HEADER, requestId);

  const startAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startAt) / 1e6;
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    // stdSerializers pick method/url/headers/statusCode; redaction applies on top.
    logger[level](
      {
        requestId,
        durationMs: Math.round(durationMs * 100) / 100,
        req,
        res,
        identity: (req as Request & { verifiedIdentity?: { plan: string; uid: string } }).verifiedIdentity
          ? {
              tier: (req as Request & { verifiedIdentity: { plan: string } }).verifiedIdentity.plan,
              identifier: (req as Request & { verifiedIdentity: { uid: string } }).verifiedIdentity.uid
            }
          : undefined
      },
      `${req.method} ${req.originalUrl} ${status}`
    );
  });
  next();
}
