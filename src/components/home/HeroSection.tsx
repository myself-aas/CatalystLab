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
    <section className="relative overflow-hidden w-full h-screen min-h-screen min-h-dvh max-h-screen max-w-none flex flex-col justify-between items-center select-none bg-background">
      {/* Visual Contrast and Ambience Scrim */}
      <div
        data-testid="hero-contrast-scrim"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent z-0"
      />

      {/* Accessible container for screen readers, navigation aids, and test contracts */}
      <div className="sr-only">
        <h1 className="drop-shadow">Deep visibility. Zero overhead. Autonomous edge intelligence.</h1>
        <p>Inspect Core Web Vitals, OWASP transport security, AI manifests, and edge nodes in real time.</p>
        <form onSubmit={handleAudit}>
          <input
            id="hero-audit-url-input"
            type="url"
            placeholder="https://your-domain.com"
            aria-label="Domain URL to audit"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit">Run Instant Audit</button>
        </form>
        <div>
          <span>Presets:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => {
                setUrl(preset.url);
                launchAudit(preset.url);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Viewport Upper 2.5/3 (83.333%): 3D Coverflow Carousel Cards */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 w-full h-[calc(100dvh*2.5/3)] min-h-0 flex items-center justify-center overflow-hidden"
      >
        <CoverFlowCarousel
          items={auditorsCarouselItems}
          autoplay={true}
          autoplayDelay={4000}
        />
      </motion.div>

      {/* Viewport Lower 0.5/3 (16.667%): Official Partners Horizontal Logo Marquee */}
      <div className="relative z-20 w-full h-[calc(100dvh*0.5/3)] min-h-0 flex flex-col justify-center border-t border-foreground/[0.08] bg-background/60 backdrop-blur-xl overflow-hidden">
        <PartnerMarquee />
      </div>
    </section>
  );
};

export default HeroSection;


