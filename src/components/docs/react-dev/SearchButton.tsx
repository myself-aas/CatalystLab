import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SearchButtonProps {
  onClick?: () => void;
  className?: string;
  shortcut?: string;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ 
  onClick, 
  className,
  shortcut = '⌘K'
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-1.5 md:py-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted/80 hover:text-foreground transition-all duration-200 border border-transparent hover:border-border rounded-full md:rounded-xl md:w-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--react-cyan)]",
        className
      )}
      aria-label="Search"
    >
      <Search className="w-4 h-4 md:w-5 md:h-5" />
      <span className="hidden md:inline-block">Search</span>
      
      {shortcut && (
        <kbd className="hidden md:flex items-center ml-auto px-1.5 py-0.5 text-[10px] font-mono rounded bg-background border border-border text-muted-foreground shadow-sm">
          {shortcut}
        </kbd>
      )}
    </button>
  );
};
