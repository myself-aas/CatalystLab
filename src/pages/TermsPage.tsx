import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, LifeBuoy, ArrowRight, Award } from 'lucide-react';
import { TermsSection } from '../components/legal/TermsSection';
import { SEOHead } from '../components/common/SEOHead';

export const TermsPage: React.FC = () => {
 return (
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background pb-24 text-foreground">
 <SEOHead
 title="Terms of Service & Acceptable Use Policy"
 description="Review CatalystLab's Terms of Service, acceptable telemetry usage policies, intellectual property rights, and report licensing terms."
 keywords={['CatalystLab terms of service', 'acceptable use policy', 'telemetry API license', 'developer terms']}
 canonicalUrl="https://www.catalystlab.tech/terms"
 />

 {/* Dedicated Hero Header */}
 <section className="border-b border-border py-10 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-5xl">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-2">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 framer-micro-tag text-amber-400">
 <Scale className="h-3.5 w-3.5 text-amber-400 shrink-0"/>
 <span>Operating Standards &amp; Guidelines</span>
 </div>
 <h1 className="framer-section-headline text-foreground">
 Terms of Service &amp; Acceptable Use
 </h1>
 <p className="framer-body-text max-w-3xl">
 Operating rules, diagnostic rate quotas, intellectual property protections, and 100% user ownership guarantees over generated audit dossiers.
 </p>
 </div>

 {/* Quick Actions */}
 <div className="shrink-0 flex items-center gap-3">
 <Link
 to="/contact"
 className="ds-btn ds-btn-primary text-xs"
 >
 <LifeBuoy className="h-3.5 w-3.5 text-amber-300 shrink-0"/>
 <span>Enterprise Inquiries</span>
 <ArrowRight className="h-3 w-3 shrink-0"/>
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* Main Content */}
 <main className="ds-page-shell space-y-8">
 <TermsSection />

 {/* Global Trust Footer Card */}
 <div className="ds-card p-6 text-center space-y-3">
 <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border text-amber-400 shadow-sm">
 <Award className="h-5 w-5"/>
 </div>
 <h3 className="framer-card-title text-foreground">Need Custom Terms or Master Service Agreements?</h3>
 <p className="framer-body-text max-w-3xl mx-auto">
 Enterprise customers can request customized SLA guarantees, dedicated private cloud deployments, and custom procurement agreements.
 </p>
 <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
 <Link
 to="/contact"
 className="ds-btn ds-btn-primary text-xs"
 >
 <LifeBuoy className="h-3.5 w-3.5 text-amber-300 shrink-0"/>
 <span>Contact Legal &amp; Sales</span>
 </Link>
 <Link
 to="/privacy"
 className="ds-btn ds-btn-secondary text-xs"
 >
 <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0"/>
 <span>Privacy Policy</span>
 </Link>
 </div>
 </div>
 </main>
 </div>
 );
};

export default TermsPage;
