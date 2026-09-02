import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Heart } from 'lucide-react';
import { FavoriteButtonProps } from '../types';

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite = false,
  onToggle,
  ariaLabel = 'Save to favorites',
  className,
  ...props
}) => {
  const [active, setActive] = useState(isFavorite);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const next = !active;
    setActive(next);
    onToggle?.(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={twMerge(
        clsx(
          'relative before:absolute before:-inset-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white active:scale-90',
          'bg-primary/60 hover:bg-primary/90 text-primary-foreground border border-white/20 backdrop-blur-md shadow-sm',
          active && 'text-rose-400 border-rose-500/40 bg-rose-950/60',
          className
        )
      )}
      {...props}
    >
      <Heart
        className={clsx(
          'w-4 h-4 transition-transform duration-200',
          active ? 'fill-rose-500 text-rose-500 scale-110' : 'text-primary-foreground/80 group-hover:text-primary-foreground'
        )}
      />
    </button>
  );
};
