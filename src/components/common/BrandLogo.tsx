import React from 'react';
/** Finalized CatalystLab mark — catalytic lattice of six deep-royal hubs + eight cobalt terminals (public/logo-mark.svg). */
const MoleculeMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="95 195 660 545" className={className} aria-hidden="true" focusable="false">
    <g stroke="#1B56B0" strokeWidth="26" strokeLinecap="round">
      <line x1="298" y1="278" x2="317" y2="406" /><line x1="298" y1="278" x2="452" y2="348" />
      <line x1="540" y1="262" x2="452" y2="348" /><line x1="452" y1="348" x2="317" y2="406" />
      <line x1="452" y1="348" x2="444" y2="460" /><line x1="317" y1="406" x2="444" y2="460" />
      <line x1="317" y1="406" x2="168" y2="474" /><line x1="168" y1="474" x2="311" y2="533" />
      <line x1="444" y1="460" x2="311" y2="533" /><line x1="444" y1="460" x2="452" y2="580" />
      <line x1="444" y1="460" x2="571" y2="461" /><line x1="311" y1="533" x2="452" y2="580" />
      <line x1="311" y1="533" x2="327" y2="659" /><line x1="452" y1="580" x2="521" y2="667" />
      <line x1="571" y1="461" x2="652" y2="361" /><line x1="571" y1="461" x2="681" y2="469" />
      <line x1="571" y1="461" x2="624" y2="566" />
    </g>
    <g fill="#1D4391">
      <circle cx="444" cy="460" r="56" /><circle cx="452" cy="348" r="56" /><circle cx="317" cy="406" r="56" />
      <circle cx="311" cy="533" r="56" /><circle cx="452" cy="580" r="56" /><circle cx="571" cy="461" r="56" />
    </g>
    <g fill="#0A63C6">
      <circle cx="298" cy="278" r="45" /><circle cx="540" cy="262" r="45" /><circle cx="652" cy="361" r="45" />
      <circle cx="681" cy="469" r="45" /><circle cx="624" cy="566" r="45" /><circle cx="521" cy="667" r="45" />
      <circle cx="327" cy="659" r="45" /><circle cx="168" cy="474" r="45" />
    </g>
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
        className={`relative flex ${current.box} items-center justify-center bg-white border border-[#111827]/[0.08] shadow-[0_2px_8px_rgba(17,24,39,0.08)] group-hover/logo:border-[#0064E0]/40 group-hover/logo:shadow-[0_4px_16px_rgba(0,100,224,0.16)] shrink-0 transition duration-300 active:scale-95`}
        aria-hidden="true"
      >
        <MoleculeMark className={`${current.icon} transition duration-300 group-hover/logo:scale-110`} />
        {/* Status beacon in brand cyan */}
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#0064E0] ring-2 ring-white shadow-[0_0_6px_rgba(0,100,224,0.5)] animate-pulse" />
      </div>

      {showText && (
        <span className={`font-bold tracking-tight transition-colors duration-200 text-foreground ${current.title}`}>
          Catalyst<span className="font-bold text-[#0064E0]">Lab</span>
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
