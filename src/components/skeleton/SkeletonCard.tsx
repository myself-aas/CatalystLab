import React from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';
import { SkeletonText } from './SkeletonText';

export interface SkeletonCardProps {
  className?: string;
  hasMedia?: boolean;
  hasBadge?: boolean;
  hasFooter?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  hasMedia = false,
  hasBadge = true,
  hasFooter = true,
  lines = 2,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between font-mono',
        className
      )}
      role="status"
      aria-hidden="true"
    >
      <div className="space-y-4">
        {hasMedia && (
          <Skeleton className="aspect-video w-full rounded-xl" />
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-4 w-28 rounded-sm" />
          </div>
          {hasBadge && <Skeleton variant="pill" className="h-5 w-16" />}
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-4/5 rounded-md" />
          <SkeletonText lines={lines} lastLineWidth="w-3/5" gap="xs" />
        </div>
      </div>

      {hasFooter && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
          <Skeleton className="h-3 w-20 rounded-xs" />
          <Skeleton className="h-4 w-24 rounded-sm" />
        </div>
      )}
    </div>
  );
};
