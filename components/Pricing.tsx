'use client';

import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with AI-assisted research.',
    tokens: '10,000',
    color: 'var(--border-subtle)',
    highlight: false,
    features: [
      '10,000 AI tokens / month',
      'Access to 20 research instruments',
      '9 literature sources',
      'Basic paper search',
      'Community access',
    ],
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    description: 'For serious researchers who need more firepower.',
    tokens: '100,000',
    color: 'var(--accent)',
    highlight: true,
    features: [
      '100,000 AI tokens / month',
      'Everything in Free',
      'Priority AI processing',
      'Advanced synthesis & gap analysis',
      'Export to PDF / BibTeX',
      'Living literature reviews',
    ],
  },
  {
    name: 'Lab',
    price: '$39',
    period: 'per month',
    description: 'For research teams and power users.',
    tokens: '500,000',
    color: 'var(--zone-c)',
    highlight: false,
    features: [
      '500,000 AI tokens / month',
      'Everything in Pro',
      'Team collaboration (up to 5 members)',
      'Custom instrument configurations',
      'API access',
      'Priority support',
    ],
  },
];

export function Pricing() {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={cn(
            'relative rounded-[var(--r-xl)] border p-8 flex flex-col transition-all',
            plan.highlight
              ? 'bg-[var(--accent-subtle)] border-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]'
              : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)]'
          )}
        >
          {plan.highlight && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-[var(--accent)] text-white text-[11px] font-semibold rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1">{plan.name}</h3>
            <p className="text-[13px] text-[var(--text-secondary)] mb-4">{plan.description}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[36px] font-bold text-[var(--text-primary)]">{plan.price}</span>
              <span className="text-[13px] text-[var(--text-tertiary)]">/{plan.period}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" style={{ color: plan.color }} />
              <span className="text-[12px] font-mono text-[var(--text-secondary)]">
                {plan.tokens} tokens / month
              </span>
            </div>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-[13px] text-[var(--text-secondary)]">
                <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.color }} />
                {feature}
              </li>
            ))}
          </ul>

          <button
            className={cn(
              'w-full py-3 rounded-[var(--r-md)] text-[14px] font-medium transition-all',
              plan.highlight
                ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                : 'bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            )}
          >
            {plan.price === '$0' ? 'Get started free' : `Upgrade to ${plan.name}`}
          </button>
        </div>
      ))}
    </div>
  );
}
