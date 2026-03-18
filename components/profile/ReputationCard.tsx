'use client';

import React from 'react';
import { Award, TrendingUp, Zap, Star, ShieldCheck, Target } from 'lucide-react';
import { motion } from 'motion/react';

interface ReputationCardProps {
  score: number;
  badges: string[];
}

const BADGE_INFO: Record<string, { icon: any, color: string, label: string }> = {
  'first_post': { icon: Zap, color: 'text-emerald-400 bg-emerald-500/10', label: 'First Post' },
  'prolific_reader': { icon: Star, color: 'text-amber-400 bg-amber-500/10', label: 'Prolific Reader' },
  'top_annotator': { icon: ShieldCheck, color: 'text-indigo-400 bg-indigo-500/10', label: 'Top Annotator' },
  'connector': { icon: TrendingUp, color: 'text-purple-400 bg-purple-500/10', label: 'Connector' },
  'thought_leader': { icon: Award, color: 'text-rose-400 bg-rose-500/10', label: 'Thought Leader' },
  'verified_researcher': { icon: Target, color: 'text-blue-400 bg-blue-500/10', label: 'Verified' },
};

export function ReputationCard({ score, badges }: ReputationCardProps) {
  return (
    <div className="bg-[var(--bg-surface2)] border border-[var(--border)] rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Reputation Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[var(--text-primary)]">{score}</span>
            <span className="text-[12px] font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12 this week
            </span>
          </div>
        </div>
        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
          <Award className="w-8 h-8" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Badges Showcase</h3>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => {
            const info = BADGE_INFO[badge];
            if (!info) return null;
            return (
              <motion.div 
                key={badge}
                whileHover={{ scale: 1.05 }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border border-[var(--border)] gap-2 group cursor-pointer transition-all hover:border-indigo-500/30 ${info.color}`}
              >
                <info.icon className="w-6 h-6" />
                <span className="text-[9px] font-black uppercase tracking-tight text-center leading-tight">
                  {info.label}
                </span>
              </motion.div>
            );
          })}
          {badges.length < 6 && (
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-[var(--border)] gap-2 opacity-30">
              <div className="w-6 h-6 rounded-full border-2 border-current" />
              <span className="text-[9px] font-black uppercase tracking-tight text-center leading-tight">
                Locked
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--border-faint)]">
        <button className="w-full py-2.5 bg-[var(--bg-surface3)] hover:bg-[var(--bg-hover)] rounded-xl text-[12px] font-bold text-[var(--text-secondary)] transition-all">
          View All Achievements
        </button>
      </div>
    </div>
  );
}
