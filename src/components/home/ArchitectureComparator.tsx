import React from 'react';
import { motion } from 'motion/react';
import EdgeMeshGlobe from '../ui/edge-mesh-globe';

const SPECS = [
  {
    id: 'throughput',
    name: 'Throughput',
    value: '400k',
    unit: 'req/s',
    why: 'Peak concurrent audit execution without queuing delays.',
  },
  {
    id: 'latency',
    name: 'Global Latency',
    value: '< 12',
    unit: 'ms',
    why: 'Average response time across our 42-node edge network.',
  },
  {
    id: 'retention',
    name: 'Data Retention',
    value: '13',
    unit: 'months',
    why: 'Historical telemetry available for year-over-year reporting.',
  },
  {
    id: 'accuracy',
    name: 'Fidelity',
    value: '99.9',
    unit: '%',
    why: 'Zero-noise data pipeline filtering synthetic bot traffic.',
  }
];

export const ArchitectureComparator: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-black border-t border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        
        <div className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">
            Enterprise architecture.
          </h2>
          <p className="mt-4 text-zinc-400 text-lg leading-relaxed max-w-[60ch]">
            Built on a globally distributed edge mesh, CatalystLab scales elastically to handle millions of synthetic requests while maintaining sub-second analysis latency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPECS.map((spec, i) => (
            <motion.div 
              key={spec.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all duration-500 flex flex-col justify-between min-h-[240px]"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="flex items-start justify-between relative z-10">
                <h3 className="text-sm font-medium text-zinc-400 group-hover:text-zinc-400 transition-colors duration-500">{spec.name}</h3>
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-zinc-700 group-hover:bg-emerald-500 transition-colors duration-700 shadow-[0_0_0_rgba(16,185,129,0)] group-hover:shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </div>
              
              {spec.id === 'latency' && (
                <div className="absolute right-0 top-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none translate-x-1/4 -translate-y-1/4 scale-150">
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

              <div className="relative z-10 mt-auto">
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-medium text-white font-mono tracking-tight group-hover:text-zinc-100 transition-colors duration-500">{spec.value}</span>
                  <span className="text-sm text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors duration-500">{spec.unit}</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed border-t border-zinc-900/80 pt-4 group-hover:text-zinc-400 transition-colors duration-500">
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
