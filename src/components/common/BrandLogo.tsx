import React from 'react';

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
      box: 'h-6 w-6 rounded-md',
      icon: 'text-[14px]',
      title: 'text-base',
      badge: 'text-[9px] px-1 py-0.2',
    },
    md: {
      box: 'h-8 w-8 rounded-lg',
      icon: 'text-[18px]',
      title: 'text-lg',
      badge: 'text-xs px-1.5 py-0.5',
    },
    lg: {
      box: 'h-10 w-10 rounded-xl',
      icon: 'text-[22px]',
      title: 'text-xl',
      badge: 'text-xs px-2 py-0.5',
    },
    xl: {
      box: 'h-14 w-14 rounded-2xl',
      icon: 'text-[32px]',
      title: 'text-2xl sm:text-3xl',
      badge: 'text-sm px-2.5 py-1',
    },
  };

  const current = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official Terminal_2 Icon Box */}
      <div 
        className={`flex ${current.box} items-center justify-center bg-[#0b192c] text-[#f8fafc] border border-[#415a77]/50 shadow-md select-none font-bold shrink-0`}
        aria-hidden="true"
      >
        <span className={`material-symbols-outlined ${current.icon} font-black leading-none text-[#c5d3e8]`}>
          terminal_2
        </span>
      </div>

      {showText && (
        <span className={`font-extrabold tracking-tight ${darkText ? 'text-[#0b192c]' : 'text-current'} ${current.title}`}>
          CatalystLab
        </span>
      )}

      {showBadge && badgeText && (
        <span className={`rounded bg-[#415a77]/15 font-bold text-[#415a77] border border-[#415a77]/30 ${current.badge}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
};
export default BrandLogo;
