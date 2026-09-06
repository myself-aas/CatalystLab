import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, ArrowUpRight, Cpu, Globe, Shield, Zap } from 'lucide-react';
import EdgeMeshGlobe from '../ui/edge-mesh-globe';
import { LinearCard } from '../ui/LinearCard';
import { SectionHeader } from './SectionHeader';

const EASE = [0.16, 1, 0.3, 1] as const;

export const FeaturedAuditMetrics: React.FC = () => {
  return (
    <section id="metrics" className="relative overflow-hidden border-t border-border py-16 md:py-24 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <SectionHeader
          eyebrow={
            <>
              <Cpu className="size-3.5 text-primary" />
              <span>Full-spectrum diagnostics</span>
            </>
          }
          title="Deep visibility. Zero overhead."
          description="Autonomous engines inspect vitals, transport security, AI manifests, and the edge mesh — without an SDK or a line of instrumentation."
          action={
            <div className="hidden items-center gap-3 font-mono text-xs text-muted-foreground lg:flex">
              <span className="size-2 rounded-full bg-primary shadow-linear-cta" />
              <span>Telemetry pipeline · 42 nodes</span>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[minmax(200px,auto)]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="md:col-span-4 md:row-span-2"
          >
            <LinearCard className="flex h-full min-h-[320px] flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary">
                    <Zap className="size-5" />
                  </div>
                  <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Zyme engine
                  </span>
                </div>
                <h3 className="framer-card-title text-foreground sm:text-2xl">
                  Core Web Vitals &amp; DOM depth
                </h3>
                <p className="mt-3 max-w-[52ch] framer-body-text">
                  Measure LCP, INP, and CLS to the millisecond. Isolate render-blocking assets, nested DOM branches, and critical-path CSS without a RUM snippet.
                </p>
              </div>
              <div className="mt-10 flex items-end justify-between border-t border-border pt-5">
                <div>
                  <p className="font-mono text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">99.9%</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">Diagnostic precision</p>
                </div>
                <Link
                  to="/health"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Open VitalZyme
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </LinearCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
            className="md:col-span-2"
          >
            <LinearCard className="flex h-full min-h-[200px] flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-300">
                  <Shield className="size-4" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Sec-protease</span>
              </div>
              <div>
                <h3 className="framer-card-title text-foreground">OWASP transport</h3>
                <p className="mt-2 framer-body-text">HSTS, CSP nonces, TLS 1.3 — audited in-flight.</p>
                <p className="mt-4 font-mono text-2xl font-semibold text-foreground">14+</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Attack vectors</p>
              </div>
            </LinearCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
            className="md:col-span-2"
          >
            <LinearCard className="flex h-full min-h-[200px] flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300">
                  <Activity className="size-4" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">LLM-kinase</span>
              </div>
              <div>
                <h3 className="framer-card-title text-foreground">AI discoverability</h3>
                <p className="mt-2 framer-body-text">/llms.txt, robots, Schema.org — RAG-ready structure.</p>
                <p className="mt-4 font-mono text-2xl font-semibold text-foreground">&lt; 50ms</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Scan latency</p>
              </div>
            </LinearCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            className="md:col-span-6"
          >
            <LinearCard className="relative min-h-[220px] overflow-hidden p-6 sm:p-8">
              <div className="relative z-10 max-w-xl">
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                  <Globe className="size-5" />
                </div>
                <h3 className="framer-card-title text-foreground sm:text-2xl">
                  Global anycast edge mesh
                </h3>
                <p className="mt-3 max-w-[48ch] framer-body-text">
                  Ping from 42 PoPs at once. Map TTFB variance, 0-RTT resumption, and CDN cache hit rates on a single radar.
                </p>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-semibold text-foreground">42</span>
                  <span className="font-mono text-xs text-muted-foreground">Active edge PoPs</span>
                </div>
              </div>
              <div className="pointer-events-none absolute right-[-40px] bottom-[-48px] h-56 w-56 opacity-40 sm:right-4 sm:bottom-[-24px] sm:opacity-70">
                <EdgeMeshGlobe
                  variant="thumb"
                  autoSpin
                  interactive={false}
                  showChips={false}
                  showControls={false}
                  showInspector={false}
                />
              </div>
            </LinearCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAuditMetrics;
