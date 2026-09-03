import React from 'react';
import { ArrowRight, Key, ShieldCheck } from 'lucide-react';
import { SecurityDisclosureSection } from '../components/legal/SecurityDisclosureSection';
import { SEOHead } from '../components/common/SEOHead';

export const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
      <SEOHead
        title="Security Policy, PGP Key & Safe Harbor Disclosure"
        description="CatalystLab's RFC-9116 security disclosure program, PGP public key for encrypted reporting, response SLAs, and legal Safe Harbor protection for security researchers."
        keywords={['CatalystLab security', 'vulnerability disclosure', 'RFC 9116', 'safe harbor', 'bug bounty', 'PGP key']}
        canonicalUrl="https://www.catalystlab.tech/security"
      />

      {/* Dedicated Hero Header */}
      <section className="relative overflow-hidden border-b border-border bg-muted py-14 sm:py-18 w-full">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--app-card)_0%,var(--app-background)_65%,var(--app-muted)_100%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e125_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e125_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" />

        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>RFC-9116 Coordinated Disclosure</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight font-sans leading-[1.1]">
                Security Disclosure &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-background">
                  Safe Harbor
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-sans font-normal">
                Our vulnerability intake program, PGP public key, CVSS severity tiers, and legal Safe Harbor pledge protecting ethical security researchers.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <a
                href="mailto:security@catalystlab.tech"
                className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover border border-border px-5 py-3 text-xs sm:text-sm font-bold text-primary-foreground transition-all shadow-sm active:scale-95"
              >
                <Key className="h-4 w-4 text-blue-400" />
                <span>Email Security Team</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
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
