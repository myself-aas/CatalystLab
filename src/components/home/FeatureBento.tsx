import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LazyReveal } from '../common/LazyAnimate';
import { 
  ShieldCheck, 
  Layers, 
  Leaf, 
  Bot, 
  Zap, 
  Code2, 
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Lock,
  Globe2,
  Cpu,
  Flame,
  CheckCircle2,
  Radio,
  Sliders
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeatureBento: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Card 1: Interactive OWASP Header Simulator
  const [activeHeaders, setActiveHeaders] = useState<Record<string, boolean>>({
    'Content-Security-Policy': true,
    'Strict-Transport-Security': true,
    'X-Frame-Options': true,
    'X-Content-Type-Options': true,
    'Permissions-Policy': true,
    'Referrer-Policy': true,
  });

  const toggleHeader = (key: string) => {
    setActiveHeaders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeCount = Object.values(activeHeaders).filter(Boolean).length;
  const securityGrade = activeCount === 6 ? 'A+' : activeCount >= 4 ? 'B' : 'F';

  // Card 2: Interactive DOM Depth Slider
  const [domDepth, setDomDepth] = useState<number>(8);
  const estimatedNodes = Math.round(domDepth * 62 + 40);
  const renderTimeMs = (domDepth * 2.8).toFixed(1);

  // Card 3: Carbon Footprint Calculator
  const [monthlyTraffic, setMonthlyTraffic] = useState<number>(100000);
  const legacyCo2Kg = ((monthlyTraffic * 1.84) / 1000).toFixed(1);
  const optimizedCo2Kg = ((monthlyTraffic * 0.08) / 1000).toFixed(1);
  const co2SavedKg = (Number(legacyCo2Kg) - Number(optimizedCo2Kg)).toFixed(1);

  // Card 5: QUIC / HTTP/3 Simulator
  const [quicEnabled, setQuicEnabled] = useState<boolean>(true);
  const quicTtfb = quicEnabled ? 18 : 142;
  const quicHandshake = quicEnabled ? '0-RTT (TLS 1.3)' : '3-RTT (TCP+TLS 1.2)';

  // Presets for quick interaction
  const applyPreset = (preset: 'ecommerce' | 'saas' | 'content') => {
    if (preset === 'ecommerce') {
      setMonthlyTraffic(500000);
      setDomDepth(14);
      setActiveHeaders({
        'Content-Security-Policy': true,
        'Strict-Transport-Security': true,
        'X-Frame-Options': true,
        'X-Content-Type-Options': true,
        'Permissions-Policy': false,
        'Referrer-Policy': true,
      });
      setQuicEnabled(true);
    } else if (preset === 'saas') {
      setMonthlyTraffic(250000);
      setDomDepth(7);
      setActiveHeaders({
        'Content-Security-Policy': true,
        'Strict-Transport-Security': true,
        'X-Frame-Options': true,
        'X-Content-Type-Options': true,
        'Permissions-Policy': true,
        'Referrer-Policy': true,
      });
      setQuicEnabled(true);
    } else {
      setMonthlyTraffic(1000000);
      setDomDepth(6);
      setActiveHeaders({
        'Content-Security-Policy': true,
        'Strict-Transport-Security': true,
        'X-Frame-Options': false,
        'X-Content-Type-Options': true,
        'Permissions-Policy': true,
        'Referrer-Policy': true,
      });
      setQuicEnabled(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 460;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 460;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setActiveCardIndex(index);
    }
  };

  const handleScrollEvent = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 460;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveCardIndex(Math.min(4, Math.max(0, newIndex)));
    }
  };

  return (
    <section className="py-14 lg:py-16 bg-gradient-to-b from-brand-navy via-[#0e2138] to-[#0d1b2a] text-white relative overflow-hidden border-b border-brand-slate/30">
      {/* Background Lighting Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(65,90,119,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(65,90,119,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Horizontal Nav Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/60 bg-brand-navy px-3.5 py-1 text-sm font-mono text-brand-periwinkle mb-2 shadow-[0_0_20px_rgba(65,90,119,0.2)]">
              <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
              <span>Interactive Telemetry Sandboxes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Deep Architectural Telemetry Deck
            </h2>
            <p className="text-sm sm:text-base text-brand-periwinkle max-w-xl mt-1 leading-relaxed">
              Swipe or scroll horizontally through live diagnostic sandboxes to inspect security headers, DOM render-blocking bottlenecks, carbon budgets, and generative AI search indexing.
            </p>
          </LazyReveal>

          {/* Quick Presets & Carousel Arrow Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Presets */}
            <div className="hidden sm:flex items-center gap-1.5 bg-brand-navy p-1 rounded-xl border border-brand-slate/40">
              <button
                type="button"
                onClick={() => applyPreset('saas')}
                className="px-2.5 py-1 rounded-lg hover:bg-[#162a45] text-sm font-mono text-brand-periwinkle cursor-pointer transition-colors"
              >
                SaaS
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ecommerce')}
                className="px-2.5 py-1 rounded-lg hover:bg-[#162a45] text-sm font-mono text-brand-periwinkle cursor-pointer transition-colors"
              >
                E-Commerce
              </button>
              <button
                type="button"
                onClick={() => applyPreset('content')}
                className="px-2.5 py-1 rounded-lg hover:bg-[#162a45] text-sm font-mono text-brand-periwinkle cursor-pointer transition-colors"
              >
                Media
              </button>
            </div>

            {/* Carousel Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll left in telemetry deck"
                className="p-2.5 rounded-xl bg-brand-oxford hover:bg-[#162a45] text-brand-periwinkle hover:text-white border border-brand-slate/50 shadow-md active:scale-95 cursor-pointer transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-mono text-[#8ea8c3] px-1 font-semibold">
                {activeCardIndex + 1} / 5
              </span>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll right in telemetry deck"
                className="p-2.5 rounded-xl bg-brand-oxford hover:bg-[#162a45] text-brand-periwinkle hover:text-white border border-brand-slate/50 shadow-md active:scale-95 cursor-pointer transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HORIZONTAL SCROLLING CAROUSEL REEL
        ========================================================================= */}
        <div className="relative">
          {/* Subtle Right Gradient Hint */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brand-navy to-transparent pointer-events-none z-10 hidden md:block" />

          <div
            ref={scrollContainerRef}
            onScroll={handleScrollEvent}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 pt-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Telemetry sandboxes horizontal reel"
          >
            
            {/* Card 1: OWASP Security Transport Header Sandbox */}
            <div className="w-[310px] sm:w-[420px] lg:w-[460px] shrink-0 snap-start bg-brand-oxford/95 backdrop-blur-md border border-brand-slate/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-[#38bdf8]/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-brand-slate/30 border border-brand-slate/50 text-[#38bdf8]">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-[#8ea8c3] uppercase tracking-wider">Phase 6 • RiskProtease</span>
                      <h3 className="text-base font-bold text-white leading-tight">OWASP Transport Security</h3>
                    </div>
                  </div>
                  <span className={`text-sm font-mono font-black px-2 py-0.5 rounded-lg border ${
                    securityGrade === 'A+'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : securityGrade === 'B'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  }`}>
                    {securityGrade} ({activeCount}/6 Strict)
                  </span>
                </div>

                <p className="text-sm text-brand-periwinkle mb-4 leading-relaxed">
                  Click headers to simulate response header defenses against transport attack vectors.
                </p>

                {/* Interactive Header Toggles */}
                <div className="grid grid-cols-2 gap-2 font-mono text-sm mb-4">
                  {Object.entries(activeHeaders).map(([header, enabled]) => (
                    <button
                      key={header}
                      type="button"
                      onClick={() => toggleHeader(header)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        enabled
                          ? 'bg-[#162a45] border-[#38bdf8]/50 text-white shadow-xs'
                          : 'bg-brand-navy border-brand-slate/30 text-[#8ea8c3] hover:border-brand-slate'
                      }`}
                    >
                      <span className="truncate text-xs">{header.replace('Content-', '').replace('Transport-', '')}</span>
                      <span className={`h-3.5 w-3.5 rounded flex items-center justify-center text-xs shrink-0 ml-1 font-bold ${
                        enabled ? 'bg-[#38bdf8] text-brand-navy' : 'bg-brand-slate/30 text-[#8ea8c3]'
                      }`}>
                        {enabled ? '✓' : '×'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-sm font-mono">
                <span className="text-[#8ea8c3] text-sm">Strict CSP + HSTS Preload</span>
                <Link to="/risk" className="text-[#38bdf8] hover:text-white flex items-center gap-1 font-bold">
                  <span>Run RiskProtease</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 2: Live DOM Recursion & Render-Tree Inspector */}
            <div className="w-[310px] sm:w-[420px] lg:w-[460px] shrink-0 snap-start bg-brand-oxford/95 backdrop-blur-md border border-brand-slate/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-[#38bdf8]/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-brand-slate/30 border border-brand-slate/50 text-[#38bdf8]">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-[#8ea8c3] uppercase tracking-wider">Phase 4 • VitalZyme</span>
                      <h3 className="text-base font-bold text-white leading-tight">DOM Depth & Render-Tree</h3>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-[#38bdf8] bg-brand-navy px-2 py-0.5 rounded border border-brand-slate/30 font-bold">
                    {domDepth} Levels
                  </span>
                </div>

                <p className="text-sm text-brand-periwinkle mb-4 leading-relaxed">
                  Excessive DOM nesting triggers layout thrashing and delays client first-paint.
                </p>

                {/* Slider */}
                <div className="space-y-3 bg-brand-navy p-3.5 rounded-2xl border border-brand-slate/30 mb-4">
                  <div className="flex items-center justify-between text-sm font-mono">
                    <span className="text-[#8ea8c3]">Nesting Depth:</span>
                    <span className="text-[#38bdf8] font-bold">{domDepth} Levels (Target ≤ 8)</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value={domDepth}
                    onChange={(e) => setDomDepth(Number(e.target.value))}
                    className="w-full accent-[#38bdf8] cursor-pointer"
                  />
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-slate/20 font-mono text-xs">
                    <div className="text-brand-periwinkle">
                      Est. Nodes: <span className="text-white font-bold">{estimatedNodes}</span>
                    </div>
                    <div className="text-brand-periwinkle text-right">
                      Main Thread: <span className="text-[#34d399] font-bold">~{renderTimeMs}ms</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-sm font-mono">
                <span className="text-[#8ea8c3] text-sm">W3C Baseline: ≤ 8 Levels</span>
                <Link to="/vital" className="text-[#38bdf8] hover:text-white flex items-center gap-1 font-bold">
                  <span>Inspect DOM</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 3: Sustainable Web Design (SWD) Carbon Calculator */}
            <div className="w-[310px] sm:w-[420px] lg:w-[460px] shrink-0 snap-start bg-brand-oxford/95 backdrop-blur-md border border-brand-slate/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-emerald-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-400">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-[#8ea8c3] uppercase tracking-wider">Phase 3 • EcoHolo</span>
                      <h3 className="text-base font-bold text-white leading-tight">SWD Carbon Budget</h3>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                    A+ Green
                  </span>
                </div>

                <p className="text-sm text-brand-periwinkle mb-4 leading-relaxed">
                  Estimate annual emissions savings with Brotli + AVIF payload optimizations.
                </p>

                {/* Traffic Slider */}
                <div className="space-y-3 bg-brand-navy p-3.5 rounded-2xl border border-brand-slate/30 mb-4">
                  <div className="flex items-center justify-between text-sm font-mono">
                    <span className="text-[#8ea8c3]">Monthly Traffic:</span>
                    <span className="text-emerald-400 font-bold">{(monthlyTraffic / 1000).toLocaleString()}k visits</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="10000"
                    value={monthlyTraffic}
                    onChange={(e) => setMonthlyTraffic(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />

                  <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-sm font-mono flex items-center justify-between">
                    <span className="text-emerald-300">Annual CO2 Prevented:</span>
                    <span className="text-emerald-400 font-bold font-mono">{(Number(co2SavedKg) * 12).toFixed(0)} kg CO2e</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-sm font-mono">
                <span className="text-[#8ea8c3] text-sm">Green Web Foundation</span>
                <Link to="/eco" className="text-emerald-400 hover:text-white flex items-center gap-1 font-bold">
                  <span>Run EcoHolo</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 4: Generative Engine Optimization (LLMO) & AI Search Citation Index */}
            <div className="w-[310px] sm:w-[420px] lg:w-[460px] shrink-0 snap-start bg-brand-oxford/95 backdrop-blur-md border border-brand-slate/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-purple-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-400">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-[#8ea8c3] uppercase tracking-wider">Phase 7 & 8 • LLMO</span>
                      <h3 className="text-base font-bold text-white leading-tight">AI LLMO Ingestion</h3>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/40 font-bold">
                    98.4% Citations
                  </span>
                </div>

                <p className="text-sm text-brand-periwinkle mb-4 leading-relaxed">
                  Perplexity, SearchGPT & Claude rely on structured JSON-LD & <code className="text-purple-300">/llms.txt</code> manifests.
                </p>

                {/* Vector Check Matrix */}
                <div className="grid grid-cols-2 gap-2 text-sm font-mono mb-4">
                  <div className="p-2.5 rounded-xl bg-brand-navy border border-brand-slate/30 space-y-0.5">
                    <div className="text-purple-300 font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span>/llms.txt Found</span>
                    </div>
                    <div className="text-xs text-[#8ea8c3]">
                      24,000 clean tokens
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-brand-navy border border-brand-slate/30 space-y-0.5">
                    <div className="text-purple-300 font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span>JSON-LD Schema</span>
                    </div>
                    <div className="text-xs text-[#8ea8c3]">
                      Entity graph verified
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-sm font-mono">
                <span className="text-[#8ea8c3] text-sm">RAG Vector Chunk Ready</span>
                <Link to="/ai-readiness" className="text-purple-400 hover:text-white flex items-center gap-1 font-bold">
                  <span>Audit AI Readiness</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 5: HTTP/3 & QUIC 0-RTT Protocol Prober */}
            <div className="w-[310px] sm:w-[420px] lg:w-[460px] shrink-0 snap-start bg-brand-oxford/95 backdrop-blur-md border border-brand-slate/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-sky-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-950/50 border border-sky-500/40 text-sky-400">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-[#8ea8c3] uppercase tracking-wider">Phase 5 • EdgeVmax</span>
                      <h3 className="text-base font-bold text-white leading-tight">HTTP/3 QUIC Protocol</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuicEnabled(!quicEnabled)}
                    className="text-sm font-mono text-sky-300 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-500/40 font-bold hover:bg-sky-900 cursor-pointer"
                  >
                    {quicEnabled ? 'QUIC Active' : 'HTTP/1.1'}
                  </button>
                </div>

                <p className="text-sm text-brand-periwinkle mb-4 leading-relaxed">
                  RFC 9114 UDP multiplexing reduces TLS handshakes to zero round trips on repeat requests.
                </p>

                <div className="bg-brand-navy p-3.5 rounded-2xl border border-brand-slate/30 space-y-2 font-mono text-sm mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#8ea8c3]">Measured TTFB:</span>
                    <span className={`font-bold ${quicEnabled ? 'text-[#34d399]' : 'text-rose-400'}`}>
                      {quicTtfb}ms {quicEnabled ? '(Optimal Edge)' : '(High Latency)'}
                    </span>
                  </div>
                  <div className="text-xs text-brand-periwinkle pt-1 border-t border-brand-slate/20 flex items-center justify-between">
                    <span>Handshake Protocol:</span>
                    <span className="text-sky-300">{quicHandshake}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-sm font-mono">
                <span className="text-[#8ea8c3] text-sm">42 Global Anycast PoPs</span>
                <Link to="/edge" className="text-sky-400 hover:text-white flex items-center gap-1 font-bold">
                  <span>Probe Edge PoPs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Carousel Indicators (Dots) */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {[0, 1, 2, 3, 4].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeCardIndex === idx 
                  ? 'w-7 bg-[#38bdf8]' 
                  : 'w-2 bg-brand-slate/40 hover:bg-brand-slate'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeatureBento;
