import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  Check, 
  Activity, 
  Filter, 
  Radio, 
  ChevronDown,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useTelemetryHUDStore, CronLogEntry } from '../../store/useTelemetryHUDStore';
import { motion, AnimatePresence } from 'motion/react';

export const LiveCronLogStream: React.FC = () => {
  const { 
    cronLogs, 
    autoStreamActive, 
    toggleAutoStream, 
    clearLogs, 
    triggerSyntheticProbe,
    activeDomain,
    focusEngine
  } = useTelemetryHUDStore();

  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-stream random cron ticks when active
  useEffect(() => {
    if (!autoStreamActive) return;

    const interval = setInterval(() => {
      triggerSyntheticProbe(focusEngine || undefined);
    }, 4500);

    return () => clearInterval(interval);
  }, [autoStreamActive, focusEngine, triggerSyntheticProbe]);

  // Scroll to top when new logs arrive (since we prepend latest logs at top)
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [cronLogs, autoScroll]);

  const filteredLogs = cronLogs.filter((log) => {
    if (selectedLevel === 'ALL') return true;
    return log.level === selectedLevel;
  });

  const handleCopyLog = (log: CronLogEntry) => {
    const text = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLevelBadgeClass = (level: CronLogEntry['level']) => {
    switch (level) {
      case 'CRON':
        return 'bg-cyan-500/10 text-[#00F0FF] border-cyan-500/30';
      case 'INFO':
        return 'bg-emerald-500/10 text-[#00FF66] border-emerald-500/30';
      case 'WARN':
        return 'bg-amber-500/10 text-[#FFB800] border-amber-500/30';
      case 'ERROR':
        return 'bg-rose-500/10 text-[#FF0055] border-rose-500/30';
      case 'BENCHMARK':
        return 'bg-purple-500/10 text-[#D946EF] border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080D1A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* Stream Header */}
      <div className="p-3.5 bg-[#0B101D] border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <Radio className={`h-4 w-4 ${autoStreamActive ? 'text-[#00FF66] animate-pulse' : 'text-slate-500'}`} />
            {autoStreamActive && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping" />
            )}
          </div>
          <span className="font-bold text-slate-100 tracking-wide">Live Telemetry Cron Stream</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
            {cronLogs.length} events
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleAutoStream}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
              autoStreamActive 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-[#00FF66] hover:bg-emerald-500/20' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={autoStreamActive ? 'Pause auto-stream' : 'Resume auto-stream'}
          >
            {autoStreamActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span className="hidden sm:inline">{autoStreamActive ? 'Streaming' : 'Paused'}</span>
          </button>

          <button
            type="button"
            onClick={() => triggerSyntheticProbe(focusEngine || undefined)}
            className="p-1.5 rounded-lg bg-[#0E1526] border border-slate-800 text-slate-300 hover:text-[#00F0FF] hover:border-[#06B6D4]/40 transition-colors cursor-pointer"
            title="Trigger manual synthetic probe"
          >
            <RefreshCw className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={clearLogs}
            className="p-1.5 rounded-lg bg-[#0E1526] border border-slate-800 text-slate-400 hover:text-[#FF0055] hover:border-rose-500/30 transition-colors cursor-pointer"
            title="Clear logs"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-3 py-2 bg-[#060912] border-b border-slate-800/80 flex items-center justify-between gap-2 text-[11px] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 shrink-0">
          <Filter className="h-3 w-3 text-slate-500 mr-1" />
          {['ALL', 'CRON', 'INFO', 'WARN', 'BENCHMARK'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-[#06B6D4] text-slate-950 font-bold border-[#06B6D4]'
                  : 'bg-[#0B101D] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="accent-[#06B6D4] rounded"
            />
            <span>Auto-top</span>
          </label>
        </div>
      </div>

      {/* Log Feed Container */}
      <div 
        ref={logsContainerRef}
        className="flex-1 overflow-y-auto p-2.5 space-y-1.5 min-h-[320px] max-h-[640px] font-mono select-text bg-[#060912]/80"
      >
        <AnimatePresence initial={false}>
          {filteredLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="group p-2 rounded-lg bg-[#0B101D] border border-slate-800/80 hover:border-slate-700 transition-all text-left space-y-1"
            >
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`px-1.5 py-0.5 rounded border font-bold ${getLevelBadgeClass(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-slate-400">{log.timestamp}</span>
                  <span className="text-slate-400 truncate">[{log.popRegion}]</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {log.durationMs && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1 rounded border border-emerald-800/40">
                      {log.durationMs}ms
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopyLog(log)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                    title="Copy event JSON"
                  >
                    {copiedId === log.id ? (
                      <Check className="h-3 w-3 text-[#00FF66]" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-200 leading-relaxed break-words font-sans">
                {log.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLogs.length === 0 && (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Terminal className="h-6 w-6 mx-auto text-slate-600" />
            <p>No log events matching level &quot;{selectedLevel}&quot;</p>
          </div>
        )}
      </div>

      {/* Stream Footer Telemetry Bar */}
      <div className="p-2 bg-[#0B101D] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="text-slate-300">Target:</span> {activeDomain}
          </span>
          {focusEngine && (
            <span className="text-[#00F0FF] font-bold">
              [Focus: {focusEngine.toUpperCase()}]
            </span>
          )}
        </div>
        <span className="text-slate-400">Protocol: WS-TLS/1.3</span>
      </div>
    </div>
  );
};
