import React from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ArchitectureComparator: React.FC = () => {
  const comparisonItems = [
    {
      dimension: 'Global Performance (CWV)',
      description: 'LCP, CLS, and INP metrics',
      icon: Activity,
      legacy: '1.2s+ INP, Poor CLS Layout Shifts',
      catalyst: 'Prefetched Edge Caching (LCP < 0.8s)',
      benefit: 'Ultra-Fast FCP',
    },
    {
      dimension: 'Security Headers',
      description: 'HSTS, CSP, X-Content-Type',
      icon: ShieldCheck,
      legacy: 'Missing Strict-Transport-Security',
      catalyst: 'A+ Grade CSP & Strict MIME-Type',
      benefit: 'A+ Grade Transport',
    },
    {
      dimension: 'AI Search Discoverability',
      description: 'LLM context & RAG parsing',
      icon: SearchCode,
      legacy: 'Blocked crawlers & missing /llms.txt',
      catalyst: 'Clean /llms.txt + Validated RAG Schema',
      benefit: 'Perplexity/Claude Ready',
    },
    {
      dimension: 'Carbon Efficiency (SWD v4)',
      description: 'Scientific CO2e energy accounting',
      icon: Leaf,
      legacy: '1.84g CO2 / View (F Rating)',
      catalyst: '0.08g CO2 / View (A+ Certified)',
      benefit: '95.6% CO2e Reduction',
    },
    {
      dimension: 'AST Route Integrity',
      description: 'Redirect chains & 404 dead-ends',
      icon: Layers,
      legacy: 'Unmonitored loops & broken links',
      catalyst: 'Zero-loss AST diffing & 301 tree',
      benefit: '100% Link Parity',
    },
    {
      dimension: 'Code Hygiene & CI/CD',
      description: 'Pre-commit secret scans & dependencies',
      icon: GitBranch,
      legacy: 'Manual reviews & untracked CVEs',
      catalyst: 'Continuous AST & Automated Shields',
      benefit: 'Zero Known CVEs',
    }
  ];

  return (
    <section className="py-24 bg-zinc-50 text-zinc-950 relative overflow-hidden border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <LazyReveal direction="up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 leading-tight">
              Architectural Parity Benchmark
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Side-by-side architectural audit comparing traditional unmonitored infrastructure with CatalystLab's automated telemetry stack.
            </p>
          </LazyReveal>
        </div>

        {/* Responsive Table View Comparison */}
        <LazyReveal direction="up" delay={0.1}>
          <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
            <p className="sr-only">Swipe horizontally on smaller screens to view the full benchmark table.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 font-mono text-xs text-zinc-500">
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-zinc-950 w-1/3">
                      Architectural Dimension
                    </th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-zinc-950 w-1/4">
                      Legacy Deployments
                    </th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-zinc-950 w-1/4">
                      CatalystLab Pipeline
                    </th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-zinc-950 text-right">
                      Advantage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-sm">
                  {comparisonItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                        
                        {/* Dimension & Icon */}
                        <td className="py-4 px-6 font-sans">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700 shrink-0">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-bold text-zinc-950 text-sm">
                                {item.dimension}
                              </div>
                              <div className="text-xs text-zinc-500 font-mono mt-1">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Legacy */}
                        <td className="py-4 px-6 text-zinc-600">
                          <div className="flex items-start gap-3">
                            <span aria-hidden="true" className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                              <X className="h-3 w-3" />
                            </span>
                            <span className="leading-relaxed">
                              {item.legacy}
                            </span>
                          </div>
                        </td>

                        {/* CatalystLab Pipeline */}
                        <td className="py-4 px-6 text-emerald-800 font-medium">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black text-white">
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="leading-relaxed">
                              {item.catalyst}
                            </span>
                          </div>
                        </td>

                        {/* Advantage Pill */}
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 whitespace-nowrap">
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
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-700 uppercase">6 of 6 Telemetry Vectors Validated across 42 Edge Points</span>
              </div>
              <div className="text-slate-500 font-bold uppercase text-[10px]">
                Continuous synthetic probes active 24/7
              </div>
            </div>
          </div>
        </LazyReveal>

        {/* Action */}
        <div className="mt-12 text-center">
          <Link
            to="/playground"
            className="inline-flex items-center justify-center gap-2 bg-black hover:bg-black-hover text-white px-6 py-3.5 rounded-full text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <span>Audit Your Architecture</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureComparator;
