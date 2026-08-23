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
      box: 'h-6 w-6 rounded-md',
      icon: 'h-3.5 w-3.5',
      title: 'text-base',
      badge: 'text-xs px-1 py-0.2',
    },
    md: {
      box: 'h-8 w-8 rounded-lg',
      icon: 'h-4 w-4',
      title: 'text-lg',
      badge: 'text-xs px-1.5 py-0.5',
    },
    lg: {
      box: 'h-10 w-10 rounded-xl',
      icon: 'h-5 w-5',
      title: 'text-xl',
      badge: 'text-xs px-2 py-0.5',
    },
    xl: {
      box: 'h-12 w-12 rounded-xl',
      icon: 'h-6 w-6',
      title: 'text-2xl sm:text-3xl',
      badge: 'text-sm px-2.5 py-1',
    },
  };

  const current = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Engineered Terminal Icon Box */}
      <div 
        className={`flex ${current.box} items-center justify-center bg-black text-[#f9a825] border border-black/80 shadow-xs select-none font-bold shrink-0 transition-transform active:scale-95`}
        aria-hidden="true"
      >
        <Terminal className={`${current.icon} text-[#f9a825]`} />
      </div>

      {showText && (
        <span className={`font-black tracking-tight transition-colors duration-200 text-black ${current.title}`}>
          Catalyst<span className="text-[#f9a825]">Lab</span>
        </span>
      )}

      {showBadge && badgeText && (
        <span className={`rounded-md bg-[#fffbf2] font-mono font-bold text-[#d08305] border border-[#fbd18c] uppercase ${current.badge}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
