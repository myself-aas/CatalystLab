import React from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { Globe, Zap, Cpu, Clock, Check } from 'lucide-react';

export const SocialProof: React.FC = () => {
  const stats = [
    { 
      value: '42', 
      label: 'Global Edge PoPs', 
      detail: 'Anycast DNS & TLS 1.3 0-RTT',
      icon: Globe
    },
    { 
      value: '18ms', 
      label: 'Average Edge TTFB', 
      detail: 'Measured across top 10 regions',
      icon: Zap
    },
    { 
      value: '8', 
      label: 'Parallel Telemetry Engines', 
      detail: 'AST, OWASP, Carbon & LLMO',
      icon: Cpu
    },
    { 
      value: '< 2.0s', 
      label: 'Synchronous Scan Speed', 
      detail: 'Zero lockup async queue',
      icon: Clock
    },
  ];

  const enterpriseBadges = [
    'OWASP ASVS v4.0.3 Level 3',
    'W3C Core Web Vitals 2026',
    'Sustainable Web Design v4',
    'IETF RFC 9114 (HTTP/3 over QUIC)',
    'Schema.org Semantic Entity Graph'
  ];

  return (
    <section className="py-20 lg:py-24 bg-white border-b border-zinc-200 text-zinc-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <LazyReveal direction="up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-950 leading-tight">
              High-Frequency Diagnostic Mesh Built for Scale
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 mt-4 leading-relaxed">
              Continuous multi-tenant telemetry validated against international engineering protocols.
            </p>
          </LazyReveal>
        </div>

        <LazyReveal direction="up" delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx}
                  className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4 hover:bg-zinc-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-4xl sm:text-5xl font-bold text-zinc-950 tracking-tight">
                      {stat.value}
                    </span>
                    <div className="p-3 rounded-2xl bg-white border border-zinc-200 text-zinc-950 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-zinc-950 leading-snug">
                      {stat.label}
                    </div>
                    <div className="text-xs text-zinc-600 mt-1.5">
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
          <div className="mt-16 pt-8 border-t border-zinc-200 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <span className="text-zinc-500 font-bold uppercase tracking-wider text-xs">
              Validated Standards
            </span>
            {enterpriseBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-zinc-700 font-medium text-sm">
                <Check className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </LazyReveal>

      </div>
    </section>
  );
};

export default SocialProof;
