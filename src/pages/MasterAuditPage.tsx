import React, { useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { SocialProof } from '../components/home/SocialProof';
import { FeaturedAuditMetrics } from '../components/home/FeaturedAuditMetrics';
import { ArchitectureComparator } from '../components/home/ArchitectureComparator';
import { Testimonials } from '../components/home/Testimonials';
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
    <div className="min-h-screen bg-primary text-zinc-300 font-sans selection:bg-zinc-800 selection:text-primary-foreground">
      <div>
        <SEOHead
          title="Precision Telemetry & Autonomous Web Health Auditing"
          description="Run immediate multi-dimensional audits on any domain."
          canonicalUrl="https://www.catalystlab.tech/"
        />

        <HeroSection />
        <SocialProof />
        <FeaturedAuditMetrics />
        <ArchitectureComparator />
        <Testimonials />
        <FinalCTA />
      </div>
    </div>
  );
};

export default MasterAuditPage;
