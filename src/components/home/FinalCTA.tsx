import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section id="get-started" className="relative overflow-hidden py-20 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[120px]" style={{ background: 'var(--glow-radial-hero)' }} />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.04em] text-[#0066FF] backdrop-blur-md">
            <Sparkles className="size-3.5 text-[#0066FF]" />
            <span>Zero SDK overhead</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] leading-[1.12] font-semibold tracking-[-0.035em] leading-[1.12] text-white">
            Ready to analyze your domain?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground tracking-[-0.01em]">
            Eight engines, 42 PoPs, a composite dossier — in the time it takes to paste a URL.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center"
        >
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const input = document.getElementById('hero-audit-url-input');
                if (input) input.focus();
              }, 800);
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm sm:text-base font-semibold text-black transition-all hover:bg-neutral-200"
          >
            <span>Run a Master Audit</span>
            <ArrowRight className="size-4" />
          </button>
          <Link
            to="/contact"
            className="flex h-12 items-center justify-center rounded-full border border-white/20 bg-surface px-6 text-sm sm:text-base font-medium text-white transition-all hover:bg-white/10"
          >
            Contact Sales
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
