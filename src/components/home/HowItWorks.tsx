import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Bot, Cpu, FileCheck, Network } from 'lucide-react';
import { LinearCard } from '../ui/LinearCard';
import { SectionHeader } from './SectionHeader';

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    n: '01',
    icon: Network,
    title: 'Ingest & resolve',
    time: '140ms',
    body: 'Anycast DNS across 42 PoPs. TLS 1.3 0-RTT, ALPN, HTTP/3 viability — before a single engine fires.',
  },
  {
    n: '02',
    icon: Cpu,
    title: 'Eight engines, parallel',
    time: '420ms',
    body: 'Vitals, OWASP headers, carbon, repo hygiene, edge TTFB, and more execute on one synchronous bus.',
  },
  {
    n: '03',
    icon: Bot,
    title: 'AI discoverability',
    time: '310ms',
    body: 'Parse /llms.txt, crawler policy, and Schema.org so RAG systems can cite you without hallucinating structure.',
  },
  {
    n: '04',
    icon: FileCheck,
    title: 'Dossier & patches',
    time: '190ms',
    body: 'Composite score plus production-ready NGINX, Workers, and Next.js remediations — not a PDF graveyard.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="workflow-section"
      className="relative overflow-hidden border-t border-border py-16 md:py-24 lg:py-32"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <SectionHeader
          eyebrow={
            <>
              <Network className="size-3.5 text-primary" />
              <span>Synchronous pipeline</span>
            </>
          }
          title="Four gates. 1.06s P95."
          description="From edge resolution to a shareable remediation dossier — no queue, no waterfall, no waiting on a vendor dashboard."
          action={
            <Link
              to="/methodology"
              id="workflow-view-methodology-link"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:border-white/10 hover:bg-muted/80"
            >
              Methodology
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.n}
                id={`workflow-step-${step.n}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
              >
                <LinearCard className="flex h-full min-h-[260px] flex-col p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-muted/40 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{step.time}</span>
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-primary">Gate {step.n}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{step.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </LinearCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { HowItWorks as WorkflowSection };
export default HowItWorks;
