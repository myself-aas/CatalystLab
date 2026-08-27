import React, { useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { SocialProof } from '../components/home/SocialProof';
import { FeaturedAuditMetrics } from '../components/home/FeaturedAuditMetrics';
import { EngineExplorer } from '../components/home/EngineExplorer';
import { HowItWorks } from '../components/home/HowItWorks';
import { ArchitectureComparator } from '../components/home/ArchitectureComparator';
import { MeshNetworkSection } from '../components/home/MeshNetworkSection';
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
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white">
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
