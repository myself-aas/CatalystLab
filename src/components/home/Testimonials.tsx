import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Quote } from 'lucide-react';

const QUOTES = [
  {
    id: 1,
    body: "CatalystLab gives us deterministic visibility into our global edge latency. We resolved a rolling caching issue across 12 PoPs within five minutes of inspection.",
    author: "Elena Rodriguez",
    role: "VP of Infrastructure",
    company: "Finserve",
    initial: "E",
    accent: "#06B6D4",
  },
  {
    id: 2,
    body: "The OWASP vulnerability engine runs in under two seconds. It has completely transformed our automated pre-flight deployment safety gates.",
    author: "Marcus Chen",
    role: "Lead Platform Engineer",
    company: "DataMesh",
    initial: "M",
    accent: "#F43F5E",
  },
  {
    id: 3,
    body: "We consolidated four separate synthetic monitoring tools into this single surface. The Core Web Vitals diagnostic depth is the best we've tested.",
    author: "David O'Connor",
    role: "Chief Technology Officer",
    company: "RetailEdge",
    initial: "D",
    accent: "#34D399",
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-primary border-t border-white/6 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        <div className="mb-12 md:mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-primary/60 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
            <MessageSquare className="size-3.5 text-cyan-400" />
            <span>Field Validation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-primary-foreground tracking-tight leading-tight">
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
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-8 rounded-[1.75rem] bg-foreground/70 border border-white/8 hover:bg-primary/60 hover:border-white/20 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.4)] min-h-[280px]"
            >
              {/* Subtle Quote Mark */}
              <div className="absolute top-6 right-6 text-primary-foreground/5 group-hover:text-primary-foreground/10 transition-colors pointer-events-none">
                <Quote className="size-10" />
              </div>

              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base relative z-10 font-normal">
                "{quote.body}"
              </p>
              
              <div className="mt-8 pt-5 border-t border-white/6 flex items-center gap-3.5 relative z-10">
                <div 
                  style={{ backgroundColor: `${quote.accent}15`, borderColor: `${quote.accent}30`, color: quote.accent }}
                  className="size-10 rounded-xl border flex-shrink-0 flex items-center justify-center font-mono font-bold text-sm shadow-sm"
                >
                  {quote.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground tracking-tight">{quote.author}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{quote.role}, {quote.company}</p>
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

