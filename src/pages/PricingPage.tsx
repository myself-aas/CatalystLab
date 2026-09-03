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
    <div className="relative min-h-screen bg-transparent pb-24 text-[#EDEDEF]">
      <SEOHead
        title="Pricing — CatalystLab"
        description="Transparent diagnostic tiers from community scans to enterprise air-gapped runners."
      />

      <section className="relative overflow-hidden px-4 pb-8 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-[#5E6AD2]/15 blur-[140px]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-[#6872D9]">
            <CreditCard className="size-3.5 text-[#5E6AD2]" />
            <span>Compute units, not seats-first</span>
          </div>
          <h1 className="text-gradient-linear text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
            Pricing that scales with the mesh.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#8A8F98] sm:text-lg">
            Start free. Unlock 42 PoPs, CI gates, and white-label dossiers when the lab outgrows a laptop.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                !annual ? 'bg-[#5E6AD2] text-white shadow-linear-cta' : 'text-[#8A8F98] hover:text-[#EDEDEF]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                annual ? 'bg-[#5E6AD2] text-white shadow-linear-cta' : 'text-[#8A8F98] hover:text-[#EDEDEF]'
              }`}
            >
              Annual
              <span className="rounded-full bg-white/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                −20%
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
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
                    popular ? 'border-[#5E6AD2]/40 shadow-linear-cta' : ''
                  }`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#8A8F98]">
                      {plan.badge}
                    </span>
                    {popular && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#6872D9]">
                        <Sparkles className="size-3" />
                        Recommended
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#EDEDEF]">{plan.name}</h2>
                  <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-[#8A8F98]">{plan.tagline}</p>
                  <div className="mt-6 flex items-baseline gap-1 border-y border-white/[0.06] py-4">
                    <span className="font-mono text-4xl font-semibold tracking-tight text-[#EDEDEF]">${price}</span>
                    <span className="font-mono text-sm text-[#8A8F98]">/mo</span>
                  </div>
                  {annual && plan.annualBillingTotal > 0 && (
                    <p className="mt-2 font-mono text-[11px] text-[#8A8F98]">
                      ${plan.annualBillingTotal}/yr · save {plan.annualSavingsPercent}%
                    </p>
                  )}
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.slice(0, 7).map((feat) => (
                      <li
                        key={feat.text}
                        className={`flex items-start gap-2 text-sm ${
                          feat.included ? 'text-[#8A8F98]' : 'text-[#8A8F98]/40 line-through'
                        }`}
                      >
                        {feat.included ? (
                          <Check className="mt-0.5 size-4 shrink-0 text-[#5E6AD2]" />
                        ) : (
                          <X className="mt-0.5 size-4 shrink-0 text-[#8A8F98]/40" />
                        )}
                        <span>{feat.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => openCheckout(plan.id)}
                    className={`mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                      popular
                        ? 'bg-[#5E6AD2] text-white shadow-linear-cta hover:bg-[#6872D9]'
                        : 'border border-white/[0.06] bg-white/[0.05] text-[#EDEDEF] hover:bg-white/[0.08]'
                    }`}
                  >
                    {plan.ctaTextTrial}
                    <ArrowRight className="size-4" />
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
                <p className="font-mono text-[11px] uppercase tracking-widest text-[#6872D9]">{community.badge}</p>
                <h3 className="mt-1 text-xl font-semibold text-[#EDEDEF]">{community.name}</h3>
                <p className="mt-1 max-w-md text-sm text-[#8A8F98]">{community.tagline}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="font-mono text-3xl font-semibold text-[#EDEDEF]">$0</span>
                <Link
                  to="/signup"
                  className="inline-flex h-11 items-center rounded-lg border border-white/[0.06] bg-white/[0.05] px-5 text-sm font-medium text-[#EDEDEF] transition-colors hover:bg-white/[0.08]"
                >
                  Start free
                </Link>
              </div>
            </LinearCard>
          )}
          {enterprise && (
            <LinearCard className="flex flex-col justify-between gap-6 border-[#5E6AD2]/20 p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-[#6872D9]">{enterprise.badge}</p>
                <h3 className="mt-1 text-xl font-semibold text-[#EDEDEF]">{enterprise.name}</h3>
                <p className="mt-1 max-w-md text-sm text-[#8A8F98]">{enterprise.tagline}</p>
              </div>
              <button
                type="button"
                onClick={() => openCheckout('enterprise')}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#5E6AD2] px-5 text-sm font-medium text-white shadow-linear-cta transition-all hover:bg-[#6872D9] active:scale-[0.98]"
              >
                Talk to us
                <ArrowRight className="size-4" />
              </button>
            </LinearCard>
          )}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-[1400px] px-4 sm:px-6 lg:px-8">
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
