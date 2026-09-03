import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonStat } from './SkeletonStat';
import { SkeletonCard } from './SkeletonCard';

export const UserDashboardSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-background pb-24 text-foreground font-mono"
      role="status"
      aria-busy="true"
      aria-label="Synchronizing user telemetry..."
    >
      <span className="sr-only">Synchronizing user telemetry...</span>

      {/* Hero Welcome Header */}
      <section className="relative overflow-hidden border-b border-border bg-muted/60 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton variant="pill" className="h-6 w-32" />
                <Skeleton variant="pill" className="h-6 w-20" />
              </div>
              <Skeleton className="h-8 sm:h-10 w-72 sm:w-96 rounded-xl" />
              <Skeleton className="h-4 w-60 rounded-xs" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* KPI Row (4 Stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>

        {/* Audit Dossier Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 w-full sm:w-80">
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </div>

        {/* Reports Grid Placeholder (6 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
};
