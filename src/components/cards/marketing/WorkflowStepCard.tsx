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
      variant="surface"
      hue={hue}
      lift
      className={twMerge(clsx('flex flex-col justify-between p-6 sm:p-8 rounded-3xl', className))}
      {...props}
    >
      {/* Top Meta Row */}
      <div className="flex items-start justify-between gap-5 w-full mb-5">
        <div className="flex items-center gap-4">
          {/* Stacked Step Time Chip (R4 Anatomy) */}
          <div className="flex flex-col items-center justify-center w-14 h-16 rounded-xl bg-muted border border-border font-mono text-center shrink-0 shadow-sm overflow-hidden">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-accent w-full py-1">
              STEP
            </span>
            <span className="text-xl font-black text-indigo-600 bg-background w-full py-0.5">0{stepNumber}</span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-muted-foreground mb-1">
              SYNCHRONOUS GATE
            </span>
            <h4 className="text-lg font-bold text-foreground font-sans tracking-tight truncate">
              {title}
            </h4>
            <span className="text-[11px] text-muted-foreground font-mono mt-1 font-medium">{duration} execution</span>
          </div>
        </div>

        {status === 'COMPLETED' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PASS</span>
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground font-medium font-sans leading-relaxed mb-6">
        {description}
      </p>

      {commandSnippet && (
        <div className="p-3 rounded-xl bg-primary border border-border font-mono text-xs text-emerald-400 flex items-center justify-between overflow-x-auto scrollbar-none touch-pan-x shadow-inner">
          <span className="truncate">{commandSnippet}</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ml-3" />
        </div>
      )}
    </Card>
  );
};
