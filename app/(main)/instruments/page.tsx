'use client';

import React, { useState } from 'react';
import { INSTRUMENTS, ZONES } from '@/lib/constants';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export default function InstrumentsPage() {
  const [activeZone, setActiveZone] = useState<'all' | 'a' | 'b' | 'c'>('all');
  const { user, profile } = useAuthStore();
  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Researcher';

  const filteredInstruments = activeZone === 'all' 
    ? INSTRUMENTS 
    : INSTRUMENTS.filter(i => i.zone === activeZone);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-tight">Instruments</h2>
          <p className="text-[14px] text-[var(--text-secondary)]">20 AI-powered brainstorming instruments for researchers.</p>
        </div>
      </header>

      <section className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-wrap gap-1.5 bg-[var(--bg-sunken)] p-1.5 rounded-full border border-[var(--border-faint)]">
            <button 
              onClick={() => setActiveZone('all')}
              className={cn(
                "px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all",
                activeZone === 'all' 
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-md" 
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              )}
            >
              All
            </button>
            {Object.entries(ZONES).map(([key, zone]) => (
              <button 
                key={key}
                onClick={() => setActiveZone(key as any)}
                className={cn(
                  "px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2.5",
                  activeZone === key 
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-md" 
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: zone.color }} />
                {zone.name}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input 
              type="text" 
              placeholder="Search instruments..."
              className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full pl-11 pr-6 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-4 focus:ring-[var(--accent-glow)] transition-all w-full md:w-[300px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInstruments.map((instrument, i) => (
            <Link 
              key={instrument.slug}
              href={`/instruments/${instrument.slug}`}
              className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-6 md:p-8 hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] transition-all relative overflow-hidden h-full flex flex-col shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONES[instrument.zone as keyof typeof ZONES].color }} />
                  <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                    {ZONES[instrument.zone as keyof typeof ZONES].label}
                  </span>
                </div>
              </div>
              <h3 className="text-[17px] font-semibold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors tracking-tight">{instrument.name}</h3>
              <p className="text-[14px] text-[var(--text-tertiary)] line-clamp-2 leading-relaxed flex-1">{instrument.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

