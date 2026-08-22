import React, { useState, useRef } from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { ShieldCheck, Star, Quote, Terminal, CheckCircle2, Building2, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

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
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollEvent = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 360;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveSlideIndex(Math.min(filteredTestimonials.length - 1, Math.max(0, newIndex)));
    }
  };

  return (
    <section className="py-12 lg:py-14 bg-gradient-to-b from-[#eef3f9] via-[#f6f9fd] to-[#e4ecf7] text-brand-navy relative overflow-hidden border-b border-brand-periwinkle/70">
      {/* Background Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#c5d3e8_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Carousel Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/20 bg-white/80 backdrop-blur-md px-3.5 py-1 text-sm font-mono text-brand-slate mb-2 shadow-xs">
              <Building2 className="h-3.5 w-3.5 text-[#0284c7]" />
              <span>Production Proven By Engineering Leaders</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-navy">
              Trusted in Critical CI/CD Pipelines
            </h2>
          </LazyReveal>

          {/* Controls & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-brand-periwinkle">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-sm font-mono transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-brand-navy text-white font-bold'
                      : 'text-brand-slate hover:bg-[#eef3f9]'
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
                className="p-2 rounded-xl bg-white hover:bg-[#f0f4fa] text-brand-navy border border-brand-periwinkle shadow-xs active:scale-95 cursor-pointer transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll testimonials right"
                className="p-2 rounded-xl bg-white hover:bg-[#f0f4fa] text-brand-navy border border-brand-periwinkle shadow-xs active:scale-95 cursor-pointer transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HORIZONTAL SCROLLING TESTIMONIAL REEL
        ========================================================================= */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScrollEvent}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Engineering leadership testimonials horizontal reel"
          >
            {filteredTestimonials.map((t) => (
              <div
                key={t.id}
                className="w-[290px] sm:w-[340px] lg:w-[360px] shrink-0 snap-start bg-white border border-brand-periwinkle rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-[#0284c7] bg-[#eef3f9] px-2 py-0.5 rounded border border-brand-periwinkle font-bold">
                      {t.verifiedBadge}
                    </span>
                  </div>

                  <p className="text-sm text-brand-navy leading-relaxed mb-4 italic">
                    "{t.quote}"
                  </p>

                  <div className="bg-[#eef3f9] p-2.5 rounded-2xl border border-brand-periwinkle/70 flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs font-mono text-brand-slate uppercase">{t.metricLabel}</div>
                      <div className="text-base font-black font-mono text-brand-navy">{t.metric}</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e2e8f0] flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-sm font-bold font-mono shrink-0">
                    {t.avatarText}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-brand-navy truncate">{t.name}</div>
                    <div className="text-xs text-brand-slate truncate">{t.role} • {t.company}</div>
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
