import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Legal & Compliance';
  let content = 'Policies covering privacy, acceptable use, cookies, and coordinated vulnerability disclosure for the CatalystLab telemetry platform.';

  if (path.includes('privacy')) {
    title = 'Privacy Policy';
    content = 'We respect your privacy. CatalystLab stores diagnostic telemetry reports securely in Firestore under your authenticated user ID. We never sell your data or expose private credentials.';
  } else if (path.includes('terms')) {
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
    <div className="min-h-screen bg-background pb-20 text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
      <SEOHead
        title={`${title} — CatalystLab`}
        description={content}
        canonicalUrl={`https://www.catalystlab.tech${path}`}
      />
      <section className="border-b border-border bg-muted px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-bold text-foreground uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Compliance &amp; Legal Standards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-sans">{title}</h1>
          <p className="text-xs text-muted-foreground font-sans">Last updated: August 2026</p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-2xl border border-border bg-background p-6 text-xs sm:text-sm leading-relaxed text-foreground shadow-xl sm:p-8 font-sans">
          <p className="text-foreground leading-relaxed">{content}</p>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm">
            <li><Link to="/privacy" className="font-semibold underline">Privacy Policy</Link></li>
            <li><Link to="/terms" className="font-semibold underline">Terms of Service</Link></li>
            <li><Link to="/cookies" className="font-semibold underline">Cookie Preferences</Link></li>
            <li><Link to="/security" className="font-semibold underline">Security Disclosure</Link></li>
          </ul>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            For questions or requests regarding data retention or legal compliance, please refer to our{' '}
            <Link to="/contact" className="font-semibold text-foreground underline hover:text-foreground">Contact Support</Link> portal.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LegalPage;
