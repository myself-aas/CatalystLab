import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Globe, 
  Zap, 
  Terminal as TerminalIcon, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Square, 
  Layers, 
  Sparkles, 
  Cpu, 
  Radio,
  Sliders,
  X,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useTelemetryHUDStore } from '../../store/useTelemetryHUDStore';
import { EngineType } from '../../types';

const ENZYME_LIST: { id: EngineType; label: string; name: string; color: string }[] = [
  { id: 'health', label: '[VitalZyme]', name: 'Core Web Vitals', color: '#00F0FF' },
  { id: 'latency', label: '[EdgeVmax]', name: 'Edge Latency', color: '#06B6D4' },
  { id: 'compliance', label: '[RiskProtease]', name: 'SecOps & CSP', color: '#EF4444' },
  { id: 'ai_ready', label: '[LLM-Kinase]', name: 'AI Crawler Readiness', color: '#A855F7' },
  { id: 'eco', label: '[EcoHolo]', name: 'Digital Carbon', color: '#00FF66' },
  { id: 'repo', label: '[GitLygase]', name: 'AST Hygiene', color: '#10B981' },
  { id: 'migration', label: '[SynthShift]', name: 'Headless Chrome', color: '#F59E0B' },
  { id: 'llmo', label: '[AllosterSearch]', name: 'Entity Graph', color: '#38BDF8' },
];

export const StickyHUD: React.FC = () => {
  const {
    systemLoad,
    edgePopCount,
    averageLatencyMs,
    scrollDepthPercentage,
    setScrollDepthPercentage,
    focusEngine,
    toggleFocusEngine,
    isScanning,
    scanProgress,
    currentScanningEngine,
    startMockScan,
    cancelScan,
    cronLogs,
    autoStreamActive,
    toggleAutoStream,
    triggerSyntheticProbe,
    activeDomain,
  } = useTelemetryHUDStore();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showLogDrawer, setShowLogDrawer] = useState(false);
  const [showEngineSelector, setShowEngineSelector] = useState(false);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // Track window scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollDepthPercentage(0);
        return;
      }
      const percentage = Math.min(100, Math.max(0, Math.round((scrollY / docHeight) * 100)));
      setScrollDepthPercentage(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollDepthPercentage]);

  // Auto-scroll logs drawer to bottom when new logs arrive
  useEffect(() => {
    if (showLogDrawer && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0; // newest first
    }
  }, [cronLogs, showLogDrawer]);

  // Periodic synthetic background heartbeats
  useEffect(() => {
    if (!autoStreamActive) return;
    const interval = setInterval(() => {
      if (!isScanning && Math.random() > 0.4) {
        triggerSyntheticProbe();
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [autoStreamActive, isScanning, triggerSyntheticProbe]);

  // System load color styling
  const getLoadColor = (load: number) => {
    if (load > 75) return 'text-rose-400 bg-rose-500';
    if (load > 45) return 'text-amber-400 bg-amber-500';
    return 'text-[#00FF66] bg-[#00FF66]';
  };

  const activeEnzymeObj = ENZYME_LIST.find((e) => e.id === focusEngine);

  return (
    <aside
      id="telemetry-sticky-hud"
      aria-label="Real-time Telemetry Sticky HUD"
      className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 pointer-events-none flex flex-col items-center justify-end px-3 sm:px-6"
    >
      <div className="w-full max-w-5xl pointer-events-auto transition-all duration-300">
        
        {/* Expandable Live Terminal Log Drawer */}
        <AnimatePresence>
          {showLogDrawer && !isMinimized && (
            <motion.div
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 16, height: 0 }}
              className="mb-2 rounded-2xl border border-border bg-[#060914]/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.9)] overflow-hidden font-mono text-xs"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0F20] border-b border-border">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="h-3.5 w-3.5 text-[#00F0FF]" />
                  <span className="font-bold text-primary-foreground uppercase tracking-wider text-[11px]">
                    Autonomous Telemetry Cron Stream
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                    <span>{cronLogs.length} live events</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleAutoStream}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      autoStreamActive
                        ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {autoStreamActive ? 'STREAM ACTIVE' : 'STREAM PAUSED'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLogDrawer(false)}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-primary-foreground hover:bg-primary-hover transition-colors"
                    aria-label="Close telemetry log"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Log Items Stream */}
              <div 
                ref={logContainerRef}
                className="p-3 max-h-48 overflow-y-auto space-y-1.5 text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-700"
              >
                {cronLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-2 text-muted-foreground font-mono hover:bg-primary-hover/30 p-1 rounded transition-colors"
                  >
                    <span className="text-muted-foreground shrink-0 text-[10px]">{log.timestamp}</span>
                    <span className={`px-1 rounded text-[10px] font-bold shrink-0 ${
                      log.level === 'CRON' ? 'bg-[#06B6D4]/20 text-[#00F0FF]' :
                      log.level === 'WARN' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30' :
                      log.level === 'BENCHMARK' ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-muted-foreground text-[10px] shrink-0">[{log.popRegion}]</span>
                    <span className="text-muted-foreground flex-1 break-all">{log.message}</span>
                    {log.durationMs && (
                      <span className="text-[10px] text-emerald-400 shrink-0">{log.durationMs}ms</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Engine Focus Selector Popover */}
        <AnimatePresence>
          {showEngineSelector && !isMinimized && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              id="telemetry-engine-selector"
              role="region"
              aria-label="Telemetry engine focus selector"
              className="mb-2 p-3 rounded-2xl border border-border bg-[#060914]/95 backdrop-blur-xl shadow-2xl font-mono text-xs"
            >
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border text-muted-foreground text-[11px]">
                <span className="font-bold text-primary-foreground flex items-center gap-1.5">
                  <Sliders className="h-3 w-3 text-[#00F0FF]" />
                  <span>Select Catalyst Focus Mode (HUD Isolation)</span>
                </span>
                {focusEngine && (
                  <button
                    type="button"
                    onClick={() => {
                      toggleFocusEngine(focusEngine);
                      setShowEngineSelector(false);
                    }}
                    className="text-[#00F0FF] hover:underline text-[10px]"
                  >
                    Clear Focus (Show All)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {ENZYME_LIST.map((enzyme) => {
                  const isSelected = focusEngine === enzyme.id;
                  return (
                    <button
                      key={enzyme.id}
                      type="button"
                      onClick={() => {
                        toggleFocusEngine(enzyme.id);
                        setShowEngineSelector(false);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#06B6D4]/20 border-[#00F0FF] text-primary-foreground shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                          : 'bg-[#090E1E] border-border text-muted-foreground hover:text-primary-foreground hover:border-border'
                      }`}
                    >
                      <div className="font-bold text-[11px]" style={{ color: isSelected ? '#00F0FF' : enzyme.color }}>
                        {enzyme.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate mt-0.5 font-sans">
                        {enzyme.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Sticky HUD Ribbon */}
        <div className="relative max-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-border bg-[#060914]/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.8)] font-mono text-xs transition-all duration-300">
          
          {/* Top Scanline / Scanning Progress Bar */}
          {isScanning ? (
            <div className="h-1 bg-primary overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-[#06B6D4] via-[#00F0FF] to-[#00FF66]"
                style={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          ) : (
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#06B6D4]/40 to-transparent" />
          )}

          <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
            
            {/* Left Cluster: System Load + Telemetry PoPs */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* System Load Meter */}
              <div 
                title="Aggregate Real-Time Edge Processing & Memory Load"
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#090E1E] border border-border"
              >
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[#00F0FF]" />
                  <span className="text-[10px] text-muted-foreground font-bold uppercase hidden md:inline">
                    SYS LOAD:
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${getLoadColor(systemLoad).split(' ')[0]}`}>
                    {systemLoad.toFixed(1)}%
                  </span>
                  <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                    <div 
                      className={`h-full transition-all duration-500 ${getLoadColor(systemLoad).split(' ')[1]}`}
                      style={{ width: `${Math.min(100, systemLoad)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Edge Anycast PoPs Status */}
              <div 
                title="Global Distributed Anycast Points of Presence"
                className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#090E1E] border border-border text-[11px] text-muted-foreground"
              >
                <Globe className="h-3.5 w-3.5 text-[#00FF66]" />
                <span>
                  <strong className="text-primary-foreground">{edgePopCount}</strong> PoPs
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-[#00F0FF] font-bold">{averageLatencyMs}ms</span>
              </div>

              {/* Scroll Depth Telemetry */}
              <div 
                title="Page Telemetry Scroll Traversal"
                className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#090E1E] border border-border text-[10px] text-muted-foreground"
              >
                <span>DEPTH:</span>
                <span className="text-primary-foreground font-bold">{scrollDepthPercentage}%</span>
              </div>
            </div>

            {/* Middle Cluster: Active Focus Mode / Enzyme Badge */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEngineSelector(!showEngineSelector)}
                aria-expanded={showEngineSelector}
                aria-controls="telemetry-engine-selector"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                  focusEngine
                    ? 'bg-[#06B6D4]/15 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'bg-[#090E1E] border-border text-muted-foreground hover:border-border hover:text-primary-foreground'
                }`}
              >
                <Cpu className="h-3 w-3" />
                <span>
                  {activeEnzymeObj ? activeEnzymeObj.label : 'ALL 8 ENGINES ACTIVE'}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {/* Live Terminal Drawer Button */}
              <button
                type="button"
                onClick={() => setShowLogDrawer(!showLogDrawer)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                  showLogDrawer
                    ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-primary-foreground'
                    : 'bg-[#090E1E] border-border text-muted-foreground hover:text-primary-foreground'
                }`}
              >
                <TerminalIcon className="h-3 w-3 text-[#00F0FF]" />
                <span className="hidden sm:inline">LIVE CRON</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66] animate-pulse" />
              </button>
            </div>

            {/* Right Cluster: Diagnostic Scan Trigger & Actions */}
            <div className="flex items-center gap-2">
              {isScanning ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#06B6D4]/20 border border-[#00F0FF] text-[#00F0FF] text-xs font-bold animate-pulse">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>AUDITING ({scanProgress}%)</span>
                  </div>
                  <button
                    type="button"
                    onClick={cancelScan}
                    title="Cancel Scan"
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-400 hover:bg-rose-900 transition-colors"
                    aria-label="Cancel scan"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startMockScan(activeDomain)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#00FF66] text-foreground hover:bg-emerald-400 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,102,0.3)] cursor-pointer"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>RUN PROBE</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </aside>
  );
};

export default StickyHUD;
