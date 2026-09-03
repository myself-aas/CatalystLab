import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonText } from './SkeletonText';

export const DomainReportSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-background pb-24 text-foreground font-mono"
      role="status"
      aria-busy="true"
      aria-label="Synthesizing Domain Telemetry Report..."
    >
      <span className="sr-only">Synthesizing Domain Telemetry Report...</span>

      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-border bg-muted/60 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Breadcrumb row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-xs" />
              <Skeleton className="h-4 w-28 rounded-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>

          {/* Domain Title & Grade Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton variant="pill" className="h-6 w-36" />
                <Skeleton variant="pill" className="h-6 w-24" />
              </div>
              <Skeleton className="h-10 sm:h-14 w-80 sm:w-96 rounded-xl" />
              <Skeleton className="h-4 w-64 rounded-xs" />
            </div>

            {/* Big Score Gauge Skeleton */}
            <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 shadow-xs shrink-0">
              <Skeleton variant="circle" className="h-16 w-16" />
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-3.5 w-28 rounded-xs opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* 4 KPI Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded-xs" />
                <Skeleton className="h-6 w-6 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-xs opacity-60" />
            </div>
          ))}
        </div>

        {/* Two-Column Telemetry Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Radar Chart & Vitals Table (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Radar Benchmark Box */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <Skeleton className="h-5 w-40 rounded-sm" />
                <Skeleton variant="pill" className="h-5 w-16" />
              </div>
              <div className="flex items-center justify-center py-6">
                <Skeleton variant="circle" className="h-56 w-56 opacity-80" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Skeleton className="h-4 w-full rounded-xs" />
                <Skeleton className="h-4 w-full rounded-xs" />
              </div>
            </div>

            {/* Core Web Vitals Box */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <Skeleton className="h-5 w-36 rounded-sm" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-20 rounded-xs" />
                      <Skeleton className="h-2.5 w-28 rounded-xs opacity-60" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 8 Diagnostic Engine Dossiers (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <Skeleton className="h-5 w-48 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-xs" />
            </div>

            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36 rounded-xs" />
                      <Skeleton className="h-3 w-48 rounded-xs opacity-60" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton variant="pill" className="h-6 w-14" />
                    <Skeleton className="h-6 w-6 rounded-md" />
                  </div>
                </div>

                {i === 0 && (
                  <div className="pt-3 border-t border-border/60 space-y-2.5">
                    <SkeletonText lines={2} lastLineWidth="w-4/5" gap="xs" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton variant="pill" className="h-5 w-20" />
                      <Skeleton variant="pill" className="h-5 w-24" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
