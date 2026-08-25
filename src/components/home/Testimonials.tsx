import React, { useState, useRef } from 'react';
import { Star, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2, Flame, Leaf, Cpu } from 'lucide-react';
import { HeroImageCard } from '../common/HeroImageCard';

interface Testimonial {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  avatarText: string;
  bgImageUrl?: string;
  quote: string;
  metric: string;
  metricLabel: string;
  verifiedBadge: string;
  icon: React.ElementType;
}

export const Testimonials: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const testimonials: Testimonial[] = [
    {
      id: '1',
      category: 'edge',
      categoryLabel: 'Edge Rendering',
      name: 'David Jung',
      role: 'VP of Engineering',
      company: 'NexusStream',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      avatarText: 'DJ',
      bgImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
      quote: 'CatalystLab caught an unhandled render-blocking script chain and two missing OWASP security headers before our Kubernetes rollout.',
      metric: '-68% TTFB',
      metricLabel: 'Edge latency improvement',
      verifiedBadge: 'Verified CI/CD',
      icon: Cpu
    },
    {
      id: '2',
      category: 'devsecops',
      categoryLabel: 'DevSecOps & OWASP',
      name: 'Elena Rostova',
      role: 'Principal Architect',
      company: 'EdgeVelo Cloud',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      avatarText: 'ER',
      bgImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
      quote: 'Running all 8 catalysts synchronously via CLI in under 2 seconds is incredible. The automated NGINX patches make remediation instant.',
      metric: '100% Strict',
      metricLabel: 'OWASP Security Header score',
      verifiedBadge: 'Enterprise Deploy',
      icon: ShieldCheck
    },
    {
      id: '3',
      category: 'ai',
      categoryLabel: 'AI Search & LLMO',
      name: 'Marcus Chen',
      role: 'Director of AI Search',
      company: 'GrowthStack Media',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      avatarText: 'MC',
      bgImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600',
      quote: 'The LLM-Kinase engine and /llms.txt audit gave our team a clear roadmap for AI engine discovery. Citations on Perplexity jumped 140%.',
      metric: '+140% Citations',
      metricLabel: 'LLMO discoverability',
      verifiedBadge: 'Verified AI Engine',
      icon: Flame
    },
    {
      id: '4',
      category: 'esg',
      categoryLabel: 'ESG Carbon Metrics',
      name: 'Sofia Lindqvist',
      role: 'Head of DevSecOps',
      company: 'NordicFintech Group',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      avatarText: 'SL',
      bgImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
      quote: 'The Sustainable Web Design carbon modeling paired with AST dependency scanning gives our leadership full visibility on security and ESG.',
      metric: '0.08g CO2',
      metricLabel: 'Per pageview carbon',
      verifiedBadge: 'Green Web Certified',
      icon: Leaf
    }
  ];

  const categories = [
    { id: 'all', label: 'All Reviews' },
    { id: 'edge', label: 'Edge Latency' },
    { id: 'devsecops', label: 'DevSecOps' },
    { id: 'ai', label: 'AI Search' },
    { id: 'esg', label: 'ESG Carbon' }
  ];

  const filteredTestimonials = activeCategory === 'all'
    ? testimonials
    : testimonials.filter(t => t.category === activeCategory);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="testimonials-section" className="py-16 sm:py-24 border-b border-slate-800 relative overflow-hidden bg-[#060912] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#00F0FF] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Production Proven In High-Load Infrastructure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Trusted by Leading Platform &amp; SRE Engineers
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Real telemetry outcomes from engineering teams enforcing sub-second edge speeds, zero-trust headers, and autonomous AI search ingestion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 bg-[#0B101D] p-1 rounded-xl border border-slate-800">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    activeCategory === c.id
                      ? 'bg-[#06B6D4] text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Carousel Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-xl border border-slate-800 bg-[#0B101D] text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-xl border border-slate-800 bg-[#0B101D] text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials Reel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 pt-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Engineering leadership testimonials horizontal reel"
          >
            {filteredTestimonials.map((t) => (
              <div
                key={t.id}
                className="w-[300px] sm:w-[320px] lg:w-[350px] h-[400px] shrink-0 snap-start relative rounded-2xl overflow-hidden border border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
              >
                <HeroImageCard
                  imageUrl={t.bgImageUrl || t.avatarUrl}
                  imageAlt={t.name}
                  title={<div className="text-xl sm:text-2xl font-bold leading-tight text-white">"{t.quote}"</div>}
                  badge={
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  }
                  topRight={
                    <span className="text-[10px] font-mono text-[#00F0FF] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#06B6D4]/30 font-bold shadow-sm">
                      {t.verifiedBadge}
                    </span>
                  }
                  metadata={
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono uppercase text-slate-300">{t.metricLabel}</span>
                      <span className="text-base font-bold font-mono text-[#00FF66]">{t.metric}</span>
                    </div>
                  }
                  action={<CheckCircle2 className="h-5 w-5 text-[#00FF66]" />}
                  footer={
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-[#06B6D4]/40 shrink-0 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <div className="text-sm font-bold text-white truncate">{t.name}</div>
                        <div className="text-xs text-slate-300 truncate font-mono">{t.role} • {t.company}</div>
                      </div>
                    </div>
                  }
                  aspectRatio="h-full w-full"
                  gradientFrom="from-slate-950"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
