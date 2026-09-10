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
    color: '#F0FAFF',
    time: '120ms',
  },
  {
    number: '02',
    title: 'Eight Engines Parallel (120ms - 640ms)',
    description: 'Asynchronous bytecode and DOM tree telemetry.',
    icon: Cpu,
    color: '#F0FAFF',
    time: '520ms',
  },
  {
    number: '03',
    title: 'AI Discoverability (640ms - 880ms)',
    description: 'LLM crawlability, robots.txt, and semantic schema check.',
    icon: Bot,
    color: '#F0FAFF',
    time: '240ms',
  },
  {
    number: '04',
    title: 'Dossier & Automated Patches (880ms - 1060ms)',
    description: 'One-click PR branch generation with verified patch diffs.',
    icon: FileCheck,
    color: '#F0FAFF',
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
      className="ds-section relative bg-background text-foreground border-b border-border overflow-hidden"
    >
      <div className="ds-page-shell">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <LazyReveal direction="up">
            <h2 className="framer-section-headline text-foreground">
              Four Gates. 1.06s P95.
            </h2>
            <p className="mt-4 max-w-2xl framer-body-text">
              From global edge DNS resolution to instant zero-latency remediation patches in under 1,060ms total execution time.
            </p>
          </LazyReveal>
          <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground bg-background border border-border p-3 rounded-xl shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F0FAFF] animate-ping" />
            <span>TOTAL LATENCY: <strong className="text-foreground text-base">1.06s</strong></span>
          </div>
        </div>

        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-[40px] left-[12.5%] right-[12.5%] h-px bg-foreground/10 -z-10" />
          <motion.div 
            style={{ width: lineHeight }} 
            className="hidden lg:block absolute top-[40px] left-[12.5%] h-px bg-gradient-to-r from-[#F0FAFF] via-[#F0FAFF] to-[#F0FAFF] -z-10 shadow-[0_0_10px_rgba(240,250,255,0.25)]" 
          />
          
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-4 lg:gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <LazyReveal key={step.number} direction="up" delay={idx * 0.1}>
                  <div className="relative flex items-start gap-4 lg:flex-col lg:items-center group">
                    {/* Mobile Timeline Track Indicator */}
                    <div className="flex flex-col items-center shrink-0 lg:hidden pt-2">
                      <div className="w-2 h-2 rounded-full bg-foreground/20 group-hover:bg-[#F0FAFF] transition-colors" />
                      {idx < steps.length - 1 && <div className="w-px flex-1 min-h-[50px] bg-border my-2" />}
                    </div>
                    
                    <div className="hidden lg:flex w-[80px] h-[80px] mx-auto bg-surface border border-border rounded-2xl items-center justify-center relative group-hover:border-foreground/30 transition-colors shadow-xl">
                      <Icon className="size-8 text-foreground/50 group-hover:text-foreground transition-colors" />
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                        <span className="text-[#F0FAFF] font-mono text-xs bg-[#F0FAFF]/10 border border-[#F0FAFF]/20 px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                          {step.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 lg:text-center lg:mt-6 space-y-2">
                      <h3 className="framer-card-title text-foreground">
                        <span className="text-[#F0FAFF] mr-2 font-mono">{step.number}.</span>
                        {step.title.split(' (')[0]}
                      </h3>
                      <div className="lg:hidden mb-2">
                        <span className="text-[#F0FAFF] font-mono text-[10px] bg-[#F0FAFF]/10 border border-[#F0FAFF]/20 px-1.5 py-0.5 rounded">
                          {step.title.match(/\((.*?)\)/)?.[1]}
                        </span>
                      </div>
                      <p className="framer-body-text">
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
