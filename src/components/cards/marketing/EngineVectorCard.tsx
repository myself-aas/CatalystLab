import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from '../primitives/Card';
import { CardChip } from '../primitives/CardChip';
import { CardMedia } from '../primitives/CardMedia';
import { PillCTA } from '../primitives/PillCTA';
import { FavoriteButton } from '../primitives/FavoriteButton';
import { EnzymeHue, StatPair } from '../types';

export interface EngineVectorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  hue: EnzymeHue;
  name: string;
  code?: string;
  category: string;
  title: string;
  description: string;
  score: string | number;
  status?: 'OPTIMAL' | 'PASS' | 'DEGRADED' | 'MONITORING';
  rating?: number | string;
  stats?: StatPair[];
  assetId?: string;
  actionUrl?: string;
  actionLabel?: string;
  onInspect?: () => void;
  className?: string;
}

/**
 * EngineVectorCard — R2-B Immersive + R1 Top Row Enzyme Telemetry Card
 * Reference: R2-B (Immersive card with circular chip, bottom title, rating chip row, full-width pill CTA with circular arrow) + R1 Top Row
 */
export const EngineVectorCard: React.FC<EngineVectorCardProps> = ({
  id,
  hue,
  name,
  code,
  category,
  title,
  description,
  score,
  status = 'OPTIMAL',
  rating,
  stats,
  assetId = 'enzyme-silicon-macro',
  actionUrl,
  actionLabel = 'Inspect Vector',
  onInspect,
  className,
  ...props
}) => {
  return (
    <Card
      variant="immersive"
      hue={hue}
      lift
      className={twMerge(
        clsx(
          'relative flex flex-col justify-between p-5 sm:p-6 min-h-[380px] sm:min-h-[420px] rounded-[24px] overflow-hidden',
          className
        )
      )}
      {...props}
    >
      {/* 1. Full-Bleed Media with Catalyst Scrim Layer (R2-B / R1) */}
      <CardMedia
        assetId={assetId}
        alt={`${name} telemetry visual`}
        scrim="immersive"
        enableHoverZoom
        enableDuotone
      />

      {/* 2. Top Header Dark Gradient Overlay (below top text/actions) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/90 via-black/55 to-transparent pointer-events-none z-[2]"
      />

      {/* 3. Bottom Content Dark Gradient Overlay (below bottom text/stats/actions) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[85%] bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-[2]"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
      />

      {/* 4. Top Header Row (R1 Anatomy: Glyph/Brand Left + Live Status Score Chip Right + Bookmark) */}
      <div className="w-full flex items-center justify-between gap-3 relative z-10 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-foreground/60 border border-white/25 flex items-center justify-center text-xs font-mono font-black text-primary-foreground shrink-0 backdrop-blur-md shadow-sm">
            {code || name.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-mono font-bold tracking-tight text-primary-foreground text-sm uppercase truncate drop-shadow-sm">
            {name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <CardChip
            variant="live"
            isLive={status === 'OPTIMAL'}
            label={status === 'OPTIMAL' ? `${score} PTS` : String(score)}
          />
          <FavoriteButton ariaLabel={`Save ${name} to favorites`} />
        </div>
      </div>

      {/* 5. Bottom Content & Actions (R2-B Anatomy: Title, Sub, Rating/Stat Row, Full-width Pill CTA) */}
      <div className="relative z-10 space-y-3 pt-6 mt-auto">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-primary-foreground font-bold block drop-shadow-sm">
            {category}
          </span>
          <h3 className="text-lg sm:text-xl font-bold font-sans text-primary-foreground tracking-tight leading-snug drop-shadow-md">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-primary-foreground font-sans line-clamp-2 leading-relaxed drop-shadow-sm">
            {description}
          </p>
        </div>

        {/* Rating chip or 3-stat divider row */}
        {stats && stats.length > 0 ? (
          <div className="py-1">
            <Card.StatRow stats={stats} size="sm" />
          </div>
        ) : rating !== undefined ? (
          <div className="flex items-center gap-2 py-0.5">
            <CardChip variant="rating" rating={rating} label={`${rating} / 5.0 Precision`} />
          </div>
        ) : null}

        {/* Full-width Pill CTA containing circular arrow button (R2-B Signature) */}
        <div className="pt-1">
          <PillCTA
            variant="immersive-glow"
            hue={hue}
            label={actionLabel}
            href={actionUrl}
            onClick={onInspect}
            hasCircularArrow
          />
        </div>
      </div>
    </Card>
  );
};
