import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonText } from './SkeletonText';

export const BlogPostSkeleton: React.FC = () => {
  return (
    <article
      className="min-h-screen bg-background pb-24 text-foreground font-mono"
      role="status"
      aria-busy="true"
      aria-label="Loading technical briefing..."
    >
      <span className="sr-only">Loading technical briefing...</span>

      {/* Top Breadcrumb / Action Bar */}
      <section className="border-b border-border bg-muted/60 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-xs" />
            <Skeleton className="h-4 w-32 rounded-xs" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </section>

      {/* Article Header & Metadata */}
      <header className="mx-auto max-w-4xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {/* Badge & Meta Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton variant="pill" className="h-6 w-28" />
            <Skeleton variant="pill" className="h-6 w-20" />
            <Skeleton variant="pill" className="h-6 w-24" />
          </div>

          {/* Article Title */}
          <div className="space-y-3 pt-2">
            <Skeleton className="h-9 sm:h-12 w-11/12 rounded-xl" />
            <Skeleton className="h-9 sm:h-12 w-4/5 rounded-xl" />
          </div>

          {/* Excerpt / Deck */}
          <div className="pt-2">
            <SkeletonText lines={2} lastLineWidth="w-3/4" gap="sm" lineClassName="h-5" />
          </div>

          {/* Author Strip */}
          <div className="flex items-center justify-between border-y border-border py-4 mt-6">
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="h-11 w-11" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 rounded-xs" />
                <Skeleton className="h-3 w-24 rounded-xs opacity-70" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Featured Cover Asset Skeleton */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-10">
        <Skeleton className="aspect-[21/9] w-full rounded-2xl border border-border" />
      </div>

      {/* Main Body Content Skeletons */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
        {/* Paragraph Block 1 */}
        <div className="space-y-3">
          <SkeletonText lines={4} lastLineWidth="w-4/5" gap="sm" />
        </div>

        {/* Section Heading 1 */}
        <div className="pt-4 space-y-2">
          <Skeleton className="h-7 w-64 rounded-md" />
          <SkeletonText lines={3} lastLineWidth="w-2/3" gap="sm" />
        </div>

        {/* Code / Telemetry Callout Box Skeleton */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <Skeleton className="h-4 w-36 rounded-xs" />
            <Skeleton className="h-4 w-16 rounded-xs" />
          </div>
          <Skeleton className="h-4 w-full rounded-xs font-mono" />
          <Skeleton className="h-4 w-5/6 rounded-xs font-mono" />
          <Skeleton className="h-4 w-2/3 rounded-xs font-mono" />
          <Skeleton className="h-4 w-3/4 rounded-xs font-mono" />
        </div>

        {/* Paragraph Block 2 */}
        <div className="space-y-3">
          <SkeletonText lines={4} lastLineWidth="w-3/5" gap="sm" />
        </div>

        {/* Visual Benchmark Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-3 w-20 rounded-xs" />
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-2.5 w-24 rounded-xs opacity-60" />
            </div>
          ))}
        </div>

        {/* Paragraph Block 3 */}
        <div className="space-y-3 pt-2">
          <SkeletonText lines={3} lastLineWidth="w-1/2" gap="sm" />
        </div>
      </main>
    </article>
  );
};
