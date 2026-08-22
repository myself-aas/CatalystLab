import React from 'react';
import { LazyReveal } from '../common/LazyAnimate';
import { Globe, Zap, Cpu, Clock } from 'lucide-react';

export const SocialProof: React.FC = () => {
  const stats = [
    { 
      value: '42', 
      label: 'Global Edge PoPs', 
      detail: 'Anycast DNS & TLS 1.3 0-RTT',
      icon: Globe,
      color: 'text-sky-500'
    },
    { 
      value: '18ms', 
      label: 'Average Global TTFB', 
      detail: 'Measured from top 10 regions',
      icon: Zap,
      color: 'text-emerald-500'
    },
    { 
      value: '8', 
      label: 'Parallel Audit Engines', 
      detail: 'AST, OWASP, Carbon & LLMO',
      icon: Cpu,
      color: 'text-purple-500'
    },
    { 
      value: '< 2.0s', 
      label: 'Synchronous Scan Speed', 
      detail: 'Zero lockup async queue',
      icon: Clock,
      color: 'text-orange-500'
    },
  ];

  return (
    <section className="py-10 lg:py-12 bg-brand-ghost border-y border-brand-periwinkle-light text-brand-navy relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Typographic hierarchy and center alignment for conversion */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <LazyReveal direction="up">
            <h2 className="text-base font-mono font-bold uppercase tracking-widest text-brand-slate-light mb-2">
              Performance by the numbers
            </h2>
            <p className="text-xl sm:text-2xl font-semibold text-brand-navy leading-tight">
              A high-frequency diagnostic mesh built for extreme scale.
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
                  className="bg-brand-offwhite border border-brand-periwinkle-light rounded-[24px] p-5 shadow-sm flex flex-col justify-between space-y-2 hover:border-brand-slate/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-brand-navy tracking-tight group-hover:scale-105 transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                      {stat.value}
                    </span>
                    <div className={`p-2.5 rounded-xl bg-brand-ghost border border-brand-periwinkle-light ${stat.color} group-hover:bg-white transition-colors`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-brand-navy leading-snug">
                      {stat.label}
                    </div>
                    <div className="text-sm font-mono text-brand-slate mt-1">
                      {stat.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </LazyReveal>
      </div>
    </section>
  );
};

export default SocialProof;
