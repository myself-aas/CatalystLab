import React, { useState, useRef } from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, ShieldCheck, Cpu, Flame, Leaf } from 'lucide-react';

interface Testimonial {
  id: string;
  category: 'devsecops' | 'edge' | 'ai' | 'esg';
  categoryLabel: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  avatarText: string;
  quote: string;
  metric: string;
  metricLabel: string;
  verifiedBadge: string;
  icon: typeof ShieldCheck;
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
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      avatarText: 'AR',
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
    <section className="py-14 sm:py-20 border-b border-gray-200 relative overflow-hidden bg-brand-deep">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Production Proven</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
              Trusted by Leading Platform & AI Engineers
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Real telemetry outcomes from engineering teams enforcing sub-second edge speeds, zero-trust headers, and autonomous AI search ingestion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeCategory === c.id
                      ? 'bg-accent-cyan text-brand-deep shadow-sm'
                      : 'text-gray-600 hover:text-black'
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
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-black hover:border-gray-200 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-black hover:border-gray-200 transition-colors"
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
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Engineering leadership testimonials horizontal reel"
          >
            {filteredTestimonials.map((t) => (
              <div
                key={t.id}
                className="w-[290px] sm:w-[320px] lg:w-[350px] shrink-0 snap-start bg-white border border-gray-200 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-accent-cyan/40 transition-colors"
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

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4 italic">
                    "{t.quote}"
                  </p>

                  <div className="bg-gray-100 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase">{t.metricLabel}</div>
                      <div className="text-sm font-bold font-mono text-black">{t.metric}</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-accent-emerald" />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center gap-3">
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="h-9 w-9 rounded-xl object-cover border border-gray-200 shrink-0 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-black truncate">{t.name}</div>
                    <div className="text-[11px] text-gray-500 truncate">{t.role} • {t.company}</div>
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
