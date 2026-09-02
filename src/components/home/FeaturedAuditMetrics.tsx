import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Activity, Globe } from 'lucide-react';
import EdgeMeshGlobe from '../ui/edge-mesh-globe';

const METRICS = [
  {
    id: 'cwv',
    icon: Zap,
    title: 'Core Web Vitals',
    description: 'Measure LCP, FID, and CLS with precision down to the millisecond. Pinpoint exactly which assets are blocking render.',
    value: '99.9%',
    label: 'Accuracy',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security Posture',
    description: 'Automated OWASP Top 10 vulnerability scanning. Validates HSTS, CSP headers, and TLS configurations in real-time.',
    value: '14+',
    label: 'Vectors Analyzed',
  },
  {
    id: 'dom',
    icon: Activity,
    title: 'DOM Architecture',
    description: 'Deep structural analysis of HTML trees. Identifies excessive depth, layout shift triggers, and hydration mismatches.',
    value: '< 50ms',
    label: 'Scan Latency',
  },
  {
    id: 'edge',
    icon: Globe,
    title: 'Global Edge Jitter',
    description: 'Ping your domain from 42 edge nodes simultaneously. Map global TTFB variance and CDN cache hit rates.',
    value: '42',
    label: 'Global Nodes',
  }
];

export const FeaturedAuditMetrics: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-black border-t border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        
        <div className="mb-12 md:mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">
            Deep visibility. Zero overhead.
          </h2>
          <p className="mt-4 text-zinc-400 text-lg leading-relaxed">
            Our autonomous engines perform multi-dimensional analysis without requiring you to install any SDKs or modify your source code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {METRICS.map((metric, i) => (
            <motion.div 
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-8 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all duration-500 flex flex-col justify-between min-h-[320px] overflow-hidden"
            >
              {/* Subtle top glow on hover */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10">
                <div className="h-10 w-10 rounded-lg bg-zinc-900/80 flex items-center justify-center border border-zinc-800 mb-6 group-hover:scale-110 group-hover:border-zinc-700 transition-all duration-500">
                  <metric.icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-medium text-white tracking-tight">{metric.title}</h3>
                <p className="mt-3 text-zinc-400 leading-relaxed text-sm max-w-[40ch] group-hover:text-zinc-300 transition-colors duration-500">
                  {metric.description}
                </p>
              </div>
              
              {metric.id === 'edge' && (
                <div className="absolute right-0 bottom-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none translate-x-1/4 translate-y-1/4">
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

              <div className="relative z-10 mt-8 pt-8 border-t border-zinc-900 flex items-baseline gap-3">
                <span className="text-3xl font-medium text-white font-mono tracking-tight">{metric.value}</span>
                <span className="text-sm text-zinc-400 font-medium">{metric.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
