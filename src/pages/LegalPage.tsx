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
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background pb-20 text-foreground">
 <SEOHead
 title={`${title} — CatalystLab`}
 description={content}
 canonicalUrl={`https://www.catalystlab.tech${path}`}
 />
 <section className="border-b border-border py-10 sm:px-6 lg:px-8">
 <div className="ds-page-shell space-y-2">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 framer-micro-tag text-muted-foreground">
 <ShieldCheck className="h-3.5 w-3.5 shrink-0"/>
 <span>Compliance &amp; Legal Standards</span>
 </div>
 <h1 className="framer-section-headline text-foreground">{title}</h1>
 <p className="text-xs text-muted-foreground font-mono">Last updated: August 2026</p>
 </div>
 </section>

 <main className="ds-page-shell">
 <div className="ds-card space-y-4 p-6 sm:p-8">
 <p className="framer-body-text text-foreground">{content}</p>
 <ul className="grid gap-2 sm:grid-cols-2 text-sm font-mono">
 <li><Link to="/privacy" className="text-[#0066FF] hover:underline">Privacy Policy</Link></li>
 <li><Link to="/terms" className="text-[#0066FF] hover:underline">Terms of Service</Link></li>
 <li><Link to="/cookies" className="text-[#0066FF] hover:underline">Cookie Preferences</Link></li>
 <li><Link to="/security" className="text-[#0066FF] hover:underline">Security Disclosure</Link></li>
 </ul>
 <p className="framer-body-text text-xs text-muted-foreground pt-4 border-t border-border">
 For questions or requests regarding data retention or legal compliance, please refer to our{' '}
 <Link to="/contact" className="font-semibold text-foreground underline hover:text-[#0066FF]">Contact Support</Link> portal.
 </p>
 </div>
 </main>
 </div>
 );
};

export default LegalPage;
