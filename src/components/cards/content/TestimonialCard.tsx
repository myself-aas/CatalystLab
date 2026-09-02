import React from 'react';
import { Card } from '../primitives/Card';
import { CardMedia } from '../primitives/CardMedia';
import { CardBadge } from '../primitives/CardBadge';
import { CardStatRow } from '../primitives/CardStatRow';
import { CardByline } from '../primitives/CardByline';
import { CardTitle } from '../primitives/CardTitle';
import { EnzymeHue, StatPair } from '../types';
import { Star, ShieldCheck, CheckCircle2, Quote } from 'lucide-react';

export interface TestimonialCardProps {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  company: string;
  avatarUrl?: string;
  avatarAssetId?: string;
  bgImageUrl?: string;
  bgAssetId?: string;
  badgeLabel?: string;
  metricValue: string;
  metricLabel: string;
  secondaryMetricValue?: string;
  secondaryMetricLabel?: string;
  hue?: EnzymeHue;
  rating?: number;
  className?: string;
}

/**
 * TestimonialCard (R5 Listing Card Variant)
 * Reference Anatomy:
 * - Media with top-left badge chip (icon + label e.g. "VERIFIED CI/CD")
 * - Top-right star rating pill
 * - Dark bottom gradient scrim
 * - Quote as main title
 * - Stat pair with vertical divider (Metric Value / Label)
 * - Byline row "By <underlined name> • <role, company>" with avatar.
 */
export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  id,
  quote,
  authorName,
  authorRole,
  company,
  avatarUrl,
  avatarAssetId,
  bgImageUrl,
  bgAssetId = 'datacenter-corridor',
  badgeLabel = 'VERIFIED CI/CD',
  metricValue,
  metricLabel,
  secondaryMetricValue = '0-RTT',
  secondaryMetricLabel = 'Pipeline SLA',
  hue = 'vitalzyme',
  rating = 5,
  className,
}) => {
  const stats: StatPair[] = [
    { label: metricLabel, value: metricValue, trend: 'up', highlight: true },
    { label: secondaryMetricLabel, value: secondaryMetricValue, trend: 'up' },
  ];

  return (
    <Card
      variant="immersive"
      hue={hue}
      lift={true}
      className={`h-[420px] sm:h-[440px] flex flex-col justify-between overflow-hidden group ${className || ''}`}
    >
      {/* Background Media with Listing Scrim */}
      <CardMedia
        assetId={bgAssetId}
        src={bgImageUrl}
        alt={`${authorName} from ${company}`}
        aspect="auto"
        scrim="listing"
        enableHoverZoom={true}
        className="absolute inset-0 w-full h-full"
      />

      {/* Top Header Row: Top-Left Badge Chip (R5) + Top-Right Star Rating */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-2">
        <CardBadge
          variant="cyan"
          icon={<ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
          label={badgeLabel}
          className="shadow-lg backdrop-blur-md"
        />

        {/* Rating Chip */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/70 border border-white/10 backdrop-blur-md shadow-sm">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>

      {/* Bottom Content Area (R5 Listing Layout) */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-end">
        {/* Quote Icon & Headline Quote */}
        <div className="mb-3">
          <Quote className="w-5 h-5 text-cyan-400/70 mb-1.5" />
          <CardTitle
            as="h3"
            className="text-sm sm:text-base font-bold text-primary-foreground leading-snug line-clamp-3 font-sans tracking-normal drop-shadow-md"
          >
            &ldquo;{quote}&rdquo;
          </CardTitle>
        </div>

        {/* Stat Pair with Vertical Divider (R5 Signature) */}
        <div className="py-2.5 my-2 border-y border-white/15 backdrop-blur-sm bg-foreground/40 rounded-lg px-3">
          <CardStatRow
            stats={stats}
            layout="inline-dividers"
            size="sm"
          />
        </div>

        {/* Byline Row: "By <underlined name> • <role, company>" with avatar (R5) */}
        <div className="mt-1">
          <CardByline
            author={authorName}
            userRole={`${authorRole} • ${company}`}
            avatarUrl={avatarUrl}
            avatarAssetId={avatarAssetId}
            verified={true}
            className="text-muted-foreground"
          />
        </div>
      </div>
    </Card>
  );
};
