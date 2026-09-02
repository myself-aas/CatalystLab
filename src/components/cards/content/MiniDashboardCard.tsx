import React from 'react';
import { Card } from '../primitives/Card';
import { CardStatRow } from '../primitives/CardStatRow';
import { CardTitle } from '../primitives/CardTitle';
import { EnzymeHue, StatPair } from '../types';
import { Terminal, Activity, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export interface MiniDashboardCardProps {
  id: string;
  title: string;
  subtitle?: string;
  mainValue: string | number;
  mainLabel: string;
  icon?: React.ReactNode;
  stats: StatPair[];
  status?: string;
  isLive?: boolean;
  hue?: EnzymeHue;
  className?: string;
  actionSlot?: React.ReactNode;
}

/**
 * MiniDashboardCard (Terminal Image-Free Shell Variant)
 * Adopts the Catalyst Card tokens and divider-separated stat rows,
 * remaining strictly IMAGE-FREE for HUD, dashboard, and /app views.
 */
export const MiniDashboardCard: React.FC<MiniDashboardCardProps> = ({
  id,
  title,
  subtitle,
  mainValue,
  mainLabel,
  icon,
  stats,
  status = 'ONLINE',
  isLive = true,
  hue = 'edgevmax',
  className,
  actionSlot,
}) => {
  return (
    <Card
      variant="surface"
      hue={hue}
      lift={false}
      className={`p-4 sm:p-5 flex flex-col justify-between border border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md transition-all ${className || ''}`}
    >
      <div>
        {/* Header Row: Title & Status Indicator */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
              {icon || <Activity className="w-4 h-4" />}
            </div>
            <CardTitle
              as="h4"
              className="text-xs sm:text-sm font-bold text-slate-900 font-sans tracking-tight truncate"
            >
              {title}
            </CardTitle>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 shadow-sm">
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest">
              {status}
            </span>
          </div>
        </div>

        {/* Primary Metric Display */}
        <div className="my-3">
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight metric-tabular">
            {mainValue}
          </div>
          <div className="text-xs font-sans font-bold text-indigo-600 mt-1 uppercase tracking-wider">
            {mainLabel}
          </div>
          {subtitle && (
            <p className="text-[11px] font-sans font-medium text-slate-500 mt-1.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Divider-Separated Stat Row (R5 / Catalyst Spec) */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <CardStatRow
          stats={stats}
          layout="inline-dividers"
          size="sm"
        />

        {actionSlot && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end">
            {actionSlot}
          </div>
        )}
      </div>
    </Card>
  );
};
