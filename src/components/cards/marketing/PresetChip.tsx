import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Globe } from 'lucide-react';

export interface PresetChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  domain: string;
  selected?: boolean;
  onSelect?: (domain: string) => void;
  className?: string;
}

/**
 * PresetChip — Terminal variant of preset domain selectors
 * Citations: Terminal shell mode, scanline glass styling
 */
export const PresetChip: React.FC<PresetChipProps> = ({
  domain,
  selected = false,
  onSelect,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(domain)}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs transition-all duration-200 cursor-pointer select-none whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
          selected
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
            : 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700/70 hover:border-slate-600',
          className
        )
      )}
      {...props}
    >
      <Globe className={clsx('w-3 h-3', selected ? 'text-cyan-400' : 'text-slate-400')} />
      <span>{domain}</span>
    </button>
  );
};
