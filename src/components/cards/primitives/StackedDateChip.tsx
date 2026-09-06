import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StackedDateChipProps } from '../types';

export const StackedDateChip: React.FC<StackedDateChipProps> = ({
  month,
  day,
  weekday,
  time,
  variant = 'solid',
  className,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center w-12 h-14 rounded-xl font-mono select-none shrink-0 shadow-md',
          variant === 'solid'
            ? 'bg-background text-foreground border border-border'
            : 'bg-background/20 text-primary-foreground border border-white/30 backdrop-blur-md',
          className
        )
      )}
      {...props}
    >
      <span
        className={clsx(
          'text-[10px] font-bold uppercase tracking-wider px-1 rounded-t-lg w-full text-center',
          variant === 'solid'
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/30 text-primary-foreground'
        )}
      >
        {month}
      </span>
      <span className="text-base font-black leading-tight mt-0.5">{day}</span>
      {weekday && (
        <span
          className={clsx(
            'text-[10px] font-semibold uppercase',
            variant === 'solid' ? 'text-muted-foreground' : 'text-muted-foreground'
          )}
        >
          {weekday}
        </span>
      )}
    </div>
  );
};
