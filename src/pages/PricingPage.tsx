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
  Sliders
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../data/pricingData';
import { MASTER_FAQ_CATEGORIES } from '../data/faqData';
import { GlobalFaqSection } from '../components/common/GlobalFaqSection';
import { SEOHead } from '../components/common/SEOHead';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../components/common/LazyAnimate';
import { ParallaxSection } from '../components/common/ParallaxSection';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { useRoleSecurity } from '../context/RoleSecurityContext';
import { SubscriptionPlanId } from '../types';
import { UserRole, ROLE_CONFIGS } from '../utils/rolePermissions';

export const PricingPage: React.FC = () => {
  const [annual, setAnnual] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'matrix' | 'simulator'>('plans');
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
    <div className="min-h-screen bg-white text-black pb-24 selection:bg-black/40 selection:text-white">
      <SEOHead
        title="5-Tier Pricing, RBAC Role Matrix & 7-Day Free Trial | CatalystLab"
        description="Explore CatalystLab's transparent 5-tier diagnostic plans ($0 Free, $9 Starter, $19 Pro, $49 Team, $99 Enterprise). Preview feature unlocks and role-based permissions in real time."
        keywords={['CatalystLab pricing', 'telemetry API plans', 'RBAC role preview', '7-day free trial no credit card', 'web audit pricing']}
        canonicalUrl="https://www.catalystlab.tech/pricing"
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gray-100 py-16 sm:py-20">
        <LazyReveal direction="down" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1 text-xs sm:text-sm font-mono text-gray-600 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent-amber-strong" />
            <span>Role-Based Access Control &amp; 5-Tier Telemetry Architecture</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl lg:text-5xl leading-tight">
            Precision Web Health &amp; Telemetry Plans
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
            Choose the exact compute throughput, automated probe frequencies, and REST API access suited for your engineering workflow. All paid tiers include a <strong className="text-accent-amber-strong font-semibold">7-day free trial with zero credit card requirements</strong>.
          </p>

          {/* Interactive Role Preview Switcher Bar */}
          <div className="mt-8 mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-xl text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-accent-amber-strong" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-600">
                  Preview Platform As Role:
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Current:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] uppercase ${ROLE_CONFIGS[effectiveRole].badgeBg} ${ROLE_CONFIGS[effectiveRole].badgeText} ${ROLE_CONFIGS[effectiveRole].badgeBorder}`}>
                  {ROLE_CONFIGS[effectiveRole].displayName} {isSimulating ? '(Previewing)' : ''}
                </span>
                {isSimulating && (
                  <button
                    onClick={resetSimulation}
                    className="flex items-center gap-1 text-[11px] text-accent-amber hover:underline cursor-pointer ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
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
                        ? 'bg-black text-white border border-accent-cyan/60 shadow-md ring-1 ring-accent-cyan/40'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-50 hover:text-white border border-gray-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary View Switcher: Plans vs RBAC Matrix vs Simulator */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-b border-gray-200 pb-4">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-black text-white shadow-md border border-brand-periwinkle/30'
                  : 'text-gray-600 hover:text-white hover:bg-white'
              }`}
            >
              Subscription Plans &amp; Pricing
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-black text-white shadow-md border border-brand-periwinkle/30'
                  : 'text-gray-600 hover:text-white hover:bg-white'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Role &amp; Security Matrix (RBAC)</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-black text-white shadow-md border border-brand-periwinkle/30'
                  : 'text-gray-600 hover:text-white hover:bg-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Upgrade Simulator</span>
            </button>
          </div>

          {/* Billing Toggle */}
          {activeTab === 'plans' && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className={`text-xs sm:text-sm font-bold transition-colors ${!annual ? 'text-black' : 'text-gray-500'}`}>
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() => setAnnual(!annual)}
                role="switch"
                aria-checked={annual}
                className="relative h-7 w-14 rounded-full bg-white p-1 transition-colors border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60 cursor-pointer"
                aria-label={`Billing cycle: ${annual ? 'annual' : 'monthly'}. Toggle to switch`}
              >
                <div
                  className={`h-5 w-5 rounded-full transition-transform shadow-md ${
                    annual ? 'translate-x-7 bg-accent-cyan' : 'translate-x-0 bg-brand-periwinkle'
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm font-bold transition-colors ${annual ? 'text-black' : 'text-gray-500'}`}>
                  Annual Billing
                </span>
                <span className="rounded-md bg-accent-emerald/20 px-2 py-0.5 text-xs font-mono font-bold text-accent-emerald border border-accent-emerald/40">
                  Save 20%
                </span>
              </div>
            </div>
          )}
        </LazyReveal>
      </section>

      {/* Immersive Pricing Parallax Banner */}
      <ParallaxSection
        bgImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80"
        overlayOpacity={0.88}
        height="min-h-[300px]"
        className="border-y border-gray-200"
      >
        <div className="max-w-4xl mx-auto px-6 text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-black text-white px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            Transparent Pricing &amp; RBAC Control
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black font-sans tracking-tight">
            Built for Scalable Engineering Teams
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-sans max-w-xl mx-auto">
            Upgrade, downgrade, or test simulated enterprise security privileges instantly with zero lock-in.
          </p>
        </div>
      </ParallaxSection>

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
                    className={`relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-200 ${
                      isPopular
                        ? 'border-2 border-accent-cyan bg-brand-navy text-white shadow-xl lg:-translate-y-2 ring-1 ring-accent-cyan/40'
                        : 'border border-gray-200 bg-brand-navy text-white shadow-lg hover:border-gray-200'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase shadow-md whitespace-nowrap ${
                            isPopular
                              ? 'bg-accent-cyan text-brand-navy border border-accent-cyan/80'
                              : 'border border-gray-200 bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isPopular && <Sparkles className="h-3 w-3" />}
                          <span>{plan.badge}</span>
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-white tracking-tight">{plan.name}</h3>
                      </div>
                      <p className="mt-1.5 text-xs text-gray-600 leading-relaxed min-h-[36px]">{plan.tagline}</p>

                      {/* Price */}
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-black tracking-tight metric-tabular">
                          ${price}
                        </span>
                        <span className="text-xs font-mono text-gray-500">
                          {plan.priceMonthly === 0 ? 'free forever' : '/ mo'}
                        </span>
                      </div>

                      {annual && plan.priceMonthly > 0 ? (
                        <p className="mt-0.5 text-[11px] text-accent-emerald font-mono font-semibold">
                          Billed annually (${price * 12}/yr)
                        </p>
                      ) : (
                        <div className="h-4 mt-0.5 text-[11px] text-gray-500 font-mono">
                          {plan.priceMonthly === 0 ? 'No credit card needed' : 'Billed monthly'}
                        </div>
                      )}

                      {/* Compute Quota Box */}
                      <div className="mt-4 p-3 rounded-xl bg-gray-100 border border-gray-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-black">
                          <span className="flex items-center gap-1 text-accent-amber-strong font-mono">
                            <Cpu className="w-3.5 h-3.5" /> Quota
                          </span>
                          <span className="text-accent-emerald font-mono">
                            {plan.dailyComputeUnits} units/day
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600 font-mono">
                          <span>Full Audits:</span>
                          <span className="font-semibold text-white">{plan.masterAuditsPerDay} / day</span>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="mt-4 border-t border-gray-200 pt-3">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                          Included Features:
                        </p>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-100 text-accent-amber-strong mt-0.5 border border-gray-200">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </div>
                              <span className="leading-snug">{feature.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Dynamic CTA Action Area */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      {ctaInfo.variant === 'superadmin' ? (
                        <div className="rounded-xl border border-accent-amber/40 bg-amber-950/20 p-2.5 text-center">
                          <span className="text-xs font-bold text-accent-amber flex items-center justify-center gap-1 font-mono">
                            <Crown className="h-3.5 w-3.5" />
                            <span>Superadmin Unlocked</span>
                          </span>
                        </div>
                      ) : ctaInfo.variant === 'current' ? (
                        <div className="rounded-xl border border-accent-cyan/40 bg-cyan-950/20 p-2.5 text-center">
                          <span className="text-xs font-bold text-accent-amber-strong flex items-center justify-center gap-1 font-mono">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{ctaInfo.label}</span>
                          </span>
                        </div>
                      ) : key === 'free' ? (
                        <Link
                          to="/"
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold font-mono transition-all duration-150 bg-gray-100 border border-gray-200 text-gray-600 hover:text-white hover:bg-gray-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                        >
                          <span>Start Free Scan</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handlePlanCta(key)}
                            className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold font-mono transition-all duration-150 shadow-md active:scale-95 cursor-pointer ${
                              isPopular
                                ? 'bg-black hover:bg-black-hover text-white border border-brand-periwinkle/30 font-extrabold'
                                : 'bg-black hover:bg-black-hover text-white border border-gray-200'
                            }`}
                          >
                            <span>{ctaInfo.label}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('catalyst:open-payment-checkout', { detail: { planId: key } }));
                            }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold font-mono transition-all duration-150 bg-white hover:bg-black/30 text-accent-amber-strong border border-gray-200 cursor-pointer"
                          >
                            <span>Buy Now (2Checkout / DodoPay)</span>
                          </button>
                        </div>
                      )}

                      <p className="mt-2 text-center text-[10px] font-mono text-gray-500">
                        {ctaInfo.subtext}
                      </p>
                    </div>
                  </LazyStaggerItem>
                );
              })}
            </LazyStaggerContainer>

            {/* 7-Day Free Trial Banner */}
            <LazyReveal direction="up" className="mt-14 rounded-2xl bg-white border border-gray-200 p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent-emerald/40 bg-emerald-950/30 px-3.5 py-1 text-xs font-mono font-bold text-accent-emerald mb-3">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>100% Risk-Free Guarantee</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight">
                  How the 7-Day Free Trial Works
                </h2>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  We believe in proving value before asking for payment. Explore our complete telemetry mesh, CI/CD gates, and REST APIs with zero friction.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gray-100 border border-gray-200 space-y-1.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200 text-accent-amber-strong font-mono font-extrabold text-xs">
                      1
                    </div>
                    <h4 className="text-sm font-bold text-black">Sign In with Google</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      One-click authentication. No password to remember and no credit card numbers required.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-100 border border-gray-200 space-y-1.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200 text-accent-emerald font-mono font-extrabold text-xs">
                      2
                    </div>
                    <h4 className="text-sm font-bold text-black">Choose Any Paid Tier</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Activate Starter ($9), Pro ($19), Team ($49), or Enterprise ($99). You instantly receive full daily compute quota.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-100 border border-gray-200 space-y-1.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200 text-accent-purple font-mono font-extrabold text-xs">
                      3
                    </div>
                    <h4 className="text-sm font-bold text-black">Automatic Free Rollover</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      After 7 days, your account smoothly reverts to the Free Community plan unless you choose to add a payment method.
                    </p>
                  </div>
                </div>
              </div>
            </LazyReveal>
          </div>
        )}

        {/* TAB 2: RBAC MATRIX */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/40 bg-white px-3.5 py-1 text-xs font-mono font-bold text-accent-amber-strong mb-2">
                <Shield className="h-3.5 w-3.5" />
                <span>Frontend &amp; Firestore Security Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black">
                Role-Based Access Control (RBAC) Matrix
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
                Security rules are enforced both client-side via React guards and backend via Firestore token claims to safeguard API keys, white-label configs, and telemetry pipelines.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm text-black">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100 text-gray-600 uppercase text-[11px] font-mono font-bold tracking-wider">
                    <th className="p-3.5">Platform Capability / Route</th>
                    <th className="p-3.5 text-center">Guest / Anon</th>
                    <th className="p-3.5 text-center">Free Dev</th>
                    <th className="p-3.5 text-center text-accent-amber-strong bg-cyan-950/20">Pro Member</th>
                    <th className="p-3.5 text-center">Team Lead</th>
                    <th className="p-3.5 text-center">Enterprise</th>
                    <th className="p-3.5 text-center text-accent-amber bg-amber-950/20">Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-slate/20 text-gray-600">
                  <tr className="hover:bg-gray-100/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">Daily Compute Quota</td>
                    <td className="p-3.5 text-center font-mono">20 units</td>
                    <td className="p-3.5 text-center font-mono">50 units</td>
                    <td className="p-3.5 text-center font-mono text-accent-amber-strong font-bold bg-cyan-950/20">500 units</td>
                    <td className="p-3.5 text-center font-mono font-bold">1,500 units</td>
                    <td className="p-3.5 text-center font-mono font-bold text-accent-purple">5,000 units</td>
                    <td className="p-3.5 text-center font-mono font-bold text-accent-amber bg-amber-950/20">Unlimited (∞)</td>
                  </tr>

                  <tr className="hover:bg-gray-100/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">Public Audit Permalinks (/reports/*)</td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald bg-cyan-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-gray-100/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">Personal Saved Audit Dossiers (/dashboard)</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald bg-cyan-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-gray-100/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">Domain Watchdog Monitoring Quota</td>
                    <td className="p-3.5 text-center text-gray-500">0 slots</td>
                    <td className="p-3.5 text-center">1 domain</td>
                    <td className="p-3.5 text-center text-accent-amber-strong font-bold bg-cyan-950/20">20 domains</td>
                    <td className="p-3.5 text-center font-bold">50 domains</td>
                    <td className="p-3.5 text-center font-bold text-accent-purple">Unlimited</td>
                    <td className="p-3.5 text-center font-bold text-accent-amber bg-amber-950/20">Unlimited</td>
                  </tr>

                  <tr className="hover:bg-gray-100/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">REST API Secret Keys (cat_live_...)</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-accent-emerald bg-cyan-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-gray-100/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">Technical Blog Authoring (/blogs/create)</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-accent-emerald bg-cyan-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-gray-100/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">White-Label Branding &amp; Custom PDF Reports</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-gray-500 bg-cyan-950/20">&mdash;</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-accent-emerald font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-3.5 text-center text-accent-emerald font-bold text-accent-amber bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-gray-100/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">Superadmin Command Center (/admin/*)</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-gray-500 bg-cyan-950/20">&mdash;</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-gray-500">&mdash;</td>
                    <td className="p-3.5 text-center text-accent-emerald font-bold text-accent-amber bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: UPGRADE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/40 bg-white px-3.5 py-1 text-xs font-mono font-bold text-accent-amber-strong mb-2">
                <Sliders className="h-3.5 w-3.5" />
                <span>Value Delta &amp; ROI Calculator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black">
                Tier Upgrade Value Simulator
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
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
                        ? 'border-accent-cyan bg-white shadow-md ring-1 ring-accent-cyan/50'
                        : 'border-gray-200 bg-gray-100 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-black">{plan.name}</span>
                      <span className="text-xs font-mono font-bold text-accent-amber-strong">${plan.priceMonthly}/mo</span>
                    </div>
                    <div className="mt-1.5 text-xs font-mono text-accent-emerald font-bold">
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
                <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-brand-slate/30">
                    
                    {/* Multiplier */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-xs font-mono uppercase font-bold text-gray-500 tracking-wider">Compute Boost</span>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-accent-amber-strong metric-tabular">
                        {unitMultiplier > 1 ? `${unitMultiplier}x` : '1x'}
                      </div>
                      <p className="text-xs text-gray-600">
                        From {currentUnits} to {target.dailyComputeUnits} daily units
                      </p>
                    </div>

                    {/* Monitored Domains */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-xs font-mono uppercase font-bold text-gray-500 tracking-wider">Domain Watchdog</span>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-accent-emerald metric-tabular">
                        {target.monitoredSitesQuota}
                      </div>
                      <p className="text-xs text-gray-600">
                        Probe frequency every {target.probeFrequencyMinutes < 60 ? `${target.probeFrequencyMinutes}m` : `${target.probeFrequencyMinutes / 60}h`}
                      </p>
                    </div>

                    {/* REST API & CI/CD */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-xs font-mono uppercase font-bold text-gray-500 tracking-wider">Automation Capacity</span>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-accent-purple metric-tabular">
                        {target.ciRunsPerMonth}
                      </div>
                      <p className="text-xs text-gray-600">
                        CI runs/mo across {target.ciParallelConcurrency} parallel runners
                      </p>
                    </div>

                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-gray-600">
                      <span>Ready to activate <strong>{target.name}</strong>? Start your 7-day risk-free evaluation.</span>
                    </div>

                    <button
                      onClick={() => openTrialModal(simulatorTargetTier)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black hover:bg-black-hover text-white font-mono font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer border border-brand-periwinkle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                    >
                      Start 7-Day Free Trial for {target.name}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Enterprise & Private Cloud Banner */}
        <LazyReveal direction="up" className="mt-14 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-black">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-accent-amber-strong font-mono font-bold text-xs uppercase tracking-wider">
              <Server className="h-4 w-4" />
              <span>Custom Enterprise Infrastructure</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-black">Need On-Premises or Private Cloud Telemetry?</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We deploy containerized CatalystLab audit runners directly into your VPC (GCP, AWS, Azure, or Kubernetes) with air-gapped security compliance and SOC2 governance.
            </p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 rounded-xl bg-black hover:bg-black-hover text-white px-5 py-3 text-xs sm:text-sm font-mono font-bold transition-all shadow-md active:scale-95 border border-brand-periwinkle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
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
