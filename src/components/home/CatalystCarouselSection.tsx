import React, { useState } from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { Sparkles, Cpu } from 'lucide-react';
import { CatalystCarouselRail } from '../cards/marketing/CatalystCarouselRail';
import { CatalystCarouselCard } from '../cards/marketing/CatalystCarouselCard';
import { EnzymeHue } from '../cards/types';

interface CarouselItem {
  id: string;
  hue: EnzymeHue;
  title: string;
  category: string;
  statLine: string;
  assetId: string;
  route: string;
}

const CAROUSEL_ENZYMES: CarouselItem[] = [
  {
    id: 'vitalzyme',
    hue: 'vitalzyme',
    title: 'VitalZyme Engine',
    category: 'CORE • PERF',
    statLine: '18ms TTFB • 0.62s LCP',
    assetId: 'enzyme-silicon-macro',
    route: '/health',
  },
  {
    id: 'riskprotease',
    hue: 'riskprotease',
    title: 'RiskProtease Engine',
    category: 'ENTERPRISE • SEC',
    statLine: '6/6 OWASP • 2yr HSTS',
    assetId: 'enzyme-quantum-processor',
    route: '/compliance',
  },
  {
    id: 'llmkinase',
    hue: 'llmkinase',
    title: 'LLM-Kinase Engine',
    category: 'DEVELOPER & AI',
    statLine: '98% RAG • 18 Entities',
    assetId: 'enzyme-neural-hologram',
    route: '/llmo',
  },
  {
    id: 'edgevmax',
    hue: 'edgevmax',
    title: 'EdgeVMax Engine',
    category: 'CORE • ANYCAST',
    statLine: '42 Global PoPs • 0-RTT',
    assetId: 'enzyme-fiber-optics',
    route: '/edge-delivery',
  },
  {
    id: 'ecoholo',
    hue: 'ecoholo',
    title: 'EcoHolo Engine',
    category: 'GREEN • SUSTAINABILITY',
    statLine: '0.08g CO2e • SWD v4',
    assetId: 'enzyme-clean-datacenter',
    route: '/carbon-audit',
  },
  {
    id: 'synthshift',
    hue: 'synthshift',
    title: 'SynthShift Engine',
    category: 'MIGRATION • SEO',
    statLine: '0 Broken Links • 100% 301s',
    assetId: 'enzyme-laser-mesh',
    route: '/migration',
  },
  {
    id: 'gitlygase',
    hue: 'gitlygase',
    title: 'GitLygase Engine',
    category: 'CI/CD • SECOPS',
    statLine: '0 CVEs • Strict Branch Rules',
    assetId: 'enzyme-server-rack-night',
    route: '/repo-scanner',
  },
  {
    id: 'alloster',
    hue: 'alloster',
    title: 'Alloster Engine',
    category: 'SEMANTIC GRAPH',
    statLine: '100% Schema.org • SGE-Ready',
    assetId: 'enzyme-datacenter-corridor',
    route: '/alloster',
  },
];

export const CatalystCarouselSection: React.FC = () => {
  const [activeEnzymeId, setActiveEnzymeId] = useState<string>('vitalzyme');

  return (
    <section className="py-20 lg:py-24 bg-white text-slate-900 border-b border-slate-200 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-sans font-bold text-indigo-700 tracking-widest shadow-sm mb-4 uppercase">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>R3 Destination Reel • 8 Autonomous Enzymes</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Interactive Micro-Engine Rail
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mt-4 leading-relaxed font-medium">
              Explore the 8 synchronous diagnostic engines powering the CatalystLab Telemetry OS.
            </p>
          </LazyReveal>
        </div>

        {/* Catalyst R3 Destination Strip Carousel */}
        <LazyReveal direction="up" delay={0.1}>
          <CatalystCarouselRail
            activeId={activeEnzymeId}
            onActiveChange={(idx) => {
              if (idx >= 0 && idx < CAROUSEL_ENZYMES.length) {
                setActiveEnzymeId(CAROUSEL_ENZYMES[idx].id);
              }
            }}
          >
            {CAROUSEL_ENZYMES.map((item) => {
              const isActive = activeEnzymeId === item.id;
              return (
                <CatalystCarouselCard
                  key={item.id}
                  id={item.id}
                  hue={item.hue}
                  title={item.title}
                  category={item.category}
                  statLine={item.statLine}
                  assetId={item.assetId}
                  isActive={isActive}
                  onSelect={() => setActiveEnzymeId(item.id)}
                  actionUrl={item.route}
                  actionLabel="Inspect Micro-Engine ›"
                />
              );
            })}
          </CatalystCarouselRail>
        </LazyReveal>

      </div>
    </section>
  );
};
