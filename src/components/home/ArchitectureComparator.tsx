import React from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { ShieldAlert, Zap, SearchCode, Leaf, GitBranch, Layers, Check, X, ArrowRight, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ArchitectureComparator: React.FC = () => {
  const comparisonItems = [
    {
      dimension: 'Global Edge Performance',
      description: 'DNS resolution & TTFB latency',
      icon: Zap,
      legacy: 'Regional routing & sluggish TTFB',
      catalyst: '42 Anycast PoPs & 0-RTT TLS 1.3',
      benefit: 'Ultra-Low Latency',
      color: 'text-sky-600 bg-sky-50 border-sky-200'
    },
    {
      dimension: 'Security & Headers (OWASP)',
      description: 'HSTS, CSP, and XSS defense',
      icon: ShieldAlert,
      legacy: 'Missing headers & vulnerable XSS',
      catalyst: 'Strict CSP, HSTS, and X-Content-Type',
      benefit: 'A+ Grade Transport',
      color: 'text-rose-600 bg-rose-50 border-rose-200'
    },
    {
      dimension: 'AI Search Discoverability',
      description: 'LLM context & RAG parsing',
      icon: SearchCode,
      legacy: 'Blocked crawlers & missing /llms.txt',
      catalyst: 'Clean /llms.txt + Validated RAG Schema',
      benefit: 'Perplexity/Claude Ready',
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      dimension: 'Carbon Efficiency (SWD v4)',
      description: 'Scientific CO2e energy accounting',
      icon: Leaf,
      legacy: '1.84g CO2 / View (F Rating)',
      catalyst: '0.08g CO2 / View (A+ Certified)',
      benefit: '95.6% Carbon Reduction',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      dimension: 'AST Route Integrity',
      description: 'Redirect chains & 404 dead-ends',
      icon: Layers,
      legacy: 'Unmonitored loops & broken links',
      catalyst: 'Zero-loss AST diffing & 301 tree',
      benefit: '100% Link Parity',
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      dimension: 'Code Hygiene & CI/CD',
      description: 'Pre-commit secret scans & dependencies',
      icon: GitBranch,
      legacy: 'Manual reviews & untracked CVEs',
      catalyst: 'Continuous AST & Automated Shields',
      benefit: 'Zero Known CVEs',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    }
  ];

  return (
    <section className="py-12 lg:py-16 bg-brand-ghost text-brand-navy relative overflow-hidden border-y border-brand-periwinkle-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <LazyReveal direction="up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-brand-navy leading-[1.1]">
              Architectural Parity Benchmark.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-brand-slate max-w-2xl mx-auto font-medium leading-relaxed">
              Side-by-side architectural audit comparing traditional unmonitored infrastructure with CatalystLab's automated telemetry stack.
            </p>
          </LazyReveal>
        </div>

        {/* Responsive Table View Comparison */}
        <LazyReveal direction="up" delay={0.1}>
          <div className="bg-white border border-brand-periwinkle-light rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-periwinkle-light bg-brand-offwhite font-mono text-sm text-brand-slate">
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-brand-navy w-1/3">
                      Architectural Dimension
                    </th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-rose-700 bg-rose-50/40 w-1/4">
                      Legacy Deployments
                    </th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50/40 w-1/4">
                      CatalystLab Pipeline
                    </th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-brand-navy text-right">
                      Advantage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-offwhite font-sans text-base">
                  {comparisonItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <tr key={idx} className="hover:bg-brand-ghost/50 transition-colors group">
                        
                        {/* Column 1: Dimension & Icon */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-bold text-brand-navy text-base group-hover:text-sky-700 transition-colors">
                                {item.dimension}
                              </div>
                              <div className="text-sm text-brand-slate font-mono mt-1">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Legacy Deployments */}
                        <td className="py-3 px-4 bg-rose-50/20 font-mono text-sm text-brand-slate">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                              <X className="h-3 w-3" />
                            </span>
                            <span className="text-rose-950 font-medium leading-relaxed">
                              {item.legacy}
                            </span>
                          </div>
                        </td>

                        {/* Column 3: CatalystLab Pipeline */}
                        <td className="py-3 px-4 bg-emerald-50/20 font-mono text-sm text-brand-navy">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="font-bold text-emerald-950 leading-relaxed">
                              {item.catalyst}
                            </span>
                          </div>
                        </td>

                        {/* Column 4: Differential Advantage Pill */}
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center font-mono text-sm uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 shadow-sm whitespace-nowrap">
                            {item.benefit}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer Summary Bar */}
            <div className="bg-brand-offwhite border-t border-brand-periwinkle-light px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-mono text-brand-slate">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-brand-navy tracking-widest uppercase">6 of 6 Telemetry Vectors Validated across 42 Edge Points</span>
              </div>
              <div className="text-brand-slate-light font-bold tracking-widest uppercase">
                Continuous synthetic probes active 24/7
              </div>
            </div>
          </div>
        </LazyReveal>

        {/* Clean Call to Action */}
        <div className="mt-12 text-center">
          <Link
            to="/launch-audit"
            className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-slate-hover text-white px-8 py-3.5 rounded-xl text-base font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer"
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
