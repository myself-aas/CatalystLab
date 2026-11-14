// @vitest-environment node
// Owner decisions D1 (webhook writes the subscription), D2 (Lemon Squeezy is the
// single live gateway) and plan item 2.1 (checkout prices come from
// `src/data/pricingData.ts`).
import { afterEach, describe, expect, it } from 'vitest';
import { SUBSCRIPTION_PLANS, ALL_PLANS_LIST } from '@/data/pricingData';
import { priceForPlan, isKnownPlanId } from '@server/core/pricing';
import {
  applyGatewayEvent,
  buildCheckoutCustomField,
  isGatewayEnabled,
  activeGateway,
  normalizeLemonSqueezyEvent,
  parseCheckoutCustomField,
  setSubscriptionStoreForTests,
  PAYMENT_EVENT_COLLECTION,
  SUBSCRIPTION_COLLECTION
} from '@server/core/subscriptions';
import { MemorySubscriptionStore } from '../helpers/memorySubscriptionStore';

let store: MemorySubscriptionStore;

function useStore(): MemorySubscriptionStore {
  store = new MemorySubscriptionStore();
  setSubscriptionStoreForTests(store);
  return store;
}

afterEach(() => {
  setSubscriptionStoreForTests(null);
});

describe('2.1 pricing parity with the published catalog', () => {
  it('charges exactly what pricingData publishes for every plan and cycle', () => {
    for (const plan of ALL_PLANS_LIST) {
      if (plan.id === 'free') continue;
      const monthly = priceForPlan(plan.id, 'monthly');
      const annual = priceForPlan(plan.id, 'annual');
      expect(monthly?.amount).toBe(SUBSCRIPTION_PLANS[plan.id].priceMonthly);
      expect(annual?.amount).toBe(SUBSCRIPTION_PLANS[plan.id].annualBillingTotal);
      expect(monthly?.currency).toBe('USD');
      expect(annual?.currency).toBe('USD');
    }
  });

  it('rejects unknown plans and never sells the free tier', () => {
    expect(priceForPlan('enterprise-plus', 'monthly')).toBeNull();
    expect(priceForPlan('free', 'monthly')).toBeNull();
    expect(priceForPlan(undefined, 'annual')).toBeNull();
    expect(priceForPlan('__proto__', 'monthly')).toBeNull();
    expect(isKnownPlanId('pro')).toBe(true);
    expect(isKnownPlanId('toString')).toBe(false);
  });

  it('defaults an unknown cycle to monthly', () => {
    expect(priceForPlan('pro', 'weekly')?.billingCycle).toBe('monthly');
    expect(priceForPlan('pro', undefined)?.billingCycle).toBe('monthly');
  });
});

describe('D2 gateway pinning', () => {
  it('runs Lemon Squeezy by default and only enables the configured gateway', () => {
    const previous = process.env.PAYMENT_GATEWAY;
    delete process.env.PAYMENT_GATEWAY;
    expect(activeGateway()).toBe('lemonsqueezy');
    expect(isGatewayEnabled('lemonsqueezy')).toBe(true);

    process.env.PAYMENT_GATEWAY = 'lemonsqueezy';
    expect(activeGateway()).toBe('lemonsqueezy');
    expect(isGatewayEnabled('lemonsqueezy')).toBe(true);

    if (previous === undefined) delete process.env.PAYMENT_GATEWAY;
    else process.env.PAYMENT_GATEWAY = previous;
  });
});

describe('checkout passthrough', () => {
  it('round-trips the merchant custom field', () => {
    const custom = buildCheckoutCustomField('uid_42', 'pro', 'annual', 'ord_1');
    expect(parseCheckoutCustomField(custom)).toEqual({
      ownerId: 'uid_42',
      planId: 'pro',
      billingCycle: 'annual',
      orderId: 'ord_1'
    });
  });

  it('drops an anonymous owner and unknown plan from the passthrough', () => {
    const parsed = parseCheckoutCustomField('cl=anonymous|enterprise-plus|weekly|ord_2');
    expect(parsed.ownerId).toBeUndefined();
    expect(parsed.planId).toBeUndefined();
    expect(parsed.billingCycle).toBeUndefined();
    expect(parsed.orderId).toBe('ord_2');
    expect(parseCheckoutCustomField('not-ours')).toEqual({});
    expect(parseCheckoutCustomField(undefined)).toEqual({});
  });
});

describe('Lemon Squeezy event normalisation', () => {
  it('maps order_created with the passthrough to a paid activation', () => {
    const event = normalizeLemonSqueezyEvent({
      meta: {
        event_name: 'order_created',
        event_time: '2026-11-14T10:00:00Z',
        custom_data: buildCheckoutCustomField('uid_42', 'pro', 'annual', 'ord_1'),
      },
      data: {
        id: 'evt_1',
        attributes: {
          custom_data: buildCheckoutCustomField('uid_42', 'pro', 'annual', 'ord_1'),
          user_email: 'owner@example.com',
          first_order_item: { variant_id: 'var_pro_annual' },
        },
      },
    });
    expect(event.kind).toBe('paid');
    expect(event.eventId).toBe('lemonsqueezy:order_created:evt_1');
    expect(event.ownerId).toBe('uid_42');
    expect(event.planId).toBe('pro');
    expect(event.billingCycle).toBe('annual');
    expect(event.occurredAt).toBe(Date.parse('2026-11-14T10:00:00Z'));
  });

  it('falls back to user_email when no passthrough ownerId is present', () => {
    const event = normalizeLemonSqueezyEvent({
      meta: {
        event_name: 'order_created',
        event_time: '2026-11-14T10:00:00Z',
        custom_data: 'cl=anonymous|pro|annual|ord_1',
      },
      data: {
        id: 'evt_2',
        attributes: {
          custom_data: 'cl=anonymous|pro|annual|ord_1',
          user_email: 'fallback@example.com',
        },
      },
    });
    expect(event.ownerId).toBe('fallback@example.com');
    expect(event.ownerEmail).toBe('fallback@example.com');
    expect(event.planId).toBe('pro');
    expect(event.billingCycle).toBe('annual');
  });

  it('classifies renewals, refunds, cancellations and unknown messages', () => {
    expect(normalizeLemonSqueezyEvent({ meta: { event_name: 'subscription_payment_success' } }).kind).toBe('renewed');
    expect(normalizeLemonSqueezyEvent({ meta: { event_name: 'subscription_payment_refunded' } }).kind).toBe('refunded');
    expect(normalizeLemonSqueezyEvent({ meta: { event_name: 'subscription_cancelled' } }).kind).toBe('canceled');
    expect(normalizeLemonSqueezyEvent({ meta: { event_name: 'subscription_expired' } }).kind).toBe('canceled');
    expect(normalizeLemonSqueezyEvent({ meta: { event_name: 'subscription_resumed' } }).kind).toBe('paid');
    expect(normalizeLemonSqueezyEvent({ meta: { event_name: 'subscription_unpaused' } }).kind).toBe('paid');

    const ignored = normalizeLemonSqueezyEvent({ meta: { event_name: 'unknown_event' } });
    expect(ignored.kind).toBe('ignored');
    expect(ignored.note).toMatch(/unknown_event/);
  });
});

describe('D1 applying a verified gateway event', () => {
  it('fails closed when no subscription store is configured', async () => {
    const outcome = await applyGatewayEvent({
      eventId: 'e1',
      gateway: 'lemonsqueezy',
      kind: 'paid',
      occurredAt: Date.now(),
      ownerId: 'uid_1',
      planId: 'pro'
    });
    expect(outcome.applied).toBe(false);
    expect(outcome.reason).toBe('STORE_UNAVAILABLE');
  });

  it('writes the subscription and the event ledger entry in one transaction', async () => {
    useStore();
    const occurredAt = Date.now();
    const outcome = await applyGatewayEvent({
      eventId: 'lemonsqueezy:order_created:sale_1',
      gateway: 'lemonsqueezy',
      kind: 'paid',
      occurredAt,
      ownerId: 'uid_1',
      ownerEmail: 'owner@example.com',
      planId: 'pro',
      billingCycle: 'annual',
      orderId: 'ord_1'
    });

    expect(outcome.applied).toBe(true);
    expect(outcome.reason).toBe('APPLIED');
    expect(outcome.subscription?.planId).toBe('pro');
    expect(outcome.subscription?.status).toBe('active');
    expect(outcome.subscription?.billingCycle).toBe('annual');
    expect(outcome.subscription?.currentPeriodEndsAt).toBe(occurredAt + 365 * 24 * 60 * 60 * 1000);
  });

  it('is idempotent: a replayed event is a no-op and writes nothing new', async () => {
    useStore();
    const event = {
      eventId: 'lemonsqueezy:order_created:sale_2',
      gateway: 'lemonsqueezy' as const,
      kind: 'paid' as const,
      occurredAt: Date.now(),
      ownerId: 'uid_2',
      planId: 'starter' as const
    };
    const first = await applyGatewayEvent(event);
    const second = await applyGatewayEvent({ ...event });

    expect(first.applied).toBe(true);
    expect(second.applied).toBe(false);
    expect(second.reason).toBe('DUPLICATE_EVENT');
    expect(store.get(SUBSCRIPTION_COLLECTION, 'uid_2')?.planId).toBe('starter');
  });

  it('never lets an older event downgrade a newer state', async () => {
    useStore();
    const now = Date.now();
    await applyGatewayEvent({
      eventId: 'newer',
      gateway: 'lemonsqueezy',
      kind: 'paid',
      occurredAt: now,
      ownerId: 'uid_3',
      planId: 'team'
    });

    const stale = await applyGatewayEvent({
      eventId: 'older',
      gateway: 'lemonsqueezy',
      kind: 'canceled',
      occurredAt: now - 60_000,
      ownerId: 'uid_3'
    });

    expect(stale.applied).toBe(false);
    expect(stale.reason).toBe('STALE_EVENT');
    expect(store.get(SUBSCRIPTION_COLLECTION, 'uid_3')?.planId).toBe('team');
    expect(store.get(SUBSCRIPTION_COLLECTION, 'uid_3')?.status).toBe('active');
  });

  it('refuses to grant an entitlement it cannot attribute', async () => {
    useStore();
    const noOwner = await applyGatewayEvent({
      eventId: 'e-no-owner',
      gateway: 'lemonsqueezy',
      kind: 'paid',
      occurredAt: Date.now(),
      planId: 'pro'
    });
    expect(noOwner.applied).toBe(false);
    expect(noOwner.reason).toBe('MISSING_OWNER');

    const noPlan = await applyGatewayEvent({
      eventId: 'e-no-plan',
      gateway: 'lemonsqueezy',
      kind: 'paid',
      occurredAt: Date.now(),
      ownerId: 'uid_4'
    });
    expect(noPlan.applied).toBe(false);
    expect(noPlan.reason).toBe('MISSING_PLAN');

    expect(store.get(SUBSCRIPTION_COLLECTION, 'uid_4')).toBeUndefined();
  });

  it('records ignored events without touching the subscription', async () => {
    useStore();
    const outcome = await applyGatewayEvent({
      eventId: 'e-ignored',
      gateway: 'lemonsqueezy',
      kind: 'ignored',
      occurredAt: Date.now(),
      ownerId: 'uid_5',
      note: 'Unhandled message type.'
    });
    expect(outcome.applied).toBe(false);
    expect(outcome.reason).toBe('IGNORED_EVENT');
    expect(store.commits).toBe(0);
  });

  it('moves a refund back to free and remembers the previous plan', async () => {
    useStore();
    const now = Date.now();
    await applyGatewayEvent({
      eventId: 'paid-1',
      gateway: 'lemonsqueezy',
      kind: 'paid',
      occurredAt: now,
      ownerId: 'uid_6',
      planId: 'enterprise',
      billingCycle: 'monthly'
    });

    const refund = await applyGatewayEvent({
      eventId: 'refund-1',
      gateway: 'lemonsqueezy',
      kind: 'refunded',
      occurredAt: now + 1000,
      ownerId: 'uid_6'
    });

    expect(refund.applied).toBe(true);
    expect(refund.subscription?.planId).toBe('free');
    expect(refund.subscription?.status).toBe('canceled');
    expect(refund.subscription?.previousPlanId).toBe('enterprise');
    expect(refund.subscription?.currentPeriodEndsAt).toBeNull();
    expect(store.get(SUBSCRIPTION_COLLECTION, 'uid_6')?.planId).toBe('free');
  });

  it('preserves trial fields and createdAt across a paid activation', async () => {
    useStore();
    const createdAt = Date.now() - 86_400_000;
    store.seed(SUBSCRIPTION_COLLECTION, 'uid_7', {
      ownerId: 'uid_7',
      ownerEmail: 'trial@example.com',
      planId: 'pro',
      status: 'trialing',
      billingCycle: 'monthly',
      trialStartedAt: createdAt,
      trialEndsAt: createdAt + 7 * 86_400_000,
      createdAt,
      lastEventAt: 0
    });

    const outcome = await applyGatewayEvent({
      eventId: 'paid-7',
      gateway: 'lemonsqueezy',
      kind: 'paid',
      occurredAt: Date.now(),
      ownerId: 'uid_7',
      planId: 'pro'
    });

    expect(outcome.applied).toBe(true);
    expect(outcome.subscription?.status).toBe('active');
    expect(outcome.subscription?.createdAt).toBe(createdAt);
    expect(outcome.subscription?.trialEndsAt).toBe(createdAt + 7 * 86_400_000);
    expect(outcome.subscription?.ownerEmail).toBe('trial@example.com');
  });
});
