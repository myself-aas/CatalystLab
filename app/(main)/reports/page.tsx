'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { ZONES } from '@/lib/constants';
import Link from 'next/link';
import { 
  FileText, 
  MoreVertical, 
  ExternalLink, 
  Plus, 
  Clock, 
  ChevronRight, 
  Search, 
  Filter, 
  X, 
  Download, 
  Share2, 
  Trash2, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const { sessions, deleteSession } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState<'all' | 'a' | 'b' | 'c'>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         session.instrumentSlug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = activeZone === 'all' || session.zone === activeZone;
    return matchesSearch && matchesZone;
  }).sort((a, b) => b.timestamp - a.timestamp);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 md:p-10">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h2 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-tight">My Reports</h2>
            <p className="text-[14px] text-[var(--text-secondary)]">A chronological archive of your intellectual discoveries.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Link 
              href="/dashboard"
              className="px-6 py-3 bg-[var(--accent)] text-white text-[13px] font-bold rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all inline-flex items-center justify-center gap-2.5 hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" /> New Session
            </Link>
          </motion.div>
        </header>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input 
              type="text"
              placeholder="Search reports by title or instrument..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] pl-11 pr-4 py-3 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-focus)] transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--bg-sunken)] p-1.5 rounded-full border border-[var(--border-faint)] w-full md:w-auto overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveZone('all')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeZone === 'all' ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              )}
            >
              All
            </button>
            {Object.entries(ZONES).map(([key, zone]) => (
              <button 
                key={key}
                onClick={() => setActiveZone(key as any)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap",
                  activeZone === key ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: zone.color }} />
                {zone.name}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] overflow-hidden"
        >
          <div className="hidden md:grid grid-cols-[180px_1fr_140px_100px] gap-6 px-8 py-4 bg-[var(--bg-overlay)] border-b border-[var(--border-faint)] text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
            <span>Instrument</span>
            <span>Session Title</span>
            <span>Date</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-[var(--border-faint)]">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session, i) => (
                <motion.div 
                  key={session.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.03 }}
                  className="group"
                >
                  {/* Desktop Row */}
                  <div 
                    onClick={() => setSelectedSessionId(session.id)}
                    className="hidden md:grid grid-cols-[180px_1fr_140px_100px] gap-6 px-8 py-5 items-center hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONES[session.zone].color }} />
                      <span className="text-[11px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest truncate">
                        {session.instrumentSlug.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-[15px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1 leading-tight">
                      {session.title}
                    </div>
                    <span className="text-[12px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest">
                      {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Link href={`/instruments/${session.instrumentSlug}?session=${session.id}`} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] rounded-[var(--r-md)] transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => deleteSession(session.id)}
                        className="p-2 text-[var(--text-tertiary)] hover:text-[var(--rose)] hover:bg-[var(--rose-muted)] rounded-[var(--r-md)] transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Card */}
                  <div 
                    onClick={() => setSelectedSessionId(session.id)}
                    className="md:hidden flex items-center p-5 hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ZONES[session.zone].color }} />
                        <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{session.instrumentSlug.replace('-', ' ')}</span>
                      </div>
                      <h3 className="text-[15px] font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors leading-tight">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(session.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)] ml-4" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-24 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-sunken)] flex items-center justify-center mb-6 text-[var(--text-tertiary)]">
                  <FileText className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="text-[16px] font-medium text-[var(--text-secondary)] mb-2">No reports found</h3>
                <p className="text-[13px] text-[var(--text-tertiary)] mb-8">Your intellectual journey hasn&apos;t started yet.</p>
                <Link 
                  href="/dashboard" 
                  className="text-[13px] font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] uppercase tracking-widest flex items-center gap-2"
                >
                  Start your first session <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* SLIDE PANEL */}
      <AnimatePresence>
        {selectedSessionId && selectedSession && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSessionId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[800px] bg-[var(--bg-base)] border-l border-[var(--border-faint)] z-[70] flex flex-col shadow-2xl"
            >
              <header className="flex items-center justify-between p-6 border-b border-[var(--border-faint)]">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ZONES[selectedSession.zone].color }} />
                  <div>
                    <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">{selectedSession.title}</h3>
                    <p className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">
                      {selectedSession.instrumentSlug.replace('-', ' ')} · {new Date(selectedSession.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSessionId(null)}
                  className="p-2 hover:bg-[var(--bg-hover)] rounded-full text-[var(--text-tertiary)] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                <section className="space-y-4">
                  <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Research Input</h4>
                  <div className="p-5 bg-[var(--bg-sunken)] border border-[var(--border-faint)] rounded-[var(--r-lg)] text-[14px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {selectedSession.input}
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">AI Synthesis</h4>
                  <div className="prose prose-invert max-w-none text-[15px] text-[var(--text-primary)] leading-relaxed">
                    {/* Simplified rendering for the preview */}
                    <div className="p-6 bg-[var(--bg-elevated)] border-l-4 border-[var(--accent)] rounded-r-[var(--r-lg)]">
                      {typeof selectedSession.output === 'string' ? selectedSession.output : JSON.stringify(selectedSession.output, null, 2)}
                    </div>
                  </div>
                </section>

                {selectedSession.papers && selectedSession.papers.length > 0 && (
                  <section className="space-y-4">
                    <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Associated Literature ({selectedSession.papers.length})</h4>
                    <div className="space-y-3">
                      {selectedSession.papers.map((paper: any, idx: number) => (
                        <div key={idx} className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] hover:border-[var(--border-strong)] transition-all group">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-[var(--accent-muted)] text-[var(--accent)] text-[10px] font-bold rounded-full uppercase tracking-tighter">
                              {paper.source || 'SS'}
                            </span>
                            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{paper.year}</span>
                          </div>
                          <h5 className="text-[14px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-1">{paper.title}</h5>
                          <p className="text-[12px] text-[var(--text-tertiary)] line-clamp-1">{paper.authors}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <footer className="p-6 border-t border-[var(--border-faint)] bg-[var(--bg-overlay)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] transition-all" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] transition-all" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      deleteSession(selectedSession.id);
                      setSelectedSessionId(null);
                    }}
                    className="px-4 py-2 text-[12px] font-bold text-[var(--rose)] hover:bg-[var(--rose-muted)] rounded-[var(--r-md)] transition-all uppercase tracking-widest"
                  >
                    Delete
                  </button>
                  <Link 
                    href={`/instruments/${selectedSession.instrumentSlug}?session=${selectedSession.id}`}
                    className="px-6 py-2 bg-[var(--accent)] text-white text-[12px] font-bold rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all uppercase tracking-widest flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-run
                  </Link>
                </div>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
