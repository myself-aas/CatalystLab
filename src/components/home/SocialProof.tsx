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
    <section className="ds-section ds-surface-alt text-zinc-950 relative overflow-hidden">
      <div className="ds-page-shell">
        
        <div className="ds-section-head ds-section-head-center">
          <LazyReveal direction="up">
            <h2 className="ds-h2 text-zinc-950">
              High-Frequency Diagnostic Mesh Built for Scale
            </h2>
            <p className="ds-lede mt-4">
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
                  className="ds-card ds-card-interactive flex flex-col justify-between space-y-4 p-6 sm:p-8"
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
          <div className="mt-12 pt-8 border-t border-zinc-200 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <span className="ds-eyebrow">Validated Standards</span>
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
