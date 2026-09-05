import type { User } from '../lib/firebase';
import { SubscriptionPlanId } from '../types';

export type UserRole = 
  | 'anonymous' 
  | 'user' 
  | 'starter' 
  | 'pro' 
  | 'team' 
  | 'enterprise' 
  | 'superadmin';

export type AppPermission = 
  | 'page:view_public'
  | 'page:view_dashboard'
  | 'page:view_admin'
  | 'feature:single_engine_audit'
  | 'feature:master_audit'
  | 'feature:deep_vulnerability_matrix'
  | 'feature:white_label_export'
  | 'feature:create_api_keys'
  | 'feature:api_access'
  | 'feature:manage_monitoring'
  | 'feature:write_blogs'
  | 'feature:system_health'
  | 'feature:bypass_rate_limits';

export interface RoleConfig {
  role: UserRole;
  displayName: string;
  shortLabel: string;
  tagline: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dailyComputeUnits: number;
  maxMonitoredSites: number;
  ciParallelRunners: number;
  canCreateApiKeys: boolean;
  canExportWhiteLabel: boolean;
  canWriteBlogs: boolean;
  canAccessAdmin: boolean;
  isUnlimited: boolean;
  permissions: AppPermission[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  anonymous: {
    role: 'anonymous',
    displayName: 'Guest Visitor',
    shortLabel: 'Guest',
    tagline: 'Public explorer with basic instant diagnostics',
    colorClass: 'text-muted-foreground',
    badgeBg: 'bg-muted0/10',
    badgeText: 'text-muted-foreground',
    badgeBorder: 'border-border',
    dailyComputeUnits: 20,
    maxMonitoredSites: 0,
    ciParallelRunners: 0,
    canCreateApiKeys: false,
    canExportWhiteLabel: false,
    canWriteBlogs: false,
    canAccessAdmin: false,
    isUnlimited: false,
    permissions: [
      'page:view_public',
      'feature:single_engine_audit'
    ]
  },
  user: {
    role: 'user',
    displayName: 'Community Developer',
    shortLabel: 'Free',
    tagline: 'Authenticated developer with personal saved reports',
    colorClass: 'text-sky-400',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-500/30',
    dailyComputeUnits: 50,
    maxMonitoredSites: 1,
    ciParallelRunners: 1,
    canCreateApiKeys: false,
    canExportWhiteLabel: false,
    canWriteBlogs: false,
    canAccessAdmin: false,
    isUnlimited: false,
    permissions: [
      'page:view_public',
      'page:view_dashboard',
      'feature:single_engine_audit',
      'feature:master_audit',
      'feature:manage_monitoring'
    ]
  },
  starter: {
    role: 'starter',
    displayName: 'Starter Pro',
    shortLabel: 'Starter',
    tagline: 'Paid solo tier with 150 daily compute & monitored domains',
    colorClass: 'text-teal-400',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-300',
    badgeBorder: 'border-teal-500/30',
    dailyComputeUnits: 150,
    maxMonitoredSites: 3,
    ciParallelRunners: 2,
    canCreateApiKeys: false,
    canExportWhiteLabel: false,
    canWriteBlogs: false,
    canAccessAdmin: false,
    isUnlimited: false,
    permissions: [
      'page:view_public',
      'page:view_dashboard',
      'feature:single_engine_audit',
      'feature:master_audit',
      'feature:manage_monitoring'
    ]
  },
  pro: {
    role: 'pro',
    displayName: 'Pro Subscriber',
    shortLabel: 'Pro',
    tagline: 'High-throughput engineer with REST API & LLMO search',
    colorClass: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/30',
    dailyComputeUnits: 500,
    maxMonitoredSites: 20,
    ciParallelRunners: 5,
    canCreateApiKeys: true,
    canExportWhiteLabel: false,
    canWriteBlogs: true,
    canAccessAdmin: false,
    isUnlimited: false,
    permissions: [
      'page:view_public',
      'page:view_dashboard',
      'feature:single_engine_audit',
      'feature:master_audit',
      'feature:deep_vulnerability_matrix',
      'feature:manage_monitoring',
      'feature:create_api_keys',
      'feature:api_access',
      'feature:write_blogs'
    ]
  },
  team: {
    role: 'team',
    displayName: 'Team / Agency Lead',
    shortLabel: 'Team',
    tagline: 'Multi-seat workspace with shared telemetry & 60-min probes',
    colorClass: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-500/30',
    dailyComputeUnits: 1500,
    maxMonitoredSites: 50,
    ciParallelRunners: 10,
    canCreateApiKeys: true,
    canExportWhiteLabel: false,
    canWriteBlogs: true,
    canAccessAdmin: false,
    isUnlimited: false,
    permissions: [
      'page:view_public',
      'page:view_dashboard',
      'feature:single_engine_audit',
      'feature:master_audit',
      'feature:deep_vulnerability_matrix',
      'feature:manage_monitoring',
      'feature:create_api_keys',
      'feature:api_access',
      'feature:write_blogs'
    ]
  },
  enterprise: {
    role: 'enterprise',
    displayName: 'Enterprise Architect',
    shortLabel: 'Enterprise',
    tagline: 'Full enterprise suite with white-labeling & 1-min probes',
    colorClass: 'text-purple-400',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-500/30',
    dailyComputeUnits: 5000,
    maxMonitoredSites: 9999,
    ciParallelRunners: 25,
    canCreateApiKeys: true,
    canExportWhiteLabel: true,
    canWriteBlogs: true,
    canAccessAdmin: false,
    isUnlimited: false,
    permissions: [
      'page:view_public',
      'page:view_dashboard',
      'feature:single_engine_audit',
      'feature:master_audit',
      'feature:deep_vulnerability_matrix',
      'feature:white_label_export',
      'feature:create_api_keys',
      'feature:api_access',
      'feature:manage_monitoring',
      'feature:write_blogs'
    ]
  },
  superadmin: {
    role: 'superadmin',
    displayName: 'System Superadmin',
    shortLabel: 'Superadmin',
    tagline: 'Full platform administrative privileges & unlimited compute',
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/30',
    dailyComputeUnits: 999999,
    maxMonitoredSites: 999999,
    ciParallelRunners: 99,
    canCreateApiKeys: true,
    canExportWhiteLabel: true,
    canWriteBlogs: true,
    canAccessAdmin: true,
    isUnlimited: true,
    permissions: [
      'page:view_public',
      'page:view_dashboard',
      'page:view_admin',
      'feature:single_engine_audit',
      'feature:master_audit',
      'feature:deep_vulnerability_matrix',
      'feature:white_label_export',
      'feature:create_api_keys',
      'feature:api_access',
      'feature:manage_monitoring',
      'feature:write_blogs',
      'feature:system_health',
      'feature:bypass_rate_limits'
    ]
  }
};

/**
 * Determine the user's role based on Auth state, superadmin custom claim/email, and active subscription plan.
 */
export function resolveUserRole(
  user: User | null,
  isAdmin: boolean,
  planId: SubscriptionPlanId = 'free',
  isTrialActive: boolean = false
): UserRole {
  if (!user) {
    return 'anonymous';
  }

  if (isAdmin) {
    return 'superadmin';
  }

  // Check active plan or trial
  const effectivePlan = isTrialActive && planId === 'free' ? 'pro' : planId;

  switch (effectivePlan) {
    case 'enterprise':
      return 'enterprise';
    case 'team':
      return 'team';
    case 'pro':
      return 'pro';
    case 'starter':
      return 'starter';
    case 'free':
    default:
      return 'user';
  }
}

/**
 * Check if a given role has a specific permission
 */
export function hasPermission(role: UserRole, permission: AppPermission, isTrialActive = false): boolean {
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  if (permission === 'feature:write_blogs' && isTrialActive && role !== 'superadmin') {
    return false;
  }
  return config.permissions.includes(permission);
}

/**
 * Check route-level access for a given pathname and user role
 */
export function checkRouteAccess(
  pathname: string,
  role: UserRole,
  isTrialActive = false
): { allowed: boolean; reason?: string; requiredRole?: UserRole; requiredPlan?: string } {
  // Admin Routes: Superadmin Only
  if (pathname.startsWith('/admin')) {
    if (role === 'superadmin') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Administrator Command Center requires Superadmin token claim privileges.',
      requiredRole: 'superadmin'
    };
  }

  // Blog Authoring / Editing: Pro, Team, Enterprise, Superadmin
  if (
    pathname.startsWith('/blogs/create') ||
    pathname.startsWith('/blogs/new') ||
    pathname.startsWith('/blogs/edit') ||
    pathname.startsWith('/blog/create') ||
    pathname.startsWith('/blog/new') ||
    pathname.startsWith('/blog/edit') ||
    pathname.startsWith('/dashboard/blogs/create') ||
    pathname.startsWith('/dashboard/blogs/new') ||
    pathname.startsWith('/dashboard/blogs/edit')
  ) {
    if (role === 'anonymous') {
      return {
        allowed: false,
        reason: 'Sign in to access technical authoring and research publishing studios.',
        requiredRole: 'user'
      };
    }
    if (hasPermission(role, 'feature:write_blogs')) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Publishing research articles requires an active Pro, Team, or Enterprise membership.',
      requiredRole: 'pro',
      requiredPlan: 'Pro'
    };
  }

  // Dashboard Routes: Any authenticated user
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/user-dashboard')) {
    if (role !== 'anonymous') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Sign in with Google to view persistent audit dossiers, telemetry analytics, and domain probes.',
      requiredRole: 'user'
    };
  }

  // All other public routes are allowed for all roles
  return { allowed: true };
}
