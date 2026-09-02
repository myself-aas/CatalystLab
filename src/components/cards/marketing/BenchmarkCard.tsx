import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from '../primitives/Card';
import { EnzymeHue } from '../types';

export interface BenchmarkCardProps extends React.HTMLAttributes<HTMLDivElement> {
  engineName: string;
  category: string;
  legacyTitle?: string;
  legacyValue: string;
  legacyLabel: string;
  catalystTitle?: string;
  catalystValue: string;
  catalystLabel: string;
  deltaImprovement: string;
  description?: string;
  hue?: EnzymeHue;
  className?: string;
}

/**
 * BenchmarkCard — R5 Stat-Pair Divider Pattern for Architecture Comparisons
 * Reference: R5 Listing Card divider anatomy comparing Legacy vs CatalystLab
 */
export const BenchmarkCard: React.FC<BenchmarkCardProps> = ({
  engineName,
  category,
  legacyTitle = 'Legacy Diagnostic',
  legacyValue,
  legacyLabel,
  catalystTitle = 'CatalystLab Engine',
  catalystValue,
  catalystLabel,
  deltaImprovement,
  description,
  hue = 'neutral',
  className,
  ...props
}) => {
  return (
    <Card
      variant="surface"
      hue={hue}
      className={twMerge(clsx('flex flex-col justify-between p-5 sm:p-6', className))}
      {...props}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground block">
              {category}
            </span>
            <h4 className="text-base font-bold text-foreground font-sans tracking-tight">
              {engineName}
            </h4>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-sans font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {deltaImprovement}
        </span>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground font-sans mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {/* R5 Stat-Pair Divider Pattern (Legacy vs CatalystLab) - Refined Light Theme */}
      <div className="w-full grid grid-cols-2 divide-x divide-border bg-muted rounded-xl border border-border p-3 my-2 shadow-sm">
        {/* Legacy Column */}
        <div className="pr-3 flex flex-col justify-between">
          <span className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest">
            {legacyTitle}
          </span>
          <div className="mt-1">
            <span className="text-lg font-black text-muted-foreground">
              {legacyValue}
            </span>
            <span className="block text-[11px] font-sans text-muted-foreground mt-0.5">
              {legacyLabel}
            </span>
            {/* Visual Indicator */}
            <div className="mt-2 h-1 w-full bg-accent rounded-full overflow-hidden">
               <div className="h-full bg-muted w-1/2" />
            </div>
          </div>
        </div>

        {/* CatalystLab Column */}
        <div className="pl-3 flex flex-col justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-sans font-bold text-indigo-600 uppercase tracking-widest">
              {catalystTitle}
            </span>
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
          </div>
          <div className="mt-1">
            <span className="text-lg font-black text-indigo-600">
              {catalystValue}
            </span>
            <span className="block text-[11px] font-sans text-indigo-400 mt-0.5">
              {catalystLabel}
            </span>
            {/* Visual Indicator */}
            <div className="mt-2 h-1 w-full bg-indigo-100 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600 w-full" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
