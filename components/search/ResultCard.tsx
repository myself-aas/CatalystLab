'use client';

import React, { useState } from 'react';
import { Paper } from '@/lib/types';
import { 
  ExternalLink, 
  FileText, 
  Quote, 
  Plus, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Calendar,
  User,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ResultCardProps {
  paper: Paper;
}

export function ResultCard({ paper }: ResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sourceColors: Record<string, string> = {
    'Semantic Scholar': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'OpenAlex': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'arXiv': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'PubMed': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'CORE': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'CrossRef': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Europe PMC': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  };

  return (
    <motion.div 
      layout
      className="bg-[var(--bg-surface2)] border border-[var(--border)] rounded-2xl p-5 hover:border-indigo-500/30 transition-all group shadow-sm hover:shadow-xl hover:shadow-black/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              sourceColors[paper.source || ''] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
            )}>
              {paper.source}
            </span>
            {paper.citation_count > 100 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-3 h-3" />
                Highly Cited
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug group-hover:text-indigo-400 transition-colors">
            {paper.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--text-tertiary)]">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[200px]">
                {paper.authors.slice(0, 3).join(', ')}
                {paper.authors.length > 3 && ' et al.'}
              </span>
            </div>
            {paper.year && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{paper.year}</span>
              </div>
            )}
            {paper.journal && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px] italic">{paper.journal}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {paper.pdf_url && (
            <a 
              href={paper.pdf_url || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors"
              title="View PDF"
            >
              <FileText className="w-5 h-5" />
            </a>
          )}
          <a 
            href={paper.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-colors"
            title="Open Source"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      <AnimatePresence>
        {paper.abstract && (
          <div className="mt-4">
            <div className={cn(
              "text-[14px] text-[var(--text-secondary)] leading-relaxed",
              !isExpanded && "line-clamp-3"
            )}>
              {paper.abstract}
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1 text-[12px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isExpanded ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Read Abstract <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-5 pt-4 border-t border-[var(--border-faint)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Citations</span>
            <span className="text-[14px] font-black text-[var(--text-primary)]">{paper.citation_count}</span>
          </div>
          {paper.fields_of_study && paper.fields_of_study.length > 0 && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Field</span>
              <span className="text-[14px] font-medium text-[var(--text-primary)] truncate max-w-[150px]">
                {paper.fields_of_study[0]}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface3)] border border-[var(--border)] rounded-xl text-[12px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/50 transition-all">
            <Plus className="w-4 h-4" />
            Save
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface3)] border border-[var(--border)] rounded-xl text-[12px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/50 transition-all">
            <Quote className="w-4 h-4" />
            Cite
          </button>
          <button className="p-2 bg-[var(--bg-surface3)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/50 transition-all">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
