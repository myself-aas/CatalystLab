import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonStat } from './SkeletonStat';
import { SkeletonTable } from './SkeletonTable';

export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-background pb-24 text-foreground font-mono"
      role="status"
      aria-busy="true"
      aria-label="Verifying superadmin authorization..."
    >
      <span className="sr-only">Verifying superadmin authorization...</span>

      {/* Admin Top Header */}
      <header className="border-b border-border bg-muted/60 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton variant="pill" className="h-6 w-36" />
                <Skeleton variant="pill" className="h-6 w-24" />
              </div>
              <Skeleton className="h-8 sm:h-9 w-64 sm:w-80 rounded-xl" />
              <Skeleton className="h-4 w-52 rounded-xs opacity-70" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>

          {/* Tab Navigation Pill Row */}
          <div className="flex items-center gap-2 pt-6 overflow-x-auto no-scrollbar">
            <Skeleton variant="pill" className="h-9 w-36" />
            <Skeleton variant="pill" className="h-9 w-32" />
            <Skeleton variant="pill" className="h-9 w-36" />
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>

        {/* Management / Data Table Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44 rounded-sm" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <SkeletonTable rows={5} columns={4} />
        </div>
      </main>
    </div>
  );
};
