import React, { useRef, useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCarouselActiveIndex } from '../hooks/useCarouselActiveIndex';

export interface CatalystCarouselRailProps {
  children: React.ReactNode;
  activeId?: string;
  onActiveChange?: (index: number) => void;
  className?: string;
}

/**
 * CatalystCarouselRail — R3 Horizontal Scroll-Snap Container with Edge Fade Masks & Keyboard Navigation
 * Reference: R3 Destination Strip rail architecture with active card lift
 */
export const CatalystCarouselRail: React.FC<CatalystCarouselRailProps> = ({
  children,
  activeId,
  onActiveChange,
  className,
}) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const {
    containerRef,
    activeIndex,
    scrollToIndex,
    scrollNext,
    scrollPrev,
    handleKeyDown,
  } = useCarouselActiveIndex<HTMLDivElement>({
    itemSelector: '[data-carousel-item], article, .snap-start',
    threshold: 0.6,
    onActiveChange,
  });

  const checkScrollBounds = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, [containerRef]);

  useEffect(() => {
    const rail = containerRef.current;
    if (!rail) return;

    rail.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);
    checkScrollBounds();

    return () => {
      rail.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [checkScrollBounds, containerRef]);

  return (
    <div
      className={twMerge(clsx('relative w-full group/rail', className))}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="CatalystLab Engine Carousel"
    >
      {/* Edge Fade Masks */}
      <div
        aria-hidden="true"
        className={clsx(
          'absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#060911] to-transparent pointer-events-none z-20 transition-opacity duration-300',
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        aria-hidden="true"
        className={clsx(
          'absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#060911] to-transparent pointer-events-none z-20 transition-opacity duration-300',
          canScrollRight ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Nav Controls */}
      <div className="flex items-center justify-between gap-2 mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            Active: #{activeIndex + 1} • Scroll or use ← → arrow keys
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollLeft}
            aria-label="Previous engine"
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
              canScrollLeft
                ? 'bg-primary text-primary-foreground border-border hover:bg-primary-hover hover:border-border cursor-pointer shadow-sm'
                : 'bg-foreground/60 text-muted-foreground border-border/60 cursor-not-allowed opacity-40'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollRight}
            aria-label="Next engine"
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
              canScrollRight
                ? 'bg-primary text-primary-foreground border-border hover:bg-primary-hover hover:border-border cursor-pointer shadow-sm'
                : 'bg-foreground/60 text-muted-foreground border-border/60 cursor-not-allowed opacity-40'
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Snap Scrollable Horizontal Container */}
      <div
        ref={containerRef}
        className="w-full flex items-center gap-5 overflow-x-auto snap-x snap-mandatory py-6 px-4 no-scrollbar scroll-smooth focus-visible:outline-none"
      >
        {children}
      </div>
    </div>
  );
};

