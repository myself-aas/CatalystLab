import React, { useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { SocialProof } from '../components/home/SocialProof';
import { FeaturedAuditMetrics } from '../components/home/FeaturedAuditMetrics';
import { EngineExplorer } from '../components/home/EngineExplorer';
import { HowItWorks } from '../components/home/HowItWorks';
import { ArchitectureComparator } from '../components/home/ArchitectureComparator';
import { SevenDayTrialSection } from '../components/home/SevenDayTrialSection';
import { Testimonials } from '../components/home/Testimonials';
import { LatestBlogsSection } from '../components/home/LatestBlogsSection';
import { FaqAccordion } from '../components/home/FaqAccordion';
import { FinalCTA } from '../components/home/FinalCTA';
import { SEOHead } from '../components/common/SEOHead';
import { ParallaxSection } from '../components/common/ParallaxSection';

export const MasterAuditPage: React.FC = () => {
  useEffect(() => {
    const focusAuditInput = () => {
      const inputEl = document.getElementById('hero-audit-url-input') as HTMLInputElement | null;
      if (inputEl) {
        inputEl.focus({ preventScroll: true });
      }
    };
    focusAuditInput();
    const timer = setTimeout(focusAuditInput, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-amber-500 selection:text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(56,189,248,0.03),transparent_70%)] pointer-events-none" />
      <div className="relative z-10">
        <SEOHead
          title="Precision Telemetry & Autonomous Web Health Auditing — CatalystLab"
          description="Run immediate multi-dimensional audits on any domain. Assess Core Web Vitals, OWASP SecOps headers, AST tree depth, /llms.txt AI search discoverability, and SWD v4 carbon efficiency in under 2 seconds."
          canonicalUrl="https://www.catalystlab.tech/"
        />

        {/* 1. Hero Section: Value Proposition & Interactive Audit Input */}
        <HeroSection />

        {/* Immersive Parallax Showcase Banner */}
        <ParallaxSection
          bgImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80"
          overlayOpacity={0.88}
          height="min-h-[360px]"
          className="my-12 border-y border-zinc-200 dark:border-zinc-800"
        >
          <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-1 text-xs font-mono font-bold uppercase tracking-wider">
              Global Edge Telemetry Parallax
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-sans tracking-tight">
              Synchronous Multi-Region Diagnostics at Light Speed
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-sans max-w-2xl mx-auto">
              Real-time telemetry feeds streaming continuously across 42 global edge points. Zero-latency code analysis, deep AST security checks, and automated compliance auditing.
            </p>
          </div>
        </ParallaxSection>

        {/* 2. Social Proof & Global Telemetry Benchmark Numbers */}
        <SocialProof />

        {/* 3. Featured 8-Engine Deep Metric Radar & Vector Checklist */}
        <FeaturedAuditMetrics />

        {/* 4. Interactive 8 SDLC Catalysts Explorer & Remediation Sandbox */}
        <EngineExplorer />

        {/* 5. 4-Stage Synchronous Pipeline Workflow */}
        <HowItWorks />

        {/* 6. Architectural Parity Benchmark Table */}
        <ArchitectureComparator />

        {/* 7. Pro & Team 7-Day Trial Activation Showcase */}
        <SevenDayTrialSection />

        {/* 8. Verified Engineering Leadership Testimonials */}
        <Testimonials />

        {/* 9. Latest Research Benchmarks & Engineering Articles */}
        <LatestBlogsSection />

        {/* 10. Technical & Architecture FAQ Accordion */}
        <FaqAccordion />

        {/* 11. Final Conversion CTA & Instant Domain Scan */}
        <FinalCTA />
      </div>
    </div>
  );
};

export default MasterAuditPage;
