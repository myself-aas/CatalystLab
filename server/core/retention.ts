import { SUBSCRIPTION_PLANS } from '../../src/data/pricingData';
import { fetchEntitlements, getAdminFirestore } from '../../src/lib/serverAuth';
import { getDbInstance, initAnalyticsDB } from '../../src/lib/analyticsEngine';
import { isKnownPlanId } from './pricing';
import { logger } from './logger';

// Retention (owner decisions D9 + question 2, 2026-10-19).
//
// D9 publishes five tier windows — 14 / 60 / 90 / 365 / 730 days — taken
// straight from `telemetryRetentionDays` in `src/data/pricingData.ts`, the same
// table the pricing page renders, so the promise and the purge cannot drift.
// Question 2: retention is enforced by BOTH mechanisms — a database TTL index
// (the backstop that survives a crashed API) and an on-request sweep (which
// applies the per-tier window the TTL index cannot express).
//
// Q26 adds the non-tier windows: contact messages 365 days, logs 30 days.

export const DAY_MS = 86_400_000;

/** Free tier window — also the floor applied when a plan cannot be resolved. */
export const TELEMETRY_FLOOR_DAYS = 14;
/** Enterprise window — the hard cap the Mongo TTL index enforces. */
export const TELEMETRY_HARD_CAP_DAYS = 730;
export const CONTACT_RETENTION_DAYS = 365;
export const CLIENT_LOG_RETENTION_DAYS = 30;
export const PAYMENT_EVENT_RETENTION_DAYS = 730;

/** How often an incoming request may trigger the sweep (per process). */
export const SWEEP_INTERVAL_MS = 6 * 60 * 60 * 1000;
/** Documents deleted per sweep batch, so a purge cannot stall a request loop. */
export const SWEEP_BATCH_SIZE = 400;

export function telemetryRetentionDaysForPlan(planId: unknown): number {
  if (!isKnownPlanId(planId)) return TELEMETRY_FLOOR_DAYS;
  const days = SUBSCRIPTION_PLANS[planId].telemetryRetentionDays;
  if (!Number.isFinite(days) || days <= 0) return TELEMETRY_FLOOR_DAYS;
  return Math.min(days, TELEMETRY_HARD_CAP_DAYS);
}

/** Absolute deletion timestamp for a document created at `createdAt`. */
export function expireAt(createdAt: number | Date | undefined | null, retentionDays: number): Date {
  const base =
    createdAt instanceof Date
      ? createdAt.getTime()
      : typeof createdAt === 'number' && Number.isFinite(createdAt)
        ? createdAt
        : Date.now();
  return new Date(base + retentionDays * DAY_MS);
}

export interface RetentionPolicy {
  store: 'mongo' | 'firestore' | 'logs';
  collection: string;
  /** Retention window in days, or `per-plan` for tiered telemetry. */
  days: number | 'per-plan';
  field: string;
  mechanism: string;
}

/** The published policy table; rendered into docs and the privacy copy. */
export const RETENTION_POLICIES: RetentionPolicy[] = [
  {
    store: 'mongo',
    collection: 'events',
    days: 'per-plan',
    field: 'timestamp',
    mechanism: `TTL index capped at ${TELEMETRY_HARD_CAP_DAYS} days plus a per-domain sweep at the owner's tier window (14/60/90/365/730).`
  },
  {
    store: 'firestore',
    collection: 'contact_inquiries',
    days: CONTACT_RETENTION_DAYS,
    field: 'expireAt',
    mechanism: 'expireAt stamp at write time plus a sweep query.'
  },
  {
    store: 'firestore',
    collection: 'payment_events',
    days: PAYMENT_EVENT_RETENTION_DAYS,
    field: 'expireAt',
    mechanism: 'expireAt stamp at write time plus a sweep query.'
  },
  {
    store: 'logs',
    collection: 'application logs',
    days: CLIENT_LOG_RETENTION_DAYS,
    field: 'n/a',
    mechanism: 'Log destination rotation (journald/Docker log-opt max-age=30d); credentials redacted at the logger.'
  }
];

// --- Sweep targets (injectable so the policy is testable without databases) --

export interface FirestoreSweepTarget {
  /** Ids of documents whose `expireAt` is at or before `now`. */
  findExpired(collection: string, now: Date, limit: number): Promise<string[]>;
  deleteDocuments(collection: string, ids: string[]): Promise<number>;
}

export interface MongoSweepTarget {
  /** Monitored domains with the owner they belong to. */
  listDomains(): Promise<{ domain: string; ownerId: string }[]>;
  deleteEventsForDomainOlderThan(domain: string, cutoff: Date): Promise<number>;
  /** Backstop for events whose domain is unknown or no longer monitored. */
  deleteOrphanEventsOlderThan(cutoff: Date): Promise<number>;
  createTtlIndex(): Promise<string>;
}

export interface SweepReport {
  ranAt: number;
  durationMs: number;
  deleted: Record<string, number>;
  errors: string[];
}

type AdminFirestore = NonNullable<Awaited<ReturnType<typeof getAdminFirestore>>>;

class FirestoreSweep implements FirestoreSweepTarget {
  constructor(private readonly db: AdminFirestore) {}

  async findExpired(collection: string, now: Date, limit: number): Promise<string[]> {
    const snapshot = await this.db
      .collection(collection)
      .where('expireAt', '<=', now)
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.id);
  }

  async deleteDocuments(collection: string, ids: string[]): Promise<number> {
    let deleted = 0;
    for (const id of ids) {
      await this.db.collection(collection).doc(id).delete();
      deleted += 1;
    }
    return deleted;
  }
}

class MongoSweep implements MongoSweepTarget {
  constructor(private readonly db: NonNullable<Awaited<ReturnType<typeof initAnalyticsDB>>>) {}

  async listDomains(): Promise<{ domain: string; ownerId: string }[]> {
    const docs = await this.db
      .collection('domains')
      .find({}, { projection: { domain: 1, ownerId: 1 } })
      .limit(1000)
      .toArray();
    return docs
      .map((doc: any) => ({ domain: String(doc?.domain || ''), ownerId: String(doc?.ownerId || '') }))
      .filter((entry) => entry.domain && entry.ownerId);
  }

  async deleteEventsForDomainOlderThan(domain: string, cutoff: Date): Promise<number> {
    const result = await this.db
      .collection('events')
      .deleteMany({ 'metadata.domain': domain, timestamp: { $lt: cutoff } });
    return result.deletedCount ?? 0;
  }

  async deleteOrphanEventsOlderThan(cutoff: Date): Promise<number> {
    // Anything older than the hard cap is removed regardless of ownership; the
    // TTL index normally does this, and the sweep covers a missing index.
    const result = await this.db.collection('events').deleteMany({ timestamp: { $lt: cutoff } });
    return result.deletedCount ?? 0;
  }

  async createTtlIndex(): Promise<string> {
    // Time-series collections only support a TTL index on the time field, so
    // the index carries the hard cap; per-tier windows are the sweep's job.
    return this.db
      .collection('events')
      .createIndex({ timestamp: 1 }, { expireAfterSeconds: TELEMETRY_HARD_CAP_DAYS * 24 * 60 * 60, name: 'ttl_events_retention_cap' });
  }
}

let firestoreOverride: FirestoreSweepTarget | null = null;
let mongoOverride: MongoSweepTarget | null = null;
let planResolverOverride: ((ownerId: string) => Promise<string>) | null = null;
let lastSweepAt = 0;
let sweepInFlight: Promise<SweepReport> | null = null;

/** Test hooks. */
export function setSweepTargetsForTests(targets: {
  firestore?: FirestoreSweepTarget | null;
  mongo?: MongoSweepTarget | null;
  resolvePlan?: ((ownerId: string) => Promise<string>) | null;
}): void {
  if ('firestore' in targets) firestoreOverride = targets.firestore ?? null;
  if ('mongo' in targets) mongoOverride = targets.mongo ?? null;
  if ('resolvePlan' in targets) planResolverOverride = targets.resolvePlan ?? null;
}

export function resetSweepThrottle(): void {
  lastSweepAt = 0;
  sweepInFlight = null;
}

async function resolveFirestoreTarget(): Promise<FirestoreSweepTarget | null> {
  if (firestoreOverride) return firestoreOverride;
  const db = await getAdminFirestore();
  return db ? new FirestoreSweep(db) : null;
}

async function resolveMongoTarget(): Promise<MongoSweepTarget | null> {
  if (mongoOverride) return mongoOverride;
  const db = getDbInstance() || (await initAnalyticsDB());
  return db ? new MongoSweep(db) : null;
}

async function resolvePlan(ownerId: string): Promise<string> {
  if (planResolverOverride) return planResolverOverride(ownerId);
  try {
    const entitlements = await fetchEntitlements(ownerId);
    return entitlements?.plan || 'free';
  } catch (err) {
    logger.warn({ err, ownerId }, '[Retention] Entitlement lookup failed; applying the floor window');
    return 'free';
  }
}

/** Creates the TTL indexes that backstop the sweep. Idempotent. */
export async function ensureRetentionIndexes(): Promise<string[]> {
  const created: string[] = [];
  const mongo = await resolveMongoTarget();
  if (!mongo) return created;
  try {
    created.push(await mongo.createTtlIndex());
    logger.info({ index: created[0] }, '[Retention] Telemetry TTL index ensured');
  } catch (err) {
    logger.warn({ err }, '[Retention] Could not ensure the telemetry TTL index');
  }
  return created;
}

/**
 * Applies the published retention windows: per-tier telemetry purge in Mongo
 * and `expireAt` sweeps in Firestore.
 */
export async function sweepExpiredDocuments(
  options: { now?: Date; batchSize?: number } = {}
): Promise<SweepReport> {
  const startedAt = Date.now();
  const now = options.now ?? new Date();
  const batchSize = options.batchSize ?? SWEEP_BATCH_SIZE;
  const deleted: Record<string, number> = {};
  const errors: string[] = [];

  const mongo = await resolveMongoTarget();
  if (mongo) {
    try {
      const domains = await mongo.listDomains();
      const planCache = new Map<string, number>();
      for (const { domain, ownerId } of domains) {
        let days = planCache.get(ownerId);
        if (days === undefined) {
          days = telemetryRetentionDaysForPlan(await resolvePlan(ownerId));
          planCache.set(ownerId, days);
        }
        const cutoff = new Date(now.getTime() - days * DAY_MS);
        deleted[`events:${domain}`] = await mongo.deleteEventsForDomainOlderThan(domain, cutoff);
      }
      // Domains that are no longer monitored fall back to the free-tier floor.
      deleted['events:orphaned'] = await mongo.deleteOrphanEventsOlderThan(
        new Date(now.getTime() - TELEMETRY_FLOOR_DAYS * DAY_MS)
      );
    } catch (err) {
      errors.push(`mongo telemetry sweep: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const firestore = await resolveFirestoreTarget();
  if (firestore) {
    for (const policy of RETENTION_POLICIES.filter((entry) => entry.store === 'firestore')) {
      try {
        const ids = await firestore.findExpired(policy.collection, now, batchSize);
        deleted[policy.collection] = ids.length ? await firestore.deleteDocuments(policy.collection, ids) : 0;
      } catch (err) {
        errors.push(`${policy.collection} sweep: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  const report: SweepReport = {
    ranAt: startedAt,
    durationMs: Date.now() - startedAt,
    deleted,
    errors
  };

  if (errors.length) {
    logger.warn({ errors }, '[Retention] Sweep completed with errors');
  } else {
    const total = Object.values(deleted).reduce((sum, count) => sum + count, 0);
    if (total > 0) logger.info({ total, deleted }, '[Retention] Sweep removed expired documents');
  }
  return report;
}

/**
 * On-request sweep (question 2): at most one sweep per `SWEEP_INTERVAL_MS` per
 * process, started without awaiting so the request is never slowed by it.
 */
export function maybeSweepOnRequest(): void {
  const now = Date.now();
  if (sweepInFlight || now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  sweepInFlight = sweepExpiredDocuments()
    .catch((err) => {
      logger.warn({ err }, '[Retention] On-request sweep failed');
      return null;
    })
    .finally(() => {
      sweepInFlight = null;
    }) as unknown as Promise<SweepReport>;
}

/** Last sweep report, exposed for the operator health surface. */
export function retentionStatus(): {
  lastSweepAt: number | null;
  sweepInFlight: boolean;
  policies: RetentionPolicy[];
} {
  return {
    lastSweepAt: lastSweepAt || null,
    sweepInFlight: Boolean(sweepInFlight),
    policies: RETENTION_POLICIES
  };
}
