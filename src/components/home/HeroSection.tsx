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
    <section className="relative overflow-hidden pt-6 pb-10 sm:pt-10 sm:pb-16">
      <div
        data-testid="hero-contrast-scrim"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#e8f0fe] via-transparent to-white dark:from-[#174ea6]/40 dark:to-[#202124]"
      />

      <motion.div style={{ opacity, scale, y }} className="relative z-10">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <Link
            to="/docs"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#dadce0] bg-white px-3.5 py-1 text-xs font-medium text-[#5f6368] transition-colors duration-200 hover:border-[#1a73e8]/40 hover:text-[#1a73e8] dark:border-white/10 dark:bg-white/5 dark:text-[#9aa0a6]"
          >
            <span className="size-1.5 rounded-full bg-[#1a73e8]" />
            <span>Engine Matrix 2.4 released</span>
            <ChevronRight className="size-3.5" />
          </Link>

          <h1 className="mb-6 text-4xl font-normal tracking-[-0.03em] text-[#202124] drop-shadow-sm sm:text-5xl lg:text-6xl dark:text-[#e8eaed]">
            Autonomous telemetry
            <br className="hidden sm:inline" /> for production domains
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base font-normal leading-relaxed text-[#5f6368] sm:text-lg dark:text-[#9aa0a6]">
            Eight diagnostic engines. Forty-two edge PoPs. A composite dossier in under two seconds — no SDK, no agent, no guesswork.
          </p>

          <form
            onSubmit={handleAudit}
            className="mx-auto flex max-w-2xl flex-col gap-2 rounded-full border border-[#dadce0] bg-white p-1.5 shadow-[0_1px_2px_rgba(60,64,67,0.15)] transition-all duration-300 focus-within:border-[#1a73e8] focus-within:ring-1 focus-within:ring-[#1a73e8] sm:flex-row dark:border-white/15 dark:bg-[#303134]"
          >
            <div className="flex flex-1 items-center px-4 py-2">
              <Zap className="mr-3 size-4 shrink-0 text-[#5f6368]" />
              <input
                id="hero-audit-url-input"
                type="url"
                placeholder="https://your-domain.com"
                required
                aria-label="Domain URL to audit"
                className="w-full border-none bg-transparent text-sm font-normal text-[#202124] placeholder:text-[#80868b] focus:outline-none sm:text-base dark:text-[#e8eaed]"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="group/cta relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#1a73e8] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#1967d2] active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full" />
              <span>Run Master Audit</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            <span className="font-mono uppercase tracking-widest">Presets:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  setUrl(preset.url);
                  launchAudit(preset.url);
                }}
                className="rounded-full border border-[#dadce0] bg-[#f8f9fa] px-2.5 py-1 font-mono text-[11px] text-[#5f6368] transition-colors duration-200 hover:border-[#1a73e8] hover:text-[#1a73e8] dark:border-white/15 dark:bg-white/5 dark:text-[#9aa0a6]"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[#1a73e8]" />
              Zero agent installation
            </span>
            <span className="hidden size-1 rounded-full bg-white/20 sm:inline-block" />
            <span>8 diagnostic engines</span>
            <span className="hidden size-1 rounded-full bg-white/20 sm:inline-block" />
            <span>Sub-second latency</span>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl px-4 sm:mt-16 sm:px-6">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5E6AD2]/20 blur-[120px]" />
          <HeroAuditMock />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
