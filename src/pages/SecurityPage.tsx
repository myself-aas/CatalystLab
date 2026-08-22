import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, LifeBuoy, ArrowRight, Key } from 'lucide-react';
import { SecurityDisclosureSection } from '../components/legal/SecurityDisclosureSection';
import { LazyReveal } from '../components/common/LazyAnimate';
import { SEOHead } from '../components/common/SEOHead';

export const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#415a77]/25 selection:text-[#0b192c]">
      <SEOHead
        title="Security Policy, PGP Key & Safe Harbor Disclosure"
        description="CatalystLab's RFC-9116 security disclosure program, PGP public key for encrypted reporting, response SLAs, and legal Safe Harbor protection for security researchers."
        keywords={['CatalystLab security', 'vulnerability disclosure', 'RFC 9116', 'safe harbor', 'bug bounty', 'PGP key']}
        canonicalUrl="https://www.catalystlab.tech/security"
      />

      {/* Dedicated Hero Header */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>RFC-9116 Coordinated Disclosure</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b192c] tracking-tight">
                Security Disclosure & Safe Harbor
              </h1>
              <p className="mt-2 text-base text-[#415a77] max-w-2xl leading-relaxed">
                Our vulnerability intake program, PGP public key, CVSS severity tiers, and legal Safe Harbor pledge protecting ethical security researchers.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <a
                href="mailto:security@catalystlab.tech"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0b192c] px-4 py-2.5 text-sm font-bold text-[#f8fafc] hover:bg-[#152238] transition-all shadow-sm active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <Key className="h-4 w-4 text-sky-300" />
                <span>Email Security Team</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#94a3b8]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <SecurityDisclosureSection />
      </main>
    </div>
  );
};
export default SecurityPage;
