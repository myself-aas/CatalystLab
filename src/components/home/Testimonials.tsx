import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Quote } from 'lucide-react';
import { LinearCard } from '../ui/LinearCard';
import { SectionHeader } from './SectionHeader';

const QUOTES = [
  {
    id: 1,
    body: 'CatalystLab gives us deterministic visibility into global edge latency. We resolved a rolling cache issue across 12 PoPs within five minutes.',
    author: 'Elena Rodriguez',
    role: 'VP of Infrastructure',
    company: 'Finserve',
    initial: 'E',
    accent: '#5E6AD2',
  },
  {
    id: 2,
    body: 'The OWASP engine runs in under two seconds. It replaced our pre-flight security gate entirely.',
    author: 'Marcus Chen',
    role: 'Lead Platform Engineer',
    company: 'DataMesh',
    initial: 'M',
    accent: '#F43F5E',
  },
  {
    id: 3,
    body: 'We consolidated four synthetic monitors into this surface. The Core Web Vitals depth is the best we have tested.',
    author: "David O'Connor",
    role: 'Chief Technology Officer',
    company: 'RetailEdge',
    initial: 'D',
    accent: '#34D399',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] py-16 md:py-24 lg:py-32">
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <SectionHeader
          eyebrow={
            <>
              <MessageSquare className="size-3.5 text-[#5E6AD2]" />
              <span>Field validation</span>
            </>
          }
          title="Validated by engineering leaders."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {QUOTES.map((quote, i) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <LinearCard className="flex min-h-[280px] flex-col justify-between p-8">
                <Quote className="absolute right-6 top-6 size-10 text-white/5" />
                <p className="relative text-sm leading-relaxed text-[#8A8F98] sm:text-base">
                  &ldquo;{quote.body}&rdquo;
                </p>
                <div className="relative mt-8 flex items-center gap-3.5 border-t border-white/[0.06] pt-5">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border font-mono text-sm font-bold"
                    style={{
                      backgroundColor: `${quote.accent}15`,
                      borderColor: `${quote.accent}30`,
                      color: quote.accent,
                    }}
                  >
                    {quote.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-tight text-[#EDEDEF]">{quote.author}</p>
                    <p className="mt-0.5 font-mono text-xs text-[#8A8F98]">
                      {quote.role}, {quote.company}
                    </p>
                  </div>
                </div>
              </LinearCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
