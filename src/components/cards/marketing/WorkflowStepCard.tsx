import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../primitives/Card';
import { EnzymeHue } from '../types';

export interface WorkflowStepCardProps extends React.HTMLAttributes<HTMLDivElement> {
  stepNumber: number | string;
  duration: string;
  title: string;
  description: string;
  commandSnippet?: string;
  status?: 'COMPLETED' | 'ACTIVE' | 'PENDING';
  hue?: EnzymeHue;
  className?: string;
}

/**
 * WorkflowStepCard — R4-Terminal Step Card with Stacked Time Meta
 * Citations: R4 Event Card anatomy (stacked time chip left, meta right) mapped to Terminal CI/CD step
 */
export const WorkflowStepCard: React.FC<WorkflowStepCardProps> = ({
  stepNumber,
  duration,
  title,
  description,
  commandSnippet,
  status = 'COMPLETED',
  hue = 'gitlygase',
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
      {/* Top Meta Row */}
      <div className="flex items-start justify-between gap-4 w-full mb-4">
        <div className="flex items-center gap-3">
          {/* Stacked Step Time Chip (R4 Anatomy) */}
          <div className="flex flex-col items-center justify-center w-12 h-14 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-center shrink-0 shadow-inner">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/80 w-full py-0.5 rounded-t-lg">
              STEP
            </span>
            <span className="text-base font-black text-cyan-300">0{stepNumber}</span>
            <span className="text-[9px] text-slate-400 font-mono">{duration}</span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              SYNCHRONOUS GATE
            </span>
            <h4 className="text-base font-bold text-white font-sans tracking-tight truncate">
              {title}
            </h4>
          </div>
        </div>

        {status === 'COMPLETED' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>PASS</span>
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed mb-4">
        {description}
      </p>

      {commandSnippet && (
        <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800/90 font-mono text-xs text-cyan-300 flex items-center justify-between overflow-x-auto">
          <span className="truncate">{commandSnippet}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
        </div>
      )}
    </Card>
  );
};
