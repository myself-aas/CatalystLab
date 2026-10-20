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
// D2: 2Checkout is the single live gateway. Dodo Payments stays in the code
// base but is disabled unless `PAYMENT_GATEWAY=dodopay` is set explicitly.

export type GatewayId = '2checkout' | 'dodopay';

export const SUBSCRIPTION_COLLECTION = 'user_subscriptions';
export const PAYMENT_EVENT_COLLECTION = 'payment_events';

/** The gateway this deployment accepts payments through. */
export function activeGateway(): GatewayId {
  const configured = (process.env.PAYMENT_GATEWAY || '').trim().toLowerCase();
  return configured === 'dodopay' ? 'dodopay' : '2checkout';
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

/**
 * Normalises a 2Checkout / Verifone INS (instant notification) payload.
 * Only fields the gateway signs over are used; anything the merchant controls
 * (plan, cycle, owner) comes from the `custom` passthrough we wrote into the
 * checkout URL.
 */
export function normalize2CheckoutEvent(payload: any, receivedAt = Date.now()): GatewayEvent {
  const messageType = String(payload?.message_type || payload?.messageType || '').toUpperCase();
  const saleId = firstString(payload?.sale_id, payload?.saleId);
  const invoiceId = firstString(payload?.invoice_id, payload?.invoiceId);
  const recurringId = firstString(payload?.recurring_id, payload?.recurringId);
  const reference = saleId || invoiceId || recurringId || 'unknown';
  const invoiceStatus = String(payload?.invoice_status || payload?.list_status || payload?.status || '').toLowerCase();
  const custom = parseCheckoutCustomField(payload?.custom ?? payload?.merchant_custom_field);

  let kind: GatewayEventKind = 'ignored';
  if (messageType.includes('REFUND') || messageType.includes('CHARGEBACK')) {
    kind = 'refunded';
  } else if (messageType.includes('RECURRING_STOPPED') || messageType.includes('CANCEL') || invoiceStatus === 'canceled') {
    kind = 'canceled';
  } else if (messageType.includes('ORDER_CREATED') || messageType.includes('INVOICE_INCOMING_PAYMENT') || invoiceStatus === 'paid') {
    kind = recurringId && messageType.includes('INVOICE_INCOMING_PAYMENT') ? 'renewed' : 'paid';
  }

  // item_list carries the product we passed as `prod=<planId>` at checkout.
  const itemList = Array.isArray(payload?.item_list) ? payload.item_list : [];
  const productPlan = itemList
    .map((item: any) => item?.product_id ?? item?.productId)
    .find((value: unknown) => isKnownPlanId(value)) as SubscriptionPlanId | undefined;

  return {
    eventId: `2checkout:${messageType || 'notification'}:${reference}`,
    gateway: '2checkout',
    kind,
    occurredAt: toEpochMs(payload?.timestamp ?? payload?.event_date ?? payload?.created_at, receivedAt),
    ownerId: custom.ownerId || firstString(payload?.customer_id),
    ownerEmail: firstString(payload?.customer_email, payload?.email),
    planId: custom.planId || productPlan,
    billingCycle: custom.billingCycle,
    orderId: custom.orderId || saleId,
    note: kind === 'ignored' ? `Unhandled 2Checkout message_type "${messageType || 'none'}".` : undefined
  };
}

/** Normalises a Dodo Payments webhook payload (gateway disabled by default, D2). */
export function normalizeDodoEvent(payload: any, receivedAt = Date.now()): GatewayEvent {
  // Dodo sends dotted event names (`payment.succeeded`); canonicalise the
  // separators so the classifier below can match on one spelling.
  const rawEventType = String(payload?.event || payload?.type || '').toLowerCase();
  const eventType = rawEventType.replace(/[.\-\s]/g, '_');
  const object = payload?.object ?? payload?.data ?? {};
  const eventId = firstString(payload?.event_id, payload?.id, object?.id) || 'unknown';
  const custom = parseCheckoutCustomField(object?.metadata?.custom ?? object?.custom ?? payload?.custom);

  let kind: GatewayEventKind = 'ignored';
  if (eventType.includes('refund') || eventType.includes('dispute')) {
    kind = 'refunded';
  } else if (eventType.includes('cancel') || eventType.includes('subscription_inactive')) {
    kind = 'canceled';
  } else if (eventType.includes('payment_succeeded') || eventType.includes('subscription_active') || eventType.includes('renewed')) {
    kind = eventType.includes('renewed') || eventType.includes('subscription_active') ? 'renewed' : 'paid';
  }

  return {
    eventId: `dodopay:${rawEventType || 'notification'}:${eventId}`,
    gateway: 'dodopay',
    kind,
    occurredAt: toEpochMs(payload?.created_at ?? object?.created_at, receivedAt),
    ownerId: custom.ownerId || firstString(object?.customer?.id),
    ownerEmail: firstString(object?.customer?.email, payload?.customer_email),
    planId: custom.planId || (isKnownPlanId(object?.product_id) ? object.product_id : undefined),
    billingCycle: custom.billingCycle,
    orderId: custom.orderId || firstString(object?.payment_id, object?.id),
    note: kind === 'ignored' ? `Unhandled Dodo Payments event "${rawEventType || 'none'}".` : undefined
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
