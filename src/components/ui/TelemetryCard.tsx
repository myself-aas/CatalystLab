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

  const getScoreColor = (sc: number) => {
    if (sc >= 90) return 'text-[#00FF66] border-[#10B981]/40 bg-[#10B981]/10';
    if (sc >= 75) return 'text-[#00F0FF] border-[#06B6D4]/40 bg-[#06B6D4]/10';
    if (sc >= 60) return 'text-[#FFB800] border-[#F59E0B]/40 bg-[#F59E0B]/10';
    return 'text-[#FF3366] border-[#EF4444]/40 bg-[#EF4444]/10';
  };

  const getStatusBadge = (st: SubVectorItem['status']) => {
    switch (st) {
      case 'optimal':
        return {
          icon: Zap,
          color: 'text-[#00FF66] bg-[#10B981]/15 border-[#10B981]/30',
          label: 'OPTIMAL',
        };
      case 'pass':
        return {
          icon: ShieldCheck,
          color: 'text-[#06B6D4] bg-[#06B6D4]/15 border-[#06B6D4]/30',
          label: 'PASSED',
        };
      case 'warn':
        return {
          icon: AlertTriangle,
          color: 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30',
          label: 'WARN',
        };
      case 'fail':
        return {
          icon: XCircle,
          color: 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30',
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
      className={`rounded-xl border border-slate-800/90 bg-[#0B101B]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-slate-700/90 overflow-hidden ${className}`}
    >
      {/* Card Header & Primary Display */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Enzyme & Translation Title */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}15` }}
                className="px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wide border flex items-center gap-1.5 shadow-sm"
              >
                <Cpu className="w-3 h-3" />
                <span>{enzymeName}</span>
              </span>

              {shortCode && (
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {shortCode}
                </span>
              )}

              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                {category}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-slate-100 truncate">
              {techTranslation}
            </h3>
          </div>

          {/* Overall Enzyme Score Gauge */}
          <div className="flex flex-col items-end shrink-0">
            <div
              className={`px-3 py-1 rounded-lg border font-mono font-extrabold text-sm sm:text-base flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,0,0,0.3)] ${getScoreColor(
                score
              )}`}
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>{score}</span>
              <span className="text-[10px] font-normal text-slate-400">/100</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1">
              {executionTimeMs}ms • {status}
            </span>
          </div>
        </div>

        {/* Primary Metric Pulse Showcase */}
        <div className="mt-4 p-3.5 rounded-lg bg-[#070B13]/90 border border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Animated Pulse Ring */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-slate-800">
              <span
                style={{ backgroundColor: themeColor }}
                className="w-2.5 h-2.5 rounded-full animate-ping absolute opacity-75"
              />
              <span
                style={{ backgroundColor: themeColor }}
                className="w-2.5 h-2.5 rounded-full relative shadow-[0_0_10px_currentColor]"
              />
            </div>

            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                {primaryMetric.label}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold font-mono text-slate-100">
                  {primaryMetric.value}
                </span>
                {primaryMetric.unit && (
                  <span className="text-xs font-mono text-slate-400">
                    {primaryMetric.unit}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delta Indicator Badge */}
          {primaryMetric.deltaText && (
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                {primaryMetric.deltaText}
              </span>
            </div>
          )}
        </div>

        {/* Control Footer Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
          <button
            type="button"
            id={`${cardId}-toggle-subvectors`}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls={`${cardId}-subvectors-content`}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#06B6D4] hover:text-[#00F0FF] transition-colors py-1 px-2 rounded hover:bg-[#06B6D4]/10"
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              {copiedHash ? (
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
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
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-2 py-1 rounded transition-colors"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3 h-3" />
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
            className="border-t border-slate-800/80 bg-[#070B13]/95 px-4 py-4 sm:px-5"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/50">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-[#06B6D4]" />
                <span>MICRO-ANALYZER DIAGNOSTIC VECTORS (6/6)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
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
                    className="p-2.5 rounded-lg bg-[#0B101B] border border-slate-800/70 hover:border-slate-700 transition-colors flex flex-col justify-between gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-medium text-slate-200 truncate">
                        {vector.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border ${badge.color}`}
                      >
                        <BadgeIcon className="w-2.5 h-2.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-slate-800/40">
                      <span className="text-xs font-bold font-mono text-slate-100">
                        {vector.value}
                        {vector.unit && (
                          <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                            {vector.unit}
                          </span>
                        )}
                      </span>
                      {vector.benchmark && (
                        <span className="text-[10px] font-mono text-slate-500 truncate">
                          tgt: {vector.benchmark}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
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
