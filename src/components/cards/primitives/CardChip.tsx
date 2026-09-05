import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star } from 'lucide-react';
import { CardChipProps, EnzymeHue } from '../types';
import { useCardContext } from './CardContext';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-tight whitespace-nowrap shrink-0 transition-all duration-200 select-none text-primary-foreground',
  {
    variants: {
      variant: {
        default: 'bg-foreground/60 text-primary-foreground border border-white/20 shadow-sm backdrop-blur-md',
        live: 'bg-foreground/60 text-primary-foreground border border-white/25 shadow-[0_0_12px_rgba(16,185,129,0.25)] backdrop-blur-md',
        accent: 'bg-background/15 text-primary-foreground border border-white/25 shadow-md backdrop-blur-md',
        rating: 'bg-foreground/60 text-primary-foreground border border-amber-400/40 shadow-sm backdrop-blur-md',
        glass: 'bg-background/15 hover:bg-background/25 text-primary-foreground border border-white/25 backdrop-blur-lg shadow-sm',
        solid: 'bg-primary text-primary-foreground border border-white/20 shadow-sm',
        enzyme: 'text-primary-foreground border border-white/20 bg-foreground/60 shadow-sm backdrop-blur-md',
      },
      hue: {
        vitalzyme: 'border-emerald-400/40 bg-foreground/60 text-primary-foreground',
        riskprotease: 'border-rose-400/40 bg-foreground/60 text-primary-foreground',
        llmkinase: 'border-purple-400/40 bg-foreground/60 text-primary-foreground',
        edgevmax: 'border-cyan-400/40 bg-foreground/60 text-primary-foreground',
        ecoholo: 'border-emerald-400/40 bg-foreground/60 text-primary-foreground',
        synthshift: 'border-amber-400/40 bg-foreground/60 text-primary-foreground',
        gitlygase: 'border-blue-400/40 bg-foreground/60 text-primary-foreground',
        alloster: 'border-fuchsia-400/40 bg-foreground/60 text-primary-foreground',
        neutral: 'border-white/20 bg-foreground/60 text-primary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
      hue: 'neutral',
    },
  }
);

export const CardChip: React.FC<CardChipProps> = ({
  variant = 'default',
  hue: propHue,
  icon,
  label,
  isLive = false,
  rating,
  className,
  ...props
}) => {
  const context = useCardContext();
  const activeHue: EnzymeHue = propHue || context.hue || 'neutral';

  return (
    <span
      role={isLive ? 'status' : undefined}
      aria-live={isLive ? 'polite' : undefined}
      className={twMerge(
        clsx(
          chipVariants({
            variant: rating !== undefined ? 'rating' : isLive ? 'live' : variant,
            hue: variant === 'enzyme' || variant === 'live' ? activeHue : undefined,
          }),
          className
        )
      )}
      {...props}
    >
      {isLive && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}
      {rating !== undefined && (
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline-block shrink-0 -mt-0.5" />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span className="truncate">{label || (rating !== undefined ? `${rating}` : null)}</span>
    </span>
  );
};
