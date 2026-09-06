import React, { Suspense } from 'react';
import { motion } from 'motion/react';
import { Cpu, Server, Activity, ShieldCheck } from 'lucide-react';

const EdgeMeshGlobe = React.lazy(() => import('../ui/edge-mesh-globe'));

const SPECS = [
  {
    id: 'throughput',
    name: 'Audit Throughput',
    value: '400k',
    unit: 'req/s',
    why: 'Peak concurrent audit execution with zero queue backlog or dropped packets.',
    badge: 'PARALLEL PIPELINE',
  },
  {
    id: 'latency',
    name: 'Global Edge Latency',
    value: '< 12',
    unit: 'ms',
    why: 'P95 response time across 42 global anycast points of presence.',
    badge: 'ANYCAST MESH',
  },
  {
    id: 'retention',
    name: 'Telemetry Retention',
    value: '13',
    unit: 'months',
    why: 'Immutable time-series telemetry archive for regression analysis and compliance audits.',
    badge: 'COLD / WARM TIER',
  },
  {
    id: 'accuracy',
    name: 'Synthetic Fidelity',
    value: '99.9',
    unit: '%',
    why: 'Deterministic browser automation engine eliminating transient noise.',
    badge: 'DETERMINISTIC',
  }
];

export const ArchitectureComparator: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-primary border-t border-white/6 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12 md:mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-950/40 px-3 py-1 framer-micro-tag text-emerald-400 mb-3">
            <Server className="size-3.5" />
            <span>Infrastructure Specifications</span>
          </div>
          <h2 className="framer-section-headline text-primary-foreground">
            Enterprise architecture.
          </h2>
          <p className="mt-3 framer-body-text">
            Built on a globally distributed edge mesh, CatalystLab scales elastically to handle millions of synthetic requests while maintaining sub-second analysis latency.
          </p>
        </div>

        {/* 4-Card Bento Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SPECS.map((spec, i) => (
            <motion.div 
              key={spec.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden p-6 rounded-2xl bg-foreground/70 border border-white/8 hover:bg-primary/60 hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[260px] backdrop-blur-xl shadow-lg"
            >
              {/* Top Bar: Name & Live Status Ping */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">{spec.name}</h3>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400 mt-1 block">
                    {spec.badge}
                  </span>
                </div>

                <div className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              
              {/* Interactive Edge Globe for Latency Card */}
              {spec.id === 'latency' && (
                <div className="absolute right-0 top-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none translate-x-1/4 -translate-y-1/4 scale-125">
                  <Suspense fallback={null}>
                    <EdgeMeshGlobe 
                      variant="thumb" 
                      autoSpin={true} 
                      interactive={false} 
                      showChips={false} 
                      showControls={false} 
                      showInspector={false} 
                    />
                  </Suspense>
                </div>
              )}

              {/* Bottom Stat Value & Description */}
              <div className="relative z-10 mt-6">
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-4xl font-semibold text-primary-foreground font-mono tracking-tight">{spec.value}</span>
                  <span className="text-sm text-muted-foreground font-mono font-medium">{spec.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed border-t border-white/6 pt-3.5">
                  {spec.why}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ArchitectureComparator;

