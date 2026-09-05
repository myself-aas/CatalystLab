/**
 * CatalystLab Framer-Grade Motion & Animation Tokens
 *
 * Defaults:
 * - Micro-hover states: 0.2s
 * - Layout & accordion expansions: 0.4s
 * - Framer Spring Curve: [0.16, 1, 0.3, 1]
 */

export const FRAMER_EASE = [0.16, 1, 0.3, 1] as const;

export const MOTION_TRANSITIONS = {
  micro: {
    duration: 0.2,
    ease: FRAMER_EASE,
  },
  layout: {
    duration: 0.4,
    ease: FRAMER_EASE,
  },
  accordion: {
    duration: 0.4,
    ease: FRAMER_EASE,
  },
  card: {
    duration: 0.2,
    ease: FRAMER_EASE,
  },
  spring: {
    type: 'spring',
    stiffness: 380,
    damping: 28,
  },
} as const;
