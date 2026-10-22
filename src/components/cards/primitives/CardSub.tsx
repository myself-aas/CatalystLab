import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CardSubProps } from '../types';
import { useCardContext } from './CardContext';

export const CardSub: React.FC<CardSubProps> = ({
  icon,
  location,
  className,
  children,
  ...props
}) => {
  const context = useCardContext();
  const isSurface = context.variant === 'surface';

  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-normal line-clamp-2 text-foreground',
          className
        )
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0 opacity-90">{icon}</span>}
      {location && (
        <span className={clsx('font-mono text-xs truncate', isSurface ? 'text-muted-foreground' : 'text-white/90')}>
          {location}
        </span>
      )}
      {children && <span className="truncate">{children}</span>}
    </div>
  );
};
