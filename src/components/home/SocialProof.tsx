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
    <section id="social-proof-telemetry" className="py-20 lg:py-24 bg-[#080D1A] border-b border-slate-800 text-slate-100 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b1a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
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
          <div className="mt-12">
            <div className="w-full h-12 mb-8 relative rounded-full overflow-hidden opacity-60">
              <ScanRevealFigure
                assetId="enzyme-vitalzyme"
                aspectRatio="auto"
                className="w-full h-full"
                containerClassName="h-full w-full border-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#060912] via-transparent to-[#060912]" />
            </div>
            
            <div className="text-center mb-5">
              <span className="text-slate-400 font-mono font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span className="text-slate-400 font-mono font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 mr-2">
              <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
              <span>Validated Standards:</span>
            </span>
            {enterpriseBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300 font-mono text-xs bg-[#0B101D] border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
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
