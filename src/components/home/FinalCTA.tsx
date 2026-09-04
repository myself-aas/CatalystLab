import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section id="get-started" className="relative overflow-hidden border-t border-border py-20 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[140px]" />

      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col items-center px-4 text-center sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-primary backdrop-blur-md">
            <Sparkles className="size-3.5 text-primary" />
            <span>Zero SDK overhead</span>
          </div>
          <h2 className="text-gradient-linear text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Ready to analyze your domain?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Eight engines, 42 PoPs, a composite dossier — in the time it takes to paste a URL.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        >
          <Link
            to="/launch-audit"
            className="relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-6 text-sm font-medium text-white shadow-linear-cta transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
          >
            <span>Run a master audit</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-muted/50 px-6 text-sm font-medium text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-muted/80"
          >
            View plans
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
