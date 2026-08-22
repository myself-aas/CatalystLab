import React from 'react';
import { GlobalFaqSection } from '../common/GlobalFaqSection';
import { MASTER_FAQ_CATEGORIES } from '../../data/faqData';

export const FaqAccordion: React.FC = () => {
  return (
    <GlobalFaqSection 
      categories={MASTER_FAQ_CATEGORIES}
      title="Frequently Asked Questions"
      subtitle="Comprehensive technical answers regarding our 8-engine architecture, CI/CD automation, AI readiness (/llms.txt), 5-tier plans, 7-day free trial, and developer REST APIs."
      contactText="Need custom CI/CD integrations, private VPC deployment, or bespoke diagnostic rules?"
      contactActionText="Speak with Solutions Engineering"
      contactLink="/contact"
      showSearch={true}
    />
  );
};

export default FaqAccordion;
