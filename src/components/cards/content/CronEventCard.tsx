import React from 'react';
import { Card } from '../primitives/Card';
import { CardMedia } from '../primitives/CardMedia';
import { CardChip } from '../primitives/CardChip';
import { CardTitle } from '../primitives/CardTitle';
import { StackedDateChip } from '../primitives/StackedDateChip';
import { EnzymeHue } from '../types';
import { Clock, MapPin, Activity, Terminal } from 'lucide-react';

export interface CronEventCardProps {
  id: string;
  title: string;
  subtitle?: string;
  month: string;
  day: string | number;
  weekday?: string;
  time: string;
  venue: string;
  address: string;
  assetId?: string;
  imageUrl?: string;
  status?: 'COMPLETED' | 'RUNNING' | 'SCHEDULED' | 'FAILED';
  hue?: EnzymeHue;
  className?: string;
  onClick?: () => void;
}

/**
 * CronEventCard (R4 Event Card Variant)
 * Reference Anatomy:
 * - Full-bleed media with solid-hue bottom scrim
 * - Large title
 * - Bottom meta row = stacked date chip (month/day/weekday), venue+address block, right-aligned time
 */
export const CronEventCard: React.FC<CronEventCardProps> = ({
  id,
  title,
  subtitle,
  month,
  day,
  weekday,
  time,
  venue,
  address,
  assetId = 'datacenter-corridor',
  imageUrl,
  status = 'COMPLETED',
  hue = 'edgevmax',
  className,
  onClick,
}) => {
  const statusColors = {
    COMPLETED: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    RUNNING: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30 animate-pulse',
    SCHEDULED: 'bg-primary/80 text-muted-foreground border-border/50',
    FAILED: 'bg-rose-950/80 text-rose-400 border-rose-500/30',
  };

  return (
    <Card
      variant="immersive"
      hue={hue}
      lift={true}
      onClick={onClick}
      className={`h-[340px] sm:h-[360px] flex flex-col justify-between overflow-hidden cursor-pointer group ${className || ''}`}
    >
      {/* Background Media with Event Scrim (R4) */}
      <CardMedia
        assetId={assetId}
        src={imageUrl}
        alt={title}
        aspect="auto"
        scrim="event"
        enableHoverZoom={true}
        className="absolute inset-0 w-full h-full"
      />

      {/* Top Bar: Pipeline tag & Status badge */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-foreground/80 border border-white/15 backdrop-blur-md">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-primary-foreground uppercase tracking-wider">
            CRON TELEMETRY
          </span>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-md ${
            statusColors[status]
          }`}
        >
          {status}
        </span>
      </div>

      {/* Bottom Area: Large Title + Meta Row with Stacked Date Chip (R4) */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-end">
        {/* Large Title */}
        <div className="mb-4">
          <CardTitle
            as="h3"
            className="text-lg sm:text-xl font-bold text-primary-foreground leading-tight font-sans drop-shadow-md group-hover:text-cyan-400 transition-colors"
          >
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-xs text-muted-foreground font-mono mt-1 drop-shadow">
              {subtitle}
            </p>
          )}
        </div>

        {/* Bottom Meta Row (R4 Signature) */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/20">
          {/* Left: Stacked Date Chip + Venue/Address */}
          <div className="flex items-center gap-3 min-w-0">
            <StackedDateChip
              month={month}
              day={day}
              weekday={weekday}
              variant="solid"
              className="w-11 h-13 shrink-0"
            />

            <div className="min-w-0 font-mono">
              <div className="text-xs font-bold text-primary-foreground truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{venue}</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {address}
              </div>
            </div>
          </div>

          {/* Right: Time / Duration */}
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 shrink-0 bg-foreground/70 border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
            <Clock className="w-3 h-3" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
