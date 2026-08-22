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
  FileText
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../data/pricingData';
import { MASTER_FAQ_CATEGORIES } from '../data/faqData';
import { GlobalFaqSection } from '../components/common/GlobalFaqSection';
import { SEOHead } from '../components/common/SEOHead';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../components/common/LazyAnimate';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { SubscriptionPlanId } from '../types';

export const PricingPage: React.FC = () => {
  const [annual, setAnnual] = useState(true);
  const { planId, isTrialActive, trialDaysRemaining, openTrialModal, changePlan } = useSubscription();
  const { user } = useAuth();

  const planOrder: SubscriptionPlanId[] = ['free', 'starter', 'pro', 'team', 'enterprise'];

  const handlePlanCta = (id: SubscriptionPlanId) => {
    if (id === 'free') {
      return;
    }
    // For paid tiers, launch the 7-day free trial modal (login only, no credit card)
    openTrialModal(id);
  };

  return (
    <div className="min-h-screen bg-[#07111e] text-white pb-24">
      <SEOHead
        title="5-Tier Pricing Plans & 7-Day Free Trial | CatalystLab"
        description="Explore CatalystLab's transparent 5-tier diagnostic plans ($0 Free, $9 Starter, $19 Pro, $49 Team, $99 Enterprise). Start a 7-day free trial with login only and zero credit card requirements."
        keywords={['CatalystLab pricing', 'telemetry API plans', '7-day free trial no credit card', 'web audit pricing', 'enterprise web vitals monitoring']}
        canonicalUrl="https://www.catalystlab.tech/pricing"
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-brand-border/60 bg-gradient-to-b from-[#091729] via-[#07111e] to-[#07111e] py-16 sm:py-20">
        {/* Background glow meshes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-brand-cyan/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-indigo-600/5 blur-[100px] pointer-events-none" />

        <LazyReveal direction="down" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1 text-xs sm:text-sm font-bold text-brand-cyan mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
            <span>Transparent 5-Tier Telemetry Architecture</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Precision Web Health &amp; Telemetry Plans
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
            Choose the exact compute throughput and telemetry capabilities suited for your engineering workflow. All paid tiers include a <strong className="text-brand-cyan">7-day free trial with zero credit card requirements</strong>.
          </p>

          {/* Value Badges Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-1.5 bg-brand-navy/60 px-3 py-1 rounded-full border border-brand-border/60">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>7-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-navy/60 px-3 py-1 rounded-full border border-brand-border/60">
              <ShieldCheck className="h-4 w-4 text-brand-cyan" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-navy/60 px-3 py-1 rounded-full border border-brand-border/60">
              <Clock className="h-4 w-4 text-sky-400" />
              <span>Instant Setup &amp; Activation</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-navy/60 px-3 py-1 rounded-full border border-brand-border/60">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span>Cancel Anytime</span>
            </div>
          </div>

          {/* Billing Toggle (Monthly vs Annual 20% Discount) */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm sm:text-base font-bold transition-colors ${!annual ? 'text-white' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative h-8 w-16 rounded-full bg-brand-navy p-1 transition-colors border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
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
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-extrabold text-emerald-400 border border-emerald-500/30 animate-pulse">
                Save 20%
              </span>
            </div>
          </div>
        </LazyReveal>
      </section>

      {/* Main 5-Tier Pricing Grid */}
      <main className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <LazyStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch" staggerDelay={0.08}>
          {planOrder.map((key) => {
            const plan = SUBSCRIPTION_PLANS[key];
            const price = annual ? plan.priceAnnualMonthly : plan.priceMonthly;
            const isCurrent = planId === key;
            const isPopular = plan.popular;

            return (
              <LazyStaggerItem
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
                  isPopular
                    ? 'border-2 border-brand-cyan bg-[#0a1a2f] text-white shadow-2xl shadow-cyan-950/60 lg:-translate-y-2'
                    : 'border border-brand-border/80 bg-brand-surface text-white shadow-lg hover:border-brand-cyan/40 hover:shadow-xl'
                }`}
              >
                {/* Popular / Recommended Badge */}
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

                {/* CTA Action Area */}
                <div className="mt-6 pt-4 border-t border-brand-border/40">
                  {key === 'free' ? (
                    <Link
                      to="/"
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 bg-[#14233a] border border-brand-border text-white hover:bg-[#1a2e4c] hover:border-slate-500 shadow-sm"
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
                      <span>Start 7-Day Free Trial</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {key !== 'free' && (
                    <p className="mt-2 text-center text-[10px] text-slate-400">
                      Login only &bull; No card required
                    </p>
                  )}
                </div>
              </LazyStaggerItem>
            );
          })}
        </LazyStaggerContainer>

        {/* 7-Day Free Trial Explainer Banner */}
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
                  Activate Starter ($9), Pro ($19), Team ($49), or Enterprise ($99). You instantly receive the full daily compute quota.
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

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-brand-border/60">
              <div className="text-xs text-slate-400">
                Current status: {isTrialActive ? (
                  <span className="text-emerald-400 font-bold">Active Trial ({trialDaysRemaining} days remaining)</span>
                ) : user ? (
                  <span className="text-white font-medium">Signed in as {user.email}</span>
                ) : (
                  <span>Guest Visitor (50 units/day after Google login)</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => openTrialModal('pro')}
                className="px-6 py-2.5 rounded-xl bg-brand-cyan text-brand-navy font-bold text-xs hover:bg-brand-cyan/90 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                Activate Free Trial Now
              </button>
            </div>
          </div>
        </LazyReveal>

        {/* 5-Tier Capabilities & Resource Matrix */}
        <LazyReveal direction="up" className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Full 5-Tier Capability &amp; Resource Matrix
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Detailed architectural breakdown of compute limits, probe intervals, API scopes, and support SLAs across all five tiers.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-brand-border/80 bg-brand-surface shadow-2xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm text-white">
              <thead>
                <tr className="border-b border-brand-border bg-[#0e1f36] text-slate-300 uppercase text-[11px] font-bold tracking-wider">
                  <th className="p-4">Resource / Feature</th>
                  <th className="p-4 text-center">Free ($0)</th>
                  <th className="p-4 text-center">Starter ($9)</th>
                  <th className="p-4 text-center text-brand-cyan bg-brand-cyan/5">Pro ($19)</th>
                  <th className="p-4 text-center">Team ($49)</th>
                  <th className="p-4 text-center">Enterprise ($99)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-slate-300">
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">Daily Compute Units</td>
                  <td className="p-4 text-center font-mono">50 units</td>
                  <td className="p-4 text-center font-mono">150 units</td>
                  <td className="p-4 text-center font-mono text-brand-cyan font-bold bg-brand-cyan/5">500 units</td>
                  <td className="p-4 text-center font-mono font-bold">1,500 units</td>
                  <td className="p-4 text-center font-mono font-bold text-emerald-400">5,000 units</td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">Full Master Audits / Day</td>
                  <td className="p-4 text-center font-mono">5 / day</td>
                  <td className="p-4 text-center font-mono">15 / day</td>
                  <td className="p-4 text-center font-mono text-brand-cyan font-bold bg-brand-cyan/5">50 / day</td>
                  <td className="p-4 text-center font-mono font-bold">150 / day</td>
                  <td className="p-4 text-center font-mono font-bold text-emerald-400">500 / day</td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">Single Engine Scans / Day</td>
                  <td className="p-4 text-center font-mono">50 / day</td>
                  <td className="p-4 text-center font-mono">150 / day</td>
                  <td className="p-4 text-center font-mono text-brand-cyan font-bold bg-brand-cyan/5">500 / day</td>
                  <td className="p-4 text-center font-mono font-bold">1,500 / day</td>
                  <td className="p-4 text-center font-mono font-bold text-emerald-400">5,000 / day</td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">7-Day Free Trial Available</td>
                  <td className="p-4 text-center text-slate-500">&mdash;</td>
                  <td className="p-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 font-bold bg-brand-cyan/5"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">Burst Rate Limit (per min)</td>
                  <td className="p-4 text-center font-mono">45 req/min</td>
                  <td className="p-4 text-center font-mono">60 req/min</td>
                  <td className="p-4 text-center font-mono text-brand-cyan font-bold bg-brand-cyan/5">120 req/min</td>
                  <td className="p-4 text-center font-mono">300 req/min</td>
                  <td className="p-4 text-center font-mono text-emerald-400 font-bold">500 req/min</td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">Monitored Target Slots</td>
                  <td className="p-4 text-center text-slate-500">1 domain</td>
                  <td className="p-4 text-center">3 domains</td>
                  <td className="p-4 text-center text-brand-cyan font-bold bg-brand-cyan/5">10 domains</td>
                  <td className="p-4 text-center">30 domains</td>
                  <td className="p-4 text-center font-bold text-emerald-400">Unlimited</td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">Automated Probe Frequency</td>
                  <td className="p-4 text-center text-slate-500">Manual Only</td>
                  <td className="p-4 text-center">Every 60 min</td>
                  <td className="p-4 text-center text-brand-cyan font-bold bg-brand-cyan/5">Every 30 min</td>
                  <td className="p-4 text-center">Every 15 min</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Every 5 min</td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">CI/CD GitHub Actions &amp; Webhooks</td>
                  <td className="p-4 text-center text-slate-500">&mdash;</td>
                  <td className="p-4 text-center text-slate-400">Basic</td>
                  <td className="p-4 text-center text-emerald-400 bg-brand-cyan/5"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">Developer REST API Keys</td>
                  <td className="p-4 text-center text-slate-500">&mdash;</td>
                  <td className="p-4 text-center text-slate-500">&mdash;</td>
                  <td className="p-4 text-center text-emerald-400 bg-brand-cyan/5"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">LLMO Prompt Token Tracing</td>
                  <td className="p-4 text-center text-slate-500">&mdash;</td>
                  <td className="p-4 text-center text-slate-500">&mdash;</td>
                  <td className="p-4 text-center text-emerald-400 bg-brand-cyan/5"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">Anomaly Alerts (Slack &amp; Discord)</td>
                  <td className="p-4 text-center text-slate-500">&mdash;</td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400 bg-brand-cyan/5"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                  <td className="p-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">Private VPC Runners &amp; SSO/SAML</td>
                  <td className="p-4 text-center text-slate-500">&mdash;</td>
                  <td className="p-4 text-center text-slate-500">&mdash;</td>
                  <td className="p-4 text-center text-slate-500 bg-brand-cyan/5">&mdash;</td>
                  <td className="p-4 text-center text-slate-400">Optional</td>
                  <td className="p-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-brand-navy/60 transition-colors">
                  <td className="p-4 font-bold text-white">Support &amp; SLA Guarantee</td>
                  <td className="p-4 text-center text-slate-400">Community</td>
                  <td className="p-4 text-center text-slate-300">Standard Email</td>
                  <td className="p-4 text-center text-brand-cyan font-bold bg-brand-cyan/5">Priority Queue</td>
                  <td className="p-4 text-center text-indigo-300 font-bold">24/7 SLA (4h)</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">99.99% SLA + Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </LazyReveal>

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
            className="shrink-0 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-500 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-brand-navy hover:from-brand-cyan/90 hover:to-blue-400 transition-all shadow-lg active:scale-95"
          >
            Speak with Solution Engineering
          </Link>
        </LazyReveal>

        {/* Global FAQ Section with full tabviews (Engines, CI/CD, Plans, Trial, AI, Security, Performance, API, Privacy) */}
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
