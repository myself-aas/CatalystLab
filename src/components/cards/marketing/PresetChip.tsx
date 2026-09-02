import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Globe } from 'lucide-react';

export interface PresetChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  domain: string;
  selected?: boolean;
  onSelectDomain?: (domain: string) => void;
  className?: string;
}

/**
 * PresetChip — Terminal variant of preset domain selectors
 * Citations: Terminal shell mode, scanline glass styling
 */
export const PresetChip: React.FC<PresetChipProps> = ({
  domain,
  selected = false,
  onSelectDomain,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelectDomain?.(domain)}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-full font-mono text-xs transition-all duration-200 cursor-pointer select-none whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
          selected
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
            : 'bg-primary/80 hover:bg-primary-hover/90 text-muted-foreground hover:text-primary-foreground border border-border/70 hover:border-border',
          className
        )
      )}
      {...props}
    >
      <Globe className={clsx('w-3 h-3', selected ? 'text-cyan-400' : 'text-muted-foreground')} />
      <span>{domain}</span>
    </button>
  );
};
