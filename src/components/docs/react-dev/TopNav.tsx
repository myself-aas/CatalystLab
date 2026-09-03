import React from 'react';
import { cn } from '../../../lib/utils';

interface TopNavProps {
  children?: React.ReactNode;
  className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ children, className }) => {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full h-[3.5rem] bg-[var(--react-card)]/80 backdrop-blur-md border-b border-border text-foreground transition-colors",
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
        "px-4 py-2 text-[15px] font-medium transition-colors hover:text-[var(--react-cyan)] rounded-full",
        active ? "text-[var(--react-cyan)] bg-[var(--react-cyan-subtle)]" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </a>
  );
};
