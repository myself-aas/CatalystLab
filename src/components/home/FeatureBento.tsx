import React, { useState, useRef } from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { 
  ShieldCheck, 
  Layers, 
  Leaf, 
  Bot, 
  Zap, 
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeatureBento: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

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
      const scrollAmount = 420;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 420;
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
      const cardWidth = 420;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveCardIndex(Math.min(4, Math.max(0, newIndex)));
    }
  };

  return (
    <section className="py-14 lg:py-18 bg-transparent text-brand-offwhite relative overflow-hidden border-b border-brand-slate/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Horizontal Nav Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/40 bg-surface-panel px-3.5 py-1 text-xs sm:text-sm font-mono text-brand-periwinkle mb-3 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Interactive Telemetry Sandboxes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-offwhite">
              Deep Architectural Telemetry Deck
            </h2>
            <p className="text-sm sm:text-base text-brand-periwinkle max-w-xl mt-1.5 leading-relaxed">
              Interact with live diagnostic sandboxes to inspect security headers, DOM render-blocking bottlenecks, carbon budgets, and generative AI search indexing.
            </p>
          </LazyReveal>

          {/* Quick Presets & Carousel Arrow Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Presets */}
            <div className="hidden sm:flex items-center gap-1 bg-surface-panel p-1 rounded-xl border border-brand-slate/40">
              <button
                type="button"
                onClick={() => applyPreset('saas')}
                className="px-2.5 py-1 rounded-lg hover:bg-surface-subtle text-xs font-mono text-brand-periwinkle hover:text-white cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
              >
                SaaS
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ecommerce')}
                className="px-2.5 py-1 rounded-lg hover:bg-surface-subtle text-xs font-mono text-brand-periwinkle hover:text-white cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
              >
                E-Commerce
              </button>
              <button
                type="button"
                onClick={() => applyPreset('content')}
                className="px-2.5 py-1 rounded-lg hover:bg-surface-subtle text-xs font-mono text-brand-periwinkle hover:text-white cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
              >
                Media
              </button>
            </div>

            {/* Carousel Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll left in telemetry deck"
                className="p-2 rounded-xl bg-surface-panel hover:bg-surface-subtle text-brand-periwinkle hover:text-white border border-brand-slate/40 shadow-sm active:scale-95 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono text-brand-periwinkle px-1 font-semibold">
                {activeCardIndex + 1} / 5
              </span>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll right in telemetry deck"
                className="p-2 rounded-xl bg-surface-panel hover:bg-surface-subtle text-brand-periwinkle hover:text-white border border-brand-slate/40 shadow-sm active:scale-95 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Reel */}
        <div className="relative mb-6">
          <div
            ref={scrollContainerRef}
            onScroll={handleScrollEvent}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Telemetry sandboxes horizontal reel"
          >
            
            {/* Card 1: OWASP Security Transport Header Sandbox */}
            <div className="w-[300px] sm:w-[380px] lg:w-[410px] shrink-0 snap-start bg-surface-panel border border-brand-slate/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-brand-slate transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-cyan">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-brand-slate-light uppercase tracking-wider">Phase 6 • RiskProtease</span>
                      <h3 className="text-sm sm:text-base font-bold text-brand-offwhite leading-tight">OWASP Transport Security</h3>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    securityGrade === 'A+'
                      ? 'bg-emerald-950/60 text-accent-emerald border-emerald-500/40'
                      : securityGrade === 'B'
                      ? 'bg-amber-950/60 text-accent-amber border-amber-500/40'
                      : 'bg-rose-950/60 text-accent-rose border-rose-500/40'
                  }`}>
                    {securityGrade} ({activeCount}/6 Strict)
                  </span>
                </div>

                <p className="text-xs text-brand-periwinkle mb-3 leading-relaxed">
                  Click headers to simulate response header defenses against transport attack vectors.
                </p>

                {/* Interactive Header Toggles */}
                <div className="grid grid-cols-2 gap-1.5 font-mono text-xs mb-3">
                  {Object.entries(activeHeaders).map(([header, enabled]) => (
                    <button
                      key={header}
                      type="button"
                      onClick={() => toggleHeader(header)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        enabled
                          ? 'bg-brand-oxford border-accent-cyan/50 text-white'
                          : 'bg-brand-oxford/50 border-brand-slate/30 text-brand-slate-light'
                      }`}
                    >
                      <span className="truncate text-[11px]">{header.replace('Content-', '').replace('Transport-', '')}</span>
                      <span className={`h-3.5 w-3.5 rounded flex items-center justify-center text-[10px] shrink-0 ml-1 font-bold ${
                        enabled ? 'bg-accent-cyan text-brand-navy' : 'bg-brand-slate/30 text-brand-slate-light'
                      }`}>
                        {enabled ? '✓' : '×'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-xs font-mono">
                <span className="text-brand-slate-light">Strict CSP + HSTS</span>
                <Link to="/compliance" className="text-accent-cyan hover:underline flex items-center gap-1 font-bold">
                  <span>Run RiskProtease</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 2: DOM Depth & Render-Tree Inspector */}
            <div className="w-[300px] sm:w-[380px] lg:w-[410px] shrink-0 snap-start bg-surface-panel border border-brand-slate/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-brand-slate transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-cyan">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-brand-slate-light uppercase tracking-wider">Phase 4 • VitalZyme</span>
                      <h3 className="text-sm sm:text-base font-bold text-brand-offwhite leading-tight">DOM Depth &amp; Render-Tree</h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-accent-cyan bg-brand-oxford px-2 py-0.5 rounded border border-brand-slate/30 font-bold">
                    {domDepth} Levels
                  </span>
                </div>

                <p className="text-xs text-brand-periwinkle mb-3 leading-relaxed">
                  Excessive DOM nesting triggers layout thrashing and delays client first-paint.
                </p>

                {/* Slider */}
                <div className="space-y-2.5 bg-brand-oxford p-3 rounded-xl border border-brand-slate/30 mb-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-brand-slate-light">Nesting Depth:</span>
                    <span className="text-accent-cyan font-bold">{domDepth} Levels (Target ≤ 8)</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value={domDepth}
                    onChange={(e) => setDomDepth(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-brand-slate/20 font-mono text-[11px]">
                    <div className="text-brand-periwinkle">
                      Est. Nodes: <span className="text-white font-bold">{estimatedNodes}</span>
                    </div>
                    <div className="text-brand-periwinkle text-right">
                      Main Thread: <span className="text-accent-emerald font-bold">~{renderTimeMs}ms</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-xs font-mono">
                <span className="text-brand-slate-light">W3C Target: ≤ 8</span>
                <Link to="/health" className="text-accent-cyan hover:underline flex items-center gap-1 font-bold">
                  <span>Inspect DOM</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 3: SWD Carbon Budget */}
            <div className="w-[300px] sm:w-[380px] lg:w-[410px] shrink-0 snap-start bg-surface-panel border border-brand-slate/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-brand-slate transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-emerald">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-brand-slate-light uppercase tracking-wider">Phase 3 • EcoHolo</span>
                      <h3 className="text-sm sm:text-base font-bold text-brand-offwhite leading-tight">SWD Carbon Budget</h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-accent-emerald bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                    A+ Green
                  </span>
                </div>

                <p className="text-xs text-brand-periwinkle mb-3 leading-relaxed">
                  Estimate annual emissions savings with Brotli + AVIF payload optimizations.
                </p>

                {/* Traffic Slider */}
                <div className="space-y-2.5 bg-brand-oxford p-3 rounded-xl border border-brand-slate/30 mb-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-brand-slate-light">Monthly Traffic:</span>
                    <span className="text-accent-emerald font-bold">{(monthlyTraffic / 1000).toLocaleString()}k visits</span>
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

                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono flex items-center justify-between">
                    <span className="text-emerald-300">Annual CO2 Saved:</span>
                    <span className="text-accent-emerald font-bold font-mono">{(Number(co2SavedKg) * 12).toFixed(0)} kg CO2e</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-xs font-mono">
                <span className="text-brand-slate-light">Green Web Model</span>
                <Link to="/eco-audit" className="text-accent-emerald hover:underline flex items-center gap-1 font-bold">
                  <span>Run EcoHolo</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 4: AI LLMO Ingestion */}
            <div className="w-[300px] sm:w-[380px] lg:w-[410px] shrink-0 snap-start bg-surface-panel border border-brand-slate/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-brand-slate transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-purple">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-brand-slate-light uppercase tracking-wider">Phase 7 &amp; 8 • LLMO</span>
                      <h3 className="text-sm sm:text-base font-bold text-brand-offwhite leading-tight">AI LLMO Ingestion</h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-accent-purple bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/40 font-bold">
                    98.4% Citations
                  </span>
                </div>

                <p className="text-xs text-brand-periwinkle mb-3 leading-relaxed">
                  Perplexity, SearchGPT &amp; Claude rely on structured JSON-LD &amp; <code className="text-accent-purple">/llms.txt</code> manifests.
                </p>

                {/* Vector Check Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                  <div className="p-2.5 rounded-xl bg-brand-oxford border border-brand-slate/30 space-y-0.5">
                    <div className="text-accent-purple font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span>/llms.txt Found</span>
                    </div>
                    <div className="text-[10px] text-brand-slate-light">
                      24k clean tokens
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-brand-oxford border border-brand-slate/30 space-y-0.5">
                    <div className="text-accent-purple font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span>JSON-LD Schema</span>
                    </div>
                    <div className="text-[10px] text-brand-slate-light">
                      Entity graph verified
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-xs font-mono">
                <span className="text-brand-slate-light">RAG Ready</span>
                <Link to="/ai-readiness" className="text-accent-purple hover:underline flex items-center gap-1 font-bold">
                  <span>Audit AI Readiness</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 5: HTTP/3 QUIC Protocol */}
            <div className="w-[300px] sm:w-[380px] lg:w-[410px] shrink-0 snap-start bg-surface-panel border border-brand-slate/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-brand-slate transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-cyan">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-brand-slate-light uppercase tracking-wider">Phase 5 • EdgeVmax</span>
                      <h3 className="text-sm sm:text-base font-bold text-brand-offwhite leading-tight">HTTP/3 QUIC Protocol</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuicEnabled(!quicEnabled)}
                    className="text-xs font-mono text-accent-cyan bg-brand-oxford px-2 py-0.5 rounded border border-brand-slate/40 font-bold hover:bg-surface-subtle cursor-pointer"
                  >
                    {quicEnabled ? 'QUIC Active' : 'HTTP/1.1'}
                  </button>
                </div>

                <p className="text-xs text-brand-periwinkle mb-3 leading-relaxed">
                  RFC 9114 UDP multiplexing reduces TLS handshakes to zero round trips on repeat requests.
                </p>

                <div className="bg-brand-oxford p-3 rounded-xl border border-brand-slate/30 space-y-1.5 font-mono text-xs mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-slate-light">Measured TTFB:</span>
                    <span className={`font-bold ${quicEnabled ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                      {quicTtfb}ms {quicEnabled ? '(Optimal Edge)' : '(High Latency)'}
                    </span>
                  </div>
                  <div className="text-[11px] text-brand-periwinkle pt-1 border-t border-brand-slate/20 flex items-center justify-between">
                    <span>Handshake Protocol:</span>
                    <span className="text-accent-cyan">{quicHandshake}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-xs font-mono">
                <span className="text-brand-slate-light">42 Anycast PoPs</span>
                <Link to="/latency" className="text-accent-cyan hover:underline flex items-center gap-1 font-bold">
                  <span>Probe Edge PoPs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2, 3, 4].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeCardIndex === idx 
                  ? 'w-6 bg-accent-cyan' 
                  : 'w-1.5 bg-brand-slate/40 hover:bg-brand-slate'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeatureBento;
