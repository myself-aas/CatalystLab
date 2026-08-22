import { StateCreator } from 'zustand';
import { GoalDocument } from '../types';
import { dispatchOptimisticMutation } from '../middleware/mongoSyncMiddleware';
import { AppState } from '../useAppStore';

export interface GoalsSlice {
  goals: GoalDocument[];
  goalsLoading: boolean;

  // Actions
  setGoals: (goals: GoalDocument[]) => void;
  addGoalOptimistic: (goalData: Omit<GoalDocument, 'id' | 'createdAt' | 'convertedCount'>) => Promise<void>;
  updateGoalOptimistic: (id: string, updates: Partial<GoalDocument>) => Promise<void>;
  deleteGoalOptimistic: (id: string) => Promise<void>;
  recordGoalConversion: (id: string) => Promise<void>;
}

export const createGoalsSlice: StateCreator<
  AppState,
  [],
  [],
  GoalsSlice
> = (set, get) => ({
  goals: [
    {
      id: 'goal_signup_01',
      domain: 'catalystlab.tech',
      name: 'GitHub OAuth Sign-Up Conversion',
      type: 'custom_event',
      targetValue: 'signup_completed',
      convertedCount: 148,
      conversionRate: 14.2,
      active: true,
      createdAt: Date.now() - 20 * 86400000,
      ownerId: 'usr_default'
    },
    {
      id: 'goal_docs_02',
      domain: 'catalystlab.tech',
      name: 'API Docs Depth Exploration',
      type: 'pageview',
      targetValue: '/docs',
      convertedCount: 412,
      conversionRate: 38.5,
      active: true,
      createdAt: Date.now() - 15 * 86400000,
      ownerId: 'usr_default'
    },
    {
      id: 'goal_vitals_03',
      domain: 'catalystlab.tech',
      name: 'Fast LCP Milestone (<1.2s)',
      type: 'vitals_lcp',
      targetValue: 1200,
      convertedCount: 890,
      conversionRate: 85.0,
      active: true,
      createdAt: Date.now() - 10 * 86400000,
      ownerId: 'usr_default'
    }
  ],
  goalsLoading: false,

  setGoals: (goals: GoalDocument[]) => {
    set({ goals });
  },

  addGoalOptimistic: async (goalData) => {
    const tempId = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newGoal: GoalDocument = {
      ...goalData,
      id: tempId,
      convertedCount: 0,
      conversionRate: 0,
      active: true,
      createdAt: Date.now()
    };

    await dispatchOptimisticMutation(set, get, {
      collection: 'goals',
      actionType: 'insert',
      documentId: tempId,
      payload: newGoal,
      previousState: null,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          goals: [newGoal, ...state.goals]
        }));
      }
    });
  },

  updateGoalOptimistic: async (id: string, updates: Partial<GoalDocument>) => {
    const previous = get().goals.find(g => g.id === id);
    if (!previous) return;

    const updated = { ...previous, ...updates, updatedAt: Date.now() };

    await dispatchOptimisticMutation(set, get, {
      collection: 'goals',
      actionType: 'update',
      documentId: id,
      payload: updated,
      previousState: previous,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          goals: state.goals.map(g => g.id === id ? updated : g)
        }));
      }
    });
  },

  deleteGoalOptimistic: async (id: string) => {
    const previous = get().goals.find(g => g.id === id);
    if (!previous) return;

    await dispatchOptimisticMutation(set, get, {
      collection: 'goals',
      actionType: 'delete',
      documentId: id,
      payload: previous,
      previousState: previous,
      applyLocalOptimisticUpdate: () => {
        set((state) => ({
          goals: state.goals.filter(g => g.id !== id)
        }));
      }
    });
  },

  recordGoalConversion: async (id: string) => {
    const goal = get().goals.find(g => g.id === id);
    if (!goal) return;

    const updatedCount = goal.convertedCount + 1;
    await get().updateGoalOptimistic(id, { convertedCount: updatedCount });
  }
});
