import React from 'react';
/** Catalyst molecule mark — reaction centre + three bonded nodes (see public/logo-mark.svg). */
const MoleculeMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
    <g stroke="#1E40AF" strokeWidth="5" strokeLinecap="round">
      <line x1="32" y1="32" x2="32" y2="13" />
      <line x1="32" y1="32" x2="15.5" y2="41.5" />
      <line x1="32" y1="32" x2="48.5" y2="41.5" />
    </g>
    <circle cx="32" cy="32" r="10" fill="#2563EB" />
    <circle cx="32" cy="11" r="6.5" fill="#1E40AF" />
    <circle cx="13.5" cy="43" r="6.5" fill="#1E40AF" />
    <circle cx="50.5" cy="43" r="6.5" fill="#2563EB" />
  </svg>
);

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
      box: 'size-7 rounded-xl',
      icon: 'size-3.5',
      title: 'text-base font-bold leading-7 tracking-tight',
      badge: 'text-[11px] px-2 py-0.5',
    },
    md: {
      box: 'size-8 rounded-xl',
      icon: 'size-4',
      title: 'text-[20px] leading-none font-bold tracking-tight',
      badge: 'text-[11px] px-2.5 py-0.5',
    },
    lg: {
      box: 'h-11 w-11 rounded-2xl',
      icon: 'h-5 w-5',
      title: 'text-xl tracking-tight',
      badge: 'text-xs px-3 py-1',
    },
    xl: {
      box: 'h-12 w-12 rounded-2xl',
      icon: 'h-6 w-6',
      title: 'text-2xl sm:text-3xl tracking-tight',
      badge: 'text-xs px-3 py-1',
    },
  };

  const current = sizeClasses[size];

  return (
    <div className={`group/logo flex items-center gap-2.5 select-none ${className}`}>
      {/* CatalystLab brand mark — soft card tile with icon */}
      <div
        className={`relative flex ${current.box} items-center justify-center bg-white border border-[#111827]/[0.08] shadow-[0_2px_8px_rgba(17,24,39,0.08)] group-hover/logo:border-[#2563EB]/40 group-hover/logo:shadow-[0_4px_16px_rgba(37,99,235,0.16)] shrink-0 transition duration-300 active:scale-95`}
        aria-hidden="true"
      >
        <MoleculeMark className={`${current.icon} transition duration-300 group-hover/logo:scale-110`} />
        {/* Status beacon in brand cyan */}
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#2563EB] ring-2 ring-white shadow-[0_0_6px_rgba(37,99,235,0.5)] animate-pulse" />
      </div>

      {showText && (
        <span className={`font-bold tracking-tight transition-colors duration-200 text-foreground ${current.title}`}>
          Catalyst<span className="font-bold text-[#2563EB]">Lab</span>
        </span>
      )}

      {showBadge && badgeText && (
        <span className={`rounded-full bg-[rgba(240,250,255,0.05)] font-mono font-semibold text-foreground border border-[rgba(240,250,255,0.10)] uppercase tracking-wider ${current.badge}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
