import React from 'react';
import { RotateCw, Play, X, ArrowRight } from 'lucide-react';

interface EngineInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  buttonText?: string;
  loadingText?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const EngineInput: React.FC<EngineInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  buttonText = "Start Master Audit",
  loadingText = "Executing...",
  placeholder = "@catalystlab-search: (https://",
  disabled = false,
}) => {
  return (
    <form 
      onSubmit={onSubmit} 
      className="p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-background/90 backdrop-blur-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-300 group focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.1)] focus-within:border-zinc-400"
    >
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 w-full">
        {/* Terminal Text Input Box */}
        <div className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200/80 text-zinc-900 font-mono text-sm sm:text-base flex-1 w-full focus-within:bg-background focus-within:border-zinc-900/30 focus-within:ring-2 focus-within:ring-zinc-900/10 transition-all">
          <span className="text-amber-600 shrink-0 font-bold tracking-tight select-none flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>&gt;_</span>
          </span>
          <input 
            id="hero-audit-url-input"
            type="text" 
            aria-label={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            required
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className="bg-transparent flex-1 outline-none border-none placeholder-zinc-400 text-zinc-900 w-full min-w-0 font-medium font-mono text-sm sm:text-base"
          />
          {value && !isLoading && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
              title="Clear input"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden md:inline-flex items-center text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-200/60 text-zinc-600 border border-zinc-300/60 select-none">
            ↵ Enter
          </span>
        </div>

        {/* Action Button */}
        <button 
          type="submit" 
          disabled={disabled || isLoading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-zinc-950 hover:bg-zinc-800 active:bg-primary text-primary-foreground font-mono font-semibold text-sm sm:text-base transition-all duration-200 active:scale-[0.98] cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-900 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          {isLoading ? (
            <RotateCw className="h-4 w-4 animate-spin text-amber-400" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current text-amber-400 shrink-0" />
          )}
          <span className="whitespace-nowrap">{isLoading ? loadingText : buttonText}</span>
          {!isLoading && <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </div>
    </form>
  );
};
