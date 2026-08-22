import { StateCreator } from 'zustand';
import { AnalyticsSummaryResult } from '../../lib/analyticsEngine';
import { AppState } from '../useAppStore';

export interface AnalyticsSlice {
  timeframe: '24h' | '7d' | '30d' | 'all';
  stats: AnalyticsSummaryResult | null;
  activeVisitorsNow: number;
  analyticsLoading: boolean;
  realtimePulseLoading: boolean;
  lastFetchedAt: number | null;
  analyticsCache: Record<string, { data: AnalyticsSummaryResult; timestamp: number }>;

  // Actions
  setTimeframe: (timeframe: '24h' | '7d' | '30d' | 'all') => void;
  fetchAnalyticsStats: (forceRefresh?: boolean) => Promise<void>;
  fetchRealtimePulse: () => Promise<void>;
  invalidateAnalyticsCache: (domain?: string) => void;
}

const CACHE_TTL_MS = 60000; // 1 minute local cache

export const createAnalyticsSlice: StateCreator<
  AppState,
  [],
  [],
  AnalyticsSlice
> = (set, get) => ({
  timeframe: '7d',
  stats: null,
  activeVisitorsNow: 12,
  analyticsLoading: false,
  realtimePulseLoading: false,
  lastFetchedAt: null,
  analyticsCache: {},

  setTimeframe: (timeframe) => {
    set({ timeframe });
    get().fetchAnalyticsStats();
  },

  fetchAnalyticsStats: async (forceRefresh = false) => {
    const { activeDomain, timeframe, analyticsCache } = get();
    const cacheKey = `${activeDomain || 'all'}_${timeframe}`;
    const now = Date.now();

    // Check cache unless force refresh
    if (!forceRefresh && analyticsCache[cacheKey]) {
      const cached = analyticsCache[cacheKey];
      if (now - cached.timestamp < CACHE_TTL_MS) {
        set({ stats: cached.data, lastFetchedAt: cached.timestamp });
        return;
      }
    }

    set({ analyticsLoading: true });
    try {
      const res = await fetch(`/api/analytics/stats?domain=${encodeURIComponent(activeDomain || 'all')}&timeframe=${timeframe}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Expected JSON but received ${contentType}`);
      }
      const data = await res.json();

      if (data.success && data.stats) {
        set((state) => ({
          stats: data.stats,
          activeVisitorsNow: data.stats.activeVisitorsNow || state.activeVisitorsNow,
          analyticsLoading: false,
          lastFetchedAt: now,
          analyticsCache: {
            ...state.analyticsCache,
            [cacheKey]: { data: data.stats, timestamp: now }
          }
        }));
      } else {
        set({ analyticsLoading: false });
      }
    } catch (err) {
      console.warn('[Zustand AnalyticsSlice] Telemetry stats fallback notice:', err);
      set({ analyticsLoading: false });
    }
  },

  fetchRealtimePulse: async () => {
    const { activeDomain } = get();
    set({ realtimePulseLoading: true });
    try {
      const res = await fetch(`/api/analytics/realtime?domain=${encodeURIComponent(activeDomain || 'all')}`);
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        if (data.success && typeof data.activeVisitorsNow === 'number') {
          set({
            activeVisitorsNow: data.activeVisitorsNow,
            realtimePulseLoading: false
          });
          return;
        }
      }
      set({ realtimePulseLoading: false });
    } catch (err) {
      set({ realtimePulseLoading: false });
    }
  },

  invalidateAnalyticsCache: (domain?: string) => {
    if (!domain) {
      set({ analyticsCache: {} });
    } else {
      set((state) => {
        const newCache = { ...state.analyticsCache };
        Object.keys(newCache).forEach((key) => {
          if (key.startsWith(domain)) delete newCache[key];
        });
        return { analyticsCache: newCache };
      });
    }
  }
});
