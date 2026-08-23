import React from 'react';
import { RotateCw, Play } from 'lucide-react';

interface CompareEngineInputProps {
  urlA: string;
  setUrlA: (val: string) => void;
  urlB: string;
  setUrlB: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export const CompareEngineInput: React.FC<CompareEngineInputProps> = ({
  urlA, setUrlA, urlB, setUrlB, onSubmit, isLoading = false
}) => {
  return (
    <form onSubmit={onSubmit} className="p-2 sm:p-2.5 rounded-[1.5rem] border border-brand-slate/40 bg-surface-card w-full shadow-xl">
      <div className="flex flex-col gap-2 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center gap-2.5 px-4 py-3 sm:py-3.5 rounded-2xl bg-[#0a0f1a] border border-[#c5d3e8]/10 text-white font-mono text-sm sm:text-base focus-within:border-[#c5d3e8]/30 transition-all shadow-inner relative group">
            <span className="text-white shrink-0 font-bold tracking-tighter select-none">{'>_'}</span>
            <input 
              type="text" 
              value={urlA}
              onChange={(e) => setUrlA(e.target.value)}
              placeholder="@catalystlab-search: (Primary https://"
              disabled={isLoading}
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="bg-transparent flex-1 outline-none border-none placeholder-[#52718e] text-[#c5d3e8] w-full min-w-0 font-medium"
            />
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 sm:py-3.5 rounded-2xl bg-[#0a0f1a] border border-[#c5d3e8]/10 text-white font-mono text-sm sm:text-base focus-within:border-[#c5d3e8]/30 transition-all shadow-inner relative group">
            <span className="text-white shrink-0 font-bold tracking-tighter select-none">{'>_'}</span>
            <input 
              type="text" 
              value={urlB}
              onChange={(e) => setUrlB(e.target.value)}
              placeholder="@catalystlab-search: (Compare https://"
              disabled={isLoading}
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="bg-transparent flex-1 outline-none border-none placeholder-[#52718e] text-[#c5d3e8] w-full min-w-0 font-medium"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="flex items-center justify-center gap-2.5 w-full py-3.5 sm:py-4 rounded-2xl bg-[#c5d3e8] hover:bg-white hover:shadow-md disabled:bg-[#415a77]/50 disabled:text-slate-400 text-[#0b192c] font-mono font-bold text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          {isLoading ? (
            <RotateCw className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-current text-[#0b192c]" />
          )}
          <span>{isLoading ? "Benchmarking Both Targets..." : "Execute Comparative Benchmark"}</span>
        </button>
      </div>
    </form>
  );
};
