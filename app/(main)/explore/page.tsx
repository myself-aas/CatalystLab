'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Zap, 
  Target, 
  RefreshCw, 
  Search, 
  ChevronRight, 
  Filter, 
  Flame, 
  Database, 
  BookOpen, 
  Users,
  Loader2
} from 'lucide-react';
import { CollabSuggestions } from '@/components/ai/CollabSuggestions';
import { ResearchGapPanel } from '@/components/ai/ResearchGapPanel';
import { PaperCard } from '@/components/PaperCard';
import { PostCard } from '@/components/feed/PostCard';
import { Paper } from '@/lib/research-api';
import { Post } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const MOCK_TRENDING_TOPICS = [
  { name: 'Vision Transformers', count: 1250, growth: '+15%' },
  { name: 'Sustainable Farming', count: 850, growth: '+8%' },
  { name: 'Crop Disease Detection', count: 620, growth: '+22%' },
  { name: 'Soil Microbiome', count: 450, growth: '+5%' },
  { name: 'LLM Hallucination', count: 2100, growth: '+45%' },
];

const MOCK_TRENDING_PAPERS: Paper[] = [
  {
    id: 'tp1',
    title: 'Advanced Methodologies in Agricultural Machine Learning Models',
    authors: ['Elena Vance', 'Marcus Thorne'],
    year: 2024,
    abstract: 'This paper explores the application of vision transformers...',
    url: 'https://example.com/paper/tp1',
    pdfUrl: 'https://example.com/paper/tp1.pdf',
    citationCount: 125,
    source: 'ss',
    doi: '10.1038/s41467-024-12345-6',
    journal: 'Nature Communications'
  }
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'matching' | 'gaps' | 'datasets'>('trending');

  const tabs = [
    { id: 'trending', name: 'Trending', icon: Flame },
    { id: 'matching', name: 'Matching', icon: Users },
    { id: 'gaps', name: 'Research Gaps', icon: Target },
    { id: 'datasets', name: 'Datasets', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-[12px] font-black uppercase tracking-widest border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            Discovery Engine
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
            Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Frontier</span>
          </h1>
          <p className="text-lg text-[var(--text-tertiary)] max-w-2xl">
            Discover trending research, find collaborators, and identify unexplored gaps in your field — all powered by AI.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[var(--border-faint)] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 text-[13px] font-black uppercase tracking-widest transition-all relative",
                activeTab === tab.id 
                  ? "text-indigo-400" 
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabExplore"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'trending' && (
            <motion.div 
              key="trending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Trending Topics */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-widest">Hot Topics</h2>
                  <button className="text-[12px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-indigo-400 transition-colors">
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {MOCK_TRENDING_TOPICS.map((topic, i) => (
                    <div key={topic.name} className="p-5 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-3xl space-y-3 hover:border-indigo-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">#{i + 1}</span>
                        <span className="text-[10px] font-black text-emerald-400">{topic.growth}</span>
                      </div>
                      <h4 className="text-[15px] font-black text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">{topic.name}</h4>
                      <p className="text-[12px] text-[var(--text-tertiary)] font-bold">{topic.count} posts</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trending Papers */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-widest">Trending Papers</h2>
                  <button className="text-[12px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-indigo-400 transition-colors">
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {MOCK_TRENDING_PAPERS.map((paper) => (
                    <PaperCard key={paper.id} paper={paper} />
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'matching' && (
            <motion.div 
              key="matching"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CollabSuggestions />
            </motion.div>
          )}

          {activeTab === 'gaps' && (
            <motion.div 
              key="gaps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ResearchGapPanel />
            </motion.div>
          )}

          {activeTab === 'datasets' && (
            <motion.div 
              key="datasets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[400px] flex flex-col items-center justify-center text-center gap-4 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-3xl border-dashed"
            >
              <Database className="w-12 h-12 text-[var(--text-tertiary)]" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Dataset Finder</h3>
                <p className="text-[14px] text-[var(--text-tertiary)] max-w-md">
                  We&apos;re currently indexing Kaggle, Zenodo, and Harvard Dataverse. Check back shortly for the full dataset search.
                </p>
              </div>
              <button className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all">
                Notify Me
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
