import React, { useState, useRef } from 'react';
import { Star, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2, Flame, Leaf, Cpu } from 'lucide-react';
import { TestimonialCard } from '../cards/content/TestimonialCard';
import { EnzymeHue } from '../cards/types';
import { 
  U_FACE_1, 
  U_FACE_2, 
  U_FACE_3, 
  U_FACE_4, 
  U_SERVER, 
  U_NET, 
  U_CYBER, 
  U_GLOBE 
} from '../../lib/media/registry';

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
      avatarUrl: U_FACE_1,
      avatarText: 'DJ',
      bgImageUrl: U_CYBER,
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
      avatarUrl: U_FACE_2,
      avatarText: 'ER',
      bgImageUrl: U_SERVER,
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
      avatarUrl: U_FACE_3,
      avatarText: 'MC',
      bgImageUrl: U_NET,
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
      avatarUrl: U_FACE_4,
      avatarText: 'SL',
      bgImageUrl: U_GLOBE,
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
    <section id="testimonials-section" className="py-20 sm:py-28 border-b border-slate-200 relative overflow-hidden bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-sans font-bold uppercase tracking-widest mb-4 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Production Proven In High-Load Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Trusted by Leading Platform &amp; SRE Engineers
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium mt-3 max-w-2xl leading-relaxed">
              Real telemetry outcomes from engineering teams enforcing sub-second edge speeds, zero-trust headers, and autonomous AI search ingestion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-2 text-xs font-sans font-bold rounded-xl transition-all cursor-pointer ${
                    activeCategory === c.id
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Carousel Buttons */}
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <button
                onClick={() => scroll('left')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials Reel */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 pt-2 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Engineering leadership testimonials horizontal reel"
          >
            {filteredTestimonials.map((t, idx) => {
              const hues: EnzymeHue[] = ['edgevmax', 'riskprotease', 'llmkinase', 'ecoholo'];
              const activeHue = hues[idx % hues.length];

              return (
                <div
                  key={t.id}
                  className="w-[300px] sm:w-[320px] lg:w-[350px] shrink-0 snap-start relative"
                >
                  <TestimonialCard
                    id={t.id}
                    quote={t.quote}
                    authorName={t.name}
                    authorRole={t.role}
                    company={t.company}
                    avatarUrl={t.avatarUrl}
                    bgImageUrl={t.bgImageUrl}
                    badgeLabel={t.verifiedBadge}
                    metricValue={t.metric}
                    metricLabel={t.metricLabel}
                    secondaryMetricValue="0-RTT"
                    secondaryMetricLabel="Pipeline SLA"
                    hue={activeHue}
                    rating={5}
                  />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
