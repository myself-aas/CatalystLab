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
      box: 'size-7 rounded-xl',
      icon: 'size-3.5',
      title: 'text-base font-bold leading-7 tracking-tight',
      badge: 'text-[10px] px-2 py-0.5',
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
        className={`relative flex ${current.box} items-center justify-center bg-[#2C3032] border border-[rgba(240,250,255,0.12)] shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(240,250,255,0.06)] group-hover/logo:border-[rgba(240,250,255,0.18)] group-hover/logo:shadow-[0_4px_16px_rgba(240,250,255,0.10),inset_0_1px_0_rgba(240,250,255,0.08)] shrink-0 transition-all duration-300 active:scale-95`}
        aria-hidden="true"
      >
        <Terminal className={`${current.icon} text-[#F0FAFF] group-hover/logo:text-[#F0FAFF] transition-all duration-300 group-hover/logo:scale-110`} />
        {/* Status beacon in brand cyan */}
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#F0FAFF] ring-2 ring-[#1F2223] shadow-[0_0_6px_rgba(240,250,255,0.5)] animate-pulse" />
      </div>

      {showText && (
        <span className={`font-bold tracking-tight transition-colors duration-200 text-[#F0FAFF] ${current.title}`}>
          Catalyst<span className={`font-bold text-[#F0FAFF]`}>Lab</span>
        </span>
      )}

      {showBadge && badgeText && (
        <span className={`rounded-full bg-[rgba(240,250,255,0.05)] font-mono font-semibold text-[#F0FAFF] border border-[rgba(240,250,255,0.10)] uppercase tracking-wider ${current.badge}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
