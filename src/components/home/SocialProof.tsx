import React from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { Globe, Zap, Cpu, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SocialProof: React.FC = () => {
  const stats = [
    { 
      value: '42', 
      label: 'Global Edge PoPs', 
      detail: 'Anycast DNS & TLS 1.3 0-RTT',
      icon: Globe,
      color: 'text-accent-cyan'
    },
    { 
      value: '18ms', 
      label: 'Average Edge TTFB', 
      detail: 'Measured across top 10 regions',
      icon: Zap,
      color: 'text-accent-emerald'
    },
    { 
      value: '8', 
      label: 'Parallel Telemetry Engines', 
      detail: 'AST, OWASP, Carbon & LLMO',
      icon: Cpu,
      color: 'text-accent-purple'
    },
    { 
      value: '< 2.0s', 
      label: 'Synchronous Scan Speed', 
      detail: 'Zero lockup async queue',
      icon: Clock,
      color: 'text-accent-amber'
    },
  ];

  const enterpriseBadges = [
    'OWASP ASVS v4.0.3 Level 3',
    'W3C Core Web Vitals 2026',
    'Sustainable Web Design v4 (SWD)',
    'IETF RFC 9114 (HTTP/3 over QUIC)',
    'Schema.org Semantic Entity Graph'
  ];

  return (
    <section className="py-12 lg:py-14 bg-transparent border-b border-brand-slate/30 text-brand-offwhite relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-8">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/40 bg-surface-panel px-3 py-0.5 text-xs font-mono text-brand-periwinkle mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
              <span>Production Metric Benchmarks</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-brand-offwhite leading-tight font-sans">
              High-Frequency Diagnostic Mesh Built for Scale
            </h2>
            <p className="text-xs sm:text-sm text-brand-periwinkle mt-1.5">
              Continuous multi-tenant telemetry validated against international engineering protocols.
            </p>
          </LazyReveal>
        </div>

        <LazyReveal direction="up" delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx}
                  className="bg-surface-panel border border-brand-slate/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3 hover:border-brand-slate transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-brand-offwhite tracking-tight metric-tabular">
                      {stat.value}
                    </span>
                    <div className={`p-2 rounded-xl bg-brand-oxford border border-brand-slate/40 ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-brand-offwhite leading-snug font-sans">
                      {stat.label}
                    </div>
                    <div className="text-[11px] font-mono text-brand-periwinkle mt-1">
                      {stat.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </LazyReveal>

        {/* Enterprise Compliance Strip */}
        <LazyReveal direction="up" delay={0.2}>
          <div className="mt-8 pt-6 border-t border-brand-slate/30 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-mono text-brand-slate-light">
            <span className="text-brand-periwinkle font-bold uppercase tracking-wider text-[10px]">
              Validated Compliance Standards:
            </span>
            {enterpriseBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-brand-periwinkle">
                <CheckCircle2 className="h-3 w-3 text-accent-cyan shrink-0" />
                <span className="text-[11px]">{badge}</span>
              </div>
            ))}
          </div>
        </LazyReveal>

      </div>
    </section>
  );
};

export default SocialProof;
