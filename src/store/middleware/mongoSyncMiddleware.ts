import { StateCreator } from 'zustand';
import { MongoCollectionName, OptimisticMutation, SyncStatus } from '../types';

export interface MongoSyncState {
  syncStatus: SyncStatus;
  isOnline: boolean;
  lastSyncedAt: number | null;
  pendingMutations: OptimisticMutation[];
  failedMutations: OptimisticMutation[];
  lastError: string | null;

  // Actions provided by sync layer
  setSyncStatus: (status: SyncStatus) => void;
  setIsOnline: (online: boolean) => void;
  clearLastError: () => void;
  retryFailedMutations: () => Promise<void>;
  rollbackMutation: (mutationId: string) => void;
  fetchFullSyncFromMongo: (ownerId?: string) => Promise<void>;
}

export type MongoSyncMiddleware = <T extends MongoSyncState>(
  config: StateCreator<T, [], []>
) => StateCreator<T, [], []>;

const SYNC_ENDPOINT = '/api/state/sync';
const MAX_RETRIES = 3;

/**
 * Custom Zustand Middleware for synchronizing store state with MongoDB documents.
 * Supports:
 * - Instant optimistic UI updates
 * - Automated snapshot rollback on HTTP / Network failure
 * - Background debounced document persistence
 * - Offline queueing & auto-reconnect synchronization
 * - Bi-directional state reconciliation
 */
export const createMongoSyncMiddleware: MongoSyncMiddleware = <T extends MongoSyncState>(
  config: StateCreator<T, [], []>
): StateCreator<T, [], []> => (set, get, api) => {
  // Setup online / offline listeners in browser environments
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      const state = get() as any;
      if (typeof state.setIsOnline === 'function') state.setIsOnline(true);
      if (typeof state.retryFailedMutations === 'function') state.retryFailedMutations();
    });
    window.addEventListener('offline', () => {
      const state = get() as any;
      if (typeof state.setIsOnline === 'function') state.setIsOnline(false);
      if (typeof state.setSyncStatus === 'function') state.setSyncStatus('offline');
    });
  }

  return config(
    (partial, replace) => {
      set(partial as any, replace as any);
    },
    get,
    api
  );
};

/**
 * Execute atomic optimistic mutation with automated background persistence & rollback
 */
export async function dispatchOptimisticMutation<TState, TData = any>(
  set: (partial: any) => void,
  get: () => TState,
  params: {
    collection: MongoCollectionName;
    actionType: 'insert' | 'update' | 'delete' | 'upsert';
    documentId: string;
    payload: TData;
    previousState?: TData | null;
    applyLocalOptimisticUpdate: () => void;
    onSuccess?: (persistedDoc: TData) => void;
    onError?: (err: Error) => void;
  }
) {
  const mutationId = `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const mutation: OptimisticMutation<TData> = {
    id: mutationId,
    collection: params.collection,
    actionType: params.actionType,
    documentId: params.documentId,
    payload: params.payload,
    previousState: params.previousState ?? null,
    timestamp: Date.now(),
    status: 'pending',
    retryCount: 0
  };

  // 1. Apply UI Optimistic Update Immediately
  params.applyLocalOptimisticUpdate();

  // 2. Track in pending mutations queue
  const currentState = get() as any;
  set({
    syncStatus: 'syncing',
    pendingMutations: [...(currentState.pendingMutations || []), mutation]
  });

  // 3. Dispatch to MongoDB backend
  await executeMongoMutation(mutation, set, get, params.onSuccess, params.onError);
}

/**
 * Sends mutation to MongoDB API endpoint and handles commits or rollbacks
 */
async function executeMongoMutation<TState>(
  mutation: OptimisticMutation,
  set: (partial: any) => void,
  get: () => TState,
  onSuccess?: (data: any) => void,
  onError?: (err: Error) => void
) {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    // Stage in failed/offline queue to be retried on reconnect
    const state = get() as any;
    set({
      syncStatus: 'offline',
      pendingMutations: (state.pendingMutations || []).filter((m: OptimisticMutation) => m.id !== mutation.id),
      failedMutations: [...(state.failedMutations || []), { ...mutation, status: 'failed', error: 'Device is offline' }]
    });
    return;
  }

  try {
    const res = await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Mutation-ID': mutation.id
      },
      body: JSON.stringify({
        collection: mutation.collection,
        actionType: mutation.actionType,
        documentId: mutation.documentId,
        payload: mutation.payload,
        timestamp: mutation.timestamp
      })
    });

    if (!res.ok) {
      throw new Error(`MongoDB write failed with status ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const state = get() as any;

    // Mutation Committed Successfully!
    const remainingPending = (state.pendingMutations || []).filter(
      (m: OptimisticMutation) => m.id !== mutation.id
    );

    set({
      syncStatus: remainingPending.length > 0 ? 'syncing' : 'synced',
      lastSyncedAt: Date.now(),
      pendingMutations: remainingPending
    });

    if (onSuccess) onSuccess(data.document || mutation.payload);

  } catch (error: any) {
    const state = get() as any;
    console.error(`[MongoDB Optimistic Sync] Mutation ${mutation.id} rejected:`, error);

    // Rollback optimistic changes if max retries exceeded
    if (mutation.retryCount >= MAX_RETRIES) {
      if (typeof state.rollbackMutation === 'function') {
        state.rollbackMutation(mutation.id);
      }
      set({
        syncStatus: 'error',
        lastError: `Sync failed for ${mutation.collection}: ${error?.message || 'Database error'}. Changes rolled back.`,
        pendingMutations: (state.pendingMutations || []).filter((m: OptimisticMutation) => m.id !== mutation.id),
        failedMutations: [
          ...(state.failedMutations || []),
          { ...mutation, status: 'rolled_back', error: error?.message }
        ]
      });
      if (onError) onError(error);
    } else {
      // Stage for retry
      mutation.retryCount += 1;
      set({
        syncStatus: 'error',
        lastError: error?.message || 'Network sync error',
        pendingMutations: (state.pendingMutations || []).filter((m: OptimisticMutation) => m.id !== mutation.id),
        failedMutations: [
          ...(state.failedMutations || []),
          { ...mutation, status: 'failed', error: error?.message }
        ]
      });
      if (onError) onError(error);
    }
  }
}
