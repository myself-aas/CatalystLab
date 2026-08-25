import React from 'react';
import { Card } from '../primitives/Card';
import { CardTitle } from '../primitives/CardTitle';
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

/**
 * FAQCategoryCard (Terminal Variant)
 * Reference Anatomy:
 * - Scanline glass shell
 * - Monospace category icon, title, description, question count chip, hover chevron
 */
export const FAQCategoryCard: React.FC<FAQCategoryCardProps> = ({
  id,
  label,
  description,
  icon,
  itemCount,
  isActive = false,
  onSelect,
  hue = 'edgevmax',
  className,
}) => {
  return (
    <Card
      variant="terminal"
      hue={hue}
      lift={true}
      active={isActive}
      onClick={() => onSelect?.(id)}
      className={`p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
        isActive
          ? 'border-cyan-400/80 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
          : 'border-slate-800 hover:border-slate-700 bg-[#0B101D]/90'
      } ${className || ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Icon + Title Block */}
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              isActive
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 group-hover:text-white'
            }`}
          >
            {icon || <HelpCircle className="w-4 h-4" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle
                as="h4"
                className={`text-sm sm:text-base font-bold truncate transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                }`}
              >
                {label}
              </CardTitle>
            </div>
            {description && (
              <p className="mt-1 text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right Badge + Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold">
            {itemCount} Qs
          </span>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'
            }`}
          />
        </div>
      </div>
    </Card>
  );
};
