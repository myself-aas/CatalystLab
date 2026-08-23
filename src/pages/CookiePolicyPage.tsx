import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ArrowRight, ShieldCheck } from 'lucide-react';
import { CookiePreferenceCenter } from '../components/legal/CookiePreferenceCenter';
import { SEOHead } from '../components/common/SEOHead';

export const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-24 text-black font-mono selection:bg-black selection:text-white">
      <SEOHead
        title="Cookie Policy & Preference Manager"
        description="Configure your cookie preferences and learn about CatalystLab's minimal session telemetry and zero third-party advertising tracking policies."
        keywords={['CatalystLab cookie policy', 'cookie preferences', 'GDPR cookie compliance', 'zero tracking cookies']}
        canonicalUrl="https://www.catalystlab.tech/cookies"
      />

      {/* Dedicated Hero Header */}
      <section className="border-b border-gray-200 bg-gray-100 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-bold text-accent-amber-strong uppercase tracking-wider">
                <Cookie className="h-3.5 w-3.5 text-accent-amber-strong" />
                <span>Transparent Consent Architecture</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black tracking-tight font-sans">
                Cookie Policy &amp; Consent Manager
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed font-sans">
                Full transparency into session tokens, local telemetry storage, and granular client-side controls. We do not use third-party advertising cookies.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 rounded-xl bg-black hover:bg-black-hover border border-brand-periwinkle/30 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-accent-emerald" />
                <span>View Full Privacy Policy</span>
                <ArrowRight className="h-3 w-3 text-gray-500" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <CookiePreferenceCenter />
      </main>
    </div>
  );
};

export default CookiePolicyPage;
