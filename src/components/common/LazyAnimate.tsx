import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';

interface LazyRevealProps extends HTMLMotionProps<'div'> {
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  children: React.ReactNode;
  once?: boolean;
}

export const LazyReveal: React.FC<LazyRevealProps> = ({
  direction = 'up',
  delay = 0,
  duration = 0.45,
  distance = 24,
  className = '',
  children,
  once = true,
  ...rest
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance };
      case 'down':
        return { opacity: 0, y: -distance };
      case 'left':
        return { opacity: 0, x: distance };
      case 'right':
        return { opacity: 0, x: -distance };
      case 'scale':
        return { opacity: 0, scale: 0.95, y: 10 };
      case 'fade':
      default:
        return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Natural custom smooth cubic-bezier
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

interface LazyStaggerContainerProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  children: React.ReactNode;
  once?: boolean;
}

export const LazyStaggerContainer: React.FC<LazyStaggerContainerProps> = ({
  staggerDelay = 0.08,
  delayChildren = 0.05,
  className = '',
  children,
  once = true,
  ...rest
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export const LazyStaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
}> = ({ children, className = '', direction = 'up', distance = 20 }) => {
  const getHidden = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance };
      case 'down':
        return { opacity: 0, y: -distance };
      case 'left':
        return { opacity: 0, x: distance };
      case 'right':
        return { opacity: 0, x: -distance };
      case 'scale':
        return { opacity: 0, scale: 0.94 };
      default:
        return { opacity: 0, y: distance };
    }
  };

  return (
    <motion.div
      variants={{
        hidden: getHidden(),
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const LazyCard: React.FC<
  LazyRevealProps & {
    hoverEffect?: boolean;
  }
> = ({
  children,
  className = '',
  hoverEffect = true,
  direction = 'up',
  delay = 0,
  ...props
}) => {
  return (
    <LazyReveal
      direction={direction}
      delay={delay}
      className={`transition-shadow ${className}`}
      {...props}
    >
      <motion.div
        whileHover={
          hoverEffect
            ? {
                y: -4,
                scale: 1.006,
                transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
              }
            : undefined
        }
        whileTap={
          hoverEffect
            ? {
                scale: 0.99,
                transition: { duration: 0.1 },
              }
            : undefined
        }
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </LazyReveal>
  );
};

export const LazyShimmer: React.FC<{
  className?: string;
  lines?: number;
}> = ({ className = 'h-24 w-full rounded-xl', lines = 1 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`relative overflow-hidden bg-[#e2e8f0] ${className}`}
        >
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
            animate={{
              translateX: ['100%', '-100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
          />
        </div>
      ))}
    </div>
  );
};
