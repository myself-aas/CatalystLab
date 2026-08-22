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
      description: 'Resolves hostname across 42 global edge PoPs. Probing TLS 1.3 0-RTT handshakes and HTTP/3 viability.',
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
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 340;
      const newIdx = Math.round(scrollLeft / cardWidth);
      setActiveIdx(Math.min(steps.length - 1, Math.max(0, newIdx)));
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-brand-navy text-white relative overflow-hidden border-y border-brand-slate/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <LazyReveal direction="up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
              Execution Workflow.
            </h2>
            <p className="text-base sm:text-lg text-brand-periwinkle max-w-2xl mt-4 leading-relaxed font-medium">
              Four synchronous steps from anycast edge DNS resolution to complete remediation code patches.
            </p>
          </LazyReveal>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll steps left"
              className="p-3 rounded-xl bg-brand-oxford hover:bg-brand-slate text-brand-periwinkle border border-brand-slate/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-base font-mono text-brand-periwinkle px-2 font-bold">
              Step {steps[activeIdx].number} / 04
            </span>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll steps right"
              className="p-3 rounded-xl bg-brand-oxford hover:bg-brand-slate text-brand-periwinkle border border-brand-slate/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Steps Carousel */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 pt-1 scroll-smooth"
          tabIndex={0}
          role="region"
          aria-label="Pipeline execution workflow steps"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="w-[300px] sm:w-[340px] shrink-0 snap-start bg-brand-oxford border border-brand-slate/30 rounded-[24px] p-5 sm:p-6 flex flex-col justify-between hover:border-brand-slate/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-brand-navy border border-brand-slate/40 text-sky-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-brand-slate-light bg-brand-navy px-2 py-1 rounded border border-brand-slate/30 uppercase tracking-widest">
                        {step.time}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm font-mono text-brand-slate-light uppercase tracking-widest mb-2 font-bold">
                    {step.subtitle}
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight mb-3">
                    {step.title}
                  </h3>
                  <p className="text-base text-brand-periwinkle leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-brand-slate/30 flex items-center justify-between text-sm font-mono mt-4">
                  <span className="text-brand-slate-light uppercase tracking-wider font-bold">
                    Auto-Executed
                  </span>
                  <Link
                    to="/launch-audit"
                    className="text-sky-400 hover:text-white font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <span>Run Scan</span>
                    <ArrowRight className="h-4 w-4" />
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
