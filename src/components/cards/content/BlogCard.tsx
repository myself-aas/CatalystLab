import React from 'react';
import { Card } from '../primitives/Card';
import { CardMedia } from '../primitives/CardMedia';
import { CardChip } from '../primitives/CardChip';
import { CardTitle } from '../primitives/CardTitle';
import { CardSub } from '../primitives/CardSub';
import { CardStatRow } from '../primitives/CardStatRow';
import { PillCTA } from '../primitives/PillCTA';
import { FavoriteButton } from '../primitives/FavoriteButton';
import { EnzymeHue, StatPair } from '../types';
import { EdgeMeshGlobe } from '../../ui/edge-mesh-globe';
import { Clock, Calendar, Bookmark, BookmarkCheck, ArrowRight, Share2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BlogCardProps {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  author: {
    name: string;
    role?: string;
    avatarUrl?: string;
  };
  assetId?: string;
  imageUrl?: string;
  stats?: StatPair[];
  hue?: EnzymeHue;
  isBookmarked?: boolean;
  onBookmarkToggle?: (slug: string) => void;
  onShare?: (slug: string) => void;
  className?: string;
}

/**
 * BlogCard (R2-A Surface Variant)
 * Reference Anatomy: Light/tinted surface card, inset rounded media with ring border,
 * category + reading time chip, title + topic, description, 3-stat row separated by
 * vertical dividers (value over label), pill CTA + circular favorite/bookmark button.
 */
export const BlogCard: React.FC<BlogCardProps> = ({
  id,
  slug,
  title,
  excerpt,
  category,
  readTime,
  publishedAt,
  author,
  assetId = 'engine-neural-hologram',
  imageUrl,
  stats = [
    { label: 'Read Time', value: readTime || '4 min' },
    { label: 'Published', value: publishedAt || 'Today' },
    { label: 'Engine AST', value: 'v4.2', highlight: true },
  ],
  hue = 'edgevmax',
  isBookmarked = false,
  onBookmarkToggle,
  onShare,
  className,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(slug);
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/blog/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isEdgeArticle = hue === 'edgevmax' || 
    category.toLowerCase().includes('edge') || 
    category.toLowerCase().includes('latency') ||
    title.toLowerCase().includes('ttfb') ||
    title.toLowerCase().includes('anycast') ||
    slug.includes('edge') ||
    slug.includes('latency');

  return (
    <Card
      variant="surface"
      hue={hue}
      lift={true}
      className={className}
    >
      {/* Inset Rounded Media with subtle ring border (R2-A Signature) */}
      <div className="p-3 pb-0">
        <div className="relative rounded-xl overflow-hidden ring-1 ring-slate-700/50 shadow-inner bg-slate-950 flex items-center justify-center h-44 sm:h-48">
          {isEdgeArticle ? (
            <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
              <EdgeMeshGlobe
                variant="thumb"
                interactive={false}
                autoSpin={false}
                showInspector={false}
                showChips={false}
                showControls={false}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />
            </div>
          ) : (
            <CardMedia
              assetId={assetId}
              src={imageUrl}
              alt={title}
              aspect="16/9"
              scrim="none"
              enableHoverZoom={true}
              className="w-full h-44 sm:h-48"
            />
          )}

          {/* Floating Category Chip Left */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <CardChip
              variant="glass"
              hue={hue}
              label={category}
              className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 shadow-md"
            />
          </div>

          {/* Floating Share / Bookmark Buttons Right */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShareClick}
              title="Share article link"
              aria-label="Share article"
              className="relative before:absolute before:-inset-2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 text-slate-200 border border-white/20 flex items-center justify-center backdrop-blur-md transition-all shadow-sm cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-200" />}
            </button>

            <FavoriteButton
              isFavorite={isBookmarked}
              onToggle={() => onBookmarkToggle?.(slug)}
              ariaLabel={isBookmarked ? 'Remove saved bookmark' : 'Bookmark article'}
              className="relative before:absolute before:-inset-2 w-8 h-8"
            />
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata Byline */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>{publishedAt}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{readTime}</span>
            </span>
            {author.name && (
              <>
                <span className="text-slate-600">•</span>
                <span className="truncate text-slate-400">By {author.name}</span>
              </>
            )}
          </div>

          {/* Title */}
          <Link to={`/blog/${slug}`} className="group/title block">
            <CardTitle
              as="h3"
              className="text-base sm:text-lg font-bold text-white group-hover/title:text-cyan-400 transition-colors line-clamp-2 leading-snug"
            >
              {title}
            </CardTitle>
          </Link>

          {/* Excerpt */}
          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
            {excerpt}
          </p>
        </div>

        {/* 3-Stat Row with Vertical Dividers (R2-A Specification) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <CardStatRow
            stats={stats}
            layout="inline-dividers"
            size="sm"
            className="mb-4"
          />

          {/* Actions: Pill CTA with Circular Magnetic Arrow */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Link to={`/blog/${slug}`} className="w-full">
              <PillCTA
                variant="full-width"
                hue={hue}
                hasCircularArrow={true}
                label="Read Research Note"
                className="w-full text-xs font-mono font-bold justify-between"
              />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
