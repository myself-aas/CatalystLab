import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, LifeBuoy, ArrowRight, Award } from 'lucide-react';
import { TermsSection } from '../components/legal/TermsSection';
import { SEOHead } from '../components/common/SEOHead';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900 font-mono selection:bg-slate-900 selection:text-white">
      <SEOHead
        title="Terms of Service & Acceptable Use Policy"
        description="Review CatalystLab's Terms of Service, acceptable telemetry usage policies, intellectual property rights, and report licensing terms."
        keywords={['CatalystLab terms of service', 'acceptable use policy', 'telemetry API license', 'developer terms']}
        canonicalUrl="https://www.catalystlab.tech/terms"
      />

      {/* Dedicated Hero Header */}
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
                <Scale className="h-3.5 w-3.5 text-amber-600" />
                <span>Operating Standards &amp; Guidelines</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                Terms of Service &amp; Acceptable Use
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-sans">
                Operating rules, diagnostic rate quotas, intellectual property protections, and 100% user ownership guarantees over generated audit dossiers.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-sm"
              >
                <LifeBuoy className="h-3.5 w-3.5 text-amber-500" />
                <span>Enterprise Inquiries</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <TermsSection />

        {/* Global Trust Footer Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-900 shadow-sm space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-amber-600 shadow-sm">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-sans">Need Custom Terms or Master Service Agreements?</h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed font-sans">
            Enterprise customers can request customized SLA guarantees, dedicated private cloud deployments, and custom procurement agreements.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm"
            >
              <LifeBuoy className="h-3.5 w-3.5 text-amber-500" />
              <span>Contact Legal &amp; Sales</span>
            </Link>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all"
            >
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              <span>Privacy Policy</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
