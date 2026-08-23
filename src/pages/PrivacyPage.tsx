import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, LifeBuoy, ArrowRight } from 'lucide-react';
import { PrivacySection } from '../components/legal/PrivacySection';
import { SEOHead } from '../components/common/SEOHead';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-24 text-black font-mono selection:bg-black selection:text-white">
      <SEOHead
        title="Privacy Policy & Data Protection Architecture"
        description="Learn how CatalystLab processes diagnostic URLs, telemetry traces, and developer authentication with strict zero-monetization guarantees and GDPR compliance."
        keywords={['CatalystLab privacy policy', 'GDPR compliance', 'CCPA data security', 'zero telemetry monetization', 'data protection']}
        canonicalUrl="https://www.catalystlab.tech/privacy"
      />

      {/* Dedicated Hero Header */}
      <section className="border-b border-gray-200 bg-gray-100 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-bold text-accent-cyan uppercase tracking-wider">
                <Shield className="h-3.5 w-3.5 text-accent-cyan" />
                <span>CatalystLab Privacy Architecture</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black tracking-tight font-sans">
                Privacy Policy &amp; Data Security
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed font-sans">
                How CatalystLab handles diagnostic traces, telemetry data, and authenticated Google accounts with strict zero-monetization guarantees and full GDPR/CCPA compliance.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-black hover:bg-black-hover border border-brand-periwinkle/30 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-sm"
              >
                <LifeBuoy className="h-3.5 w-3.5 text-accent-cyan" />
                <span>Contact Privacy Team</span>
                <ArrowRight className="h-3 w-3 text-gray-500" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <PrivacySection />

        {/* Global Trust Footer Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-black shadow-xl space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-accent-cyan shadow-sm">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-black font-sans">Questions About Data Protection?</h3>
          <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed font-sans">
            Our Data Protection Officer and compliance engineers are available to review custom Data Processing Agreements (DPAs) and answer privacy inquiries.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-black hover:bg-black-hover border border-brand-periwinkle/30 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm"
            >
              <LifeBuoy className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Contact Compliance Team</span>
            </Link>
            <Link
              to="/security"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-bold text-black hover:bg-gray-50 transition-all"
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
