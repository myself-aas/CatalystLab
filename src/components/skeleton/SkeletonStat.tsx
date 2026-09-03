import React from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';

export interface SkeletonStatProps {
  className?: string;
  hasIcon?: boolean;
  hasBadge?: boolean;
}

export const SkeletonStat: React.FC<SkeletonStatProps> = ({
  className,
  hasIcon = true,
  hasBadge = true,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-xs font-mono',
        className
      )}
      role="status"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {hasIcon && <Skeleton className="h-8 w-8 rounded-xl" />}
          <Skeleton className="h-4 w-24 rounded-sm" />
        </div>
        {hasBadge && <Skeleton variant="pill" className="h-5 w-14" />}
      </div>

      <div className="mt-2 space-y-2">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-3 w-40 rounded-sm opacity-70" />
      </div>
    </div>
  );
};
