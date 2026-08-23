import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LazyReveal } from '../common/LazyAnimate';
import { SDLC_CATALYSTS_LIST } from '../../data/engines';
import type { EngineMeta } from '../../types';
import { 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Activity, 
  Cpu, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Leaf,
  Globe,
  GitBranch,
  Terminal,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EngineExplorer: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedEngineId, setSelectedEngineId] = useState<string>(SDLC_CATALYSTS_LIST[0].id);
  const [terminalViewMode, setTerminalViewMode] = useState<'probe' | 'code' | 'specs'>('probe');
  const [activeEngineIndex, setActiveEngineIndex] = useState<number>(0);

  const activeEngine = SDLC_CATALYSTS_LIST.find((e) => e.id === selectedEngineId) || SDLC_CATALYSTS_LIST[0];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const selectEngine = (engine: EngineMeta, idx: number) => {
    setSelectedEngineId(engine.id);
    setActiveEngineIndex(idx);
  };

  const handleScrollEvent = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 320;
      const newIndex = Math.round(scrollLeft / cardWidth);
      const boundedIndex = Math.min(SDLC_CATALYSTS_LIST.length - 1, Math.max(0, newIndex));
      setActiveEngineIndex(boundedIndex);
    }
  };

  const getEngineIcon = (id: string) => {
    switch (id) {
      case 'health': return Activity;
      case 'ai-readiness': return Cpu;
      case 'repo-scanner': return Terminal;
      case 'latency': return Globe;
      case 'eco-audit': return Leaf;
      case 'compliance': return ShieldCheck;
      case 'migration': return GitBranch;
      case 'llmo': return Sparkles;
      default: return Activity;
    }
  };

  const ActiveIcon = getEngineIcon(activeEngine.id);

  return (
    <section className="ds-section ds-surface-alt text-zinc-950 relative overflow-hidden">
      <div className="ds-page-shell">
        
        {/* Section Header & Carousel Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <LazyReveal direction="up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950">
              The 8 Autonomous SDLC Catalysts
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 max-w-xl mt-3 leading-relaxed">
              Explore our 8 synchronous telemetry engines. Select any catalyst to inspect diagnostic vectors, RFC compliance, and live remediation code.
            </p>
          </LazyReveal>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll engines left"
              disabled={activeEngineIndex === 0}
              className="min-h-11 min-w-11 rounded-full bg-white text-zinc-600 border border-zinc-200 shadow-sm transition-colors hover:bg-zinc-50 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-zinc-600 px-2 font-semibold">
              {activeEngineIndex + 1} / {SDLC_CATALYSTS_LIST.length}
            </span>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll engines right"
              disabled={activeEngineIndex === 0}
              className="min-h-11 min-w-11 rounded-full bg-white text-zinc-600 border border-zinc-200 shadow-sm transition-colors hover:bg-zinc-50 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            HORIZONTAL SCROLLING ENGINE CARDS REEL
        ========================================================================= */}
        <div className="relative mb-8">
          <div
            ref={scrollContainerRef}
            onScroll={handleScrollEvent}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Autonomous SDLC catalysts horizontal carousel"
          >
            {SDLC_CATALYSTS_LIST.map((engine, idx) => {
              const isSelected = selectedEngineId === engine.id;
              const IconComp = getEngineIcon(engine.id);

              return (
                <button
                  type="button"
                  key={engine.id}
                  onClick={() => selectEngine(engine, idx)}
                  aria-pressed={isSelected}
                  className={`w-[280px] sm:w-[310px] shrink-0 snap-start p-4.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-zinc-50 border-zinc-950 shadow-md ring-1 ring-zinc-950/20'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-zinc-200/50' : 'bg-zinc-100'} `}>
                        <IconComp className={`h-4 w-4 ${isSelected ? 'text-zinc-950' : 'text-zinc-500'}`} />
                      </div>
                      <span className="text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">
                        {engine.category}
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold tracking-tight ${isSelected ? 'text-zinc-950' : 'text-zinc-700'}`}>
                      {engine.name}
                    </h3>
                  </div>
                  <div className="mt-4 text-xs text-zinc-500 font-mono">
                    {engine.keyVectors?.length || 0} Telemetry Vectors
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            ACTIVE ENGINE COMPACT INSPECTION DECK
        ========================================================================= */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEngine.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Details Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-600">
                    <ActiveIcon className="h-3.5 w-3.5 text-zinc-950" />
                    <span>{activeEngine.sdlcPhase}</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 bg-white px-3 py-1.5 rounded-full border border-zinc-200">
                    Category: {activeEngine.category}
                  </span>
                </div>

                <div className="flex gap-5">
                  {activeEngine.image && (
                    <div className="hidden sm:block shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm relative">
                      <img 
                        src={activeEngine.image} 
                        alt={activeEngine.name}
                        className="w-full h-full object-cover grayscale-[0.2]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
                      {activeEngine.catalystName || activeEngine.name}
                    </h3>
                    <p className="text-base text-zinc-600 leading-relaxed mt-2">
                      {activeEngine.description}
                    </p>
                  </div>
                </div>

                {/* Key Vectors Checked */}
                {activeEngine.keyVectors && activeEngine.keyVectors.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeEngine.keyVectors.map((vector, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 text-sm text-zinc-700 p-3 rounded-xl border border-zinc-200 bg-zinc-50"
                        >
                          <CheckCircle2 className="h-4 w-4 text-zinc-950 shrink-0 mt-0.5" />
                          <span className="leading-snug">{vector}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    to={activeEngine.route}
                    className="inline-flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white px-5 py-3 rounded-full text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                  >
                    <span>Launch {activeEngine.name}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/docs#${activeEngine.docsAnchor || activeEngine.id}`}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 text-zinc-950 border border-zinc-200 px-5 py-3 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                  >
                    <Code2 className="h-4 w-4" />
                    <span>Documentation</span>
                  </Link>
                </div>
              </div>

              {/* Right Telemetry Terminal */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-sm font-mono text-xs">
                  {/* Top Mode Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-zinc-300" />
                      <span className="h-2 w-2 rounded-full bg-zinc-300" />
                      <span className="h-2 w-2 rounded-full bg-zinc-300" />
                      <span className="ml-1 text-zinc-500 text-[11px] truncate max-w-[120px]">{activeEngine.pythonScript || 'catalyst_probe.py'}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => setTerminalViewMode('probe')}
                        className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                          terminalViewMode === 'probe' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        Probe
                      </button>
                      <button
                        type="button"
                        onClick={() => setTerminalViewMode('code')}
                        className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                          terminalViewMode === 'code' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        Patch
                      </button>
                      <button
                        type="button"
                        onClick={() => setTerminalViewMode('specs')}
                        className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                          terminalViewMode === 'specs' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        Specs
                      </button>
                    </div>
                  </div>

                  {/* Terminal Dynamic Content */}
                  {terminalViewMode === 'probe' && (
                    <div className="mt-3 space-y-2 text-zinc-600 bg-white p-4 rounded-xl border border-zinc-200">
                      <div className="text-zinc-900 flex items-center gap-1 text-xs">
                        <span className="text-zinc-400">$</span>
                        <span>catalystlab probe --engine={activeEngine.id}</span>
                      </div>
                      <div className="text-zinc-500 text-[11px]">
                        [INFO] Ingesting target AST &amp; DNS matrix...
                      </div>
                      <div className="text-zinc-900 text-[11px]">
                        [STATUS] Telemetry verified in 142ms.
                      </div>
                      <div className="text-zinc-900 text-[11px] bg-zinc-50 p-2 rounded-lg border border-zinc-200 mt-2">
                        Score: <span className="font-bold font-mono">98.5 / 100</span> (Zero vulnerabilities)
                      </div>
                    </div>
                  )}

                  {terminalViewMode === 'code' && (
                    <div className="mt-3 space-y-1.5 text-[11px] text-zinc-600 bg-white p-4 rounded-xl border border-zinc-200">
                      <div className="text-zinc-400">// Automated Remediation Patch</div>
                      <div className="text-zinc-900">add_header Content-Security-Policy &quot;default-src &#39;self&#39;&quot;;</div>
                      <div className="text-zinc-900">add_header Strict-Transport-Security &quot;max-age=31536000;&quot; always;</div>
                      <div className="text-zinc-900 font-semibold mt-2 pt-2 border-t border-zinc-100"># Validated: 0 syntax errors</div>
                    </div>
                  )}

                  {terminalViewMode === 'specs' && (
                    <div className="mt-3 space-y-1.5 text-[11px] text-zinc-600 bg-white p-4 rounded-xl border border-zinc-200">
                      <div className="text-zinc-900 font-bold">Engine Standard Specification:</div>
                      <div>• Category: {activeEngine.category}</div>
                      <div>• Phase: {activeEngine.sdlcPhase}</div>
                      <div className="text-zinc-900 font-semibold mt-2 pt-2 border-t border-zinc-100">✓ RFC / W3C Compliant Telemetry</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default EngineExplorer;
