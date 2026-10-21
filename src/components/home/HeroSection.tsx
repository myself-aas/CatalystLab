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
    <section className="relative w-full min-h-[80vh] flex flex-col justify-center items-start text-left bg-background pt-32 pb-24 px-6 md:px-12">
      <div className="relative z-20 w-full max-w-2xl">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="framer-hero-title text-foreground tracking-[-0.03em] leading-[1.1] mb-6"
        >
          Meet the all-new Catalyst Telemetry
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="framer-section-headline text-muted-foreground mb-10"
        >
          More engines. More dimensions. More edge intelligence.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-row items-center gap-4 mb-16"
        >
          <button 
            onClick={() => {
              const element = document.getElementById('audit-form');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="ds-btn ds-btn-primary px-8 py-3 text-base rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Audit Now
          </button>
          <button 
            onClick={() => navigate('/engines')}
            className="ds-btn ds-btn-secondary px-8 py-3 text-base rounded-full bg-white/5 hover:bg-white/10 transition-all"
          >
            Explore engines
          </button>
        </motion.div>
      </div>

      {/* Audit Form Section (Integrated into the hero flow) */}
      <div id="audit-form" className="w-full max-w-2xl">
        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3 p-2 bg-muted/30 rounded-full border border-border shadow-inner">
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
            className="flex-1 bg-transparent border-none focus:ring-0 text-base px-4 min-h-[44px]"
          />
          <button type="submit" className="ds-btn ds-btn-primary rounded-full min-h-[44px] px-6">
            Run Instant Audit
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
