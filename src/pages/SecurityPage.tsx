import React from 'react';
import { ArrowRight, Key, ShieldCheck } from 'lucide-react';
import { SecurityDisclosureSection } from '../components/legal/SecurityDisclosureSection';
import { SEOHead } from '../components/common/SEOHead';

export const SecurityPage: React.FC = () => {
 return (
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background pb-24 text-foreground">
 <SEOHead
 title="Security Policy, PGP Key & Safe Harbor Disclosure"
 description="CatalystLab's RFC-9116 security disclosure program, PGP public key for encrypted reporting, response SLAs, and legal Safe Harbor protection for security researchers."
 keywords={['CatalystLab security', 'vulnerability disclosure', 'RFC 9116', 'safe harbor', 'bug bounty', 'PGP key']}
 canonicalUrl="https://www.catalystlab.tech/security"
 />

 {/* Dedicated Hero Header */}
 <section className="relative overflow-hidden border-b border-border py-14 sm:py-18 w-full">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,102,255,0.12)_0%,transparent_70%)] pointer-events-none z-0"/>

 <div className="relative z-10 w-full sm:px-6 lg:px-8">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-3 max-w-2xl">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 framer-micro-tag text-emerald-400">
 <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0"/>
 <span>RFC-9116 Coordinated Disclosure</span>
 </div>
 <h1 className="framer-hero-title text-foreground">
 Security Disclosure &amp; Safe Harbor
 </h1>
 <p className="framer-body-text">
 Our vulnerability intake program, PGP public key, CVSS severity tiers, and legal Safe Harbor pledge protecting ethical security researchers.
 </p>
 </div>

 {/* Quick Actions */}
 <div className="shrink-0 flex items-center gap-3">
 <a
 href="mailto:security@catalystlab.tech"
 className="ds-btn ds-btn-primary text-xs sm:text-sm"
 >
 <Key className="h-4 w-4 shrink-0"/>
 <span>Email Security Team</span>
 <ArrowRight className="h-3.5 w-3.5 shrink-0"/>
 </a>
 </div>
 </div>
 </div>
 </section>

 {/* Main Content */}
 <main className="ds-page-shell">
 <SecurityDisclosureSection />
 </main>
 </div>
 );
};

export default SecurityPage;
