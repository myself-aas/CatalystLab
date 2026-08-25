import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CardActionsProps } from '../types';

export const CardActions: React.FC<CardActionsProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'w-full flex items-center justify-between gap-3 pt-2 select-none z-10',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
