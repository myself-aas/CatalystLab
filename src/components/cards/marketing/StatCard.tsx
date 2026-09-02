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
      variant="surface"
      hue={hue}
      lift
      className={twMerge(clsx('flex flex-col justify-between p-5 sm:p-6 min-h-[160px] rounded-3xl', className))}
      {...props}
    >
      <div className="flex items-start justify-between gap-3 w-full mb-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-2xl bg-accent border border-border flex items-center justify-center text-muted-foreground shrink-0 shadow-sm">
              {icon}
            </div>
          )}
          <span className="text-xs font-sans font-bold text-muted-foreground tracking-wider uppercase">
            {label}
          </span>
        </div>
        {delta && (
          <span
            className={clsx(
              'px-2 py-1 rounded-lg text-[11px] font-sans font-bold uppercase tracking-wide',
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : trend === 'down'
                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                : 'bg-accent text-muted-foreground border border-border'
            )}
          >
            {delta}
          </span>
        )}
      </div>

      <div className="my-2">
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-baseline gap-1">
          <span>{value}</span>
        </div>
        {subLabel && (
          <p className="mt-2 text-sm text-muted-foreground font-sans font-medium line-clamp-2">
            {subLabel}
          </p>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="pt-4 mt-4 border-t border-border">
          <Card.StatRow stats={stats} size="sm" />
        </div>
      )}
    </Card>
  );
};
