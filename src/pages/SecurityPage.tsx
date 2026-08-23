import React from 'react';
import { ArrowRight, Key, ShieldCheck } from 'lucide-react';
import { SecurityDisclosureSection } from '../components/legal/SecurityDisclosureSection';
import { SEOHead } from '../components/common/SEOHead';

export const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-navy pb-24 text-brand-offwhite font-mono selection:bg-brand-slate selection:text-white">
      <SEOHead
        title="Security Policy, PGP Key & Safe Harbor Disclosure"
        description="CatalystLab's RFC-9116 security disclosure program, PGP public key for encrypted reporting, response SLAs, and legal Safe Harbor protection for security researchers."
        keywords={['CatalystLab security', 'vulnerability disclosure', 'RFC 9116', 'safe harbor', 'bug bounty', 'PGP key']}
        canonicalUrl="https://www.catalystlab.tech/security"
      />

      {/* Dedicated Hero Header */}
      <section className="border-b border-brand-slate/30 bg-brand-oxford px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-brand-slate/40 bg-surface-panel px-2.5 py-0.5 text-xs font-bold text-accent-emerald uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-emerald" />
                <span>RFC-9116 Coordinated Disclosure</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-offwhite tracking-tight font-sans">
                Security Disclosure &amp; Safe Harbor
              </h1>
              <p className="text-xs sm:text-sm text-brand-periwinkle max-w-2xl leading-relaxed font-sans">
                Our vulnerability intake program, PGP public key, CVSS severity tiers, and legal Safe Harbor pledge protecting ethical security researchers.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <a
                href="mailto:security@catalystlab.tech"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-sm"
              >
                <Key className="h-3.5 w-3.5 text-accent-cyan" />
                <span>Email Security Team</span>
                <ArrowRight className="h-3 w-3 text-brand-slate-light" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <SecurityDisclosureSection />
      </main>
    </div>
  );
};

export default SecurityPage;
