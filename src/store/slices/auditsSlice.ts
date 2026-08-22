import { StateCreator } from 'zustand';
import { AuditRecordDocument } from '../types';
import { EngineType } from '../../types';
import { dispatchOptimisticMutation } from '../middleware/mongoSyncMiddleware';
import { AppState } from '../useAppStore';

export interface AuditsSlice {
  auditRecords: AuditRecordDocument[];
  activeRunningEngine: EngineType | null;
  compositeScore: number | null;
  auditsLoading: boolean;

  // Actions
  setAuditRecords: (records: AuditRecordDocument[]) => void;
  saveAuditRecordOptimistic: (recordData: Omit<AuditRecordDocument, 'id' | 'createdAt'>) => Promise<void>;
  deleteAuditRecordOptimistic: (id: string) => Promise<void>;
  executeAuditEngine: (url: string, engine: EngineType) => Promise<string | null>;
}

export const createAuditsSlice: StateCreator<
  AppState,
  [],
  [],
  AuditsSlice
> = (set, get) => ({
  auditRecords: [],
  activeRunningEngine: null,
  compositeScore: 92,
  auditsLoading: false,

  setAuditRecords: (records: AuditRecordDocument[]) => {
    set({ auditRecords: records });
  },

  saveAuditRecordOptimistic: async (recordData) => {
    const tempId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: AuditRecordDocument = {
      ...recordData,
      id: tempId,
      createdAt: Date.now()
    };

    await dispatchOptimisticMutation(set, get, {
      collection: 'audit_results',
      actionType: 'insert',
      documentId: tempId,
      payload: newRecord,
      previousState: null,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          auditRecords: [newRecord, ...state.auditRecords]
        }));
      }
    });
  },

  deleteAuditRecordOptimistic: async (id: string) => {
    const previous = get().auditRecords.find(a => a.id === id);
    if (!previous) return;

    await dispatchOptimisticMutation(set, get, {
      collection: 'audit_results',
      actionType: 'delete',
      documentId: id,
      payload: previous,
      previousState: previous,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          auditRecords: state.auditRecords.filter(a => a.id !== id)
        }));
      }
    });
  },

  executeAuditEngine: async (url: string, engine: EngineType) => {
    set({ activeRunningEngine: engine, auditsLoading: true });
    try {
      const res = await fetch('/api/run-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, engine })
      });
      const data = await res.json();
      set({ activeRunningEngine: null, auditsLoading: false });

      if (data.success && data.output) {
        return data.output;
      }
      return null;
    } catch (err) {
      set({ activeRunningEngine: null, auditsLoading: false });
      return null;
    }
  }
});
