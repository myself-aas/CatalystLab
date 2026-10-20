import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { CoverFlowCarousel, auditorsCarouselItems } from '../ui/3-d-coverflow-carousel';
import { PartnerMarquee } from './PartnerMarquee';

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
  const scale = useTransform(scrollY, [0, 420], [1, prefersReducedMotion ? 1 : 0.98]);

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
    <section className="relative overflow-hidden w-full min-h-dvh max-w-none flex flex-col bg-background">
      {/* Visual Contrast and Ambience Scrim */}
      <div
        data-testid="hero-contrast-scrim"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent z-0"
      />

      {/* The one job of this surface: run an audit. Visible to everyone —
          no sr-only duplicate (parity between sighted and AT users). */}
      <div className="relative z-20 w-full max-w-3xl mx-auto px-6 pt-14 pb-8 text-center">
        <h1 className="framer-hero-title drop-shadow text-foreground">
          Deep visibility. Zero overhead. Autonomous edge intelligence.
        </h1>
        <p className="framer-body-text mt-4 max-w-[65ch] mx-auto">
          Inspect Core Web Vitals, OWASP transport security, AI manifests, and edge nodes in real time.
        </p>
        <form onSubmit={handleAudit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="hero-audit-url-input" className="sr-only">Domain URL to audit</label>
          <input
            id="hero-audit-url-input"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://your-domain.com"
            aria-label="Domain URL to audit"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="ds-input min-h-11 flex-1 text-base"
          />
          <button type="submit" className="ds-btn ds-btn-primary min-h-11 shrink-0">
            Run Instant Audit
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-label text-muted-foreground">Presets:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => {
                setUrl(preset.url);
                launchAudit(preset.url);
              }}
              className="rounded-full border border-border bg-muted/40 px-3 min-h-11 font-mono text-data text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Supporting proof: the auditors, as a carousel below the action. */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 w-full flex-1 min-h-[320px] flex items-center justify-center overflow-hidden"
      >
        <CoverFlowCarousel
          items={auditorsCarouselItems}
          autoplay={!prefersReducedMotion}
          autoplayDelay={4000}
        />
      </motion.div>

      {/* Official Partners Horizontal Logo Marquee */}
      <div className="relative z-20 w-full shrink-0 flex flex-col justify-center border-t border-foreground/[0.08] bg-background/60 backdrop-blur-xl overflow-hidden">
        <PartnerMarquee />
      </div>
    </section>
  );
};

export default HeroSection;
