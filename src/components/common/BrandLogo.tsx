import React from 'react';
import { MoleculeMark } from './MoleculeMark'; // Assuming I move it back or re-create the component here

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  darkText?: boolean;
  textColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = false,
  badgeText,
  className = '',
  textColor,
}) => {
  const sizeClasses = {
    sm: {
      icon: 'size-5',
      title: 'text-base font-bold tracking-tight',
      badge: 'text-[11px] px-2 py-0.5',
    },
    md: {
      icon: 'size-6',
      title: 'text-[21px] leading-none font-bold tracking-tight',
      badge: 'text-[11px] px-2.5 py-0.5',
    },
    lg: {
      icon: 'size-8',
      title: 'text-2xl font-bold tracking-tight',
      badge: 'text-xs px-3 py-1',
    },
    xl: {
      icon: 'size-9',
      title: 'text-3xl font-bold tracking-tight',
      badge: 'text-xs px-3 py-1',
    },
  };

  const current = sizeClasses[size];

  return (
    <div className={`group/logo flex items-center gap-2 select-none ${className}`}>
      {/* CatalystLab Molecular Catalyst Mark */}
      <MoleculeMark className={`${current.icon} shrink-0 text-[#0066FF] transition duration-200 group-hover/logo:scale-105`} />

      {showText && (
        <span
          className={`font-bold tracking-tight transition-colors duration-200 ${textColor || 'text-foreground'} ${current.title}`}
        >
          CatalystLab
        </span>
      )}

      {showBadge && badgeText && (
        <span className={`rounded-full bg-[rgba(240,250,255,0.08)] font-mono font-semibold text-foreground border border-[rgba(240,250,255,0.12)] uppercase tracking-wider ${current.badge}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
