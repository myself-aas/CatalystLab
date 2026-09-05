import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Quote, BadgeCheck } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { onSpotlightMouseMove } from '../../hooks/useSpotlight';

const QUOTES = [
  {
    id: 1,
    body: 'CatalystLab gives us deterministic visibility into global edge latency. We resolved a rolling cache issue across 12 PoPs within five minutes.',
    author: 'Elena Rodriguez',
    role: 'VP of Infrastructure',
    company: 'Finserve',
    avatar: 'https://i.pravatar.cc/150?u=elena',
  },
  {
    id: 2,
    body: 'Cut P95 edge latency by 42% and automated our OWASP compliance checks. It replaced our pre-flight security gate entirely.',
    author: 'Marcus Chen',
    role: 'Lead Platform Engineer',
    company: 'DataMesh',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
  },
  {
    id: 3,
    body: 'We consolidated four synthetic monitors into this surface. The Core Web Vitals depth is the best we have tested.',
    author: "David O'Connor",
    role: 'Chief Technology Officer',
    company: 'RetailEdge',
    avatar: 'https://i.pravatar.cc/150?u=david',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <SectionHeader
          eyebrow={
            <>
              <MessageSquare className="size-3.5 text-[#0066FF]" />
              <span>Field validation</span>
            </>
          }
          title="Validated by engineering leaders."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUOTES.map((quote, i) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onMouseMove={onSpotlightMouseMove}
              className="bg-surface border border-white/10 rounded-2xl md:rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative group hover:-translate-y-[2px] hover:border-white/25 transition-[transform,border-color] duration-200 ease-out"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'var(--glow-card-subsurface)' }}
              />
              <Quote className="absolute right-6 top-6 size-10 text-white/5" />
              <p className="relative text-base leading-relaxed text-muted-foreground sm:text-lg mb-8">
                &ldquo;{quote.body}&rdquo;
              </p>
              
              <div className="relative mt-auto flex items-center gap-4 border-t border-white/10 pt-5">
                <img
                  src={quote.avatar}
                  alt={quote.author}
                  className="size-12 rounded-full border border-white/10 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                    {quote.author}
                    <BadgeCheck className="size-4 text-[#0066FF]" />
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {quote.role} · {quote.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
