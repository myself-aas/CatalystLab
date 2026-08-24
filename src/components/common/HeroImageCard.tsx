import React from 'react';

export interface HeroImageCardProps {
  imageUrl: string;
  imageAlt?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  metadata?: React.ReactNode;
  footer?: React.ReactNode;
  topRight?: React.ReactNode;
  
  /** 
   * Visual style of the overlay gradient
   * 'glass': Frosted glass bottom blur (like NASA card)
   * 'solid': Smooth solid color gradient (like Knitting card)
   */
  overlayStyle?: 'glass' | 'solid';
  
  /**
   * Classes for the bottom gradient.
   * For 'solid', use e.g., 'from-teal-800 via-teal-800/80'.
   * Defaults to 'from-slate-950 via-slate-900/80'
   */
  bottomGradientClasses?: string;
  
  aspectRatio?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function HeroImageCard({
  imageUrl,
  imageAlt = '',
  title,
  subtitle,
  description,
  badge,
  action,
  metadata,
  footer,
  topRight,
  overlayStyle = 'glass',
  bottomGradientClasses = 'from-slate-950 via-slate-900/80',
  aspectRatio = 'aspect-[4/5]',
  className = '',
  onClick,
}: HeroImageCardProps) {
  const Component = onClick ? 'button' : 'div';
  const interactiveProps = onClick ? { onClick, type: 'button' as const } : {};

  return (
    <Component
      {...interactiveProps}
      className={`group relative w-full overflow-hidden rounded-2xl md:rounded-[2rem] text-left transition-transform duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''} ${aspectRatio} ${className}`}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 bg-slate-100">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Top Shadow for header legibility */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      {/* Bottom Overlays */}
      {overlayStyle === 'glass' ? (
        <>
          {/* Dark base for contrast under blur */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
          {/* Frosted Glass Mask */}
          <div 
            className="absolute inset-x-0 bottom-0 h-[50%] backdrop-blur-md pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to top, black 60%, transparent 100%)',
              maskImage: 'linear-gradient(to top, black 60%, transparent 100%)'
            }}
          />
        </>
      ) : (
        /* Solid Gradient */
        <div className={`absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t ${bottomGradientClasses} to-transparent pointer-events-none opacity-95`} />
      )}

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-6 lg:p-8 z-10">
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div>{badge}</div>
          <div>{topRight}</div>
        </div>

        {/* Bottom Content */}
        <div className="mt-auto flex flex-col">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            {/* Main Text Area */}
            <div className="flex-1">
              {title}
              {subtitle && <div className="mt-1">{subtitle}</div>}
              {description && <div className="mt-2">{description}</div>}
            </div>

            {/* Action / Metadata Area */}
            {(metadata || action) && (
              <div className="shrink-0 flex items-center md:items-end gap-4 mt-4 md:mt-0">
                {metadata}
                {action}
              </div>
            )}
          </div>

          {/* Footer Area */}
          {footer && (
            <div className="mt-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Component>
  );
}
