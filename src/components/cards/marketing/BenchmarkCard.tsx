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
  hue = 'edgevmax',
  className,
  ...props
}) => {
  return (
    <Card
      variant="terminal"
      hue={hue}
      lift
      className={twMerge(clsx('flex flex-col justify-between p-5 sm:p-6', className))}
      {...props}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
              {category}
            </span>
            <h4 className="text-base font-bold text-white font-sans tracking-tight">
              {engineName}
            </h4>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm">
          {deltaImprovement}
        </span>
      </div>

      {description && (
        <p className="text-xs text-slate-300 font-sans mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {/* R5 Stat-Pair Divider Pattern (Legacy vs CatalystLab) */}
      <div className="w-full grid grid-cols-2 divide-x divide-slate-800 bg-slate-900/80 rounded-xl border border-slate-800/80 p-3 my-2 shadow-inner">
        {/* Legacy Column */}
        <div className="pr-3 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {legacyTitle}
          </span>
          <div className="mt-1">
            <span className="text-lg font-black font-mono text-slate-400">
              {legacyValue}
            </span>
            <span className="block text-[11px] font-sans text-slate-500 mt-0.5">
              {legacyLabel}
            </span>
          </div>
        </div>

        {/* CatalystLab Column */}
        <div className="pl-3 flex flex-col justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              {catalystTitle}
            </span>
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="mt-1">
            <span className="text-lg font-black font-mono text-cyan-300">
              {catalystValue}
            </span>
            <span className="block text-[11px] font-sans text-cyan-100/70 mt-0.5">
              {catalystLabel}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
