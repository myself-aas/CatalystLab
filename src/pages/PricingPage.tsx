import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  Server, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  Shield, 
  User, 
  Users, 
  Building2, 
  Crown, 
  Eye, 
  RotateCcw, 
  Sliders,
  Calculator,
  Terminal as TerminalIcon
} from 'lucide-react';
import { UnsplashImage } from '../components/media/UnsplashImage';
import { SUBSCRIPTION_PLANS } from '../data/pricingData';
import { MASTER_FAQ_CATEGORIES } from '../data/faqData';
import { GlobalFaqSection } from '../components/common/GlobalFaqSection';
import { SEOHead } from '../components/common/SEOHead';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../components/common/LazyAnimate';
import { ParallaxSection } from '../components/common/ParallaxSection';
import { TelemetryRoiCalculator } from '../components/pricing/TelemetryRoiCalculator';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { useRoleSecurity } from '../context/RoleSecurityContext';
import { SubscriptionPlanId } from '../types';
import { UserRole, ROLE_CONFIGS } from '../utils/rolePermissions';

export const PricingPage: React.FC = () => {
  const [annual, setAnnual] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'calculator' | 'matrix' | 'simulator'>('plans');
  const [simulatorTargetTier, setSimulatorTargetTier] = useState<SubscriptionPlanId>('pro');

  const { planId, isTrialActive, trialDaysRemaining, openTrialModal } = useSubscription();
  const { user } = useAuth();
  const { 
    effectiveRole, 
    isSimulating, 
    setSimulatedRole, 
    resetSimulation 
  } = useRoleSecurity();

  const planOrder: SubscriptionPlanId[] = ['free', 'starter', 'pro', 'team', 'enterprise'];

  const roleOptions: { role: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { role: 'anonymous', label: 'Guest Visitor', icon: User },
    { role: 'user', label: 'Free Dev', icon: Sparkles },
    { role: 'pro', label: 'Pro Subscriber', icon: Zap },
    { role: 'team', label: 'Team Lead', icon: Users },
    { role: 'enterprise', label: 'Enterprise', icon: Building2 },
    { role: 'superadmin', label: 'Superadmin', icon: Crown }
  ];

  const handlePlanCta = (id: SubscriptionPlanId) => {
    if (id === 'free') {
      return;
    }
    openTrialModal(id);
  };

  const getCardCtaInfo = (cardPlanId: SubscriptionPlanId) => {
    if (effectiveRole === 'superadmin') {
      return {
        label: 'Superadmin Access (Bypass)',
        disabled: true,
        variant: 'superadmin',
        subtext: 'All limits bypassed across entire platform'
      };
    }

    const isCurrentPlan = (effectiveRole === 'anonymous' && cardPlanId === 'free') ||
      (effectiveRole === 'user' && cardPlanId === 'free' && !isTrialActive) ||
      (effectiveRole === 'pro' && (cardPlanId === 'pro' || cardPlanId === 'starter')) ||
      (effectiveRole === 'team' && cardPlanId === 'team') ||
      (effectiveRole === 'enterprise' && cardPlanId === 'enterprise');

    if (isCurrentPlan) {
      return {
        label: isTrialActive ? `Active 7-Day Trial (${trialDaysRemaining}d)` : 'Current Active Plan',
        disabled: true,
        variant: 'current',
        subtext: isTrialActive ? 'Reverts to Community upon expiry' : 'Active subscription tier'
      };
    }

    if (cardPlanId === 'free') {
      return {
        label: 'Community Scan',
        disabled: false,
        variant: 'free',
        subtext: 'Always free with 50 units/day'
      };
    }

    return {
      label: 'Start 7-Day Free Trial',
      disabled: false,
      variant: cardPlanId === 'pro' ? 'primary' : 'secondary',
      subtext: 'Login only • Zero card required'
    };
  };

  return (
    <div className="min-h-screen bg-[#060912] text-slate-100 pb-24 selection:bg-[#06B6D4]/30 selection:text-white font-mono">
      <SEOHead
        title="Terminal Billing Console & Telemetry ROI Calculator | CatalystLab"
        description="Explore CatalystLab's transparent 5-tier diagnostic plans ($0 Free, $9 Starter, $19 Pro, $49 Team, $99 Enterprise). Interactive CLI billing flags, ROI calculator, and RBAC matrix."
        keywords={['CatalystLab pricing', 'telemetry API plans', 'RBAC role preview', '7-day free trial no credit card', 'web audit pricing', 'telemetry ROI calculator']}
        canonicalPath="/pricing"
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-[#080D1A] py-16 sm:py-20">
        <UnsplashImage 
          assetId="pricing-header-texture" 
          className="absolute inset-0 opacity-[0.08] pointer-events-none object-cover w-full h-full" 
        />
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#06B6D4_1px,transparent_1px)] [background-size:24px_24px]" />

        <LazyReveal direction="down" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#0B101D] px-4 py-1 text-xs font-mono text-[#00F0FF] mb-6 shadow-sm">
            <TerminalIcon className="h-3.5 w-3.5" />
            <span>TERMINAL BILLING CONSOLE &bull; 5-TIER TELEMETRY ARCHITECTURE</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight font-sans">
            Precision Web Health &amp; Telemetry Plans
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Choose the exact compute throughput, automated probe frequencies, and REST API access suited for your engineering workflow. All paid tiers include a <strong className="text-white font-bold">7-day free trial with zero credit card requirements</strong>.
          </p>

          {/* Interactive Role Preview Switcher Bar */}
          <div className="mt-8 mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-[#0B101D] p-4 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#00F0FF]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Preview Platform As Role:
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Current:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] uppercase ${ROLE_CONFIGS[effectiveRole].badgeBg} ${ROLE_CONFIGS[effectiveRole].badgeText} ${ROLE_CONFIGS[effectiveRole].badgeBorder}`}>
                  {ROLE_CONFIGS[effectiveRole].displayName} {isSimulating ? '(Previewing)' : ''}
                </span>
                {isSimulating && (
                  <button
                    onClick={resetSimulation}
                    className="flex items-center gap-1 text-[11px] text-[#00F0FF] hover:underline cursor-pointer ml-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Role Options Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = effectiveRole === opt.role;

                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setSimulatedRole(opt.role)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#06B6D4] text-slate-950 border border-[#06B6D4] shadow-sm'
                        : 'bg-[#080D1A] text-slate-300 hover:bg-[#0E1526] border border-slate-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary View Switcher: Plans vs ROI Calculator vs RBAC Matrix vs Simulator */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-[#06B6D4] text-slate-950 shadow-sm border border-[#06B6D4]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0E1526]'
              }`}
            >
              Subscription Plans &amp; Pricing
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-[#06B6D4] text-slate-950 shadow-sm border border-[#06B6D4]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0E1526]'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Telemetry ROI Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-[#06B6D4] text-slate-950 shadow-sm border border-[#06B6D4]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0E1526]'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Role Matrix (RBAC)</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-[#06B6D4] text-slate-950 shadow-sm border border-[#06B6D4]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0E1526]'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Upgrade Simulator</span>
            </button>
          </div>

          {/* CLI-Style Billing Toggle */}
          {activeTab === 'plans' && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <span className="text-slate-500">FLAGS:</span>
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  !annual 
                    ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#00F0FF] font-bold' 
                    : 'bg-[#0B101D] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                --billing=monthly
              </button>

              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
                  annual 
                    ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#00F0FF] font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                    : 'bg-[#0B101D] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>--billing=annual</span>
                <span className="rounded bg-emerald-950/60 text-[#00FF66] border border-emerald-500/40 px-1.5 py-0.2 text-[10px]">
                  --save=20%
                </span>
              </button>
            </div>
          )}
        </LazyReveal>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        
        {/* TAB 1: 5-TIER PRICING CARDS */}
        {activeTab === 'plans' && (
          <div>
            <LazyStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch" staggerDelay={0.06}>
              {planOrder.map((key) => {
                const plan = SUBSCRIPTION_PLANS[key];
                const price = annual ? plan.priceAnnualMonthly : plan.priceMonthly;
                const isPopular = plan.popular;
                const ctaInfo = getCardCtaInfo(key);

                return (
                  <LazyStaggerItem
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-200 bg-[#080D1A] shadow-sm ${
                      isPopular
                        ? 'border-2 border-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,0.2)] lg:-translate-y-2'
                        : 'border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase shadow-sm whitespace-nowrap ${
                            isPopular
                              ? 'bg-[#06B6D4] text-slate-950'
                              : 'bg-[#0B101D] text-slate-300 border border-slate-800'
                          }`}
                        >
                          {isPopular && <Sparkles className="h-2.5 w-2.5 fill-current" />}
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      {/* Title & Description */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-white font-sans">{plan.name}</h3>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed font-sans">{plan.description}</p>
                      </div>

                      {/* Price Display */}
                      <div className="mb-5 pb-5 border-b border-slate-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white font-mono">
                            ${price}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            / month
                          </span>
                        </div>
                        {annual && plan.priceMonthly > 0 && (
                          <div className="mt-1 text-[11px] text-[#00FF66] font-mono">
                            Billed annually (${plan.priceAnnualTotal}/yr)
                          </div>
                        )}
                        {!annual && plan.priceMonthly > 0 && (
                          <div className="mt-1 text-[11px] text-slate-500 font-mono">
                            Billed monthly
                          </div>
                        )}
                        {plan.priceMonthly === 0 && (
                          <div className="mt-1 text-[11px] text-[#00F0FF] font-mono">
                            Free forever • No credit card
                          </div>
                        )}
                      </div>

                      {/* Core Compute Stats */}
                      <div className="mb-5 space-y-2 rounded-xl bg-[#060912] p-3 text-xs border border-slate-800/80 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Daily Compute:</span>
                          <span className="font-bold text-white">{plan.dailyComputeUnits} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Monitored Sites:</span>
                          <span className="font-bold text-white">{plan.monitoredSitesQuota}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Probe Rate:</span>
                          <span className="font-bold text-white">
                            {plan.probeFrequencyMinutes < 60 ? `${plan.probeFrequencyMinutes}m` : `${plan.probeFrequencyMinutes / 60}h`}
                          </span>
                        </div>
                      </div>

                      {/* Feature Checklist */}
                      <ul className="space-y-2 text-xs text-slate-300 mb-6 font-sans">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-[#00FF66] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handlePlanCta(plan.id)}
                        disabled={ctaInfo.disabled}
                        className={`w-full rounded-xl py-2.5 px-4 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          ctaInfo.disabled
                            ? 'bg-[#0B101D] text-slate-500 border border-slate-800 cursor-not-allowed'
                            : isPopular
                            ? 'bg-[#06B6D4] text-slate-950 hover:bg-[#00F0FF] shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : 'bg-[#0E1526] text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        <span>{ctaInfo.label}</span>
                        {!ctaInfo.disabled && <ArrowRight className="h-3.5 w-3.5" />}
                      </button>
                      <div className="mt-1.5 text-center text-[10px] text-slate-500 font-mono">
                        {ctaInfo.subtext}
                      </div>
                    </div>
                  </LazyStaggerItem>
                );
              })}
            </LazyStaggerContainer>
          </div>
        )}

        {/* TAB 2: INTERACTIVE ROI CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="max-w-5xl mx-auto">
            <TelemetryRoiCalculator 
              onSelectRecommendedPlan={(recPlan) => {
                setActiveTab('plans');
                handlePlanCta(recPlan);
              }}
            />
          </div>
        )}

        {/* TAB 3: ROLE & SECURITY MATRIX (RBAC) */}
        {activeTab === 'matrix' && (
          <div className="rounded-2xl border border-slate-800 bg-[#080D1A] overflow-hidden shadow-sm">
            <div className="p-5 bg-[#0B101D] border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Full Role-Based Access Control (RBAC) Matrix</h3>
                <p className="text-xs text-slate-400 mt-0.5">Permissions, rate limits, and endpoint capabilities mapped by subscriber authorization tier.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#060912] text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                    <th className="p-3.5">Platform Capability / Route</th>
                    <th className="p-3.5 text-center">Guest / Anon</th>
                    <th className="p-3.5 text-center">Free Dev</th>
                    <th className="p-3.5 text-center text-[#00F0FF] font-bold bg-[#06B6D4]/10">Pro Member</th>
                    <th className="p-3.5 text-center">Team Lead</th>
                    <th className="p-3.5 text-center">Enterprise</th>
                    <th className="p-3.5 text-center text-amber-400 bg-amber-950/20">Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="hover:bg-[#0E1526] transition-colors">
                    <td className="p-3.5 font-bold text-white">Daily Compute Quota</td>
                    <td className="p-3.5 text-center">20 units</td>
                    <td className="p-3.5 text-center">50 units</td>
                    <td className="p-3.5 text-center text-[#00F0FF] font-bold bg-[#06B6D4]/5">500 units</td>
                    <td className="p-3.5 text-center font-bold">1,500 units</td>
                    <td className="p-3.5 text-center font-bold text-white">5,000 units</td>
                    <td className="p-3.5 text-center font-bold text-amber-400 bg-amber-950/10">Unlimited (&infin;)</td>
                  </tr>

                  <tr className="hover:bg-[#0E1526] transition-colors">
                    <td className="p-3.5 font-bold text-white">Public Audit Permalinks (/reports/*)</td>
                    <td className="p-3.5 text-center text-[#00FF66]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66] bg-[#06B6D4]/5"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66] bg-amber-950/10"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-[#0E1526] transition-colors">
                    <td className="p-3.5 font-bold text-white">Personal Saved Audit Dossiers (/dashboard)</td>
                    <td className="p-3.5 text-center text-slate-600">&mdash;</td>
                    <td className="p-3.5 text-center text-[#00FF66]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66] bg-[#06B6D4]/5"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66] bg-amber-950/10"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-[#0E1526] transition-colors">
                    <td className="p-3.5 font-bold text-white">Domain Watchdog Monitoring Quota</td>
                    <td className="p-3.5 text-center text-slate-600">0 slots</td>
                    <td className="p-3.5 text-center">1 domain</td>
                    <td className="p-3.5 text-center text-[#00F0FF] font-bold bg-[#06B6D4]/5">20 domains</td>
                    <td className="p-3.5 text-center font-bold">50 domains</td>
                    <td className="p-3.5 text-center font-bold text-white">Unlimited</td>
                    <td className="p-3.5 text-center font-bold text-amber-400 bg-amber-950/10">Unlimited</td>
                  </tr>

                  <tr className="hover:bg-[#0E1526] transition-colors">
                    <td className="p-3.5 font-bold text-white">REST API Secret Keys (cat_live_...)</td>
                    <td className="p-3.5 text-center text-slate-600">&mdash;</td>
                    <td className="p-3.5 text-center text-slate-600">&mdash;</td>
                    <td className="p-3.5 text-center text-[#00FF66] bg-[#06B6D4]/5"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-[#00FF66] bg-amber-950/10"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-[#0E1526] transition-colors">
                    <td className="p-3.5 font-bold text-white">Superadmin Command Center (/admin/*)</td>
                    <td className="p-3.5 text-center text-slate-600">&mdash;</td>
                    <td className="p-3.5 text-center text-slate-600">&mdash;</td>
                    <td className="p-3.5 text-center text-slate-600 bg-[#06B6D4]/5">&mdash;</td>
                    <td className="p-3.5 text-center text-slate-600">&mdash;</td>
                    <td className="p-3.5 text-center text-slate-600">&mdash;</td>
                    <td className="p-3.5 text-center text-[#00FF66] font-bold text-amber-400 bg-amber-950/10"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: UPGRADE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#0B101D] px-3.5 py-1 text-xs font-mono font-bold text-[#00F0FF] mb-2">
                <Sliders className="h-3.5 w-3.5" />
                <span>Value Delta &amp; ROI Calculator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-sans">
                Tier Upgrade Value Simulator
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                See exactly how your compute throughput, monitoring intervals, and security capabilities will upgrade from your current role.
              </p>
            </div>

            {/* Target Tier Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['starter', 'pro', 'team', 'enterprise'] as SubscriptionPlanId[]).map((tid) => {
                const plan = SUBSCRIPTION_PLANS[tid];
                const isSelected = simulatorTargetTier === tid;
                return (
                  <button
                    key={tid}
                    onClick={() => setSimulatorTargetTier(tid)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'border-slate-800 bg-[#080D1A] hover:bg-[#0E1526]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white font-sans">{plan.name}</span>
                      <span className="text-xs font-mono font-bold text-[#00F0FF]">${plan.priceMonthly}/mo</span>
                    </div>
                    <div className="mt-1.5 text-xs font-mono text-[#00FF66] font-bold">
                      {plan.dailyComputeUnits} units/day
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Comparison Cards */}
            {(() => {
              const target = SUBSCRIPTION_PLANS[simulatorTargetTier];
              const currentUnits = ROLE_CONFIGS[effectiveRole].dailyComputeUnits;
              const unitMultiplier = Math.round(target.dailyComputeUnits / Math.max(1, currentUnits));

              return (
                <div className="rounded-2xl border border-slate-800 bg-[#080D1A] p-5 sm:p-7 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
                    
                    {/* Multiplier */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">Compute Boost</span>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-[#00F0FF]">
                        {unitMultiplier > 1 ? `${unitMultiplier}x` : '1x'}
                      </div>
                      <p className="text-xs text-slate-400 font-sans">
                        From {currentUnits} to {target.dailyComputeUnits} daily units
                      </p>
                    </div>

                    {/* Monitored Domains */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">Domain Watchdog</span>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-[#00FF66]">
                        {target.monitoredSitesQuota}
                      </div>
                      <p className="text-xs text-slate-400 font-sans">
                        Probe frequency every {target.probeFrequencyMinutes < 60 ? `${target.probeFrequencyMinutes}m` : `${target.probeFrequencyMinutes / 60}h`}
                      </p>
                    </div>

                    {/* REST API & CI/CD */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">Automation Capacity</span>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-purple-400 font-bold">
                        {target.ciRunsPerMonth}
                      </div>
                      <p className="text-xs text-slate-400 font-sans">
                        CI runs/mo across {target.ciParallelConcurrency} parallel runners
                      </p>
                    </div>

                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-400 font-sans">
                      <span>Ready to activate <strong>{target.name}</strong>? Start your 7-day risk-free evaluation.</span>
                    </div>

                    <button
                      onClick={() => openTrialModal(simulatorTargetTier)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#06B6D4] hover:bg-[#00F0FF] text-slate-950 font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer"
                    >
                      Start 7-Day Free Trial for {target.name}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Enterprise Banner */}
        <LazyReveal direction="up" className="mt-14 rounded-2xl border border-slate-800 bg-[#080D1A] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm text-slate-100 font-mono">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-[#00F0FF] font-bold text-xs uppercase tracking-wider">
              <Server className="h-4 w-4" />
              <span>Custom Enterprise Infrastructure</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-sans">Need On-Premises or Private Cloud Telemetry?</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              We deploy containerized CatalystLab audit runners directly into your VPC (GCP, AWS, Azure, or Kubernetes) with air-gapped security compliance and SOC2 governance.
            </p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 rounded-xl bg-[#06B6D4] hover:bg-[#00F0FF] text-slate-950 px-5 py-3 text-xs sm:text-sm font-mono font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95"
          >
            Speak with Solution Engineering
          </Link>
        </LazyReveal>

        {/* Global FAQ Section */}
        <div className="mt-16">
          <GlobalFaqSection 
            categories={MASTER_FAQ_CATEGORIES}
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about our 8 diagnostic engines, automated CI/CD quality gates, 5-tier subscription plans, 7-day free trial, and developer REST APIs."
          />
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
