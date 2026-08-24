import React, { useState } from 'react';
import FullscreenCard from './components/ui/FullscreenCard';
import DiagnosticOverlayModal from './components/ui/DiagnosticOverlayModal';
import { ShieldCheck, Zap, Bot, Leaf, Cpu, Layers, Sparkles, Search, ArrowRight, RefreshCcw, Activity } from 'lucide-react';

export function App() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  const cards = [
    {
      id: '1',
      title: 'Core Web Vitals & TTFB',
      subtitle: 'Phase 4 • VitalZyme',
      description: 'Probes TLS handshakes and HTTP/3 viability across 42 global edge points of presence with sub-millisecond precision.',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
      badge: 'VitalZyme Engine',
      score: '99.4',
      metric: '18ms',
      metricLabel: 'Edge TTFB (Optimal)',
      category: 'edge'
    },
    {
      id: '2',
      title: 'OWASP Security & Zero-Trust Headers',
      subtitle: 'Phase 6 • RiskProtector',
      description: 'Executes synchronous AST checks for dependency vulnerabilities, CSP headers, and enterprise compliance metrics automatically.',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      badge: 'RiskProtector',
      score: '100% Strict',
      metric: '6 / 6',
      metricLabel: 'Hardened Headers',
      category: 'security'
    },
    {
      id: '3',
      title: 'LLMO & /llms.txt AI Discovery Pipeline',
      subtitle: 'Phase 3 • Semantic Indexing',
      description: 'Parses entity graphs and markdown manifests to ensure instant indexing by Perplexity, Claude, and GPT search crawlers.',
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
      badge: 'LLM-Kinase',
      score: '+140%',
      metric: '98.2',
      metricLabel: 'Discoverability Index',
      category: 'ai'
    },
    {
      id: '4',
      title: 'Sustainable Web Carbon & AST Optimization',
      subtitle: 'Phase 2 • EcoCatalyst',
      description: 'Calculates precise CO2 emissions per pageview and generates tree-shaking patches for zero-waste production builds.',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
      badge: 'EcoCertified',
      score: '0.08g',
      metric: '100%',
      metricLabel: 'Green Grade A+',
      category: 'esg'
    },
    {
      id: '5',
      title: 'Anycast Edge DNS & TLS 1.3 0-RTT',
      subtitle: 'Phase 1 • Global PoPs',
      description: 'Real-time telemetry and monitoring of edge packet routing, DNS lookup speeds, and global availability guarantees.',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      badge: 'Anycast DNS',
      score: '42 PoPs',
      metric: '140ms',
      metricLabel: 'Global Latency',
      category: 'edge'
    },
    {
      id: '6',
      title: 'Automated GitHub Actions CI/CD Quality Gate',
      subtitle: 'Phase 5 • Pipeline Gate',
      description: 'Enforces 8 synchronous diagnostic engines on every commit, PR, or scheduled Monday CRON release trigger.',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
      badge: 'CI/CD Gate',
      score: '8/8 Passed',
      metric: '0 Errors',
      metricLabel: 'Build Status',
      category: 'security'
    }
  ];

  const filteredCards = cards.filter(card => {
    const matchesCat = activeCategory === 'all' || card.category === activeCategory;
    const matchesQuery = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center font-black shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>CatalystLab</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Fullscreen BG</span>
              </h1>
              <p className="text-xs text-slate-500 font-mono hidden sm:block">Immersive Background Image Cards</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search diagnostic cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black w-60"
              />
            </div>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-mono font-bold uppercase tracking-wider text-slate-800 mb-4">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Fullscreen Image Background Wrapper</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
          Unsplash Image Wrapped Across the Entire Card
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto mt-4 text-sm sm:text-base leading-relaxed font-normal">
          All texts, links, components, UI layouts, and interactive buttons are positioned precisely above the fullscreen background image with high-contrast gradient overlays.
        </p>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {[
            { id: 'all', label: 'All Catalysts' },
            { id: 'edge', label: 'Edge & Latency' },
            { id: 'security', label: 'DevSecOps & OWASP' },
            { id: 'ai', label: 'AI Search & LLMO' },
            { id: 'esg', label: 'ESG Carbon' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-black text-white shadow-lg scale-105'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid of Fullscreen Image Cards */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
        {filteredCards.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Activity className="h-10 w-10 text-slate-400 mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900">No diagnostic cards found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCards.map(card => (
              <FullscreenCard
                key={card.id}
                imageUrl={card.imageUrl}
                imageAlt={card.title}
                badge={card.badge}
                score={card.score}
                subtitle={card.subtitle}
                title={card.title}
                description={card.description}
                metric={card.metric}
                metricLabel={card.metricLabel}
                onClick={() => setSelectedCard(card)}
                action={
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs transition-all border border-white/30 shadow-md">
                    <span>Run Audit</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                }
                footer={card.subtitle}
                aspectRatio="min-h-[460px] w-full"
              />
            ))}
          </div>
        )}
      </main>

      {/* Full-Screen Diagnostic Overlay Modal */}
      {selectedCard && (
        <DiagnosticOverlayModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© CatalystLab Enterprise • Fullscreen Background Imagecard UX</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-black transition-colors cursor-pointer">Documentation</span>
            <span className="hover:text-black transition-colors cursor-pointer">Security Specs</span>
            <span className="hover:text-black transition-colors cursor-pointer">API Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
