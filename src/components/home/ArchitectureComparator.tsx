import React from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { ShieldAlert, Zap, SearchCode, Leaf, GitBranch, Layers, Check, X, ArrowRight } from 'lucide-react';
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
      color: 'text-accent-cyan bg-cyan-950/40 border-cyan-500/30'
    },
    {
      dimension: 'Security & Headers (OWASP)',
      description: 'HSTS, CSP, and XSS defense',
      icon: ShieldAlert,
      legacy: 'Missing headers & vulnerable XSS',
      catalyst: 'Strict CSP, HSTS, and X-Content-Type',
      benefit: 'A+ Grade Transport',
      color: 'text-accent-rose bg-rose-950/40 border-rose-500/30'
    },
    {
      dimension: 'AI Search Discoverability',
      description: 'LLM context & RAG parsing',
      icon: SearchCode,
      legacy: 'Blocked crawlers & missing /llms.txt',
      catalyst: 'Clean /llms.txt + Validated RAG Schema',
      benefit: 'Perplexity/Claude Ready',
      color: 'text-accent-purple bg-purple-950/40 border-purple-500/30'
    },
    {
      dimension: 'Carbon Efficiency (SWD v4)',
      description: 'Scientific CO2e energy accounting',
      icon: Leaf,
      legacy: '1.84g CO2 / View (F Rating)',
      catalyst: '0.08g CO2 / View (A+ Certified)',
      benefit: '95.6% CO2e Reduction',
      color: 'text-accent-emerald bg-emerald-950/40 border-emerald-500/30'
    },
    {
      dimension: 'AST Route Integrity',
      description: 'Redirect chains & 404 dead-ends',
      icon: Layers,
      legacy: 'Unmonitored loops & broken links',
      catalyst: 'Zero-loss AST diffing & 301 tree',
      benefit: '100% Link Parity',
      color: 'text-accent-amber bg-amber-950/40 border-amber-500/30'
    },
    {
      dimension: 'Code Hygiene & CI/CD',
      description: 'Pre-commit secret scans & dependencies',
      icon: GitBranch,
      legacy: 'Manual reviews & untracked CVEs',
      catalyst: 'Continuous AST & Automated Shields',
      benefit: 'Zero Known CVEs',
      color: 'text-brand-periwinkle bg-brand-oxford border-brand-slate/40'
    }
  ];

  return (
    <section className="py-14 lg:py-18 bg-brand-oxford/70 backdrop-blur-sm text-brand-offwhite relative overflow-hidden border-b border-brand-slate/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/40 bg-surface-panel px-3.5 py-1 text-xs font-mono text-brand-periwinkle mb-3 shadow-sm">
              <Zap className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Architectural Parity Benchmark</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-offwhite leading-tight">
              Architectural Parity Benchmark
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-brand-periwinkle max-w-2xl mx-auto leading-relaxed">
              Side-by-side architectural audit comparing traditional unmonitored infrastructure with CatalystLab's automated telemetry stack.
            </p>
          </LazyReveal>
        </div>

        {/* Responsive Table View Comparison */}
        <LazyReveal direction="up" delay={0.1}>
          <div className="bg-surface-panel border border-brand-slate/40 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-slate/40 bg-brand-navy font-mono text-xs text-brand-slate-light">
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-brand-offwhite w-1/3">
                      Architectural Dimension
                    </th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-accent-rose bg-rose-950/20 w-1/4">
                      Legacy Deployments
                    </th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-accent-emerald bg-emerald-950/20 w-1/4">
                      CatalystLab Pipeline
                    </th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-brand-offwhite text-right">
                      Advantage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-slate/30 text-xs sm:text-sm font-mono">
                  {comparisonItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <tr key={idx} className="hover:bg-surface-subtle transition-colors">
                        
                        {/* Dimension & Icon */}
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border shrink-0 ${item.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-brand-offwhite text-xs sm:text-sm">
                                {item.dimension}
                              </div>
                              <div className="text-[11px] text-brand-slate-light font-mono mt-0.5">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Legacy */}
                        <td className="py-3.5 px-4 bg-rose-950/10 text-brand-periwinkle">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-rose-900/60 text-accent-rose text-[10px]">
                              <X className="h-2.5 w-2.5" />
                            </span>
                            <span className="text-rose-200/80 leading-relaxed text-xs">
                              {item.legacy}
                            </span>
                          </div>
                        </td>

                        {/* CatalystLab Pipeline */}
                        <td className="py-3.5 px-4 bg-emerald-950/10 text-brand-offwhite font-bold">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-900/60 text-accent-emerald text-[10px]">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                            <span className="text-accent-emerald leading-relaxed text-xs">
                              {item.catalyst}
                            </span>
                          </div>
                        </td>

                        {/* Advantage Pill */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-accent-cyan whitespace-nowrap">
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
            <div className="bg-brand-navy border-t border-brand-slate/30 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-brand-slate-light">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
                <span className="font-bold text-brand-periwinkle uppercase">6 of 6 Telemetry Vectors Validated across 42 Edge Points</span>
              </div>
              <div className="text-brand-slate-light font-bold uppercase text-[10px]">
                Continuous synthetic probes active 24/7
              </div>
            </div>
          </div>
        </LazyReveal>

        {/* Action */}
        <div className="mt-10 text-center">
          <Link
            to="/playground"
            className="inline-flex items-center gap-2 bg-brand-slate hover:bg-brand-slate-hover text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all shadow-md active:scale-95 border border-brand-periwinkle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
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
