import { useState, useRef, useEffect, useCallback } from 'react';
import { useCardReducedMotion } from './useCardReducedMotion';

export interface UseCarouselActiveIndexOptions {
  itemSelector?: string;
  threshold?: number;
  initialIndex?: number;
  onActiveChange?: (index: number) => void;
}

export function useCarouselActiveIndex<T extends HTMLElement = HTMLElement>(
  options: UseCarouselActiveIndexOptions = {}
) {
  const {
    itemSelector = '[data-carousel-item]',
    threshold = 0.6,
    initialIndex = 0,
    onActiveChange,
  } = options;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<T | null>(null);
  const prefersReducedMotion = useCardReducedMotion();

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const container = containerRef.current;
      if (!container) return;

      const items = container.querySelectorAll(itemSelector);
      if (index >= 0 && index < items.length) {
        const item = items[index] as HTMLElement;
        const scrollLeft = item.offsetLeft - (container.clientWidth - item.clientWidth) / 2;
        container.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: prefersReducedMotion ? 'auto' : behavior,
        });
        setActiveIndex(index);
        onActiveChange?.(index);
      }
    },
    [itemSelector, onActiveChange, prefersReducedMotion]
  );

  const scrollNext = useCallback(() => {
    scrollToIndex(activeIndex + 1);
  }, [activeIndex, scrollToIndex]);

  const scrollPrev = useCallback(() => {
    scrollToIndex(activeIndex - 1);
  }, [activeIndex, scrollToIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(items).indexOf(entry.target);
            if (index !== -1) {
              setActiveIndex(index);
              onActiveChange?.(index);
            }
          }
        });
      },
      {
        root: container,
        threshold,
      }
    );

    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [itemSelector, onActiveChange, threshold]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<T>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    },
    [scrollNext, scrollPrev]
  );

  return {
    containerRef,
    activeIndex,
    scrollToIndex,
    scrollNext,
    scrollPrev,
    handleKeyDown,
    props: {
      onKeyDown: handleKeyDown,
      tabIndex: 0,
    },
  };
}
