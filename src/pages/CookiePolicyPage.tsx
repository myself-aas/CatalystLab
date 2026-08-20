import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Sliders, LifeBuoy, ArrowRight, ShieldCheck } from 'lucide-react';
import { CookiePreferenceCenter } from '../components/legal/CookiePreferenceCenter';
import { LazyReveal } from '../components/common/LazyAnimate';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#415a77]/25 selection:text-[#0b192c]">
      <SEOHead
        title="Cookie Policy & Preference Manager"
        description="Configure your cookie preferences and learn about CatalystLab's minimal session telemetry and zero third-party advertising tracking policies."
        keywords={['CatalystLab cookie policy', 'cookie preferences', 'GDPR cookie compliance', 'zero tracking cookies']}
        canonicalUrl="https://www.catalystlab.tech/cookies"
      />

      {/* Dedicated Hero Header */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Legal & Trust' },
                { label: 'Cookie Policy' }
              ]}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-xs font-bold text-[#415a77] uppercase tracking-wider mb-3">
                <Cookie className="h-3.5 w-3.5 text-[#415a77]" />
                <span>Transparent Consent Architecture</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b192c] tracking-tight">
                Cookie Policy & Consent Manager
              </h1>
              <p className="mt-2 text-sm text-[#415a77] max-w-2xl leading-relaxed">
                Full transparency into session tokens, local telemetry storage, and granular client-side controls. We do not use third-party advertising cookies.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0b192c] px-4 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#152238] transition-all shadow-sm active:scale-98"
              >
                <ShieldCheck className="h-4 w-4 text-sky-300" />
                <span>View Full Privacy Policy</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#94a3b8]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <CookiePreferenceCenter />
      </main>
    </div>
  );
};
export default CookiePolicyPage;
