// Phase 3 (item 15): structured client logging facade.
//
// Replaces raw console.* calls across the SPA. In development every call is a
// transparent console passthrough (args intact, so tests that spy on console
// keep working). In production warn/error events are additionally redacted,
// deduplicated, capped, and batched to POST /api/client-logs, giving the
// server-side a structured error-reporting boundary without third-party SDKs.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface ClientLogEvent {
  level: 'warn' | 'error';
  message: string;
  stack?: string;
  href?: string;
  userAgent?: string;
  ts?: number;
  context?: Record<string, string | number | boolean | null>;
}

const ENDPOINT = '/api/client-logs';
const FLUSH_INTERVAL_MS = 10_000;
const MAX_QUEUE = 30;
const MAX_SESSION_EVENTS = 50;
const MAX_DUPLICATES_PER_KEY = 3;

const isDev: boolean = import.meta.env.DEV;

let queue: ClientLogEvent[] = [];
let sessionEventCount = 0;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const dedupeCounts = new Map<string, number>();

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

/** Strip obvious PII (email addresses) before anything leaves the browser. */
function redact(text: string): string {
  return text.replace(EMAIL_RE, '[redacted-email]');
}

function describe(first: unknown): string {
  if (first instanceof Error) return first.message;
  if (typeof first === 'string') return first;
  try {
    return JSON.stringify(first);
  } catch {
    return String(first);
  }
}

function consolePassthrough(level: LogLevel, args: unknown[]): void {
  console[level](...args);
}

function enqueue(level: 'warn' | 'error', args: unknown[], context?: Record<string, string | number | boolean | null>): void {
  if (sessionEventCount >= MAX_SESSION_EVENTS) return;
  const message = redact(describe(args[0])).slice(0, 2000);
  const rawStack = args.find((a): a is Error => a instanceof Error)?.stack;
  const stack = rawStack ? redact(rawStack).slice(0, 8000) : undefined;

  // Deduplicate identical reports (same message + first stack frame) so a
  // render loop cannot flood the sink.
  const dedupeKey = `${level}:${message}:${stack?.split('\n')[1] ?? ''}`;
  const seen = dedupeCounts.get(dedupeKey) ?? 0;
  if (seen >= MAX_DUPLICATES_PER_KEY) return;
  dedupeCounts.set(dedupeKey, seen + 1);

  sessionEventCount += 1;
  queue.push({
    level,
    message,
    stack,
    href: typeof window !== 'undefined' ? window.location.href.slice(0, 500) : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 400) : undefined,
    ts: Date.now(),
    context
  });
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);

  if (!flushTimer) flushTimer = setTimeout(() => void flush(), FLUSH_INTERVAL_MS);
}

function send(payload: { events: ClientLogEvent[] }, useBeacon: boolean): void {
  const body = JSON.stringify(payload);
  if (useBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      return;
    } catch {
      /* fall through to fetch */
    }
  }
  if (typeof fetch !== 'function') return;
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {
    /* Sink unreachable — drop silently; telemetry must never throw. */
  });
}

/** Batched flush; safe to call repeatedly. */
export function flush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;
  const events = queue;
  queue = [];
  send({ events }, false);
}

function emit(level: LogLevel, args: unknown[]): void {
  consolePassthrough(level, args);
  if (isDev) return;
  if (level === 'warn' || level === 'error') {
    enqueue(level, args);
  }
}

/** Report an Error (or anything throwable) with optional structured context. */
export function reportError(err: unknown, context?: Record<string, string | number | boolean | null>): void {
  const args: unknown[] = [err instanceof Error ? err.message : err];
  if (err instanceof Error) args.push(err);
  consolePassthrough('error', args);
  if (isDev) return;
  enqueue('error', args, context);
}

/**
 * Install window-level error/unhandledrejection reporting and flush the
 * queue when the page is hidden. Call once from the app entrypoint.
 */
export function installGlobalErrorReporting(): void {
  if (typeof window === 'undefined' || isDev) return;

  window.addEventListener('error', (event) => {
    reportError(event.error ?? new Error(event.message), { source: 'window.onerror' });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
      source: 'unhandledrejection'
    });
  });

  window.addEventListener('pagehide', () => {
    if (queue.length === 0) return;
    const events = queue;
    queue = [];
    send({ events }, true);
  });
}

export const logger = {
  debug: (...args: unknown[]) => emit('debug', args),
  info: (...args: unknown[]) => emit('info', args),
  warn: (...args: unknown[]) => emit('warn', args),
  error: (...args: unknown[]) => emit('error', args),
  /** Explicit error report with context — use inside catch blocks/boundaries. */
  reportError
};
