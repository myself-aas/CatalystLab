import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRateLimitStatus, fetchServerRateLimitStatus, RateLimitStatus, MASTER_AUDIT_COST, SINGLE_ENGINE_COST } from '../utils/rateLimiter';
import { 
  AlertTriangle, 
  Flame, 
  Clock, 
  LogIn, 
  Key, 
  Sparkles, 
  Crown, 
  Info, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RateLimitThresholdAlertProps {
  currentStatus?: RateLimitStatus | null;
  endpointPath?: string;
  compact?: boolean;
  className?: string;
  onOpenRateLimitModal?: () => void;
  showAllStates?: boolean;
}

export const RateLimitThresholdAlert: React.FC<RateLimitThresholdAlertProps> = ({
  currentStatus: propStatus,
  endpointPath = '/api/run-engine',
  compact = false,
  className = '',
  onOpenRateLimitModal,
  showAllStates = false
}) => {
  const { user, isAdmin, login } = useAuth();
  const [status, setStatus] = useState<RateLimitStatus>(() => propStatus || getRateLimitStatus(user, isAdmin));
  const [syncing, setSyncing] = useState(false);

  // Sync rate limit status from props or live server
  useEffect(() => {
    if (propStatus) {
      setStatus(propStatus);
    } else {
      const local = getRateLimitStatus(user, isAdmin);
      setStatus(local);
    }
  }, [propStatus, user, isAdmin]);

  // Listen to custom rate limit update events emitted during API calls
  useEffect(() => {
    const handleUpdate = (e: CustomEvent<RateLimitStatus>) => {
      if (e.detail) {
        setStatus(e.detail);
      }
    };
    window.addEventListener('catalyst-rate-limit-updated' as any, handleUpdate as any);
    return () => {
      window.removeEventListener('catalyst-rate-limit-updated' as any, handleUpdate as any);
    };
  }, []);

  const handleRefresh = async () => {
    setSyncing(true);
    const serverStatus = await fetchServerRateLimitStatus(user);
    if (serverStatus) {
      setStatus(serverStatus);
    } else {
      setStatus(getRateLimitStatus(user, isAdmin));
    }
    setTimeout(() => setSyncing(false), 500);
  };

  // Primary superadmin bypass
  if (status.isUnlimited || isAdmin) {
    if (!showAllStates) return null;
    return (
      <div className={`rounded-xl border border-border bg-background/90 px-4 py-3 text-xs text-foreground backdrop-blur-md shadow-sm ${className}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/30 text-sky-400 border border-sky-400/30">
              <Crown className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <span>Primary Superadmin Bypassing Engine Rate Limits</span>
                <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 text-[10px] font-mono font-bold border border-emerald-500/40">UNLIMITED</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                All single engine scans (<code className="text-sky-400">{endpointPath}</code>) and master audits execute with zero quota deductions.
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Refresh quota status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  const limit = status.limit || 20;
  const remaining = status.remaining;
  const used = status.used;
  const percentage = Math.max(0, Math.min(100, Math.round((remaining / limit) * 100)));

  const isHit = remaining <= 0 || status.isExceeded;
  const isApproaching = !isHit && (remaining <= Math.ceil(limit * 0.25) || remaining <= 5);

  // If normal and showAllStates is false, return nothing or compact badge
  if (!isHit && !isApproaching && !showAllStates) {
    return null;
  }

  // HIT / EXCEEDED STATE (HTTP 429)
  if (isHit) {
    if (compact) {
      return (
        <div className={`inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 font-mono ${className}`}>
          <Flame className="h-4 w-4 text-rose-600 animate-pulse" />
          <span className="font-bold">Rate Limit Exceeded (0/{limit} Units Left)</span>
          <span className="text-[10px] text-rose-600 border-l border-rose-200 pl-2">
            Resets in {status.formattedResetTime}
          </span>
        </div>
      );
    }

    return (
      <div 
        id="rate-limit-exceeded-alert"
        className={`rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 text-foreground backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-300 bg-rose-100 text-rose-600 shadow-inner">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-base text-rose-900">
                  Rate Limit Threshold Reached (429 Too Many Requests)
                </span>
                <span className="rounded-md border border-rose-300 bg-rose-100 px-2 py-0.5 text-[11px] font-mono font-bold text-rose-800">
                  0 / {limit} Units Remaining
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-2xl">
                You have reached your daily compute allocation for <code className="font-mono text-rose-700 font-semibold">{endpointPath}</code>. 
                Single engine requests cost <strong>{SINGLE_ENGINE_COST} unit</strong> and Master Audits cost <strong>{MASTER_AUDIT_COST} units</strong>.
              </p>
              
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Midnight UTC Reset in {status.formattedResetTime}</span>
                </div>
                <span>•</span>
                <div>Tier: <strong className="text-foreground">{status.tierLabel}</strong></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {!user ? (
              <button
                onClick={() => login()}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover border border-border px-4 py-2.5 text-xs font-bold text-primary-foreground transition-all shadow-xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In (+30 Units/Day)</span>
              </button>
            ) : (
              <Link
                to="/user-dashboard?tab=api-keys"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover transition-all shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Key className="h-4 w-4 text-amber-300" />
                <span>Get Pro API Key (500/day)</span>
              </Link>
            )}

            {onOpenRateLimitModal && (
              <button
                onClick={onOpenRateLimitModal}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Info className="h-3.5 w-3.5" />
                <span>Tier Details</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // APPROACHING THRESHOLD WARNING STATE (<= 25% or <= 5 units)
  if (isApproaching) {
    if (compact) {
      return (
        <div className={`inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 font-mono ${className}`}>
          <AlertTriangle className="h-4 w-4 text-amber-600 animate-bounce" />
          <span className="font-bold">Approaching Rate Limit: {remaining} / {limit} Units Remaining</span>
          <span className="text-[10px] text-amber-700 border-l border-amber-200 pl-2">
            Resets in {status.formattedResetTime}
          </span>
        </div>
      );
    }

    return (
      <div 
        id="rate-limit-approaching-alert"
        className={`rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 text-foreground backdrop-blur-md shadow-md animate-in fade-in duration-200 ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-amber-100 text-amber-700 shadow-inner">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-base text-amber-950">
                  Approaching Rate Limit Threshold
                </span>
                <span className="rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-900">
                  {remaining} of {limit} Compute Units Left ({percentage}%)
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-2xl">
                You have consumed <strong>{used} units</strong> today. You can run <strong>{status.singleRemaining} more single engine scans</strong> or <strong>{status.masterRemaining} more master multi-engine audits</strong> before throttling begins.
              </p>

              {/* Visual Progress Bar */}
              <div className="mt-3 max-w-md">
                <div className="h-2 w-full overflow-hidden rounded-full bg-accent border border-border">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${100 - percentage}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>{used} units used</span>
                  <span className="text-amber-700 font-bold">{remaining} units remaining</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {!user ? (
              <button
                onClick={() => login()}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover transition-all shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In (+30 Units/Day)</span>
              </button>
            ) : (
              <Link
                to="/user-dashboard?tab=api-keys"
                className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-100 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-200 transition-all shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Key className="h-4 w-4 text-amber-600" />
                <span>Pro API Keys (500/day)</span>
              </Link>
            )}

            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Sync status with server"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // NORMAL / GOOD STANDING INFO STATE
  return (
    <div className={`rounded-xl border border-border bg-muted/90 p-3.5 text-foreground backdrop-blur-md shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-50 text-emerald-600">
            <Zap className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{status.tierLabel} Quota Allocation</span>
              <span className="rounded-md border border-emerald-500/30 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
                {remaining} / {limit} Units Available ({percentage}%)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Single engines: <strong>1 unit</strong> ({status.singleRemaining} left) • Master audits: <strong>10 units</strong> ({status.masterRemaining} left) • Reset in <strong>{status.formattedResetTime}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!user && (
            <button
              onClick={() => login()}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign In (50 Units/Day)
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Refresh quota count"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateLimitThresholdAlert;
