import React from 'react';
import { Activity, Globe, Shield, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { onSpotlightMouseMove } from '../../hooks/useSpotlight';

const ROWS = [
  { engine: 'VitalZyme', vector: 'LCP · INP · CLS', score: 94, tone: 'ok' as const },
  { engine: 'RiskProtease', vector: 'HSTS · CSP · TLS', score: 88, tone: 'warn' as const },
  { engine: 'EdgeVmax', vector: 'TTFB · 42 PoPs', score: 96, tone: 'ok' as const },
  { engine: 'LLM-Kinase', vector: '/llms.txt · RAG', score: 81, tone: 'warn' as const },
  { engine: 'EcoHolo', vector: 'SWD carbon', score: 90, tone: 'ok' as const },
];

/**
 * Cinematic product surface for the hero — a Linear-style audit console,
 * not a screenshot. Decorative only.
 */
export const HeroAuditMock: React.FC = () => {
  return (
    <motion.div
      aria-hidden="true"
      onMouseMove={onSpotlightMouseMove}
      whileHover={{ scale: 1.008, y: -2 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card/80 shadow-linear-card backdrop-blur-2xl transition-[border-color] duration-200 ease-out hover:border-white/25 cursor-default"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{ background: 'var(--glow-card-subsurface)' }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent z-10" />

      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-rose-500" />
          <span className="size-2.5 rounded-full bg-amber-500" />
          <span className="size-2.5 rounded-full bg-emerald-500" />
        </div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="hidden items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] text-muted-foreground sm:flex cursor-default"
        >
          <span className="size-1.5 rounded-full bg-primary shadow-linear-cta" />
          catalystlab · master-audit · stripe.com
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-[11px] uppercase tracking-widest text-primary cursor-default"
        >
          Composite 92
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="border-b border-border p-5 lg:col-span-7 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Engine matrix
            </p>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
              Live
            </span>
          </div>
          <div className="space-y-2">
            {ROWS.map((row) => (
              <motion.div
                key={row.engine}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/35 hover:border-white/20 px-3 py-2.5 transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{row.engine}</span>
                    <span className="font-mono text-sm tabular-nums text-foreground">{row.score}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${row.score}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[10px] tracking-wide text-muted-foreground">{row.vector}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 lg:col-span-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Activity, label: 'LCP', value: '1.2s' },
              { icon: Shield, label: 'CSP', value: 'strict' },
              { icon: Globe, label: 'TTFB', value: '48ms' },
              { icon: Sparkles, label: 'llms.txt', value: 'found' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-border bg-muted/20 hover:bg-muted/40 hover:border-white/25 p-3 transition-all cursor-pointer shadow-xs"
              >
                <stat.icon className="mb-2 size-3.5 text-primary" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-0.5 font-mono text-lg font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
          <motion.div
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 rounded-xl border border-border bg-background hover:border-white/20 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground transition-all cursor-text"
          >
            <p className="text-primary">$ catalystlab audit stripe.com</p>
            <p className="mt-1">→ resolved 42 anycast PoPs · 11ms</p>
            <p>→ 8 engines parallel · 420ms</p>
            <p>→ dossier synthesized · 190ms</p>
            <p className="mt-2 text-foreground">
              PASS <span className="text-muted-foreground">composite 92 / 100</span>
              <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-primary align-middle terminal-cursor" />
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroAuditMock;
