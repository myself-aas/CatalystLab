'use client';

import React from 'react';
import Image from 'next/image';
import { UserPlus, MessageSquare, Zap, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Suggestion {
  id: string;
  name: string;
  username: string;
  avatar: string;
  position: string;
  matchScore: number;
  sharedInterests: string[];
}

const MOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    name: 'Dr. Elena Vance',
    username: 'evance',
    avatar: 'https://picsum.photos/seed/elena/100/100',
    position: 'Senior Researcher',
    matchScore: 0.95,
    sharedInterests: ['Agricultural AI', 'Deep Learning']
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    username: 'mthorne',
    avatar: 'https://picsum.photos/seed/marcus/100/100',
    position: 'PhD Student',
    matchScore: 0.88,
    sharedInterests: ['Computer Vision', 'Yield Optimization']
  },
  {
    id: '3',
    name: 'Sarah Jenkins',
    username: 'sjenkins',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    position: 'Data Scientist',
    matchScore: 0.82,
    sharedInterests: ['Sustainable Farming']
  }
];

export function CollabSuggestions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-widest">Smart Matching</h2>
        </div>
        <button className="text-[12px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-indigo-400 transition-colors flex items-center gap-1">
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_SUGGESTIONS.map((suggestion, i) => (
          <motion.div 
            key={suggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-3xl space-y-4 group hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0">
                <Image 
                  src={suggestion.avatar} 
                  alt={suggestion.name} 
                  fill
                  className="rounded-2xl border border-[var(--border)] object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
                <div>
                  <h4 className="text-[15px] font-black text-[var(--text-primary)]">{suggestion.name}</h4>
                  <p className="text-[12px] text-indigo-400 font-bold">@{suggestion.username}</p>
                </div>
              </div>
              <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                {Math.round(suggestion.matchScore * 100)}% Match
              </div>
            </div>

            <p className="text-[12px] text-[var(--text-tertiary)] font-medium uppercase tracking-widest">
              {suggestion.position}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {suggestion.sharedInterests.map(interest => (
                <span key={interest} className="px-2 py-0.5 bg-[var(--bg-surface3)] rounded-md text-[10px] font-bold text-[var(--text-secondary)]">
                  {interest}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-500 text-white rounded-xl text-[12px] font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
                <UserPlus className="w-4 h-4" />
                Follow
              </button>
              <button className="p-2 bg-[var(--bg-surface3)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
