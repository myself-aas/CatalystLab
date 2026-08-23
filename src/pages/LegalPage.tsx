import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Privacy Policy';
  let content = 'We respect your privacy. CatalystLab stores diagnostic telemetry reports securely in Firestore under your authenticated user ID. We never sell your data or expose private credentials.';

  if (path.includes('terms')) {
    title = 'Terms & Conditions';
    content = 'By using CatalystLab telemetry tools, you agree to scan only URLs and repositories that you own or have explicit authorization to inspect. Diagnostic results are provided on an as-is basis.';
  } else if (path.includes('cookies')) {
    title = 'Cookie Policy';
    content = 'CatalystLab utilizes essential authentication cookies via Firebase Auth to persist your login session across tab reloads and generate secure diagnostic dossiers.';
  } else if (path.includes('security')) {
    title = 'Security Disclosure';
    content = 'We prioritize application security. If you discover a vulnerability in our scanning engines or API endpoints, please contact security@catalystlab.tech for coordinated disclosure.';
  }

  return (
    <div className="min-h-screen bg-brand-navy pb-20 text-brand-offwhite font-mono selection:bg-brand-slate selection:text-white">
      <SEOHead
        title={`${title} — CatalystLab`}
        description={content}
        canonicalUrl={`https://www.catalystlab.tech${path}`}
      />
      <section className="border-b border-brand-slate/30 bg-brand-oxford px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-brand-slate/40 bg-surface-panel px-2.5 py-0.5 text-xs font-bold text-accent-cyan uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Compliance &amp; Legal Standards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-offwhite font-sans">{title}</h1>
          <p className="text-xs text-brand-slate-light font-sans">Last updated: August 2026</p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 text-xs sm:text-sm leading-relaxed text-brand-offwhite shadow-xl sm:p-8 font-sans">
          <p className="text-brand-offwhite leading-relaxed">{content}</p>
          <p className="text-xs text-brand-periwinkle pt-2 border-t border-brand-slate/30">
            For questions or requests regarding data retention or legal compliance, please refer to our{' '}
            <Link to="/contact" className="font-semibold text-accent-cyan underline hover:text-white">Contact Support</Link> portal.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LegalPage;
