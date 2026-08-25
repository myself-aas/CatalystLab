import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star } from 'lucide-react';
import { CardChipProps, EnzymeHue } from '../types';
import { useCardContext } from './CardContext';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-mono font-medium tracking-tight whitespace-nowrap shrink-0 transition-all duration-200 select-none',
  {
    variants: {
      variant: {
        default: 'bg-slate-900/80 text-slate-200 border border-slate-700/60 shadow-sm backdrop-blur-md',
        live: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
        accent: 'bg-white/10 text-white border border-white/20 shadow-md backdrop-blur-md',
        rating: 'bg-slate-950/80 text-amber-300 border border-amber-500/30 shadow-sm backdrop-blur-md',
        glass: 'bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-lg shadow-sm',
        solid: 'bg-black text-white border border-slate-800 shadow-sm',
        enzyme: 'text-white border shadow-sm backdrop-blur-md',
      },
      hue: {
        vitalzyme: 'border-emerald-500/40 bg-emerald-950/70 text-emerald-300',
        riskprotease: 'border-rose-500/40 bg-rose-950/70 text-rose-300',
        llmkinase: 'border-purple-500/40 bg-purple-950/70 text-purple-300',
        edgevmax: 'border-cyan-500/40 bg-cyan-950/70 text-cyan-300',
        ecoholo: 'border-emerald-500/40 bg-emerald-950/70 text-emerald-300',
        synthshift: 'border-amber-500/40 bg-amber-950/70 text-amber-300',
        gitlygase: 'border-blue-500/40 bg-blue-950/70 text-blue-300',
        alloster: 'border-fuchsia-500/40 bg-fuchsia-950/70 text-fuchsia-300',
        neutral: 'border-slate-700/60 bg-slate-900/80 text-slate-300',
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
