import React, { useState } from 'react';
import { ArrowRight, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { HeroAuditMock } from './HeroAuditMock';

const PRESETS = [
  { label: 'stripe.com', url: 'https://stripe.com' },
  { label: 'vercel.com', url: 'https://vercel.com' },
  { label: 'github.com', url: 'https://github.com' },
  { label: 'cloudflare.com', url: 'https://cloudflare.com' },
];

export const HeroSection: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 420], [1, prefersReducedMotion ? 1 : 0]);
  const scale = useTransform(scrollY, [0, 420], [1, prefersReducedMotion ? 1 : 0.95]);
  const y = useTransform(scrollY, [0, 420], [0, prefersReducedMotion ? 0 : 80]);

  const launchAudit = (target: string) => {
    const trimmed = target.trim();
    if (!trimmed) return;
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    navigate(`/launch-audit?url=${encodeURIComponent(href)}`);
  };

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    launchAudit(url);
  };

  return (
    <section className="relative overflow-hidden w-full max-w-none min-h-[90vh] flex flex-col justify-center ds-section pt-28 sm:pt-36">
      <div
        data-testid="hero-contrast-scrim"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent"
      />

      <motion.div style={{ opacity, scale, y }} className="relative z-10 ds-page-shell">
        <div className="text-center">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block"
          >
            <Link
              to="/docs"
              className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 transition-colors duration-200 hover:border-emerald-500/40"
            >
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Autonomous Diagnostics · v2.4 Edge Mesh Active</span>
            </Link>
          </motion.div>

          <h1 className="mb-6 text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.05] text-white drop-shadow-sm">
            Deep visibility.<br />
            Zero overhead.<br />
            Autonomous edge intelligence.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed tracking-[-0.01em]">
            Inspect Core Web Vitals, OWASP transport security, AI manifests, and edge nodes in real time — without an SDK or a single line of instrumentation.
          </p>

          <motion.form
            onSubmit={handleAudit}
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto flex max-w-xl flex-col sm:flex-row items-center gap-2 p-1.5 bg-surface border border-white/12 rounded-2xl sm:rounded-full shadow-2xl focus-within:border-[#0066FF] transition-all"
          >
            <div className="flex flex-1 items-center px-4 py-2 w-full">
              <Zap className="mr-3 size-4 shrink-0 text-neutral-500" />
              <input
                id="hero-audit-url-input"
                type="url"
                placeholder="https://your-domain.com"
                required
                aria-label="Domain URL to audit"
                className="w-full border-none bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-mono"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full sm:w-auto bg-[#0066FF] hover:bg-[#0052cc] text-white text-sm font-medium rounded-xl sm:rounded-full px-5 py-2.5 transition-all shadow-[0_0_20px_-3px_rgba(0,102,255,0.5)] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Run Instant Audit</span>
              <ArrowRight className="size-4" />
            </motion.button>
          </motion.form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-widest text-[11px]">Presets:</span>
            {PRESETS.map((preset) => (
              <motion.button
                key={preset.url}
                type="button"
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => {
                  setUrl(preset.url);
                  launchAudit(preset.url);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] transition-colors duration-200 hover:border-white/30 hover:text-white cursor-pointer"
              >
                {preset.label}
              </motion.button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-1.5 cursor-default"
            >
              <ShieldCheck className="size-4 text-[#0066FF]" />
              Zero agent installation
            </motion.span>
            <span className="hidden size-1 rounded-full bg-white/10 sm:inline-block" />
            <motion.span 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="cursor-default"
            >
              8 diagnostic engines
            </motion.span>
            <span className="hidden size-1 rounded-full bg-white/10 sm:inline-block" />
            <motion.span 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="cursor-default"
            >
              Sub-second latency
            </motion.span>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl px-4 sm:mt-16 sm:px-6">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0066FF]/20 blur-[120px]" />
          <HeroAuditMock />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
