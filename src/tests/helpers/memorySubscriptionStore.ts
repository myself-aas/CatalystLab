import type { StoreSnapshot, StoreTransaction, SubscriptionStore } from '@server/core/subscriptions';

/**
 * In-memory implementation of the transactional store contract used by
 * `server/core/subscriptions.ts`. Reads and queued writes commit together, and
 * a throw inside the transaction discards the queued writes — the same
 * guarantee the Firestore implementation gives, without needing a database.
 */
export class MemorySubscriptionStore implements SubscriptionStore {
  readonly docs = new Map<string, Map<string, Record<string, unknown>>>();
  /** Number of committed transactions (used to assert atomicity). */
  commits = 0;

  private collection(name: string): Map<string, Record<string, unknown>> {
    let collection = this.docs.get(name);
    if (!collection) {
      collection = new Map();
      this.docs.set(name, collection);
    }
    return collection;
  }

  /** Test convenience: seed a document before running an event. */
  seed(collectionName: string, id: string, data: Record<string, unknown>): void {
    this.collection(collectionName).set(id, { ...data });
  }

  get(collectionName: string, id: string): Record<string, unknown> | undefined {
    return this.docs.get(collectionName)?.get(id);
  }

  async runTransaction<T>(fn: (tx: StoreTransaction) => Promise<T>): Promise<T> {
    const writes: { collection: string; id: string; data: Record<string, unknown> }[] = [];
    const tx: StoreTransaction = {
      get: async (collection, id): Promise<StoreSnapshot> => {
        const existing = this.collection(collection).get(id);
        return {
          exists: Boolean(existing),
          data: () => (existing ? { ...existing } : undefined)
        };
      },
      set: (collection, id, data) => {
        writes.push({ collection, id, data });
      }
    };

    const result = await fn(tx);
    for (const write of writes) {
      this.collection(write.collection).set(write.id, { ...write.data });
    }
    this.commits += 1;
    return result;
  }
}
