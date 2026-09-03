import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'rounded' | 'circle' | 'pill';
  shimmer?: boolean;
}

/**
 * Foundational accessible Skeleton component.
 * Provides a theme-aware pulse loading placeholder with WCAG contrast
 * across both light and dark mode surfaces.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  shimmer = false,
  ...props
}) => {
  const variantStyles = {
    default: 'rounded-md',
    rounded: 'rounded-xl',
    circle: 'rounded-full',
    pill: 'rounded-full',
  }[variant];

  return (
    <div
      role="status"
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-foreground/[0.08] dark:bg-foreground/[0.12]',
        variantStyles,
        shimmer &&
          'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
        className
      )}
      {...props}
    />
  );
};
