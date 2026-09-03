import React from 'react';
import { Terminal } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  darkText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = false,
  badgeText,
  className = '',
  darkText = false,
}) => {
  const sizeClasses = {
    sm: {
      box: 'size-6 rounded-md',
      icon: 'size-3.5',
      title: 'text-base font-bold leading-6 tracking-tight',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      box: 'size-[28px] rounded-md',
      icon: 'size-[16px]',
      title: 'text-[22px] leading-none font-bold tracking-tight',
      badge: 'text-[11px] px-2 py-0.5',
    },
    lg: {
      box: 'h-10 w-10 rounded-xl',
      icon: 'h-5 w-5',
      title: 'text-xl tracking-tight',
      badge: 'text-xs px-2.5 py-0.5',
    },
    xl: {
      box: 'h-12 w-12 rounded-xl',
      icon: 'h-6 w-6',
      title: 'text-2xl sm:text-3xl tracking-tight',
      badge: 'text-xs px-3 py-1',
    },
  };

  const current = sizeClasses[size];

  return (
    <div className={`group/logo flex items-center gap-2.5 select-none ${className}`}>
      {/* Engineered Terminal / Catalyst Logo Mark with Ambient Glow & High Contrast */}
      <div 
        className={`relative flex ${current.box} items-center justify-center bg-white dark:bg-[#0c0c12] border border-border-default shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] group-hover/logo:border-accent/60 group-hover/logo:shadow-[0_0_14px_rgba(94,106,210,0.35)] shrink-0 transition-all duration-300 active:scale-95`}
        aria-hidden="true"
      >
        <Terminal className={`${current.icon} text-indigo-600 dark:text-indigo-400 group-hover/logo:text-accent-bright transition-all duration-300 group-hover/logo:scale-110`} />
        {/* Subtle accent corner beacon with crisp ring contrast */}
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
      </div>

      {showText && (
        <span className={`font-bold tracking-tight transition-colors duration-200 text-foreground ${current.title}`}>
          Catalyst<span className={`font-bold ${darkText ? 'text-indigo-700' : 'text-indigo-600 dark:text-[#818cf8]'}`}>Lab</span>
        </span>
      )}

      {showBadge && badgeText && (
        <span className={`rounded-full bg-indigo-50 dark:bg-accent/15 font-mono font-semibold text-indigo-700 dark:text-accent-bright border border-indigo-200 dark:border-accent/30 uppercase tracking-wider ${current.badge}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
