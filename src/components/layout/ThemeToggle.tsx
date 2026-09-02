import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
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
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4 text-amber-500" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4 text-indigo-400" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4 text-zinc-400" /> },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-background/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-primary-foreground transition-all active:scale-95 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
        aria-label={`Theme: ${theme}. Choose display theme`}
        aria-expanded={dropdownOpen}
        aria-haspopup="menu"
        title={`Current theme: ${theme} (${resolvedTheme})`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4 text-indigo-400 transition-transform hover:rotate-12" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 transition-transform hover:rotate-45" />
        )}
      </button>

      {dropdownOpen && (
        <div role="menu" aria-label="Theme options" className="absolute right-0 mt-2 w-40 origin-top-right rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-background/95 dark:bg-zinc-900/95 p-1.5 shadow-[0_10px_38px_rgba(0,0,0,0.12)] backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex flex-col gap-0.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setDropdownOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  theme === opt.value
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-primary-foreground font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {theme === opt.value && <Check className="h-3.5 w-3.5 text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
