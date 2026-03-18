'use client';

import React, { useState, useEffect } from 'react';
import { Search, FlaskConical, FileText, Settings, Command, X, LayoutGrid, BookOpen, User } from 'lucide-react';
import { INSTRUMENTS, ZONES } from '@/lib/constants';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { sessions } = useApp();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredInstruments = INSTRUMENTS.filter(i => 
    i.name.toLowerCase().includes(query.toLowerCase()) || 
    i.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const actions = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutGrid, href: '/dashboard' },
    { id: 'search', label: 'Literature Search', icon: Search, href: '/search' },
    { id: 'reports', label: 'My Reports', icon: FileText, href: '/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  const allResults = [
    ...filteredInstruments.map(i => ({ type: 'instrument', ...i })),
    ...filteredSessions.map(s => ({ type: 'session', ...s })),
    ...actions.map(a => ({ type: 'action', ...a }))
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % allResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
    } else if (e.key === 'Enter') {
      const selected = allResults[selectedIndex];
      if (selected) {
        if (selected.type === 'instrument') handleSelect(`/instruments/${(selected as any).slug}`);
        else if (selected.type === 'session') handleSelect(`/instruments/${(selected as any).instrumentSlug}?session=${(selected as any).id}`);
        else if (selected.type === 'action') handleSelect((selected as any).href);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-[4px]" 
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div 
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-[560px] bg-[var(--bg-overlay)] border border-[var(--border-strong)] rounded-[var(--r-xl)] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 h-[52px] border-b border-[var(--border-default)]">
              <Search className="w-4 h-4 text-[var(--text-tertiary)] mr-3" />
              <input 
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search instruments, reports, or actions..."
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
              />
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-sm)]">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">esc</span>
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-2 scrollbar-hide">
              {allResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[14px] text-[var(--text-tertiary)]">No results found for &quot;{query}&quot;</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInstruments.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Instruments</div>
                      {filteredInstruments.map((inst, i) => {
                        const globalIndex = i;
                        return (
                          <button 
                            key={inst.slug}
                            onClick={() => handleSelect(`/instruments/${inst.slug}`)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 h-10 rounded-[var(--r-md)] transition-all group text-left",
                              selectedIndex === globalIndex ? "bg-[var(--bg-hover)]" : "transparent"
                            )}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ZONES[inst.zone as keyof typeof ZONES].color }} />
                            <span className="text-[13px] text-[var(--text-primary)] flex-1">{inst.name}</span>
                            <span className="text-[11px] text-[var(--text-tertiary)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {filteredSessions.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Recent Sessions</div>
                      {filteredSessions.map((session, i) => {
                        const globalIndex = filteredInstruments.length + i;
                        return (
                          <button 
                            key={session.id}
                            onClick={() => handleSelect(`/instruments/${session.instrumentSlug}?session=${session.id}`)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 h-10 rounded-[var(--r-md)] transition-all group text-left",
                              selectedIndex === globalIndex ? "bg-[var(--bg-hover)]" : "transparent"
                            )}
                          >
                            <FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                            <span className="text-[13px] text-[var(--text-primary)] flex-1 line-clamp-1">{session.title}</span>
                            <span className="text-[11px] text-[var(--text-tertiary)] font-mono">{new Date(session.timestamp).toLocaleDateString()}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {actions.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Actions</div>
                      {actions.map((action, i) => {
                        const globalIndex = filteredInstruments.length + filteredSessions.length + i;
                        return (
                          <button 
                            key={action.id}
                            onClick={() => handleSelect(action.href)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 h-10 rounded-[var(--r-md)] transition-all group text-left",
                              selectedIndex === globalIndex ? "bg-[var(--bg-hover)]" : "transparent"
                            )}
                          >
                            <action.icon className="w-4 h-4 text-[var(--text-tertiary)]" />
                            <span className="text-[13px] text-[var(--text-primary)] flex-1">{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 bg-[var(--bg-sunken)] border-t border-[var(--border-default)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded text-[9px] font-mono text-[var(--text-tertiary)]">↑↓</kbd>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded text-[9px] font-mono text-[var(--text-tertiary)]">↵</kbd>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">Select</span>
                </div>
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
                CatalystLab Search
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
