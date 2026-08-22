import { create } from 'zustand';
import {
  createMongoSyncMiddleware,
  MongoSyncState
} from './middleware/mongoSyncMiddleware';
import { DomainsSlice, createDomainsSlice } from './slices/domainsSlice';
import { AnalyticsSlice, createAnalyticsSlice } from './slices/analyticsSlice';
import { GoalsSlice, createGoalsSlice } from './slices/goalsSlice';
import { AlertsSlice, createAlertsSlice } from './slices/alertsSlice';
import { AuditsSlice, createAuditsSlice } from './slices/auditsSlice';
import { PreferencesSlice, createPreferencesSlice } from './slices/preferencesSlice';

export type AppState = MongoSyncState &
  DomainsSlice &
  AnalyticsSlice &
  GoalsSlice &
  AlertsSlice &
  AuditsSlice &
  PreferencesSlice;

export const useAppStore = create<AppState>()(
  createMongoSyncMiddleware((set, get, api) => ({
    // MongoDB Synchronization Middleware Slice
    syncStatus: 'idle',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncedAt: null,
    pendingMutations: [],
    failedMutations: [],
    lastError: null,

    setSyncStatus: (status) => set({ syncStatus: status }),
    setIsOnline: (online) => set({ isOnline: online }),
    clearLastError: () => set({ lastError: null }),

    rollbackMutation: (mutationId: string) => {
      const state = get();
      const mutation = [...state.pendingMutations, ...state.failedMutations].find(
        (m) => m.id === mutationId
      );

      if (!mutation || !mutation.previousState) return;

      const collectionKey = mutation.collection;
      if (Array.isArray((state as any)[collectionKey])) {
        if (mutation.actionType === 'insert') {
          set({
            [collectionKey]: (state as any)[collectionKey].filter(
              (item: any) => item.id !== mutation.documentId
            ),
            pendingMutations: state.pendingMutations.filter((m) => m.id !== mutationId),
            failedMutations: state.failedMutations.filter((m) => m.id !== mutationId)
          } as any);
        } else if (mutation.actionType === 'update' || mutation.actionType === 'upsert') {
          set({
            [collectionKey]: (state as any)[collectionKey].map((item: any) =>
              item.id === mutation.documentId ? mutation.previousState : item
            ),
            pendingMutations: state.pendingMutations.filter((m) => m.id !== mutationId),
            failedMutations: state.failedMutations.filter((m) => m.id !== mutationId)
          } as any);
        } else if (mutation.actionType === 'delete') {
          set({
            [collectionKey]: [...(state as any)[collectionKey], mutation.previousState],
            pendingMutations: state.pendingMutations.filter((m) => m.id !== mutationId),
            failedMutations: state.failedMutations.filter((m) => m.id !== mutationId)
          } as any);
        }
      } else if ((state as any)[collectionKey] && typeof (state as any)[collectionKey] === 'object') {
        set({
          [collectionKey]: mutation.previousState,
          pendingMutations: state.pendingMutations.filter((m) => m.id !== mutationId),
          failedMutations: state.failedMutations.filter((m) => m.id !== mutationId)
        } as any);
      }
    },

    retryFailedMutations: async () => {
      const state = get();
      const failed = [...state.failedMutations];
      if (failed.length === 0) return;

      set({ syncStatus: 'syncing', failedMutations: [] });

      for (const mutation of failed) {
        try {
          const res = await fetch('/api/state/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collection: mutation.collection,
              actionType: mutation.actionType,
              documentId: mutation.documentId,
              payload: mutation.payload,
              timestamp: mutation.timestamp
            })
          });
          if (!res.ok) throw new Error(`Retry failed: ${res.statusText}`);
          set({ syncStatus: 'synced', lastSyncedAt: Date.now() });
        } catch (err: unknown) {
          set((s) => ({
            syncStatus: 'error',
            lastError: err?.message,
            failedMutations: [...s.failedMutations, mutation]
          }));
        }
      }
    },

    fetchFullSyncFromMongo: async (ownerId: string = 'usr_default') => {
      set({ syncStatus: 'syncing' });
      try {
        const res = await fetch(`/api/state/sync?ownerId=${encodeURIComponent(ownerId)}`);
        if (!res.ok) throw new Error(`Sync fetch failed: ${res.statusText}`);
        const data = await res.json();
        
        if (data.success && data.state) {
          const updates: Record<string, any> = {
            syncStatus: 'synced',
            lastSyncedAt: Date.now(),
            lastError: null
          };

          if (data.state.domains && data.state.domains.length > 0) updates.domains = data.state.domains;
          if (data.state.goals && data.state.goals.length > 0) updates.goals = data.state.goals;
          if (data.state.alerts && data.state.alerts.length > 0) updates.alerts = data.state.alerts;
          if (data.state.userPreferences) updates.preferences = data.state.userPreferences;
          if (data.state.auditRecords && data.state.auditRecords.length > 0) updates.auditRecords = data.state.auditRecords;

          set(updates as any);
        } else {
          set({ syncStatus: 'idle' });
        }
      } catch (err: unknown) {
        set({
          syncStatus: 'error',
          lastError: err?.message || 'Failed to sync with MongoDB'
        });
      }
    },

    // Individual State Slices
    ...createDomainsSlice(set, get, api),
    ...createAnalyticsSlice(set, get, api),
    ...createGoalsSlice(set, get, api),
    ...createAlertsSlice(set, get, api),
    ...createAuditsSlice(set, get, api),
    ...createPreferencesSlice(set, get, api)
  }))
);

export default useAppStore;
