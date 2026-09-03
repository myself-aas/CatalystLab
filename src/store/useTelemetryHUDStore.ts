import { create } from 'zustand';
import { EngineType } from '../types';
import { EdgePoP, EDGE_POPS, findPoPById } from '../lib/edge/pops';

export type GlobeScanState = 'idle' | 'running' | 'done';
export type PlanTier = 'free' | 'pro' | 'team' | 'enterprise';

export interface CronLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRON' | 'BENCHMARK';
  engine: EngineType | 'ORCHESTRATOR' | 'EDGE_POP';
  popRegion: string;
  message: string;
  statusCode?: number;
  durationMs?: number;
  data?: Record<string, any>;
}

export interface TelemetryHUDState {
  focusEngine: EngineType | null;
  activeDomain: string;
  autoStreamActive: boolean;
  systemLoad: number; // 0 - 100%
  edgePopCount: number;
  averageLatencyMs: number;
  activeProbesCount: number;
  scrollDepthPercentage: number; // 0 - 100%
  isScanning: boolean;
  scanProgress: number; // 0 - 100%
  currentScanningEngine: EngineType | null;
  hudExpanded: boolean;
  isMinimized: boolean;
  cronLogs: CronLogEntry[];
  
  // Edge Mesh Globe States
  focusedPoP: EdgePoP | null;
  scanState: GlobeScanState;
  targetLocation: [number, number]; // [lat, lon]
  planTier: PlanTier;
  
  // Actions
  setFocusEngine: (engine: EngineType | null) => void;
  toggleFocusEngine: (engine: EngineType) => void;
  setActiveDomain: (domain: string) => void;
  setAutoStreamActive: (active: boolean) => void;
  toggleAutoStream: () => void;
  setScrollDepthPercentage: (depth: number) => void;
  setHudExpanded: (expanded: boolean) => void;
  toggleHudExpanded: () => void;
  addCronLog: (entry: Omit<CronLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  triggerSyntheticProbe: (engine?: EngineType) => void;
  startMockScan: (domain?: string) => Promise<void>;
  cancelScan: () => void;
  
  // Edge Mesh Actions
  setFocusedPoP: (pop: EdgePoP | null | string) => void;
  setScanState: (state: GlobeScanState) => void;
  setTargetLocation: (coords: [number, number]) => void;
  setPlanTier: (tier: PlanTier) => void;
}

const INITIAL_LOGS: CronLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '09:14:02.120',
    level: 'CRON',
    engine: 'ORCHESTRATOR',
    popRegion: 'IAD (US-East)',
    message: 'Synthetic cron probe initialized across 42 distributed edge points of presence',
    statusCode: 200,
    durationMs: 14,
  },
  {
    id: 'log-002',
    timestamp: '09:14:02.340',
    level: 'INFO',
    engine: 'health',
    popRegion: 'FRA (EU-Central)',
    message: '[VitalZyme] LCP measured at 840ms, CLS 0.012 (Passes Core Web Vitals threshold)',
    statusCode: 200,
    durationMs: 84,
  },
  {
    id: 'log-003',
    timestamp: '09:14:03.010',
    level: 'BENCHMARK',
    engine: 'latency',
    popRegion: 'NRT (AP-Northeast)',
    message: '[EdgeVmax] TLS 1.3 0-RTT Handshake verified: 18.2ms edge propagation time',
    statusCode: 200,
    durationMs: 18,
  },
  {
    id: 'log-004',
    timestamp: '09:14:03.580',
    level: 'WARN',
    engine: 'compliance',
    popRegion: 'LHR (UK-London)',
    message: '[RiskProtease] Content-Security-Policy missing script-src-elem nonces in staging headers',
    statusCode: 206,
    durationMs: 32,
  },
  {
    id: 'log-005',
    timestamp: '09:14:04.120',
    level: 'INFO',
    engine: 'ai_ready',
    popRegion: 'SJC (US-West)',
    message: '[LLM-Kinase] Clean markdown serialization generated for /llms.txt and /llms-full.txt',
    statusCode: 200,
    durationMs: 45,
  },
  {
    id: 'log-006',
    timestamp: '09:14:04.890',
    level: 'CRON',
    engine: 'eco',
    popRegion: 'ARN (EU-North)',
    message: '[EcoHolo] Carbon intensity rating: 0.12g CO2/pageview (Hydroelectric Edge Tier 1)',
    statusCode: 200,
    durationMs: 22,
  },
];

const POP_REGIONS = [
  'IAD (US-East)',
  'FRA (EU-Central)',
  'NRT (AP-Northeast)',
  'LHR (UK-London)',
  'SJC (US-West)',
  'SIN (AP-Southeast)',
  'SYD (AU-East)',
  'GRU (SA-East)',
];

const ENGINES_ORDER: EngineType[] = [
  'health',       // VitalZyme
  'latency',      // EdgeVmax
  'compliance',   // RiskProtease
  'ai_ready',     // LLM-Kinase
  'eco',          // EcoHolo
  'repo',         // GitLygase
  'migration',    // SynthShift
  'llmo',         // AllosterSearch
];

let scanInterval: NodeJS.Timeout | null = null;

export const useTelemetryHUDStore = create<TelemetryHUDState>((set, get) => ({
  focusEngine: null,
  activeDomain: 'catalystlab.tech',
  autoStreamActive: true,
  systemLoad: 24.8,
  edgePopCount: 42,
  averageLatencyMs: 18.4,
  activeProbesCount: 128,
  scrollDepthPercentage: 0,
  isScanning: false,
  scanProgress: 0,
  currentScanningEngine: null,
  hudExpanded: false,
  isMinimized: typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  cronLogs: INITIAL_LOGS,

  // Edge Mesh Globe initial state
  focusedPoP: EDGE_POPS[0], // default to IAD (Ashburn / DC)
  scanState: 'idle',
  targetLocation: [39.0438, -77.4874], // Default to IAD / Washington DC
  planTier: 'enterprise',

  setFocusEngine: (engine) => set({ focusEngine: engine }),

  toggleFocusEngine: (engine) => set((state) => ({
    focusEngine: state.focusEngine === engine ? null : engine
  })),

  setActiveDomain: (domain) => set({ activeDomain: domain }),

  setAutoStreamActive: (active) => set({ autoStreamActive: active }),

  toggleAutoStream: () => set((state) => ({ autoStreamActive: !state.autoStreamActive })),

  setFocusedPoP: (pop) => {
    if (!pop) {
      set({ focusedPoP: null });
      return;
    }
    if (typeof pop === 'string') {
      const found = findPoPById(pop);
      if (found) {
        set({ focusedPoP: found, targetLocation: found.coordinates });
      }
    } else {
      set({ focusedPoP: pop, targetLocation: pop.coordinates });
    }
  },

  setScanState: (state) => set({ scanState: state, isScanning: state === 'running' }),

  setTargetLocation: (coords) => set({ targetLocation: coords }),

  setPlanTier: (tier) => set({ planTier: tier }),

  setScrollDepthPercentage: (depth) => {
    const clamped = Math.max(0, Math.min(100, depth));
    // Dynamically modulate system load slightly with scroll interaction (representing live telemetry telemetry ingestion)
    set((state) => ({
      scrollDepthPercentage: clamped,
      systemLoad: Math.min(92, Math.max(16, +(20 + (clamped * 0.15) + (Math.sin(clamped / 10) * 4)).toFixed(1))),
    }));
  },

  setHudExpanded: (expanded) => set({ hudExpanded: expanded, isMinimized: !expanded }),

  toggleHudExpanded: () => set((state) => ({
    hudExpanded: !state.hudExpanded,
    isMinimized: state.hudExpanded,
  })),

  addCronLog: (entry) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const newEntry: CronLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
    };

    set((state) => ({
      cronLogs: [newEntry, ...state.cronLogs].slice(0, 120),
      systemLoad: Math.min(95, Math.max(12, +(state.systemLoad + (Math.random() * 3 - 1.5)).toFixed(1))),
      averageLatencyMs: Math.max(12, +(state.averageLatencyMs + (Math.random() * 1.5 - 0.75)).toFixed(1)),
    }));
  },

  clearLogs: () => set({ cronLogs: [] }),

  triggerSyntheticProbe: (engine) => {
    const targetEngine = engine || ENGINES_ORDER[Math.floor(Math.random() * ENGINES_ORDER.length)];
    const region = POP_REGIONS[Math.floor(Math.random() * POP_REGIONS.length)];
    const duration = Math.floor(Math.random() * 60) + 12;
    
    get().addCronLog({
      level: Math.random() > 0.85 ? 'WARN' : 'INFO',
      engine: targetEngine,
      popRegion: region,
      message: `[${targetEngine.toUpperCase()}] Real-time probe completed on ${get().activeDomain} via Anycast POP: ${region} (${duration}ms)`,
      statusCode: 200,
      durationMs: duration,
    });
  },

  startMockScan: async (domain) => {
    if (get().isScanning) return;
    const targetDomain = domain || get().activeDomain;
    
    if (scanInterval) clearInterval(scanInterval);

    set({
      isScanning: true,
      scanState: 'running',
      scanProgress: 5,
      activeDomain: targetDomain,
      currentScanningEngine: ENGINES_ORDER[0],
      systemLoad: 68.4,
    });

    get().addCronLog({
      level: 'BENCHMARK',
      engine: 'ORCHESTRATOR',
      popRegion: 'IAD (US-East)',
      message: `Initiating 8-Vector Master Suite Telemetry Audit on https://${targetDomain}...`,
      statusCode: 102,
    });

    let currentStep = 0;
    const totalSteps = ENGINES_ORDER.length;

    return new Promise<void>((resolve) => {
      scanInterval = setInterval(() => {
        currentStep++;
        const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
        const engine = ENGINES_ORDER[Math.min(currentStep - 1, totalSteps - 1)];

        if (currentStep <= totalSteps) {
          const region = POP_REGIONS[currentStep % POP_REGIONS.length];
          get().addCronLog({
            level: 'INFO',
            engine,
            popRegion: region,
            message: `[${engine.toUpperCase()}] Synthesis pass ${currentStep}/${totalSteps} complete. Vector score optimal.`,
            statusCode: 200,
            durationMs: Math.floor(Math.random() * 40) + 15,
          });

          set({
            scanProgress: progress,
            currentScanningEngine: engine,
            systemLoad: Math.min(94, +(50 + Math.random() * 35).toFixed(1)),
          });
        } else {
          if (scanInterval) clearInterval(scanInterval);
          get().addCronLog({
            level: 'CRON',
            engine: 'ORCHESTRATOR',
            popRegion: 'GLOBAL_ANYCAST',
            message: `Master Audit Complete for https://${targetDomain}. Score: 98.4/100 (Zero regressions).`,
            statusCode: 200,
          });

          set({
            isScanning: false,
            scanState: 'done',
            scanProgress: 100,
            currentScanningEngine: null,
            systemLoad: 24.2,
          });

          // Reset scanState to idle after brief celebration
          setTimeout(() => {
            if (get().scanState === 'done') {
              set({ scanState: 'idle' });
            }
          }, 3500);

          resolve();
        }
      }, 450);
    });
  },

  cancelScan: () => {
    if (scanInterval) clearInterval(scanInterval);
    set({
      isScanning: false,
      scanState: 'idle',
      scanProgress: 0,
      currentScanningEngine: null,
      systemLoad: 22.0,
    });
    get().addCronLog({
      level: 'WARN',
      engine: 'ORCHESTRATOR',
      popRegion: 'IAD (US-East)',
      message: 'Active scanning sequence cancelled by operator.',
    });
  },
}));

export default useTelemetryHUDStore;
