import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Activity, Globe, ArrowUpRight, Cpu, Sparkles } from 'lucide-react';
import EdgeMeshGlobe from '../ui/edge-mesh-globe';

const METRICS = [
  {
    id: 'cwv',
    icon: Zap,
    accent: '#5E6AD2',
    title: 'Core Web Vitals & DOM Depth',
    description: 'Measure LCP, INP, and CLS with precision down to the millisecond. Pinpoint exactly which assets are blocking critical render paths.',
    value: '99.9%',
    label: 'Diagnostic Precision',
    tag: 'ZYME ENGINE',
  },
  {
    id: 'security',
    icon: Shield,
    accent: '#F43F5E',
    title: 'OWASP Transport & Zero-Trust',
    description: 'Autonomous zero-trust transport validation. Validates HSTS preloads, strict CSP nonces, and TLS 1.3 cryptographic configurations in real-time.',
    value: '14+',
    label: 'Attack Vectors Audited',
    tag: 'SEC-PROTEASE',
  },
  {
    id: 'dom',
    icon: Activity,
    accent: '#A855F7',
    title: 'AST & LLM Discoverability',
    description: 'Deep structural analysis of HTML trees and AI manifests. Audits /llms.txt compliance, robots directives, and Schema.org knowledge graphs.',
    value: '< 50ms',
    label: 'Scan Latency',
    tag: 'LLM-KINASE',
  },
  {
    id: 'edge',
    icon: Globe,
    accent: '#34D399',
    title: 'Global Anycast Edge Mesh',
    description: 'Ping your domain from 42 edge PoPs simultaneously. Map global TTFB variance, 0-RTT resumption, and CDN memory cache hit rates.',
    value: '42',
    label: 'Active Edge PoPs',
    tag: 'EDGE-VMAX',
  }
];

export const FeaturedAuditMetrics: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-transparent border-t border-border-default relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent-bright mb-3 backdrop-blur-md">
              <Cpu className="size-3.5 text-accent" />
              <span>Full-Spectrum Diagnostics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-tight text-gradient-linear">
              Deep visibility. Zero overhead.
            </h2>
            <p className="mt-3 text-foreground-muted text-base sm:text-lg leading-relaxed">
              Our autonomous engines perform multi-dimensional analysis without requiring you to install any SDKs or modify your source code.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-foreground-muted">
            <span className="flex size-2 rounded-full bg-accent animate-pulse" />
            <span>Telemetry Pipeline: Active (42 Nodes)</span>
          </div>
        </div>

        {/* Bento 2.0 4-Card Asymmetric Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {METRICS.map((metric, i) => (
            <motion.div 
              key={metric.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-6 sm:p-8 rounded-2xl bg-white/[0.04] border border-border-default hover:border-border-hover hover:bg-white/[0.07] transition-all duration-300 flex flex-col justify-between min-h-[300px] overflow-hidden backdrop-blur-xl shadow-linear-card hover:shadow-linear-card-hover"
            >
              {/* Corner Ambient Glow */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: metric.accent }}
              />

              <div>
                {/* Top Bar: Icon + Engine Code Tag */}
                <div className="flex items-center justify-between mb-6">
                  <div 
                    style={{
                      color: metric.accent,
                      backgroundColor: `${metric.accent}15`,
                      borderColor: `${metric.accent}30`,
                    }}
                    className="size-11 rounded-xl flex items-center justify-center border shadow-sm group-hover:scale-105 transition-transform duration-300"
                  >
                    <metric.icon className="size-5" />
                  </div>

                  <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted bg-white/[0.04] border border-border-default px-2.5 py-1 rounded-full">
                    {metric.tag}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                  {metric.title}
                </h3>
                <p className="mt-3 text-foreground-muted leading-relaxed text-sm max-w-[45ch]">
                  {metric.description}
                </p>
              </div>
              
              {/* Interactive Globe in Corner of Edge Card */}
              {metric.id === 'edge' && (
                <div className="absolute right-[-20px] bottom-[-20px] opacity-30 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none w-48 h-48">
                  <EdgeMeshGlobe 
                    variant="thumb" 
                    autoSpin={true} 
                    interactive={false} 
                    showChips={false} 
                    showControls={false} 
                    showInspector={false} 
                  />
                </div>
              )}

              {/* Bottom Metric Readout */}
              <div className="relative z-10 mt-8 pt-5 border-t border-border-default flex items-baseline justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-foreground font-mono tracking-tight">{metric.value}</span>
                  <span className="text-xs text-foreground-muted font-medium font-mono">{metric.label}</span>
                </div>

                <ArrowUpRight className="size-4 text-foreground-muted group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedAuditMetrics;

