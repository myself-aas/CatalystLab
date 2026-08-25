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
      variant="terminal"
      hue={hue}
      lift={false}
      className={`p-4 sm:p-5 flex flex-col justify-between border border-slate-800 bg-[#0B101D]/95 backdrop-blur-md ${className || ''}`}
    >
      <div>
        {/* Header Row: Title & Status Indicator */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
              {icon || <Activity className="w-3.5 h-3.5" />}
            </div>
            <CardTitle
              as="h4"
              className="text-xs sm:text-sm font-bold text-white font-mono truncate"
            >
              {title}
            </CardTitle>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              {status}
            </span>
          </div>
        </div>

        {/* Primary Metric Display */}
        <div className="my-2">
          <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight metric-tabular">
            {mainValue}
          </div>
          <div className="text-xs font-mono text-cyan-400/90 mt-0.5">
            {mainLabel}
          </div>
          {subtitle && (
            <p className="text-[11px] font-sans text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Divider-Separated Stat Row (R5 / Catalyst Spec) */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <CardStatRow
          stats={stats}
          layout="inline-dividers"
          size="sm"
        />

        {actionSlot && (
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-end">
            {actionSlot}
          </div>
        )}
      </div>
    </Card>
  );
};
