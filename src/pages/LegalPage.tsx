import React from 'react';
import { useLocation, Link } from 'react-router-dom';
<<<<<<< HEAD
import { ShieldCheck } from 'lucide-react';
=======
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

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
<<<<<<< HEAD
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-xs font-semibold text-[#415a77] mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Compliance & Legal Standards</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0b192c] sm:text-4xl">{title}</h1>
          <p className="mt-1 text-xs text-[#415a77]">Last updated: August 2026</p>
=======
    <div className="min-h-screen bg-slate-950 pb-20">
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold text-white">{title}</h1>
          <p className="mt-1 text-xs text-slate-400">Last updated: August 2026</p>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
<<<<<<< HEAD
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 sm:p-10 text-sm text-[#f8fafc] leading-relaxed space-y-4 shadow-2xl">
          <p className="text-base text-[#f8fafc]">{content}</p>
          <p className="text-xs text-[#c5d3e8]">
            For questions or requests regarding data retention or legal compliance, please refer to our{' '}
            <Link to="/contact" className="text-[#c5d3e8] underline font-semibold hover:text-white">Contact Support</Link> portal.
=======
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-sm text-slate-300 leading-relaxed space-y-4">
          <p>{content}</p>
          <p>
            For questions or requests regarding data retention or legal compliance, please refer to our{' '}
            <Link to="/contact" className="text-cyan-400 underline">Contact Support</Link> portal.
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          </p>
        </div>
      </main>
    </div>
  );
};
<<<<<<< HEAD

=======
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
