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
