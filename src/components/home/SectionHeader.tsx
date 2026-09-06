import React from 'react';
import { cn } from '../../lib/utils';

interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  action,
}) => {
  return (
    <div
      className={cn(
        'mb-12 md:mb-16 flex flex-col gap-6',
        align === 'center' && 'items-center text-center',
        align === 'left' && 'md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 framer-micro-tag text-primary backdrop-blur-md">
            {eyebrow}
          </div>
        )}
        <h2 className="framer-section-headline text-foreground">
          <span className="text-gradient-linear">{title}</span>
        </h2>
        {description && (
          <p className="mt-3 framer-body-text">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
};

export default SectionHeader;
