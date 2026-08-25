import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IntegrationChipProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  category?: string;
  icon?: React.ReactNode;
  active?: boolean;
  status?: string;
  className?: string;
}

/**
 * IntegrationChip — Terminal shell partner & ecosystem logo chip
 * Citations: Terminal shell variant, zero-photo scanline aesthetic
 */
export const IntegrationChip: React.FC<IntegrationChipProps> = ({
  name,
  category,
  icon,
  active = true,
  status = 'CONNECTED',
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 font-mono text-xs text-slate-200 transition-all duration-200 shadow-sm backdrop-blur-md select-none shrink-0 group',
          active && 'hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]',
          className
        )
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</span>}
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
          {name}
        </span>
        {category && (
          <span className="text-[10px] text-slate-400 truncate">
            {category}
          </span>
        )}
      </div>
      {status && (
        <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
          {status}
        </span>
      )}
    </div>
  );
};
