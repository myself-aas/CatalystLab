import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronRight, ChevronDown, AlignLeft } from 'lucide-react';
import { NavGroup, NavItem } from '../../../types/design-system';

interface SidebarProps {
  groups: NavGroup[];
  activePath?: string;
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  groups, 
  activePath = '/', 
  className,
  isOpen = false,
  setIsOpen
}) => {
  // Mobile overlay click to close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const SidebarContent = (
    <div className="py-6 px-4 pb-24 h-full overflow-y-auto">
      {groups.map((group, i) => (
        <div key={i} className="mb-8">
          <h4 className="px-3 mb-2 text-sm font-bold text-foreground flex items-center gap-2">
            {group.group}
          </h4>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const isActive = activePath === item.path || 
                              (item.path !== '/' && activePath.startsWith(item.path));
              return (
                <li key={item.id}>
                  <a
                    href={item.path}
                    className={cn(
                      "block px-3 py-2 text-sm transition-colors rounded-lg",
                      isActive 
                        ? "react-nav-link-active" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={(e) => {
                      if (setIsOpen) setIsOpen(false);
                      // Don't prevent default, let navigation happen
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-muted text-muted-foreground border border-border">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && setIsOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed top-[3.5rem] bottom-0 left-0 z-40 w-72 bg-[var(--react-wash)] border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-3.5rem)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {SidebarContent}
      </aside>
    </>
  );
};
