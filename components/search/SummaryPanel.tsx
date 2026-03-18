'use client';

import React from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  Target, 
  Wrench, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface SummaryData {
  synthesis: string;
  keyInsights: string[];
  researchGap: string;
  recommendedMethods: string[];
}

interface SummaryPanelProps {
  data: SummaryData | null;
  isLoading: boolean;
  error?: string | null;
}

export function SummaryPanel({ data, isLoading, error }: SummaryPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-[var(--bg-surface2)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Synthesizing Results</h3>
          <p className="text-[14px] text-[var(--text-tertiary)] max-w-[240px]">
            Gemini is analyzing the top research papers to generate a comprehensive overview.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-rose-500">Synthesis Failed</h3>
          <p className="text-[14px] text-[var(--text-tertiary)] max-w-[240px]">
            We couldn&apos;t generate an AI summary at this time.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-surface2)] border border-[var(--border)] rounded-2xl p-6 space-y-8 shadow-xl shadow-black/20"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest">AI Synthesis</h3>
        </div>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed font-medium">
          {data.synthesis}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Lightbulb className="w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest">Key Insights</h3>
        </div>
        <ul className="space-y-3">
          {data.keyInsights.map((insight, i) => (
            <li key={i} className="flex items-start gap-3 group">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors" />
              <span className="text-[14px] text-[var(--text-secondary)] leading-snug">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-indigo-400">
          <Target className="w-4 h-4" />
          <h3 className="text-[12px] font-black uppercase tracking-widest">Research Gap</h3>
        </div>
        <p className="text-[14px] text-[var(--text-secondary)] italic leading-relaxed">
          &quot;{data.researchGap}&quot;
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-purple-400">
          <Wrench className="w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest">Methodologies</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.recommendedMethods.map((method, i) => (
            <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[11px] font-bold">
              {method}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--border-faint)]">
        <button className="w-full flex items-center justify-between p-3 bg-[var(--bg-surface3)] hover:bg-[var(--bg-hover)] rounded-xl text-[13px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all group">
          <span>Explore Next Steps</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
