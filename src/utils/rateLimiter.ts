/**
 * Rate Limiter for CatalystLab Master Audits & Diagnostic Engines
 * 
 * Rules:
 * 1. Primary Superadmins: No rate limits (unlimited / day)
 * 2. Authenticated Users: 10 audits / day
 * 3. Visitors / Guests: 5 audits / day
 */

import type { User } from '../lib/firebase';
import { SUPERADMIN_EMAILS } from '../context/AuthContext';

export const VISITOR_DAILY_LIMIT = 5;
export const USER_DAILY_LIMIT = 10;

export interface RateLimitStatus {
  tier: 'superadmin' | 'user' | 'visitor';
  tierLabel: string;
  limit: number | null; // null if unlimited
  used: number;
  remaining: number;
  isUnlimited: boolean;
  isExceeded: boolean;
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
export function getRateLimitStatus(user: User | null, isAdmin: boolean): RateLimitStatus {
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
      isUnlimited: true,
      isExceeded: false,
      resetHoursRemaining: hours,
      resetMinutesRemaining: minutes,
      formattedResetTime: formatted
    };
  }

  const isAuthUser = Boolean(user);
  const limit = isAuthUser ? USER_DAILY_LIMIT : VISITOR_DAILY_LIMIT;
  const tier = isAuthUser ? 'user' : 'visitor';
  const tierLabel = isAuthUser ? 'Registered User' : 'Guest Visitor';
  
  const used = getAuditUsageToday(user, false);
  const remaining = Math.max(0, limit - used);
  const isExceeded = remaining <= 0;

  return {
    tier,
    tierLabel,
    limit,
    used,
    remaining,
    isUnlimited: false,
    isExceeded,
    resetHoursRemaining: hours,
    resetMinutesRemaining: minutes,
    formattedResetTime: formatted
  };
}

// Record an audit launch & increment usage
export function recordAuditLaunch(user: User | null, isAdmin: boolean): { allowed: boolean; status: RateLimitStatus } {
  const currentStatus = getRateLimitStatus(user, isAdmin);

  if (currentStatus.isUnlimited) {
    return { allowed: true, status: currentStatus };
  }

  if (currentStatus.isExceeded) {
    return { allowed: false, status: currentStatus };
  }

  const dateKey = getCurrentDateKey();
  const identifier = user ? `usr_${user.uid}` : `vis_${getVisitorDeviceId()}`;
  const storageKey = `catalyst_rate_limit_${dateKey}_${identifier}`;

  const newUsed = currentStatus.used + 1;
  try {
    localStorage.setItem(storageKey, String(newUsed));
  } catch (err) {
    console.warn("Could not persist rate limit count to localStorage:", err);
  }

  const updatedStatus = getRateLimitStatus(user, isAdmin);
  return { allowed: true, status: updatedStatus };
}
