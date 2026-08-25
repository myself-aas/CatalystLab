import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CardTitleProps } from '../types';
import { useCardContext } from './CardContext';

export const CardTitle: React.FC<CardTitleProps> = ({
  as: Component = 'h3',
  priceStyle = false,
  className,
  children,
  ...props
}) => {
  const context = useCardContext();
  const isSurface = context.variant === 'surface';

  return (
    <Component
      className={twMerge(
        clsx(
          'font-sans tracking-tight leading-snug break-words',
          priceStyle
            ? 'text-xl sm:text-2xl font-black font-mono text-white'
            : isSurface
            ? 'text-lg sm:text-xl font-bold text-slate-900 dark:text-white'
            : 'text-xl sm:text-2xl font-black text-white drop-shadow-sm',
          className
        )
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
