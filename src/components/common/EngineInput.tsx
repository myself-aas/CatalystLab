import React from 'react';
import { RotateCw } from 'lucide-react';

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
    <form onSubmit={onSubmit} className="p-2 sm:p-2.5 rounded-[1.5rem] border border-[#c5d3e8]/30 bg-gradient-to-b from-[#0b192c] to-[#070b12] w-full shadow-lg">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2.5 px-4 py-3.5 sm:py-4 rounded-2xl bg-[#0a0f1a] border border-[#c5d3e8]/10 text-white font-mono text-sm sm:text-base focus-within:border-[#c5d3e8]/30 transition-all shadow-inner relative group">
          <span className="text-white shrink-0 font-bold tracking-tighter select-none">{'>_'}</span>
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
            className="bg-transparent flex-1 outline-none border-none placeholder-[#52718e] text-[#c5d3e8] w-full min-w-0 font-medium"
          />
        </div>
        <button 
          type="submit" 
          disabled={disabled || isLoading}
          className="flex items-center justify-center gap-2.5 w-full py-3.5 sm:py-4 rounded-2xl bg-[#c5d3e8] hover:bg-white hover:shadow-md disabled:bg-[#415a77]/50 disabled:text-slate-400 text-[#0b192c] font-mono font-bold text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          {isLoading ? (
            <RotateCw className="h-5 w-5 animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="shrink-0"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          )}
          <span>{isLoading ? loadingText : buttonText}</span>
        </button>
      </div>
    </form>
  );
};
