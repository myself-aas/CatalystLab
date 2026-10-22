import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star } from 'lucide-react';
import { CardChipProps, EnzymeHue } from '../types';
import { useCardContext } from './CardContext';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-tight whitespace-nowrap shrink-0 transition duration-200 select-none text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-muted/90 text-foreground border border-border shadow-sm backdrop-blur-md',
        live: 'bg-muted/90 text-foreground border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)] backdrop-blur-md',
        accent: 'bg-accent text-foreground border border-border shadow-md backdrop-blur-md',
        rating: 'bg-muted/90 text-foreground border border-amber-400/40 shadow-sm backdrop-blur-md',
        glass: 'bg-muted/80 hover:bg-muted text-foreground border border-border backdrop-blur-lg shadow-sm',
        solid: 'bg-primary text-primary-foreground border border-border shadow-sm',
        enzyme: 'text-foreground border border-border bg-muted/90 shadow-sm backdrop-blur-md',
      },
      hue: {
        vitalzyme: 'border-emerald-400/40 bg-muted/90 text-foreground',
        riskprotease: 'border-rose-400/40 bg-muted/90 text-foreground',
        llmkinase: 'border-purple-400/40 bg-muted/90 text-foreground',
        edgevmax: 'border-cyan-400/40 bg-muted/90 text-foreground',
        ecoholo: 'border-emerald-400/40 bg-muted/90 text-foreground',
        synthshift: 'border-amber-400/40 bg-muted/90 text-foreground',
        gitlygase: 'border-blue-400/40 bg-muted/90 text-foreground',
        alloster: 'border-fuchsia-400/40 bg-muted/90 text-foreground',
        neutral: 'border-border bg-muted/90 text-foreground',
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
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cream opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cream" />
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
