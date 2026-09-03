import React from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';
import { SkeletonText } from './SkeletonText';

export interface BlogCardSkeletonProps {
  className?: string;
}

export const BlogCardSkeleton: React.FC<BlogCardSkeletonProps> = ({ className }) => {
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
        {/* Cover / Media Thumbnail Skeleton */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden">
          <Skeleton className="h-full w-full rounded-xl" />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <Skeleton variant="pill" className="h-5 w-20 bg-background/80" />
            <Skeleton variant="pill" className="h-5 w-16 bg-background/80" />
          </div>
        </div>

        {/* Title & Topic */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-11/12 rounded-md" />
          <Skeleton className="h-6 w-3/4 rounded-md" />
        </div>

        {/* Excerpt */}
        <SkeletonText lines={2} lastLineWidth="w-4/5" gap="xs" />

        {/* 3-Stat Divider Row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-4 w-12 mx-auto rounded-xs" />
              <Skeleton className="h-2.5 w-14 mx-auto rounded-xs opacity-60" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Pill CTA + Favorite Button */}
      <div className="flex items-center justify-between pt-4 mt-2">
        <div className="flex items-center gap-2">
          <Skeleton variant="circle" className="h-7 w-7" />
          <Skeleton className="h-3 w-20 rounded-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="pill" className="h-8 w-24" />
          <Skeleton variant="circle" className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};
