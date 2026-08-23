/**
 * Rate Limiter for CatalystLab Master Audits & Diagnostic Engines
 * 
 * 5 Tier Architecture + 7-Day Free Trial:
 * 1. Primary Superadmins: Unlimited / day
 * 2. Visitor / Guest: 20 units/day (2 Master Audits or 20 Single Engines)
 * 3. Free / Community: 50 units/day (5 Master Audits or 50 Single Engines)
 * 4. Starter ($9/mo or 7-day trial): 150 units/day (15 Master Audits or 150 Single Engines)
 * 5. Pro ($19/mo or 7-day trial): 500 units/day (50 Master Audits or 500 Single Engines)
 * 6. Team ($49/mo or 7-day trial): 1,500 units/day (150 Master Audits or 1500 Single Engines)
 * 7. Enterprise ($99/mo or 7-day trial): 5,000 units/day (500 Master Audits or 5000 Single Engines)
 * 
 * 1 Master Audit = 10 Units
 * 1 Single Engine Audit = 1 Unit
 */

import type { User } from '../lib/firebase';
import { SUPERADMIN_EMAILS } from '../context/AuthContext';
import { SubscriptionPlanId } from '../types';

export const VISITOR_DAILY_LIMIT = 20;
export const FREE_DAILY_LIMIT = 50;
export const STARTER_DAILY_LIMIT = 150;
export const PRO_DAILY_LIMIT = 500;
export const TEAM_DAILY_LIMIT = 1500;
export const ENTERPRISE_DAILY_LIMIT = 5000;

export const MASTER_AUDIT_COST = 10;
export const SINGLE_ENGINE_COST = 1;

export interface RateLimitStatus {
  tier: 'superadmin' | 'visitor' | 'free' | 'starter' | 'pro' | 'team' | 'enterprise';
  tierLabel: string;
  subscriptionPlan: SubscriptionPlanId;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  limit: number | null; // Total units limit
  used: number;         // Total units used
  remaining: number;    // Total units remaining
  masterLimit: number;
  singleLimit: number;
  masterRemaining: number;
  singleRemaining: number;
  isUnlimited: boolean;
  isExceeded: boolean;
  isMasterExceeded: boolean;
  isSingleExceeded: boolean;
  resetHoursRemaining: number;
  resetMinutesRemaining: number;
  formattedResetTime: string;
  resetAtUtc?: string;
  burstLimit?: number;
  burstRemaining?: number;
}

// Generate or retrieve a persistent client ID for visitors
export function getVisitorDeviceId(): string {
  const KEY = 'catalyst_visitor_device_id';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = 'vis_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'vis_fallback_session';
  }
}

// Get standard YYYY-MM-DD string for current local date
function getCurrentDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate remaining time until midnight local reset
function getTimeUntilMidnight(): { hours: number; minutes: number; formatted: string } {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const diffMs = tomorrow.getTime() - now.getTime();
  
  const totalMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const formatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return { hours, minutes, formatted };
}

// Read current unit usage count for today
export function getAuditUsageToday(user: User | null, isAdmin: boolean): number {
  if (isAdmin) return 0;
  
  const dateKey = getCurrentDateKey();
  const identifier = user ? `usr_${user.uid}` : `vis_${getVisitorDeviceId()}`;
  const storageKey = `catalyst_rate_limit_${dateKey}_${identifier}`;

  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

// Helper to determine plan limit in units
export function getPlanDailyLimit(planId: SubscriptionPlanId): number {
  switch (planId) {
    case 'enterprise':
      return ENTERPRISE_DAILY_LIMIT;
    case 'team':
      return TEAM_DAILY_LIMIT;
    case 'pro':
      return PRO_DAILY_LIMIT;
    case 'starter':
      return STARTER_DAILY_LIMIT;
    case 'free':
    default:
      return FREE_DAILY_LIMIT;
  }
}

// Check rate limit status based on user, subscription, and trial info
export function getRateLimitStatus(
  user: User | null, 
  isAdmin: boolean, 
  planId: SubscriptionPlanId = 'free',
  isTrial: boolean = false,
  trialDaysLeft: number = 0
): RateLimitStatus {
  const { hours, minutes, formatted } = getTimeUntilMidnight();

  const userEmail = user?.email?.toLowerCase() || '';
  const isSuperadmin = isAdmin || (user != null && SUPERADMIN_EMAILS.includes(userEmail));

  if (isSuperadmin) {
    return {
      tier: 'superadmin',
      tierLabel: 'Primary Superadmin',
      subscriptionPlan: 'enterprise',
      isTrialActive: false,
      trialDaysRemaining: 0,
      limit: null,
      used: 0,
      remaining: Infinity,
      masterLimit: Infinity,
      singleLimit: Infinity,
      masterRemaining: Infinity,
      singleRemaining: Infinity,
      isUnlimited: true,
      isExceeded: false,
      isMasterExceeded: false,
      isSingleExceeded: false,
      resetHoursRemaining: hours,
      resetMinutesRemaining: minutes,
      formattedResetTime: formatted
    };
  }

  const isAuthUser = Boolean(user);
  
  let limit = VISITOR_DAILY_LIMIT;
  let tier: RateLimitStatus['tier'] = 'visitor';
  let tierLabel = 'Guest Visitor';

  if (isAuthUser) {
    limit = getPlanDailyLimit(planId);
    tier = planId;
    
    switch (planId) {
      case 'enterprise':
        tierLabel = isTrial ? `Enterprise (Trial: ${trialDaysLeft}d left)` : 'Enterprise Tier';
        break;
      case 'team':
        tierLabel = isTrial ? `Team (Trial: ${trialDaysLeft}d left)` : 'Team Tier';
        break;
      case 'pro':
        tierLabel = isTrial ? `Pro (Trial: ${trialDaysLeft}d left)` : 'Professional Tier';
        break;
      case 'starter':
        tierLabel = isTrial ? `Starter (Trial: ${trialDaysLeft}d left)` : 'Starter Tier';
        break;
      case 'free':
      default:
        tierLabel = 'Community Tier';
        break;
    }
  }

  const used = getAuditUsageToday(user, false);
  const remaining = Math.max(0, limit - used);
  
  const masterRemaining = Math.floor(remaining / MASTER_AUDIT_COST);
  const singleRemaining = Math.floor(remaining / SINGLE_ENGINE_COST);
  
  const masterLimit = Math.floor(limit / MASTER_AUDIT_COST);
  const singleLimit = Math.floor(limit / SINGLE_ENGINE_COST);

  const isMasterExceeded = remaining < MASTER_AUDIT_COST;
  const isSingleExceeded = remaining < SINGLE_ENGINE_COST;
  const isExceeded = remaining <= 0;

  return {
    tier,
    tierLabel,
    subscriptionPlan: planId,
    isTrialActive: isTrial,
    trialDaysRemaining: trialDaysLeft,
    limit,
    used,
    remaining,
    masterLimit,
    singleLimit,
    masterRemaining,
    singleRemaining,
    isUnlimited: false,
    isExceeded,
    isMasterExceeded,
    isSingleExceeded,
    resetHoursRemaining: hours,
    resetMinutesRemaining: minutes,
    formattedResetTime: formatted
  };
}

// Fetch live server rate limit status
export async function fetchServerRateLimitStatus(
  user: User | null,
  planId: SubscriptionPlanId = 'free',
  isTrial: boolean = false
): Promise<RateLimitStatus | null> {
  try {
    const visitorId = getVisitorDeviceId();
    const headers: Record<string, string> = {
      'x-visitor-id': visitorId,
      'x-subscription-plan': planId,
      'x-trial-active': isTrial ? 'true' : 'false'
    };
    if (user?.email) headers['x-user-email'] = user.email;
    if (user?.uid) headers['x-user-id'] = user.uid;

    const res = await fetch('/api/rate-limit/status', { headers });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;

    const status: RateLimitStatus = {
      tier: data.tier,
      tierLabel: data.tierLabel,
      subscriptionPlan: data.subscriptionPlan || planId,
      isTrialActive: Boolean(data.isTrialActive),
      trialDaysRemaining: data.trialDaysRemaining || 0,
      limit: data.dailyLimit,
      used: data.unitsUsed,
      remaining: data.unitsRemaining,
      masterLimit: data.dailyLimit ? Math.floor(data.dailyLimit / MASTER_AUDIT_COST) : Infinity,
      singleLimit: data.dailyLimit ? Math.floor(data.dailyLimit / SINGLE_ENGINE_COST) : Infinity,
      masterRemaining: data.masterAuditsRemaining,
      singleRemaining: data.singleEnginesRemaining,
      isUnlimited: data.isUnlimited,
      isExceeded: data.isExceeded,
      isMasterExceeded: !data.isUnlimited && (data.unitsRemaining < MASTER_AUDIT_COST),
      isSingleExceeded: !data.isUnlimited && (data.unitsRemaining < SINGLE_ENGINE_COST),
      resetHoursRemaining: Math.floor(data.resetInSeconds / 3600),
      resetMinutesRemaining: Math.floor((data.resetInSeconds % 3600) / 60),
      formattedResetTime: data.formattedResetTime,
      resetAtUtc: data.resetAt,
      burstLimit: data.burstLimit,
      burstRemaining: data.burstRemaining
    };

    // Update local cache
    if (!data.isUnlimited) {
      const dateKey = getCurrentDateKey();
      const identifier = user ? `usr_${user.uid}` : `vis_${visitorId}`;
      localStorage.setItem(`catalyst_rate_limit_${dateKey}_${identifier}`, String(data.unitsUsed));
      window.dispatchEvent(new CustomEvent('catalyst-rate-limit-updated', { detail: status }));
    }

    return status;
  } catch (err) {
    console.warn("Failed to fetch rate limit from server, using local fallback", err);
    return null;
  }
}

// Record an audit launch & increment usage
export function recordAuditLaunch(
  user: User | null, 
  isAdmin: boolean, 
  auditType: 'master' | 'single' = 'master',
  planId: SubscriptionPlanId = 'free',
  isTrial: boolean = false,
  trialDaysLeft: number = 0
): { allowed: boolean; status: RateLimitStatus } {
  const currentStatus = getRateLimitStatus(user, isAdmin, planId, isTrial, trialDaysLeft);

  if (currentStatus.isUnlimited) {
    return { allowed: true, status: currentStatus };
  }

  const cost = auditType === 'master' ? MASTER_AUDIT_COST : SINGLE_ENGINE_COST;

  if (currentStatus.remaining < cost) {
    return { allowed: false, status: currentStatus };
  }

  const dateKey = getCurrentDateKey();
  const identifier = user ? `usr_${user.uid}` : `vis_${getVisitorDeviceId()}`;
  const storageKey = `catalyst_rate_limit_${dateKey}_${identifier}`;

  const newUsed = currentStatus.used + cost;
  try {
    localStorage.setItem(storageKey, String(newUsed));
  } catch (err) {
    console.warn("Could not persist rate limit count to localStorage:", err);
  }

  const updatedStatus = getRateLimitStatus(user, isAdmin, planId, isTrial, trialDaysLeft);
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('catalyst-rate-limit-updated', { detail: updatedStatus }));
  }
  return { allowed: true, status: updatedStatus };
}

// Record arbitrary unit deduction from API playground or custom client execution
export function recordClientRequestAttempt(
  cost: number, 
  user: User | null, 
  isAdmin: boolean,
  planId: SubscriptionPlanId = 'free',
  isTrial: boolean = false,
  trialDaysLeft: number = 0
): { allowed: boolean; status: RateLimitStatus } {
  const currentStatus = getRateLimitStatus(user, isAdmin, planId, isTrial, trialDaysLeft);

  if (currentStatus.isUnlimited) {
    return { allowed: true, status: currentStatus };
  }

  if (currentStatus.remaining < cost) {
    return { allowed: false, status: currentStatus };
  }

  const dateKey = getCurrentDateKey();
  const identifier = user ? `usr_${user.uid}` : `vis_${getVisitorDeviceId()}`;
  const storageKey = `catalyst_rate_limit_${dateKey}_${identifier}`;

  const newUsed = currentStatus.used + cost;
  try {
    localStorage.setItem(storageKey, String(newUsed));
  } catch (err) {
    console.warn("Could not persist rate limit count to localStorage:", err);
  }

  const updatedStatus = getRateLimitStatus(user, isAdmin, planId, isTrial, trialDaysLeft);
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('catalyst-rate-limit-updated', { detail: updatedStatus }));
  }
  return { allowed: true, status: updatedStatus };
}
