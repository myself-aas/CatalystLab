import React from 'react';
import { RotateCw, Play } from 'lucide-react';

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
    <form onSubmit={onSubmit} className="p-2 sm:p-2.5 rounded-2xl border border-gray-200 bg-white w-full shadow-xl">
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
        {/* Terminal Text Input Box */}
        <div className="flex items-center gap-2.5 px-4 py-3 sm:py-3.5 rounded-xl bg-gray-100 border border-gray-200 text-black font-mono text-sm sm:text-base flex-1 w-full shadow-inner focus-within:border-accent-cyan/60 transition-colors">
          <span className="text-accent-cyan shrink-0 font-bold tracking-tight select-none">&gt;_</span>
          <input 
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
            className="bg-transparent flex-1 outline-none border-none placeholder-brand-slate-light text-black w-full min-w-0 font-medium font-mono"
          />
        </div>

        {/* Action Button */}
        <button 
          type="submit" 
          disabled={disabled || isLoading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl bg-black hover:bg-gray-800 text-white font-mono font-bold text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
        >
          {isLoading ? (
            <RotateCw className="h-4 w-4 animate-spin text-accent-cyan" />
          ) : (
            <Play className="h-4 w-4 fill-current text-gray-600 shrink-0" />
          )}
          <span className="whitespace-nowrap">{isLoading ? loadingText : buttonText}</span>
        </button>
      </div>
    </form>
  );
};
