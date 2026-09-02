import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IntegrationChipProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  category?: string;
  icon?: React.ReactNode;
  active?: boolean;
  status?: string;
  className?: string;
}

/**
 * IntegrationChip — Terminal shell partner & ecosystem logo chip
 * Citations: Terminal shell variant, zero-photo scanline aesthetic
 */
export const IntegrationChip: React.FC<IntegrationChipProps> = ({
  name,
  category,
  icon,
  active = true,
  status = 'CONNECTED',
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-background hover:bg-muted border border-border hover:border-border font-sans text-xs text-muted-foreground transition-all duration-200 shadow-sm select-none shrink-0 group',
          active && 'hover:border-border hover:shadow-md',
          className
        )
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0 text-muted-foreground group-hover:text-muted-foreground transition-colors">{icon}</span>}
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-foreground truncate group-hover:text-muted-foreground transition-colors">
          {name}
        </span>
        {category && (
          <span className="text-[10px] text-muted-foreground truncate">
            {category}
          </span>
        )}
      </div>
      {status && (
        <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
          {status}
        </span>
      )}
    </div>
  );
};
