import React from 'react';
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
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center w-12 h-14 rounded-xl font-mono select-none shrink-0 shadow-md transition-transform hover:scale-105',
          variant === 'solid'
            ? 'bg-white text-slate-950 border border-slate-200'
            : 'bg-white/20 text-white border border-white/30 backdrop-blur-md',
          className
        )
      )}
      {...props}
    >
      <span
        className={clsx(
          'text-[10px] font-bold uppercase tracking-wider px-1 rounded-t-lg w-full text-center',
          variant === 'solid'
            ? 'bg-slate-900 text-white'
            : 'bg-white/30 text-white'
        )}
      >
        {month}
      </span>
      <span className="text-base font-black leading-tight mt-0.5">{day}</span>
      {weekday && (
        <span
          className={clsx(
            'text-[10px] font-semibold uppercase',
            variant === 'solid' ? 'text-slate-600' : 'text-slate-200'
          )}
        >
          {weekday}
        </span>
      )}
    </div>
  );
};
