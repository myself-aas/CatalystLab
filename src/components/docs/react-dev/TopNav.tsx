import React from 'react';
import { cn } from '../../../lib/utils';

interface TopNavProps {
  children?: React.ReactNode;
  className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ children, className }) => {
  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 w-full h-16 bg-[rgba(31,34,35,0.78)] backdrop-blur-2xl border-b border-[rgba(240,250,255,0.08)] text-[#F0FAFF] transition-colors",
      className
    )}>
      <div className="h-full px-4 md:px-6 mx-auto flex items-center justify-between max-w-[90rem]">
        {children}
      </div>
    </header>
  );
};

export const NavLink: React.FC<{
  href: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ href, active, children, className }) => {
  return (
    <a
      href={href}
      className={cn(
        "px-4 py-1.5 text-sm font-medium transition-colors rounded-full",
        active
          ? "bg-[#F0FAFF] text-[#1F2223] shadow-[0_2px_12px_rgba(240,250,255,0.15)]"
          : "text-[rgba(240,250,255,0.65)] hover:text-[#F0FAFF] hover:bg-[rgba(240,250,255,0.05)]",
        className
      )}
    >
      {children}
    </a>
  );
};
