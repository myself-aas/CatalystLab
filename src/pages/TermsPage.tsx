import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, LifeBuoy, ArrowRight, Award } from 'lucide-react';
import { TermsSection } from '../components/legal/TermsSection';
import { SEOHead } from '../components/common/SEOHead';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
      <SEOHead
        title="Terms of Service & Acceptable Use Policy"
        description="Review CatalystLab's Terms of Service, acceptable telemetry usage policies, intellectual property rights, and report licensing terms."
        keywords={['CatalystLab terms of service', 'acceptable use policy', 'telemetry API license', 'developer terms']}
        canonicalUrl="https://www.catalystlab.tech/terms"
      />

      {/* Dedicated Hero Header */}
      <section className="border-b border-border bg-muted px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
                <Scale className="h-3.5 w-3.5 text-amber-600" />
                <span>Operating Standards &amp; Guidelines</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight font-sans">
                Terms of Service &amp; Acceptable Use
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed font-sans">
                Operating rules, diagnostic rate quotas, intellectual property protections, and 100% user ownership guarantees over generated audit dossiers.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover border border-border px-3.5 py-2 text-xs font-bold text-primary-foreground transition-all shadow-sm"
              >
                <LifeBuoy className="h-3.5 w-3.5 text-amber-500" />
                <span>Enterprise Inquiries</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <TermsSection />

        {/* Global Trust Footer Card */}
        <div className="rounded-2xl border border-border bg-background p-6 text-center text-foreground shadow-sm space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent border border-border text-amber-600 shadow-sm">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-foreground font-sans">Need Custom Terms or Master Service Agreements?</h3>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed font-sans">
            Enterprise customers can request customized SLA guarantees, dedicated private cloud deployments, and custom procurement agreements.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover border border-border px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-sm"
            >
              <LifeBuoy className="h-3.5 w-3.5 text-amber-500" />
              <span>Contact Legal &amp; Sales</span>
            </Link>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-accent px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all"
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
