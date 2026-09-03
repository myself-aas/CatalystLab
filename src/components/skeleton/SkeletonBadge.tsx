import React from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';

export interface SkeletonBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SkeletonBadge: React.FC<SkeletonBadgeProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-16 text-[10px]',
    md: 'h-6 w-24 text-xs',
    lg: 'h-7 w-28 text-sm',
  }[size];

  return (
    <Skeleton
      variant="pill"
      className={cn(sizeClasses, 'border border-border/40', className)}
    />
  );
};

export interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg' | 'icon';
  variant?: 'pill' | 'rounded';
  className?: string;
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  size = 'md',
  variant = 'rounded',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-9 w-28',
    lg: 'h-11 w-36',
    icon: 'h-9 w-9',
  }[size];

  return (
    <Skeleton
      variant={variant === 'pill' ? 'pill' : 'rounded'}
      className={cn(sizeClasses, 'border border-border/30', className)}
    />
  );
};
