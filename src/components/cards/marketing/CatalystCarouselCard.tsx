import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronRight } from 'lucide-react';
import { Card } from '../primitives/Card';
import { CardMedia } from '../primitives/CardMedia';
import { EnzymeHue } from '../types';

export interface CatalystCarouselCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  hue: EnzymeHue;
  title: string;
  category: string;
  statLine: string; // e.g. "18ms TTFB • 0-RTT TLS" or "99.4 Score • 42 PoPs"
  assetId?: string;
  isActive?: boolean;
  onSelect?: () => void;
  actionUrl?: string;
  actionLabel?: string;
  className?: string;
}

/**
 * CatalystCarouselCard — R3 Destination Strip Tall Card
 * Reference: R3 (Tall card, per-item hue-graded gradient over media, title + category flag, "X • Y" stat line, full-width chevron CTA, active lift)
 */
export const CatalystCarouselCard: React.FC<CatalystCarouselCardProps> = ({
  id,
  hue,
  title,
  category,
  statLine,
  assetId = 'enzyme-silicon-macro',
  isActive = false,
  onSelect,
  actionUrl,
  actionLabel = 'Explore Engine',
  className,
  ...props
}) => {
  return (
    <Card
      variant="immersive"
      hue={hue}
      active={isActive}
      lift={!isActive}
      onClick={onSelect}
      className={twMerge(
        clsx(
          'w-[260px] sm:w-[280px] md:w-[300px] h-[380px] sm:h-[420px] rounded-[24px] p-5 sm:p-6 flex flex-col justify-between shrink-0 snap-start cursor-pointer select-none transition-all duration-300',
          isActive && 'ring-2 ring-white/40 shadow-[0_25px_50px_-12px_var(--card-glow)]',
          className
        )
      )}
      {...props}
    >
      {/* 1. Full-Bleed Media with Destination Scrim & Per-Enzyme Hue Grade (R3) */}
      <CardMedia
        assetId={assetId}
        alt={`${title} telemetry visual`}
        scrim="destination"
        enableHoverZoom
        enableDuotone
      />

      {/* 2. Top Header Flag / Category Tag (R3 Flag / Icon row) */}
      <div className="z-10 flex items-center justify-between w-full">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/20 text-[11px] font-mono font-semibold text-white backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{category}</span>
        </div>
      </div>

      {/* 3. Bottom Title, "X • Y" Stat Line, and Full-Width Chevron CTA (R3 Signature) */}
      <div className="z-10 space-y-3 mt-auto pt-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black font-sans text-white tracking-tight leading-tight drop-shadow-md">
            {title}
          </h3>
          <p className="text-xs sm:text-sm font-mono text-slate-300 tracking-tight mt-1 drop-shadow-sm">
            {statLine}
          </p>
        </div>

        {/* Full-width Chevron CTA */}
        <div className="pt-1">
          {actionUrl ? (
            <a
              href={actionUrl}
              className="w-full py-2.5 px-4 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/25 backdrop-blur-md flex items-center justify-between text-xs font-semibold tracking-wide transition-all group/cta"
            >
              <span>{actionLabel}</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/cta:translate-x-1" />
            </a>
          ) : (
            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/25 backdrop-blur-md flex items-center justify-between text-xs font-semibold tracking-wide transition-all group/cta"
            >
              <span>{actionLabel}</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/cta:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
