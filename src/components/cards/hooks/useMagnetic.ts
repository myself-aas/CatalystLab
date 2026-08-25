import { useState, useRef, useCallback } from 'react';
import { useCardReducedMotion } from './useCardReducedMotion';

export interface UseMagneticOptions {
  maxDistance?: number;
  damping?: number;
  enabled?: boolean;
}

export function useMagnetic<T extends HTMLElement = HTMLElement>(
  options: UseMagneticOptions = {}
) {
  const { maxDistance = 6, damping = 0.25, enabled = true } = options;
  const prefersReducedMotion = useCardReducedMotion();
  const elementRef = useRef<T | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (!enabled || prefersReducedMotion || !elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * damping;
      const deltaY = (e.clientY - centerY) * damping;

      // Clamp displacement to maxDistance
      const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
      const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

      setPosition({ x: clampedX, y: clampedY });
    },
    [damping, enabled, maxDistance, prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  const style: React.CSSProperties = prefersReducedMotion
    ? {}
    : {
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: position.x === 0 && position.y === 0
          ? 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
          : 'transform 0.08s linear',
      };

  return {
    ref: elementRef,
    position,
    style,
    handleMouseMove,
    handleMouseLeave,
    props: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}
