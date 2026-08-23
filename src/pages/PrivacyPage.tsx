import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, LifeBuoy, ArrowRight } from 'lucide-react';
import { PrivacySection } from '../components/legal/PrivacySection';
import { SEOHead } from '../components/common/SEOHead';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-navy pb-24 text-brand-offwhite font-mono selection:bg-brand-slate selection:text-white">
      <SEOHead
        title="Privacy Policy & Data Protection Architecture"
        description="Learn how CatalystLab processes diagnostic URLs, telemetry traces, and developer authentication with strict zero-monetization guarantees and GDPR compliance."
        keywords={['CatalystLab privacy policy', 'GDPR compliance', 'CCPA data security', 'zero telemetry monetization', 'data protection']}
        canonicalUrl="https://www.catalystlab.tech/privacy"
      />

      {/* Dedicated Hero Header */}
      <section className="border-b border-brand-slate/30 bg-brand-oxford px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-brand-slate/40 bg-surface-panel px-2.5 py-0.5 text-xs font-bold text-accent-cyan uppercase tracking-wider">
                <Shield className="h-3.5 w-3.5 text-accent-cyan" />
                <span>CatalystLab Privacy Architecture</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-offwhite tracking-tight font-sans">
                Privacy Policy &amp; Data Security
              </h1>
              <p className="text-xs sm:text-sm text-brand-periwinkle max-w-2xl leading-relaxed font-sans">
                How CatalystLab handles diagnostic traces, telemetry data, and authenticated Google accounts with strict zero-monetization guarantees and full GDPR/CCPA compliance.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-sm"
              >
                <LifeBuoy className="h-3.5 w-3.5 text-accent-cyan" />
                <span>Contact Privacy Team</span>
                <ArrowRight className="h-3 w-3 text-brand-slate-light" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <PrivacySection />

        {/* Global Trust Footer Card */}
        <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 text-center text-brand-offwhite shadow-xl space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-oxford border border-brand-slate/40 text-accent-cyan shadow-sm">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-brand-offwhite font-sans">Questions About Data Protection?</h3>
          <p className="text-xs text-brand-periwinkle max-w-lg mx-auto leading-relaxed font-sans">
            Our Data Protection Officer and compliance engineers are available to review custom Data Processing Agreements (DPAs) and answer privacy inquiries.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm"
            >
              <LifeBuoy className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Contact Compliance Team</span>
            </Link>
            <Link
              to="/security"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-slate/40 bg-brand-oxford px-4 py-2 text-xs font-bold text-brand-offwhite hover:bg-surface-subtle transition-all"
            >
              <Shield className="h-3.5 w-3.5 text-accent-emerald" />
              <span>Security Disclosure</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
