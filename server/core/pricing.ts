import { SUBSCRIPTION_PLANS } from '../../src/data/pricingData';
import type { SubscriptionPlanId } from '../../src/types';

// Single price source for checkout (plan item 2.1 / Q23).
//
// `src/data/pricingData.ts` is what the pricing page renders, so it is also
// what the server charges. The local `pricingMap` that used to live in
// `server/routes/payments.ts` disagreed with it on every annual price
// (90/190/490/990 vs the published 84/180/468/948).

export type BillingCycle = 'monthly' | 'annual';

export interface CheckoutPrice {
  planId: SubscriptionPlanId;
  name: string;
  billingCycle: BillingCycle;
  /** Amount charged for the whole cycle, in `currency`. */
  amount: number;
  currency: 'USD';
}

export function isKnownPlanId(value: unknown): value is SubscriptionPlanId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, value);
}

export function normalizeBillingCycle(value: unknown): BillingCycle {
  return value === 'annual' ? 'annual' : 'monthly';
}

/**
 * Resolves the published price for a plan and cycle, or `null` when the plan
 * is unknown or not purchasable. `free` is never purchasable.
 */
export function priceForPlan(planId: unknown, billingCycle: unknown): CheckoutPrice | null {
  if (!isKnownPlanId(planId)) return null;
  const plan = SUBSCRIPTION_PLANS[planId];
  if (planId === 'free') return null;

  const cycle = normalizeBillingCycle(billingCycle);
  const amount = cycle === 'annual' ? plan.annualBillingTotal : plan.priceMonthly;
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return { planId, name: plan.name, billingCycle: cycle, amount, currency: 'USD' };
}
