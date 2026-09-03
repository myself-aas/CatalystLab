import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Activity, 
  Globe, 
  Terminal as TerminalIcon, 
  ChevronDown, 
  ChevronUp,
  RefreshCw, 
  Play, 
  X, 
  Cpu, 
  Sliders
} from 'lucide-react';
import { useTelemetryHUDStore } from '../../store/useTelemetryHUDStore';
import { EngineType } from '../../types';

const ENZYME_LIST: { id: EngineType; label: string; name: string; color: string }[] = [
  { id: 'health', label: '[VitalZyme]', name: 'Core Web Vitals', color: '#5E6AD2' },
  { id: 'latency', label: '[EdgeVmax]', name: 'Edge Latency', color: '#38BDF8' },
  { id: 'compliance', label: '[RiskProtease]', name: 'SecOps & CSP', color: '#F43F5E' },
  { id: 'ai_ready', label: '[LLM-Kinase]', name: 'AI Crawler Readiness', color: '#A855F7' },
  { id: 'eco', label: '[EcoHolo]', name: 'Digital Carbon', color: '#10B981' },
  { id: 'repo', label: '[GitLygase]', name: 'AST Hygiene', color: '#06B6D4' },
  { id: 'migration', label: '[SynthShift]', name: 'Architecture PAR', color: '#F59E0B' },
  { id: 'llmo', label: '[AllosterSearch]', name: 'Entity Graph', color: '#6366F1' },
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
    startMockScan,
    cancelScan,
    cronLogs,
    autoStreamActive,
    toggleAutoStream,
    isMinimized,
    toggleHudExpanded,
    activeDomain,
  } = useTelemetryHUDStore();

  const [showLogDrawer, setShowLogDrawer] = useState(false);
  const [showEngineSelector, setShowEngineSelector] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const showAppChrome = /^\/(dashboard|admin|app|hud|user-dashboard)(\/|$|\.html$)/.test(location.pathname);

  // Monitor scroll depth of window
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const currentScroll = window.scrollY;
      const pct = Math.round((currentScroll / scrollHeight) * 100);
      setScrollDepthPercentage(Math.min(100, Math.max(0, pct)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollDepthPercentage]);

  // Auto-scroll log drawer to bottom on new events
  useEffect(() => {
    if (logContainerRef.current && showLogDrawer) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [cronLogs, showLogDrawer]);

  // System load color styling
  const getLoadColor = (load: number) => {
    if (load > 75) return 'text-rose-400 bg-rose-500';
    if (load > 45) return 'text-amber-400 bg-amber-500';
    return 'text-emerald-400 bg-emerald-500';
  };

  const activeEnzymeObj = ENZYME_LIST.find((e) => e.id === focusEngine);

  return (
    <aside
      id="telemetry-sticky-hud"
      aria-label="Real-time Telemetry Sticky HUD"
      className={`fixed inset-x-0 z-40 pointer-events-none flex flex-col items-center justify-end px-2.5 sm:px-6 transition-all duration-300 ${
        showAppChrome
          ? 'bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-[max(0.75rem,env(safe-area-inset-bottom))]'
          : 'bottom-[max(0.75rem,env(safe-area-inset-bottom))]'
      }`}
    >
      <div className="w-full max-w-5xl pointer-events-auto flex flex-col items-center transition-all duration-300">
        
        {/* Expandable Live Terminal Log Drawer */}
        <AnimatePresence>
          {showLogDrawer && !isMinimized && (
            <motion.div
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 16, height: 0 }}
              className="mb-2 rounded-2xl border border-border-default bg-card/95 dark:bg-[#07070a]/95 backdrop-blur-xl shadow-linear-card overflow-hidden font-mono text-xs"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-card/80 dark:bg-[#0a0a0c]/80 border-b border-border-default">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="size-3.5 text-accent-bright" />
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                    Autonomous Telemetry Cron Stream
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-foreground-muted ml-2">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{cronLogs.length} live events</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleAutoStream}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      autoStreamActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/[0.04] text-foreground-muted border border-border-default'
                    }`}
                  >
                    {autoStreamActive ? 'STREAM ACTIVE' : 'STREAM PAUSED'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLogDrawer(false)}
                    className="inline-flex size-7 items-center justify-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-white/[0.06] transition-colors"
                    aria-label="Close telemetry log"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Log Items Stream */}
              <div 
                ref={logContainerRef}
                className="p-3 max-h-48 overflow-y-auto space-y-1.5 text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-border-default"
              >
                {cronLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-2 text-foreground-muted font-mono hover:bg-white/[0.03] p-1 rounded transition-colors"
                  >
                    <span className="text-foreground-muted/70 shrink-0 text-[10px]">{log.timestamp}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0 ${
                      log.level === 'CRON' ? 'bg-accent/15 text-accent-bright border border-accent/25' :
                      log.level === 'WARN' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                      log.level === 'BENCHMARK' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                      'bg-white/[0.04] text-foreground-muted border border-border-default'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-foreground-muted/70 text-[10px] shrink-0">[{log.popRegion}]</span>
                    <span className="text-foreground flex-1 break-all">{log.message}</span>
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
              className="mb-2 p-3 rounded-2xl border border-border-default bg-card/95 dark:bg-[#07070a]/95 backdrop-blur-xl shadow-linear-card font-mono text-xs"
            >
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border-default text-foreground-muted text-[11px]">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sliders className="size-3 text-accent-bright" />
                  <span>Select Catalyst Focus Mode (HUD Isolation)</span>
                </span>
                {focusEngine && (
                  <button
                    type="button"
                    onClick={() => {
                      toggleFocusEngine(focusEngine);
                      setShowEngineSelector(false);
                    }}
                    className="text-accent-bright hover:underline text-[10px] font-semibold cursor-pointer"
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
                          ? 'bg-accent/15 border-accent/60 text-foreground shadow-2xs'
                          : 'bg-white/[0.03] border-border-default text-foreground-muted hover:text-foreground hover:border-accent/30'
                      }`}
                    >
                      <div className="font-semibold text-[11px]" style={{ color: isSelected ? 'var(--accent-bright, #6872D9)' : enzyme.color }}>
                        {enzyme.label}
                      </div>
                      <div className="text-[10px] text-foreground-muted truncate mt-0.5 font-sans">
                        {enzyme.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Sticky HUD Ribbon or Minimized Pill */}
        {isMinimized ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            type="button"
            onClick={toggleHudExpanded}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-default bg-card/95 dark:bg-[#07070a]/95 backdrop-blur-xl shadow-linear-card font-mono text-xs text-foreground hover:border-accent/50 transition-all cursor-pointer pointer-events-auto"
            aria-label="Expand telemetry HUD"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <Activity className="size-3.5 text-accent-bright" />
            <span className="font-semibold text-[11px] text-foreground">HUD</span>
            <span className="text-foreground-muted/60">•</span>
            <span className="text-[11px] text-foreground-muted">{averageLatencyMs}ms</span>
            <ChevronUp className="size-3.5 text-foreground-muted ml-0.5" />
          </motion.button>
        ) : (
          <div className="relative w-full max-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-border-default bg-card/90 dark:bg-[#07070a]/90 backdrop-blur-xl shadow-linear-card font-mono text-xs transition-all duration-300">
            
            {/* Top Scanline / Scanning Progress Bar */}
            {isScanning ? (
              <div className="h-1 bg-white/[0.06] overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent via-indigo-400 to-emerald-400"
                  style={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            ) : (
              <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            )}

            <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
              
              {/* Left Cluster: System Load + Telemetry PoPs */}
              <div className="flex items-center gap-2.5 shrink-0">
                
                {/* System Load Meter */}
                <div 
                  title="Aggregate Real-Time Edge Processing & Memory Load"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.04] dark:bg-white/[0.03] border border-border-default"
                >
                  <div className="flex items-center gap-1.5">
                    <Activity className="size-3.5 text-accent-bright" />
                    <span className="text-[10px] text-foreground-muted font-bold uppercase hidden md:inline">
                      SYS LOAD:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${getLoadColor(systemLoad).split(' ')[0]}`}>
                      {systemLoad.toFixed(1)}%
                    </span>
                    <div className="w-10 h-1.5 bg-white/[0.08] rounded-full overflow-hidden hidden sm:block">
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
                  className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.04] dark:bg-white/[0.03] border border-border-default text-[11px] text-foreground-muted"
                >
                  <Globe className="size-3.5 text-emerald-400" />
                  <span>
                    <strong className="text-foreground font-semibold">{edgePopCount}</strong> PoPs
                  </span>
                  <span className="text-foreground-muted/50">•</span>
                  <span className="text-accent-bright font-semibold">{averageLatencyMs}ms</span>
                </div>

                {/* Scroll Depth Telemetry */}
                <div 
                  title="Page Telemetry Scroll Traversal"
                  className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/[0.04] dark:bg-white/[0.03] border border-border-default text-[10px] text-foreground-muted"
                >
                  <span>DEPTH:</span>
                  <span className="text-foreground font-semibold">{scrollDepthPercentage}%</span>
                </div>
              </div>

              {/* Middle Cluster: Active Focus Mode / Enzyme Badge */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEngineSelector(!showEngineSelector)}
                  aria-expanded={showEngineSelector}
                  aria-controls="telemetry-engine-selector"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    focusEngine
                      ? 'bg-accent/15 border-accent/60 text-accent-bright shadow-2xs'
                      : 'bg-white/[0.04] dark:bg-white/[0.03] border-border-default text-foreground-muted hover:border-accent/40 hover:text-foreground'
                  }`}
                >
                  <Cpu className="size-3" />
                  <span>
                    {activeEnzymeObj ? activeEnzymeObj.label : 'ALL 8 ENGINES ACTIVE'}
                  </span>
                  <ChevronDown className="size-3 text-foreground-muted" />
                </button>

                {/* Live Terminal Drawer Button */}
                <button
                  type="button"
                  onClick={() => setShowLogDrawer(!showLogDrawer)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    showLogDrawer
                      ? 'bg-accent/15 border-accent/60 text-foreground'
                      : 'bg-white/[0.04] dark:bg-white/[0.03] border-border-default text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <TerminalIcon className="size-3 text-accent-bright" />
                  <span className="hidden sm:inline">LIVE CRON</span>
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </div>

              {/* Right Cluster: Diagnostic Scan Trigger & Actions */}
              <div className="flex items-center gap-2">
                {isScanning ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-accent/20 border border-accent/50 text-accent-bright text-xs font-semibold animate-pulse">
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>AUDITING ({scanProgress}%)</span>
                    </div>
                    <button
                      type="button"
                      onClick={cancelScan}
                      title="Cancel Scan"
                      className="inline-flex size-8 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      aria-label="Cancel scan"
                    >
                      <X aria-hidden="true" className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startMockScan(activeDomain)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-bright text-white text-xs font-semibold transition-all shadow-linear-cta cursor-pointer active:scale-95"
                  >
                    <Play className="size-3 fill-current" />
                    <span>RUN PROBE</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleHudExpanded}
                  title="Minimize HUD"
                  aria-label="Minimize HUD"
                  className="inline-flex size-7 sm:size-8 items-center justify-center rounded-lg hover:bg-white/[0.06] text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default StickyHUD;
