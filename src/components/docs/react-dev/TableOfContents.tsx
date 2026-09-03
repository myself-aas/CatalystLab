import React from 'react';
import { cn } from '../../../lib/utils';
import { TableOfContentsItem } from '../../../types/design-system';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  activeId: string;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  items, 
  activeId, 
  className 
}) => {
  if (items.length === 0) return null;

  return (
    <nav className={cn("hidden lg:block w-64 shrink-0 font-sans", className)}>
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto px-4 py-6">
        <h4 className="text-sm font-semibold tracking-wide text-foreground uppercase mb-4">
          On this page
        </h4>
        <ul className="space-y-2.5 text-sm">
          {items.map((item) => (
            <li 
              key={item.id} 
              className={cn(
                "transition-all duration-200",
                item.level === 3 ? "ml-4" : ""
              )}
            >
              <a
                href={`#${item.id}`}
                className={cn(
                  "block truncate py-1 transition-colors hover:text-foreground",
                  activeId === item.id 
                    ? "react-toc-active" 
                    : "text-muted-foreground"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(item.id);
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                  // Update URL hash without jumping
                  window.history.pushState(null, '', `#${item.id}`);
                }}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
