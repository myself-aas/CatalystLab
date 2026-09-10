import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import { Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TrialBanner: React.FC = () => {
  const { isTrialActive, trialDaysRemaining, currentPlan, openTrialModal } = useSubscription();
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
        className="fixed top-0 inset-x-0 z-50 h-9 bg-[#1F2223]/95 backdrop-blur-md border-b border-[rgba(240,250,255,0.08)] px-4 text-xs text-[rgba(240,250,255,0.7)] flex items-center"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(240,250,255,0.08)] text-[#F0FAFF] font-semibold border border-[rgba(240,250,255,0.12)] text-[10px]">
              <Zap className="w-3 h-3" /> Active {currentPlan.name} Trial
            </span>
            <span className="text-[rgba(240,250,255,0.6)] hidden sm:inline text-[11px]">
              You have <strong className="text-[#F0FAFF] font-semibold">{trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining</strong> with {currentPlan.dailyComputeUnits} units/day quota unlocked.
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1 font-semibold text-[#F0FAFF] hover:text-[#F7FDFF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(240,250,255,0.45)] rounded-full px-1"
            >
              View Plan Features <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  return null;
};

export default TrialBanner;
