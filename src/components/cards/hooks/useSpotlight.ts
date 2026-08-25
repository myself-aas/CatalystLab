import { useState, useRef, useCallback } from 'react';
import { useCardReducedMotion } from './useCardReducedMotion';

export interface UseSpotlightOptions {
  enabled?: boolean;
  radius?: number;
}

export function useSpotlight<T extends HTMLElement = HTMLElement>(
  options: UseSpotlightOptions = {}
) {
  const { enabled = true } = options;
  const prefersReducedMotion = useCardReducedMotion();
  const elementRef = useRef<T | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T> | MouseEvent) => {
      if (!enabled || prefersReducedMotion || !elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      elementRef.current.style.setProperty('--spot-x', `${Math.round(x)}px`);
      elementRef.current.style.setProperty('--spot-y', `${Math.round(y)}px`);
    },
    [enabled, prefersReducedMotion]
  );

  const handleMouseEnter = useCallback(() => {
    if (!enabled || prefersReducedMotion) return;
    setIsHovered(true);
  }, [enabled, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    ref: elementRef,
    isHovered,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    props: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}
