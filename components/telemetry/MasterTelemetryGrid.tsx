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
  RotateCw,
  Play,
  Share2,
  Download,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Terminal,
  Zap,
  Info
} from 'lucide-react';
import { DiagnosticConsoleCard } from './DiagnosticConsoleCard';
import { LiveTerminalStream, type TerminalLogEntry } from './LiveTerminalStream';
import { GuestQuotaBanner } from './GuestQuotaBanner';
import type {
  DiagnosticEngineId,
  MasterTelemetryReport,
  EngineResult,
  GuestQuotaStatus,
} from '../../types/telemetry';

export interface MasterTelemetryGridProps {
  report?: MasterTelemetryReport | null;
  isScanning?: boolean;
  activeEngines?: DiagnosticEngineId[];
  logs?: TerminalLogEntry[];
  quota?: GuestQuotaStatus;
  targetUrl?: string;
  onLaunchAudit?: (url: string) => void;
  onInspectEngine?: (engineId: DiagnosticEngineId) => void;
  onExportPdf?: () => void;
  onShareReport?: () => void;
}

const ENGINES_META: Array<{
  id: DiagnosticEngineId;
  name: string;
  category: 'Performance' | 'Intelligence' | 'Security' | 'Architecture';
  sdlcPhase: string;
  icon: React.ElementType;
}> = [
  { id: 'health', name: 'Website Health & Core Web Vitals', category: 'Performance', sdlcPhase: 'Testing & Vitals', icon: Activity },
  { id: 'ai_ready', name: 'AI & LLM Readiness Radar', category: 'Intelligence', sdlcPhase: 'Operations & RAG', icon: Sparkles },
  { id: 'repo', name: 'Repo Hygiene & Supply Chain', category: 'Architecture', sdlcPhase: 'Code Quality', icon: GitBranch },
  { id: 'latency', name: 'Global Edge Latency Radar', category: 'Performance', sdlcPhase: 'Release & Edge', icon: Globe2 },
  { id: 'eco', name: 'Eco Carbon Footprint Engine', category: 'Performance', sdlcPhase: 'Build & Asset SWD', icon: Leaf },
  { id: 'compliance', name: 'Compliance & DevSecOps Risk', category: 'Security', sdlcPhase: 'DevSecOps & OWASP', icon: ShieldCheck },
  { id: 'migration', name: 'Platform Migration Pre-Flight', category: 'Architecture', sdlcPhase: 'Planning & AST', icon: Cpu },
  { id: 'ai_search', name: 'AI Search Optimization Engine', category: 'Intelligence', sdlcPhase: 'Evolution & LLMO', icon: Search },
];

export const MasterTelemetryGrid: React.FC<MasterTelemetryGridProps> = ({
  report,
  isScanning = false,
  activeEngines = [],
  logs = [],
  quota,
  targetUrl = '',
  onLaunchAudit,
  onInspectEngine,
  onExportPdf,
  onShareReport,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLiveLogs, setShowLiveLogs] = useState<boolean>(isScanning);
  const [expandedMobileAccordion, setExpandedMobileAccordion] = useState<DiagnosticEngineId | null>('health');
  const [inputUrl, setInputUrl] = useState<string>(targetUrl);

  const categories = ['All', 'Performance', 'Intelligence', 'Security', 'Architecture'];

  const filteredEngines = ENGINES_META.filter(
    (eng) => selectedCategory === 'All' || eng.category === selectedCategory
  );

  const overallScore = report?.overallScore ?? 0;
  const grade = report?.grade ?? 'A';

  const getGradeBadge = (g: string) => {
    switch (g) {
      case 'A+':
      case 'A':
        return 'border-[#10B981]/40 bg-[#10B981]/15 text-[#10B981]';
      case 'B':
        return 'border-[#06B6D4]/40 bg-[#06B6D4]/15 text-[#06B6D4]';
      case 'C':
        return 'border-[#F59E0B]/40 bg-[#F59E0B]/15 text-[#F59E0B]';
      default:
        return 'border-[#EF4444]/40 bg-[#EF4444]/15 text-[#EF4444]';
    }
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim() && onLaunchAudit && !isScanning) {
      onLaunchAudit(inputUrl.trim());
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner / Rate Limit Quota */}
      {quota && (
        <GuestQuotaBanner
          quota={quota}
          onUpgradeClick={() => window.location.href = '/pricing'}
          onSignInClick={() => window.location.href = '/login'}
        />
      )}

      {/* Target URL Scan Controller Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#111726]/90 p-4 backdrop-blur-md shadow-xl">
        <form onSubmit={handleLaunch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
              https://
            </div>
            <input
              type="text"
              value={inputUrl.replace(/^https?:\/\//, '')}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="catalystlab.tech or target domain"
              disabled={isScanning}
              className="w-full pl-20 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-100 text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 focus:border-[#06B6D4] disabled:opacity-50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isScanning || !inputUrl.trim()}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#10B981] hover:opacity-95 text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-[#06B6D4]/20"
            >
              {isScanning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Auditing 8 Engines...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Telemetry</span>
                </>
              )}
            </button>

            {report && (
              <>
                {onExportPdf && (
                  <button
                    type="button"
                    onClick={onExportPdf}
                    className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Export Audit Dossier (PDF)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                {onShareReport && (
                  <button
                    type="button"
                    onClick={onShareReport}
                    className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Share Audit Permalink"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>

      {/* Composite Score Header Banner (When report is ready or in-flight) */}
      {(report || isScanning) && (
        <div className="rounded-xl border border-slate-800 bg-[#111726]/80 p-5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Score Ring */}
            <div className="relative w-16 h-16 rounded-xl bg-slate-900/90 border border-slate-700 flex flex-col items-center justify-center shadow-inner">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Index</span>
              <span className="text-xl font-bold font-mono text-slate-100">{isScanning ? '--' : overallScore}</span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
                  {report?.targetUrl || inputUrl || 'Target Domain'}
                </h2>
                {!isScanning && (
                  <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${getGradeBadge(grade)}`}>
                    GRADE {grade}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {isScanning
                  ? 'Executing 8 parallel diagnostic micro-analyzers via SSE stream...'
                  : `Completed in ${report?.totalDurationMs || 840}ms • 8 Engine Composite Synthesis`}
              </p>
            </div>
          </div>

          {/* Action to Toggle Live Terminal */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowLiveLogs(!showLiveLogs)}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 transition-all ${
                showLiveLogs
                  ? 'border-[#06B6D4]/40 bg-[#06B6D4]/10 text-[#06B6D4]'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showLiveLogs ? 'Hide Live Terminal' : 'Open SSE Log Stream'}</span>
              {isScanning && <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping" />}
            </button>
          </div>
        </div>
      )}

      {/* Live Monospace Terminal View (Collapsible) */}
      <AnimatePresence>
        {showLiveLogs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <LiveTerminalStream logs={logs} isStreaming={isScanning} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/90 border border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
          <Layers className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>8 Parallel Execution Micro-Analyzers</span>
        </div>
      </div>

      {/* --- DESKTOP VIEW: Multi-Column Engine Grid (>= 768px) --- */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredEngines.map((engine) => {
          const result = report?.engines?.[engine.id] as EngineResult | undefined;
          const isEngineActive = isScanning && (activeEngines.length === 0 || activeEngines.includes(engine.id));

          return (
            <DiagnosticConsoleCard
              key={engine.id}
              engineId={engine.id}
              name={engine.name}
              category={engine.category}
              result={result}
              isLoading={isEngineActive && !result}
              onInspectDetails={onInspectEngine ? () => onInspectEngine(engine.id) : undefined}
            />
          );
        })}
      </div>

      {/* --- MOBILE VIEW: Responsive Animated Accordion Grid (< 768px) --- */}
      <div className="md:hidden space-y-3">
        {filteredEngines.map((engine) => {
          const result = report?.engines?.[engine.id] as EngineResult | undefined;
          const isExpanded = expandedMobileAccordion === engine.id;
          const isEngineActive = isScanning && (activeEngines.length === 0 || activeEngines.includes(engine.id));
          const score = result?.score;

          return (
            <div
              key={engine.id}
              className="rounded-xl border border-slate-800 bg-[#111726]/90 backdrop-blur-md overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedMobileAccordion(isExpanded ? null : engine.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                    <engine.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{engine.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{engine.sdlcPhase}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {score !== undefined ? (
                    <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                      {score}/100
                    </span>
                  ) : isEngineActive ? (
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/30 animate-pulse">
                      RUNNING
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] text-slate-500 bg-slate-800 border border-slate-700">
                      STANDBY
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Accordion Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 pt-0 border-t border-slate-800/60"
                  >
                    <DiagnosticConsoleCard
                      engineId={engine.id}
                      name={engine.name}
                      category={engine.category}
                      result={result}
                      isLoading={isEngineActive && !result}
                      onInspectDetails={onInspectEngine ? () => onInspectEngine(engine.id) : undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
