import { describe, expect, it } from 'vitest';
import { normalizeLemonSqueezyEvent, type GatewayEvent } from '../../../server/core/subscriptions';

function createBasePayload(overrides: Record<string, unknown> = {}) {
  return {
    meta: {
      event_name: 'order_created',
      event_time: '2026-11-14T10:00:00Z',
      custom_data: 'cl=usr_test123|pro|monthly|ord_abc123',
    },
    data: {
      id: 'evt_test123',
      attributes: {
        custom_data: 'cl=usr_test123|pro|monthly|ord_abc123',
        user_email: 'test@example.com',
        first_order_item: {
          variant_id: 'var_12345',
        },
      },
    },
    ...overrides,
  };
}

describe('normalizeLemonSqueezyEvent', () => {
  it('normalizes order_created as paid event', () => {
    const payload = createBasePayload({ meta: { event_name: 'order_created' } });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.gateway).toBe('lemonsqueezy');
    expect(event.kind).toBe('paid');
    expect(event.eventId).toBe('lemonsqueezy:order_created:evt_test123');
    expect(event.ownerId).toBe('usr_test123');
    expect(event.ownerEmail).toBe('test@example.com');
    expect(event.planId).toBe('pro');
    expect(event.billingCycle).toBe('monthly');
    expect(event.orderId).toBe('ord_abc123');
  });

  it('normalizes subscription_created as paid event', () => {
    const payload = createBasePayload({ meta: { event_name: 'subscription_created' } });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.kind).toBe('paid');
  });

  it('normalizes subscription_payment_success as renewed event', () => {
    const payload = createBasePayload({ meta: { event_name: 'subscription_payment_success' } });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.kind).toBe('renewed');
  });

  it('normalizes subscription_cancelled as canceled event', () => {
    const payload = createBasePayload({ meta: { event_name: 'subscription_cancelled' } });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.kind).toBe('canceled');
  });

  it('normalizes subscription_expired as canceled event', () => {
    const payload = createBasePayload({ meta: { event_name: 'subscription_expired' } });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.kind).toBe('canceled');
  });

  it('normalizes subscription_payment_refunded as refunded event', () => {
    const payload = createBasePayload({ meta: { event_name: 'subscription_payment_refunded' } });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.kind).toBe('refunded');
  });

  it('normalizes subscription_resumed as paid event', () => {
    const payload = createBasePayload({ meta: { event_name: 'subscription_resumed' } });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.kind).toBe('paid');
  });

  it('normalizes subscription_unpaused as paid event', () => {
    const payload = createBasePayload({ meta: { event_name: 'subscription_unpaused' } });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.kind).toBe('paid');
  });

  it('returns ignored for unknown event types', () => {
    const payload = createBasePayload({ meta: { event_name: 'unknown_event' } });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.kind).toBe('ignored');
    expect(event.note).toContain('Unhandled Lemon Squeezy event');
  });

  it('extracts ownerId from custom_data when meta.custom_data is missing', () => {
    const payload = createBasePayload({
      meta: { event_name: 'order_created', custom_data: undefined },
      data: {
        id: 'evt_test123',
        attributes: {
          custom_data: 'cl=usr_from_attr|starter|annual|ord_attr123',
          user_email: 'attr@example.com',
        },
      },
    });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.ownerId).toBe('usr_from_attr');
    expect(event.planId).toBe('starter');
    expect(event.billingCycle).toBe('annual');
    expect(event.orderId).toBe('ord_attr123');
  });

  it('falls back to user_email for ownerId when custom_data missing ownerId', () => {
    const payload = createBasePayload({
      meta: { event_name: 'order_created', custom_data: 'cl=anonymous|pro|monthly|ord_abc123' },
      data: {
        id: 'evt_test123',
        attributes: {
          custom_data: 'cl=anonymous|pro|monthly|ord_abc123',
          user_email: 'fallback@example.com',
        },
      },
    });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.ownerId).toBe('fallback@example.com');
    expect(event.ownerEmail).toBe('fallback@example.com');
  });

  it('uses receivedAt as fallback for occurredAt when no timestamp in payload', () => {
    const receivedAt = 1_700_000_000_000;
    const payload = createBasePayload({
      meta: { event_name: 'order_created', event_time: undefined },
      data: {
        id: 'evt_test123',
        attributes: {
          custom_data: 'cl=usr_test123|pro|monthly|ord_abc123',
          user_email: 'test@example.com',
          created_at: undefined,
        },
      },
    });
    const event = normalizeLemonSqueezyEvent(payload, receivedAt);

    expect(event.occurredAt).toBe(receivedAt);
  });

  it('parses timestamp from meta.event_time when available', () => {
    const payload = createBasePayload({
      meta: { event_name: 'order_created', event_time: '2026-11-14T15:30:00Z' },
    });
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    // 2026-11-14T15:30:00Z in milliseconds (Date.parse parses as UTC due to Z suffix)
    expect(event.occurredAt).toBe(Date.parse('2026-11-14T15:30:00Z'));
  });

  it('handles missing data.attributes gracefully', () => {
    const payload = {
      meta: { event_name: 'order_created', event_time: '2026-11-14T10:00:00Z' },
      data: { id: 'evt_test123' },
    };
    const event = normalizeLemonSqueezyEvent(payload, 1_700_000_000_000);

    expect(event.kind).toBe('paid');
    expect(event.ownerId).toBeUndefined();
    expect(event.ownerEmail).toBeUndefined();
    expect(event.planId).toBeUndefined();
    expect(event.billingCycle).toBeUndefined();
    expect(event.orderId).toBe('evt_test123');
  });

  it('handles completely empty payload', () => {
    const event = normalizeLemonSqueezyEvent({}, 1_700_000_000_000);

    expect(event.gateway).toBe('lemonsqueezy');
    expect(event.kind).toBe('ignored');
    expect(event.eventId).toBe('lemonsqueezy:notification:unknown');
    expect(event.occurredAt).toBe(1_700_000_000_000);
  });
});