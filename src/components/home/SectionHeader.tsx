import React from 'react';
import { cn } from '../../lib/utils';

interface SectionHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  action?: React.ReactNode;
}

/**
 * Section heading for marketing surfaces.
 *
 * The heading carries itself: no kicker/eyebrow pill above it (DESIGN.md
 * "Don't put an eyebrow/kicker label above a heading"), and no gradient fill
 * (emphasis comes from weight and size, never from a gradient clipped to text).
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
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
        <h2 className="framer-section-headline text-foreground">{title}</h2>
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
