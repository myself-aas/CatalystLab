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
  Menu, 
  X,
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

export function HomeClient() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      {/* CSS Dot Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle, var(--text-primary) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* SECTION 1 — NAVIGATION BAR */}
      <nav className={cn(
        "hidden md:flex fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b",
        isScrolled 
          ? "bg-[#17171e]/95 backdrop-blur-md border-[var(--border-faint)] py-3" 
          : "bg-transparent border-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border-[1.5px] border-[var(--text-primary)] rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-[1.5px] border-[var(--text-primary)] rounded-full opacity-50" />
              </div>
              <div className="w-1.5 h-1.5 bg-[var(--text-primary)] rounded-full z-10" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[17px] font-medium text-[var(--text-primary)]">Catalyst</span>
              <span className="text-[17px] font-normal text-[var(--text-primary)]">Lab</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-[var(--text-secondary)]">
            <Link href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</Link>
            <Link href="#instruments" className="hover:text-[var(--text-primary)] transition-colors">Instruments</Link>
            <Link href="#about" className="hover:text-[var(--text-primary)] transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Sign in</Link>
            <Link href="/login" className="px-5 py-2 bg-[var(--accent)] text-white text-[13px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all">
              Get started free
            </Link>
            <button 
              className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-[#17171e] border-b border-[var(--border-faint)] p-6 flex flex-col gap-6 lg:hidden"
            >
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-medium text-[var(--text-primary)]">Features</Link>
              <Link href="#instruments" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-medium text-[var(--text-primary)]">Instruments</Link>
              <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-medium text-[var(--text-primary)]">Pricing</Link>
              <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-medium text-[var(--text-primary)]">About</Link>
              <div className="h-px bg-[var(--border-faint)]" />
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-medium text-[var(--text-primary)]">Sign in</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10">
        {/* SECTION 2 — HERO */}
        <section className="pt-32 md:pt-48 pb-24 md:pb-32 px-6 max-w-7xl mx-auto text-center">
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
            className="text-[36px] md:text-[52px] lg:text-[64px] font-semibold leading-[1.1] tracking-tight mb-8 text-[var(--text-primary)] max-w-4xl mx-auto"
          >
            Think at the edge<br className="hidden md:block" /> of knowledge
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[16px] md:text-[18px] text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            AI brainstorming instruments + automatic literature discovery. 
            Write anything — CatalystLab finds the science.
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
        <section id="search" className="py-24 px-6 max-w-5xl mx-auto text-center border-t border-[var(--border-faint)]">
          <div className="mb-12">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-4 block">Try it now — no account needed</span>
            <h2 className="text-[30px] md:text-[38px] font-semibold text-[var(--text-primary)] mb-4">Paste any research text below</h2>
            <p className="text-[15px] text-[var(--text-secondary)]">CatalystLab will extract concepts and find related literature across 9 sources.</p>
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
        </section>

        {/* SECTION 5 — INSTRUMENTS SHOWCASE */}
        <section id="instruments" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-4 block">20 INSTRUMENTS · 3 ZONES</span>
            <h2 className="text-[30px] md:text-[38px] font-semibold text-[var(--text-primary)] mb-8">Explore the thinking toolkit</h2>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              <button 
                onClick={() => setActiveZone('all')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[12px] font-medium transition-all border",
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
                    "px-4 py-1.5 rounded-full text-[12px] font-medium transition-all border flex items-center gap-2",
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredInstruments.map((instrument, i) => (
              <Link 
                key={instrument.slug} 
                href="/login"
                className="group p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONES[instrument.zone as keyof typeof ZONES].color }} />
                    <span className="text-[10px] font-mono font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                      {ZONES[instrument.zone as keyof typeof ZONES].label}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
                <h3 className="text-[16px] font-medium text-[var(--text-primary)] mb-2">{instrument.name}</h3>
                <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">{instrument.description}</p>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent)] text-white text-[15px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all">
              Explore all instruments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* SECTION 6 — HOW IT WORKS */}
        <section className="py-32 px-6 bg-[var(--bg-base)] border-y border-[var(--border-faint)]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { step: "01", title: "Describe", desc: "Write anything from one sentence to a full paragraph describing your research intent." },
                { step: "02", title: "Think", desc: "Choose an instrument. AI structures your research thinking and identifies hidden patterns." },
                { step: "03", title: "Discover", desc: "Related literature from 9 academic sources appears automatically alongside your thinking." }
              ].map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-semibold text-[14px]">
                    {item.step}
                  </div>
                  <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">{item.title}</h3>
                  <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7 — 9 LITERATURE SOURCES */}
        <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
          <div className="text-center mb-12">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)] mb-4 block">POWERED BY 9 FREE ACADEMIC SOURCES</span>
          </div>
          
          <div className="flex overflow-x-auto pb-8 gap-4 no-scrollbar items-center justify-start md:justify-center">
            {[
              { id: 'SS', name: 'Semantic Scholar', color: 'var(--src-ss)' },
              { id: 'OA', name: 'OpenAlex', color: 'var(--src-oa)' },
              { id: 'arXiv', name: 'arXiv', color: 'var(--src-arxiv)' },
              { id: 'PM', name: 'PubMed', color: 'var(--src-pm)' },
              { id: 'CORE', name: 'CORE', color: 'var(--src-core)' },
              { id: 'CR', name: 'Crossref', color: 'var(--src-cr)' },
              { id: 'EPMC', name: 'Europe PMC', color: 'var(--src-epmc)' },
              { id: 'DOAJ', name: 'DOAJ', color: 'var(--src-doaj)' },
              { id: '↗', name: 'Unpaywall', color: 'var(--src-upw)' }
            ].map((source) => (
              <div key={source.id} className="flex flex-col items-center gap-3 shrink-0">
                <div className="px-4 py-1.5 rounded-full text-[11px] font-mono font-bold border" 
                     style={{ backgroundColor: `${source.color}1a`, color: source.color, borderColor: `${source.color}33` }}>
                  {source.id}
                </div>
                <span className="text-[11px] text-[var(--text-tertiary)] whitespace-nowrap">{source.name}</span>
              </div>
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
              <p className="text-[11px] text-[var(--text-tertiary)]">© 2026 CatalystLab. All rights reserved.</p>
            </div>

            <div>
              <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)] mb-6">Product</h4>
              <ul className="space-y-4 text-[13px] text-[var(--text-tertiary)]">
                <li><Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Dashboard</Link></li>
                <li><Link href="#instruments" className="hover:text-[var(--text-primary)] transition-colors">Instruments</Link></li>
                <li><Link href="/reviews" className="hover:text-[var(--text-primary)] transition-colors">Living Reviews</Link></li>
                <li><Link href="/reports" className="hover:text-[var(--text-primary)] transition-colors">Reports</Link></li>
                <li><Link href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</Link></li>
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
                <span>Semantic Scholar</span>
                <span>OpenAlex</span>
                <span>arXiv</span>
                <span>PubMed</span>
                <span>CORE</span>
                <span>Crossref</span>
                <span>Europe PMC</span>
                <span>DOAJ</span>
                <span>Unpaywall</span>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[var(--border-faint)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[var(--text-tertiary)]">Built for researchers, by researchers · Bangladesh 🇧🇩</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

