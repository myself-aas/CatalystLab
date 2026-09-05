import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { LazyReveal } from '../common/LazyAnimate';
import { Network, Cpu, Bot, FileCheck } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Ingest & Resolve (0ms - 120ms)',
    description: 'Multi-region DNS & TLS 1.3 handshake resolution.',
    icon: Network,
    color: '#0066FF',
    time: '120ms',
  },
  {
    number: '02',
    title: 'Eight Engines Parallel (120ms - 640ms)',
    description: 'Asynchronous bytecode and DOM tree telemetry.',
    icon: Cpu,
    color: '#00D2FF',
    time: '520ms',
  },
  {
    number: '03',
    title: 'AI Discoverability (640ms - 880ms)',
    description: 'LLM crawlability, robots.txt, and semantic schema check.',
    icon: Bot,
    color: '#8A2BE2',
    time: '240ms',
  },
  {
    number: '04',
    title: 'Dossier & Automated Patches (880ms - 1060ms)',
    description: 'One-click PR branch generation with verified patch diffs.',
    icon: FileCheck,
    color: '#00F298',
    time: '180ms',
  },
];

export const WorkflowSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 50%'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section
      id="workflow-section"
      ref={containerRef}
      data-theme="dark"
      className="relative py-24 lg:py-32 bg-background text-foreground border-b border-border overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <LazyReveal direction="up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] leading-[1.12] text-white">
              Four Gates. 1.06s P95.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-4 leading-relaxed tracking-[-0.01em]">
              From global edge DNS resolution to instant zero-latency remediation patches in under 1,060ms total execution time.
            </p>
          </LazyReveal>
          <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground bg-background border border-border p-3 rounded-xl shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F298] animate-ping" />
            <span>TOTAL LATENCY: <strong className="text-white text-base">1.06s</strong></span>
          </div>
        </div>

        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-[40px] left-[12.5%] right-[12.5%] h-px bg-white/10 -z-10" />
          <motion.div 
            style={{ width: lineHeight }} 
            className="hidden lg:block absolute top-[40px] left-[12.5%] h-px bg-gradient-to-r from-[#0066FF] via-[#00D2FF] to-[#00F298] -z-10 shadow-[0_0_10px_rgba(0,102,255,0.5)]" 
          />
          
          <div className="flex flex-col gap-6 relative pl-6 border-l border-border lg:pl-0 lg:border-l-0 lg:grid lg:grid-cols-4 lg:gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <LazyReveal key={step.number} direction="up" delay={idx * 0.1}>
                  <div className="relative flex flex-col gap-4 group">
                    {/* Mobile Node Dot */}
                    <div className="lg:hidden absolute -left-[29px] top-4 w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#0066FF] transition-colors" />
                    
                    <div className="hidden lg:flex w-[80px] h-[80px] mx-auto bg-surface border border-border rounded-2xl items-center justify-center relative group-hover:border-white/30 transition-colors shadow-xl">
                      <Icon className="size-8 text-white/50 group-hover:text-white transition-colors" />
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                        <span className="text-[#00F298] font-mono text-xs bg-[#00F298]/10 border border-[#00F298]/20 px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                          {step.time}
                        </span>
                      </div>
                    </div>

                    <div className="lg:text-center lg:mt-6 space-y-2">
                      <h3 className="text-lg font-medium text-white tracking-[-0.02em]">
                        <span className="text-[#0066FF] mr-2 font-mono">{step.number}.</span>
                        {step.title.split(' (')[0]}
                      </h3>
                      <div className="lg:hidden mb-2">
                        <span className="text-[#00F298] font-mono text-[10px] bg-[#00F298]/10 border border-[#00F298]/20 px-1.5 py-0.5 rounded">
                          {step.title.match(/\((.*?)\)/)?.[1]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed tracking-[-0.01em]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </LazyReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
export default WorkflowSection;
