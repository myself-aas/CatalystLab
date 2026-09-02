import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CardHeaderRowProps } from '../types';

export const CardHeaderRow: React.FC<CardHeaderRowProps> = ({
  leftSlot,
  rightSlot,
  brandName,
  timestamp,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'w-full flex items-center justify-between gap-3 select-none z-10',
          className
        )
      )}
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          <div className="flex items-center gap-2 min-w-0">
            {leftSlot}
            {brandName && (
              <span className="font-mono font-bold tracking-tight text-primary-foreground text-sm sm:text-base uppercase truncate">
                {brandName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {timestamp && (
              <span className="font-mono text-xs text-muted-foreground tracking-wider">
                {timestamp}
              </span>
            )}
            {rightSlot}
          </div>
        </>
      )}
    </div>
  );
};
