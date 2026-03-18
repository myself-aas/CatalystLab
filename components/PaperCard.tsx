'use client';

import React, { useState } from 'react';
import { Paper } from '@/lib/research-api';
import { ExternalLink, Bookmark, Quote, FileDown, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CitationModal } from './CitationModal';

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCite, setShowCite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window === 'undefined') return false;
    const bookmarks = JSON.parse(localStorage.getItem('nl_bookmarks') || '[]');
    return bookmarks.some((b: any) => b.id === paper.id);
  });

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('nl_bookmarks') || '[]');
    if (isBookmarked) {
      const filtered = bookmarks.filter((b: any) => b.id !== paper.id);
      localStorage.setItem('nl_bookmarks', JSON.stringify(filtered));
      setIsBookmarked(false);
    } else {
      bookmarks.push(paper);
      localStorage.setItem('nl_bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
    // Dispatch custom event to notify other components (like My Reports)
    window.dispatchEvent(new Event('bookmarks_updated'));
  };

  const sourceColors: Record<string, string> = {
    ss: 'var(--src-ss)',
    oa: 'var(--src-oa)',
    arxiv: 'var(--src-arxiv)',
    pm: 'var(--src-pm)',
    core: 'var(--src-core)',
    cr: 'var(--src-cr)',
    epmc: 'var(--src-epmc)',
    doaj: 'var(--src-doaj)',
  };

  const sourceLabels: Record<string, string> = {
    ss: 'SS',
    oa: 'OA',
    arxiv: 'arXiv',
    pm: 'PM',
    core: 'CORE',
    cr: 'CR',
    epmc: 'EPMC',
    doaj: 'DOAJ',
  };

  const color = sourceColors[paper.source] || 'var(--text-tertiary)';

  return (
    <div 
      className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4 hover:border-[var(--border-default)] transition-all group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 mb-2">
        <span 
          className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {sourceLabels[paper.source]}
        </span>
        <span className="text-[11px] text-[var(--text-tertiary)] font-mono">{Number.isNaN(paper.year) || !paper.year ? 'n.d.' : paper.year}</span>
        {paper.citationCount > 0 && !Number.isNaN(paper.citationCount) && (
          <span className="text-[11px] text-[var(--text-tertiary)] font-mono flex items-center gap-1">
            <Quote className="w-2.5 h-2.5" /> {paper.citationCount}
          </span>
        )}
        {paper.pdfUrl && (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-[var(--emerald-subtle)] text-[var(--emerald)]">
            PDF
          </span>
        )}
      </div>

      <a href={`/paper/${encodeURIComponent(paper.id)}`} className="block group-hover:text-[var(--accent)] transition-colors">
        <h3 className="text-[14px] font-medium text-[var(--text-primary)] leading-tight mb-1">
          {paper.title}
        </h3>
      </a>
      
      <p className="text-[11px] text-[var(--text-tertiary)] mb-1 line-clamp-1">
        {paper.authors.join(', ')}
      </p>
      
      {paper.journal && (
        <p className="text-[11px] text-[var(--text-secondary)] italic mb-2">
          {paper.journal}
        </p>
      )}

      {paper.abstract && (
        <div className="mb-3">
          <p className={cn(
            "text-[12px] text-[var(--text-secondary)] leading-relaxed transition-all duration-300",
            (!isExpanded && !isHovered) && "line-clamp-2"
          )}>
            {paper.abstract}
          </p>
          {!isHovered && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] text-[var(--accent)] mt-1 flex items-center gap-1 hover:underline"
            >
              {isExpanded ? <>Show less <ChevronUp className="w-3 h-3" /></> : <>Read abstract <ChevronDown className="w-3 h-3" /></>}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-faint)]">
        <a 
          href={paper.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-1.5 rounded-[var(--r-md)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          title="Open Source"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        {paper.pdfUrl && (
          <a 
            href={paper.pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 rounded-[var(--r-md)] text-[var(--emerald)] hover:bg-[var(--emerald-subtle)] transition-all"
            title="Download PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
          </a>
        )}
        <button 
          onClick={toggleBookmark}
          className={cn(
            "p-1.5 rounded-[var(--r-md)] transition-all ml-auto",
            isBookmarked ? "text-[var(--accent)] bg-[var(--accent-subtle)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          )}
          title={isBookmarked ? "Remove Bookmark" : "Bookmark Paper"}
        >
          <Bookmark className={cn("w-3.5 h-3.5", isBookmarked && "fill-current")} />
        </button>
        <button 
          onClick={() => setShowCite(true)}
          className="p-1.5 rounded-[var(--r-md)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          title="Cite Paper"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
      </div>

      {showCite && (
        <CitationModal 
          paper={paper} 
          onClose={() => setShowCite(false)} 
        />
      )}
    </div>
  );
}
