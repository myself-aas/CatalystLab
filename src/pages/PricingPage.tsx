import React, { useState } from 'react';
import pricingImage from '../assets/images/page-pricing.jpg';
import { PlateImage } from '../components/common/PlateImage';
import pricingImageWebp from '../assets/images/page-pricing.webp';
import pricingImageAvif from '../assets/images/page-pricing.avif';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { LinearCard } from '../components/ui/LinearCard';
import { SectionHeader } from '../components/home/SectionHeader';
import { TelemetryRoiCalculator } from '../components/pricing/TelemetryRoiCalculator';
import { ALL_PLANS_LIST } from '../data/pricingData';
import type { SubscriptionPlan, SubscriptionPlanId } from '../types';

const EASE = [0.16, 1, 0.3, 1] as const;
const FEATURED: SubscriptionPlanId[] = ['starter', 'pro', 'team'];

export default function PricingPage() {
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
 <div className="relative min-h-screen ds-page-top-hero bg-background text-foreground">
 <SEOHead
 title="Pricing — CatalystLab"
 description="Transparent diagnostic tiers from community scans to enterprise air-gapped runners."
 />

 <section className="w-full ds-section">
 <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="ds-page-shell text-center">
 <h1 className="framer-hero-title text-foreground">
 Pricing that scales with the mesh.
 </h1>
 <p className="mx-auto mt-4 max-w-3xl framer-body-text">
 Start free on 42 edge nodes. Upgrade when you need CI gates, scheduled sweeps, and white-label dossiers.
 </p>
 <figure className="mx-auto mt-10 max-w-4xl">
   <PlateImage src={pricingImage} webp={pricingImageWebp} avif={pricingImageAvif} alt="Team comparing CatalystLab pricing plans at a bright office table" className="w-full rounded-2xl border border-ink-navy/[0.08] object-cover aspect-[16/9]" />
 </figure>

 <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1" role="group" aria-label="Billing period">
 <button
 type="button"
 aria-pressed={!annual}
 onClick={() => setAnnual(false)}
 className={`min-h-11 rounded-full px-4 py-1.5 text-sm transition-colors ${
 !annual ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
 }`}
 >
 Monthly
 </button>
 <button
 type="button"
 aria-pressed={annual}
 onClick={() => setAnnual(true)}
 className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors ${
 annual ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
 }`}
 >
 Annual
 <span className={`rounded-full px-2 py-0.5 font-mono text-xs ${annual ? 'bg-background/15 text-background' : 'bg-success/10 text-success'}`}>
 −20%
 </span>
 </button>
 </div>
 </motion.div>
 </section>

 <section className="ds-page-shell ds-section">
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
 popular ? 'border-cream/40 shadow-linear-cta' : ''
 }`}
 >
 <div className="mb-5 flex items-center justify-between">
 <span className="framer-micro-tag text-muted-foreground">
 {plan.badge}
 </span>
 {popular && (
 <span className="inline-flex items-center gap-1 rounded-full border border-cream/20 bg-cream/10 px-2.5 py-0.5 framer-micro-tag text-foreground">
 <Sparkles className="size-3 shrink-0"/>
 Recommended
 </span>
 )}
 </div>
 <h2 className="framer-card-title text-foreground">{plan.name}</h2>
 <p className="mt-2 framer-body-text text-sm">{plan.tagline}</p>
 <div className="mt-6 flex items-baseline gap-1 border-y border-border py-4">
 <span className="font-mono text-4xl font-semibold tracking-tight text-foreground">${price}</span>
 <span className="font-mono text-sm text-muted-foreground">/mo</span>
 </div>
 {annual && plan.annualBillingTotal > 0 && (
 <p className="mt-2 font-mono text-[11px] text-muted-foreground">
 ${plan.annualBillingTotal}/yr · save {plan.annualSavingsPercent}%
 </p>
 )}
 <ul className="mt-6 space-y-2.5">
 {plan.features.filter((feat) => feat.included).slice(0, 7).map((feat) => (
 <li key={feat.text} className="flex items-start gap-2 text-sm text-muted-foreground">
 <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true"/>
 <span>{feat.text}</span>
 </li>
 ))}
 </ul>
 {plan.features.some((feat) => !feat.included) && (
 <p className="mt-4 flex-1 text-xs leading-relaxed text-muted-foreground">
 <X className="mr-1 inline size-3.5 shrink-0 align-[-2px] text-muted-foreground" aria-hidden="true" />
 Not included: {plan.features.filter((feat) => !feat.included).map((feat) => feat.text).join(' · ')}
 </p>
 )}
 <div className="flex-1" />
 <button
 type="button"
 onClick={() => openCheckout(plan.id)}
 className={`ds-btn mt-8 h-11 w-full text-sm font-medium ${
 popular ? 'ds-btn-buy' : 'ds-btn-secondary'
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
 <p className="framer-micro-tag text-foreground">{community.badge}</p>
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
 <p className="framer-micro-tag text-foreground">{enterprise.badge}</p>
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

 <section className="mx-auto mt-24 max-w-3xl ds-section">
 <SectionHeader
 title="Hours back. Incidents down."
 description="Slide probe volume, domains, and seats. We recommend a tier from the same catalog as checkout."
 />
 <TelemetryRoiCalculator onSelectRecommendedPlan={openCheckout} />
 </section>
 </div>
 );
}
