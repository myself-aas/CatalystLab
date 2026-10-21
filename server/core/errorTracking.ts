import * as Sentry from '@sentry/node';
import { logger } from './logger';

// D10: error tracking is Sentry, with PII scrubbing, and it is a listed
// subprocessor in the privacy policy. Nothing here is active without a DSN:
// the owner runs a $0 stack, so Sentry stays off until SENTRY_DSN is set, and
// every code path must behave identically when it is not.
//
// Two sources feed it:
//   1. server-side exceptions (Express error handler, uncaught rejections)
//   2. browser errors relayed by POST /api/client-logs (server/routes/clientLogs.ts)
//      The browser never talks to Sentry directly, so no DSN or SDK ships in
//      the client bundle and the scrubber below sees every event once.

/** Matches an email address, so it can be removed from messages and stacks. */
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
/** Matches an IPv4 address with an optional port. */
const IPV4_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?\b/g;
/** Matches a bearer token, API key or signature in a header-ish string. */
const SECRET_PATTERN = /\b(?:Bearer\s+[A-Za-z0-9._\-]+|catalyst_[A-Za-z0-9]+|sha256=[A-Fa-f0-9]{8,})\b/g;
/** Headers that never leave the process. */
const REDACTED_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-api-key', 'proxy-authorization'];

let enabled = false;
let initialized = false;

/** True once Sentry has been initialised with a usable DSN. */
export function isErrorTrackingEnabled(): boolean {
  return enabled;
}

/** Removes emails, IPv4 addresses and credentials from free text. */
export function scrubSensitiveText(text: string): string {
  return text
    .replace(SECRET_PATTERN, '[redacted-credential]')
    .replace(EMAIL_PATTERN, '[redacted-email]')
    .replace(IPV4_PATTERN, '[redacted-ip]');
}

function scrubValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[truncated]';
  if (typeof value === 'string') return scrubSensitiveText(value);
  if (Array.isArray(value)) return value.map((entry) => scrubValue(entry, depth + 1));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (REDACTED_HEADERS.includes(key.toLowerCase())) continue;
      out[key] = scrubValue(entry, depth + 1);
    }
    return out;
  }
  return value;
}

/**
 * Strips everything that could identify a person from an event before it is
 * sent upstream. Applied to server-captured events through `beforeSend` and to
 * relayed browser events before `captureClientError` forwards them.
 */
export function scrubEvent<T extends Record<string, unknown>>(event: T): T {
  const scrubbed = { ...event } as Record<string, unknown>;

  if (typeof scrubbed.message === 'string') scrubbed.message = scrubSensitiveText(scrubbed.message);

  const request = scrubbed.request as Record<string, unknown> | undefined;
  if (request && typeof request === 'object') {
    const cleanRequest: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(request)) {
      // The IP is never forwarded: Sentry would otherwise store it even with
      // dataCollection.userInfo disabled once a value is present.
      if (key === 'ip_address' || key === 'cookies' || key === 'headers') continue;
      cleanRequest[key] = scrubValue(value);
    }
    scrubbed.request = cleanRequest;
  }

  if (scrubbed.user) delete scrubbed.user;
  if (scrubbed.extra) scrubbed.extra = scrubValue(scrubbed.extra);
  if (typeof scrubbed.transaction === 'string') scrubbed.transaction = scrubSensitiveText(scrubbed.transaction);

  const exception = scrubbed.exception as { values?: Array<Record<string, unknown>> } | undefined;
  if (exception && Array.isArray(exception.values)) {
    exception.values = exception.values.map((entry) => ({
      ...entry,
      ...(typeof entry.value === 'string' ? { value: scrubSensitiveText(entry.value) } : {}),
    }));
  }

  return scrubbed as T;
}

export interface ClientErrorPayload {
  message: string;
  stack?: string;
  href?: string;
  userAgent?: string;
  ts?: number;
  context?: Record<string, string | number | boolean | null>;
}

/**
 * Forwards a browser error to Sentry as its own event. Returns false when
 * tracking is disabled, so callers can skip work and tests can assert the
 * offline behaviour.
 */
export function captureClientError(payload: ClientErrorPayload): boolean {
  if (!enabled) return false;
  const scrubbed = scrubEvent({
    message: payload.message,
    extra: payload.context ? scrubValue(payload.context) : undefined,
    request: { url: payload.href, headers: { 'user-agent': payload.userAgent } },
    level: 'error',
    platform: 'javascript',
    timestamp: typeof payload.ts === 'number' ? Math.floor(payload.ts / 1000) : undefined,
  } as Record<string, unknown>);

  Sentry.captureEvent({
    message: String(scrubbed.message ?? 'client error').slice(0, 2000),
    level: 'error',
    platform: 'javascript',
    extra: scrubbed.extra as Record<string, unknown> | undefined,
    request: scrubbed.request as { url?: string } | undefined,
    ...(payload.stack ? { exception: { values: [{ type: 'ClientError', value: payload.stack.slice(0, 8000) }] } } : {}),
  });
  return true;
}

/** Forwards a server-side exception. Safe to call when tracking is disabled. */
export function captureException(error: unknown, context?: Record<string, unknown>): boolean {
  if (!enabled) return false;
  Sentry.captureException(error, context ? { extra: scrubValue(context) as Record<string, unknown> } : undefined);
  return true;
}

/**
 * Initialises Sentry from the environment. Idempotent: calling it twice (for
 * example from a test and from startup) does not re-initialise the SDK.
 */
export function initErrorTracking(env: NodeJS.ProcessEnv = process.env): boolean {
  const dsn = (env.SENTRY_DSN || '').trim();
  if (!dsn) {
    enabled = false;
    if (!initialized) {
      initialized = true;
      logger.debug({ service: 'catalystlab-api' }, '[errors] SENTRY_DSN not set; error tracking disabled');
    }
    return false;
  }

  const tracesSampleRate = Number.parseFloat(env.SENTRY_TRACES_SAMPLE_RATE || '0');
  Sentry.init({
    dsn,
    environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV || 'production',
    release: env.SENTRY_RELEASE || env.npm_package_version || undefined,
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? Math.min(Math.max(tracesSampleRate, 0), 1) : 0,
    // Never let the SDK collect user info, IPs, cookies, headers, bodies, query
    // params, database payloads or local variables on its own (D10). Sentry v11
    // replaced `sendDefaultPii` with `dataCollection`, where omitted categories
    // default to collecting data.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
    },
    maxBreadcrumbs: 50,
    beforeSend: (event) => scrubEvent(event as unknown as Record<string, unknown>) as unknown as Sentry.ErrorEvent,
  });
  enabled = true;
  initialized = true;
  logger.info(
    { service: 'catalystlab-api', environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV || 'production' },
    '[errors] Sentry error tracking enabled with PII scrubbing'
  );
  return true;
}

/**
 * Captures process-level failures that would otherwise die silently, so a
 * crash shows up in the tracker before the host restarts the process.
 */
export function installProcessErrorHandlers(): void {
  process.on('unhandledRejection', (reason) => {
    captureException(reason, { source: 'unhandledRejection' });
    logger.error({ err: reason }, '[errors] unhandled rejection');
  });
  process.on('uncaughtException', (error) => {
    captureException(error, { source: 'uncaughtException' });
    logger.fatal({ err: error }, '[errors] uncaught exception');
  });
}

/** Test hook: forget the initialised state so a suite can enable tracking itself. */
export function resetErrorTrackingForTests(): void {
  enabled = false;
  initialized = false;
}
