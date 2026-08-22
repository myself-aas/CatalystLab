import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import { Zap, Sparkles, Clock, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TrialBanner: React.FC = () => {
  const { isTrialActive, trialDaysRemaining, planId, currentPlan, openTrialModal } = useSubscription();
  const { user } = useAuth();

  if (isTrialActive) {
    return (
      <div 
        id="catalyst-active-trial-banner"
        className="w-full bg-gradient-to-r from-emerald-950/90 via-brand-navy to-indigo-950/90 border-b border-emerald-500/30 px-4 py-2 text-xs text-slate-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5 animate-pulse" /> Active {currentPlan.name} Trial
            </span>
            <span className="text-slate-300 hidden sm:inline">
              You have <strong className="text-emerald-400">{trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining</strong> with {currentPlan.dailyComputeUnits} units/day quota unlocked.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View Plan Features <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is on Free tier, offer a subtle banner to start 7-day trial
  return (
    <div 
      id="catalyst-start-trial-banner"
      className="w-full bg-brand-surface/90 border-b border-brand-border/60 px-4 py-1.5 text-xs text-slate-300"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan font-medium border border-brand-cyan/20">
            <Sparkles className="w-3 h-3" /> Special Offer
          </span>
          <span className="text-slate-300">
            Try any Pro or Team plan free for 7 days. No credit card required.
          </span>
        </div>

        <button
          type="button"
          onClick={() => openTrialModal('pro')}
          className="inline-flex items-center gap-1 font-semibold text-brand-cyan hover:text-white transition-colors"
        >
          Start 7-Day Free Trial <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
