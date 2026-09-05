import type { Request, Response, NextFunction } from 'express';
import { getAttachedIdentity, identityToEntitlements } from '../../src/lib/serverAuth';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { API_KEY_PREFIX, findApiKey } from './apiKeys';


// In-memory tiered rate limiting core. See docs / RateLimitingDoc for the
// tier matrix. Fail-closed identity: authenticated tiers come exclusively
// from the verified identity attached by the auth middleware.


export const VISITOR_DAILY_UNITS = 20;
export const FREE_USER_DAILY_UNITS = 50;
export const STARTER_DAILY_UNITS = 150;
export const PRO_DAILY_UNITS = 500;
export const TEAM_DAILY_UNITS = 1500;
export const ENTERPRISE_DAILY_UNITS = 5000;
export const PRO_API_DAILY_UNITS = 500;
export const MASTER_AUDIT_COST = 10;
export const SINGLE_ENGINE_COST = 1;

export const BURST_WINDOW_MS = 60 * 1000;
export const VISITOR_BURST_MAX = 15;
export const USER_BURST_MAX = 45;

/**
 * Rate-limit tiers, ordered by budget. `superadmin` is terminal: the primary
 * superadmin identity receives an unlimited budget (`limit: null`,
 * `burstMax: Infinity`) and is exempt from consumption tracking entirely.
 */
export type RateLimitTier = 'superadmin' | 'enterprise' | 'team' | 'pro' | 'starter' | 'free' | 'visitor' | 'api_pro';

export interface RateLimitRecord {
  unitsUsed: number;
  sessionCostMap: Map<string, number>;
  requestTimestamps: number[];
  lastUpdated: number;
  tier: RateLimitTier;
}

// In-memory rate limit ledger: Map<dateKey_identifier, RateLimitRecord>
export const dailyRateLimitStore = new Map<string, RateLimitRecord>();

export function getUtcMidnight(): { dateKey: string; resetAt: Date; resetInSeconds: number; formattedResetTime: string } {
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
  const resetInSeconds = Math.max(1, Math.floor((resetAt.getTime() - now.getTime()) / 1000));
  
  const totalMinutes = Math.floor(resetInSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedResetTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return { dateKey, resetAt, resetInSeconds, formattedResetTime };
}

export function clientIp(req: Request): string {
  // Only honor X-Forwarded-For when the process is behind a trusted proxy.
  if (process.env.TRUST_PROXY === 'true') {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.trim()) {
      return xff.split(',')[0].trim();
    }
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

let upstashLimiter: Ratelimit | null | undefined;
function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter !== undefined) return upstashLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    upstashLimiter = null;
    return null;
  }
  try {
    upstashLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(120, '1 m'),
      prefix: 'catalystlab:rl'
    });
  } catch {
    upstashLimiter = null;
  }
  return upstashLimiter;
}

export function resolveClientIdentity(req: Request): {
  identifier: string;
  tier: RateLimitTier;
  tierLabel: string;
  subscriptionPlan: string;
  isTrialActive: boolean;
  limit: number | null;
  burstMax: number;
  cleanEmail?: string;
  userId?: string;
  visitorId?: string;
  sessionId?: string;
} {
  const ip = clientIp(req);
  const rawSessionId = (req.body?.auditSessionId || req.headers['x-audit-session'] || req.query?.auditSessionId || '') as string;
  // API keys are accepted only via x-api-key — never Authorization: Bearer
  // (Bearer is reserved for Firebase ID tokens).
  const apiKeyHeader = req.headers['x-api-key'];
  const apiKey = typeof apiKeyHeader === 'string' ? apiKeyHeader : '';

  // SECURITY (Phase 0, fail closed): plan tiers, trials, and superadmin access
  // are NEVER derived from client-supplied headers/body/query. Client claims
  // (x-user-email, x-subscription-plan, x-trial-active, ...) were trivially
  // spoofable and granted unlimited rate budgets. Identity-based tiers come
  // from verified Firebase ID tokens (src/lib/serverAuth.ts); API keys earn
  // elevated limits only when they resolve against the persisted hashed
  // store (or the legacy env allowlist) with a constant-time comparison.

  // API keys resolve against the persisted, hashed store (plus the legacy
  // environment allowlist fallback). The secret is never stored in plaintext.
  if (apiKey && apiKey.startsWith(API_KEY_PREFIX)) {
    const keyRecord = findApiKey(apiKey);
    if (keyRecord) {
      return {
        identifier: `key_${keyRecord.id}`,
        tier: 'api_pro',
        tierLabel: 'Developer API Key',
        subscriptionPlan: 'pro',
        isTrialActive: false,
        limit: keyRecord.dailyComputeLimit || PRO_API_DAILY_UNITS,
        burstMax: 120,
        cleanEmail: undefined,
        userId: undefined,
        visitorId: undefined,
        sessionId: rawSessionId
      };
    }
  }

  // Phase 1: authenticated tiers come exclusively from the verified identity
  // attached by the auth middleware (token claims + Firestore entitlements).
  const verified = getAttachedIdentity(req);
  if (verified) {
    if (verified.isSuperadmin) {
      return {
        identifier: `superadmin_${verified.uid}`,
        tier: 'superadmin',
        tierLabel: 'Primary Superadmin',
        subscriptionPlan: 'enterprise',
        isTrialActive: false,
        limit: null,
        burstMax: Infinity,
        cleanEmail: verified.email,
        userId: verified.uid,
        visitorId: undefined,
        sessionId: rawSessionId
      };
    }

    const mapped = identityToEntitlements(verified, FREE_USER_DAILY_UNITS);
    const tierLabel = verified.isTrialActive
      ? `${mapped.tier.charAt(0).toUpperCase()}${mapped.tier.slice(1)} (7-Day Trial)`
      : mapped.tier === 'free'
        ? 'Community User'
        : `${mapped.tier.charAt(0).toUpperCase()}${mapped.tier.slice(1)} Tier`;
    return {
      identifier: `user_${verified.uid}`,
      tier: mapped.tier,
      tierLabel,
      subscriptionPlan: verified.plan,
      isTrialActive: verified.isTrialActive,
      limit: mapped.limit,
      burstMax: mapped.burstMax,
      cleanEmail: verified.email,
      userId: verified.uid,
      visitorId: undefined,
      sessionId: rawSessionId
    };
  }

  // Unauthenticated: one shared bucket per client IP. Client-supplied
  // visitor/user identifiers are deliberately ignored for the bucket key so
  // rotating them cannot reset quotas.
  return {
    identifier: `vis_${ip}`,
    tier: 'visitor',
    tierLabel: 'Guest Visitor',
    subscriptionPlan: 'visitor',
    isTrialActive: false,
    limit: VISITOR_DAILY_UNITS,
    burstMax: VISITOR_BURST_MAX,
    cleanEmail: undefined,
    userId: undefined,
    visitorId: undefined,
    sessionId: rawSessionId
  };
}

function getOrCreateRateLimitRecord(key: string, tier: RateLimitTier): RateLimitRecord {
  if (!dailyRateLimitStore.has(key)) {
    dailyRateLimitStore.set(key, {
      unitsUsed: 0,
      sessionCostMap: new Map<string, number>(),
      requestTimestamps: [],
      lastUpdated: Date.now(),
      tier
    });
  }
  return dailyRateLimitStore.get(key)!;
}

// Evaluate Rate Limit & Deduplicate Multi-Engine Sessions
export function evaluateAndChargeRateLimit(
  req: Request,
  res: Response,
  requestedCost: number = 1
): {
  allowed: boolean;
  burstExceeded?: boolean;
  tier: string;
  tierLabel: string;
  limit: number | null;
  unitsUsed: number;
  unitsRemaining: number;
  costCharged: number;
  resetAt: string;
  resetInSeconds: number;
  formattedResetTime: string;
  error?: string;
} {
  const { dateKey, resetAt, resetInSeconds, formattedResetTime } = getUtcMidnight();
  const identity = resolveClientIdentity(req);
  const now = Date.now();

  // Superadmin / unlimited: skip consumption and burst tracking entirely.
  if (identity.limit === null) {
    if (!res.headersSent) {
      res.setHeader('X-RateLimit-Limit', 'unlimited');
      res.setHeader('X-RateLimit-Remaining', 'unlimited');
      res.setHeader('X-RateLimit-Tier', identity.tier);
    }
    return {
      allowed: true,
      tier: identity.tier,
      tierLabel: identity.tierLabel,
      limit: null,
      unitsUsed: 0,
      unitsRemaining: Number.POSITIVE_INFINITY,
      costCharged: 0,
      resetAt: resetAt.toISOString(),
      resetInSeconds,
      formattedResetTime
    };
  }

  const storeKey = `${dateKey}_${identity.identifier}`;
  const record = getOrCreateRateLimitRecord(storeKey, identity.tier);

  // 1. Burst Rate Limiting Check (Sliding 60s Window)
  record.requestTimestamps = record.requestTimestamps.filter(t => now - t < BURST_WINDOW_MS);
  if (record.requestTimestamps.length >= identity.burstMax) {
    if (!res.headersSent) {
      res.setHeader('Retry-After', '10');
      res.setHeader('X-RateLimit-Limit', String(identity.limit));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, (identity.limit || 0) - record.unitsUsed)));
      res.setHeader('X-RateLimit-Used', String(record.unitsUsed));
      res.setHeader('X-RateLimit-Reset', Math.floor(resetAt.getTime() / 1000).toString());
      res.setHeader('X-RateLimit-Tier', identity.tier);
    }

    return {
      allowed: false,
      burstExceeded: true,
      tier: identity.tier,
      tierLabel: identity.tierLabel,
      limit: identity.limit,
      unitsUsed: record.unitsUsed,
      unitsRemaining: Math.max(0, (identity.limit || 0) - record.unitsUsed),
      costCharged: 0,
      resetAt: resetAt.toISOString(),
      resetInSeconds: 10,
      formattedResetTime,
      error: `Burst rate limit exceeded (${identity.burstMax} req/min). Please pause for 10 seconds.`
    };
  }

  // 2. Session-Based Cost Calculation (Smart Deduplication)
  let costToCharge = requestedCost;
  const sessionId = identity.sessionId;

  if (sessionId) {
    const previousBilled = record.sessionCostMap.get(sessionId) || 0;
    if (previousBilled >= MASTER_AUDIT_COST) {
      // Already paid for full master audit session — all sibling engine calls under same session are complimentary
      costToCharge = 0;
    } else if (previousBilled > 0) {
      costToCharge = Math.max(0, requestedCost - previousBilled);
    }
  }

  const limit = identity.limit ?? FREE_USER_DAILY_UNITS;
  const projectedUsed = record.unitsUsed + costToCharge;

  // 3. Quota Exceeded Check
  if (projectedUsed > limit) {
    if (!res.headersSent) {
      res.setHeader('Retry-After', String(resetInSeconds));
      res.setHeader('X-RateLimit-Limit', String(limit));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Used', String(record.unitsUsed));
      res.setHeader('X-RateLimit-Reset', Math.floor(resetAt.getTime() / 1000).toString());
      res.setHeader('X-RateLimit-Tier', identity.tier);
    }

    const errorMessage = identity.tier === 'free'
      ? `Daily compute quota exhausted (${limit} units / 5 Master Audits / 50 Single Engines). Resets at midnight UTC. Upgrade your plan or activate a 7-day free trial at /pricing.`
      : identity.tier === 'visitor'
      ? `Daily visitor limit exhausted (${limit} units / 2 Master Audits / 20 Single Engines). Sign in with Google to unlock 50 units/day.`
      : `Daily quota limit exhausted (${limit} units) for ${identity.tierLabel}. Resets at midnight UTC.`;

    return {
      allowed: false,
      tier: identity.tier,
      tierLabel: identity.tierLabel,
      limit,
      unitsUsed: record.unitsUsed,
      unitsRemaining: 0,
      costCharged: 0,
      resetAt: resetAt.toISOString(),
      resetInSeconds,
      formattedResetTime,
      error: errorMessage
    };
  }

  // 4. Record Successful Request
  record.requestTimestamps.push(now);
  record.unitsUsed += costToCharge;
  record.lastUpdated = now;
  if (sessionId) {
    const prev = record.sessionCostMap.get(sessionId) || 0;
    record.sessionCostMap.set(sessionId, prev + costToCharge);
  }

  const remaining = Math.max(0, limit - record.unitsUsed);

  // Set Standard HTTP Rate Limit Headers
  if (!res.headersSent) {
    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Used', String(record.unitsUsed));
    res.setHeader('X-RateLimit-Reset', Math.floor(resetAt.getTime() / 1000).toString());
    res.setHeader('X-RateLimit-Tier', identity.tier);
    res.setHeader('RateLimit-Policy', `${limit};w=86400`);
  }

  return {
    allowed: true,
    tier: identity.tier,
    tierLabel: identity.tierLabel,
    limit,
    unitsUsed: record.unitsUsed,
    unitsRemaining: remaining,
    costCharged: costToCharge,
    resetAt: resetAt.toISOString(),
    resetInSeconds,
    formattedResetTime
  };
}

// Express Rate-Limiting Middleware for Engine Endpoints
export function createEngineRateLimitMiddleware(options: { cost?: number; isMaster?: boolean } = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cost = options.isMaster ? MASTER_AUDIT_COST : (options.cost || SINGLE_ENGINE_COST);
    const result = evaluateAndChargeRateLimit(req, res, cost);

    if (!result.allowed) {
      res.status(429).json({
        success: false,
        rateLimitExceeded: true,
        tier: result.tier,
        tierLabel: result.tierLabel,
        limit: result.limit,
        used: result.unitsUsed,
        remaining: result.unitsRemaining,
        resetAt: result.resetAt,
        resetInSeconds: result.resetInSeconds,
        formattedResetTime: result.formattedResetTime,
        error: result.error
      });
      return;
    }

    const distributed = getUpstashLimiter();
    if (distributed && result.limit !== null) {
      try {
        const identity = resolveClientIdentity(req);
        const { success } = await distributed.limit(identity.identifier);
        if (!success) {
          res.status(429).json({
            success: false,
            rateLimitExceeded: true,
            error: 'Distributed rate limit exceeded. Retry shortly.'
          });
          return;
        }
      } catch {
        if (process.env.NODE_ENV === 'production') {
          res.status(503).json({ success: false, error: 'Rate limiter unavailable.' });
          return;
        }
      }
    }

    (req as any).rateLimitStatus = result;
    next();
  };
}

// Clean old rate limit map entries every hour
setInterval(() => {
  const { dateKey } = getUtcMidnight();
  for (const key of dailyRateLimitStore.keys()) {
    if (!key.startsWith(dateKey)) {
      dailyRateLimitStore.delete(key);
    }
  }
}, 1000 * 60 * 60);
