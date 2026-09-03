import React from 'react';
import { cn } from '../../lib/utils';
import { useSpotlight } from '../cards/hooks/useSpotlight';

type LinearCardProps<T extends React.ElementType = 'div'> = {
  as?: T;
  className?: string;
  innerClassName?: string;
  spotlight?: boolean;
  lift?: boolean;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

/**
 * Linear surface primitive: glass gradient, multi-layer shadow, optional
 * mouse-tracked indigo spotlight. Used by marketing cards so hover language
 * stays consistent without one-off styles.
 */
export function LinearCard<T extends React.ElementType = 'div'>({
  as,
  className,
  innerClassName,
  spotlight = true,
  lift = true,
  children,
  ...rest
}: LinearCardProps<T>) {
  const Component = (as || 'div') as React.ElementType;
  const { ref, isHovered, props: spotlightProps } = useSpotlight<HTMLElement>({
    enabled: spotlight,
  });

  return (
    <Component
      ref={ref}
      {...spotlightProps}
      className={cn(
        'group/card relative overflow-hidden rounded-2xl border border-white/[0.06]',
        'bg-gradient-to-b from-white/[0.08] to-white/[0.02]',
        'shadow-linear-card backdrop-blur-xl',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        lift &&
          'hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.07] hover:shadow-linear-card-hover',
        className
      )}
      {...rest}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      {spotlight && (
        <div
          aria-hidden="true"
          className={cn(
            'card-spotlight-overlay absolute inset-0 z-10 opacity-0 transition-opacity duration-300',
            isHovered && 'opacity-100'
          )}
        />
      )}
      <div className={cn('relative z-20 h-full', innerClassName)}>{children}</div>
    </Component>
  );
}

export default LinearCard;
