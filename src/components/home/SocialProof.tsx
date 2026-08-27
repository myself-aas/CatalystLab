import React from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { Globe, Zap, Cpu, Clock, Check, ShieldCheck, Terminal, Cloud, Server, Database, Layers } from 'lucide-react';
import { StatCard } from '../cards/marketing/StatCard';
import { IntegrationChip } from '../cards/marketing/IntegrationChip';
import { EnzymeHue } from '../cards/types';
import { ScanRevealFigure } from '../media/ScanRevealFigure';

export const SocialProof: React.FC = () => {
  const stats: Array<{
    value: string;
    label: string;
    detail: string;
    icon: React.ReactNode;
    hue: EnzymeHue;
    delta: string;
  }> = [
    { 
      value: '42', 
      label: 'Global Edge PoPs', 
      detail: 'Anycast DNS & TLS 1.3 0-RTT',
      icon: <Globe className="h-4 w-4" />,
      hue: 'edgevmax',
      delta: '99.999% SLA'
    },
    { 
      value: '18ms', 
      label: 'Average Edge TTFB', 
      detail: 'Measured across top 10 regions',
      icon: <Zap className="h-4 w-4" />,
      hue: 'vitalzyme',
      delta: '7.7x Faster'
    },
    { 
      value: '8', 
      label: 'Parallel Telemetry Engines', 
      detail: 'AST, OWASP, Carbon & LLMO',
      icon: <Cpu className="h-4 w-4" />,
      hue: 'llmkinase',
      delta: 'Zero Lockup'
    },
    { 
      value: '< 2.0s', 
      label: 'Synchronous Scan Speed', 
      detail: 'Zero lockup async queue',
      icon: <Clock className="h-4 w-4" />,
      hue: 'synthshift',
      delta: 'Optimal P95'
    },
  ];

  const enterprisePartners = [
    { name: 'Cloudflare Workers', category: 'Edge Gateway', icon: <Cloud className="w-3.5 h-3.5" /> },
    { name: 'Google Cloud Platform', category: 'Anycast DNS', icon: <Server className="w-3.5 h-3.5" /> },
    { name: 'Fastly Edge Compute', category: 'Cache Network', icon: <Zap className="w-3.5 h-3.5" /> },
    { name: 'AWS CloudFront', category: 'PoP Ingestion', icon: <Database className="w-3.5 h-3.5" /> },
    { name: 'Vercel Edge Runtime', category: 'Next.js AST', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  const enterpriseBadges = [
    'OWASP ASVS v4.0.3 Level 3',
    'W3C Core Web Vitals 2026',
    'Sustainable Web Design v4',
    'IETF RFC 9114 (HTTP/3 over QUIC)',
    'Schema.org Semantic Entity Graph'
  ];

  return (
    <section id="social-proof-telemetry" className="py-20 lg:py-32 bg-slate-50 border-b border-slate-200 text-slate-900 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e140_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-mono font-medium text-slate-600 shadow-sm mb-4">
              <Terminal className="h-3.5 w-3.5 text-slate-400" />
              <span>GLOBAL HIGH-FREQUENCY TELEMETRY MESH</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              Enterprise Scale Diagnostic Infrastructure
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-5 leading-relaxed font-normal">
              Continuous multi-tenant telemetry validated against international engineering protocols and real-time edge telemetry nodes.
            </p>
          </LazyReveal>
        </div>

        {/* High-Impact StatCard Mesh Grid */}
        <LazyReveal direction="up" delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
              <StatCard
                key={idx}
                id={`stat-card-${idx}`}
                value={stat.value}
                label={stat.label}
                subLabel={stat.detail}
                icon={stat.icon}
                hue={stat.hue}
                delta={stat.delta}
              />
            ))}
          </div>
        </LazyReveal>

        {/* Ecosystem Integration Chips */}
        <LazyReveal direction="up" delay={0.2}>
          <div className="mt-16">
            <div className="w-full h-12 mb-10 relative rounded-full overflow-hidden opacity-30">
              <ScanRevealFigure
                assetId="enzyme-vitalzyme"
                aspectRatio="auto"
                className="w-full h-full"
                containerClassName="h-full w-full border-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-transparent to-slate-50" />
            </div>
            
            <div className="text-center mb-6">
              <span className="text-slate-500 font-sans font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span>Synchronous Edge &amp; Cloud Integrations</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {enterprisePartners.map((partner, idx) => (
                <IntegrationChip
                  key={idx}
                  name={partner.name}
                  category={partner.category}
                  icon={partner.icon}
                  status="CONNECTED"
                />
              ))}
            </div>
          </div>
        </LazyReveal>

        {/* Enterprise Compliance Strip */}
        <LazyReveal direction="up" delay={0.3}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span className="text-slate-500 font-sans font-bold uppercase tracking-widest text-[11px] flex items-center gap-2 mr-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Validated Standards:</span>
            </span>
            {enterpriseBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700 font-sans font-medium text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
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
