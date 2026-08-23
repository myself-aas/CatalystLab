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
    <div className="min-h-screen bg-white pb-20 text-black font-mono selection:bg-black selection:text-white">
      <SEOHead
        title={`${title} — CatalystLab`}
        description={content}
        canonicalUrl={`https://www.catalystlab.tech${path}`}
      />
      <section className="border-b border-gray-200 bg-gray-100 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-bold text-accent-amber-strong uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Compliance &amp; Legal Standards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-sans">{title}</h1>
          <p className="text-xs text-gray-500 font-sans">Last updated: August 2026</p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 text-xs sm:text-sm leading-relaxed text-black shadow-xl sm:p-8 font-sans">
          <p className="text-black leading-relaxed">{content}</p>
          <p className="text-xs text-gray-600 pt-2 border-t border-gray-200">
            For questions or requests regarding data retention or legal compliance, please refer to our{' '}
            <Link to="/contact" className="font-semibold text-accent-amber-strong underline hover:text-white">Contact Support</Link> portal.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LegalPage;
