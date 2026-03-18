'use client';

import React from 'react';
import { Target, TrendingUp, Zap, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Gap {
  id: string;
  title: string;
  description: string;
  difficulty: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  topic: string;
}

const MOCK_GAPS: Gap[] = [
  {
    id: '1',
    title: 'Long-term Impact of AI on Soil Health',
    description: 'Current research focuses on yield, but lack of data on how AI-driven precision farming affects long-term soil microbiome health.',
    difficulty: 'high',
    impact: 'high',
    topic: 'Sustainable Farming'
  },
  {
    id: '2',
    title: 'Cross-domain Validation of Crop Models',
    description: 'Models trained on wheat often fail on rice. Need for cross-domain transfer learning architectures in agriculture.',
    difficulty: 'medium',
    impact: 'high',
    topic: 'Deep Learning'
  },
  {
    id: '3',
    title: 'Edge Computing for Remote Farms',
    description: 'Lack of lightweight models that can run on low-power IoT devices in areas with zero connectivity.',
    difficulty: 'medium',
    impact: 'medium',
    topic: 'IoT'
  }
];

export function ResearchGapPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-400">
          <Target className="w-5 h-5" />
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-widest">Research Gaps</h2>
        </div>
        <button className="text-[12px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-rose-400 transition-colors flex items-center gap-1">
          Explore All Gaps
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_GAPS.map((gap, i) => (
          <motion.div 
            key={gap.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-3xl space-y-4 group hover:border-rose-500/30 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-md text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
                {gap.topic}
              </span>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  gap.difficulty === 'high' ? 'bg-rose-500' : gap.difficulty === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
                  {gap.difficulty}
                </span>
              </div>
            </div>

            <h4 className="text-[16px] font-black text-[var(--text-primary)] leading-tight group-hover:text-rose-400 transition-colors">
              {gap.title}
            </h4>

            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
              {gap.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-faint)]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">High Impact</span>
              </div>
              <button className="text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                Start Thread
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-4">
        <div className="p-2 bg-indigo-500/10 rounded-xl">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <p className="text-[13px] font-bold text-[var(--text-primary)]">AI Gap Detection Active</p>
          <p className="text-[12px] text-[var(--text-tertiary)]">We&apos;re analyzing 250M+ papers to find unexplored research directions for you.</p>
        </div>
      </div>
    </div>
  );
}
