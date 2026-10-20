import pino from 'pino';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// Phase 3 (Plan item 3.12): structured JSON logging with correlation IDs and
// strict allowlist header projection.
//
// SECURITY (Plan 3.12): Never use `pino.stdSerializers.req` / `.res` directly:
// stdSerializers copy the ENTIRE `req.headers` and `res.headers` bags (~2 KB
// per request), exposing custom auth headers, webhook signatures, proxy client
// IPs, `set-cookie`, and browser fingerprint headers. Instead, custom allowlist
// serializers project ONLY non-sensitive operational fields, backed by path
// redaction as defense-in-depth for ad-hoc log objects.

export const ALLOWED_REQUEST_HEADERS = [
  'host',
  'content-type',
  'content-length',
  'user-agent',
  'accept',
  'x-request-id'
] as const;

export const ALLOWED_RESPONSE_HEADERS = [
  'content-type',
  'content-length',
  'cache-control',
  'x-request-id',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'retry-after'
] as const;

const SENSITIVE_QUERY_KEYS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'api_key',
  'apikey',
  'key',
  'secret',
  'password',
  'passwd',
  'signature',
  'sig',
  'code',
  'oobcode'
]);

/** Redacts credential-bearing query parameters before logging a request URL. */
export function sanitizeLoggedUrl(rawUrl: string | undefined): string {
  if (!rawUrl) return '/';
  const qIndex = rawUrl.indexOf('?');
  if (qIndex === -1) return rawUrl;
  const pathname = rawUrl.slice(0, qIndex);
  const rawQuery = rawUrl.slice(qIndex + 1);
  try {
    const params = new URLSearchParams(rawQuery);
    let mutated = false;
    for (const key of Array.from(params.keys())) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
        params.set(key, '[redacted]');
        mutated = true;
      }
    }
    return mutated ? `${pathname}?${params.toString()}` : rawUrl;
  } catch {
    return pathname;
  }
}

function projectAllowlistedHeaders(
  source: Record<string, unknown> | undefined,
  allowlist: readonly string[]
): Record<string, string> {
  const projected: Record<string, string> = {};
  if (!source || typeof source !== 'object') return projected;
  for (const name of allowlist) {
    const raw = source[name] ?? source[name.toLowerCase()];
    if (typeof raw === 'string' && raw.length > 0) {
      projected[name] = raw.slice(0, 512);
    } else if (Array.isArray(raw) && raw.length > 0) {
      projected[name] = raw.map(String).join(', ').slice(0, 512);
    } else if (typeof raw === 'number') {
      projected[name] = String(raw);
    }
  }
  return projected;
}

export function serializeRequest(req: Partial<Request> & { headers?: Record<string, unknown>; id?: string }): {
  id?: string;
  method?: string;
  url: string;
  headers: Record<string, string>;
} {
  return {
    id: req.requestId ?? req.id,
    method: req.method,
    url: sanitizeLoggedUrl(req.originalUrl || req.url),
    headers: projectAllowlistedHeaders(req.headers as Record<string, unknown> | undefined, ALLOWED_REQUEST_HEADERS)
  };
}

export function serializeResponse(res: Partial<Response> & { getHeaders?: () => Record<string, unknown> }): {
  statusCode?: number;
  headers: Record<string, string>;
} {
  const rawHeaders = typeof res.getHeaders === 'function' ? res.getHeaders() : undefined;
  return {
    statusCode: res.statusCode,
    headers: projectAllowlistedHeaders(rawHeaders, ALLOWED_RESPONSE_HEADERS)
  };
}

// Defense-in-depth path redaction for any manual `logger.info({ ... })` call.
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.headers["x-user-email"]',
  'req.headers["x-user-id"]',
  'res.headers["set-cookie"]',
  'headers.authorization',
  'headers.cookie',
  'headers["set-cookie"]',
  'headers["x-api-key"]',
  'authorization',
  '*.authorization',
  'cookie',
  '*.cookie',
  'password',
  '*.password',
  'secret',
  '*.secret',
  'token',
  '*.token',
  'refreshToken',
  '*.refreshToken'
];

export function createLogger(destination?: pino.DestinationStream) {
  return pino(
    {
      level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      redact: { paths: REDACT_PATHS, censor: '[redacted]' },
      base: { service: 'catalystlab-api' },
      timestamp: pino.stdTimeFunctions.isoTime,
      serializers: {
        req: serializeRequest,
        res: serializeResponse
      }
    },
    destination
  );
}

export const logger = createLogger();

declare global {
  namespace Express {
    interface Request {
      /** Correlation ID assigned (or honored from `x-request-id`) per request. */
      requestId?: string;
    }
  }
}

const REQ_ID_HEADER = 'x-request-id';

const ASSET_OR_DEV_MODULE_REGEX = /\.(tsx?|jsx?|css|map|ico|png|jpe?g|svg|webp|woff2?|ttf|eot)(\?.*)?$/i;

function isAssetOrDevModule(url: string): boolean {
  return (
    url.startsWith('/src/') ||
    url.startsWith('/@') ||
    url.startsWith('/node_modules/') ||
    url.includes('/.vite/') ||
    ASSET_OR_DEV_MODULE_REGEX.test(url)
  );
}

/**
 * Assigns a correlation ID to every request (honoring an inbound
 * `x-request-id` for trace propagation) and emits one structured log line
 * when the response finishes, with duration and status.
 */
export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  logInstance: pino.Logger = logger
): void {
  const inbound = req.headers[REQ_ID_HEADER];
  const requestId = typeof inbound === 'string' && /^[\w.-]{8,128}$/.test(inbound)
    ? inbound
    : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader(REQ_ID_HEADER, requestId);

  // Skip verbose request logging for Vite dev bundle modules and static assets
  if (isAssetOrDevModule(req.originalUrl || req.url || '')) {
    next();
    return;
  }

  const startAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startAt) / 1e6;
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    logInstance[level](
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
      `${req.method} ${sanitizeLoggedUrl(req.originalUrl || req.url)} ${status}`
    );
  });
  next();
}
