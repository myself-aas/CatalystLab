import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, LifeBuoy, ArrowRight, Award } from 'lucide-react';
import { TermsSection } from '../components/legal/TermsSection';
import { LazyReveal } from '../components/common/LazyAnimate';
import { SEOHead } from '../components/common/SEOHead';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#415a77]/25 selection:text-[#0b192c]">
      <SEOHead
        title="Terms of Service & Acceptable Use Policy"
        description="Review CatalystLab's Terms of Service, acceptable telemetry usage policies, intellectual property rights, and report licensing terms."
        keywords={['CatalystLab terms of service', 'acceptable use policy', 'telemetry API license', 'developer terms']}
        canonicalUrl="https://www.catalystlab.tech/terms"
      />

      {/* Dedicated Hero Header */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-sm font-bold text-[#415a77] uppercase tracking-wider mb-3">
                <Scale className="h-3.5 w-3.5 text-[#415a77]" />
                <span>Operating Standards & Guidelines</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b192c] tracking-tight">
                Terms of Service & Acceptable Use
              </h1>
              <p className="mt-2 text-base text-[#415a77] max-w-2xl leading-relaxed">
                Operating rules, diagnostic rate quotas, intellectual property protections, and 100% user ownership guarantees over generated audit dossiers.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0b192c] px-4 py-2.5 text-sm font-bold text-[#f8fafc] hover:bg-[#152238] transition-all shadow-sm active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <LifeBuoy className="h-4 w-4 text-sky-300" />
                <span>Enterprise Terms & Inquiries</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#94a3b8]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <TermsSection />

        {/* Global Trust Footer Card */}
        <div className="mt-14 rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 text-center text-[#f8fafc] shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#152238] border border-[#415a77]/40 text-sky-300 mb-3 shadow-md">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[#f8fafc]">Need Custom Terms or Master Service Agreements?</h3>
          <p className="mt-2 text-sm text-[#cbd5e1] max-w-lg mx-auto leading-relaxed">
            Enterprise customers can request customized SLA guarantees, dedicated private cloud deployments, and custom procurement agreements.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-extrabold text-[#07111e] hover:bg-sky-400 transition-all shadow-md active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <LifeBuoy className="h-4 w-4" />
              <span>Contact Legal & Sales</span>
            </Link>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 rounded-xl border border-[#415a77]/40 bg-[#152238] px-5 py-2.5 text-sm font-bold text-[#f8fafc] hover:bg-[#1f314d] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <FileText className="h-4 w-4 text-sky-300" />
              <span>Privacy Policy</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
export default TermsPage;
