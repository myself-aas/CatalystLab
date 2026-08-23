import React, { useState, useRef } from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { Network, Cpu, Bot, FileCheck, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PipelineStep {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  time: string;
}

export const HowItWorks: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const steps: PipelineStep[] = [
    {
      number: '01',
      title: 'Target Ingestion & Edge DNS',
      subtitle: 'Phase 1 • Anycast Resolution',
      description: 'Resolves hostname across 42 global edge PoPs. Probes TLS 1.3 0-RTT handshakes and HTTP/3 viability.',
      icon: Network,
      time: '~140ms'
    },
    {
      number: '02',
      title: '8-Engine Parallel Telemetry',
      subtitle: 'Phase 2 • Synchronous Probing',
      description: 'Eight micro-engines execute concurrently to inspect Core Web Vitals, DOM recursion, and OWASP transport security.',
      icon: Cpu,
      time: '~420ms'
    },
    {
      number: '03',
      title: 'AI Discoverability & /llms.txt',
      subtitle: 'Phase 3 • Semantic Analysis',
      description: 'Parses /llms.txt manifests and Schema.org entity graphs to verify accessibility for Perplexity and Claude search agents.',
      icon: Bot,
      time: '~310ms'
    },
    {
      number: '04',
      title: 'Remediation Dossier & Patches',
      subtitle: 'Phase 4 • Instant Synthesis',
      description: 'All 8 diagnostic streams compile into a unified audit score with ready-to-deploy NGINX and Cloudflare config patches.',
      icon: FileCheck,
      time: '~190ms'
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 320;
      const newIdx = Math.round(scrollLeft / cardWidth);
      setActiveIdx(Math.min(steps.length - 1, Math.max(0, newIdx)));
    }
  };

  return (
    <section className="py-14 lg:py-18 bg-transparent text-brand-offwhite relative overflow-hidden border-b border-brand-slate/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/40 bg-surface-panel px-3.5 py-1 text-xs font-mono text-brand-periwinkle mb-3 shadow-sm">
              <Network className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Telemetry Execution Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-offwhite">
              Execution Workflow
            </h2>
            <p className="text-xs sm:text-sm text-brand-periwinkle max-w-xl mt-1.5 leading-relaxed">
              Four synchronous stages from anycast edge DNS resolution to complete remediation code patches.
            </p>
          </LazyReveal>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll steps left"
              className="p-2 rounded-xl bg-surface-panel hover:bg-surface-subtle text-brand-periwinkle hover:text-white border border-brand-slate/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-brand-periwinkle px-1 font-bold">
              Step {steps[activeIdx].number} / 04
            </span>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll steps right"
              className="p-2 rounded-xl bg-surface-panel hover:bg-surface-subtle text-brand-periwinkle hover:text-white border border-brand-slate/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Steps Carousel */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 pt-1 scroll-smooth"
          tabIndex={0}
          role="region"
          aria-label="Pipeline execution workflow steps"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="w-[280px] sm:w-[310px] shrink-0 snap-start bg-surface-panel border border-brand-slate/40 rounded-2xl p-5 flex flex-col justify-between hover:border-brand-slate transition-all space-y-4 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-cyan">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono text-brand-slate-light bg-brand-oxford px-2 py-0.5 rounded border border-brand-slate/30 uppercase tracking-wider">
                      {step.time}
                    </span>
                  </div>
                  
                  <div className="text-[10px] font-mono text-brand-slate-light uppercase tracking-wider mb-1 font-bold">
                    {step.subtitle}
                  </div>
                  <h3 className="text-base font-bold text-brand-offwhite leading-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-brand-periwinkle leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-brand-slate/30 flex items-center justify-between text-xs font-mono">
                  <span className="text-brand-slate-light uppercase tracking-wider text-[10px] font-bold">
                    Auto-Executed
                  </span>
                  <Link
                    to="/playground"
                    className="text-accent-cyan hover:underline font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Run Scan</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
