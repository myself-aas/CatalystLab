import { logger } from './logger';
import { getAdminFirestore } from '../../src/lib/serverAuth';
import { isKnownPlanId } from './pricing';
import { PAYMENT_EVENT_RETENTION_DAYS, expireAt } from './retention';
import type { BillingCycle } from './pricing';
import type { SubscriptionPlanId } from '../../src/types';

export { isKnownPlanId } from './pricing';
export type { BillingCycle } from './pricing';

// Paid entitlements (owner decision D1, 2026-10-19): a signed gateway
// notification is the ONLY writer of a paid subscription. The client can never
// activate a paid plan, every event is applied at most once (idempotent on the
// gateway event id), and an older event can never overwrite a newer state.
//
// D2: Lemon Squeezy is the single live gateway.

export type GatewayId = 'lemonsqueezy';

export const SUBSCRIPTION_COLLECTION = 'user_subscriptions';
export const PAYMENT_EVENT_COLLECTION = 'payment_events';

/** The gateway this deployment accepts payments through. */
export function activeGateway(): GatewayId {
  return 'lemonsqueezy';
}

/** True when `gateway` is the configured live gateway (D2). */
export function isGatewayEnabled(gateway: GatewayId): boolean {
  return gateway === activeGateway();
}

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due';

export interface SubscriptionRecord {
  ownerId: string;
  ownerEmail: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  gateway: GatewayId | null;
  gatewayOrderId: string | null;
  lastEventId: string | null;
  lastEventAt: number;
  currentPeriodEndsAt: number | null;
  previousPlanId: SubscriptionPlanId | null;
  trialStartedAt: number | null;
  trialEndsAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export type GatewayEventKind = 'paid' | 'renewed' | 'canceled' | 'refunded' | 'ignored';

export interface GatewayEvent {
  /** Stable, gateway-supplied id used for idempotency. */
  eventId: string;
  gateway: GatewayId;
  kind: GatewayEventKind;
  /** Gateway-side occurrence time in epoch ms (receipt time when absent). */
  occurredAt: number;
  ownerId?: string;
  ownerEmail?: string;
  planId?: SubscriptionPlanId;
  billingCycle?: BillingCycle;
  orderId?: string;
  currentPeriodEndsAt?: number | null;
  /** Why the event cannot be applied (`ignored`, missing attribution, ...). */
  note?: string;
}

/**
 * Merchant passthrough written into the checkout URL so the webhook can
 * attribute a payment to an account without trusting client input at webhook
 * time. Format: `cl=<ownerId>|<planId>|<billingCycle>|<orderId>`.
 */
export function buildCheckoutCustomField(
  ownerId: string | undefined,
  planId: string,
  billingCycle: BillingCycle,
  orderId: string
): string {
  return `cl=${ownerId || 'anonymous'}|${planId}|${billingCycle}|${orderId}`;
}

export function parseCheckoutCustomField(raw: unknown): {
  ownerId?: string;
  planId?: SubscriptionPlanId;
  billingCycle?: BillingCycle;
  orderId?: string;
} {
  if (typeof raw !== 'string' || !raw.startsWith('cl=')) return {};
  const [ownerId, planId, billingCycle, orderId] = raw.slice(3).split('|');
  return {
    ownerId: ownerId && ownerId !== 'anonymous' ? ownerId : undefined,
    planId: isKnownPlanId(planId) ? planId : undefined,
    billingCycle: billingCycle === 'annual' || billingCycle === 'monthly' ? billingCycle : undefined,
    orderId: orderId || undefined
  };
}

/**
 * Builds the Lemon Squeezy checkout URL.
 * Lemon Squeezy uses variant IDs for products, which we map via LEMONSQUEEZY_VARIANT_IDS env var.
 * Format: JSON object mapping "planId:billingCycle" -> variant ID.
 * Example: '{"pro:monthly":"12345","pro:annual":"12346","starter:monthly":"12347"}'
 */
export function buildLemonSqueezyCheckoutUrl(
  planId: string,
  billingCycle: BillingCycle,
  customField: string,
  isSandbox: boolean
): string | null {
  const variantIdsRaw = process.env.LEMONSQUEEZY_VARIANT_IDS || '{}';
  let variantIds: Record<string, string>;
  try {
    variantIds = JSON.parse(variantIdsRaw);
  } catch {
    logger.warn({ variantIdsRaw }, '[LemonSqueezy] Failed to parse LEMONSQUEEZY_VARIANT_IDS, using empty map');
    variantIds = {};
  }

  const variantKey = `${planId}:${billingCycle}`;
  const variantId = variantIds[variantKey];
  if (!variantId) {
    logger.warn({ planId, billingCycle, variantKey }, '[LemonSqueezy] No variant ID configured for plan');
    return null;
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    logger.warn('[LemonSqueezy] LEMONSQUEEZY_STORE_ID not configured');
    return null;
  }

  const host = isSandbox ? 'https://checkout.lemonsqueezy.com' : 'https://checkout.lemonsqueezy.com';
  const params = new URLSearchParams({
    variant: variantId,
    custom: customField,
    embed: '1'
  });

  return `${host}/buy/${variantId}?${params.toString()}`;
}

function toEpochMs(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Gateway timestamps are commonly in seconds; normalise to milliseconds.
    return value < 1e12 ? value * 1000 : value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

/** Normalises a Lemon Squeezy webhook payload. */
export function normalizeLemonSqueezyEvent(payload: any, receivedAt = Date.now()): GatewayEvent {
  // Lemon Squeezy sends event names like `order_created`, `subscription_created`, etc.
  const rawEventType = String(payload?.meta?.event_name || payload?.event_name || '').toLowerCase();
  const data = payload?.data ?? {};
  const attributes = data?.attributes ?? {};
  const meta = payload?.meta ?? {};
  const eventId = firstString(data?.id, meta?.event_id) || 'unknown';
  const custom = parseCheckoutCustomField(attributes?.custom_data ?? meta?.custom_data ?? payload?.custom_data);

  let kind: GatewayEventKind = 'ignored';
  if (rawEventType.includes('refund') || rawEventType.includes('payment_refunded')) {
    kind = 'refunded';
  } else if (rawEventType.includes('cancel') || rawEventType.includes('subscription_cancelled') || rawEventType.includes('subscription_expired')) {
    kind = 'canceled';
  } else if (rawEventType.includes('payment_success') || rawEventType.includes('subscription_payment_success') || rawEventType.includes('order_created') || rawEventType.includes('subscription_created') || rawEventType.includes('subscription_resumed') || rawEventType.includes('subscription_unpaused')) {
    kind = rawEventType.includes('renewed') || rawEventType.includes('subscription_payment_success') ? 'renewed' : 'paid';
  }

  // Lemon Squeezy uses variant IDs; we map them via the custom passthrough or the first_order_item
  const firstOrderItem = attributes?.first_order_item ?? {};
  const variantId = firstString(firstOrderItem?.variant_id, firstOrderItem?.variantId);

  return {
    eventId: `lemonsqueezy:${rawEventType || 'notification'}:${eventId}`,
    gateway: 'lemonsqueezy',
    kind,
    occurredAt: toEpochMs(meta?.event_time ?? attributes?.created_at ?? payload?.created_at, receivedAt),
    ownerId: custom.ownerId || firstString(attributes?.user_email, attributes?.customer_email),
    ownerEmail: firstString(attributes?.user_email, attributes?.customer_email),
    planId: custom.planId,
    billingCycle: custom.billingCycle,
    orderId: custom.orderId || firstString(data?.id, attributes?.order_id),
    note: kind === 'ignored' ? `Unhandled Lemon Squeezy event "${rawEventType || 'none'}".` : undefined
  };
}

// --- Storage ---------------------------------------------------------------

export interface StoreSnapshot {
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}

export interface StoreTransaction {
  get(collection: string, id: string): Promise<StoreSnapshot>;
  set(collection: string, id: string, data: Record<string, unknown>): void;
}

/**
 * Minimal transactional store contract: reads and queued writes that commit
 * together. Implemented on Firestore below and by an in-memory fake in tests.
 */
export interface SubscriptionStore {
  runTransaction<T>(fn: (tx: StoreTransaction) => Promise<T>): Promise<T>;
}

type AdminFirestore = NonNullable<Awaited<ReturnType<typeof getAdminFirestore>>>;

class FirestoreSubscriptionStore implements SubscriptionStore {
  constructor(private readonly db: AdminFirestore) {}

  runTransaction<T>(fn: (tx: StoreTransaction) => Promise<T>): Promise<T> {
    return this.db.runTransaction(async (tx) => {
      const wrapped: StoreTransaction = {
        get: async (collection, id) => {
          const snapshot = await tx.get(this.db.collection(collection).doc(id));
          return {
            exists: snapshot.exists,
            data: () => snapshot.data() as Record<string, unknown> | undefined
          };
        },
        set: (collection, id, data) => {
          tx.set(this.db.collection(collection).doc(id), data, { merge: false });
        }
      };
      return fn(wrapped);
    });
  }
}

let storeOverride: SubscriptionStore | null = null;

/** Test hook: install an in-memory store (null restores the Firestore path). */
export function setSubscriptionStoreForTests(store: SubscriptionStore | null): void {
  storeOverride = store;
}

export async function resolveSubscriptionStore(): Promise<SubscriptionStore | null> {
  if (storeOverride) return storeOverride;
  const db = await getAdminFirestore();
  return db ? new FirestoreSubscriptionStore(db) : null;
}

// --- Application -----------------------------------------------------------

export type ApplyOutcomeReason =
  | 'APPLIED'
  | 'DUPLICATE_EVENT'
  | 'STALE_EVENT'
  | 'IGNORED_EVENT'
  | 'MISSING_OWNER'
  | 'MISSING_PLAN'
  | 'STORE_UNAVAILABLE';

export interface ApplyOutcome {
  applied: boolean;
  reason: ApplyOutcomeReason;
  subscription?: SubscriptionRecord;
  detail?: string;
}

const PERIOD_MS: Record<BillingCycle, number> = {
  monthly: 30 * 24 * 60 * 60 * 1000,
  annual: 365 * 24 * 60 * 60 * 1000
};

/**
 * Applies one verified gateway event to the subscription of record inside a
 * single transaction: the event ledger entry and the subscription document are
 * written together, so a replay cannot be applied twice and a crash cannot
 * leave an acknowledged event unwritten.
 */
export async function applyGatewayEvent(event: GatewayEvent): Promise<ApplyOutcome> {
  if (event.kind === 'ignored') {
    return { applied: false, reason: 'IGNORED_EVENT', detail: event.note };
  }

  // Attribution is checked before the store is touched: a payload that cannot
  // be attributed is rejected the same way whether or not Firestore is up.
  if (!event.ownerId) {
    return {
      applied: false,
      reason: 'MISSING_OWNER',
      detail: 'The signed payload carries no account reference (checkout `custom` passthrough missing).'
    };
  }

  const isRemoval = event.kind === 'canceled' || event.kind === 'refunded';
  if (!isRemoval && !isKnownPlanId(event.planId)) {
    return {
      applied: false,
      reason: 'MISSING_PLAN',
      detail: 'The signed payload names no known plan, so no entitlement can be granted.'
    };
  }

  const store = await resolveSubscriptionStore();
  if (!store) {
    // Fail closed: without a durable write there is no entitlement, and the
    // gateway must keep retrying rather than believe the event was applied.
    return {
      applied: false,
      reason: 'STORE_UNAVAILABLE',
      detail: 'Subscription storage (Firestore) is not configured on this deployment.'
    };
  }

  const ownerId = event.ownerId;

  return store.runTransaction<ApplyOutcome>(async (tx) => {
    const eventDoc = await tx.get(PAYMENT_EVENT_COLLECTION, event.eventId);
    if (eventDoc.exists) {
      return { applied: false, reason: 'DUPLICATE_EVENT', detail: `Event ${event.eventId} was already processed.` };
    }

    const subDoc = await tx.get(SUBSCRIPTION_COLLECTION, ownerId);
    const existing = (subDoc.data() || {}) as Partial<SubscriptionRecord>;
    const lastEventAt = typeof existing.lastEventAt === 'number' ? existing.lastEventAt : 0;

    if (event.occurredAt < lastEventAt) {
      // Out-of-order delivery must never downgrade a newer state.
      return {
        applied: false,
        reason: 'STALE_EVENT',
        detail: `Event occurred at ${new Date(event.occurredAt).toISOString()}, before the applied state at ${new Date(lastEventAt).toISOString()}.`
      };
    }

    const now = Date.now();
    const billingCycle: BillingCycle = event.billingCycle || existing.billingCycle || 'monthly';
    const next: SubscriptionRecord = {
      ownerId,
      ownerEmail: event.ownerEmail || existing.ownerEmail || '',
      planId: isRemoval ? 'free' : (event.planId as SubscriptionPlanId),
      status: isRemoval ? 'canceled' : 'active',
      billingCycle,
      gateway: event.gateway,
      gatewayOrderId: event.orderId || existing.gatewayOrderId || null,
      lastEventId: event.eventId,
      lastEventAt: event.occurredAt,
      currentPeriodEndsAt: isRemoval
        ? null
        : (event.currentPeriodEndsAt ?? event.occurredAt + PERIOD_MS[billingCycle]),
      previousPlanId: existing.planId ?? null,
      trialStartedAt: existing.trialStartedAt ?? null,
      trialEndsAt: existing.trialEndsAt ?? null,
      createdAt: typeof existing.createdAt === 'number' ? existing.createdAt : now,
      updatedAt: now
    };

    tx.set(PAYMENT_EVENT_COLLECTION, event.eventId, {
      eventId: event.eventId,
      gateway: event.gateway,
      kind: event.kind,
      ownerId,
      planId: next.planId,
      billingCycle,
      orderId: next.gatewayOrderId,
      occurredAt: event.occurredAt,
      processedAt: now,
      // Q26/D9: the payment audit trail is kept for 730 days, then swept.
      expireAt: expireAt(now, PAYMENT_EVENT_RETENTION_DAYS)
    });
    tx.set(SUBSCRIPTION_COLLECTION, ownerId, next as unknown as Record<string, unknown>);

    logger.info(
      { gateway: event.gateway, kind: event.kind, ownerId, planId: next.planId, eventId: event.eventId },
      '[Subscriptions] Applied verified gateway event'
    );

    return { applied: true, reason: 'APPLIED', subscription: next };
  });
}
