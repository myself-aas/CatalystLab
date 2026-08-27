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
    <section id="architecture-comparator-section" className="py-24 lg:py-32 bg-slate-50 text-slate-900 relative overflow-hidden border-b border-slate-200">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-sans font-bold text-indigo-700 shadow-sm mb-4">
              <Cpu className="h-3.5 w-3.5 text-indigo-600" />
              <span>ARCHITECTURAL BENCHMARK MATRIX</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Architectural Parity Benchmark
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl font-medium leading-relaxed">
              Side-by-side architectural audit comparing traditional unmonitored infrastructure with CatalystLab's automated 8-catalyst telemetry stack.
            </p>
          </LazyReveal>

          {/* View Toggle - Responsive Layout */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm self-start">
            <button
              type="button"
              id="arch-view-table-btn"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Table
            </button>
            <button
              type="button"
              id="arch-view-card-btn"
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Card
            </button>
          </div>
        </div>

        {/* Responsive Content Container */}
        <div className="mt-8">
          <LazyReveal direction="up" delay={0.1}>
            {/* Conditional Rendering based on viewMode */}
            <div className={viewMode === 'card' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-10">
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
            </div>

            {/* Desktop Table View - Still hidden on mobile for clarity if desired, or let it scroll */}
            <div className={viewMode === 'table' ? 'block' : 'hidden'}>
              <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-sans text-xs text-slate-500">
                        <th className="py-5 px-6 font-bold uppercase tracking-wider text-slate-700">Architectural Dimension</th>
                        <th className="py-5 px-6 font-bold uppercase tracking-wider text-rose-600">Legacy</th>
                        <th className="py-5 px-6 font-bold uppercase tracking-wider text-emerald-700">CatalystLab</th>
                        <th className="py-5 px-6 font-bold uppercase tracking-wider text-indigo-700 text-right">Advantage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {comparisonItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-5 px-6 font-sans">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg border border-slate-200 bg-white text-indigo-600 shadow-sm shrink-0">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="font-extrabold text-slate-900 text-sm tracking-tight">
                                  {item.dimension}
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6 text-slate-600 font-mono text-xs">{item.legacy}</td>
                            <td className="py-5 px-6 text-emerald-700 font-mono text-xs font-bold">{item.catalyst}</td>
                            <td className="py-5 px-6 text-right text-[11px] font-sans font-bold uppercase text-indigo-700 whitespace-nowrap">{item.benefit}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </LazyReveal>
        </div>

        {/* Action */}
        <div className="mt-16 text-center">
          <LazyReveal direction="up" delay={0.2}>
            <Link
              to="/playground"
              id="arch-audit-architecture-btn"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-sans text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
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

