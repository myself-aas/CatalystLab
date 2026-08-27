import React from 'react';
import { Card } from '../primitives/Card';
import { EnzymeHue } from '../types';
import { CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

export interface TelemetrySwatchCardProps {
  id: string;
  metricKey?: string;
  label?: string;
  title?: string;
  badge?: string;
  mainMetric?: string;
  detail?: string;
  value?: string | number;
  unit?: string;
  benchmarkTarget?: string;
  status?: 'PASS' | 'OPTIMAL' | 'WARN' | 'FAIL';
  percentile?: string;
  deltaPercent?: string;
  trend?: 'up' | 'down' | 'neutral';
  hue?: EnzymeHue;
  isActive?: boolean;
  onClick?: () => void;
  miniStats?: { label: string; value: string }[];
  className?: string;
}

/**
 * TelemetrySwatchCard (Swatch Variant)
 * High-density telemetry swatch card showing real-time Core Web Vitals,
 * server latencies, and security scores with status gauge.
 */
export const TelemetrySwatchCard: React.FC<TelemetrySwatchCardProps> = ({
  id,
  metricKey,
  label,
  title,
  badge,
  mainMetric,
  detail,
  value,
  unit,
  benchmarkTarget = '< 80ms',
  status = 'OPTIMAL',
  percentile = 'P95',
  deltaPercent = '+14.2%',
  trend = 'up',
  hue = 'vitalzyme',
  isActive = false,
  onClick,
  miniStats,
  className,
}) => {
  const displayTitle = title || label || metricKey || 'Metric';
  const displayBadge = badge || (metricKey ? metricKey.toUpperCase() : 'TELEMETRY');
  const displayValue = mainMetric || (value !== undefined ? `${value}` : '0ms');
  const displayDetail = detail || label || '';

  const statusStyles = {
    OPTIMAL: {
      bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
      bar: 'bg-emerald-400',
      icon: CheckCircle2,
    },
    PASS: {
      bg: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40',
      bar: 'bg-cyan-400',
      icon: CheckCircle2,
    },
    WARN: {
      bg: 'bg-amber-950/60 text-amber-400 border-amber-500/40',
      bar: 'bg-amber-400',
      icon: AlertTriangle,
    },
    FAIL: {
      bg: 'bg-rose-950/60 text-rose-400 border-rose-500/40',
      bar: 'bg-rose-400',
      icon: AlertTriangle,
    },
  };

  const currentStyle = statusStyles[status];
  const StatusIcon = currentStyle.icon;

  // If in compact swatch selector mode (e.g. from SevenDayTrialSection)
  if (onClick || mainMetric) {
    return (
      <button
        type="button"
        id={id}
        onClick={onClick}
        className={`group w-full text-left rounded-xl p-3 border transition-all cursor-pointer font-mono select-none ${
          isActive
            ? 'bg-white border-indigo-400 shadow-md ring-2 ring-indigo-500/10'
            : 'bg-white/60 border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100 hover:bg-white shadow-sm'
        } ${className || ''}`}
      >
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold truncate">
            {displayBadge}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
        </div>

        <div className="text-sm font-bold text-slate-900 font-mono truncate">
          {displayValue}
        </div>

        <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5 font-sans">
          {displayTitle}
        </div>

        {miniStats && miniStats.length > 0 && (
          <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-slate-500 font-mono">
            {miniStats.map((ms, idx) => (
              <span key={idx}>
                {ms.label}: <strong className="text-slate-900">{ms.value}</strong>
              </span>
            ))}
          </div>
        )}
      </button>
    );
  }

  return (
    <Card
      variant="swatch"
      hue={hue}
      lift={true}
      className={`p-4 sm:p-5 flex flex-col justify-between border border-slate-800 bg-[#0A0F1E] ${className || ''}`}
    >
      <div>
        {/* Header: Metric Key & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{displayBadge}</span>
          </div>

          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${currentStyle.bg}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{status}</span>
          </div>
        </div>

        {/* Big Metric Value (Tabular font) */}
        <div className="flex items-baseline gap-1 my-2">
          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white metric-tabular">
            {displayValue}
          </span>
          {unit && <span className="text-xs font-mono text-slate-400">{unit}</span>}
        </div>

        <div className="text-xs font-medium text-slate-300 font-sans">
          {displayTitle}
        </div>
      </div>

      {/* Target Progress & Benchmark Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
          <span>Target: {benchmarkTarget}</span>
          <span className="text-slate-500">{percentile} Telemetry</span>
        </div>

        {/* Minimalist Gauge Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${currentStyle.bar}`}
            style={{ width: status === 'OPTIMAL' || status === 'PASS' ? '92%' : '65%' }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
          <span className="text-slate-500">Global Edge Mesh</span>
          <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            {deltaPercent} vs baseline
          </span>
        </div>
      </div>
    </Card>
  );
};
