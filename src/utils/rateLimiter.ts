import type { User } from '../lib/firebase';
import { SUPERADMIN_EMAILS } from '../context/AuthContext';
import type { SubscriptionPlanId } from '../types';

export interface RateLimitStatus {
  tier: string; tierLabel: string; subscriptionPlan: SubscriptionPlanId; isTrialActive: boolean; trialDaysRemaining: number;
  limit: number | null; used: number; remaining: number; masterLimit: number; singleLimit: number; masterRemaining: number;
  singleRemaining: number; isUnlimited: boolean; isExceeded: boolean; isMasterExceeded: boolean; isSingleExceeded: boolean;
  resetHoursRemaining: number; resetMinutesRemaining: number; formattedResetTime: string; resetAtUtc?: string; burstLimit?: number; burstRemaining?: number;
}

export const MASTER_AUDIT_COST = 10;
export const SINGLE_ENGINE_COST = 1;
export const VISITOR_DAILY_LIMIT = 20;
export const FREE_DAILY_LIMIT = 50;
export const STARTER_DAILY_LIMIT = 150;
export const PRO_DAILY_LIMIT = 500;
export const TEAM_DAILY_LIMIT = 1500;
export const ENTERPRISE_DAILY_LIMIT = 5000;

function getStoreKey(user: User | null) {
  // ponytail: fixed window counter in localStorage, replacing 365 lines of over-engineering
  return `catalyst_rate_limit_${new Date().toISOString().split('T')[0]}_${user?.uid || 'visitor'}`;
}

export function getRateLimitStatus(user: User | null, isAdmin: boolean, planId: SubscriptionPlanId = 'free', isTrial = false, trialDaysLeft = 0): RateLimitStatus {
  const isSuperadmin = isAdmin || SUPERADMIN_EMAILS.includes(user?.email?.toLowerCase() || '');
  const limits: Record<SubscriptionPlanId | 'visitor', number> = { visitor: VISITOR_DAILY_LIMIT, free: FREE_DAILY_LIMIT, starter: STARTER_DAILY_LIMIT, pro: PRO_DAILY_LIMIT, team: TEAM_DAILY_LIMIT, enterprise: ENTERPRISE_DAILY_LIMIT };
  const limit = limits[user ? planId : 'visitor'] || VISITOR_DAILY_LIMIT;
  const used = typeof localStorage !== 'undefined' ? parseInt(localStorage.getItem(getStoreKey(user)) || '0', 10) : 0;
  const remaining = isSuperadmin ? Infinity : Math.max(0, limit - used);
  const diff = new Date().setUTCHours(23,59,59,999) - Date.now();
  
  return {
    tier: isSuperadmin ? 'superadmin' : user ? planId : 'visitor',
    tierLabel: isSuperadmin ? 'Primary Superadmin' : user ? `${planId} Tier` : 'Guest Visitor',
    subscriptionPlan: planId,
    isTrialActive: isTrial,
    trialDaysRemaining: trialDaysLeft,
    limit: isSuperadmin ? null : limit,
    used: isSuperadmin ? 0 : used,
    remaining,
    masterLimit: Math.floor(limit / MASTER_AUDIT_COST),
    singleLimit: Math.floor(limit / SINGLE_ENGINE_COST),
    masterRemaining: Math.floor(remaining / MASTER_AUDIT_COST),
    singleRemaining: Math.floor(remaining / SINGLE_ENGINE_COST),
    isUnlimited: isSuperadmin,
    isExceeded: remaining <= 0,
    isMasterExceeded: remaining < MASTER_AUDIT_COST,
    isSingleExceeded: remaining < SINGLE_ENGINE_COST,
    resetHoursRemaining: Math.floor(diff / 3600000),
    resetMinutesRemaining: Math.floor((diff % 3600000) / 60000),
    formattedResetTime: `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`
  };
}

export async function fetchServerRateLimitStatus(user: User | null, planId: SubscriptionPlanId = 'free', isTrial = false) {
  return getRateLimitStatus(user, false, planId, isTrial);
}

export function recordAuditLaunch(user: User | null, isAdmin: boolean, auditType: 'master' | 'single' = 'master', planId: SubscriptionPlanId = 'free', isTrial = false, trialDaysLeft = 0) {
  return recordClientRequestAttempt(auditType === 'master' ? MASTER_AUDIT_COST : SINGLE_ENGINE_COST, user, isAdmin, planId, isTrial, trialDaysLeft);
}

export function recordClientRequestAttempt(cost: number, user: User | null, isAdmin: boolean, planId: SubscriptionPlanId = 'free', isTrial = false, trialDaysLeft = 0) {
  const status = getRateLimitStatus(user, isAdmin, planId, isTrial, trialDaysLeft);
  if (!status.isUnlimited && status.remaining >= cost) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(getStoreKey(user), String(status.used + cost));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('catalyst-rate-limit-updated', { detail: getRateLimitStatus(user, isAdmin, planId, isTrial, trialDaysLeft) }));
    }
  }
  return { allowed: status.isUnlimited || status.remaining >= cost, status: getRateLimitStatus(user, isAdmin, planId, isTrial, trialDaysLeft) };
}
export function getVisitorDeviceId(): string {
  let id = localStorage.getItem('catalyst_visitor_id');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('catalyst_visitor_id', id);
  }
  return id;
}
