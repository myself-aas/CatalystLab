import React, { useId } from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CardProps, CardVariant, EnzymeHue } from '../types';
import { CardContext } from './CardContext';
import { CardHeaderRow } from './CardHeaderRow';
import { CardTitle } from './CardTitle';
import { CardSub } from './CardSub';
import { CardChip } from './CardChip';
import { CardStatRow } from './CardStatRow';
import { CardBadge } from './CardBadge';
import { CardByline } from './CardByline';
import { CardActions } from './CardActions';
import { PillCTA } from './PillCTA';
import { StackedDateChip } from './StackedDateChip';
import { FavoriteButton } from './FavoriteButton';
import { CardMedia } from './CardMedia';
import { useSpotlight } from '../hooks/useSpotlight';

export const cardVariants = cva(
  'group relative overflow-hidden transition-all duration-300 ease-out border text-left',
  {
    variants: {
      variant: {
        immersive:
          'bg-slate-950 text-white rounded-[16px] border-white/10 shadow-lg backdrop-blur-md',
        surface:
          'bg-white text-slate-900 rounded-[16px] border-slate-200 shadow-sm p-3.5 sm:p-4 hover:border-slate-300 hover:shadow-md transition-all',
        terminal:
          'bg-slate-950/90 text-slate-100 rounded-[16px] border-slate-800/80 scanline-overlay font-mono shadow-md backdrop-blur-xl p-5 sm:p-6',
        swatch:
          'bg-slate-900/95 text-slate-200 rounded-[16px] border-slate-800 p-4 font-mono shadow-md',
      },
      hue: {
        vitalzyme: 'card-hue-vitalzyme',
        riskprotease: 'card-hue-riskprotease',
        llmkinase: 'card-hue-llmkinase',
        edgevmax: 'card-hue-edgevmax',
        ecoholo: 'card-hue-ecoholo',
        synthshift: 'card-hue-synthshift',
        gitlygase: 'card-hue-gitlygase',
        alloster: 'card-hue-alloster',
        neutral: 'card-hue-neutral',
      },
      lift: {
        true: 'hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_var(--card-glow,rgba(0,0,0,0.5))]',
        false: '',
      },
      active: {
        true: 'card-active-lift -translate-y-4 scale-[1.01]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'immersive',
      hue: 'neutral',
      lift: true,
      active: false,
    },
  }
);

interface CompoundCardComponent extends React.FC<CardProps> {
  Media: typeof CardMedia;
  HeaderRow: typeof CardHeaderRow;
  Title: typeof CardTitle;
  Sub: typeof CardSub;
  Chip: typeof CardChip;
  StatRow: typeof CardStatRow;
  Badge: typeof CardBadge;
  Byline: typeof CardByline;
  Actions: typeof CardActions;
  PillCTA: typeof PillCTA;
  DateChip: typeof StackedDateChip;
  Favorite: typeof FavoriteButton;
}

export const CardRoot: React.FC<CardProps> = ({
  variant = 'immersive',
  hue = 'neutral',
  lift = true,
  active = false,
  interactive = true,
  enableSpotlight = true,
  as: Component = 'article',
  className,
  children,
  ...props
}) => {
  const cardId = useId();
  const {
    ref: cardRef,
    isHovered,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = useSpotlight<HTMLElement>({ enabled: enableSpotlight });

  const contextValue = {
    variant: variant as CardVariant,
    hue: hue as EnzymeHue,
    active,
    isHovered,
    interactive,
    cardId,
  };

  return (
    <CardContext.Provider value={contextValue}>
      <Component
        ref={cardRef as any}
        aria-labelledby={cardId}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={twMerge(
          clsx(
            cardVariants({
              variant,
              hue,
              lift: lift && !active,
              active,
            }),
            className
          )
        )}
        {...props}
      >
        {/* Dynamic Pointer-Tracked Spotlight Glow Overlay */}
        {enableSpotlight && (
          <div
            className={clsx(
              'absolute inset-0 card-spotlight-overlay opacity-0 transition-opacity duration-500 z-10',
              isHovered && 'opacity-100'
            )}
          />
        )}
        {children}
      </Component>
    </CardContext.Provider>
  );
};

export const Card = CardRoot as CompoundCardComponent;

Card.Media = CardMedia;
Card.HeaderRow = CardHeaderRow;
Card.Title = CardTitle;
Card.Sub = CardSub;
Card.Chip = CardChip;
Card.StatRow = CardStatRow;
Card.Badge = CardBadge;
Card.Byline = CardByline;
Card.Actions = CardActions;
Card.PillCTA = PillCTA;
Card.DateChip = StackedDateChip;
Card.Favorite = FavoriteButton;

