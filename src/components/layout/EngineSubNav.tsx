import React, { useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { SDLC_CATALYSTS_LIST } from '../../data/engines';
import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';

export const EngineSubNav: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active element on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[aria-current="page"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, []);

  return (
    <div className="sticky top-16 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-12 max-w-7xl items-center px-4 sm:px-8 lg:px-12 relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        
        <div 
          ref={scrollRef}
          className="flex h-full w-full items-center gap-1 overflow-x-auto scrollbar-hide hide-scrollbar px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {SDLC_CATALYSTS_LIST.map((engine, index) => (
            <React.Fragment key={engine.id}>
              <NavLink
                to={engine.route}
                className={({ isActive }) => cn(
                  "group flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary),0.2)]"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <span 
                  className="material-symbols-outlined text-[16px] transition-transform group-hover:scale-110" 
                  style={{ color: engine.color }}
                  aria-hidden="true"
                >
                  {engine.icon}
                </span>
                <span className="whitespace-nowrap">{engine.catalystName}</span>
              </NavLink>
              
              {index < SDLC_CATALYSTS_LIST.length - 1 && (
                <ChevronRight className="size-3 shrink-0 text-border" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
};
