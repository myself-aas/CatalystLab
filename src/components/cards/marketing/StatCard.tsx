import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from '../primitives/Card';
import { EnzymeHue, StatPair } from '../types';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  subLabel?: string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  hue?: EnzymeHue;
  stats?: StatPair[];
  className?: string;
}

/**
 * StatCard — Terminal variant metric card with scanline glass and glow
 * Reference: Terminal Shell (Swiss industrial telemetry)
 */
export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  subLabel,
  delta,
  trend = 'up',
  icon,
  hue = 'edgevmax',
  stats,
  className,
  ...props
}) => {
  return (
    <Card
      variant="terminal"
      hue={hue}
      lift
      className={twMerge(clsx('flex flex-col justify-between p-5 sm:p-6 min-h-[160px]', className))}
      {...props}
    >
      <div className="flex items-start justify-between gap-3 w-full mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
              {icon}
            </div>
          )}
          <span className="text-xs font-mono font-medium text-slate-300 tracking-wider uppercase">
            {label}
          </span>
        </div>
        {delta && (
          <span
            className={clsx(
              'px-2 py-0.5 rounded text-[11px] font-mono font-semibold',
              trend === 'up'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                : trend === 'down'
                ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            )}
          >
            {delta}
          </span>
        )}
      </div>

      <div className="my-2">
        <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-baseline gap-1">
          <span>{value}</span>
        </div>
        {subLabel && (
          <p className="mt-1 text-xs text-slate-400 font-sans line-clamp-2">
            {subLabel}
          </p>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="pt-3 mt-3 border-t border-slate-800/80">
          <Card.StatRow stats={stats} size="sm" />
        </div>
      )}
    </Card>
  );
};
