'use client';

import React, { useState, useMemo } from 'react';
import { Paper } from '@/lib/research-api';
import { PaperCard } from './PaperCard';
import { Filter, Loader2, Download, Search, Info } from 'lucide-react';
import { ExportModal } from './ExportModal';
import { cn } from '@/lib/utils';

interface LiteraturePanelProps {
  papers: Paper[];
  isLoading: boolean;
  insight?: string;
}

const SOURCES = [
  { id: 'ss', label: 'SS', color: 'var(--src-ss)' },
  { id: 'oa', label: 'OA', color: 'var(--src-oa)' },
  { id: 'arxiv', label: 'arXiv', color: 'var(--src-arxiv)' },
  { id: 'pm', label: 'PM', color: 'var(--src-pm)' },
  { id: 'core', label: 'CORE', color: 'var(--src-core)' },
  { id: 'cr', label: 'CR', color: 'var(--src-cr)' },
  { id: 'epmc', label: 'EPMC', color: 'var(--src-epmc)' },
  { id: 'doaj', label: 'DOAJ', color: 'var(--src-doaj)' },
];

export function LiteraturePanel({ papers, isLoading, insight }: LiteraturePanelProps) {
  const [showExport, setShowExport] = useState(false);
  const [activeSource, setActiveSource] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'citations' | 'year'>('relevance');

  const filteredPapers = useMemo(() => {
    let result = activeSource === 'all' 
      ? papers 
      : papers.filter(p => p.source.toLowerCase().includes(activeSource.toLowerCase()));

    if (sortBy === 'citations') {
      result = [...result].sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
    } else if (sortBy === 'year') {
      result = [...result].sort((a, b) => (b.year || 0) - (a.year || 0));
    }

    return result;
  }, [papers, activeSource, sortBy]);

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    papers.forEach(p => {
      const src = p.source.toLowerCase();
      SOURCES.forEach(s => {
        if (src.includes(s.id)) {
          counts[s.id] = (counts[s.id] || 0) + 1;
        }
      });
    });
    return counts;
  }, [papers]);

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Related Literature</span>
          <span className="text-[11px] text-[var(--text-tertiary)] font-mono">{papers.length} results</span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => setShowExport(true)}
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] transition-all"
            title="Export all papers"
          >
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] transition-all">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SOURCE FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide no-scrollbar">
        <button 
          onClick={() => setActiveSource('all')}
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all whitespace-nowrap",
            activeSource === 'all' 
              ? "bg-[var(--accent)] text-white" 
              : "bg-[var(--bg-sunken)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] border border-[var(--border-subtle)]"
          )}
        >
          ALL ({papers.length})
        </button>
        {SOURCES.map(source => (
          <button 
            key={source.id}
            onClick={() => setActiveSource(source.id)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
              activeSource === source.id 
                ? "bg-[var(--accent)] text-white" 
                : "bg-[var(--bg-sunken)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] border border-[var(--border-subtle)]"
            )}
          >
            <span style={{ color: activeSource === source.id ? 'white' : source.color }}>●</span>
            {source.label} ({sourceCounts[source.id] || 0})
          </button>
        ))}
      </div>

      {/* SORT BAR */}
      <div className="flex items-center justify-between mb-4 px-1">
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-transparent text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider focus:outline-none cursor-pointer hover:text-[var(--text-secondary)]"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="citations">Sort: Citations ↓</option>
          <option value="year">Sort: Year ↓</option>
        </select>
      </div>

      {/* PAPER LIST */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4 space-y-3 animate-pulse">
                <div className="flex gap-2">
                  <div className="h-3 w-8 bg-[var(--bg-sunken)] rounded-full" />
                  <div className="h-3 w-10 bg-[var(--bg-sunken)] rounded-full" />
                </div>
                <div className="h-4 w-full bg-[var(--bg-sunken)] rounded" />
                <div className="h-3 w-2/3 bg-[var(--bg-sunken)] rounded" />
                <div className="h-10 w-full bg-[var(--bg-sunken)] rounded" />
              </div>
            ))}
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
              <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Searching 9 sources...</span>
            </div>
          </div>
        ) : filteredPapers.length > 0 ? (
          filteredPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-sunken)] flex items-center justify-center mb-4 text-[var(--text-tertiary)]">
              <Search className="w-6 h-6" />
            </div>
            <span className="text-[14px] font-medium text-[var(--text-secondary)] mb-1">No papers found</span>
            <span className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">Try rephrasing your input or adjusting filters.</span>
          </div>
        )}
      </div>

      {/* INSIGHTS STRIP */}
      {insight && !isLoading && (
        <div className="mt-6 p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">AI Literature Insight</span>
          </div>
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed italic">
            &quot;{insight}&quot;
          </p>
        </div>
      )}

      {showExport && (
        <ExportModal 
          papers={papers} 
          onClose={() => setShowExport(false)} 
        />
      )}
    </div>
  );
}
