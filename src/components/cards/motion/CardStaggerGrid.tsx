import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCardReducedMotion } from '../hooks/useCardReducedMotion';

export interface CardStaggerGridProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 'auto';
  once?: boolean;
}

export const CardStaggerGrid: React.FC<CardStaggerGridProps> = ({
  children,
  staggerDelay = 0.06,
  delayChildren = 0.04,
  className = '',
  columns = 'auto',
  once = true,
  ...props
}) => {
  const prefersReducedMotion = useCardReducedMotion();

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    auto: '',
  }[columns];

  if (prefersReducedMotion) {
    return (
      <div className={twMerge(clsx('grid gap-6', columnClasses, className))}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={twMerge(clsx('grid gap-6', columnClasses, className))}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export interface CardStaggerItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}

export const CardStaggerItem: React.FC<CardStaggerItemProps> = ({
  children,
  className = '',
  distance = 18,
  ...props
}) => {
  const prefersReducedMotion = useCardReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: distance,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.38,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
