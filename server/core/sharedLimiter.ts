import { getSharedUpstashRedis } from './dailyQuota';
import { logger } from './logger';

/**
 * Shared Fixed/Sliding Window Rate Limiter (Plan items 3.2, 4.1, 4.2).
 *
 * When Upstash Redis is configured (or an injected shared backend is active in
 * multi-instance tests), counters are tracked in one shared Redis namespace so
 * multiple API processes enforce ONE combined limit across restarts and deploys.
 *
 * When Upstash is unconfigured (local dev / single-process fallback), counters
 * fall back to a bounded in-memory sliding-window map strictly capped at
 * `MAX_LOCAL_WINDOW_KEYS` entries (LRU eviction on insertion beyond cap, plus
 * expired-timestamp pruning) so abusive IP churn can never cause OOM.
 */

export const MAX_LOCAL_WINDOW_KEYS = 5_000;

export interface SharedWindowBackend {
  /** Atomically increments the window bucket and returns current hit count. */
  incrWindow(bucketKey: string, ttlSeconds: number): Promise<number>;
}

class UpstashWindowBackend implements SharedWindowBackend {
  async incrWindow(bucketKey: string, ttlSeconds: number): Promise<number> {
    const redis = getSharedUpstashRedis();
    if (!redis) {
      throw new Error('Upstash Redis is not configured.');
    }
    const pipeline = redis.pipeline();
    pipeline.incr(bucketKey);
    pipeline.expire(bucketKey, Math.max(1, ttlSeconds));
    const res = await pipeline.exec();
    return Number(res?.[0] ?? 0);
  }
}

let windowBackendOverride: SharedWindowBackend | null = null;

export function setSharedWindowBackendForTests(backend: SharedWindowBackend | null): void {
  windowBackendOverride = backend;
}

export function resolveSharedWindowBackend(): SharedWindowBackend | null {
  if (windowBackendOverride) return windowBackendOverride;
  if (getSharedUpstashRedis()) return new UpstashWindowBackend();
  return null;
}

export interface WindowLimitDecision {
  allowed: boolean;
  backend: 'upstash' | 'memory';
  limit: number;
  used: number;
  remaining: number;
  retryAfterSeconds: number;
  resetEpochSeconds: number;
}

/**
 * Bounded in-memory sliding window map:
 *   key -> sorted array of request timestamps (epoch ms).
 * Map maintains insertion order in V8; touching an entry re-inserts it at the
 * tail, and inserting when `size >= maxKeys` evicts expired keys first, then
 * the oldest LRU entry so `map.size <= maxKeys` holds strictly as an invariant.
 */
export class BoundedSlidingWindowStore {
  private readonly store = new Map<string, number[]>();

  constructor(private readonly maxKeys: number = MAX_LOCAL_WINDOW_KEYS) {}

  get size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  check(key: string, maxRequests: number, windowMs: number, now = Date.now()): {
    allowed: boolean;
    used: number;
    remaining: number;
    retryAfterSeconds: number;
    resetEpochSeconds: number;
  } {
    const windowStart = now - windowMs;
    const existing = this.store.get(key);
    const active = existing ? existing.filter((t) => t > windowStart) : [];

    if (active.length >= maxRequests) {
      this.touch(key, active, windowStart);
      const oldest = active[0] ?? now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return {
        allowed: false,
        used: active.length,
        remaining: 0,
        retryAfterSeconds,
        resetEpochSeconds: Math.ceil((oldest + windowMs) / 1000)
      };
    }

    active.push(now);
    this.touch(key, active, windowStart);
    return {
      allowed: true,
      used: active.length,
      remaining: Math.max(0, maxRequests - active.length),
      retryAfterSeconds: 0,
      resetEpochSeconds: Math.ceil((now + windowMs) / 1000)
    };
  }

  private touch(key: string, timestamps: number[], windowStart: number): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxKeys) {
      // Sweep expired entries first; if still full, evict oldest LRU entry.
      for (const [candidate, times] of this.store) {
        if (times.every((t) => t <= windowStart)) {
          this.store.delete(candidate);
        }
        if (this.store.size < this.maxKeys) break;
      }
      if (this.store.size >= this.maxKeys) {
        const oldestKey = this.store.keys().next().value;
        if (oldestKey !== undefined) {
          this.store.delete(oldestKey);
        }
      }
    }
    this.store.set(key, timestamps);
  }
}

const defaultLocalStore = new BoundedSlidingWindowStore(MAX_LOCAL_WINDOW_KEYS);

export function resetSharedLimiterLocalState(): void {
  defaultLocalStore.clear();
}

export function getSharedLimiterLocalSize(): number {
  return defaultLocalStore.size;
}

/**
 * Evaluates a shared rate-limit window across Upstash Redis (when configured)
 * with graceful non-production fallback or fail-closed production handling.
 */
export async function checkSharedWindowLimit(params: {
  namespace: string;
  identifier: string;
  maxRequests: number;
  windowMs: number;
  now?: number;
}): Promise<WindowLimitDecision> {
  const { namespace, identifier, maxRequests, windowMs } = params;
  const now = params.now ?? Date.now();
  const shared = resolveSharedWindowBackend();

  if (shared) {
    const windowIndex = Math.floor(now / windowMs);
    const ttlSeconds = Math.max(1, Math.ceil(((windowIndex + 1) * windowMs - now) / 1000));
    const resetEpochSeconds = Math.ceil(((windowIndex + 1) * windowMs) / 1000);
    const bucketKey = `catalystlab:win:${namespace}:${windowIndex}:${identifier}`;

    try {
      const count = await shared.incrWindow(bucketKey, ttlSeconds);
      if (count > maxRequests) {
        return {
          allowed: false,
          backend: 'upstash',
          limit: maxRequests,
          used: count,
          remaining: 0,
          retryAfterSeconds: ttlSeconds,
          resetEpochSeconds
        };
      }
      return {
        allowed: true,
        backend: 'upstash',
        limit: maxRequests,
        used: count,
        remaining: Math.max(0, maxRequests - count),
        retryAfterSeconds: 0,
        resetEpochSeconds
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        logger.error({ err, namespace }, '[SharedLimiter] Shared Redis unavailable in production');
        throw err;
      }
      logger.warn({ err, namespace }, '[SharedLimiter] Shared Redis unavailable; falling back to bounded memory window');
    }
  }

  const local = defaultLocalStore.check(`${namespace}:${identifier}`, maxRequests, windowMs, now);
  return {
    backend: 'memory',
    limit: maxRequests,
    ...local
  };
}
