import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check, CreditCard, Sparkles, X } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { LinearCard } from '../components/ui/LinearCard';
import { SectionHeader } from '../components/home/SectionHeader';
import { TelemetryRoiCalculator } from '../components/pricing/TelemetryRoiCalculator';
import { ALL_PLANS_LIST } from '../data/pricingData';
import type { SubscriptionPlan, SubscriptionPlanId } from '../types';

const EASE = [0.16, 1, 0.3, 1] as const;
const FEATURED: SubscriptionPlanId[] = ['starter', 'pro', 'team'];

export const PricingPage: React.FC = () => {
 const [annual, setAnnual] = useState(true);

 const openCheckout = (planId: SubscriptionPlanId) => {
 if (planId === 'free') {
 window.location.assign('/signup');
 return;
 }
 if (planId === 'enterprise') {
 window.dispatchEvent(
 new CustomEvent('catalyst:open-get-in-touch', {
 detail: { topic: 'enterprise', sourceContext: 'pricing' },
 })
 );
 return;
 }
 window.dispatchEvent(
 new CustomEvent('catalyst:open-payment-checkout', { detail: { planId } })
 );
 };

 const featured = FEATURED.map((id) => ALL_PLANS_LIST.find((p) => p.id === id)).filter(
 Boolean
 ) as SubscriptionPlan[];
 const community = ALL_PLANS_LIST.find((p) => p.id === 'free');
 const enterprise = ALL_PLANS_LIST.find((p) => p.id === 'enterprise');

 return (
 <div data-theme="dark" className="relative min-h-screen ds-page-top bg-background pb-24 text-foreground">
 <SEOHead
 title="Pricing — CatalystLab"
 description="Transparent diagnostic tiers from community scans to enterprise air-gapped runners."
 />

 <section className="relative overflow-hidden pb-8 w-full">
 <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,102,255,0.12)_0%,transparent_70%)]" />
 <div className="relative z-10 ds-page-shell text-center">
 <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 framer-micro-tag text-[#0066FF]">
 <CreditCard className="size-3.5 text-[#0066FF] shrink-0"/>
 <span>Compute units, not seats-first</span>
 </div>
 <h1 className="framer-hero-title text-foreground">
 Pricing that scales with the mesh.
 </h1>
 <p className="mx-auto mt-4 max-w-3xl framer-body-text">
 Start free. Unlock 42 PoPs, CI gates, and white-label dossiers when the lab outgrows a laptop.
 </p>

 <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 font-mono text-xs">
 <button
 type="button"
 onClick={() => setAnnual(false)}
 className={`rounded-full px-3 py-1.5 transition-all duration-200 ${
 !annual ? 'bg-white/15 text-white shadow-sm' : 'text-muted-foreground hover:text-white'
 }`}
 >
 Monthly
 </button>
 <button
 type="button"
 onClick={() => setAnnual(true)}
 className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-200 ${
 annual ? 'bg-white/15 text-white shadow-sm' : 'text-muted-foreground hover:text-white'
 }`}
 >
 Annual
 <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px]">
 −20%
 </span>
 </button>
 </div>
 </div>
 </section>

 <section className="ds-page-shell">
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
 {featured.map((plan, i) => {
 const price = annual ? plan.priceAnnualMonthly : plan.priceMonthly;
 const popular = plan.popular;
 return (
 <motion.div
 key={plan.id}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, amount: 0.2 }}
 transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
 className={popular ? 'lg:-translate-y-3' : ''}
 >
 <LinearCard
 className={`flex h-full flex-col p-6 sm:p-8 ${
 popular ? 'border-[#0066FF]/40 shadow-linear-cta' : ''
 }`}
 >
 <div className="mb-5 flex items-center justify-between">
 <span className="framer-micro-tag text-muted-foreground">
 {plan.badge}
 </span>
 {popular && (
 <span className="inline-flex items-center gap-1 rounded-full border border-[#0066FF]/20 bg-[#0066FF]/10 px-2.5 py-0.5 framer-micro-tag text-[#0066FF]">
 <Sparkles className="size-3 shrink-0"/>
 Recommended
 </span>
 )}
 </div>
 <h2 className="framer-card-title text-foreground">{plan.name}</h2>
 <p className="mt-2 min-h-[44px] framer-body-text text-sm">{plan.tagline}</p>
 <div className="mt-6 flex items-baseline gap-1 border-y border-border py-4">
 <span className="font-mono text-4xl font-semibold tracking-tight text-foreground">${price}</span>
 <span className="font-mono text-sm text-muted-foreground">/mo</span>
 </div>
 {annual && plan.annualBillingTotal > 0 && (
 <p className="mt-2 font-mono text-[11px] text-muted-foreground">
 ${plan.annualBillingTotal}/yr · save {plan.annualSavingsPercent}%
 </p>
 )}
 <ul className="mt-6 flex-1 space-y-2.5">
 {plan.features.slice(0, 7).map((feat) => (
 <li
 key={feat.text}
 className={`flex items-start gap-2 text-sm ${
 feat.included ? 'text-muted-foreground' : 'text-muted-foreground/40 line-through'
 }`}
 >
 {feat.included ? (
 <Check className="mt-0.5 size-4 shrink-0 text-primary"/>
 ) : (
 <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/40"/>
 )}
 <span>{feat.text}</span>
 </li>
 ))}
 </ul>
 <button
 type="button"
 onClick={() => openCheckout(plan.id)}
 className={`ds-btn mt-8 h-11 w-full text-sm font-medium ${
 popular ? 'ds-btn-primary' : 'ds-btn-secondary'
 }`}
 >
 {plan.ctaTextTrial}
 <ArrowRight className="size-4 shrink-0"/>
 </button>
 </LinearCard>
 </motion.div>
 );
 })}
 </div>

 <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
 {community && (
 <LinearCard className="flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
 <div>
 <p className="framer-micro-tag text-[#0066FF]">{community.badge}</p>
 <h3 className="mt-1 framer-card-title text-foreground">{community.name}</h3>
 <p className="mt-1 framer-body-text text-sm">{community.tagline}</p>
 </div>
 <div className="flex shrink-0 items-center gap-4">
 <span className="font-mono text-3xl font-semibold text-foreground">$0</span>
 <Link
 to="/signup"
 className="ds-btn ds-btn-secondary h-11 text-sm font-medium"
 >
 Start free
 </Link>
 </div>
 </LinearCard>
 )}
 {enterprise && (
 <LinearCard className="flex flex-col justify-between gap-6 border-primary/20 p-6 sm:flex-row sm:items-center sm:p-8">
 <div>
 <p className="framer-micro-tag text-[#0066FF]">{enterprise.badge}</p>
 <h3 className="mt-1 framer-card-title text-foreground">{enterprise.name}</h3>
 <p className="mt-1 framer-body-text text-sm">{enterprise.tagline}</p>
 </div>
 <button
 type="button"
 onClick={() => openCheckout('enterprise')}
 className="ds-btn ds-btn-primary h-11 shrink-0 text-sm font-medium px-4"
 >
 <span>Talk to us</span>
 <ArrowRight className="size-4 shrink-0"/>
 </button>
 </LinearCard>
 )}
 </div>
 </section>

 <section className="mx-auto mt-24 max-w-3xl">
 <SectionHeader
 eyebrow={<span>Model the spend</span>}
 title="Hours back. Incidents down."
 description="Slide probe volume, domains, and seats. We recommend a tier from the same catalog as checkout."
 />
 <TelemetryRoiCalculator onSelectRecommendedPlan={openCheckout} />
 </section>
 </div>
 );
};

export default PricingPage;
