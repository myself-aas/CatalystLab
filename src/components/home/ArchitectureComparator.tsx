import React, { useState } from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { 
  Activity, 
  ShieldCheck, 
  SearchCode, 
  Leaf, 
  Layers, 
  GitBranch, 
  Check, 
  X,
  Zap,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers as LayersIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BenchmarkCard as InteractiveBenchmarkCard, BenchmarkVector } from '../ui/BenchmarkCard';
import { BenchmarkCard as R5BenchmarkCard } from '../cards/marketing/BenchmarkCard';
import { EnzymeHue } from '../cards/types';

export const ArchitectureComparator: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const comparisonItems = [
    {
      dimension: 'Global Performance (VitalZyme)',
      description: 'LCP, CLS, and INP metrics under stress',
      icon: Activity,
      legacy: '1.2s+ INP, Poor CLS Layout Shifts',
      catalyst: 'Prefetched Edge Caching (LCP < 0.8s, TTFB 18ms)',
      benefit: '4.2x Faster FCP',
    },
    {
      dimension: 'OWASP Transport Security (RiskProtease)',
      description: 'HSTS, CSP, X-Content-Type, Permissions',
      icon: ShieldCheck,
      legacy: 'Missing Strict-Transport-Security & CSP nonces',
      catalyst: 'A+ Grade CSP v3, Strict Nonce & HSTS Preload',
      benefit: 'A+ Transport Zero-Trust',
    },
    {
      dimension: 'AI Discoverability & RAG (LLM-Kinase)',
      description: 'LLM context, /llms.txt & Schema.org entities',
      icon: SearchCode,
      legacy: 'Blocked AI crawlers & missing /llms.txt',
      catalyst: 'Valid /llms.txt + 18 Schema.org JSON-LD Entities',
      benefit: 'Perplexity & Claude Ready',
    },
    {
      dimension: 'Carbon Efficiency (EcoHolo)',
      description: 'SWD v4 scientific CO2e energy model',
      icon: Leaf,
      legacy: '1.84g CO2 / View (F Rating on dirty grid)',
      catalyst: '0.08g CO2 / View (100% Green Hosting Verified)',
      benefit: '95.6% CO2e Reduction',
    },
    {
      dimension: 'AST Route Parity (SynthShift)',
      description: 'Redirect chains, canonicals & dead-ends',
      icon: Layers,
      legacy: 'Unmonitored loops & broken 404 links',
      catalyst: 'Zero-loss AST diffing & automated 301 matrix',
      benefit: '100% Link Parity',
    },
    {
      dimension: 'Repository SecOps (GitLygase)',
      description: 'Pre-commit secret scans & dependencies',
      icon: GitBranch,
      legacy: 'Manual reviews & untracked CVEs',
      catalyst: 'Continuous AST scans & zero leaked API keys',
      benefit: 'Zero Known CVEs',
    }
  ];

  const benchmarkVectors: BenchmarkVector[] = [
    {
      id: 'ttfb',
      name: 'TTFB Latency (VitalZyme)',
      icon: Zap,
      targetValue: '18.4ms',
      targetScore: 98,
      targetUnit: 'ms',
      benchmarkValue: '142ms',
      benchmarkScore: 62,
      benchmarkUnit: 'ms',
      deltaText: '7.7x faster edge response',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'Sub-20ms edge resolution via 42 global anycast PoPs vs traditional origin roundtrips.',
    },
    {
      id: 'owasp',
      name: 'OWASP Headers (RiskProtease)',
      icon: ShieldCheck,
      targetValue: '6/6',
      targetScore: 100,
      targetUnit: 'rules',
      benchmarkValue: '2/6',
      benchmarkScore: 33,
      benchmarkUnit: 'rules',
      deltaText: '+67% protection surface',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'Enforced HSTS 2-year preload, strict CSP nonces, nosniff, and granular Permissions-Policy.',
    },
    {
      id: 'rag',
      name: 'AI Discoverability (LLM-Kinase)',
      icon: SearchCode,
      targetValue: '24.8k',
      targetScore: 96,
      targetUnit: 'tokens',
      benchmarkValue: '0',
      benchmarkScore: 10,
      benchmarkUnit: 'tokens',
      deltaText: '+24.8k indexable RAG tokens',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: '/llms.txt manifest and clean markdown AST for Claude, GPT-4, and Perplexity bot indexers.',
    },
    {
      id: 'eco',
      name: 'Carbon Footprint (EcoHolo)',
      icon: Leaf,
      targetValue: '0.08g',
      targetScore: 94,
      targetUnit: 'CO2/view',
      benchmarkValue: '1.42g',
      benchmarkScore: 40,
      benchmarkUnit: 'CO2/view',
      deltaText: '94% lower emissions',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'AVIF media compression and green datacenter routing under Sustainable Web Design v4.',
    },
    {
      id: 'route',
      name: 'Route AST Integrity (SynthShift)',
      icon: LayersIcon,
      targetValue: '100%',
      targetScore: 98,
      targetUnit: 'parity',
      benchmarkValue: '82%',
      benchmarkScore: 55,
      benchmarkUnit: 'parity',
      deltaText: 'Zero circular redirect loops',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'Full canonical synchronization and automated 301 migration parity matrices.',
    },
    {
      id: 'git',
      name: 'Branch SecOps (GitLygase)',
      icon: GitBranch,
      targetValue: '0 CVE',
      targetScore: 100,
      targetUnit: 'leaks',
      benchmarkValue: '4 CVE',
      benchmarkScore: 45,
      benchmarkUnit: 'leaks',
      deltaText: 'Zero exposed secrets in repo',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'Pre-commit token interception and daily automated vulnerability remediation.',
    },
  ];

  return (
    <section id="architecture-comparator-section" className="py-20 lg:py-28 bg-[#070A13] text-slate-100 relative overflow-hidden border-b border-slate-800">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#06B6D4]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3.5 py-1 text-xs font-mono font-medium text-[#00F0FF] shadow-sm mb-3">
              <Cpu className="h-3.5 w-3.5 text-[#00F0FF]" />
              <span>ARCHITECTURAL BENCHMARK MATRIX</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Architectural Parity Benchmark
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Side-by-side architectural audit comparing traditional unmonitored infrastructure with CatalystLab's automated 8-catalyst telemetry stack.
            </p>
          </LazyReveal>

          {/* View Toggle on Desktop/Tablet */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#0B101D] p-1.5 rounded-xl border border-slate-800 self-start md:self-end">
            <button
              type="button"
              id="arch-view-table-btn"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#06B6D4] text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Matrix Table
            </button>
            <button
              type="button"
              id="arch-view-card-btn"
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-[#06B6D4] text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive HUD Card
            </button>
          </div>
        </div>

        {/* Mobile / Card View */}
        <div className={viewMode === 'card' ? 'block' : 'lg:hidden'}>
          <LazyReveal direction="up" delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto mb-8">
              {comparisonItems.map((item, idx) => {
                const hues: EnzymeHue[] = ['vitalzyme', 'riskprotease', 'llmkinase', 'ecoholo', 'synthshift', 'gitlygase'];
                return (
                  <R5BenchmarkCard
                    key={idx}
                    category="PARITY BENCHMARK"
                    engineName={item.dimension}
                    description={item.description}
                    legacyTitle="Legacy Monolithic"
                    legacyValue={item.legacy.split(',')[0]}
                    legacyLabel="Legacy Baseline"
                    catalystTitle="CatalystLab"
                    catalystValue={item.catalyst.split('(')[0]}
                    catalystLabel="Synchronous Edge"
                    deltaImprovement={item.benefit}
                    hue={hues[idx] || 'edgevmax'}
                  />
                );
              })}
            </div>
            <div className="max-w-3xl mx-auto">
              <InteractiveBenchmarkCard
                targetDomain="Your Target Architecture (CatalystLab Stack)"
                targetScore={96}
                benchmarkDomain="Legacy Unmonitored Architecture"
                benchmarkScore={52}
                vectors={benchmarkVectors}
                id="arch-interactive-benchmark-card"
              />
            </div>
          </LazyReveal>
        </div>

        {/* Desktop Table View */}
        <div className={viewMode === 'table' ? 'hidden lg:block' : 'hidden'}>
          <LazyReveal direction="up" delay={0.1}>
            <div className="bg-[#0B101D]/90 border border-slate-800 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080D1A] font-mono text-xs text-slate-400">
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-slate-200 w-1/3">
                        Architectural Dimension
                      </th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-rose-400 w-1/4">
                        Legacy Deployments
                      </th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-[#00FF66] w-1/4">
                        CatalystLab Pipeline
                      </th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-[#00F0FF] text-right">
                        Parity Advantage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-sm">
                    {comparisonItems.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <tr key={idx} className="hover:bg-[#0E1526]/70 transition-colors">
                          
                          {/* Dimension & Icon */}
                          <td className="py-4.5 px-6 font-sans">
                            <div className="flex items-center gap-3.5">
                              <div className="p-2.5 rounded-xl border border-slate-800 bg-[#080D1A] text-[#00F0FF] shrink-0">
                                <Icon className="h-4.5 w-4.5" />
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm">
                                  {item.dimension}
                                </div>
                                <div className="text-xs text-slate-400 font-mono mt-0.5">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Legacy */}
                          <td className="py-4.5 px-6 text-slate-400 font-mono text-xs">
                            <div className="flex items-start gap-2.5">
                              <span aria-hidden="true" className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <X className="h-2.5 w-2.5" />
                              </span>
                              <span className="leading-relaxed">
                                {item.legacy}
                              </span>
                            </div>
                          </td>

                          {/* CatalystLab Pipeline */}
                          <td className="py-4.5 px-6 text-slate-200 font-mono text-xs font-medium">
                            <div className="flex items-start gap-2.5">
                              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15 text-[#00FF66] border border-[#10B981]/40">
                                <Check className="h-2.5 w-2.5" />
                              </span>
                              <span className="leading-relaxed text-[#00FF66]">
                                {item.catalyst}
                              </span>
                            </div>
                          </td>

                          {/* Advantage Pill */}
                          <td className="py-4.5 px-6 text-right">
                            <span className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#00F0FF] whitespace-nowrap shadow-sm">
                              {item.benefit}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="bg-[#080D1A] border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-ping" />
                  <span className="font-bold text-slate-200 uppercase">6 of 6 Telemetry Vectors Validated across 42 Edge Points</span>
                </div>
                <div className="text-[#06B6D4] font-bold uppercase text-[10px] bg-[#06B6D4]/10 border border-[#06B6D4]/30 px-2.5 py-1 rounded">
                  Continuous synthetic probes active 24/7
                </div>
              </div>
            </div>
          </LazyReveal>
        </div>

        {/* Action */}
        <div className="mt-12 text-center">
          <LazyReveal direction="up" delay={0.2}>
            <Link
              to="/playground"
              id="arch-audit-architecture-btn"
              className="inline-flex items-center justify-center gap-2 bg-[#06B6D4] hover:bg-[#00F0FF] text-slate-950 px-6 py-3.5 rounded-xl font-mono text-xs font-bold transition-all shadow-[0_0_24px_rgba(6,182,212,0.3)]"
            >
              <span>Audit Your Live Architecture Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </LazyReveal>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureComparator;

