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
  'group relative overflow-hidden transition-[transform,border-color,background-color,box-shadow] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] border text-left',
  {
    variants: {
      variant: {
        immersive:
          'bg-[#2C2F32] text-[#F0FAFF] rounded-[24px] border border-[rgba(240,250,255,0.07)] shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_28px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(240,250,255,0.06)] backdrop-blur-xl hover:border-[rgba(240,250,255,0.14)] hover:bg-[#2C3032] hover:shadow-[0_2px_4px_rgba(0,0,0,0.25),0_16px_48px_-8px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(240,250,255,0.08)]',
        surface:
          'bg-[#2C3032] text-[#F0FAFF] rounded-[24px] border border-[rgba(240,250,255,0.07)] shadow-[0_1px_2px_rgba(0,0,0,0.18),0_8px_28px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(240,250,255,0.06)] p-4 sm:p-5 hover:border-[rgba(240,250,255,0.14)] hover:bg-[#2C2F32] hover:shadow-[0_2px_4px_rgba(0,0,0,0.25),0_16px_48px_-8px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(240,250,255,0.08)]',
        terminal:
          'bg-[#1F2223] text-[#F0FAFF] rounded-[24px] border border-[rgba(240,250,255,0.10)] scanline-overlay font-mono shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_28px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl p-5 sm:p-6 hover:border-[rgba(240,250,255,0.16)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.25),0_16px_48px_-8px_rgba(0,0,0,0.65)]',
        swatch:
          'bg-[#2C2F32] text-[#F0FAFF] rounded-[20px] border border-[rgba(240,250,255,0.07)] p-4 font-mono shadow-[0_1px_2px_rgba(0,0,0,0.18),0_8px_28px_-8px_rgba(0,0,0,0.4)] hover:border-[rgba(240,250,255,0.14)] hover:bg-[#2C3032]',
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
        true: 'hover:-translate-y-[3px] hover:border-[rgba(240,250,255,0.16)]',
        false: '',
      },
      active: {
        true: 'card-active-lift -translate-y-2 scale-[1.005]',
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
              'pointer-events-none absolute inset-0 card-spotlight-overlay opacity-0 transition-opacity duration-300 z-10',
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

