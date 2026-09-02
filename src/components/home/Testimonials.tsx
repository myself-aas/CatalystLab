import React from 'react';
import { motion } from 'motion/react';

const QUOTES = [
  {
    id: 1,
    body: "CatalystLab gives us deterministic visibility into our global edge latency. We resolved a rolling caching issue within five minutes of deployment.",
    author: "Elena Rodriguez",
    role: "VP Engineering",
    company: "Finserve",
  },
  {
    id: 2,
    body: "The OWASP vulnerability scanner runs in under two seconds. It has completely changed our continuous deployment safety checks.",
    author: "Marcus Chen",
    role: "Lead DevOps",
    company: "DataMesh",
  },
  {
    id: 3,
    body: "We replaced three separate observability tools with this single platform. The Core Web Vitals precision is unmatched in the industry.",
    author: "David O'Connor",
    role: "CTO",
    company: "RetailEdge",
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-black border-t border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        
        <div className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">
            Validated by engineering leaders.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUOTES.map((quote, i) => (
            <motion.div 
              key={quote.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-8 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all duration-500 flex flex-col justify-between overflow-hidden"
            >
              {/* Quote mark accent */}
              <div className="absolute top-4 right-6 text-6xl text-zinc-800/50 font-serif opacity-30 group-hover:opacity-100 group-hover:text-zinc-700 transition-all duration-500 rotate-12 group-hover:-rotate-6 pointer-events-none">"</div>

              <p className="text-zinc-400 leading-relaxed text-base relative z-10 group-hover:text-zinc-300 transition-colors duration-500">
                "{quote.body}"
              </p>
              
              <div className="mt-10 pt-6 border-t border-zinc-900/80 flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex-shrink-0 group-hover:border-zinc-500 transition-colors duration-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-400 transition-colors">{quote.author.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors duration-500">{quote.author}</p>
                  <p className="text-sm text-zinc-400 group-hover:text-zinc-400 transition-colors duration-500">{quote.role}, {quote.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
