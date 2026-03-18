'use client';

import React, { useState } from 'react';
import { Paper } from '@/lib/research-api';
import { exportCitations, CitationFormat } from '@/lib/citations';
import { X, Copy, Check, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface ExportModalProps {
  papers: Paper[];
  onClose: () => void;
}

const formats: { label: string; value: CitationFormat; ext: string }[] = [
  { label: 'BibTeX', value: 'bibtex', ext: 'bib' },
  { label: 'RIS', value: 'ris', ext: 'ris' },
  { label: 'APA', value: 'apa', ext: 'txt' },
  { label: 'MLA', value: 'mla', ext: 'txt' },
  { label: 'Chicago', value: 'chicago', ext: 'txt' },
  { label: 'Harvard', value: 'harvard', ext: 'txt' },
  { label: 'Vancouver', value: 'vancouver', ext: 'txt' },
  { label: 'IEEE', value: 'ieee', ext: 'txt' },
  { label: 'AMA', value: 'ama', ext: 'txt' },
  { label: 'Nature', value: 'nature', ext: 'txt' },
  { label: 'CSV', value: 'csv', ext: 'csv' },
  { label: 'JSON', value: 'json', ext: 'json' },
  { label: 'EndNote XML', value: 'endnote_xml', ext: 'xml' },
  { label: 'Word Bib', value: 'word_bib', ext: 'xml' },
];

export function ExportModal({ papers, onClose }: ExportModalProps) {
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set(papers.map(p => p.id)));
  const [activeFormat, setActiveFormat] = useState<CitationFormat>('apa');
  const [copied, setCopied] = useState(false);

  const selectedPaperList = papers.filter(p => selectedPapers.has(p.id));
  const citation = selectedPaperList.map(p => exportCitations(p, activeFormat)).join('\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const format = formats.find(f => f.value === activeFormat);
    const blob = new Blob([citation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citations.${format?.ext || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePaper = (id: string) => {
    const newSelected = new Set(selectedPapers);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedPapers(newSelected);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--r-xl)] w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-faint)]">
          <h3 className="text-[15px] font-medium text-[var(--text-primary)]">Export Citations ({selectedPapers.size} selected)</h3>
          <button onClick={onClose} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 border-r border-[var(--border-faint)] overflow-y-auto p-4">
            {papers.map(paper => (
              <label key={paper.id} className="flex items-center gap-2 p-2 hover:bg-[var(--bg-hover)] rounded-[var(--r-sm)] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedPapers.has(paper.id)} 
                  onChange={() => togglePaper(paper.id)}
                  className="accent-[var(--accent)]"
                />
                <span className="text-[12px] text-[var(--text-secondary)] truncate">{paper.title}</span>
              </label>
            ))}
          </div>
          <div className="w-2/3 p-6 overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
              {formats.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFormat(f.value)}
                  className={`py-1.5 text-[11px] font-medium rounded-[var(--r-sm)] uppercase transition-all ${
                    activeFormat === f.value 
                      ? 'bg-[var(--bg-overlay)] text-[var(--text-primary)] shadow-sm' 
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <pre className="bg-[var(--bg-sunken)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] p-4 text-[13px] text-[var(--text-secondary)] whitespace-pre-wrap font-mono leading-relaxed min-h-[150px] max-h-[300px] overflow-y-auto">
                {citation}
              </pre>
              <div className="absolute top-3 right-3 flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="p-2 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-[var(--emerald)]" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleDownload}
                  className="p-2 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[var(--bg-sunken)] border-t border-[var(--border-faint)] flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
