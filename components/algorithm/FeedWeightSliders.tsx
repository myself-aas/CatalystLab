'use client';

import React from 'react';
import { Info } from 'lucide-react';

interface WeightSliderProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function WeightSlider({ 
  label, 
  description, 
  value, 
  onChange, 
  min = 0.1, 
  max = 2.0, 
  step = 0.1 
}: WeightSliderProps) {
  return (
    <div className="space-y-4 p-6 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-2xl hover:border-indigo-500/20 transition-all group">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">{label}</h4>
            <div className="group/info relative">
              <Info className="w-3.5 h-3.5 text-[var(--text-tertiary)] cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--bg-surface3)] border border-[var(--border)] rounded-lg text-[10px] text-[var(--text-secondary)] opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                {description}
              </div>
            </div>
          </div>
        </div>
        <span className="text-xl font-black text-indigo-400">{value.toFixed(1)}x</span>
      </div>

      <div className="relative h-6 flex items-center">
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-[var(--bg-surface3)] rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
        />
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
          <span>Minimal</span>
          <span>Standard (1.0)</span>
          <span>Maximum</span>
        </div>
      </div>
    </div>
  );
}
