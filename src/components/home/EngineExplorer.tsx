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
    <section className="py-14 lg:py-18 bg-brand-oxford/70 backdrop-blur-sm text-brand-offwhite relative overflow-hidden border-b border-brand-slate/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Carousel Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/40 bg-surface-panel px-3.5 py-1 text-xs sm:text-sm font-mono text-brand-periwinkle mb-3 shadow-sm">
              <Cpu className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Parallel Multi-Agent Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-offwhite">
              The 8 Autonomous SDLC Catalysts
            </h2>
            <p className="text-sm sm:text-base text-brand-periwinkle max-w-xl mt-1.5 leading-relaxed">
              Explore our 8 synchronous telemetry engines. Select any catalyst to inspect diagnostic vectors, RFC compliance, and live remediation code.
            </p>
          </LazyReveal>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll engines left"
              className="p-2.5 rounded-xl bg-surface-panel hover:bg-surface-subtle text-brand-periwinkle hover:text-white border border-brand-slate/40 shadow-sm active:scale-95 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-brand-periwinkle px-2 font-semibold">
              {activeEngineIndex + 1} / {SDLC_CATALYSTS_LIST.length}
            </span>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll engines right"
              className="p-2.5 rounded-xl bg-surface-panel hover:bg-surface-subtle text-brand-periwinkle hover:text-white border border-brand-slate/40 shadow-sm active:scale-95 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
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
                <div
                  key={engine.id}
                  onClick={() => selectEngine(engine, idx)}
                  className={`w-[280px] sm:w-[310px] shrink-0 snap-start p-4.5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-surface-panel border-accent-cyan shadow-lg ring-1 ring-accent-cyan/60'
                      : 'bg-surface-panel/70 border-brand-slate/30 hover:border-brand-slate hover:bg-surface-panel'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl border ${
                          isSelected 
                            ? 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan' 
                            : 'bg-brand-oxford border-brand-slate/40 text-brand-periwinkle'
                        }`}>
                          <IconComp className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-mono text-brand-slate-light uppercase tracking-wider">
                          Phase {engine.sdlcPhaseNumber}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isSelected 
                          ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30' 
                          : 'bg-brand-oxford text-brand-periwinkle border-brand-slate/30'
                      }`}>
                        {engine.category}
                      </span>
                    </div>

                    {/* Name & Short Desc */}
                    <div>
                      {engine.image && (
                        <div className="w-full h-20 mb-2.5 overflow-hidden rounded-lg border border-brand-slate/30 relative">
                          <img 
                            src={engine.image} 
                            alt={`${engine.catalystName || engine.name} visualization`}
                            className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity"
                          />
                        </div>
                      )}
                      <h3 className="text-base font-bold text-brand-offwhite leading-tight">
                        {engine.catalystName || engine.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-brand-periwinkle line-clamp-2 mt-1 leading-snug">
                        {engine.description}
                      </p>
                    </div>
                  </div>

                  {/* Vectors Count & Select Status */}
                  <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-xs font-mono mt-3">
                    <span className="text-brand-slate-light">
                      {engine.keyVectors?.length || 4} Vectors
                    </span>
                    <span className={`font-bold flex items-center gap-1 ${
                      isSelected ? 'text-accent-cyan' : 'text-brand-periwinkle'
                    }`}>
                      {isSelected ? '● Active' : 'Inspect ›'}
                    </span>
                  </div>
                </div>
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
            className="bg-surface-panel border border-brand-slate/40 rounded-2xl p-5 sm:p-7 shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Details Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-oxford border border-brand-slate/40 text-xs font-mono text-brand-periwinkle">
                    <ActiveIcon className="h-3.5 w-3.5 text-accent-cyan" />
                    <span>{activeEngine.sdlcPhase}</span>
                  </div>
                  <span className="text-xs font-mono text-brand-slate-light bg-brand-oxford px-2.5 py-1 rounded-lg border border-brand-slate/30">
                    Category: {activeEngine.category}
                  </span>
                </div>

                <div className="flex gap-4">
                  {activeEngine.image && (
                    <div className="hidden sm:block shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-brand-slate/40 shadow-md relative">
                      <img 
                        src={activeEngine.image} 
                        alt={activeEngine.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-brand-offwhite">
                      {activeEngine.catalystName || activeEngine.name}
                    </h3>
                    <p className="text-sm text-brand-periwinkle leading-relaxed mt-1">
                      {activeEngine.description}
                    </p>
                  </div>
                </div>

                {/* Key Vectors Checked */}
                {activeEngine.keyVectors && activeEngine.keyVectors.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-brand-slate-light flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-accent-cyan" />
                      <span>Telemetry Vectors ({activeEngine.keyVectors.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeEngine.keyVectors.map((vector, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs sm:text-sm text-brand-offwhite bg-brand-oxford p-2.5 rounded-xl border border-brand-slate/30"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0 mt-0.5" />
                          <span className="leading-snug">{vector}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to={activeEngine.route}
                    className="inline-flex items-center gap-1.5 bg-brand-slate hover:bg-brand-slate-hover text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer border border-brand-periwinkle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  >
                    <span>Launch {activeEngine.name} Engine</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    to={`/docs#${activeEngine.docsAnchor || activeEngine.id}`}
                    className="inline-flex items-center gap-1.5 bg-brand-oxford hover:bg-surface-subtle text-brand-periwinkle hover:text-white border border-brand-slate/40 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  >
                    <Code2 className="h-3.5 w-3.5 text-brand-periwinkle" />
                    <span>View Docs</span>
                  </Link>
                </div>
              </div>

              {/* Right Telemetry Terminal */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-brand-oxford border border-brand-slate/40 rounded-2xl p-4 shadow-xl font-mono text-xs">
                  {/* Top Mode Bar */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-brand-slate/30 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <span className="h-2 w-2 rounded-full bg-yellow-400" />
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      <span className="ml-1 text-brand-periwinkle text-[11px] truncate max-w-[120px]">{activeEngine.pythonScript || 'catalyst_probe.py'}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-surface-panel p-0.5 rounded-lg border border-brand-slate/30">
                      <button
                        type="button"
                        onClick={() => setTerminalViewMode('probe')}
                        className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                          terminalViewMode === 'probe' ? 'bg-brand-slate text-white' : 'text-brand-periwinkle hover:text-white'
                        }`}
                      >
                        Probe
                      </button>
                      <button
                        type="button"
                        onClick={() => setTerminalViewMode('code')}
                        className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                          terminalViewMode === 'code' ? 'bg-brand-slate text-white' : 'text-brand-periwinkle hover:text-white'
                        }`}
                      >
                        Patch
                      </button>
                      <button
                        type="button"
                        onClick={() => setTerminalViewMode('specs')}
                        className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                          terminalViewMode === 'specs' ? 'bg-brand-slate text-white' : 'text-brand-periwinkle hover:text-white'
                        }`}
                      >
                        Specs
                      </button>
                    </div>
                  </div>

                  {/* Terminal Dynamic Content */}
                  {terminalViewMode === 'probe' && (
                    <div className="mt-3 space-y-2 text-brand-periwinkle bg-surface-panel p-3.5 rounded-xl border border-brand-slate/30">
                      <div className="text-accent-cyan flex items-center gap-1 text-xs">
                        <span>$</span>
                        <span>catalystlab probe --engine={activeEngine.id}</span>
                      </div>
                      <div className="text-brand-slate-light text-[11px]">
                        [INFO] Ingesting target AST &amp; DNS matrix...
                      </div>
                      <div className="text-accent-emerald text-[11px]">
                        [STATUS] Telemetry verified in 142ms.
                      </div>
                      <div className="text-white text-[11px] bg-brand-oxford p-2 rounded-lg border border-brand-slate/30">
                        Score: <span className="text-accent-cyan font-bold font-mono">98.5 / 100</span> (Zero vulnerabilities)
                      </div>
                    </div>
                  )}

                  {terminalViewMode === 'code' && (
                    <div className="mt-3 space-y-1.5 text-[11px] text-brand-periwinkle bg-surface-panel p-3.5 rounded-xl border border-brand-slate/30">
                      <div className="text-brand-slate-light">// Automated Remediation Patch</div>
                      <div className="text-accent-cyan">add_header Content-Security-Policy &quot;default-src &#39;self&#39;&quot;;</div>
                      <div className="text-accent-cyan">add_header Strict-Transport-Security &quot;max-age=31536000;&quot; always;</div>
                      <div className="text-accent-amber font-semibold"># Validated: 0 syntax errors</div>
                    </div>
                  )}

                  {terminalViewMode === 'specs' && (
                    <div className="mt-3 space-y-1.5 text-[11px] text-brand-periwinkle bg-surface-panel p-3.5 rounded-xl border border-brand-slate/30">
                      <div className="text-brand-slate-light font-bold">Engine Standard Specification:</div>
                      <div>• Category: {activeEngine.category}</div>
                      <div>• Phase: {activeEngine.sdlcPhase}</div>
                      <div className="text-accent-cyan font-semibold">✓ RFC / W3C Compliant Telemetry</div>
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
