import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LazyReveal } from '../common/LazyAnimate';
import { SDLC_CATALYSTS_LIST } from '../../data/engines';
import type { EngineMeta } from '../../types';
import { 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  Code2, 
  ExternalLink, 
  Sparkles,
  Activity,
  Cpu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Leaf,
  Bot
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
      const cardWidth = 340;
      const newIndex = Math.round(scrollLeft / cardWidth);
      const boundedIndex = Math.min(SDLC_CATALYSTS_LIST.length - 1, Math.max(0, newIndex));
      setActiveEngineIndex(boundedIndex);
    }
  };

  return (
    <section className="py-14 lg:py-16 bg-gradient-to-b from-brand-oxford via-[brand-navy] to-brand-navy text-white relative overflow-hidden border-b border-brand-slate/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(65,90,119,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(65,90,119,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Carousel Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/60 bg-brand-oxford px-3.5 py-1 text-sm font-mono text-brand-periwinkle mb-2 shadow-[0_0_20px_rgba(65,90,119,0.2)]">
              <Cpu className="h-3.5 w-3.5 text-sky-400" />
              <span>Parallel Multi-Agent Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              The 8 Autonomous SDLC Catalysts
            </h2>
            <p className="text-sm sm:text-base text-brand-periwinkle max-w-xl mt-1 leading-relaxed">
              Swipe horizontally through our 8 synchronous telemetry engines. Select any catalyst to inspect diagnostic vectors and live remediation code.
            </p>
          </LazyReveal>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll engines left"
              className="p-2.5 rounded-xl bg-brand-oxford hover:bg-[#162a45] text-brand-periwinkle hover:text-white border border-brand-slate/50 shadow-md active:scale-95 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-mono text-[#8ea8c3] px-1 font-semibold">
              {activeEngineIndex + 1} / {SDLC_CATALYSTS_LIST.length}
            </span>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll engines right"
              className="p-2.5 rounded-xl bg-brand-oxford hover:bg-[#162a45] text-brand-periwinkle hover:text-white border border-brand-slate/50 shadow-md active:scale-95 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 pt-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Autonomous SDLC catalysts horizontal carousel"
          >
            {SDLC_CATALYSTS_LIST.map((engine, idx) => {
              const isSelected = selectedEngineId === engine.id;
              return (
                <div
                  key={engine.id}
                  onClick={() => selectEngine(engine, idx)}
                  className={`w-[270px] sm:w-[310px] shrink-0 snap-start p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-navy border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.2)] ring-1 ring-sky-400'
                      : 'bg-brand-oxford/90 border-brand-slate/40 hover:border-brand-slate hover:bg-brand-navy/60'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl border ${
                          isSelected 
                            ? 'bg-sky-400/20 border-sky-400/40 text-sky-400' 
                            : 'bg-brand-slate/30 border-brand-slate/50 text-[#8ea8c3]'
                        }`}>
                          <span className="material-symbols-outlined text-base">{engine.icon}</span>
                        </div>
                        <span className="text-xs font-mono text-[#8ea8c3] uppercase tracking-wider">
                          Phase {engine.sdlcPhaseNumber}
                        </span>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        isSelected 
                          ? 'bg-sky-400/20 text-sky-400 border-sky-400/40' 
                          : 'bg-brand-navy text-[#8ea8c3] border-brand-slate/30'
                      }`}>
                        {engine.category}
                      </span>
                    </div>

                    {/* Name & Short Desc */}
                    <div>
                      {engine.image && (
                        <div className="w-full h-24 mb-3 overflow-hidden rounded-lg border border-brand-slate/40 relative">
                          <img alt="Visual asset" 
                            src={engine.image} 
                            alt={`${engine.catalystName || engine.name} visualization`}
                            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                          />
                        </div>
                      )}
                      <h3 className="text-base font-bold text-white leading-tight">
                        {engine.catalystName || engine.name}
                      </h3>
                      <p className="text-sm text-brand-periwinkle line-clamp-2 mt-1 leading-snug">
                        {engine.description}
                      </p>
                    </div>
                  </div>

                  {/* Vectors Count & Select Status */}
                  <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-sm font-mono mt-3">
                    <span className="text-[#8ea8c3]">
                      {engine.keyVectors?.length || 4} Vectors
                    </span>
                    <span className={`font-bold flex items-center gap-1 ${
                      isSelected ? 'text-sky-400' : 'text-[#8ea8c3]'
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-brand-navy/90 border border-brand-slate/60 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Details Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-brand-slate/30 border border-brand-slate/60 text-sm font-mono text-brand-periwinkle">
                    <span className="material-symbols-outlined text-sm text-sky-400">{activeEngine.icon}</span>
                    <span>{activeEngine.sdlcPhase}</span>
                  </div>
                  <span className="text-sm font-mono text-[#8ea8c3] bg-brand-oxford px-2.5 py-0.5 rounded border border-brand-slate/30">
                    Category: {activeEngine.category}
                  </span>
                </div>

                <div className="flex gap-4">
                  {activeEngine.image && (
                    <div className="hidden sm:block shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-brand-slate/50 shadow-lg relative">
                      <img alt="Visual asset" 
                        src={activeEngine.image} 
                        alt={activeEngine.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-brand-navy/10 ring-1 ring-inset ring-white/10 rounded-2xl mix-blend-overlay"></div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                      {activeEngine.catalystName || activeEngine.name}
                    </h3>
                    <p className="text-sm sm:text-base text-brand-periwinkle leading-relaxed mt-1">
                      {activeEngine.description}
                    </p>
                  </div>
                </div>

                {/* Key Vectors Checked (Compact Grid) */}
                {activeEngine.keyVectors && activeEngine.keyVectors.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-mono uppercase tracking-wider text-[#8ea8c3] flex items-center gap-1">
                      <Activity className="h-3 w-3 text-sky-400" />
                      <span>Telemetry Vectors ({activeEngine.keyVectors.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeEngine.keyVectors.map((vector, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1.5 text-sm text-[#e2e8f0] bg-brand-oxford p-2 rounded-xl border border-brand-slate/40"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{vector}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <Link
                    to={activeEngine.route}
                    className="inline-flex items-center gap-1.5 bg-brand-periwinkle hover:bg-white text-brand-navy px-4 py-2 rounded-xl text-sm font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <span>Launch {activeEngine.name} Engine</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    to={`/docs#${activeEngine.docsAnchor || activeEngine.id}`}
                    className="inline-flex items-center gap-1.5 bg-brand-oxford hover:bg-[#162a45] text-brand-periwinkle hover:text-white border border-brand-slate/40 px-3.5 py-2 rounded-xl text-sm font-mono transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <Code2 className="h-3.5 w-3.5 text-[#8ea8c3]" />
                    <span>View Docs</span>
                  </Link>
                </div>
              </div>

              {/* Right Telemetry Terminal (Compact) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-brand-oxford border border-brand-slate/60 rounded-2xl p-3.5 shadow-xl font-mono text-sm">
                  {/* Top Mode Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-brand-slate/30 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400/80" />
                      <span className="h-2 w-2 rounded-full bg-yellow-400/80" />
                      <span className="h-2 w-2 rounded-full bg-green-400/80" />
                      <span className="ml-1 text-brand-periwinkle">{activeEngine.pythonScript || 'catalyst_probe.py'}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-brand-navy p-0.5 rounded-lg border border-brand-slate/30">
                      <button
                        type="button"
                        onClick={() => setTerminalViewMode('probe')}
                        className={`px-2 py-0.5 rounded text-xs cursor-pointer transition-colors ${
                          terminalViewMode === 'probe' ? 'bg-brand-slate text-white' : 'text-[#8ea8c3] hover:text-white'
                        }`}
                      >
                        Probe
                      </button>
                      <button
                        type="button"
                        onClick={() => setTerminalViewMode('code')}
                        className={`px-2 py-0.5 rounded text-xs cursor-pointer transition-colors ${
                          terminalViewMode === 'code' ? 'bg-brand-slate text-white' : 'text-[#8ea8c3] hover:text-white'
                        }`}
                      >
                        Patch
                      </button>
                      <button
                        type="button"
                        onClick={() => setTerminalViewMode('specs')}
                        className={`px-2 py-0.5 rounded text-xs cursor-pointer transition-colors ${
                          terminalViewMode === 'specs' ? 'bg-brand-slate text-white' : 'text-[#8ea8c3] hover:text-white'
                        }`}
                      >
                        Specs
                      </button>
                    </div>
                  </div>

                  {/* Terminal Dynamic Content */}
                  {terminalViewMode === 'probe' && (
                    <div className="mt-2.5 space-y-1.5 text-brand-periwinkle bg-brand-navy p-3 rounded-xl border border-brand-slate/30">
                      <div className="text-sky-400 flex items-center gap-1 text-sm">
                        <span>$</span>
                        <span>catalystlab probe --engine={activeEngine.id}</span>
                      </div>
                      <div className="text-[#8ea8c3] text-xs">
                        [INFO] Ingesting target AST & DNS matrix...
                      </div>
                      <div className="text-emerald-400 text-xs">
                        [STATUS] Telemetry verified in 142ms.
                      </div>
                      <div className="text-white text-xs bg-brand-oxford p-1.5 rounded border border-brand-slate/20">
                        Score: <span className="text-sky-400 font-bold">98.5 / 100</span> (Zero vulnerabilities)
                      </div>
                    </div>
                  )}

                  {terminalViewMode === 'code' && (
                    <div className="mt-2.5 space-y-1 text-xs text-brand-periwinkle bg-brand-navy p-3 rounded-xl border border-brand-slate/30">
                      <div className="text-[#8ea8c3]">// Automated Remediation Patch</div>
                      <div className="text-sky-300">add_header Content-Security-Policy "default-src 'self'";</div>
                      <div className="text-sky-300">add_header Strict-Transport-Security "max-age=31536000;" always;</div>
                      <div className="text-amber-300"># Validated: 0 syntax errors</div>
                    </div>
                  )}

                  {terminalViewMode === 'specs' && (
                    <div className="mt-2.5 space-y-1 text-xs text-brand-periwinkle bg-brand-navy p-3 rounded-xl border border-brand-slate/30">
                      <div className="text-[#8ea8c3] font-bold">Engine Standard Specification:</div>
                      <div>• Category: {activeEngine.category}</div>
                      <div>• Phase: {activeEngine.sdlcPhase}</div>
                      <div className="text-sky-400">✓ RFC / W3C Compliant Telemetry</div>
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
