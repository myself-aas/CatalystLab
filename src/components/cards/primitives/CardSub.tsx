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
          'flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-normal line-clamp-2',
          isSurface ? 'text-muted-foreground dark:text-muted-foreground' : 'text-primary-foreground drop-shadow-sm',
          className
        )
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0 opacity-90">{icon}</span>}
      {location && <span className="font-mono text-xs text-primary-foreground/90 truncate">{location}</span>}
      {children && <span className="truncate">{children}</span>}
    </div>
  );
};
