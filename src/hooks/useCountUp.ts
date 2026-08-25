import { useState, useEffect, useRef } from 'react';

export interface UseCountUpOptions {
  start?: number;
  end: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  autoStartOnInView?: boolean;
}

export function useCountUp({
  start = 0,
  end,
  durationMs = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  autoStartOnInView = true,
}: UseCountUpOptions) {
  const [value, setValue] = useState(autoStartOnInView ? start : end);
  const [hasStarted, setHasStarted] = useState(!autoStartOnInView);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!autoStartOnInView) {
      setHasStarted(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [autoStartOnInView]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;

      setValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, start, end, durationMs]);

  const formattedValue = `${prefix}${value.toFixed(decimals)}${suffix}`;

  return {
    ref,
    value,
    formattedValue,
    hasStarted,
  };
}
