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
import { PexelsImage } from '../components/media/PexelsImage';
import { PricingPlanCard } from '../components/cards/content/PricingPlanCard';
import { EnzymeHue, StatPair } from '../components/cards/types';
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
    <div className="min-h-screen bg-white pb-24 text-slate-900 selection:bg-slate-900 selection:text-white">
      <SEOHead
        title="Terminal Billing Console & Telemetry ROI Calculator | CatalystLab"
        description="Explore CatalystLab's transparent 5-tier diagnostic plans ($0 Free, $9 Starter, $19 Pro, $49 Team, $99 Enterprise). Interactive CLI billing flags, ROI calculator, and RBAC matrix."
        keywords={['CatalystLab pricing', 'telemetry API plans', 'RBAC role preview', '7-day free trial no credit card', 'web audit pricing', 'telemetry ROI calculator']}
        canonicalPath="/pricing"
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 py-14 sm:py-18">
        <LazyReveal direction="down" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-mono font-bold text-slate-900 mb-5 shadow-sm">
            <TerminalIcon className="h-3.5 w-3.5" />
            <span>5-TIER TELEMETRY ARCHITECTURE &bull; 7-DAY ZERO-RISK TRIAL</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight font-sans">
            Precision Web Health &amp; Telemetry Plans
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            Choose the exact compute throughput, automated probe frequencies, and REST API access suited for your engineering workflow. All paid tiers include a <strong className="text-slate-900 font-bold">7-day free trial with zero credit card requirements</strong>.
          </p>

          {/* Interactive Role Preview Switcher Bar */}
          <div className="mt-8 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
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
                    className="flex items-center gap-1 text-[11px] text-slate-900 font-bold hover:underline cursor-pointer ml-1"
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
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-4">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Subscription Plans &amp; Pricing
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Telemetry ROI Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Role Matrix (RBAC)</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Upgrade Simulator</span>
            </button>
          </div>

          {/* CLI-Style Billing Toggle */}
          {activeTab === 'plans' && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <span className="text-slate-500 font-bold">FLAGS:</span>
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  !annual 
                    ? 'bg-slate-900 border-slate-900 text-white font-bold' 
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                --billing=monthly
              </button>

              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
                  annual 
                    ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>--billing=annual</span>
                <span className="rounded bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 text-[10px] font-bold">
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

                const planHues: Record<SubscriptionPlanId, EnzymeHue> = {
                  free: 'neutral',
                  starter: 'synthshift',
                  pro: 'vitalzyme',
                  team: 'edgevmax',
                  enterprise: 'riskprotease',
                };

                const stats: StatPair[] = [
                  { label: 'Compute', value: `${plan.dailyComputeUnits}u/d`, highlight: isPopular },
                  { label: 'Probe Rate', value: plan.probeFrequencyMinutes < 60 ? `${plan.probeFrequencyMinutes}m` : `${plan.probeFrequencyMinutes / 60}h` },
                ];

                const billingSubtext = annual && plan.priceMonthly > 0
                  ? `Billed annually ($${plan.priceAnnualTotal}/yr)`
                  : !annual && plan.priceMonthly > 0
                  ? 'Billed monthly'
                  : 'Free forever • Zero card';

                return (
                  <LazyStaggerItem key={plan.id} className="h-full">
                    <PricingPlanCard
                      id={plan.id}
                      name={plan.name}
                      price={`$${price}`}
                      period="/mo"
                      billingSubtext={billingSubtext}
                      description={plan.description}
                      badge={isPopular ? 'MOST DEPLOYED' : plan.badge}
                      isPopular={isPopular}
                      isCurrent={ctaInfo.disabled && ctaInfo.variant === 'current'}
                      stats={stats}
                      features={plan.features}
                      ctaLabel={ctaInfo.label}
                      ctaSubtext={ctaInfo.subtext}
                      ctaDisabled={ctaInfo.disabled}
                      onCtaClick={() => handlePlanCta(plan.id)}
                      hue={planHues[key]}
                      className="h-full"
                    />
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
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Full Role-Based Access Control (RBAC) Matrix</h3>
                <p className="text-xs text-slate-600 mt-0.5">Permissions, rate limits, and endpoint capabilities mapped by subscriber authorization tier.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 uppercase text-[11px] font-bold tracking-wider">
                    <th className="p-3.5">Platform Capability / Route</th>
                    <th className="p-3.5 text-center">Guest / Anon</th>
                    <th className="p-3.5 text-center">Free Dev</th>
                    <th className="p-3.5 text-center text-slate-900 font-bold bg-slate-200/50">Pro Member</th>
                    <th className="p-3.5 text-center">Team Lead</th>
                    <th className="p-3.5 text-center">Enterprise</th>
                    <th className="p-3.5 text-center text-amber-700 bg-amber-50">Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Daily Compute Quota</td>
                    <td className="p-3.5 text-center">20 units</td>
                    <td className="p-3.5 text-center">50 units</td>
                    <td className="p-3.5 text-center text-slate-900 font-bold bg-slate-50">500 units</td>
                    <td className="p-3.5 text-center font-bold text-slate-900">1,500 units</td>
                    <td className="p-3.5 text-center font-bold text-slate-900">5,000 units</td>
                    <td className="p-3.5 text-center font-bold text-amber-700 bg-amber-50/50">Unlimited (&infin;)</td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Public Audit Permalinks (/reports/*)</td>
                    <td className="p-3.5 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600 bg-slate-50"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600 bg-amber-50/50"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Personal Saved Audit Dossiers (/dashboard)</td>
                    <td className="p-3.5 text-center text-slate-400">&mdash;</td>
                    <td className="p-3.5 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600 bg-slate-50"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600 bg-amber-50/50"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Domain Watchdog Monitoring Quota</td>
                    <td className="p-3.5 text-center text-slate-400">0 slots</td>
                    <td className="p-3.5 text-center">1 domain</td>
                    <td className="p-3.5 text-center text-slate-900 font-bold bg-slate-50">20 domains</td>
                    <td className="p-3.5 text-center font-bold text-slate-900">50 domains</td>
                    <td className="p-3.5 text-center font-bold text-slate-900">Unlimited</td>
                    <td className="p-3.5 text-center font-bold text-amber-700 bg-amber-50/50">Unlimited</td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">REST API Secret Keys (cat_live_...)</td>
                    <td className="p-3.5 text-center text-slate-400">&mdash;</td>
                    <td className="p-3.5 text-center text-slate-400">&mdash;</td>
                    <td className="p-3.5 text-center text-emerald-600 bg-slate-50"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-emerald-600 bg-amber-50/50"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Superadmin Command Center (/admin/*)</td>
                    <td className="p-3.5 text-center text-slate-400">&mdash;</td>
                    <td className="p-3.5 text-center text-slate-400">&mdash;</td>
                    <td className="p-3.5 text-center text-slate-400 bg-slate-50">&mdash;</td>
                    <td className="p-3.5 text-center text-slate-400">&mdash;</td>
                    <td className="p-3.5 text-center text-slate-400">&mdash;</td>
                    <td className="p-3.5 text-center text-emerald-600 font-bold text-amber-700 bg-amber-50/50"><Check className="w-4 h-4 mx-auto" /></td>
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
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-mono font-bold text-slate-900 mb-2">
                <Sliders className="h-3.5 w-3.5" />
                <span>Value Delta &amp; ROI Calculator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
                Tier Upgrade Value Simulator
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
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
                        ? 'border-slate-900 bg-slate-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 font-sans">{plan.name}</span>
                      <span className="text-xs font-mono font-bold text-slate-900">${plan.priceMonthly}/mo</span>
                    </div>
                    <div className="mt-1.5 text-xs font-mono text-emerald-700 font-bold">
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
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    
                    {/* Multiplier */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">Compute Boost</span>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900">
                        {unitMultiplier > 1 ? `${unitMultiplier}x` : '1x'}
                      </div>
                      <p className="text-xs text-slate-600 font-sans">
                        From {currentUnits} to {target.dailyComputeUnits} daily units
                      </p>
                    </div>

                    {/* Monitored Domains */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">Domain Watchdog</span>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600">
                        {target.monitoredSitesQuota}
                      </div>
                      <p className="text-xs text-slate-600 font-sans">
                        Probe frequency every {target.probeFrequencyMinutes < 60 ? `${target.probeFrequencyMinutes}m` : `${target.probeFrequencyMinutes / 60}h`}
                      </p>
                    </div>

                    {/* REST API & CI/CD */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">Automation Capacity</span>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-600 font-bold">
                        {target.ciRunsPerMonth}
                      </div>
                      <p className="text-xs text-slate-600 font-sans">
                        CI runs/mo across {target.ciParallelConcurrency} parallel runners
                      </p>
                    </div>

                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-600 font-sans">
                      <span>Ready to activate <strong className="text-slate-900">{target.name}</strong>? Start your 7-day risk-free evaluation.</span>
                    </div>

                    <button
                      onClick={() => openTrialModal(simulatorTargetTier)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs transition-all shadow-sm cursor-pointer"
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
        <LazyReveal direction="up" className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm text-slate-900 font-mono">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Server className="h-4 w-4" />
              <span>Custom Enterprise Infrastructure</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">Need On-Premises or Private Cloud Telemetry?</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              We deploy containerized CatalystLab audit runners directly into your VPC (GCP, AWS, Azure, or Kubernetes) with air-gapped security compliance and SOC2 governance.
            </p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 text-xs sm:text-sm font-mono font-bold transition-all shadow-sm"
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
