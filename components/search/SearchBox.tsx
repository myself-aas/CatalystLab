'use client';

import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBox({ onSearch, isLoading }: SearchBoxProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative group">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your research question, paste an abstract, or enter any text..."
          className="w-full min-h-[160px] bg-[var(--bg-surface2)] border border-[var(--border)] rounded-2xl p-6 pr-16 text-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none shadow-xl shadow-black/20"
          disabled={isLoading}
        />
        <div className="absolute right-4 bottom-4 flex items-center gap-3">
          <span className="text-[11px] text-[var(--text-tertiary)] font-medium hidden sm:block">
            ⌘ + Enter to search
          </span>
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Search className="w-6 h-6" />
            )}
          </button>
        </div>
        {!query && !isLoading && (
          <div className="absolute left-6 top-6 pointer-events-none flex items-center gap-2 text-indigo-400/50">
            <Sparkles className="w-5 h-5" />
          </div>
        )}
      </form>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {['Climate change impact on rice yield', 'LLM hallucination mitigation', 'CRISPR in agriculture'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setQuery(suggestion);
              onSearch(suggestion);
            }}
            className="px-3 py-1.5 bg-[var(--bg-surface3)] border border-[var(--border)] rounded-full text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/50 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
