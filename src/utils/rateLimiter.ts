/**
 * Rate Limiter for CatalystLab Master Audits & Diagnostic Engines
 * 
 * Rules:
 * 1. Primary Superadmins: No rate limits (unlimited / day)
 * 2. Authenticated Users: 5 master audits/day OR 50 single engine audits/day (Total 50 units)
 * 3. Subscription Users: Calculable based on tier (extendable)
 * 4. Visitors / Guests: 2 master audits/day OR 20 single engine audits/day (Total 20 units)
 * 
 * 1 Master Audit = 10 Units
 * 1 Single Engine Audit = 1 Unit
 */

import type { User } from '../lib/firebase';
import { SUPERADMIN_EMAILS } from '../context/AuthContext';

export const VISITOR_DAILY_LIMIT = 20;
export const USER_DAILY_LIMIT = 50;
export const MASTER_AUDIT_COST = 10;
export const SINGLE_ENGINE_COST = 1;

export interface RateLimitStatus {
  tier: 'superadmin' | 'user' | 'visitor';
  tierLabel: string;
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

// Read current count for today
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

// Check rate limit status
export function getRateLimitStatus(user: User | null, isAdmin: boolean, subscriptionType: string = 'free'): RateLimitStatus {
  const { hours, minutes, formatted } = getTimeUntilMidnight();

  const userEmail = user?.email?.toLowerCase() || '';
  const isSuperadmin = isAdmin || (user != null && SUPERADMIN_EMAILS.includes(userEmail));

  if (isSuperadmin) {
    return {
      tier: 'superadmin',
      tierLabel: 'Primary Superadmin',
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
  
  // Calculate limits based on subscription types (Future-proofed)
  let limit = VISITOR_DAILY_LIMIT;
  if (isAuthUser) {
    if (subscriptionType === 'pro') {
      limit = 500; // Example custom tier
    } else {
      limit = USER_DAILY_LIMIT;
    }
  }

  const tier = isAuthUser ? 'user' : 'visitor';
  const tierLabel = isAuthUser ? 'Registered User' : 'Guest Visitor';
  
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

// Record an audit launch & increment usage
export function recordAuditLaunch(user: User | null, isAdmin: boolean, auditType: 'master' | 'single' = 'master'): { allowed: boolean; status: RateLimitStatus } {
  const currentStatus = getRateLimitStatus(user, isAdmin);

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

  const updatedStatus = getRateLimitStatus(user, isAdmin);
  return { allowed: true, status: updatedStatus };
}
