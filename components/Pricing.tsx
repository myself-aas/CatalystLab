'use client';

import React, { useState, useEffect } from 'react';
import { PRICING_PLANS, SubscriptionTier } from '@/lib/pricing';
import { Check, Loader2 } from 'lucide-react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function Pricing() {
  const router = useRouter();
  const [paddle, setPaddle] = useState<Paddle>();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initializePaddle({ 
      environment: 'sandbox', // or 'production'
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '' 
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const plan = PRICING_PLANS[tier];
    if (plan.price === 0) return; // Free plan

    setLoading(tier);
    
    paddle?.Checkout.open({
      items: [{ priceId: plan.paddlePriceId, quantity: 1 }],
      customer: {
        email: user.email
      },
      customData: {
        userId: user.id,
        tier: tier
      }
    });
    
    setLoading(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto p-4">
      {(Object.keys(PRICING_PLANS) as SubscriptionTier[]).map((tierKey) => {
        const plan = PRICING_PLANS[tierKey];
        const isFree = plan.price === 0;

        return (
          <div 
            key={tierKey}
            className={cn(
              "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-8 flex flex-col h-full transition-all hover:border-[var(--accent)]",
              tierKey === 'pro' && "border-[var(--accent)] ring-1 ring-[var(--accent)]"
            )}
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[var(--text-primary)]">${plan.price}</span>
                <span className="text-[var(--text-tertiary)] text-sm">/month</span>
              </div>
            </div>

            <p className="text-[14px] text-[var(--text-secondary)] mb-8">
              {plan.tokensPerMonth} AI searches per month
            </p>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-[var(--text-secondary)]">
                  <Check className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(tierKey)}
              disabled={loading === tierKey || isFree}
              className={cn(
                "w-full py-3 rounded-[var(--r-md)] font-medium transition-all flex items-center justify-center gap-2",
                isFree 
                  ? "bg-[var(--bg-sunken)] text-[var(--text-tertiary)] cursor-default"
                  : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
              )}
            >
              {loading === tierKey && <Loader2 className="w-4 h-4 animate-spin" />}
              {isFree ? 'Current Plan' : `Get ${plan.name}`}
            </button>
          </div>
        );
      })}
    </div>
  );
}
