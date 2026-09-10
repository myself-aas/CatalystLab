import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Bot, Cpu, FileCheck, Network } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    n: '01',
    icon: Network,
    title: 'Ingest & Resolve',
    time: '0ms - 120ms',
    body: 'Multi-region DNS & TLS 1.3 handshake resolution.',
  },
  {
    n: '02',
    icon: Cpu,
    title: 'Eight Engines Parallel',
    time: '120ms - 640ms',
    body: 'Asynchronous bytecode and DOM tree telemetry.',
  },
  {
    n: '03',
    icon: Bot,
    title: 'AI Discoverability',
    time: '640ms - 880ms',
    body: 'LLM crawlability, robots.txt, and semantic schema check.',
  },
  {
    n: '04',
    icon: FileCheck,
    title: 'Dossier & Patches',
    time: '880ms - 1060ms',
    body: 'One-click PR branch generation with verified patch diffs.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="workflow-section"
      className="ds-section relative overflow-hidden"
    >
      <div className="relative z-10 ds-page-shell">
        <SectionHeader
          eyebrow={
            <>
              <Network className="size-3.5 text-[var(--accent-framer-blue)]" />
              <span>Synchronous pipeline</span>
            </>
          }
          title="Four Gates. 1.06s P95."
          description="From edge resolution to a shareable remediation dossier — no queue, no waterfall, no waiting on a vendor dashboard."
        />

        <div className="relative mt-12 md:mt-16">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-[28px] left-8 right-8 h-[2px] bg-foreground/10 z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--accent-framer-blue)]/0 via-[var(--accent-framer-blue)] to-[var(--accent-framer-blue)]/0"
              initial={{ x: '-100%' }}
              whileInView={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            />
          </div>

          <div className="flex flex-col gap-6 md:grid md:grid-cols-4 md:gap-4 z-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.n}
                  id={`workflow-step-${step.n}`}
                  className="relative flex items-start gap-4 md:flex-col md:items-center text-left md:text-center"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                >
                  {/* Mobile Timeline Track Indicator */}
                  <div className="flex flex-col items-center shrink-0 md:hidden pt-1">
                    <div className="size-3 rounded-full bg-[var(--accent-framer-blue)] shadow-[0_0_10px_rgba(0,102,255,0.8)]" />
                    {i < STEPS.length - 1 && <div className="w-px flex-1 min-h-[60px] bg-foreground/10 my-2" />}
                  </div>

                  {/* Desktop Node */}
                  <div className="hidden md:flex mb-6 relative size-14 items-center justify-center rounded-2xl bg-surface border border-foreground/10 text-foreground z-10 shadow-xl transition-[transform,border-color] duration-200 ease-out hover:-translate-y-[2px] hover:border-foreground/25 hover:shadow-[0_0_20px_-4px_rgba(0,102,255,0.4)]">
                    <Icon className="size-6 text-[var(--accent-framer-blue)]" />
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 min-w-0">
                    <div className="md:hidden mb-2 size-8 flex items-center justify-center rounded-lg bg-surface border border-foreground/10 text-foreground shadow-md">
                      <Icon className="size-4 text-[var(--accent-framer-blue)]" />
                    </div>

                    <h3 className="framer-card-title text-foreground">
                      {step.n}. {step.title}
                    </h3>
                    
                    <div className="my-2 md:my-3">
                      <span className="text-emerald-400 font-mono text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block">
                        {step.time}
                      </span>
                    </div>

                    <p className="framer-body-text md:max-w-[260px]">
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export { HowItWorks as WorkflowSection };
export default HowItWorks;
