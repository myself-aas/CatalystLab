import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section id="get-started" className="ds-section relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[120px]" style={{ background: 'var(--glow-radial-hero)' }} />

      <div className="relative z-10 ds-page-shell flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F0FAFF]/20 bg-[#F0FAFF]/10 px-3 py-1 framer-micro-tag text-[#F0FAFF] backdrop-blur-md">
            <Sparkles className="size-3.5 text-[#F0FAFF]" />
            <span>Zero SDK overhead</span>
          </div>
          <h2 className="framer-section-headline text-foreground">
            Ready to analyze your domain?
          </h2>
          <p className="mx-auto mt-6 max-w-xl framer-body-text">
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
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm sm:text-base font-semibold text-background transition-all hover:bg-neutral-200"
          >
            <span>Run a Master Audit</span>
            <ArrowRight className="size-4" />
          </button>
          <Link
            to="/contact"
            className="flex h-12 items-center justify-center rounded-full border border-foreground/20 bg-surface px-6 text-sm sm:text-base font-medium text-foreground transition-all hover:bg-foreground/10"
          >
            Contact Sales
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
