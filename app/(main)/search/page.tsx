'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PaperCard } from '@/components/PaperCard';
import { useApp } from '@/lib/context';
import { Paper, searchAll } from '@/lib/research-api';
import { 
  Search, 
  Database, 
  Loader2, 
  Sparkles, 
  Filter, 
  Download, 
  Save, 
  ChevronDown,
  BookOpen,
  ArrowRight,
  FlaskConical,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

import { extractConcepts, synthesizePapers } from '@/lib/gemini';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [synthesis, setSynthesis] = useState<{
    keyFinding: string;
    researchGap: string;
    suggestedMethods: string;
  } | null>(null);
  const [activeSources, setActiveSources] = useState<string[]>(['ss', 'oa', 'arxiv', 'pm', 'core', 'cr', 'epmc', 'doaj']);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setIsSynthesizing(true);
    setError(null);
    setPapers([]);
    setSynthesis(null);
    setConcepts([]);

    try {
      // 1. Extract concepts via Gemini
      let searchKeywords = [query];
      try {
        const data = await extractConcepts(query);
        setConcepts(data.keywords || []);
        if (data.keywords?.length > 0) {
          searchKeywords = data.keywords;
        }
      } catch (err) {
        console.warn('Concept extraction failed, using raw query', err);
      }

      // 2. Perform search across 9 sources
      const results = await searchAll(searchKeywords.join(' '));
      setPapers(results);
      setIsLoading(false);

      // 3. Synthesize findings
      if (results.length > 0) {
        try {
          const synthData = await synthesizePapers(results.slice(0, 8));
          setSynthesis({
            keyFinding: synthData.synthesis || 'No key finding detected.',
            researchGap: synthData.researchGap || 'No obvious research gap identified in this set.',
            suggestedMethods: synthData.recommendedMethods?.join(', ') || 'Standard empirical methods recommended.'
          });
        } catch (err) {
          console.warn('Synthesis failed', err);
        }
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'An unexpected error occurred during search.');
      setIsLoading(false);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const sources = [
    { id: 'ss', name: 'SS', color: 'var(--src-ss)' },
    { id: 'oa', name: 'OA', color: 'var(--src-oa)' },
    { id: 'arxiv', name: 'arXiv', color: 'var(--src-arxiv)' },
    { id: 'pm', name: 'PM', color: 'var(--src-pm)' },
    { id: 'core', name: 'CORE', color: 'var(--src-core)' },
    { id: 'cr', name: 'CR', color: 'var(--src-cr)' },
    { id: 'epmc', name: 'EPMC', color: 'var(--src-epmc)' },
    { id: 'doaj', name: 'DOAJ', color: 'var(--src-doaj)' },
  ];

  const toggleSource = (id: string) => {
    setActiveSources(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const filteredPapers = papers.filter(p => activeSources.includes(p.source));

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
            {/* SEARCH HEADER */}
            <div className={cn(
              "transition-all duration-500 ease-in-out",
              papers.length > 0 ? "text-left" : "text-center py-12 md:py-20"
            )}>
              <AnimatePresence mode="wait">
                {papers.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 mb-12"
                  >
                    <div className="w-16 h-16 bg-[var(--accent-subtle)] text-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <Database className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-[32px] md:text-[42px] font-bold text-[var(--text-primary)] tracking-tight">Search the literature</h2>
                      <p className="text-[16px] text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Paste a paragraph, abstract, question, or any research text. CatalystLab finds the science across 9 academic sources.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group">
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Paste research text or enter a topic..."
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--r-xl)] p-6 pr-16 text-[16px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] min-h-[120px] focus:outline-none focus:border-[var(--border-focus)] focus:ring-4 focus:ring-[var(--accent-glow)] transition-all resize-none leading-relaxed shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSearch();
                    }
                  }}
                />
                <button 
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="absolute bottom-6 right-6 w-12 h-12 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl hover:-translate-y-1 active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                </button>
                <div className="absolute -bottom-6 left-6 text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">
                  Press ⌘ + Enter to search
                </div>
              </form>

              {papers.length === 0 && (
                <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                  {sources.map(src => (
                    <div 
                      key={src.id}
                      className="px-4 py-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[11px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: src.color }} />
                      {src.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RESULTS STATE */}
            {papers.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* LEFT: RESULTS */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Results</div>
                      <h3 className="text-[18px] font-bold text-[var(--text-primary)]">{filteredPapers.length} papers found</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                      {sources.map(src => (
                        <button 
                          key={src.id}
                          onClick={() => toggleSource(src.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all border",
                            activeSources.includes(src.id)
                              ? "bg-[var(--bg-active)] border-[var(--border-strong)] text-[var(--text-primary)]"
                              : "bg-[var(--bg-sunken)] border-[var(--border-faint)] text-[var(--text-tertiary)] opacity-50 grayscale"
                          )}
                          style={{ borderColor: activeSources.includes(src.id) ? src.color : undefined }}
                        >
                          {src.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredPapers.map((paper, i) => (
                      <motion.div
                        key={`${paper.source}-${paper.id}-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <PaperCard paper={paper} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: AI SYNTHESIS */}
                <div className="lg:col-span-4 sticky top-24 space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-6 shadow-sm space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">AI Synthesis</div>
                      {isSynthesizing && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />}
                    </div>

                    <div className="space-y-8">
                      <section className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--emerald)] uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" />
                          Key Finding
                        </div>
                        {isSynthesizing ? (
                          <div className="space-y-2">
                            <div className="h-3 bg-[var(--bg-sunken)] rounded animate-pulse w-full" />
                            <div className="h-3 bg-[var(--bg-sunken)] rounded animate-pulse w-4/5" />
                          </div>
                        ) : (
                          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                            {synthesis?.keyFinding || "Analyzing literature landscape..."}
                          </p>
                        )}
                      </section>

                      <section className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--rose)] uppercase tracking-wider">
                          <Filter className="w-3.5 h-3.5" />
                          Research Gap
                        </div>
                        {isSynthesizing ? (
                          <div className="space-y-2">
                            <div className="h-3 bg-[var(--bg-sunken)] rounded animate-pulse w-full" />
                            <div className="h-3 bg-[var(--bg-sunken)] rounded animate-pulse w-3/4" />
                          </div>
                        ) : (
                          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                            {synthesis?.researchGap || "Identifying unexplored frontiers..."}
                          </p>
                        )}
                      </section>

                      <section className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                          <FlaskConical className="w-3.5 h-3.5" />
                          Suggested Methods
                        </div>
                        {isSynthesizing ? (
                          <div className="space-y-2">
                            <div className="h-3 bg-[var(--bg-sunken)] rounded animate-pulse w-full" />
                            <div className="h-3 bg-[var(--bg-sunken)] rounded animate-pulse w-2/3" />
                          </div>
                        ) : (
                          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                            {synthesis?.suggestedMethods || "Proposing methodological approaches..."}
                          </p>
                        )}
                      </section>
                    </div>

                    <div className="pt-6 border-t border-[var(--border-faint)] flex items-center justify-between">
                      <button className="text-[11px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2 transition-colors">
                        <Save className="w-3.5 h-3.5" /> Save Search
                      </button>
                      <button className="text-[11px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export
                      </button>
                    </div>
                  </motion.div>

                  {concepts.length > 0 && (
                    <div className="p-6 bg-[var(--bg-sunken)] border border-[var(--border-faint)] rounded-[var(--r-xl)] space-y-4">
                      <div className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Extracted Concepts</div>
                      <div className="flex flex-wrap gap-2">
                        {concepts.map(concept => (
                          <span key={concept} className="px-3 py-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full text-[11px] text-[var(--text-secondary)]">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {!isLoading && query && papers.length === 0 && !error && (
              <div className="py-20 text-center space-y-6">
                <div className="w-16 h-16 bg-[var(--bg-sunken)] rounded-full flex items-center justify-center mx-auto text-[var(--text-tertiary)]">
                  <Search className="w-8 h-8 opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[18px] font-bold text-[var(--text-primary)]">No papers found</h3>
                  <p className="text-[14px] text-[var(--text-secondary)] max-w-md mx-auto">
                    We couldn&apos;t find any papers matching your query across 9 sources. Try broadening your search or using different keywords.
                  </p>
                </div>
              </div>
            )}

            {/* ERROR STATE */}
            {error && (
              <div className="py-20 text-center space-y-6">
                <div className="w-16 h-16 bg-[var(--rose-muted)] text-[var(--rose)] rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Search Error</h3>
                  <p className="text-[14px] text-[var(--text-secondary)] max-w-md mx-auto">{error}</p>
                </div>
                <button 
                  onClick={() => handleSearch()}
                  className="px-6 py-2 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-[var(--r-md)] text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                >
                  Retry Search
                </button>
              </div>
            )}
          </div>
        </div>
    </>
  );
}
