import React from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  hasHeader?: boolean;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className,
  hasHeader = true,
}) => {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-border bg-card shadow-xs overflow-hidden font-mono',
        className
      )}
      role="status"
      aria-hidden="true"
    >
      {hasHeader && (
        <div className="flex items-center gap-4 border-b border-border bg-muted/60 px-5 py-3.5">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1',
                i === 0 && 'flex-[1.5]',
                i === columns - 1 && 'flex-[0.8] justify-end flex'
              )}
            >
              <Skeleton className="h-3.5 w-20 rounded-xs" />
            </div>
          ))}
        </div>
      )}

      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="flex items-center gap-4 px-5 py-4 transition-colors"
          >
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={cn(
                  'flex-1 flex items-center gap-2',
                  cIdx === 0 && 'flex-[1.5]',
                  cIdx === columns - 1 && 'flex-[0.8] justify-end'
                )}
              >
                {cIdx === 0 ? (
                  <>
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4 rounded-xs" />
                      <Skeleton className="h-3 w-1/2 rounded-xs opacity-70" />
                    </div>
                  </>
                ) : cIdx === columns - 1 ? (
                  <Skeleton className="h-7 w-20 rounded-md" />
                ) : (
                  <Skeleton
                    className={cn(
                      'h-4 rounded-xs',
                      cIdx % 2 === 0 ? 'w-24' : 'w-16'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
