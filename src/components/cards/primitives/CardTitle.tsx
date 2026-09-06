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
            ? 'text-xl sm:text-2xl font-black font-mono text-primary-foreground'
            : isSurface
            ? 'framer-card-title text-foreground dark:text-primary-foreground'
            : 'framer-card-title text-primary-foreground drop-shadow-sm',
          className
        )
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
