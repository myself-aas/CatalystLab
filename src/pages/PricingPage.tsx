import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  Server, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  Lock, 
  HelpCircle,
  BarChart2,
  GitBranch,
  Shield,
  Layers,
  Terminal,
  Globe,
  Radio,
  FileText,
  User,
  Users,
  Building2,
  Crown,
  Eye,
  RotateCcw,
  CheckCircle,
  XCircle,
  Sliders
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../data/pricingData';
import { MASTER_FAQ_CATEGORIES } from '../data/faqData';
import { GlobalFaqSection } from '../components/common/GlobalFaqSection';
import { SEOHead } from '../components/common/SEOHead';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../components/common/LazyAnimate';
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
    actualRole, 
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

  // Helper to determine CTA text and styling per role & card
  const getCardCtaInfo = (cardPlanId: SubscriptionPlanId) => {
    if (effectiveRole === 'superadmin') {
      return {
        label: 'Superadmin Access (Bypass Mode)',
        disabled: true,
        variant: 'superadmin',
        subtext: 'All limits bypassed across entire platform'
      };
    }

    const currentPlanId = planId;
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
    <div className="min-h-screen bg-[#07111e] text-white pb-24 selection:bg-cyan-500 selection:text-[#07111e]">
      <SEOHead
        title="5-Tier Pricing, RBAC Role Matrix & 7-Day Free Trial | CatalystLab"
        description="Explore CatalystLab's transparent 5-tier diagnostic plans ($0 Free, $9 Starter, $19 Pro, $49 Team, $99 Enterprise). Preview feature unlocks and role-based permissions in real time."
        keywords={['CatalystLab pricing', 'telemetry API plans', 'RBAC role preview', '7-day free trial no credit card', 'web audit pricing']}
        canonicalUrl="https://www.catalystlab.tech/pricing"
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-brand-border/60 bg-gradient-to-b from-[#091729] via-[#07111e] to-[#07111e] py-16 sm:py-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-brand-cyan/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-indigo-600/5 blur-[100px] pointer-events-none" />

        <LazyReveal direction="down" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1 text-xs sm:text-sm font-bold text-brand-cyan mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
            <span>Role-Based Access Control &amp; 5-Tier Telemetry Architecture</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Precision Web Health &amp; Telemetry Plans
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
            Choose the exact compute throughput, automated probe frequencies, and REST API access suited for your engineering workflow. All paid tiers include a <strong className="text-brand-cyan">7-day free trial with zero credit card requirements</strong>.
          </p>

          {/* Interactive Role Preview Switcher Bar */}
          <div className="mt-8 mx-auto max-w-3xl rounded-2xl border border-cyan-500/30 bg-[#0d1d33]/90 p-4 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Preview Platform As Role:
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Current Role:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] uppercase ${ROLE_CONFIGS[effectiveRole].badgeBg} ${ROLE_CONFIGS[effectiveRole].badgeText} ${ROLE_CONFIGS[effectiveRole].badgeBorder}`}>
                  {ROLE_CONFIGS[effectiveRole].displayName} {isSimulating ? '(Previewing)' : ''}
                </span>
                {isSimulating && (
                  <button
                    onClick={resetSimulation}
                    className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 underline cursor-pointer ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
                        ? 'bg-cyan-500 text-[#07111e] shadow-md ring-2 ring-cyan-400 font-extrabold'
                        : 'bg-[#152744] text-slate-300 hover:bg-[#1c345c] hover:text-white border border-slate-700/50'
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
          <div className="mt-8 flex items-center justify-center gap-2 border-b border-brand-border/60 pb-4">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-brand-cyan text-brand-navy shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-[#152238]'
              }`}
            >
              Subscription Plans &amp; Pricing
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-brand-cyan text-brand-navy shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-[#152238]'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Role &amp; Security Matrix (RBAC)</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-brand-cyan text-brand-navy shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-[#152238]'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Upgrade Simulator</span>
            </button>
          </div>

          {/* Billing Toggle (Shown on Plans tab) */}
          {activeTab === 'plans' && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className={`text-sm sm:text-base font-bold transition-colors ${!annual ? 'text-white' : 'text-slate-400'}`}>
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() => setAnnual(!annual)}
                className="relative h-8 w-16 rounded-full bg-brand-navy p-1 transition-colors border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 cursor-pointer"
                aria-label="Toggle annual billing"
              >
                <div
                  className={`h-6 w-6 rounded-full bg-brand-cyan transition-transform shadow-md ${
                    annual ? 'translate-x-8 bg-brand-cyan' : 'translate-x-0 bg-slate-300'
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm sm:text-base font-bold transition-colors ${annual ? 'text-white' : 'text-slate-400'}`}>
                  Annual Billing
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-extrabold text-emerald-400 border border-emerald-500/30">
                  Save 20%
                </span>
              </div>
            </div>
          )}
        </LazyReveal>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        
        {/* TAB 1: 5-TIER PRICING CARDS */}
        {activeTab === 'plans' && (
          <div>
            <LazyStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch" staggerDelay={0.08}>
              {planOrder.map((key) => {
                const plan = SUBSCRIPTION_PLANS[key];
                const price = annual ? plan.priceAnnualMonthly : plan.priceMonthly;
                const isPopular = plan.popular;
                const ctaInfo = getCardCtaInfo(key);

                return (
                  <LazyStaggerItem
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
                      isPopular
                        ? 'border-2 border-brand-cyan bg-[#0a1a2f] text-white shadow-2xl shadow-cyan-950/60 lg:-translate-y-2'
                        : 'border border-brand-border/80 bg-brand-surface text-white shadow-lg hover:border-brand-cyan/40 hover:shadow-xl'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-extrabold tracking-wider uppercase shadow-md whitespace-nowrap ${
                            isPopular
                              ? 'bg-gradient-to-r from-brand-cyan to-blue-500 text-[#07111e]'
                              : 'border border-brand-border/80 bg-[#12233b] text-slate-300'
                          }`}
                        >
                          {isPopular && <Sparkles className="h-3 w-3" />}
                          <span>{plan.badge}</span>
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-white tracking-tight">{plan.name}</h3>
                      </div>
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed min-h-[36px]">{plan.tagline}</p>

                      {/* Price */}
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          ${price}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {plan.priceMonthly === 0 ? 'free forever' : '/ mo'}
                        </span>
                      </div>
                      {annual && plan.priceMonthly > 0 ? (
                        <p className="mt-0.5 text-[11px] text-emerald-400 font-semibold">
                          Billed annually (${price * 12}/yr)
                        </p>
                      ) : (
                        <div className="h-4 mt-0.5 text-[11px] text-slate-500">
                          {plan.priceMonthly === 0 ? 'No credit card needed' : 'Billed monthly'}
                        </div>
                      )}

                      {/* Compute Quota Box */}
                      <div className="mt-4 p-3 rounded-xl bg-brand-navy/90 border border-brand-border/60 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span className="flex items-center gap-1 text-brand-cyan">
                            <Cpu className="w-3.5 h-3.5" /> Quota
                          </span>
                          <span className="text-emerald-400 font-mono">
                            {plan.dailyComputeUnits} units/day
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Full Audits:</span>
                          <span className="font-semibold text-white">{plan.masterAuditsPerDay} / day</span>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="mt-5 border-t border-brand-border/40 pt-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Included Features:
                        </p>
                        <ul className="space-y-2.5">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-cyan mt-0.5">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </div>
                              <span className="leading-snug">{feature.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Dynamic CTA Action Area based on Role */}
                    <div className="mt-6 pt-4 border-t border-brand-border/40">
                      {ctaInfo.variant === 'superadmin' ? (
                        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-center">
                          <span className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1">
                            <Crown className="h-3.5 w-3.5" />
                            <span>Superadmin Unlocked</span>
                          </span>
                        </div>
                      ) : ctaInfo.variant === 'current' ? (
                        <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 p-2.5 text-center">
                          <span className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{ctaInfo.label}</span>
                          </span>
                        </div>
                      ) : key === 'free' ? (
                        <Link
                          to="/"
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 bg-[#14233a] border border-brand-border text-white hover:bg-[#1a2e4c] hover:border-slate-500 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                          <span>Start Free Scan</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePlanCta(key)}
                          className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 shadow-md active:scale-98 cursor-pointer ${
                            isPopular
                              ? 'bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-extrabold shadow-cyan-500/20'
                              : 'bg-gradient-to-r from-emerald-500/90 to-brand-cyan/90 text-brand-navy hover:from-emerald-400 hover:to-brand-cyan font-bold'
                          }`}
                        >
                          <span>{ctaInfo.label}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <p className="mt-2 text-center text-[10px] text-slate-400">
                        {ctaInfo.subtext}
                      </p>
                    </div>
                  </LazyStaggerItem>
                );
              })}
            </LazyStaggerContainer>

            {/* 7-Day Free Trial Banner */}
            <LazyReveal direction="up" className="mt-16 rounded-3xl bg-gradient-to-br from-[#0c1f36] via-[#091729] to-[#07111e] border border-brand-cyan/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-4">
                  <ShieldCheck className="h-4 w-4" />
                  <span>100% Risk-Free Guarantee</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  How the 7-Day Free Trial Works
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                  We believe in proving value before asking for payment. Explore our complete telemetry mesh, CI/CD gates, and REST APIs with zero friction.
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl bg-brand-navy/80 border border-brand-border/60 space-y-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-cyan/20 text-brand-cyan font-extrabold text-sm">
                      1
                    </div>
                    <h4 className="text-base font-bold text-white">Sign In with Google</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      One-click authentication. No password to remember and no credit card numbers required.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-brand-navy/80 border border-brand-border/60 space-y-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-sm">
                      2
                    </div>
                    <h4 className="text-base font-bold text-white">Choose Any Paid Tier</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Activate Starter ($9), Pro ($19), Team ($49), or Enterprise ($99). You instantly receive full daily compute quota.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-brand-navy/80 border border-brand-border/60 space-y-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-extrabold text-sm">
                      3
                    </div>
                    <h4 className="text-base font-bold text-white">Automatic Free Rollover</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      After 7 days, your account smoothly reverts to the Free Community plan unless you choose to add a payment method.
                    </p>
                  </div>
                </div>
              </div>
            </LazyReveal>
          </div>
        )}

        {/* TAB 2: COMPREHENSIVE ROLE & SECURITY RBAC MATRIX */}
        {activeTab === 'matrix' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-300 mb-3">
                <Shield className="h-3.5 w-3.5" />
                <span>Frontend &amp; Firestore Security Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Role-Based Access Control (RBAC) Matrix
              </h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Security rules are enforced both client-side via React guards and backend via Firestore token claims to safeguard API keys, white-label configs, and telemetry pipelines.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-brand-border/80 bg-brand-surface shadow-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm text-white">
                <thead>
                  <tr className="border-b border-brand-border bg-[#0e1f36] text-slate-300 uppercase text-[11px] font-bold tracking-wider">
                    <th className="p-4">Platform Capability / Route</th>
                    <th className="p-4 text-center">Guest / Anon</th>
                    <th className="p-4 text-center">Free Dev</th>
                    <th className="p-4 text-center text-cyan-300 bg-cyan-950/20">Pro Member</th>
                    <th className="p-4 text-center">Team Lead</th>
                    <th className="p-4 text-center">Enterprise</th>
                    <th className="p-4 text-center text-amber-300 bg-amber-950/20">Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 text-slate-300">
                  <tr className="hover:bg-brand-navy/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <td className="p-4 font-bold text-white">Daily Compute Quota</td>
                    <td className="p-4 text-center font-mono">20 units</td>
                    <td className="p-4 text-center font-mono">50 units</td>
                    <td className="p-4 text-center font-mono text-cyan-300 font-bold bg-cyan-950/20">500 units</td>
                    <td className="p-4 text-center font-mono font-bold">1,500 units</td>
                    <td className="p-4 text-center font-mono font-bold text-purple-300">5,000 units</td>
                    <td className="p-4 text-center font-mono font-bold text-amber-300 bg-amber-950/20">Unlimited (∞)</td>
                  </tr>

                  <tr className="hover:bg-brand-navy/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <td className="p-4 font-bold text-white">Public Audit Permalinks (/reports/*)</td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400 bg-cyan-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400 bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-brand-navy/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <td className="p-4 font-bold text-white">Personal Saved Audit Dossiers (/dashboard)</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400 bg-cyan-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400 bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-brand-navy/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <td className="p-4 font-bold text-white">Domain Watchdog Monitoring Quota</td>
                    <td className="p-4 text-center text-slate-500">0 slots</td>
                    <td className="p-4 text-center">1 domain</td>
                    <td className="p-4 text-center text-cyan-300 font-bold bg-cyan-950/20">20 domains</td>
                    <td className="p-4 text-center font-bold">50 domains</td>
                    <td className="p-4 text-center font-bold text-purple-300">Unlimited</td>
                    <td className="p-4 text-center font-bold text-amber-300 bg-amber-950/20">Unlimited</td>
                  </tr>

                  <tr className="hover:bg-brand-navy/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <td className="p-4 font-bold text-white">REST API Secret Keys (cat_live_...)</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-emerald-400 bg-cyan-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400 bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-brand-navy/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <td className="p-4 font-bold text-white">Technical Blog Authoring (/blogs/create)</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-emerald-400 bg-cyan-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400 bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-brand-navy/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <td className="p-4 font-bold text-white">White-Label Branding &amp; Custom PDF Reports</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-slate-500 bg-cyan-950/20">&mdash;</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-emerald-400 font-bold text-purple-300"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400 font-bold text-amber-300 bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-brand-navy/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <td className="p-4 font-bold text-white">Superadmin Command Center (/admin/*)</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-slate-500 bg-cyan-950/20">&mdash;</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-emerald-400 font-bold text-amber-300 bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>

                  <tr className="hover:bg-brand-navy/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <td className="p-4 font-bold text-white">Rate Limit Bypass &amp; Infinite Concurrency</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-slate-500 bg-cyan-950/20">&mdash;</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-slate-500">&mdash;</td>
                    <td className="p-4 text-center text-emerald-400 font-bold text-amber-300 bg-amber-950/20"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE UPGRADE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-300 mb-3">
                <Sliders className="h-3.5 w-3.5" />
                <span>Value Delta &amp; ROI Calculator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Tier Upgrade Value Simulator
              </h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
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
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-[#0c223f] shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400'
                        : 'border-[#415a77]/40 bg-[#0d1b2a] hover:bg-[#152238]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base text-white">{plan.name}</span>
                      <span className="text-xs font-bold text-cyan-300">${plan.priceMonthly}/mo</span>
                    </div>
                    <div className="mt-2 text-xs font-mono text-emerald-400 font-bold">
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
                <div className="rounded-3xl border border-brand-cyan/40 bg-gradient-to-br from-[#0c1f36] to-[#07111e] p-6 sm:p-8 shadow-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#415a77]/40">
                    
                    {/* Multiplier */}
                    <div className="p-4 space-y-2">
                      <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Compute Boost</span>
                      <div className="text-4xl sm:text-5xl font-black text-cyan-300">
                        {unitMultiplier > 1 ? `${unitMultiplier}x` : '1x'}
                      </div>
                      <p className="text-xs text-slate-300">
                        From {currentUnits} to {target.dailyComputeUnits} daily units
                      </p>
                    </div>

                    {/* Monitored Domains */}
                    <div className="p-4 space-y-2">
                      <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Domain Watchdog</span>
                      <div className="text-4xl sm:text-5xl font-black text-emerald-400">
                        {target.monitoredSitesQuota}
                      </div>
                      <p className="text-xs text-slate-300">
                        Probe frequency every {target.probeFrequencyMinutes < 60 ? `${target.probeFrequencyMinutes}m` : `${target.probeFrequencyMinutes / 60}h`}
                      </p>
                    </div>

                    {/* REST API & CI/CD */}
                    <div className="p-4 space-y-2">
                      <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Automation Capacity</span>
                      <div className="text-4xl sm:text-5xl font-black text-indigo-300">
                        {target.ciRunsPerMonth}
                      </div>
                      <p className="text-xs text-slate-300">
                        CI runs/mo across {target.ciParallelConcurrency} parallel runners
                      </p>
                    </div>

                  </div>

                  <div className="mt-8 pt-6 border-t border-[#415a77]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-300">
                      <span>Ready to activate <strong>{target.name}</strong>? Start your 7-day risk-free evaluation.</span>
                    </div>

                    <button
                      onClick={() => openTrialModal(simulatorTargetTier)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 font-extrabold text-xs text-[#07111e] hover:opacity-95 transition-all shadow-lg active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
        <LazyReveal direction="up" className="mt-16 rounded-3xl border border-brand-border bg-gradient-to-r from-[#0c1f36] to-[#0a1628] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl text-white">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-brand-cyan font-bold text-xs uppercase tracking-wider">
              <Server className="h-4 w-4" />
              <span>Custom Enterprise Infrastructure</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Need On-Premises or Private Cloud Telemetry?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We deploy containerized CatalystLab audit runners directly into your VPC (GCP, AWS, Azure, or Kubernetes) with air-gapped security compliance and SOC2 governance.
            </p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-500 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-brand-navy hover:from-brand-cyan/90 hover:to-blue-400 transition-all shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Speak with Solution Engineering
          </Link>
        </LazyReveal>

        {/* Global FAQ Section */}
        <div className="mt-20">
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
