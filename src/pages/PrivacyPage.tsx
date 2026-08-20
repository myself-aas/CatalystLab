import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, LifeBuoy, ArrowRight, Sparkles } from 'lucide-react';
import { PrivacySection } from '../components/legal/PrivacySection';
import { LazyReveal } from '../components/common/LazyAnimate';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#415a77]/25 selection:text-[#0b192c]">
      <SEOHead
        title="Privacy Policy & Data Protection Architecture"
        description="Learn how CatalystLab processes diagnostic URLs, telemetry traces, and developer authentication with strict zero-monetization guarantees and GDPR compliance."
        keywords={['CatalystLab privacy policy', 'GDPR compliance', 'CCPA data security', 'zero telemetry monetization', 'data protection']}
        canonicalUrl="https://www.catalystlab.tech/privacy"
      />

      {/* Dedicated Hero Header */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Legal & Trust' },
                { label: 'Privacy Policy' }
              ]}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-xs font-bold text-[#415a77] uppercase tracking-wider mb-3">
                <Shield className="h-3.5 w-3.5 text-[#415a77]" />
                <span>CatalystLab Privacy Architecture</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b192c] tracking-tight">
                Privacy Policy & Data Security
              </h1>
              <p className="mt-2 text-sm text-[#415a77] max-w-2xl leading-relaxed">
                How CatalystLab handles diagnostic traces, telemetry data, and authenticated Google accounts with strict zero-monetization guarantees and full GDPR/CCPA compliance.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0b192c] px-4 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#152238] transition-all shadow-sm active:scale-98"
              >
                <LifeBuoy className="h-4 w-4 text-sky-300" />
                <span>Contact Privacy Team</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#94a3b8]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <PrivacySection />

        {/* Global Trust Footer Card */}
        <div className="mt-14 rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 text-center text-[#f8fafc] shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#152238] border border-[#415a77]/40 text-sky-300 mb-3 shadow-md">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[#f8fafc]">Questions About Data Protection?</h3>
          <p className="mt-2 text-xs text-[#cbd5e1] max-w-lg mx-auto leading-relaxed">
            Our Data Protection Officer and compliance engineers are available to review custom Data Processing Agreements (DPAs) and answer privacy inquiries.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-extrabold text-[#07111e] hover:bg-sky-400 transition-all shadow-md active:scale-98"
            >
              <LifeBuoy className="h-4 w-4" />
              <span>Contact Compliance Team</span>
            </Link>
            <Link
              to="/security"
              className="inline-flex items-center gap-2 rounded-xl border border-[#415a77]/40 bg-[#152238] px-5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#1f314d] transition-all"
            >
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Security Disclosure</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
export default PrivacyPage;
