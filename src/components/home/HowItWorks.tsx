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
    <section className="ds-section bg-white text-black relative overflow-hidden">
      <div className="ds-page-shell">
        
        {/* Section Header */}
        <div className="ds-section-head-row">
          <LazyReveal direction="up">
            <div className="ds-eyebrow ds-eyebrow-pill mb-3">
              <Network className="h-3.5 w-3.5 text-accent-amber-strong" />
              <span>Telemetry Execution Pipeline</span>
            </div>
            <h2 className="ds-h2 text-black">Execution Workflow</h2>
            <p className="ds-lede mt-3">
              Four synchronous stages from anycast edge DNS resolution to complete remediation code patches.
            </p>
          </LazyReveal>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll steps left"
              className="p-2 rounded-xl bg-white hover:bg-gray-50 text-gray-600 hover:text-white border border-gray-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-gray-600 px-1 font-bold">
              Step {steps[activeIdx].number} / 04
            </span>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll steps right"
              className="p-2 rounded-xl bg-white hover:bg-gray-50 text-gray-600 hover:text-white border border-gray-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Steps Carousel */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="ds-scroll-row no-scrollbar scroll-smooth"
          tabIndex={0}
          role="region"
          aria-label="Pipeline execution workflow steps"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="ds-card ds-card-interactive w-[280px] sm:w-[310px] shrink-0 p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200 text-accent-amber-strong">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase tracking-wider">
                      {step.time}
                    </span>
                  </div>
                  
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1 font-bold">
                    {step.subtitle}
                  </div>
                  <h3 className="text-base font-bold text-black leading-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                    Auto-Executed
                  </span>
                  <Link
                    to="/playground"
                    className="text-accent-amber-strong hover:underline font-bold flex items-center gap-1 transition-colors"
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
