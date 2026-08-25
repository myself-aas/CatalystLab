import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { PillCTAProps, EnzymeHue } from '../types';
import { useCardContext } from './CardContext';
import { useMagnetic } from '../hooks/useMagnetic';

const pillVariants = cva(
  'group/btn inline-flex items-center justify-center font-semibold text-xs tracking-tight transition-all duration-300 select-none whitespace-nowrap shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:ring-white',
  {
    variants: {
      variant: {
        solid:
          'bg-white text-slate-950 hover:bg-slate-100 shadow-md py-2 px-5 hover:scale-[1.02] active:scale-[0.98]',
        glass:
          'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-md py-2 px-4 hover:border-white/50',
        'immersive-glow':
          'bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 shadow-lg py-2.5 px-5 w-full justify-between backdrop-blur-xl',
        minimal:
          'bg-transparent text-white hover:text-cyan-300 py-1.5 px-3 border border-transparent hover:border-white/20 rounded-full',
        'full-width':
          'w-full py-3 px-5 text-sm bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-lg justify-between shadow-lg',
      },
      hue: {
        vitalzyme: 'focus-visible:ring-emerald-400 hover:border-emerald-400/40',
        riskprotease: 'focus-visible:ring-rose-400 hover:border-rose-400/40',
        llmkinase: 'focus-visible:ring-purple-400 hover:border-purple-400/40',
        edgevmax: 'focus-visible:ring-cyan-400 hover:border-cyan-400/40',
        ecoholo: 'focus-visible:ring-emerald-400 hover:border-emerald-400/40',
        synthshift: 'focus-visible:ring-amber-400 hover:border-amber-400/40',
        gitlygase: 'focus-visible:ring-blue-400 hover:border-blue-400/40',
        alloster: 'focus-visible:ring-fuchsia-400 hover:border-fuchsia-400/40',
        neutral: 'focus-visible:ring-white/80',
      },
    },
    defaultVariants: {
      variant: 'solid',
      hue: 'neutral',
    },
  }
);

export const PillCTA: React.FC<PillCTAProps> = ({
  variant = 'solid',
  hue: propHue,
  label,
  href,
  icon,
  hasCircularArrow = false,
  hasChevron = false,
  className,
  children,
  ...props
}) => {
  const context = useCardContext();
  const activeHue: EnzymeHue = propHue || context.hue || 'neutral';
  const { style: magneticArrowStyle, handleMouseMove, handleMouseLeave } = useMagnetic({
    maxDistance: 4,
    damping: 0.35,
    enabled: hasCircularArrow,
  });

  const content = (
    <>
      <span className="truncate">{label || children}</span>
      {hasCircularArrow && (
        <span
          style={magneticArrowStyle}
          className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center ml-3 shrink-0 shadow-md transition-transform duration-300 group-hover/btn:translate-x-1"
        >
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </span>
      )}
      {hasChevron && (
        <ChevronRight className="w-4 h-4 ml-1.5 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-1" />
      )}
      {!hasCircularArrow && !hasChevron && icon && (
        <span className="ml-1.5 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5">
          {icon}
        </span>
      )}
    </>
  );

  const classes = twMerge(
    clsx(
      pillVariants({
        variant: hasCircularArrow ? 'immersive-glow' : variant,
        hue: activeHue,
      }),
      className
    )
  );

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {content}
    </button>
  );
};

