import React, { useState } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import { SUBSCRIPTION_PLANS } from '../../data/pricingData';
import { SubscriptionPlanId } from '../../types';
import { 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Clock, 
  CreditCard,
  Lock,
  Cpu,
  Layers
} from 'lucide-react';
import { logger } from '../../lib/logger';

export const TrialActivationModal: React.FC = () => {
  const { 
    trialModalOpen, 
    closeTrialModal, 
    targetTrialPlan, 
    startTrial, 
    isTrialActive, 
    trialDaysRemaining,
    planId 
  } = useSubscription();
  const { user } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>(targetTrialPlan || 'pro');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Sync with prop change
  React.useEffect(() => {
    if (targetTrialPlan) {
      setSelectedPlan(targetTrialPlan);
    }
  }, [targetTrialPlan]);

  if (!trialModalOpen) return null;

  const plan = SUBSCRIPTION_PLANS[selectedPlan] || SUBSCRIPTION_PLANS.pro;

  const handleActivate = async () => {
    setLoading(true);
    try {
      const ok = await startTrial(selectedPlan);
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          closeTrialModal();
        }, 1600);
      }
    } catch (err) {
      logger.error(err);
    } finally {
      setLoading(false);
    }
  };

  const paidTiers: SubscriptionPlanId[] = ['starter', 'pro', 'team', 'enterprise'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="trial-activation-modal-card"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-white animate-scaleUp"
      >
        {/* Header gradient bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />

        {/* Close Button */}
        <button 
          onClick={closeTrialModal}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5" /> 7-Day Free Trial
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" /> No credit card required
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Unlock Full <span className="text-cyan-500">{plan.name} Tier</span> for 7 Days
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Experience our 8 parallel diagnostic engines, automated CI/CD runners, and high-frequency edge latency probes with zero billing lock-in.
          </p>

          {/* Tier Switcher within Modal */}
          <div className="mt-6">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Trial Tier:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {paidTiers.map((tierKey) => {
                const item = SUBSCRIPTION_PLANS[tierKey];
                const isSelected = selectedPlan === tierKey;
                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setSelectedPlan(tierKey)}
                    className={`relative p-3 rounded-xl text-left border transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/10 border-cyan-500 shadow-md text-white' 
                        : 'bg-white/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {item.popular && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-500 text-black">
                        POPULAR
                      </span>
                    )}
                    <div className="text-xs font-medium text-slate-400">{item.name}</div>
                    <div className="text-lg font-bold text-white mt-0.5">
                      ${item.priceMonthly}<span className="text-xs text-slate-400 font-normal">/mo</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium mt-1">
                      {item.dailyComputeUnits} units/day
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Plan Highlights Box */}
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-slate-700/80">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-3 border-b border-slate-700/40">
              <span className="flex items-center gap-1.5 text-white">
                <Cpu className="w-4 h-4 text-cyan-500" /> {plan.dailyComputeUnits} Daily Compute Units
              </span>
              <span className="text-emerald-400 font-mono">
                {plan.masterAuditsPerDay} Master / {plan.singleEngineAuditsPerDay} Single Audits
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
              {plan.features.slice(0, 6).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Zero Risk Banner */}
          <div className="mt-5 flex items-center justify-between p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-risk guarantee: Automatically reverts to Free Community tier after 7 days unless you choose to upgrade.</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-700/60">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              {user ? (
                <span>Signed in as <strong className="text-white">{user.email}</strong></span>
              ) : (
                <span>Requires Google sign-in (1-click, no password needed)</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={closeTrialModal}
                className="w-1/2 sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleActivate}
                disabled={loading || success}
                className={`w-1/2 sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  success
                    ? 'bg-emerald-500 text-white'
                    : 'bg-black hover:bg-gray-800 border border-gray-200 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Activating...</span>
                  </>
                ) : success ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Trial Activated!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Activate 7-Day Trial</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
