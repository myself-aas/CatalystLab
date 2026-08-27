import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star } from 'lucide-react';
import { CardChipProps, EnzymeHue } from '../types';
import { useCardContext } from './CardContext';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-mono font-bold tracking-tight whitespace-nowrap shrink-0 transition-all duration-200 select-none text-white',
  {
    variants: {
      variant: {
        default: 'bg-black/60 text-white border border-white/20 shadow-sm backdrop-blur-md',
        live: 'bg-black/60 text-white border border-white/25 shadow-[0_0_12px_rgba(16,185,129,0.25)] backdrop-blur-md',
        accent: 'bg-white/15 text-white border border-white/25 shadow-md backdrop-blur-md',
        rating: 'bg-black/60 text-white border border-amber-400/40 shadow-sm backdrop-blur-md',
        glass: 'bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-lg shadow-sm',
        solid: 'bg-black text-white border border-white/20 shadow-sm',
        enzyme: 'text-white border border-white/20 bg-black/60 shadow-sm backdrop-blur-md',
      },
      hue: {
        vitalzyme: 'border-emerald-400/40 bg-black/60 text-white',
        riskprotease: 'border-rose-400/40 bg-black/60 text-white',
        llmkinase: 'border-purple-400/40 bg-black/60 text-white',
        edgevmax: 'border-cyan-400/40 bg-black/60 text-white',
        ecoholo: 'border-emerald-400/40 bg-black/60 text-white',
        synthshift: 'border-amber-400/40 bg-black/60 text-white',
        gitlygase: 'border-blue-400/40 bg-black/60 text-white',
        alloster: 'border-fuchsia-400/40 bg-black/60 text-white',
        neutral: 'border-white/20 bg-black/60 text-white',
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
