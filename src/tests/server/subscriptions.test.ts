// @vitest-environment node
// Owner decisions D1 (webhook writes the subscription), D2 (2Checkout is the
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
  normalize2CheckoutEvent,
  normalizeDodoEvent,
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
  it('runs 2Checkout by default and only enables the configured gateway', () => {
    const previous = process.env.PAYMENT_GATEWAY;
    delete process.env.PAYMENT_GATEWAY;
    expect(activeGateway()).toBe('2checkout');
    expect(isGatewayEnabled('2checkout')).toBe(true);
    expect(isGatewayEnabled('dodopay')).toBe(false);

    process.env.PAYMENT_GATEWAY = 'dodopay';
    expect(activeGateway()).toBe('dodopay');
    expect(isGatewayEnabled('dodopay')).toBe(true);
    expect(isGatewayEnabled('2checkout')).toBe(false);

    process.env.PAYMENT_GATEWAY = 'paypal';
    expect(activeGateway()).toBe('2checkout');

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

describe('2Checkout event normalisation', () => {
  it('maps ORDER_CREATED with the passthrough to a paid activation', () => {
    const event = normalize2CheckoutEvent({
      message_type: 'ORDER_CREATED',
      sale_id: '998877',
      customer_email: 'owner@example.com',
      custom: buildCheckoutCustomField('uid_42', 'pro', 'annual', 'ord_1'),
      timestamp: 1_771_465_200
    });
    expect(event.kind).toBe('paid');
    expect(event.eventId).toBe('2checkout:ORDER_CREATED:998877');
    expect(event.ownerId).toBe('uid_42');
    expect(event.planId).toBe('pro');
    expect(event.billingCycle).toBe('annual');
    expect(event.occurredAt).toBe(1_771_465_200_000);
  });

  it('falls back to the signed item_list product when no passthrough is present', () => {
    const event = normalize2CheckoutEvent({
      message_type: 'ORDER_CREATED',
      invoice_id: 'inv_1',
      item_list: [{ product_id: 'team', price: 468 }]
    });
    expect(event.planId).toBe('team');
    expect(event.ownerId).toBeUndefined();
    expect(event.eventId).toBe('2checkout:ORDER_CREATED:inv_1');
  });

  it('classifies renewals, refunds, cancellations and unknown messages', () => {
    expect(normalize2CheckoutEvent({ message_type: 'INVOICE_INCOMING_PAYMENT', recurring_id: 'r1' }).kind).toBe('renewed');
    expect(normalize2CheckoutEvent({ message_type: 'REFUND_ISSUED', sale_id: 's1' }).kind).toBe('refunded');
    expect(normalize2CheckoutEvent({ message_type: 'RECURRING_STOPPED', sale_id: 's1' }).kind).toBe('canceled');
    expect(normalize2CheckoutEvent({ message_type: 'INVOICE_STATUS_CHANGED', invoice_status: 'paid', sale_id: 's1' }).kind).toBe('paid');

    const ignored = normalize2CheckoutEvent({ message_type: 'FRAUD_STATUS_CHANGED', sale_id: 's1' });
    expect(ignored.kind).toBe('ignored');
    expect(ignored.note).toMatch(/FRAUD_STATUS_CHANGED/);
  });
});

describe('Dodo Payments event normalisation (disabled gateway)', () => {
  it('maps Dodo events and keeps them attributed to the passthrough', () => {
    const paid = normalizeDodoEvent({
      event: 'payment.succeeded',
      event_id: 'evt_1',
      object: { id: 'pay_1', customer: { email: 'owner@example.com' }, metadata: { custom: 'cl=uid_7|starter|monthly|ord_9' } },
      created_at: '2026-10-19T10:00:00.000Z'
    });
    expect(paid.kind).toBe('paid');
    expect(paid.ownerId).toBe('uid_7');
    expect(paid.planId).toBe('starter');
    expect(paid.occurredAt).toBe(Date.parse('2026-10-19T10:00:00.000Z'));

    expect(normalizeDodoEvent({ event: 'payment.refunded', event_id: 'evt_2', object: {} }).kind).toBe('refunded');
    expect(normalizeDodoEvent({ event: 'subscription.cancelled', event_id: 'evt_3', object: {} }).kind).toBe('canceled');
    expect(normalizeDodoEvent({ event: 'subscription.renewed', event_id: 'evt_4', object: { product_id: 'pro' } }).kind).toBe('renewed');
    expect(normalizeDodoEvent({ event: 'payment.failed', event_id: 'evt_5', object: {} }).kind).toBe('ignored');
  });
});

describe('D1 applying a verified gateway event', () => {
  it('fails closed when no subscription store is configured', async () => {
    const outcome = await applyGatewayEvent({
      eventId: 'e1',
      gateway: '2checkout',
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
      eventId: '2checkout:ORDER_CREATED:sale_1',
      gateway: '2checkout',
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

    const stored = store.get(SUBSCRIPTION_COLLECTION, 'uid_1');
    expect(stored?.planId).toBe('pro');
    expect(stored?.gateway).toBe('2checkout');
    expect(store.get(PAYMENT_EVENT_COLLECTION, '2checkout:ORDER_CREATED:sale_1')?.processedAt).toBeTypeOf('number');
    expect(store.commits).toBe(1);
  });

  it('is idempotent: a replayed event is a no-op and writes nothing new', async () => {
    useStore();
    const event = {
      eventId: '2checkout:ORDER_CREATED:sale_2',
      gateway: '2checkout' as const,
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
      gateway: '2checkout',
      kind: 'paid',
      occurredAt: now,
      ownerId: 'uid_3',
      planId: 'team'
    });

    const stale = await applyGatewayEvent({
      eventId: 'older',
      gateway: '2checkout',
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
      gateway: '2checkout',
      kind: 'paid',
      occurredAt: Date.now(),
      planId: 'pro'
    });
    expect(noOwner.applied).toBe(false);
    expect(noOwner.reason).toBe('MISSING_OWNER');

    const noPlan = await applyGatewayEvent({
      eventId: 'e-no-plan',
      gateway: '2checkout',
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
      gateway: '2checkout',
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
      gateway: '2checkout',
      kind: 'paid',
      occurredAt: now,
      ownerId: 'uid_6',
      planId: 'enterprise',
      billingCycle: 'monthly'
    });

    const refund = await applyGatewayEvent({
      eventId: 'refund-1',
      gateway: '2checkout',
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
      gateway: '2checkout',
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
