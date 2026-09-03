import React from 'react';
import { Skeleton } from './Skeleton';

export const BlogEditorSkeleton: React.FC = () => {
  return (
    <div
      className="space-y-5"
      role="status"
      aria-busy="true"
      aria-label="Loading article..."
    >
      <span className="sr-only">Loading article...</span>

      {/* Post Title Input Skeleton */}
      <Skeleton className="h-12 w-3/4 rounded-xl" />

      {/* Excerpt Textarea Skeleton */}
      <Skeleton className="h-20 w-full rounded-xl border border-border" />

      {/* Dropdown Selects Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16 rounded-xs" />
          <Skeleton className="h-10 w-full rounded-xl border border-border" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16 rounded-xs" />
          <Skeleton className="h-10 w-full rounded-xl border border-border" />
        </div>
      </div>

      {/* Tags Input Skeleton */}
      <div className="space-y-1">
        <Skeleton className="h-3 w-28 rounded-xs" />
        <Skeleton className="h-10 w-full rounded-xl border border-border" />
      </div>

      {/* Content Editor Canvas Skeleton */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24 rounded-xs" />
          <Skeleton className="h-3 w-32 rounded-xs" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl border border-border" />
      </div>
    </div>
  );
};
