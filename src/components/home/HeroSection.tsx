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
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background dark:from-primary/20 dark:to-background"
      />

      <motion.div style={{ opacity, scale, y }} className="relative z-10 ds-page-shell">
        <div className="text-center">
          <Link
            to="/docs"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium ds-muted transition-colors duration-200 hover:border-primary/40 hover:text-primary"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Engine Matrix 2.4 released</span>
            <ChevronRight className="size-3.5" />
          </Link>

          <h1 className="mb-6 text-4xl font-normal tracking-[-0.03em] text-foreground drop-shadow-sm sm:text-5xl lg:text-6xl">
            Autonomous telemetry
            <br className="hidden sm:inline" /> for production domains
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base font-normal leading-relaxed ds-muted sm:text-lg">
            Eight diagnostic engines. Forty-two edge PoPs. A composite dossier in under two seconds — no SDK, no agent, no guesswork.
          </p>

          <form
            onSubmit={handleAudit}
            className="mx-auto flex max-w-2xl flex-col gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-sm transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary sm:flex-row"
          >
            <div className="flex flex-1 items-center px-4 py-2">
              <Zap className="mr-3 size-4 shrink-0 ds-muted" />
              <input
                id="hero-audit-url-input"
                type="url"
                placeholder="https://your-domain.com"
                required
                aria-label="Domain URL to audit"
                className="w-full border-none bg-transparent text-sm font-normal text-foreground placeholder:ds-muted focus:outline-none sm:text-base"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="group/cta relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-linear-cta transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full" />
              <span>Run Master Audit</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs ds-muted">
            <span className="font-mono uppercase tracking-widest">Presets:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  setUrl(preset.url);
                  launchAudit(preset.url);
                }}
                className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-[11px] ds-muted transition-colors duration-200 hover:border-primary hover:text-primary"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs ds-muted">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              Zero agent installation
            </span>
            <span className="hidden size-1 rounded-full bg-border sm:inline-block" />
            <span>8 diagnostic engines</span>
            <span className="hidden size-1 rounded-full bg-border sm:inline-block" />
            <span>Sub-second latency</span>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl px-4 sm:mt-16 sm:px-6">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <HeroAuditMock />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
