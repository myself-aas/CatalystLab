import React from 'react';
import { useRoleSecurity } from '../../context/RoleSecurityContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import { AppPermission, UserRole, ROLE_CONFIGS } from '../../utils/rolePermissions';
import { Lock, Zap, LogIn, Sparkles, Crown } from 'lucide-react';

interface RoleContentGateProps {
  permission?: AppPermission;
  requiredPermission?: AppPermission;
  requiredRole?: UserRole;
  minPlan?: string;
  mode?: 'blur' | 'hide' | 'fallback';
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const RoleContentGate: React.FC<RoleContentGateProps> = ({
  permission,
  requiredPermission,
  requiredRole,
  minPlan = 'Pro',
  mode = 'blur',
  fallback,
  title,
  description,
  children
}) => {
  const { effectiveRole, hasPermission } = useRoleSecurity();
  const { openTrialModal } = useSubscription();
  const { user, login } = useAuth();

  const targetPermission = permission || requiredPermission;
  let isAllowed = true;
  if (targetPermission) {
    isAllowed = hasPermission(targetPermission);
  }
  if (requiredRole && effectiveRole !== requiredRole && effectiveRole !== 'superadmin') {
    if (requiredRole === 'pro' && !['pro', 'team', 'enterprise', 'superadmin'].includes(effectiveRole)) {
      isAllowed = false;
    } else if (requiredRole === 'enterprise' && !['enterprise', 'superadmin'].includes(effectiveRole)) {
      isAllowed = false;
    }
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  // If unauthorized and mode is hide, remove completely from DOM
  if (mode === 'hide') {
    return null;
  }

  // If custom fallback provided
  if (mode === 'fallback' && fallback) {
    return <>{fallback}</>;
  }

  const isGuest = effectiveRole === 'anonymous';

  // Blur overlay mode
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-[#415a77]/50 bg-primary/40 p-4">
      {/* Blurred background preview */}
      <div className="pointer-events-none filter blur-sm opacity-30 select-none aria-hidden">
        {children}
      </div>

      {/* Foreground Role Lock Callout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0b192c]/85 backdrop-blur-xs z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3 shadow-lg">
          {isGuest ? <Lock className="h-6 w-6" /> : <Crown className="h-6 w-6 text-amber-400" />}
        </div>

        <h4 className="text-base font-bold text-primary-foreground">
          {title || (isGuest ? 'Authentication Required' : `Unlock with ${minPlan}`)}
        </h4>

        <p className="mt-1 text-xs text-muted-foreground max-w-md leading-relaxed">
          {description || (
            isGuest
              ? 'Sign in to evaluate full telemetry diagnostics and save historical benchmarks.'
              : `This advanced capability is available on ${minPlan} and Enterprise tiers.`
          )}
        </p>

        <div className="mt-4 flex items-center gap-2">
          {isGuest ? (
            <button
              onClick={() => login()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-muted border border-border px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={() => openTrialModal('pro')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-muted border border-border px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Start 7-Day Free Trial</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleContentGate;
