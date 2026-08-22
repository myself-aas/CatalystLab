import { StateCreator } from 'zustand';
import { UserPreferencesDocument } from '../types';
import { dispatchOptimisticMutation } from '../middleware/mongoSyncMiddleware';
import { AppState } from '../useAppStore';

export interface PreferencesSlice {
  preferences: UserPreferencesDocument;

  // Actions
  updatePreferencesOptimistic: (updates: Partial<UserPreferencesDocument>) => Promise<void>;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setAutoRefreshInterval: (seconds: number) => void;
  setCompactMode: (compact: boolean) => void;
  setChartType: (chartType: 'area' | 'bar' | 'line') => void;
}

export const createPreferencesSlice: StateCreator<
  AppState,
  [],
  [],
  PreferencesSlice
> = (set, get) => ({
  preferences: {
    id: 'pref_default',
    ownerId: 'usr_default',
    theme: 'dark',
    defaultTimeframe: '7d',
    autoRefreshIntervalSeconds: 10,
    compactMode: false,
    activeDomain: 'catalystlab.tech',
    notificationsEnabled: true,
    chartType: 'area',
    whiteLabel: {
      enabled: false,
      brandName: 'Catalyst Enterprise',
      primaryColor: '#0b192c'
    },
    updatedAt: Date.now()
  },

  updatePreferencesOptimistic: async (updates: Partial<UserPreferencesDocument>) => {
    const previous = get().preferences;
    const updated: UserPreferencesDocument = {
      ...previous,
      ...updates,
      updatedAt: Date.now()
    };

    await dispatchOptimisticMutation(set, get, {
      collection: 'user_preferences',
      actionType: 'upsert',
      documentId: updated.id,
      payload: updated,
      previousState: previous,
      applyLocalOptimisticUpdate: () => {
        set({ preferences: updated });
      }
    });
  },

  setTheme: (theme) => {
    get().updatePreferencesOptimistic({ theme });
  },

  setAutoRefreshInterval: (seconds) => {
    get().updatePreferencesOptimistic({ autoRefreshIntervalSeconds: seconds });
  },

  setCompactMode: (compact) => {
    get().updatePreferencesOptimistic({ compactMode: compact });
  },

  setChartType: (chartType) => {
    get().updatePreferencesOptimistic({ chartType });
  }
});
