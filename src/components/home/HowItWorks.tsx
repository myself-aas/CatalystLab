import { HeroImageCard } from '../common/HeroImageCard';
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
  bgImageUrl?: string;
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
      time: '~140ms',
      bgImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600'
    },
    {
      number: '02',
      title: '8-Engine Parallel Telemetry',
      subtitle: 'Phase 2 • Synchronous Probing',
      description: 'Eight micro-engines execute concurrently to inspect Core Web Vitals, DOM recursion, and OWASP transport security.',
      icon: Cpu,
      time: '~420ms',
      bgImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'
    },
    {
      number: '03',
      title: 'AI Discoverability & /llms.txt',
      subtitle: 'Phase 3 • Semantic Analysis',
      description: 'Parses /llms.txt manifests and Schema.org entity graphs to verify accessibility for Perplexity and Claude search agents.',
      icon: Bot,
      time: '~310ms',
      bgImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600'
    },
    {
      number: '04',
      title: 'Remediation Dossier & Patches',
      subtitle: 'Phase 4 • Instant Synthesis',
      description: 'All 8 diagnostic streams compile into a unified audit score with ready-to-deploy NGINX and Cloudflare config patches.',
      icon: FileCheck,
      time: '~190ms',
      bgImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600'
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
    <section className="py-14 lg:py-18 bg-transparent text-black relative overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-mono text-slate-800 mb-3 shadow-sm">
              <Network className="h-3.5 w-3.5 text-slate-800" />
              <span>Telemetry Execution Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black">
              Execution Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-1.5 leading-relaxed">
              Four synchronous stages from anycast edge DNS resolution to complete remediation code patches.
            </p>
          </LazyReveal>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll steps left"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-slate-600 px-1 font-bold">
              Step {steps[activeIdx].number} / 04
            </span>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll steps right"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
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
          {steps.map((step) => { const Icon = step.icon; return (
              <div
                key={step.number}
                className="w-[280px] sm:w-[310px] h-[360px] shrink-0 snap-start relative"
              >
                <HeroImageCard
                  imageUrl={step.bgImageUrl}
                  imageAlt={step.title}
                  title={<div className="text-xl font-bold leading-tight">{step.title}</div>}
                  badge={
                    <span className="text-[10px] font-mono text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 uppercase tracking-wider font-bold">
                      {step.subtitle}
                    </span>
                  }
                  topRight={
                    <span className="text-[10px] font-mono text-white bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 font-bold shadow-sm">
                      {step.time}
                    </span>
                  }
                  description={step.description}
                  action={
                    <div className="p-2.5 rounded-xl bg-white border border-white/20 text-black shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  }
                  footer={
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 uppercase tracking-wider text-[10px] font-mono font-bold">
                        Auto-Executed
                      </span>
                      <Link
                        to="/playground"
                        className="text-white hover:text-white/80 font-mono font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>Run Scan</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  }
                  aspectRatio="h-full w-full"
                  gradientFrom="from-slate-950"
                />
              </div>
); })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
