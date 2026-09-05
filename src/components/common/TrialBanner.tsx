import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import { Zap, Sparkles, Clock, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TrialBanner: React.FC = () => {
  const { isTrialActive, trialDaysRemaining, planId, currentPlan, openTrialModal } = useSubscription();
  const { user } = useAuth();

  React.useEffect(() => {
    if (isTrialActive) {
      document.documentElement.style.setProperty('--trial-banner-height', '2.25rem');
    } else {
      document.documentElement.style.setProperty('--trial-banner-height', '0px');
    }
    return () => {
      document.documentElement.style.setProperty('--trial-banner-height', '0px');
    };
  }, [isTrialActive]);

  if (isTrialActive) {
    return (
      <aside 
        id="catalyst-active-trial-banner"
        aria-label="Active subscription trial notification"
        className="fixed top-0 inset-x-0 z-50 h-9 bg-gradient-to-r from-emerald-950/95 via-background to-indigo-950/95 backdrop-blur-md border-b border-emerald-500/30 px-4 text-xs text-muted-foreground shadow-sm flex items-center"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 text-[11px]">
              <Zap className="w-3.5 h-3.5 animate-pulse" /> Active {currentPlan.name} Trial
            </span>
            <span className="text-muted-foreground hidden sm:inline text-xs">
              You have <strong className="text-emerald-400">{trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining</strong> with {currentPlan.dailyComputeUnits} units/day quota unlocked.
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              View Plan Features <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  // If no trial active, do not display the promotional top banner
  return null;
};

