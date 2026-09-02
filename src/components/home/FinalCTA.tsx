import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Terminal, Sparkles, Shield, Zap } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      navigate(`/audit?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <section className="py-20 md:py-32 bg-primary border-t border-white/6 flex items-center justify-center text-center relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-950/40 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-cyan-400 mb-4">
            <Sparkles className="size-3.5" />
            <span>Zero SDK Overhead</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground tracking-tight leading-[1.1]">
            Ready to analyze your domain?
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Execute 8 synchronous diagnostic engines across 42 global edge PoPs in under two seconds.
          </p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 md:mt-10 w-full max-w-lg relative"
        >
          <div className="relative flex items-center p-1.5 rounded-2xl bg-foreground/90 border border-white/15 focus-within:border-cyan-400/80 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <div className="pl-3.5 pr-2 text-cyan-400">
              <Terminal className="size-4" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-domain.com"
              required
              className="w-full bg-transparent border-none text-primary-foreground placeholder-slate-500 focus:outline-none focus:ring-0 text-sm py-2.5 font-mono"
            />
            <button 
              type="submit"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-background text-foreground text-xs font-mono font-bold rounded-xl hover:bg-cyan-50 transition-all active:scale-95 shadow-md"
            >
              <span>Audit Now</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </motion.form>

        {/* Feature Highlights under CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Zap className="size-3.5 text-cyan-400" />
            <span>Sub-2s Execution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="size-3.5 text-rose-400" />
            <span>OWASP Top 10 Scanned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-emerald-400" />
            <span>Auto Patch Generation</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-16 md:mt-24 pt-8 w-full border-t border-white/6 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <p>&copy; 2026 CatalystLab. Autonomous SDLC Diagnostics & Remediation.</p>
          <div className="flex items-center gap-6">
            <a href="/audit" className="hover:text-muted-foreground transition-colors">Audit Console</a>
            <a href="/products" className="hover:text-muted-foreground transition-colors">Catalog</a>
            <a href="/methodology" className="hover:text-muted-foreground transition-colors">Methodology</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;

