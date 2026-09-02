import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getRateLimitStatus, VISITOR_DAILY_LIMIT, FREE_DAILY_LIMIT } from '../utils/rateLimiter';
import { SUBSCRIPTION_PLANS } from '../data/pricingData';
import { 
  X, 
  Zap, 
  Crown, 
  User as UserIcon, 
  Globe, 
  Clock, 
  LogIn, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { logger } from '../lib/logger';

interface RateLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'limit_reached' | 'info';
}

export const RateLimitModal: React.FC<RateLimitModalProps> = ({ 
  isOpen, 
  onClose,
  reason = 'info' 
}) => {
  const { user, isAdmin, login } = useAuth();
  const { openTrialModal, isTrialActive, trialDaysRemaining, planId } = useSubscription();
  const status = getRateLimitStatus(user, isAdmin);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl text-foreground">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Rate Limit Modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${
            (status.isMasterExceeded || status.isSingleExceeded)
              ? 'border-rose-500/40 bg-rose-500/20 text-rose-400' 
              : 'border-border bg-foreground/20 text-muted-foreground'
          }`}>
            {(status.isMasterExceeded || status.isSingleExceeded) ? <AlertTriangle className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {(status.isMasterExceeded || status.isSingleExceeded)
                ? `${status.tierLabel} Limit Reached` 
                : 'Audit Rate Limit & Compute Quota'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              CatalystLab Precision Telemetry Engine Allocation
            </p>
          </div>
        </div>

        {/* Limit Warning (If Exceeded) */}
        {(status.isMasterExceeded || status.isSingleExceeded) && (
          <div className="mb-5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-foreground space-y-2">
            <div className="flex items-center justify-between text-rose-300 font-bold">
              <span>Daily Quota Exhausted: {status.used} / {status.limit} Units</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="h-3.5 w-3.5" />
                <span>Resets in {status.formattedResetTime}</span>
              </span>
            </div>
            <p className="text-muted-foreground">
              {user 
                ? `You have reached your daily quota on the ${status.tierLabel} tier (${status.limit} units). Start a 7-day free trial on Pro ($19/mo) or Team ($49/mo) with zero credit card required to instantly unlock higher limits!`
                : 'You have used all your complimentary guest allocation of 2 master audits (or 20 single engines). Sign in with Google to immediately unlock 50 compute units/day for free.'}
            </p>
          </div>
        )}

        {/* Active Trial Notice */}
        {isTrialActive && (
          <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs flex items-center justify-between text-emerald-200">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>7-Day Free Trial Active ({trialDaysRemaining} days left)</span>
            </div>
            <span className="font-mono text-[11px] uppercase bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-600">
              {planId} Tier
            </span>
          </div>
        )}

        {/* Tier Breakdown Cards */}
        <div className="space-y-2.5 mb-6 max-h-[260px] overflow-y-auto pr-1">
          
          {/* Free Tier */}
          <div className={`rounded-xl border p-3 transition-colors ${
            status.tier === 'free' 
              ? 'border-black bg-accent shadow-sm' 
              : 'border-border bg-muted'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-foreground" />
                <span className="text-xs font-bold text-foreground">1. Community (Free)</span>
              </div>
              <span className="rounded-md bg-background border border-black/30 px-2 py-0.5 text-[10px] font-mono font-bold text-foreground">
                {FREE_DAILY_LIMIT} Units / Day
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 pl-6">
              5 Master Audits or 50 Single Engines. 25 CI/CD runs/month.
            </p>
          </div>

          {/* Starter ($9) / Pro ($19) Tier with 7-day trial trigger */}
          <div className={`rounded-xl border p-3 transition-colors ${
            status.tier === 'pro' || status.tier === 'starter'
              ? 'border-black bg-accent shadow-sm' 
              : 'border-border bg-muted'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-foreground" />
                <span className="text-xs font-bold text-foreground">2. Starter ($9) &amp; Pro ($19)</span>
              </div>
              <span className="rounded-md bg-primary/15 border border-black/30 px-2 py-0.5 text-[10px] font-mono font-bold text-foreground">
                150 - 500 Units / Day
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 pl-6">
              15 - 50 Master Audits, 100 - 500 CI/CD runs, continuous 42-PoP radar tracking.
            </p>
          </div>

          {/* Team ($49) & Enterprise ($99) */}
          <div className={`rounded-xl border p-3 transition-colors ${
            status.tier === 'team' || status.tier === 'enterprise' || status.tier === 'superadmin'
              ? 'border-black bg-accent shadow-sm' 
              : 'border-border bg-muted'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-foreground" />
                <span className="text-xs font-bold text-foreground">3. Team ($49) &amp; Enterprise ($99)</span>
              </div>
              <span className="rounded-md bg-primary/15 border border-black/30 px-2 py-0.5 text-[10px] font-mono font-bold text-foreground">
                1,500 - 5,000 Units / Day
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 pl-6">
              Multi-seat workspaces, unlimited CI/CD pipelines, dedicated runners, private SLA.
            </p>
          </div>

        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-foreground" />
            <span>Daily reset in <strong className="text-foreground">{status.formattedResetTime}</strong></span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!user ? (
              <button
                onClick={async () => {
                  try {
                    await login();
                    onClose();
                  } catch (e) { logger.error("Ignored error:", e); }
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover border border-border px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In for 50 Units Free</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onClose();
                    openTrialModal('pro');
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover border border-border px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <span>Start 7-Day Trial</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <Link
                  to="/pricing"
                  onClick={onClose}
                  className="rounded-xl bg-accent border border-border px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Plans
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
