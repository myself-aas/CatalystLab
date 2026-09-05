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
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      elementRef.current.style.setProperty('--spot-x', `${x}px`);
      elementRef.current.style.setProperty('--spot-y', `${y}px`);
      elementRef.current.style.setProperty('--mouse-x', `${x}px`);
      elementRef.current.style.setProperty('--mouse-y', `${y}px`);
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

/**
 * Lightweight inline mousemove handler that updates CSS variables on the card directly
 * without causing component re-renders.
 */
export function onSpotlightMouseMove(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  e.currentTarget.style.setProperty('--spot-x', `${x}px`);
  e.currentTarget.style.setProperty('--spot-y', `${y}px`);
  e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
}
