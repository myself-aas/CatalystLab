import React from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  lastLineWidth?: string;
  variant?: 'heading' | 'subheading' | 'body' | 'caption';
}

const LINE_WIDTHS = ['w-full', 'w-[94%]', 'w-[88%]', 'w-[92%]', 'w-[84%]'];

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
  lineClassName,
  gap = 'sm',
  lastLineWidth = 'w-3/5',
  variant = 'body',
}) => {
  const gapClasses = {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4',
  }[gap];

  const heightClasses = {
    heading: 'h-8 sm:h-9 rounded-lg',
    subheading: 'h-6 rounded-md',
    body: 'h-4 rounded-sm',
    caption: 'h-3 rounded-xs',
  }[variant];

  return (
    <div className={cn(gapClasses, className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1;
        const widthClass = isLast
          ? lastLineWidth
          : LINE_WIDTHS[index % LINE_WIDTHS.length];

        return (
          <Skeleton
            key={index}
            className={cn(heightClasses, widthClass, lineClassName)}
          />
        );
      })}
    </div>
  );
};
