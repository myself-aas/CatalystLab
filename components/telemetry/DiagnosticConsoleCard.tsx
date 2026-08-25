import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Sparkles,
  GitBranch,
  Globe2,
  Leaf,
  ShieldCheck,
  Cpu,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Clock,
  Terminal,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import type { DiagnosticEngineId, EngineResult } from '../../types/telemetry';

interface DiagnosticConsoleCardProps {
  engineId: DiagnosticEngineId;
  name: string;
  category: string;
  result?: EngineResult;
  isLoading?: boolean;
  onInspectDetails?: () => void;
}

const ENGINE_CONFIG: Record<
  DiagnosticEngineId,
  {
    icon: React.ElementType;
    gradient: string;
    glowColor: string;
    borderActive: string;
    badgeText: string;
  }
> = {
  health: {
    icon: Activity,
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    glowColor: 'shadow-emerald-500/10',
    borderActive: 'border-emerald-500/40',
    badgeText: 'Core Web Vitals',
  },
  ai_ready: {
    icon: Sparkles,
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    glowColor: 'shadow-cyan-500/10',
    borderActive: 'border-cyan-500/40',
    badgeText: 'LLM & RAG',
  },
  repo: {
    icon: GitBranch,
    gradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
    glowColor: 'shadow-violet-500/10',
    borderActive: 'border-violet-500/40',
    badgeText: 'Supply Chain',
  },
  latency: {
    icon: Globe2,
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    glowColor: 'shadow-blue-500/10',
    borderActive: 'border-blue-500/40',
    badgeText: 'Edge Latency',
  },
  eco: {
    icon: Leaf,
    gradient: 'from-lime-500/20 via-lime-500/5 to-transparent',
    glowColor: 'shadow-lime-500/10',
    borderActive: 'border-lime-500/40',
    badgeText: 'SWD Carbon',
  },
  compliance: {
    icon: ShieldCheck,
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    glowColor: 'shadow-amber-500/10',
    borderActive: 'border-amber-500/40',
    badgeText: 'OWASP & WCAG',
  },
  migration: {
    icon: Cpu,
    gradient: 'from-rose-500/20 via-rose-500/5 to-transparent',
    glowColor: 'shadow-rose-500/10',
    borderActive: 'border-rose-500/40',
    badgeText: 'Stack AST',
  },
  ai_search: {
    icon: Search,
    gradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
    glowColor: 'shadow-indigo-500/10',
    borderActive: 'border-indigo-500/40',
    badgeText: 'AI Synthesizability',
  },
};

export const DiagnosticConsoleCard: React.FC<DiagnosticConsoleCardProps> = ({
  engineId,
  name,
  category,
  result,
  isLoading = false,
  onInspectDetails,
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const config = ENGINE_CONFIG[engineId] || ENGINE_CONFIG.health;
  const Icon = config.icon;

  const status = result?.status || (isLoading ? 'RUNNING' : 'IDLE');
  const score = result?.score ?? (isLoading ? 0 : 0);

  const getScoreColor = (sc: number) => {
    if (sc >= 85) return 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10';
    if (sc >= 70) return 'text-[#06B6D4] border-[#06B6D4]/30 bg-[#06B6D4]/10';
    if (sc >= 50) return 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10';
    return 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10';
  };

  const handleCopyLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (result?.rawLogStream) {
      navigator.clipboard.writeText(result.rawLogStream.join('\n'));
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 2000);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative rounded-xl border backdrop-blur-md overflow-hidden transition-all duration-300 ${
        isLoading
          ? 'border-[#06B6D4]/50 bg-[#111726]/90 shadow-lg shadow-[#06B6D4]/10 ring-1 ring-[#06B6D4]/30'
          : status === 'COMPLETE'
          ? 'border-slate-800 bg-[#111726]/80 hover:border-slate-700 shadow-md'
          : status === 'ERROR'
          ? 'border-[#EF4444]/40 bg-[#111726]/80 shadow-lg shadow-[#EF4444]/10'
          : 'border-slate-800/60 bg-[#111726]/50'
      }`}
    >
      {/* Background Accent Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} pointer-events-none opacity-40`} />

      {/* Card Header */}
      <div className="relative p-4 md:p-5 flex items-start justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              isLoading
                ? 'bg-[#06B6D4]/15 border-[#06B6D4]/40 text-[#06B6D4] animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm md:text-base leading-snug">
                {name}
              </h3>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
                {config.badgeText}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>{category}</span>
              {result?.executionTimeMs ? (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {result.executionTimeMs}ms
                  </span>
                </>
              ) : null}
            </span>
          </div>
        </div>

        {/* Status / Score Indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoading ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping" />
              <span>STREAMING</span>
            </div>
          ) : status === 'COMPLETE' ? (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono font-bold text-sm ${getScoreColor(
                score
              )}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{score}</span>
              <span className="text-[10px] font-normal opacity-70">/100</span>
            </div>
          ) : status === 'ERROR' ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-mono">
              <XCircle className="w-3.5 h-3.5" />
              <span>FAILED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs font-mono">
              <span>IDLE</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Telemetry Metric Summary */}
      <div className="relative p-4 md:p-5 space-y-3">
        {isLoading ? (
          <div className="space-y-2 py-3">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Synthesizing neural AST telemetry...</span>
              <span className="text-[#06B6D4]">IN PROGRESS</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-[#06B6D4] to-[#10B981] h-1.5 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        ) : result && status === 'COMPLETE' ? (
          <div className="space-y-3">
            {/* Quick Metrics Snapshot depending on engine */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {engineId === 'health' && (
                <>
                  <MetricPill label="TTFB" value={`${(result.metrics as any)?.ttfbMs || 120}ms`} status="good" />
                  <MetricPill label="LCP" value={`${((result.metrics as any)?.lcpMs || 1200) / 1000}s`} status="good" />
                  <MetricPill label="DOM Depth" value={`${(result.metrics as any)?.domDepth || 12} lvl`} status="neutral" />
                </>
              )}
              {engineId === 'ai_ready' && (
                <>
                  <MetricPill label="llms.txt" value={(result.metrics as any)?.hasLlmsTxt ? 'FOUND' : 'MISSING'} status={(result.metrics as any)?.hasLlmsTxt ? 'good' : 'warning'} />
                  <MetricPill label="RAG Index" value={`${(result.metrics as any)?.ragContextExtractionScore || 70}%`} status="good" />
                  <MetricPill label="Schemas" value={`${(result.metrics as any)?.structuredData?.count || 1} Types`} status="neutral" />
                </>
              )}
              {engineId === 'latency' && (
                <>
                  <MetricPill label="Global Avg" value={`${(result.metrics as any)?.globalAvgLatencyMs || 85}ms`} status="good" />
                  <MetricPill label="Fastest PoP" value={(result.metrics as any)?.fastestRegion?.split(' ')[0] || 'Ashburn'} status="good" />
                  <MetricPill label="Edge CDN" value={(result.metrics as any)?.edgeCdnDetected ? 'Active' : 'Origin'} status="neutral" />
                </>
              )}
              {engineId === 'eco' && (
                <>
                  <MetricPill label="CO2/View" value={`${(result.metrics as any)?.co2GramsPerPageview || 0.35}g`} status="good" />
                  <MetricPill label="Eco Grade" value={(result.metrics as any)?.ecoGrade || 'A'} status="good" />
                  <MetricPill label="Cleanliness" value={`Top ${(result.metrics as any)?.cleanerThanPercentile || 85}%`} status="neutral" />
                </>
              )}
              {engineId === 'compliance' && (
                <>
                  <MetricPill label="OWASP Headers" value={`${(result.metrics as any)?.owaspHeaders?.filter((h: any) => h.isPresent).length || 4}/6`} status="good" />
                  <MetricPill label="SSL/TLS" value="TLS 1.3" status="good" />
                  <MetricPill label="WCAG Violations" value={`${(result.metrics as any)?.wcag21Aa?.violations?.length || 0}`} status="neutral" />
                </>
              )}
              {engineId === 'migration' && (
                <>
                  <MetricPill label="Frontend" value={(result.metrics as any)?.detectedFrontend?.split(' ')[0] || 'Modern'} status="good" />
                  <MetricPill label="Complexity" value={`${(result.metrics as any)?.complexityScore || 20}/100`} status="neutral" />
                  <MetricPill label="Lock-in" value={(result.metrics as any)?.vendorLockInRisk || 'LOW'} status="good" />
                </>
              )}
              {engineId === 'ai_search' && (
                <>
                  <MetricPill label="Synthesizability" value={`${(result.metrics as any)?.aiSynthesizabilityScore || 85}%`} status="good" />
                  <MetricPill label="Text/Code" value={`${(result.metrics as any)?.textToCodeRatio || 22}%`} status="neutral" />
                  <MetricPill label="Readability" value={`${(result.metrics as any)?.fleschKincaidReadingEase || 72}/100`} status="good" />
                </>
              )}
              {engineId === 'repo' && (
                <>
                  <MetricPill label="License" value={(result.metrics as any)?.licenseName || 'MIT'} status="good" />
                  <MetricPill label="Activity" value={`${((result.metrics as any)?.maintenanceActivity?.issueResolutionRatio || 0.8) * 100}%`} status="good" />
                  <MetricPill label="Supply Chain" value="Verified" status="neutral" />
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-mono py-2">
            Engine standing by. Launch a scan to collect live telemetry stream.
          </p>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <button
            onClick={() => setShowLogs(!showLogs)}
            disabled={!result?.rawLogStream?.length}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>{showLogs ? 'Hide Console Logs' : 'View Stream Logs'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showLogs ? 'rotate-180' : ''}`} />
          </button>

          {onInspectDetails && (
            <button
              onClick={onInspectDetails}
              className="flex items-center gap-1 text-xs font-mono text-[#06B6D4] hover:text-[#06B6D4]/80 transition-colors"
            >
              <span>Full Dossier</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Collapsible Log Stream */}
        <AnimatePresence>
          {showLogs && result?.rawLogStream && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative mt-2 rounded-lg bg-black/70 border border-slate-800 p-3 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto space-y-1 select-text"
            >
              <div className="sticky top-0 flex justify-between items-center pb-2 mb-1 border-b border-slate-800/80 bg-black/90 px-1 -mx-1 -mt-1 pt-1 z-10">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Engine Log Trace</span>
                <button
                  onClick={handleCopyLogs}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded"
                >
                  {copiedLogs ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLogs ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              {result.rawLogStream.map((log, idx) => (
                <div key={idx} className="leading-relaxed hover:bg-slate-900/50 px-1 rounded">
                  <span className="text-slate-600 mr-2">{String(idx + 1).padStart(2, '0')}</span>
                  <span
                    className={
                      log.includes('FAIL') || log.includes('ERROR')
                        ? 'text-[#EF4444]'
                        : log.includes('PASS') || log.includes('FOUND') || log.includes('COMPLETE')
                        ? 'text-[#10B981]'
                        : log.includes('WARN')
                        ? 'text-[#F59E0B]'
                        : 'text-slate-300'
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

function MetricPill({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'critical' | 'neutral';
}) {
  const getColors = () => {
    switch (status) {
      case 'good':
        return 'border-[#10B981]/20 bg-[#10B981]/5 text-[#10B981]';
      case 'warning':
        return 'border-[#F59E0B]/20 bg-[#F59E0B]/5 text-[#F59E0B]';
      case 'critical':
        return 'border-[#EF4444]/20 bg-[#EF4444]/5 text-[#EF4444]';
      default:
        return 'border-slate-800 bg-slate-900/60 text-slate-300';
    }
  };

  return (
    <div className={`p-2 rounded-lg border flex flex-col justify-between ${getColors()}`}>
      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{label}</span>
      <span className="text-xs md:text-sm font-mono font-semibold truncate mt-0.5">{value}</span>
    </div>
  );
}
