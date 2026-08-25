import React from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { Globe, Zap, Cpu, Clock, Check, ShieldCheck, Terminal } from 'lucide-react';
import { StatCounter } from '../ui/StatCounter';

export const SocialProof: React.FC = () => {
  const stats = [
    { 
      value: '42', 
      label: 'Global Edge PoPs', 
      detail: 'Anycast DNS & TLS 1.3 0-RTT',
      icon: Globe,
      accent: '#06B6D4'
    },
    { 
      value: '18ms', 
      label: 'Average Edge TTFB', 
      detail: 'Measured across top 10 regions',
      icon: Zap,
      accent: '#00F0FF'
    },
    { 
      value: '8', 
      label: 'Parallel Telemetry Engines', 
      detail: 'AST, OWASP, Carbon & LLMO',
      icon: Cpu,
      accent: '#00FF66'
    },
    { 
      value: '< 2.0s', 
      label: 'Synchronous Scan Speed', 
      detail: 'Zero lockup async queue',
      icon: Clock,
      accent: '#FBBF24'
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
    <section id="social-proof-telemetry" className="py-20 lg:py-24 bg-[#080D1A] border-b border-slate-800 text-slate-100 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b1a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3.5 py-1 text-xs font-mono font-medium text-[#00F0FF] shadow-sm mb-3">
              <Terminal className="h-3.5 w-3.5 text-[#00F0FF]" />
              <span>GLOBAL HIGH-FREQUENCY TELEMETRY MESH</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Enterprise Scale Diagnostic Infrastructure
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
              Continuous multi-tenant telemetry validated against international engineering protocols and real-time edge telemetry nodes.
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
                  id={`stat-card-${idx}`}
                  className="bg-[#0B101D]/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 hover:bg-[#0E1526] transition-all shadow-[0_8px_24px_rgba(0,0,0,0.4)] group"
                >
                  <div className="flex items-center justify-between">
                    <span 
                      style={{ color: stat.accent }}
                      className="text-4xl sm:text-5xl font-bold font-mono tracking-tight"
                    >
                      <StatCounter value={stat.value} />
                    </span>
                    <div 
                      style={{ color: stat.accent, borderColor: `${stat.accent}30`, backgroundColor: `${stat.accent}15` }}
                      className="p-3 rounded-xl border flex items-center justify-center shrink-0"
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-[#00F0FF] transition-colors">
                      {stat.label}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
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
          <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="text-slate-400 font-mono font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
              <span>Validated Standards:</span>
            </span>
            {enterpriseBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300 font-mono text-xs bg-[#0B101D] border border-slate-800 px-3 py-1.5 rounded-lg">
                <Check className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
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
