import React from 'react';

export type CardVariant = 'immersive' | 'surface' | 'terminal' | 'swatch';

export type EnzymeHue =
  | 'vitalzyme'
  | 'riskprotease'
  | 'llmkinase'
  | 'edgevmax'
  | 'ecoholo'
  | 'synthshift'
  | 'gitlygase'
  | 'alloster'
  | 'neutral';

export type AspectPreset = '16/9' | '3/4' | '4/5' | '1/1' | '4/3' | 'auto';

export interface CardContextValue {
  variant: CardVariant;
  hue: EnzymeHue;
  active?: boolean;
  isHovered?: boolean;
  interactive?: boolean;
  cardId?: string;
}

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  hue?: EnzymeHue;
  lift?: boolean;
  active?: boolean;
  interactive?: boolean;
  enableSpotlight?: boolean;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

export interface CardMediaProps extends React.HTMLAttributes<HTMLElement> {
  assetId?: string;
  src?: string;
  /** Optional fallback source URLs; tried in order when earlier ones fail. */
  sources?: string[];
  alt: string;
  aspect?: AspectPreset;
  aspectClassName?: string;
  scrim?: 'immersive' | 'destination' | 'event' | 'listing' | 'none';
  enableHoverZoom?: boolean;
  enableDuotone?: boolean;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface CardHeaderRowProps extends React.HTMLAttributes<HTMLDivElement> {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  brandName?: string;
  timestamp?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface CardChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'live' | 'accent' | 'rating' | 'glass' | 'solid' | 'enzyme';
  hue?: EnzymeHue;
  icon?: React.ReactNode;
  label: string | React.ReactNode;
  isLive?: boolean;
  rating?: number | string;
  className?: string;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'span';
  priceStyle?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface CardSubProps extends React.HTMLAttributes<HTMLParagraphElement> {
  icon?: React.ReactNode;
  location?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface StatPair {
  label: string;
  value: string | number;
  subValue?: string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

export interface CardStatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: StatPair[];
  layout?: 'grid' | 'inline-dividers';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface PillCTAProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'glass' | 'immersive-glow' | 'minimal' | 'full-width';
  hue?: EnzymeHue;
  label?: string;
  href?: string;
  icon?: React.ReactNode;
  hasCircularArrow?: boolean;
  hasChevron?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface CardBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'amber' | 'emerald' | 'cyan' | 'purple' | 'neutral' | 'red';
  icon?: React.ReactNode;
  label: string;
  className?: string;
}

export interface CardBylineProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  author: string;
  authorUrl?: string;
  avatarUrl?: string;
  avatarAssetId?: string;
  avatarAlt?: string;
  role?: string;
  userRole?: string;
  timestamp?: string;
  verified?: boolean;
  className?: string;
}

export interface StackedDateChipProps extends React.HTMLAttributes<HTMLDivElement> {
  month: string;
  day: string | number;
  weekday?: string;
  time?: string;
  variant?: 'solid' | 'glass';
  className?: string;
}

export interface FavoriteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isFavorite?: boolean;
  onToggle?: (isFav: boolean) => void;
  ariaLabel?: string;
  className?: string;
}

export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

/* --- Typed Domain Data Contracts --- */
export interface EngineCardData {
  id: string;
  engineKey: EnzymeHue;
  name: string;
  code: string;
  title: string;
  description: string;
  category: 'Core' | 'SecOps' | 'AI & LLM' | 'Edge' | 'Sustainability' | 'Enterprise';
  score: string | number;
  status: 'OPTIMAL' | 'DEGRADED' | 'MONITORING' | 'PASS';
  primaryMetric: {
    label: string;
    value: string;
  };
  secondaryMetric?: {
    label: string;
    value: string;
  };
  assetId: string;
  actionUrl: string;
  timestamp?: string;
}

export interface TestimonialData {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  avatarAssetId?: string;
  avatarUrl?: string;
  verified: boolean;
  deltaMetric: string;
  deltaLabel: string;
  badgeLabel?: string;
  hue?: EnzymeHue;
}

export interface PlanData {
  id: string;
  name: string;
  tier: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  recommended?: boolean;
  hue?: EnzymeHue;
  stats: StatPair[];
  features: string[];
  ctaLabel: string;
  ctaAction?: () => void;
}

export interface PostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatarAssetId?: string;
    avatarUrl?: string;
  };
  assetId: string;
  stats?: StatPair[];
  hue?: EnzymeHue;
}

export interface CronEventData {
  id: string;
  title: string;
  subtitle: string;
  venue: string;
  address: string;
  month: string;
  day: string;
  weekday: string;
  time: string;
  assetId: string;
  hue?: EnzymeHue;
  tag?: string;
  status?: string;
}

export interface BenchmarkRowData {
  id: string;
  engineName: string;
  legacyValue: string;
  legacyLabel: string;
  catalystValue: string;
  catalystLabel: string;
  deltaImprovement: string;
  hue: EnzymeHue;
}

export interface StatMetricData {
  id: string;
  value: string;
  label: string;
  subLabel?: string;
  trend?: string;
  hue?: EnzymeHue;
  icon?: React.ReactNode;
}
