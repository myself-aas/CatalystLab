'use client';

import React, { useState, useEffect } from 'react';
import { INSTRUMENTS, ZONES } from '@/lib/constants';
import { ArrowRight, Search, Sparkles, Clock, LayoutGrid, Zap, ShieldAlert, MessageSquare, Repeat, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { getUserUsage, USER_DAILY_LIMIT } from '@/lib/usageSystem';

export default function DashboardPage() {
  const { sessions } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeZone, setActiveZone] = useState<'all' | 'a' | 'b' | 'c'>('all');
  const { user, profile } = useAuthStore();
  const [usage, setUsage] = useState<number | null>(null);
  const [timeToReset, setTimeToReset] = useState('');

  useEffect(() => {
    if (user) {
      const fetchUsage = async () => {
        const data = await getUserUsage(user.uid);
        setUsage(data.daily_requests);
        
        // Calculate time to reset (next midnight UTC)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setUTCHours(24, 0, 0, 0);
        const diff = tomorrow.getTime() - now.getTime();
        
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeToReset(`${h}h ${m}m ${s}s`);
      };

      fetchUsage();
      const timer = setInterval(fetchUsage, 10000); // Update every 10s
      return () => clearInterval(timer);
    }
  }, [user]);

  const handleQuickRun = (slug: string) => {
    if (query.trim()) {
      router.push(`/instruments/${slug}?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/instruments/${slug}`);
    }
  };

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Researcher';
  
  const filteredInstruments = activeZone === 'all' 
    ? INSTRUMENTS 
    : INSTRUMENTS.filter(i => i.zone === activeZone);

  const quickPicks = [
    { slug: 'thought-collider', name: 'Thought Collider', icon: Zap },
    { slug: 'pressure-chamber', name: 'Pressure Chamber', icon: ShieldAlert },
    { slug: 'the-oracle', name: 'The Oracle', icon: MessageSquare },
    { slug: 'analogical-lab', name: 'Analogical Lab', icon: Repeat },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-12 pb-24">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h2 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {displayName}.
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)]">What are you thinking about today?</p>
        </motion.div>
        
        {usage !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] px-5 py-3 flex items-center gap-6 shadow-sm"
          >
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Daily Usage</div>
              <div className="text-[14px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  usage < USER_DAILY_LIMIT ? "bg-[var(--emerald)]" : "bg-[var(--rose)]"
                )} />
                {usage} / {USER_DAILY_LIMIT} runs
              </div>
            </div>
            <div className="w-px h-8 bg-[var(--border-faint)]" />
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Resets In</div>
              <div className="text-[14px] font-mono text-[var(--accent)] font-medium">{timeToReset}</div>
            </div>
          </motion.div>
        )}
      </header>

      {/* QUICK START BOX */}
      <section>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-6 md:p-10 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative group mb-8">
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe a research problem, question, or topic..."
              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-lg)] p-6 text-[16px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] min-h-[160px] focus:outline-none focus:border-[var(--border-focus)] focus:ring-4 focus:ring-[var(--accent-glow)] transition-all resize-none leading-relaxed"
            />
            <button 
              onClick={() => router.push(`/search?q=${encodeURIComponent(query.trim())}`)}
              disabled={!query.trim()}
              className="absolute bottom-5 right-5 w-12 h-12 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl hover:-translate-y-1 active:scale-95"
              title="Search Literature"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {quickPicks.map(pick => (
                <button 
                  key={pick.slug}
                  onClick={() => handleQuickRun(pick.slug)}
                  className="px-5 py-2.5 rounded-[var(--r-md)] border border-[var(--border-default)] bg-[var(--bg-base)] text-[13px] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all flex items-center gap-2.5 font-medium"
                >
                  <pick.icon className="w-4 h-4" />
                  {pick.name}
                </button>
              ))}
            </div>
            
            <div className="text-[12px] text-[var(--text-tertiary)] font-mono flex items-center gap-2.5 bg-[var(--bg-sunken)] px-4 py-2 rounded-full border border-[var(--border-faint)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              Select an instrument to begin thinking
            </div>
          </div>
        </motion.div>
      </section>

      {/* RECENT SESSIONS */}
      {sessions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-[11px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Recent Sessions</span>
            </div>
            <Link href="/reports" className="text-[12px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-bold transition-colors uppercase tracking-wider">View all reports →</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {sessions.slice(0, 5).map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Link 
                  href={`/instruments/${session.instrumentSlug}?session=${session.id}`}
                  className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-5 hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] transition-all flex flex-col h-full shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ZONES[session.zone].color }} />
                    <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase truncate tracking-wider">
                      {session.instrumentSlug.replace('-', ' ')}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-medium text-[var(--text-primary)] line-clamp-2 mb-6 flex-1 group-hover:text-[var(--accent)] transition-colors leading-snug">
                    {session.title}
                  </h4>
                  <div className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest">
                    {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* INSTRUMENTS GRID */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="w-4 h-4 text-[var(--text-tertiary)]" />
            <span className="text-[11px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">All Instruments</span>
          </div>
          
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
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInstruments.map((instrument, i) => (
            <motion.div
              key={instrument.slug}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.02 }}
            >
              <Link 
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
                  <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
                <h4 className="text-[17px] font-semibold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors tracking-tight">{instrument.name}</h4>
                <p className="text-[14px] text-[var(--text-tertiary)] line-clamp-2 leading-relaxed flex-1">{instrument.description}</p>
                
                <div className="mt-6 flex items-center gap-2 text-[11px] font-mono text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <FlaskConical className="w-3 h-3" />
                  <span>Open Instrument</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
