import React from 'react';
import { Card } from '../primitives/Card';
import { CardBadge } from '../primitives/CardBadge';
import { CardStatRow } from '../primitives/CardStatRow';
import { CardTitle } from '../primitives/CardTitle';
import { PillCTA } from '../primitives/PillCTA';
import { EnzymeHue, StatPair } from '../types';
import { Check, Sparkles, Zap, Shield, Crown, X } from 'lucide-react';

export interface PlanFeatureItem {
  text: string;
  included?: boolean;
  badge?: string;
}

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
  features: (string | PlanFeatureItem)[];
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
    <div
      className={`relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-200 bg-white ${
        isPopular
          ? 'border-2 border-slate-900 shadow-md lg:-translate-y-1.5'
          : 'border border-slate-200 hover:border-slate-300 shadow-sm'
      } ${className || ''}`}
    >
      {/* Top Header Row & Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {badge ? (
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                isPopular
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {badge}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              PLAN TIER
            </span>
          )}

          {isCurrent && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
              ACTIVE
            </span>
          )}
        </div>

        {/* Plan Title & Description */}
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-sans">{name}</h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed font-sans min-h-[36px]">
            {description}
          </p>
        </div>

        {/* Price As Title */}
        <div className="py-3 border-y border-slate-100 my-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {price}
            </span>
            <span className="text-xs text-slate-600 font-mono">{period}</span>
          </div>
          {billingSubtext && (
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {billingSubtext}
            </div>
          )}
        </div>

        {/* Stat Pair with Vertical Divider */}
        {stats && stats.length > 0 && (
          <div className="py-2 mb-4 bg-slate-50 rounded-lg border border-slate-200 px-3">
            <CardStatRow
              stats={stats}
              layout="inline-dividers"
              size="sm"
            />
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-2 mt-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700">
            Included Capabilities:
          </span>
          <ul className="space-y-2 pt-1">
            {features.map((item, idx) => {
              const text = typeof item === 'string' ? item : item.text;
              const included = typeof item === 'string' ? true : item.included !== false;
              const featBadge = typeof item === 'string' ? undefined : item.badge;

              return (
                <li
                  key={idx}
                  className={`flex items-start gap-2 text-xs font-sans ${
                    included ? 'text-slate-700' : 'text-slate-400 line-through'
                  }`}
                >
                  {included ? (
                    <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isPopular ? 'text-slate-900 font-bold' : 'text-emerald-600'}`} />
                  ) : (
                    <X className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" />
                  )}
                  <span className="leading-snug flex-1">{text}</span>
                  {featBadge && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      {featBadge}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Action / CTA Row */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={onCtaClick}
          disabled={ctaDisabled}
          className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all shadow-sm cursor-pointer ${
            isPopular
              ? 'bg-slate-900 hover:bg-slate-800 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
          } ${isCurrent ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {ctaLabel}
        </button>

        {ctaSubtext && (
          <p className="mt-2 text-center text-[10px] text-slate-500 font-mono">
            {ctaSubtext}
          </p>
        )}
      </div>
    </div>
  );
};
