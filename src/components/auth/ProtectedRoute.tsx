import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useRoleSecurity } from '../../context/RoleSecurityContext';
import { AppPermission, UserRole, ROLE_CONFIGS } from '../../utils/rolePermissions';
import { 
  ShieldAlert, 
  Lock, 
  LogIn, 
  ArrowLeft, 
  Zap, 
  Sparkles, 
  Crown,
  KeyRound,
  RotateCcw
} from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: AppPermission;
  requiredRole?: UserRole;
  minPlan?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  minPlan,
  fallbackTitle,
  fallbackDescription
}) => {
  const { user, login, loginWithLocalSession, loading: authLoading } = useAuth();
  const { openTrialModal } = useSubscription();
  const { effectiveRole, actualRole, isSimulating, setSimulatedRole, resetSimulation, hasPermission } = useRoleSecurity();
  const location = useLocation();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#415a77] border-t-cyan-400" />
        <span className="mt-3 text-sm font-mono text-[#c5d3e8]">Verifying RBAC Permissions...</span>
      </div>
    );
  }

  // Check superadmin requirement
  if (requiredRole === 'superadmin' || requiredPermission === 'page:view_admin') {
    if (effectiveRole !== 'superadmin') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 text-foreground">
          <div className="w-full max-w-lg rounded-3xl border border-[#415a77]/30 bg-[#0d1b2a] p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-6">
              <Lock className="h-8 w-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 mb-3">
              <KeyRound className="h-3.5 w-3.5" />
              <span>Superadmin Claim Required</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Access Restricted
            </h1>
            
            <p className="mt-3 text-sm text-[#c5d3e8] leading-relaxed">
              The route <code className="text-cyan-300 font-mono bg-[#152238] px-1.5 py-0.5 rounded">{location.pathname}</code> is protected by strict frontend &amp; backend security rules requiring superadmin privileges.
            </p>

            {isSimulating && (
              <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-200">
                <span>You are currently previewing as <strong>{ROLE_CONFIGS[effectiveRole].displayName}</strong>.</span>
                <button
                  onClick={() => setSimulatedRole('superadmin')}
                  className="mt-2 block w-full rounded-lg bg-cyan-600/40 py-1.5 font-bold hover:bg-cyan-600/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Switch Preview to Superadmin
                </button>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#415a77]/40 bg-[#152238] px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-[#1e2f4a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Go Back</span>
              </button>
              
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-[#33475e] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    const isGuest = effectiveRole === 'anonymous';
    const isUpgradeNeeded = !isGuest && (requiredPermission === 'feature:write_blogs' || requiredPermission === 'feature:white_label_export' || requiredPermission === 'feature:create_api_keys');

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 text-foreground">
        <div className="w-full max-w-lg rounded-3xl border border-[#415a77]/30 bg-background p-8 sm:p-10 text-center shadow-2xl text-foreground">
          
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#415a77]/25 text-[#c5d3e8] border border-[#415a77]/40 mb-6">
            {isUpgradeNeeded ? <Crown className="h-8 w-8 text-amber-400" /> : <Lock className="h-8 w-8 text-cyan-300" />}
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 mb-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Role Constraint: {requiredRole || minPlan || 'Elevated Role'} Required</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {fallbackTitle || (isUpgradeNeeded ? 'Subscription Upgrade Required' : 'Authentication Required')}
          </h1>
          
          <p className="mt-3 text-sm text-[#c5d3e8] leading-relaxed">
            {fallbackDescription || (
              isGuest 
                ? 'Sign in to access persistent developer tools, saved audits, and publishing features.'
                : `This capability requires ${minPlan || 'Pro membership'} or higher permissions.`
            )}
          </p>

          <div className="mt-6 rounded-2xl border border-[#415a77]/30 bg-[#152238] p-4 text-xs text-left">
            <div className="flex justify-between items-center text-[#c5d3e8] mb-1">
              <span>Your Current Role:</span>
              <span className={`font-bold uppercase ${ROLE_CONFIGS[effectiveRole].colorClass}`}>
                {ROLE_CONFIGS[effectiveRole].displayName}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              {ROLE_CONFIGS[effectiveRole].tagline}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {isGuest ? (
              <div className="space-y-2">
                <Link
                  to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover border border-border py-3 text-xs sm:text-sm font-bold text-primary-foreground transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In (Email, Gmail, GitHub)</span>
                </Link>

                <Link
                  to={`/signup?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-black/40 bg-background hover:bg-muted py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
                >
                  <span>Create Free Account &rarr;</span>
                </Link>

                <button
                  onClick={() => loginWithLocalSession({ email: 'developer@catalystlab.io', isAdmin: false })}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#415a77]/30 bg-[#0d1b2a] py-2 text-[11px] font-semibold text-muted-foreground hover:text-primary-foreground hover:bg-[#152238] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Instant Sandbox Preview Mode</span>
                </button>
              </div>
            ) : isUpgradeNeeded ? (
              <div className="space-y-2">
                <button
                  onClick={() => openTrialModal('pro')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover border border-border py-3 text-xs sm:text-sm font-bold text-primary-foreground transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Zap className="h-4 w-4" />
                  <span>Start 7-Day Pro Free Trial</span>
                </button>

                <Link
                  to="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#415a77]/40 bg-[#152238] py-2.5 text-xs font-semibold text-foreground hover:bg-[#1e2f4a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <span>Explore Telemetry Pricing Plans</span>
                </Link>
              </div>
            ) : null}

            {isSimulating && (
              <div className="pt-2">
                <button
                  onClick={resetSimulation}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Role Simulation (Actual: {ROLE_CONFIGS[actualRole].displayName})</span>
                </button>
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/"
                className="text-xs text-muted-foreground hover:text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                ← Return to Platform Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
