// @vitest-environment node
// Owner decisions D9 (publish and enforce 14/60/90/365/730-day retention) and
// question 2 (enforce with BOTH a TTL index and an on-request sweep), plus the
// Q26 windows for contact messages and logs.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_PLANS_LIST } from '@/data/pricingData';
import {
  CLIENT_LOG_RETENTION_DAYS,
  CONTACT_RETENTION_DAYS,
  DAY_MS,
  PAYMENT_EVENT_RETENTION_DAYS,
  RETENTION_POLICIES,
  SWEEP_INTERVAL_MS,
  TELEMETRY_FLOOR_DAYS,
  TELEMETRY_HARD_CAP_DAYS,
  ensureRetentionIndexes,
  expireAt,
  maybeSweepOnRequest,
  resetSweepThrottle,
  retentionStatus,
  setSweepTargetsForTests,
  sweepExpiredDocuments,
  telemetryRetentionDaysForPlan,
  type FirestoreSweepTarget,
  type MongoSweepTarget
} from '@server/core/retention';

function fakeMongo(domains: { domain: string; ownerId: string }[] = []) {
  const state = {
    domainCalls: [] as { domain: string; cutoff: Date }[],
    orphanCalls: [] as Date[],
    indexCalls: 0
  };
  const target: MongoSweepTarget = {
    async listDomains() {
      return domains;
    },
    async deleteEventsForDomainOlderThan(domain, cutoff) {
      state.domainCalls.push({ domain, cutoff });
      return 1;
    },
    async deleteOrphanEventsOlderThan(cutoff) {
      state.orphanCalls.push(cutoff);
      return 2;
    },
    async createTtlIndex() {
      state.indexCalls += 1;
      return 'ttl_events_retention_cap';
    }
  };
  return {
    target,
    get domainCalls() {
      return state.domainCalls;
    },
    get orphanCalls() {
      return state.orphanCalls;
    },
    get indexCalls() {
      return state.indexCalls;
    }
  };
}

function fakeFirestore(expired: Record<string, string[]> = {}) {
  const state = {
    queries: [] as { collection: string; now: Date; limit: number }[],
    deletions: [] as { collection: string; ids: string[] }[]
  };
  const target: FirestoreSweepTarget = {
    async findExpired(collection, now, limit) {
      state.queries.push({ collection, now, limit });
      return expired[collection] ?? [];
    },
    async deleteDocuments(collection, ids) {
      state.deletions.push({ collection, ids });
      return ids.length;
    }
  };
  return {
    target,
    get queries() {
      return state.queries;
    },
    get deletions() {
      return state.deletions;
    }
  };
}

beforeEach(() => {
  resetSweepThrottle();
});

afterEach(() => {
  setSweepTargetsForTests({ firestore: null, mongo: null, resolvePlan: null });
  resetSweepThrottle();
});

describe('D9 retention windows come from the published pricing table', () => {
  it('maps every plan to its published telemetryRetentionDays', () => {
    for (const plan of ALL_PLANS_LIST) {
      expect(telemetryRetentionDaysForPlan(plan.id)).toBe(plan.telemetryRetentionDays);
    }
    // The five published values.
    expect([
      telemetryRetentionDaysForPlan('free'),
      telemetryRetentionDaysForPlan('starter'),
      telemetryRetentionDaysForPlan('pro'),
      telemetryRetentionDaysForPlan('team'),
      telemetryRetentionDaysForPlan('enterprise')
    ]).toEqual([14, 60, 90, 365, 730]);
  });

  it('falls back to the floor for unknown plans and caps at the hard maximum', () => {
    expect(telemetryRetentionDaysForPlan('enterprise-plus')).toBe(TELEMETRY_FLOOR_DAYS);
    expect(telemetryRetentionDaysForPlan(undefined)).toBe(TELEMETRY_FLOOR_DAYS);
    expect(TELEMETRY_HARD_CAP_DAYS).toBe(730);
  });

  it('publishes the Q26 windows for contact messages, the audit trail and logs', () => {
    expect(CONTACT_RETENTION_DAYS).toBe(365);
    expect(PAYMENT_EVENT_RETENTION_DAYS).toBe(730);
    expect(CLIENT_LOG_RETENTION_DAYS).toBe(30);
    expect(RETENTION_POLICIES.map((policy) => policy.collection)).toEqual([
      'events',
      'contact_inquiries',
      'payment_events',
      'application logs'
    ]);
  });

  it('computes an absolute deletion timestamp', () => {
    const created = Date.UTC(2026, 9, 1);
    expect(expireAt(created, 14).getTime()).toBe(created + 14 * DAY_MS);
    expect(expireAt(new Date(created), 365).getTime()).toBe(created + 365 * DAY_MS);
    const fromNow = expireAt(undefined, 30).getTime();
    expect(Math.abs(fromNow - (Date.now() + 30 * DAY_MS))).toBeLessThan(5_000);
  });
});

describe('TTL index backstop', () => {
  it('creates the telemetry TTL index when Mongo is configured', async () => {
    const mongo = fakeMongo();
    setSweepTargetsForTests({ mongo: mongo.target });
    const created = await ensureRetentionIndexes();
    expect(created).toEqual(['ttl_events_retention_cap']);
    expect(mongo.indexCalls).toBe(1);
  });

  it('is a no-op without Mongo and survives an index failure', async () => {
    setSweepTargetsForTests({ mongo: null });
    expect(await ensureRetentionIndexes()).toEqual([]);

    const broken = {
      async listDomains() {
        return [];
      },
      async deleteEventsForDomainOlderThan() {
        return 0;
      },
      async deleteOrphanEventsOlderThan() {
        return 0;
      },
      async createTtlIndex(): Promise<string> {
        throw new Error('index build conflict');
      }
    } as unknown as MongoSweepTarget;
    setSweepTargetsForTests({ mongo: broken });
    expect(await ensureRetentionIndexes()).toEqual([]);
  });
});

describe('sweepExpiredDocuments', () => {
  it('applies each domain owner tier window and the floor for orphans', async () => {
    const mongo = fakeMongo([
      { domain: 'pro-site.com', ownerId: 'uid_pro' },
      { domain: 'free-site.com', ownerId: 'uid_free' },
      { domain: 'second-pro.com', ownerId: 'uid_pro' }
    ]);
    const plans: Record<string, string> = { uid_pro: 'pro', uid_free: 'free' };
    const resolvePlan = vi.fn(async (ownerId: string) => plans[ownerId] ?? 'free');
    setSweepTargetsForTests({ mongo: mongo.target, resolvePlan });

    const now = new Date('2026-10-19T12:00:00.000Z');
    const report = await sweepExpiredDocuments({ now });

    expect(report.errors).toEqual([]);
    expect(mongo.domainCalls).toEqual([
      { domain: 'pro-site.com', cutoff: new Date(now.getTime() - 90 * DAY_MS) },
      { domain: 'free-site.com', cutoff: new Date(now.getTime() - 14 * DAY_MS) },
      { domain: 'second-pro.com', cutoff: new Date(now.getTime() - 90 * DAY_MS) }
    ]);
    // The plan is resolved once per owner, not once per domain.
    expect(resolvePlan).toHaveBeenCalledTimes(2);
    expect(mongo.orphanCalls).toEqual([new Date(now.getTime() - TELEMETRY_FLOOR_DAYS * DAY_MS)]);
    expect(report.deleted['events:pro-site.com']).toBe(1);
    expect(report.deleted['events:orphaned']).toBe(2);
  });

  it('sweeps Firestore collections by their stamped expireAt', async () => {
    const firestore = fakeFirestore({
      contact_inquiries: ['inq_1', 'inq_2'],
      payment_events: ['2checkout:ORDER_CREATED:1']
    });
    setSweepTargetsForTests({ firestore: firestore.target });

    const now = new Date('2026-10-19T12:00:00.000Z');
    const report = await sweepExpiredDocuments({ now, batchSize: 25 });

    expect(report.deleted.contact_inquiries).toBe(2);
    expect(report.deleted.payment_events).toBe(1);
    expect(firestore.queries.every((query) => query.now === now && query.limit === 25)).toBe(true);
    expect(firestore.deletions.map((entry) => entry.collection)).toEqual(['contact_inquiries', 'payment_events']);
  });

  it('reports a datastore error instead of throwing', async () => {
    const broken = {
      async findExpired(): Promise<string[]> {
        throw new Error('permission-denied');
      },
      async deleteDocuments(): Promise<number> {
        return 0;
      }
    } as FirestoreSweepTarget;
    setSweepTargetsForTests({ firestore: broken, mongo: null });

    const report = await sweepExpiredDocuments();
    expect(report.errors.join(' ')).toMatch(/permission-denied/);
    expect(report.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('does nothing when no datastore is configured', async () => {
    setSweepTargetsForTests({ firestore: null, mongo: null });
    const report = await sweepExpiredDocuments();
    expect(report.deleted).toEqual({});
    expect(report.errors).toEqual([]);
  });
});

describe('question 2: the on-request sweep is throttled', () => {
  it('runs once per interval and never blocks the request', async () => {
    const firestore = fakeFirestore({ contact_inquiries: ['inq_1'] });
    setSweepTargetsForTests({ firestore: firestore.target, mongo: null });

    maybeSweepOnRequest();
    maybeSweepOnRequest();
    maybeSweepOnRequest();

    // Let the fire-and-forget sweep settle.
    await new Promise((resolve) => setTimeout(resolve, 10));

    // One query per Firestore-backed policy collection (contact + payments).
    const firestorePolicies = RETENTION_POLICIES.filter((policy) => policy.store === 'firestore').length;
    expect(firestorePolicies).toBe(2);
    expect(firestore.queries.length).toBe(firestorePolicies);
    expect(retentionStatus().lastSweepAt).not.toBeNull();
    expect(retentionStatus().sweepInFlight).toBe(false);
    expect(retentionStatus().policies.length).toBe(RETENTION_POLICIES.length);

    // After the interval elapses the next request may sweep again.
    resetSweepThrottle();
    maybeSweepOnRequest();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(firestore.queries.length).toBe(firestorePolicies * 2);
    expect(SWEEP_INTERVAL_MS).toBe(6 * 60 * 60 * 1000);
  });
});
