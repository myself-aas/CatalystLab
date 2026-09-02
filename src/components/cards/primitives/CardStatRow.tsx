import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CardStatRowProps } from '../types';
import { useCardContext } from './CardContext';

export const CardStatRow: React.FC<CardStatRowProps> = ({
  stats,
  layout = 'inline-dividers',
  size = 'md',
  className,
  ...props
}) => {
  const context = useCardContext();
  const isSurface = context.variant === 'surface';

  return (
    <div
      className={twMerge(
        clsx(
          'w-full flex items-center justify-between',
          layout === 'inline-dividers' && (isSurface ? 'divide-x divide-slate-200 dark:divide-slate-800/80' : 'divide-x divide-white/20'),
          className
        )
      )}
      {...props}
    >
      {stats.map((stat, index) => (
        <div
          key={`${stat.label}-${index}`}
          className={clsx(
            'flex flex-col min-w-0 flex-1',
            index === 0 ? 'pr-3' : index === stats.length - 1 ? 'pl-3' : 'px-3',
            size === 'sm' && 'py-0.5',
            size === 'md' && 'py-1',
            size === 'lg' && 'py-1.5'
          )}
        >
          <div className="flex items-center gap-1">
            <span
              className={clsx(
                'font-bold font-mono tracking-tight truncate drop-shadow-sm',
                isSurface ? 'text-foreground dark:text-primary-foreground' : 'text-primary-foreground',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm sm:text-base',
                size === 'lg' && 'text-lg font-black'
              )}
            >
              {stat.value}
            </span>
            {stat.delta && (
              <span
                className={clsx(
                  'text-[10px] font-mono font-semibold px-1 rounded',
                  stat.trend === 'up'
                    ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/30'
                    : stat.trend === 'down'
                    ? 'text-rose-300 bg-rose-950/80 border border-rose-500/30'
                    : 'text-primary-foreground bg-muted border border-border'
                )}
              >
                {stat.delta}
              </span>
            )}
          </div>
          <span
            className={clsx(
              'text-[11px] font-sans truncate tracking-tight drop-shadow-sm',
              isSurface ? 'text-muted-foreground dark:text-muted-foreground' : 'text-primary-foreground font-medium'
            )}
          >
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
};
