import React from 'react';
import { useLocation, Link } from 'react-router-dom';

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
    content = 'We prioritize application security. If you discover a vulnerability in our scanning engines or API endpoints, please contact security@catalystlab.io for coordinated disclosure.';
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold text-white">{title}</h1>
          <p className="mt-1 text-xs text-slate-400">Last updated: August 2026</p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-sm text-slate-300 leading-relaxed space-y-4">
          <p>{content}</p>
          <p>
            For questions or requests regarding data retention or legal compliance, please refer to our{' '}
            <Link to="/contact" className="text-cyan-400 underline">Contact Support</Link> portal.
          </p>
        </div>
      </main>
    </div>
  );
};
