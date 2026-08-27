import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Terminal,
  Cpu,
  Radio,
  FileCode,
} from 'lucide-react';

export interface SubVectorItem {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  status: 'optimal' | 'pass' | 'warn' | 'fail';
  description: string;
  benchmark?: string;
}

export interface TelemetryCardProps {
  enzymeName: string;
  techTranslation: string;
  shortCode?: string;
  category?: string;
  score: number; // 0 - 100
  primaryMetric: {
    label: string;
    value: string | number;
    unit?: string;
    status: 'optimal' | 'pass' | 'warn' | 'fail';
    deltaText?: string;
  };
  subVectors: [
    SubVectorItem,
    SubVectorItem,
    SubVectorItem,
    SubVectorItem,
    SubVectorItem,
    SubVectorItem
  ] | SubVectorItem[];
  executionTimeMs?: number;
  status?: 'IDLE' | 'QUEUED' | 'RUNNING' | 'COMPLETE' | 'ERROR';
  themeColor?: string;
  onInspectDetails?: () => void;
  onRerunProbe?: () => void;
  className?: string;
  id?: string;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  enzymeName,
  techTranslation,
  shortCode,
  category = 'Telemetry',
  score,
  primaryMetric,
  subVectors,
  executionTimeMs = 120,
  status = 'COMPLETE',
  themeColor = '#06B6D4',
  onInspectDetails,
  onRerunProbe,
  className = '',
  id,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const cardId = id || `telemetry-card-${enzymeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const getStatusBadge = (st: SubVectorItem['status']) => {
    switch (st) {
      case 'optimal':
        return {
          icon: Zap,
          color: 'text-emerald-700 bg-emerald-100 border-emerald-200',
          label: 'OPTIMAL',
        };
      case 'pass':
        return {
          icon: ShieldCheck,
          color: 'text-indigo-700 bg-indigo-100 border-indigo-200',
          label: 'PASSED',
        };
      case 'warn':
        return {
          icon: AlertTriangle,
          color: 'text-amber-700 bg-amber-100 border-amber-200',
          label: 'WARN',
        };
      case 'fail':
        return {
          icon: XCircle,
          color: 'text-rose-700 bg-rose-100 border-rose-200',
          label: 'CRITICAL',
        };
    }
  };

  const handleCopyVectorPayload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const payload = JSON.stringify(
      {
        enzyme: enzymeName,
        translation: techTranslation,
        score,
        primary: primaryMetric,
        vectors: subVectors,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div
      id={cardId}
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl shadow-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-md overflow-hidden ${className}`}
    >
      {/* Card Header & Primary Display */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Enzyme & Translation Title */}
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}10` }}
                className="px-2.5 py-0.5 rounded-lg text-[11px] font-sans font-bold tracking-widest border flex items-center gap-1.5 shadow-sm uppercase"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{enzymeName}</span>
              </span>

              {shortCode && (
                <span className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-900/80 px-1.5 py-0.5 rounded-md border border-zinc-800/80">
                  {shortCode}
                </span>
              )}

              <span className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-900/50 border border-zinc-800/80 px-2 py-0.5 rounded-md">
                {category}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate font-sans tracking-tight">
              {techTranslation}
            </h3>
          </div>

          {/* Overall Enzyme Score Gauge */}
          <div className="flex flex-col items-end shrink-0">
            <div
              className={`px-3 py-1 rounded-xl border font-mono font-extrabold text-sm sm:text-base flex items-center gap-1.5 shadow-sm ${
                score >= 90
                  ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                  : score >= 75
                  ? 'text-indigo-700 border-indigo-200 bg-indigo-50'
                  : score >= 60
                  ? 'text-amber-700 border-amber-200 bg-amber-50'
                  : 'text-rose-700 border-rose-200 bg-rose-50'
              }`}
            >
              <Activity className="w-4 h-4 animate-pulse" />
              <span>{score}</span>
              <span className="text-[10px] font-medium text-zinc-400">/100</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1.5">
              {executionTimeMs}ms • {status}
            </span>
          </div>
        </div>

        {/* Primary Metric Pulse Showcase */}
        <div className="mt-5 p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between gap-4 shadow-inner">
          <div className="flex items-center gap-3">
            {/* Animated Pulse Ring */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/80 shadow-sm">
              <span
                style={{ backgroundColor: themeColor }}
                className="w-2 h-2 rounded-full animate-ping absolute opacity-75"
              />
              <span
                style={{ backgroundColor: themeColor }}
                className="w-2.5 h-2.5 rounded-full relative"
              />
            </div>

            <div>
              <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest">
                {primaryMetric.label}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black font-mono text-zinc-100 tracking-tight">
                  {primaryMetric.value}
                </span>
                {primaryMetric.unit && (
                  <span className="text-xs font-mono font-medium text-zinc-400">
                    {primaryMetric.unit}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delta Indicator Badge */}
          {primaryMetric.deltaText && (
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                {primaryMetric.deltaText}
              </span>
            </div>
          )}
        </div>

        {/* Control Footer Bar */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <button
            type="button"
            id={`${cardId}-toggle-subvectors`}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls={`${cardId}-subvectors-content`}
            className="flex items-center gap-1.5 text-xs font-sans font-bold text-indigo-600 hover:text-indigo-700 transition-colors py-1.5 px-3 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100"
          >
            <span>6 Sub-Vectors</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id={`${cardId}-copy-payload`}
              onClick={handleCopyVectorPayload}
              title="Copy Vector JSON"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-zinc-900/80 transition-colors"
            >
              {copiedHash ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {onInspectDetails && (
              <button
                type="button"
                id={`${cardId}-inspect`}
                onClick={onInspectDetails}
                title="Deep Inspect Engine AST"
                className="flex items-center gap-1 text-[11px] font-sans font-bold text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/80 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-zinc-800/80"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable 6 Sub-Vectors Accordion */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={`${cardId}-subvectors-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="border-t border-zinc-800/80 bg-zinc-900/50 px-4 py-4 sm:px-5"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80/60">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-indigo-500" />
                <span>MICRO-ANALYZER DIAGNOSTIC VECTORS (6/6)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-medium">
                PROBE_CYCLE: #08
              </span>
            </div>

            {/* 6 Sub-Vectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {subVectors.map((vector, idx) => {
                const badge = getStatusBadge(vector.status);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={vector.id || `vec-${idx}`}
                    id={`${cardId}-vector-${idx}`}
                    className="p-3 rounded-xl bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/80 hover:border-zinc-700 hover:shadow-sm transition-all flex flex-col justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-sans font-bold text-zinc-100 truncate tracking-tight">
                        {vector.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-sans font-bold uppercase tracking-widest border ${badge.color}`}
                      >
                        <BadgeIcon className="w-2.5 h-2.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2 pt-2 mt-0.5 border-t border-zinc-800/50">
                      <span className="text-sm font-black font-mono text-zinc-100">
                        {vector.value}
                        {vector.unit && (
                          <span className="text-[10px] font-medium text-zinc-400 ml-0.5">
                            {vector.unit}
                          </span>
                        )}
                      </span>
                      {vector.benchmark && (
                        <span className="text-[10px] font-mono text-slate-400 truncate">
                          tgt: {vector.benchmark}
                        </span>
                      )}
                    </div>

                    <p className="text-[10.5px] text-zinc-400 leading-snug line-clamp-2 mt-0.5 font-sans">
                      {vector.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TelemetryCard;
