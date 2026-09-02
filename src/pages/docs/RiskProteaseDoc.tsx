import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Lock, Eye } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const RiskProteaseDoc: React.FC = () => {
  const toc = [
    { id: 'riskprotease-overview', title: 'Phase 6: RiskProtease Overview' },
    { id: 'owasp-compliance', title: 'OWASP Defense-in-Depth Headers' },
    { id: 'wcag-accessibility', title: 'WCAG 2.2 AA Contrast Standards' },
    { id: 'cookie-consent', title: 'GDPR / CCPA Consent Auditing' },
  ];

  return (
    <DocsLayout
      title="6. RiskProtease (SDLC Phase 6) — OWASP SecOps & Compliance"
      description="OWASP security headers, HSTS preloading, CSP directives, WCAG 2.2 AA accessibility, and GDPR privacy consent auditing."
      canonicalPath="/docs/riskprotease"
      toc={toc}
    >
      <section id="riskprotease-overview" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-800">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>SDLC Phase 6: SecOps & Compliance Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          RiskProtease: OWASP Security & Compliance Guard
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          RiskProtease executes automated penetration and compliance checks, auditing TLS cipher suites, Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), WCAG 2.2 AA color contrast ratios, ARIA semantic landmarks, and GDPR cookie banners.
        </p>
      </section>

      {/* OWASP Compliance */}
      <section id="owasp-compliance" className="space-y-4 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-foreground">OWASP Security Headers Implementation</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Configure baseline defensive headers to secure web applications against XSS, clickjacking, and packet sniffing:
        </p>

        <CodeSnippet
          title="Helmet & Security Middleware (server.ts)"
          language="typescript"
          code={`import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'sameorigin' },
  noSniff: true
}));`}
        />
      </section>

      {/* WCAG Accessibility */}
      <section id="wcag-accessibility" className="space-y-4 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-foreground">WCAG 2.2 AA Contrast Standards</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The engine computes relative luminance formulas to verify color contrast ratios between text and background elements:
        </p>

        <div className="rounded-xl border border-border bg-background p-4 text-sm space-y-2">
          <div><strong className="text-foreground">Standard Body Text (&lt; 18pt):</strong> Minimum contrast ratio of <span className="font-mono font-bold text-emerald-700">4.5:1</span></div>
          <div><strong className="text-foreground">Large Headings (&ge; 18pt or &ge; 14pt bold):</strong> Minimum contrast ratio of <span className="font-mono font-bold text-emerald-700">3.0:1</span></div>
          <div><strong className="text-foreground">Interactive UI Components & Form Borders:</strong> Minimum contrast ratio of <span className="font-mono font-bold text-emerald-700">3.0:1</span></div>
        </div>
      </section>

      {/* Cookie Consent */}
      <section id="cookie-consent" className="space-y-4 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-foreground">GDPR / CCPA Consent & Tracker Detection</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Verifies whether third-party tracking scripts (Google Analytics, Meta Pixel, Hotjar) execute prior to explicit user cookie consent.
        </p>
      </section>
    </DocsLayout>
  );
};
export default RiskProteaseDoc;
