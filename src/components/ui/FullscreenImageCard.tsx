import React from 'react';
import { cn } from '../../lib/utils';

export interface FullscreenImageCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  score?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  imageUrl?: string;
  imageAlt?: string;
  overlay?: boolean;
}

export const FullscreenImageCard: React.FC<FullscreenImageCardProps> = ({
  title,
  subtitle,
  badge,
  score,
  action,
  children,
  className,
  imageUrl = 'https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  imageAlt = 'Card image',
  overlay = true,
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[2rem] border border-border/40 shadow-xl transition-all duration-300 hover:shadow-2xl min-h-[380px] flex flex-col justify-between text-primary-foreground',
        className
      )}
    >
      {/* Background Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover object-center"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}

      {/* Overlay Layers */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-tr from-background/90 via-background/40 to-transparent" />
      )}

      {/* Dark gradient scrim overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-[5]"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
      />

      {/* Card Content Layout */}
      <div
        className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 z-10 text-primary-foreground bg-gradient-to-t from-black/80 to-transparent"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
      >
        {/* Top Header / Badge / Actions */}
        <div className="flex items-center justify-between gap-2">
          {badge ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/20 backdrop-blur-md border border-white/30 text-xs font-mono font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
              {badge}
            </span>
          ) : (
            <div />
          )}

          {score && (
            <div className="px-3 py-1 rounded-full bg-foreground/40 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-primary-foreground shadow-sm">
              {score}
            </div>
          )}
        </div>

        {/* Middle / Bottom Content */}
        <div className="space-y-2 mt-auto">
          {subtitle && (
            <div className="text-xs font-mono uppercase tracking-widest text-primary-foreground/80 font-bold">
              {subtitle}
            </div>
          )}
          <div className="text-2xl font-bold tracking-tight text-primary-foreground">{title}</div>
          {children && <div className="text-sm text-primary-foreground/90 leading-relaxed pt-1">{children}</div>}

          {action && <div className="pt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
};

export default FullscreenImageCard;
