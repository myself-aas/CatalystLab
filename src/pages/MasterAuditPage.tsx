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
    <div className="homepage-minimal min-h-screen bg-[#060912] text-slate-100 font-sans selection:bg-[#06B6D4]/30 selection:text-[#00F0FF]">
      <div>
        <SEOHead
          title="Precision Telemetry & Autonomous Web Health Auditing — CatalystLab"
          description="Run immediate multi-dimensional audits on any domain. Assess Core Web Vitals, OWASP SecOps headers, AST tree depth, /llms.txt AI search discoverability, and SWD v4 carbon efficiency in under 2 seconds."
          canonicalUrl="https://www.catalystlab.tech/"
        />

        {/* 1. Hero Section: Value Proposition & Interactive Audit Input */}
        <HeroSection />

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
