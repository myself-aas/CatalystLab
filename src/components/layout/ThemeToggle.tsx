import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme, Theme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="size-3.5 text-amber-500" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="size-3.5 text-accent-bright" /> },
    { value: 'system', label: 'System', icon: <Monitor className="size-3.5 text-foreground-muted" /> },
  ];

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="group flex size-9 items-center justify-center rounded-full border border-border-default bg-card/80 backdrop-blur-md text-foreground-muted hover:text-foreground hover:bg-card-hover hover:border-accent/40 transition-all duration-200 active:scale-95 shadow-linear-card cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        aria-label={`Theme: ${theme}. Choose display theme`}
        aria-expanded={dropdownOpen}
        aria-haspopup="menu"
        title={`Current theme: ${theme} (${resolvedTheme})`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="size-4 text-accent-bright transition-transform group-hover:rotate-12 duration-200" />
        ) : (
          <Sun className="size-4 text-amber-500 transition-transform group-hover:rotate-45 duration-200" />
        )}
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="menu" 
            aria-label="Theme options" 
            className="absolute right-0 mt-2 w-36 origin-top-right rounded-2xl border border-border-default bg-card/95 p-1.5 shadow-linear-card backdrop-blur-2xl z-50 overflow-hidden"
          >
            <div className="flex flex-col gap-0.5">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setTheme(opt.value);
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                    theme === opt.value
                      ? 'bg-muted/80 text-foreground font-semibold shadow-2xs'
                      : 'text-foreground-muted hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {opt.icon}
                    <span>{opt.label}</span>
                  </div>
                  {theme === opt.value && <Check className="size-3 text-accent-bright" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;
