import React, { useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { SocialProof } from '../components/home/SocialProof';
import { FeaturedAuditMetrics } from '../components/home/FeaturedAuditMetrics';
import { HowItWorks } from '../components/home/HowItWorks';
import { ArchitectureComparator } from '../components/home/ArchitectureComparator';
import { FaqAccordion } from '../components/home/FaqAccordion';
import { FinalCTA } from '../components/home/FinalCTA';
import { openGetInTouchModal } from '../components/common/GetInTouchEmailModal';

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
    <div className="min-h-screen bg-brand-navy text-white font-sans">
      <HeroSection />
      <SocialProof />
      <FeaturedAuditMetrics />
      <HowItWorks />
      <ArchitectureComparator />
      <FaqAccordion />
      <FinalCTA />
    </div>
  );
};

export default MasterAuditPage;
