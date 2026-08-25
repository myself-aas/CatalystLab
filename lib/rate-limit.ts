import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import type { GuestQuotaStatus } from '../types/telemetry';

export type UserPlanTier =
  | 'visitor'
  | 'free'
  | 'starter'
  | 'pro'
  | 'team'
  | 'enterprise'
  | 'superadmin';

export interface RateLimitCheckResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  formattedResetTime: string;
  tier: UserPlanTier;
  headers: Record<string, string>;
  isBlocked: boolean;
}

export const TIER_DAILY_LIMITS: Record<UserPlanTier, number> = {
  visitor: 5,        // Guest users: 5 master scans / day
  free: 20,          // Free registered: 20 scans / day
  starter: 150,      // Starter: 150 scans / day
  pro: 500,          // Pro: 500 scans / day
  team: 1500,        // Team: 1,500 scans / day
  enterprise: 10000, // Enterprise: 10,000 scans / day
  superadmin: 999999 // Unlimited
};

// In-Memory Fallback Store for local development or when Redis env is not set
interface MemoryWindowRecord {
  count: number;
  resetAt: number;
}
const memoryStore = new Map<string, MemoryWindowRecord>();

/**
 * Lazy initialization of Upstash Redis client
 */
let redisClient: Redis | null = null;
let ratelimiters: Map<UserPlanTier, Ratelimit> = new Map();

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis({
        url,
        token,
      });
    } catch (err) {
      console.warn('[RateLimiter] Failed to initialize Upstash Redis, falling back to memory store:', err);
      return null;
    }
  }

  return redisClient;
}

function getRatelimiterForTier(tier: UserPlanTier, redis: Redis): Ratelimit {
  if (ratelimiters.has(tier)) {
    return ratelimiters.get(tier)!;
  }

  const limit = TIER_DAILY_LIMITS[tier] || 5;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, '24 h'),
    analytics: true,
    prefix: `@catalystlab/ratelimit/${tier}`,
  });

  ratelimiters.set(tier, limiter);
  return limiter;
}

function calculateSecondsToUtcMidnight(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
  return Math.max(1, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function formatResetDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Executes a sliding window rate-limit check against Upstash Redis with local memory fallback.
 */
export async function checkRateLimit(
  identifier: string,
  tier: UserPlanTier = 'visitor',
  costUnits: number = 1
): Promise<RateLimitCheckResult> {
  const limit = TIER_DAILY_LIMITS[tier] || 5;
  const now = Date.now();
  const resetInSeconds = calculateSecondsToUtcMidnight();
  const formattedResetTime = formatResetDuration(resetInSeconds);

  // Superadmin bypass
  if (tier === 'superadmin') {
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      resetInSeconds,
      formattedResetTime,
      tier,
      headers: {
        'X-RateLimit-Limit': '999999',
        'X-RateLimit-Remaining': '999999',
        'X-RateLimit-Reset': String(Math.floor(now / 1000) + resetInSeconds),
        'X-RateLimit-Tier': tier,
      },
      isBlocked: false,
    };
  }

  const redis = getRedisClient();

  if (redis) {
    try {
      const limiter = getRatelimiterForTier(tier, redis);
      const result = await limiter.limit(identifier, { rate: costUnits });
      
      const remaining = Math.max(0, result.remaining);
      const resetSec = Math.max(1, Math.floor((result.reset - now) / 1000));

      const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(Math.floor(result.reset / 1000)),
        'X-RateLimit-Tier': tier,
      };

      if (!result.success) {
        headers['Retry-After'] = String(resetSec);
      }

      return {
        success: result.success,
        limit,
        remaining,
        resetInSeconds: resetSec,
        formattedResetTime: formatResetDuration(resetSec),
        tier,
        headers,
        isBlocked: !result.success,
      };
    } catch (err) {
      console.warn('[RateLimiter] Upstash check error, using local fallback:', err);
    }
  }

  // Local in-memory sliding window fallback
  const dateKey = new Date().toISOString().split('T')[0];
  const storageKey = `${tier}:${identifier}:${dateKey}`;
  const midnightMs = now + (resetInSeconds * 1000);

  const existing = memoryStore.get(storageKey);
  let currentUsed = existing ? existing.count : 0;

  if (currentUsed + costUnits > limit) {
    const remaining = Math.max(0, limit - currentUsed);
    return {
      success: false,
      limit,
      remaining,
      resetInSeconds,
      formattedResetTime,
      tier,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(Math.floor(midnightMs / 1000)),
        'X-RateLimit-Tier': tier,
        'Retry-After': String(resetInSeconds),
      },
      isBlocked: true,
    };
  }

  currentUsed += costUnits;
  memoryStore.set(storageKey, {
    count: currentUsed,
    resetAt: midnightMs,
  });

  const remaining = Math.max(0, limit - currentUsed);
  return {
    success: true,
    limit,
    remaining,
    resetInSeconds,
    formattedResetTime,
    tier,
    headers: {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.floor(midnightMs / 1000)),
      'X-RateLimit-Tier': tier,
    },
    isBlocked: false,
  };
}

/**
 * Helper to convert check result to standard GuestQuotaStatus
 */
export function toGuestQuotaStatus(result: RateLimitCheckResult): GuestQuotaStatus {
  return {
    tier: result.tier,
    remaining: result.remaining,
    limit: result.limit,
    used: Math.max(0, result.limit - result.remaining),
    resetInSeconds: result.resetInSeconds,
    formattedResetTime: result.formattedResetTime,
    allowed: result.success,
    isBlocked: result.isBlocked,
    retryAfterSeconds: result.isBlocked ? result.resetInSeconds : undefined,
  };
}
