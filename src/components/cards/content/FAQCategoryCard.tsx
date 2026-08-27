import React from 'react';
import { EnzymeHue } from '../types';
import { ChevronRight, HelpCircle } from 'lucide-react';

export interface FAQCategoryCardProps {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  itemCount: number;
  isActive?: boolean;
  onSelect?: (id: string) => void;
  hue?: EnzymeHue;
  className?: string;
}

export const FAQCategoryCard: React.FC<FAQCategoryCardProps> = ({
  id,
  label,
  description,
  icon,
  itemCount,
  isActive = false,
  onSelect,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(id)}
      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
        isActive
          ? 'border-slate-900 bg-slate-50 shadow-sm'
          : 'border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300'
      } ${className || ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Icon + Title Block */}
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              isActive
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {icon || <HelpCircle className="w-4 h-4" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4
                className={`text-sm font-bold truncate transition-colors font-sans ${
                  isActive ? 'text-slate-900' : 'text-slate-800'
                }`}
              >
                {label}
              </h4>
            </div>
            {description && (
              <p className="mt-1 text-xs text-slate-500 font-sans line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right Badge + Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono font-bold">
            {itemCount} Qs
          </span>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              isActive ? 'text-slate-900 translate-x-0.5' : 'text-slate-400'
            }`}
          />
        </div>
      </div>
    </button>
  );
};

