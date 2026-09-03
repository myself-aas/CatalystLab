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
      className="relative overflow-hidden border-t border-white/[0.06] py-16 md:py-24 lg:py-32"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <SectionHeader
          eyebrow={
            <>
              <Network className="size-3.5 text-[#5E6AD2]" />
              <span>Synchronous pipeline</span>
            </>
          }
          title="Four gates. 1.06s P95."
          description="From edge resolution to a shareable remediation dossier — no queue, no waterfall, no waiting on a vendor dashboard."
          action={
            <Link
              to="/methodology"
              id="workflow-view-methodology-link"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-[#EDEDEF] transition-all duration-200 hover:border-white/10 hover:bg-white/[0.08]"
            >
              Methodology
              <ArrowRight className="size-4 text-[#8A8F98]" />
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
                    <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#5E6AD2]">
                      <Icon className="size-4" />
                    </div>
                    <span className="font-mono text-xs text-[#8A8F98]">{step.time}</span>
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-[#6872D9]">Gate {step.n}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#EDEDEF]">{step.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#8A8F98]">{step.body}</p>
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
