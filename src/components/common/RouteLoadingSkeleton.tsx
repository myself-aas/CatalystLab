import React from 'react';
import { Skeleton, SkeletonCard, SkeletonStat } from '../skeleton';

export const RouteLoadingSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-background pb-24 text-foreground font-mono"
      role="status"
      aria-busy="true"
      aria-label="Loading page..."
    >
      <span className="sr-only">Loading page...</span>

      {/* Top Bar Skeleton */}
      <div className="border-b border-border bg-muted/60 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-xs" />
            <Skeleton className="h-4 w-36 rounded-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Hero Banner Skeleton */}
      <section className="border-b border-border bg-muted/30 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <Skeleton variant="pill" className="h-6 w-36" />
            <Skeleton variant="pill" className="h-6 w-24" />
          </div>
          <Skeleton className="h-10 sm:h-12 w-3/4 max-w-xl mx-auto sm:mx-0 rounded-xl" />
          <Skeleton className="h-4 sm:h-5 w-full max-w-2xl mx-auto sm:mx-0 rounded-sm opacity-70" />
          <Skeleton className="h-4 sm:h-5 w-4/5 max-w-xl mx-auto sm:mx-0 rounded-sm opacity-70" />
        </div>
      </section>

      {/* Main Workspace Skeleton */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* KPI / Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>

        {/* 3-Column Card Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </main>
    </div>
  );
};
