import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { PillCTAProps, EnzymeHue } from '../types';
import { useCardContext } from './CardContext';
import { useMagnetic } from '../hooks/useMagnetic';

const pillVariants = cva(
  'group/btn inline-flex items-center justify-center font-medium text-xs tracking-tight transition-all duration-200 select-none whitespace-nowrap shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506] focus-visible:ring-[#5E6AD2]',
  {
    variants: {
      variant: {
        solid:
          'bg-[#5E6AD2] text-white hover:bg-[#6872D9] shadow-linear-cta py-2 px-4 active:scale-[0.98]',
        glass:
          'bg-white/[0.06] hover:bg-white/[0.10] text-foreground border border-white/[0.08] hover:border-white/[0.15] backdrop-blur-md shadow-sm py-2 px-4',
        'immersive-glow':
          'bg-[#5E6AD2] hover:bg-[#6872D9] text-white border border-white/20 shadow-linear-cta py-2.5 px-5 w-full justify-between backdrop-blur-xl',
        minimal:
          'bg-transparent text-foreground-muted hover:text-foreground py-1.5 px-3 border border-transparent hover:border-white/10 rounded-full transition-colors',
        'full-width':
          'w-full py-2.5 px-5 text-sm bg-white/[0.06] hover:bg-white/[0.10] text-foreground border border-white/[0.08] hover:border-white/[0.15] backdrop-blur-lg justify-between shadow-sm',
      },
      hue: {
        vitalzyme: 'focus-visible:ring-emerald-400 hover:border-emerald-400/40',
        riskprotease: 'focus-visible:ring-rose-400 hover:border-rose-400/40',
        llmkinase: 'focus-visible:ring-purple-400 hover:border-purple-400/40',
        edgevmax: 'focus-visible:ring-[#5E6AD2] hover:border-[#5E6AD2]/40',
        ecoholo: 'focus-visible:ring-emerald-400 hover:border-emerald-400/40',
        synthshift: 'focus-visible:ring-amber-400 hover:border-amber-400/40',
        gitlygase: 'focus-visible:ring-blue-400 hover:border-blue-400/40',
        alloster: 'focus-visible:ring-fuchsia-400 hover:border-fuchsia-400/40',
        neutral: 'focus-visible:ring-[#5E6AD2]',
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
          className="w-7 h-7 rounded-full bg-background text-foreground flex items-center justify-center ml-3 shrink-0 shadow-md transition-transform duration-300 group-hover/btn:translate-x-1"
        >
          <ArrowRight className="w-4 h-4 text-foreground" />
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

