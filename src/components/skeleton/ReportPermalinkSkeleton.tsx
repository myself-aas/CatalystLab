import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonText } from './SkeletonText';

export const ReportPermalinkSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-background pb-20 text-foreground font-mono"
      role="status"
      aria-busy="true"
      aria-label="Retrieving immutable audit dossier from Firestore..."
    >
      <span className="sr-only">Retrieving immutable audit dossier from Firestore...</span>

      {/* Top Bar Navigation */}
      <section className="border-b border-border bg-muted/60 px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-xs" />
            <Skeleton className="h-4 w-32 rounded-xs" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="hidden sm:block h-8 w-18 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Report Header Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton variant="pill" className="h-5 w-24" />
                  <Skeleton className="h-3 w-32 rounded-xs opacity-60" />
                </div>
                <Skeleton className="h-6 sm:h-7 w-64 sm:w-80 rounded-md" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right space-y-1 hidden sm:block">
                <Skeleton className="h-3 w-16 rounded-xs ml-auto" />
                <Skeleton className="h-4 w-20 rounded-xs ml-auto" />
              </div>
              <Skeleton variant="pill" className="h-12 w-24 rounded-xl" />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/50 border border-border/50 space-y-1.5">
                <Skeleton className="h-3 w-16 rounded-xs opacity-60" />
                <Skeleton className="h-5 w-20 rounded-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Output / Terminal Card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-xs" />
              <Skeleton className="h-4 w-40 rounded-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
          </div>

          <div className="p-6 space-y-4">
            <SkeletonText lines={5} lastLineWidth="w-2/3" gap="sm" lineClassName="h-3.5" />
            <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-2">
              <Skeleton className="h-3 w-3/4 rounded-xs" />
              <Skeleton className="h-3 w-1/2 rounded-xs" />
            </div>
            <SkeletonText lines={4} lastLineWidth="w-1/2" gap="sm" lineClassName="h-3.5" />
          </div>
        </div>
      </main>
    </div>
  );
};
