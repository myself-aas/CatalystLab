import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, LifeBuoy, ArrowRight } from 'lucide-react';
import { PrivacySection } from '../components/legal/PrivacySection';
import { SEOHead } from '../components/common/SEOHead';

export const PrivacyPage: React.FC = () => {
 return (
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background pb-24 text-foreground">
 <SEOHead
 title="Privacy Policy & Data Protection Architecture"
 description="Learn how CatalystLab processes diagnostic URLs, telemetry traces, and developer authentication with strict zero-monetization guarantees and GDPR compliance."
 keywords={['CatalystLab privacy policy', 'GDPR compliance', 'CCPA data security', 'zero telemetry monetization', 'data protection']}
 canonicalUrl="https://www.catalystlab.tech/privacy"
 />

 {/* Dedicated Hero Header */}
 <section className="border-b border-border py-10 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-5xl">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-2">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 framer-micro-tag text-[#0066FF]">
 <Shield className="h-3.5 w-3.5 text-[#0066FF] shrink-0"/>
 <span>CatalystLab Privacy Architecture</span>
 </div>
 <h1 className="framer-section-headline text-foreground">
 Privacy Policy &amp; Data Security
 </h1>
 <p className="framer-body-text max-w-3xl">
 How CatalystLab handles diagnostic traces, telemetry data, and authenticated Google accounts with strict zero-monetization guarantees and full GDPR/CCPA compliance.
 </p>
 </div>

 {/* Quick Actions */}
 <div className="shrink-0 flex items-center gap-3">
 <Link
 to="/contact"
 className="ds-btn ds-btn-primary text-xs"
 >
 <LifeBuoy className="h-3.5 w-3.5 text-amber-300 shrink-0"/>
 <span>Contact Privacy Team</span>
 <ArrowRight className="h-3 w-3 shrink-0"/>
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* Main Content */}
 <main className="ds-page-shell space-y-8">
 <PrivacySection />

 {/* Global Trust Footer Card */}
 <div className="ds-card p-6 text-center space-y-3">
 <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border text-foreground shadow-sm">
 <Lock className="h-5 w-5"/>
 </div>
 <h3 className="framer-card-title text-foreground">Questions About Data Protection?</h3>
 <p className="framer-body-text max-w-3xl mx-auto">
 Our Data Protection Officer and compliance engineers are available to review custom Data Processing Agreements (DPAs) and answer privacy inquiries.
 </p>
 <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
 <Link
 to="/contact"
 className="ds-btn ds-btn-primary text-xs"
 >
 <LifeBuoy className="h-3.5 w-3.5 text-amber-300 shrink-0"/>
 <span>Contact Compliance Team</span>
 </Link>
 <Link
 to="/security"
 className="ds-btn ds-btn-secondary text-xs"
 >
 <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0"/>
 <span>Security Disclosure</span>
 </Link>
 </div>
 </div>
 </main>
 </div>
 );
};

export default PrivacyPage;
