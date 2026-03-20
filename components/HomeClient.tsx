'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowRight, 
  Sparkles, 
  Search, 
  Zap, 
  Loader2, 
  ChevronRight, 
  FlaskConical, 
  Check, 
  Globe,
  Database,
  FileText,
  Shield,
  Clock,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Paper, searchAll } from '@/lib/research-api';
import { PaperCard } from '@/components/PaperCard';
import { useRouter } from 'next/navigation';
import { INSTRUMENTS, ZONES } from '@/lib/constants';

function DemoSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [papers, setPapers] = useState<Paper[]>([]);

  const handleDemoSearch = async () => {
    if (!query.trim() || isSearching) return;
    setIsSearching(true);
    try {
      const results = await searchAll(query);
      setPapers(results.slice(0, 3));
    } catch (error) {
      console.error("Demo Search Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="relative group">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paste a research question, hypothesis, or abstract..."
          className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-xl)] p-6 text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-4 focus:ring-[var(--accent-glow)] transition-all min-h-[160px] resize-none"
        />
        <button
          onClick={handleDemoSearch}
          disabled={isSearching || !query.trim()}
          className={cn(
            "absolute bottom-4 right-4 h-11 px-6 flex items-center justify-center gap-2 rounded-[var(--r-md)] text-[14px] font-medium transition-all",
            isSearching 
              ? "bg-[var(--bg-hover)] text-[var(--text-tertiary)] cursor-not-allowed" 
              : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 active:scale-[0.98]"
          )}
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Find related literature <Search className="w-4 h-4" /></>
          )}
        </button>
      </div>

      <AnimatePresence>
        {papers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
          >
            {papers.map((paper, i) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <PaperCard paper={paper} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MouseFollower() {
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, var(--accent-glow), transparent 60%)`,
        opacity: 0.35,
        transition: 'background 0.3s ease-out'
      }}
    />
  );
}

export function HomeClient() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeZone, setActiveZone] = useState<'all' | 'a' | 'b' | 'c'>('all');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#5b5bf6] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  const filteredInstruments = activeZone === 'all' 
    ? INSTRUMENTS 
    : INSTRUMENTS.filter(i => i.zone === activeZone);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--bg-selection)] overflow-x-hidden">
      <MouseFollower />
      {/* CSS Dot Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle, var(--text-primary) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* SECTION 1 — NAVIGATION BAR */}
      <nav className={cn(
        "hidden md:flex fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b",
        isScrolled 
          ? "bg-[#17171e]/95 backdrop-blur-md border-[var(--border-faint)] py-2.5 md:py-3" 
          : "bg-transparent border-transparent py-4 md:py-5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 border-[1.5px] border-[var(--text-primary)] rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-[1.5px] border-[var(--text-primary)] rounded-full opacity-50" />
              </div>
              <div className="w-1.5 h-1.5 bg-[var(--text-primary)] rounded-full z-10" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[16px] sm:text-[17px] font-medium text-[var(--text-primary)]">Catalyst</span>
              <span className="text-[16px] sm:text-[17px] font-normal text-[var(--text-primary)]">Lab</span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-4 ml-auto">
            <Link href="/login" className="text-[12px] sm:text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2">Sign in</Link>
            <Link href="/login" className="px-3.5 py-1.5 sm:px-5 sm:py-2 bg-[var(--accent)] text-white text-[12px] sm:text-[13px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all whitespace-nowrap shadow-sm">
              Get started free
            </Link>
          </div>
        </div>

      </nav>

      <main className="relative z-10">
        {/* SECTION 2 — HERO */}
        <section className="pt-16 md:pt-24 pb-12 md:pb-16 px-6 max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/20 text-[var(--accent)] text-[11px] font-medium uppercase tracking-[0.07em] mb-8"
          >
            <span className="text-base">⚗️</span>
            20 AI Research Instruments · 9 Literature Sources
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[36px] md:text-[52px] lg:text-[72px] font-black leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto bg-clip-text text-transparent bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)]"
          >
            Stop digging.<br className="hidden md:block" /> Start discovering.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[17px] md:text-[20px] text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            AI brains + 9 academic sources. You write the vibes, we find the science. <span className="text-[var(--accent)] font-bold italic">Zero paywalls, 100% results.</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
          >
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-[var(--accent)] text-white text-[15px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group">
              Start thinking for free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#instruments" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] text-[15px] font-medium rounded-[var(--r-md)] hover:bg-[var(--bg-hover)] transition-all">
              See all 20 instruments
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-[var(--text-tertiary)]"
          >
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[var(--emerald)]" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[var(--emerald)]" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[var(--emerald)]" /> 9 data sources</span>
          </motion.div>
        </section>

        {/* SECTION 3 — LIVE DEMO */}
        <section id="search" className="py-16 px-6 max-w-5xl mx-auto text-center border-t border-[var(--border-faint)]">
          <div className="mb-8">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-3 block">Try it now — no account needed</span>
            <h2 className="text-[26px] md:text-[32px] font-semibold text-[var(--text-primary)] mb-3">Paste any research text below</h2>
            <p className="text-[14px] text-[var(--text-secondary)]">CatalystLab will extract concepts and find related literature across 9 sources.</p>
          </div>

          <DemoSearch />
        </section>

        {/* SECTION 4 — SOCIAL PROOF */}
        <section className="py-24 px-6 bg-[var(--bg-base)] border-y border-[var(--border-faint)]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              "The Pressure Chamber found three flaws in my methodology I'd missed.",
              "I ran the Temporal Telescope on my topic. The future horizons changed my thesis direction.",
              "Nothing like this exists in any research tool I've used."
            ].map((quote, i) => (
              <div key={i} className="p-8 bg-[#17171e] border border-[var(--border-subtle)] rounded-[var(--r-xl)]">
                <p className="text-[15px] text-[var(--text-secondary)] italic leading-relaxed">
                  &quot;{quote}&quot;
                </p>
              </div>
            ))}
          </div>
             {/* SECTION 5 — INSTRUMENTS SHOWCASE */}
        <section id="instruments" className="py-16 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-3 block">20 INSTRUMENTS · 3 ZONES</span>
            <h2 className="text-[28px] md:text-[34px] font-semibold text-[var(--text-primary)] mb-6">Explore the thinking toolkit</h2>
            
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-10">
              <button 
                onClick={() => setActiveZone('all')}
                className={cn(
                  "px-3.5 py-1 rounded-full text-[11px] font-medium transition-all border",
                  activeZone === 'all' 
                    ? "bg-[var(--bg-active)] border-[var(--border-strong)] text-[var(--text-primary)]" 
                    : "bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                All
              </button>
              {Object.entries(ZONES).map(([key, zone]) => (
                <button 
                  key={key}
                  onClick={() => setActiveZone(key as any)}
                  className={cn(
                    "px-3.5 py-1 rounded-full text-[11px] font-medium transition-all border flex items-center gap-1.5",
                    activeZone === key 
                      ? "bg-[var(--bg-active)] border-[var(--border-strong)] text-[var(--text-primary)]" 
                      : "bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: zone.color }} />
                  {zone.name}
                </button>
              ))}
            </div>
          </div>
 
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            <AnimatePresence mode="popLayout">
              {filteredInstruments.map((instrument) => (
                <motion.div
                  key={instrument.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    href="/login"
                    className="group block p-4 h-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-hover)] transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ZONES[instrument.zone as keyof typeof ZONES].color }} />
                        <span className="text-[9px] font-mono font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                          {ZONES[instrument.zone as keyof typeof ZONES].label}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--accent)] transition-colors">{instrument.name}</h3>
                    <p className="text-[12px] text-[var(--text-tertiary)] leading-snug line-clamp-2">{instrument.description}</p>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
 
          <div className="text-center">
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white text-[14px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--accent)]/20">
              Explore all 20 instruments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
        </section>

        {/* SECTION 6 — HOW IT WORKS */}
        <section className="py-24 px-6 bg-[var(--bg-base)] border-y border-[var(--border-faint)] relative">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { step: "01", title: "Describe", desc: "Write anything from one sentence to a full paragraph describing your research intent." },
                { step: "02", title: "Think", desc: "Choose an instrument. AI structures your research thinking and identifies hidden patterns." },
                { step: "03", title: "Discover", desc: "Related literature from 9 academic sources appears automatically alongside your thinking." }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -5 }}
                  className="group space-y-4 p-8 rounded-[var(--r-xl)] border border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-sunken)] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-bold text-[16px] group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-300 shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="text-[20px] font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{item.title}</h3>
                  <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SECTION 7 — 9 LITERATURE SOURCES */}
        <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
          <div className="text-center mb-12">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-4 block text-center">POWERED BY 9 FREE ACADEMIC SOURCES</span>
          </div>
          
          <div className="flex overflow-x-auto pb-8 gap-4 no-scrollbar items-center justify-start md:justify-center">
            {[
              { id: 'SS', name: 'Semantic Scholar', color: 'var(--src-ss)', url: 'https://www.semanticscholar.org/' },
              { id: 'OA', name: 'OpenAlex', color: 'var(--src-oa)', url: 'https://openalex.org/' },
              { id: 'arXiv', name: 'arXiv', color: 'var(--src-arxiv)', url: 'https://arxiv.org/' },
              { id: 'PM', name: 'PubMed', color: 'var(--src-pm)', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
              { id: 'CORE', name: 'CORE', color: 'var(--src-core)', url: 'https://core.ac.uk/' },
              { id: 'CR', name: 'Crossref', color: 'var(--src-cr)', url: 'https://www.crossref.org/' },
              { id: 'EPMC', name: 'Europe PMC', color: 'var(--src-epmc)', url: 'https://europepmc.org/' },
              { id: 'DOAJ', name: 'DOAJ', color: 'var(--src-doaj)', url: 'https://doaj.org/' },
              { id: '↗', name: 'Unpaywall', color: 'var(--src-upw)', url: 'https://unpaywall.org/' }
            ].map((source) => (
              <motion.a 
                key={source.id} 
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer"
              >
                <div className="px-4 py-1.5 rounded-full text-[11px] font-mono font-bold border transition-all group-hover:shadow-lg" 
                     style={{ 
                       backgroundColor: `${source.color}1a`, 
                       color: source.color, 
                       borderColor: `${source.color}33`,
                       boxShadow: `0 0 0 transparent`
                     }}>
                  {source.id}
                </div>
                <span className="text-[11px] text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors whitespace-nowrap">{source.name}</span>
              </motion.a>
            ))}
          </div>
          <p className="text-center text-[13px] text-[var(--text-tertiary)]">Zero paywalls. All sources are completely free.</p>
        </section>

        {/* SECTION 9 — FOOTER */}
        <footer className="py-20 bg-[var(--bg-elevated)] border-t border-[var(--border-faint)] px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-[1.5px] border-[var(--text-primary)] rounded-full flex items-center justify-center relative">
                  <div className="w-1 h-1 bg-[var(--text-primary)] rounded-full" />
                </div>
                <span className="text-[15px] font-medium text-[var(--text-primary)]">CatalystLab</span>
              </div>
              <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">
                Think at the edge of knowledge. AI brainstorming + live literature discovery for researchers.
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)] mb-6">Product</h4>
              <ul className="space-y-4 text-[13px] text-[var(--text-tertiary)]">
                <li><Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Dashboard</Link></li>
                <li><Link href="#instruments" className="hover:text-[var(--text-primary)] transition-colors">Instruments</Link></li>
                <li><Link href="/reviews" className="hover:text-[var(--text-primary)] transition-colors">Living Reviews</Link></li>
                <li><Link href="/reports" className="hover:text-[var(--text-primary)] transition-colors">Reports</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)] mb-6">Resources</h4>
              <ul className="space-y-4 text-[13px] text-[var(--text-tertiary)]">
                <li><Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms of Service</Link></li>
                <li><a href="mailto:support@catalystlab.tech" className="hover:text-[var(--text-primary)] transition-colors">Support</a></li>
                <li><a href="https://github.com/myself-aas/CatalystLab" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">GitHub <ExternalLink className="w-3 h-3" /></a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)] mb-6">Research Sources</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-[var(--text-tertiary)]">
                <a href="https://www.semanticscholar.org/" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">Semantic Scholar</a>
                <a href="https://openalex.org/" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">OpenAlex</a>
                <a href="https://arxiv.org/" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">arXiv</a>
                <a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">PubMed</a>
                <a href="https://core.ac.uk/" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">CORE</a>
                <a href="https://www.crossref.org/" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">Crossref</a>
                <a href="https://europepmc.org/" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">Europe PMC</a>
                <a href="https://doaj.org/" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">DOAJ</a>
                <a href="https://unpaywall.org/" target="_blank" className="hover:text-[var(--text-primary)] transition-colors">Unpaywall</a>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[var(--border-faint)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[var(--text-tertiary)]">© 2026 CatalystLab · Built for researchers, by researchers</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

