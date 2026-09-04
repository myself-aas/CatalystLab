import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight, Layers } from 'lucide-react';
import { SDLC_CATALYSTS_LIST } from '../../data/engines';
import { LinearCard } from '../ui/LinearCard';
import { SectionHeader } from './SectionHeader';

const EASE = [0.16, 1, 0.3, 1] as const;

const SPAN: Record<number, string> = {
  0: 'md:col-span-3 md:row-span-2',
  1: 'md:col-span-3',
  2: 'md:col-span-2',
  3: 'md:col-span-2',
  4: 'md:col-span-2',
  5: 'md:col-span-3',
  6: 'md:col-span-3',
  7: 'md:col-span-6',
};

export const EnzymeGrid: React.FC = () => {
  return (
    <section id="engines" className="relative overflow-hidden border-t border-border py-16 md:py-24 lg:py-32">
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <SectionHeader
          eyebrow={
            <>
              <Layers className="size-3.5 text-primary" />
              <span>Eight autonomous engines</span>
            </>
          }
          title="A lab, not a lighthouse."
          description="Each catalyst maps to a phase of the SDLC — migration, hygiene, carbon, vitals, edge, security, AI readiness, and generative search."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {SDLC_CATALYSTS_LIST.map((engine, i) => (
            <motion.div
              key={engine.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              className={SPAN[i] ?? 'md:col-span-2'}
            >
              <LinearCard className="relative flex h-full min-h-[200px] flex-col justify-between p-6">
                <Link
                  to={engine.route}
                  className="absolute inset-0 z-30 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label={`Open ${engine.catalystName}`}
                />
                <div>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span
                      className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest"
                      style={{
                        color: engine.color,
                        borderColor: `${engine.color}40`,
                        backgroundColor: `${engine.color}14`,
                      }}
                    >
                      {engine.shortCode}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Phase {engine.sdlcPhaseNumber}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">{engine.catalystName}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{engine.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="font-mono uppercase tracking-widest">
                    {(engine.lifecycleFocus ?? engine.sdlcPhase).split(',')[0]}
                  </span>
                  <span className="inline-flex items-center gap-1 text-foreground/80">
                    Open
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </LinearCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnzymeGrid;
