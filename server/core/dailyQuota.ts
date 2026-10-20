import { Redis } from '@upstash/redis';
import { logger } from './logger';

// Owner decision (2026-10-19, question 1): the daily compute-unit quota must
// not live in one process. API keys are already persisted in Firestore
// (`server/core/apiKeys.ts`); this module moves the DAILY LEDGER to Upstash
// Redis so every instance of the API charges and reads one shared budget.
//
// When Upstash is not configured the caller keeps its in-process ledger
// (single-instance deployments and the test suite), and says so via
// `backend: 'memory'` so health output can flag the degraded mode.

export const QUOTA_KEY_PREFIX = 'catalystlab:quota';

export type DailyQuotaBackendName = 'upstash' | 'memory';

/** Minimal counter contract; implemented on Upstash Redis and faked in tests. */
export interface DailyQuotaBackend {
  /** Adds `units` to the counter, (re)sets its TTL, and returns the new total. */
  incr(key: string, units: number, ttlSeconds: number): Promise<number>;
  /** Removes `units` from the counter (used to refund a denied charge). */
  decr(key: string, units: number): Promise<number>;
  /** Current total, or 0 when the key does not exist. */
  get(key: string): Promise<number>;
}

export interface DailyQuotaCharge {
  backend: DailyQuotaBackendName;
  allowed: boolean;
  /** Units consumed today by this identifier, per the shared ledger. */
  unitsUsed: number | null;
  unitsRemaining: number;
  resetInSeconds: number;
  /** True when the shared ledger could not be reached (non-production only). */
  degraded?: boolean;
}

export function quotaKey(identifier: string, dateKey: string): string {
  return `${QUOTA_KEY_PREFIX}:${dateKey}:${identifier}`;
}

class UpstashDailyQuotaBackend implements DailyQuotaBackend {
  constructor(private readonly redis: Redis) {}

  async incr(key: string, units: number, ttlSeconds: number): Promise<number> {
    const pipeline = this.redis.pipeline();
    pipeline.incrby(key, units);
    pipeline.expire(key, Math.max(1, ttlSeconds));
    const results = await pipeline.exec();
    return Number(results?.[0] ?? 0);
  }

  async decr(key: string, units: number): Promise<number> {
    return Number(await this.redis.decrby(key, units));
  }

  async get(key: string): Promise<number> {
    const value = await this.redis.get<number | string>(key);
    return Number(value ?? 0);
  }
}

let cachedRedis: Redis | null | undefined;
let cachedBackend: DailyQuotaBackend | null | undefined;
let backendOverride: DailyQuotaBackend | null = null;

function getUpstashRedis(): Redis | null {
  if (cachedRedis !== undefined) return cachedRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cachedRedis = null;
    return null;
  }
  try {
    cachedRedis = new Redis({ url, token });
  } catch (err) {
    logger.warn({ err }, '[DailyQuota] Upstash client construction failed; using the in-process ledger');
    cachedRedis = null;
  }
  return cachedRedis;
}

/** Shared Redis client for every distributed limiter in the API layer. */
export function getSharedUpstashRedis(): Redis | null {
  return getUpstashRedis();
}

export function resolveDailyQuotaBackend(): DailyQuotaBackend | null {
  if (backendOverride) return backendOverride;
  if (cachedBackend !== undefined) return cachedBackend;
  const redis = getUpstashRedis();
  cachedBackend = redis ? new UpstashDailyQuotaBackend(redis) : null;
  return cachedBackend;
}

/** True when the daily quota is shared across instances. */
export function isDistributedQuotaEnabled(): boolean {
  return resolveDailyQuotaBackend() !== null;
}

/** Test hooks. */
export function setDailyQuotaBackendForTests(backend: DailyQuotaBackend | null): void {
  backendOverride = backend;
}

export function resetDailyQuotaClient(): void {
  cachedRedis = undefined;
  cachedBackend = undefined;
  backendOverride = null;
}

export interface ChargeDailyUnitsParams {
  identifier: string;
  /** UTC date key (`YYYY-MM-DD`) the charge belongs to. */
  dateKey: string;
  /** Seconds until UTC midnight; used as the key TTL. */
  ttlSeconds: number;
  /** Units this request costs (0 when a session already paid for the work). */
  units: number;
  /** Daily budget for the resolved tier, or `null` when unlimited. */
  limit: number | null;
}

/**
 * Charges the shared daily ledger. Unlimited tiers are not charged. A denied
 * charge is refunded so retries do not silently burn budget, and the decision
 * is made on the counter value AFTER the increment so concurrent requests
 * cannot both pass the same boundary.
 *
 * Throws when the shared ledger is unreachable: the caller decides whether to
 * fail closed (production) or fall back to its in-process ledger.
 */
export async function chargeDailyUnits(params: ChargeDailyUnitsParams): Promise<DailyQuotaCharge> {
  const backend = resolveDailyQuotaBackend();
  if (!backend) {
    return {
      backend: 'memory',
      allowed: true,
      unitsUsed: null,
      unitsRemaining: params.limit === null ? Number.POSITIVE_INFINITY : params.limit,
      resetInSeconds: params.ttlSeconds
    };
  }

  const key = quotaKey(params.identifier, params.dateKey);

  if (params.limit === null) {
    // Unlimited tier: track usage for observability, never deny.
    if (params.units > 0) await backend.incr(key, params.units, params.ttlSeconds);
    return {
      backend: 'upstash',
      allowed: true,
      unitsUsed: await backend.get(key),
      unitsRemaining: Number.POSITIVE_INFINITY,
      resetInSeconds: params.ttlSeconds
    };
  }

  if (params.units <= 0) {
    const used = await backend.get(key);
    return {
      backend: 'upstash',
      allowed: used <= params.limit,
      unitsUsed: used,
      unitsRemaining: Math.max(0, params.limit - used),
      resetInSeconds: params.ttlSeconds
    };
  }

  const used = await backend.incr(key, params.units, params.ttlSeconds);
  if (used > params.limit) {
    try {
      await backend.decr(key, params.units);
    } catch (err) {
      // A failed refund only ever costs the caller budget it already exceeded.
      logger.warn({ err, key }, '[DailyQuota] Refund of a denied charge failed');
    }
    return {
      backend: 'upstash',
      allowed: false,
      unitsUsed: Math.max(0, used - params.units),
      unitsRemaining: 0,
      resetInSeconds: params.ttlSeconds
    };
  }

  return {
    backend: 'upstash',
    allowed: true,
    unitsUsed: used,
    unitsRemaining: Math.max(0, params.limit - used),
    resetInSeconds: params.ttlSeconds
  };
}

/** Reads today's shared usage without charging (quota introspection endpoints). */
export async function readDailyUnits(
  identifier: string,
  dateKey: string
): Promise<{ backend: DailyQuotaBackendName; unitsUsed: number | null }> {
  const backend = resolveDailyQuotaBackend();
  if (!backend) return { backend: 'memory', unitsUsed: null };
  try {
    return { backend: 'upstash', unitsUsed: await backend.get(quotaKey(identifier, dateKey)) };
  } catch (err) {
    logger.warn({ err, identifier }, '[DailyQuota] Shared usage read failed');
    return { backend: 'memory', unitsUsed: null };
  }
}
