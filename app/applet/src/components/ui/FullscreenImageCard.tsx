import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowRight, Sparkles, Star, ShieldCheck } from 'lucide-react';

interface FullscreenImageCardProps {
  imageUrl: string;
  imageAlt?: string;
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  aspectRatio?: string;
  overlayStyle?: 'glass' | 'solid' | 'gradient';
}

export const FullscreenImageCard: React.FC<FullscreenImageCardProps> = ({
  imageUrl,
  imageAlt = 'Card background',
  badge,
  title,
  subtitle,
  description,
  footer,
  action,
  className,
  aspectRatio = 'h-[420px] w-full',
  overlayStyle = 'glass'
}) => {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
        aspectRatio,
        className
      )}
    >
      {/* Fullscreen Background Image with Smooth Hover Zoom */}
      <img
        src={imageUrl}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        referrerPolicy="no-referrer"
      />

      {/* Dynamic Overlay Gradient based on style */}
      {overlayStyle === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent backdrop-blur-[2px]" />
      )}
      {overlayStyle === 'solid' && (
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      )}
      {overlayStyle === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-slate-900/40 to-transparent" />
      )}

      {/* Dark gradient scrim overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-[5]"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
      />

      {/* Card Content Layout */}
      <div
        className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 z-10 text-white bg-gradient-to-t from-black/80 to-transparent"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
      >
        {/* Top Header / Badge / Actions */}
        <div className="flex items-center justify-between gap-2">
          {badge ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>{badge}</span>
            </div>
          ) : <div />}
          {action && (
            <div className="rounded-full bg-white/20 backdrop-blur-md p-2.5 border border-white/30 shadow-lg text-white group-hover:bg-white group-hover:text-slate-950 transition-all duration-300">
              {action}
            </div>
          )}
        </div>

        {/* Bottom Content Area */}
        <div className="space-y-3 transform transition-transform duration-300 group-hover:-translate-y-1">
          {subtitle && (
            <div className="text-xs font-mono uppercase tracking-widest text-white/80 font-bold drop-shadow">
              {subtitle}
            </div>
          )}
          
          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight drop-shadow-md">
            {title}
          </div>

          {description && (
            <div className="text-sm text-white/90 line-clamp-3 font-normal leading-relaxed drop-shadow">
              {description}
            </div>
          )}

          {footer && (
            <div className="pt-4 border-t border-white/20 flex items-center justify-between mt-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullscreenImageCard;
