import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ArrowRight, ShieldCheck } from 'lucide-react';
import { CookiePreferenceCenter } from '../components/legal/CookiePreferenceCenter';
import { SEOHead } from '../components/common/SEOHead';

export const CookiePolicyPage: React.FC = () => {
 return (
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background pb-24 text-foreground">
 <SEOHead
 title="Cookie Policy & Preference Manager"
 description="Configure your cookie preferences and learn about CatalystLab's minimal session telemetry and zero third-party advertising tracking policies."
 keywords={['CatalystLab cookie policy', 'cookie preferences', 'GDPR cookie compliance', 'zero tracking cookies']}
 canonicalUrl="https://www.catalystlab.tech/cookies"
 />

 {/* Dedicated Hero Header */}
 <section className="border-b border-border py-10 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-5xl">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-2">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 framer-micro-tag text-amber-400">
 <Cookie className="h-3.5 w-3.5 text-amber-400 shrink-0"/>
 <span>Transparent Consent Architecture</span>
 </div>
 <h1 className="framer-section-headline text-foreground">
 Cookie Policy &amp; Consent Manager
 </h1>
 <p className="framer-body-text max-w-3xl">
 Full transparency into session tokens, local telemetry storage, and granular client-side controls. We do not use third-party advertising cookies.
 </p>
 </div>

 {/* Quick Actions */}
 <div className="shrink-0 flex items-center gap-3">
 <Link
 to="/privacy"
 className="ds-btn ds-btn-primary text-xs"
 >
 <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0"/>
 <span>View Full Privacy Policy</span>
 <ArrowRight className="h-3 w-3 shrink-0"/>
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* Main Content */}
 <main className="ds-page-shell">
 <CookiePreferenceCenter />
 </main>
 </div>
 );
};

export default CookiePolicyPage;
