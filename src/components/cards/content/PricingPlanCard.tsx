import React from 'react';
import { Card } from '../primitives/Card';
import { CardBadge } from '../primitives/CardBadge';
import { CardStatRow } from '../primitives/CardStatRow';
import { CardTitle } from '../primitives/CardTitle';
import { PillCTA } from '../primitives/PillCTA';
import { EnzymeHue, StatPair } from '../types';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';

export interface PricingPlanCardProps {
  id: string;
  name: string;
  price: string;
  period?: string;
  billingSubtext?: string;
  description: string;
  badge?: string;
  isPopular?: boolean;
  isCurrent?: boolean;
  stats?: StatPair[];
  features: string[];
  ctaLabel: string;
  ctaSubtext?: string;
  ctaDisabled?: boolean;
  onCtaClick?: () => void;
  hue?: EnzymeHue;
  className?: string;
}

/**
 * PricingPlanCard (R5 Tier Variant with Immersive Hue for Recommended Plan)
 * Reference Anatomy:
 * - Top-left badge chip ("MOST DEPLOYED", "COMMUNITY", "ENTERPRISE SLA")
 * - Price-as-title with currency and period styling
 * - Address/term line ("Billed annually or $24/mo")
 * - Stat pair with vertical divider (Quota / PoP Reach)
 * - Feature check list
 * - Pill CTA with magnetic arrow or enzyme glow
 */
export const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
  id,
  name,
  price,
  period = '/mo',
  billingSubtext = 'Billed annually',
  description,
  badge,
  isPopular = false,
  isCurrent = false,
  stats = [
    { label: 'API Quota', value: '500k/mo', highlight: true },
    { label: 'PoP Latency', value: '<18ms' },
  ],
  features = [],
  ctaLabel,
  ctaSubtext,
  ctaDisabled = false,
  onCtaClick,
  hue = isPopular ? 'vitalzyme' : 'neutral',
  className,
}) => {
  return (
    <Card
      variant={isPopular ? 'immersive' : 'surface'}
      hue={hue}
      lift={true}
      active={isPopular}
      className={`relative flex flex-col justify-between p-5 sm:p-6 transition-all duration-200 ${
        isPopular
          ? 'border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.25)] lg:-translate-y-2'
          : 'border border-slate-800 hover:border-slate-700 bg-[#080D1A]'
      } ${className || ''}`}
    >
      {/* Top Header Row & Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {badge ? (
            <CardBadge
              variant={isPopular ? 'cyan' : 'neutral'}
              icon={isPopular ? <Sparkles className="w-3 h-3 text-cyan-400" /> : undefined}
              label={badge}
              className="text-[10px] font-mono font-bold uppercase tracking-wider"
            />
          ) : (
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              PLAN TIER
            </span>
          )}

          {isCurrent && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
              ACTIVE
            </span>
          )}
        </div>

        {/* Plan Title & Description */}
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white font-sans">{name}</h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed font-sans min-h-[36px]">
            {description}
          </p>
        </div>

        {/* Price As Title (R5 Specification) */}
        <div className="py-3 border-y border-slate-800/80 my-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
              {price}
            </span>
            <span className="text-xs text-slate-400 font-mono">{period}</span>
          </div>
          {billingSubtext && (
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {billingSubtext}
            </div>
          )}
        </div>

        {/* Stat Pair with Vertical Divider (R5) */}
        {stats && stats.length > 0 && (
          <div className="py-2 mb-4 bg-slate-900/50 rounded-lg border border-slate-800/60 px-3">
            <CardStatRow
              stats={stats}
              layout="inline-dividers"
              size="sm"
            />
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-2 mt-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Included Capabilities:
          </span>
          <ul className="space-y-2 pt-1">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-sans text-slate-300">
                <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isPopular ? 'text-cyan-400' : 'text-emerald-400'}`} />
                <span className="leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action / CTA Row */}
      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <PillCTA
          variant={isPopular ? 'immersive-glow' : 'solid'}
          hue={hue}
          label={ctaLabel}
          hasCircularArrow={true}
          onClick={onCtaClick}
          disabled={ctaDisabled}
          className={`w-full justify-between font-mono text-xs font-bold ${
            isCurrent ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        />

        {ctaSubtext && (
          <p className="mt-2 text-center text-[10px] font-mono text-slate-400">
            {ctaSubtext}
          </p>
        )}
      </div>
    </Card>
  );
};
