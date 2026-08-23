import React, { useState, useRef } from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { Star, CheckCircle2, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: string;
  category: 'devsecops' | 'edge' | 'ai' | 'esg';
  categoryLabel: string;
  name: string;
  role: string;
  company: string;
  avatarText: string;
  quote: string;
  metric: string;
  metricLabel: string;
  verifiedBadge: string;
}

export const Testimonials: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const testimonials: Testimonial[] = [
    {
      id: '1',
      category: 'edge',
      categoryLabel: 'Edge Performance',
      name: 'Alex Rivera',
      role: 'VP of Engineering',
      company: 'CloudScale Networks',
      avatarText: 'AR',
      quote: 'CatalystLab caught an unhandled render-blocking script chain and two missing OWASP security headers before our Kubernetes rollout.',
      metric: '-68% TTFB',
      metricLabel: 'Edge latency improvement',
      verifiedBadge: 'Verified CI/CD'
    },
    {
      id: '2',
      category: 'devsecops',
      categoryLabel: 'DevSecOps & OWASP',
      name: 'Elena Rostova',
      role: 'Principal Architect',
      company: 'EdgeVelo Cloud',
      avatarText: 'ER',
      quote: 'Running all 8 catalysts synchronously via CLI in under 2 seconds is incredible. The automated NGINX patches make remediation instant.',
      metric: '100% Strict',
      metricLabel: 'OWASP Security Header score',
      verifiedBadge: 'Enterprise Deploy'
    },
    {
      id: '3',
      category: 'ai',
      categoryLabel: 'AI Search & LLMO',
      name: 'Marcus Chen',
      role: 'Director of AI Search',
      company: 'GrowthStack Media',
      avatarText: 'MC',
      quote: 'The LLM-Kinase engine and /llms.txt audit gave our team a clear roadmap for AI engine discovery. Citations on Perplexity jumped 140%.',
      metric: '+140% Citations',
      metricLabel: 'LLMO discoverability',
      verifiedBadge: 'Verified AI Engine'
    },
    {
      id: '4',
      category: 'esg',
      categoryLabel: 'ESG Carbon Metrics',
      name: 'Sofia Lindqvist',
      role: 'Head of DevSecOps',
      company: 'NordicFintech Group',
      avatarText: 'SL',
      quote: 'The Sustainable Web Design carbon modeling paired with AST dependency scanning gives our leadership full visibility on security and ESG.',
      metric: '0.08g CO2',
      metricLabel: 'Per pageview carbon',
      verifiedBadge: 'Green Web Certified'
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
    <section className="py-14 lg:py-16 bg-transparent text-brand-offwhite relative overflow-hidden border-b border-brand-slate/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Carousel Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/40 bg-surface-panel px-3.5 py-1 text-xs font-mono text-brand-periwinkle mb-3 shadow-sm">
              <Building2 className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Production Proven By Engineering Leaders</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-offwhite">
              Trusted in Critical CI/CD Pipelines
            </h2>
          </LazyReveal>

          {/* Controls & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-surface-panel rounded-xl border border-brand-slate/40">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-brand-slate text-white font-bold'
                      : 'text-brand-periwinkle hover:text-white hover:bg-surface-subtle'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Carousel Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll testimonials left"
                className="p-2 rounded-xl bg-surface-panel hover:bg-surface-subtle text-brand-periwinkle hover:text-white border border-brand-slate/40 shadow-xs cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll testimonials right"
                className="p-2 rounded-xl bg-surface-panel hover:bg-surface-subtle text-brand-periwinkle hover:text-white border border-brand-slate/40 shadow-xs cursor-pointer transition-colors"
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
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Engineering leadership testimonials horizontal reel"
          >
            {filteredTestimonials.map((t) => (
              <div
                key={t.id}
                className="w-[280px] sm:w-[320px] lg:w-[340px] shrink-0 snap-start bg-surface-panel border border-brand-slate/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-accent-amber text-accent-amber" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-accent-cyan bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                      {t.verifiedBadge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-brand-periwinkle leading-relaxed mb-4 italic">
                    "{t.quote}"
                  </p>

                  <div className="bg-brand-oxford p-2.5 rounded-xl border border-brand-slate/30 flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-mono text-brand-slate-light uppercase">{t.metricLabel}</div>
                      <div className="text-sm font-bold font-mono text-brand-offwhite">{t.metric}</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-accent-emerald" />
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-slate/30 flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-brand-oxford border border-brand-slate/40 text-brand-offwhite flex items-center justify-center text-xs font-bold font-mono shrink-0">
                    {t.avatarText}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-brand-offwhite truncate">{t.name}</div>
                    <div className="text-[11px] text-brand-slate-light truncate">{t.role} • {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
