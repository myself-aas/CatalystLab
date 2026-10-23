import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ArrowRight, ShieldCheck } from 'lucide-react';
import { CookiePreferenceCenter } from '../components/legal/CookiePreferenceCenter';
import { SEOHead } from '../components/common/SEOHead';

export const CookiePolicyPage: React.FC = () => {
 return (
 <div className="min-h-screen ds-page-top bg-background text-foreground">
 <SEOHead
 title="Cookie Policy & Preference Manager"
 description="Configure your cookie preferences and learn about CatalystLab's minimal session telemetry and zero third-party advertising tracking policies."
 keywords={['CatalystLab cookie policy', 'cookie preferences', 'GDPR cookie compliance', 'zero tracking cookies']}
 canonicalUrl="https://www.catalystlab.tech/cookies"
 />

 <section className="border-b border-border sm:px-6 lg:px-8 ds-section">
 <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
 <div className="max-w-3xl space-y-3">
 <h1 className="framer-section-headline flex items-center gap-3 text-foreground">
 <Cookie className="size-7 shrink-0 text-warning" aria-hidden="true" />
 Cookie Policy
 </h1>
 <p className="framer-body-text">
 CatalystLab writes six items to this browser: sign-in session data, an
 anonymous id for rate limits, your theme, a cache of recent reports, and the
 record below. Nothing here follows you to other sites.
 </p>
 </div>

 <Link to="/privacy" className="ds-btn ds-btn-secondary shrink-0 text-sm">
 <ShieldCheck className="size-4 shrink-0"/>
 <span>Read the privacy policy</span>
 <ArrowRight className="size-4 shrink-0"/>
 </Link>
 </div>
 </section>

 <main className="ds-page-shell ds-section">
 <CookiePreferenceCenter />
 </main>
 </div>
 );
};

export default CookiePolicyPage;
