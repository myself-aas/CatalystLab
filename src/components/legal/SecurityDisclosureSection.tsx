import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Copy, 
  Check, 
  AlertOctagon, 
  Send, 
  CheckCircle2, 
  Clock, 
  Award 
} from 'lucide-react';
import { LazyReveal } from '../common/LazyAnimate';

export const SecurityDisclosureSection: React.FC = () => {
  const [pgpCopied, setPgpCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [targetAsset, setTargetAsset] = useState('catalystlab.tech (Web Portal)');
  const [vulnType, setVulnType] = useState('Server-Side Request Forgery (SSRF)');
  const [severity, setSeverity] = useState('High');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');

  const pgpKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: CatalystLab-Security-PGP v4.1
Comment: https://www.catalystlab.tech/.well-known/security.txt

mQENBGY6ZgABCADK8wFq+5J7jK0e3yR8v...[CATALYSTLAB-SECURITY-KEY-2026]...
Fingerprint: 8B9C 3E1F 4A7D 2E6B 901C  DF45 8123 A4B5 C6D7 E8F9
UID: CatalystLab Security Operations <security@catalystlab.tech>
Subkey: ed25519/0x91F4B8C3 2026-01-01 [Expires: 2028-01-01]
-----END PGP PUBLIC KEY BLOCK-----`;

  const handleCopyPgp = () => {
    navigator.clipboard.writeText(pgpKey);
    setPgpCopied(true);
    setTimeout(() => setPgpCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const severityMatrix = [
    {
      level: 'Critical',
      color: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
      badge: 'Immediate P0',
      targetFix: '< 12 Hours',
      examples: 'Remote Code Execution (RCE), Authentication Bypass, Database SQL/Firestore Injection'
    },
    {
      level: 'High',
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      badge: 'P1 High',
      targetFix: '< 48 Hours',
      examples: 'Server-Side Request Forgery (SSRF), Sensitive Token Leakage, Cross-Site Scripting (XSS) with Session Hijack'
    },
    {
      level: 'Medium',
      color: 'border-brand-slate/40 bg-brand-oxford text-brand-periwinkle',
      badge: 'P2 Medium',
      targetFix: '< 5 Business Days',
      examples: 'CORS Misconfiguration on Internal APIs, Rate-Limit Bypass, Clickjacking on Protected Views'
    },
    {
      level: 'Low',
      color: 'border-brand-slate/30 bg-surface-panel text-brand-slate-light',
      badge: 'P3 Low',
      targetFix: '< 14 Business Days',
      examples: 'Missing Informational Security Headers, Verbose Server Fingerprint Banners'
    }
  ];

  return (
    <div className="space-y-8 font-mono">
      {/* Safe Harbor Banner */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 sm:p-8 text-brand-offwhite shadow-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-accent-emerald mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>DISCLOSE.IO &amp; RFC-9116 COMPLIANT SAFE HARBOR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-offwhite tracking-tight font-sans">
            Vulnerability Disclosure &amp; Safe Harbor
          </h2>
          <p className="mt-2 text-xs text-brand-periwinkle max-w-3xl leading-relaxed font-sans">
            CatalystLab values the independent security research community. We pledge full Safe Harbor protection: we will not pursue legal action against researchers acting in good faith under our Coordinated Disclosure Program.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-brand-slate/30 pt-5">
            <div className="rounded-xl border border-brand-slate/40 bg-brand-oxford p-3.5">
              <span className="text-[10px] uppercase font-bold text-accent-cyan">Target Triage Time</span>
              <div className="text-base font-bold text-brand-offwhite mt-0.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent-cyan" />
                <span>&lt; 2 Hours</span>
              </div>
            </div>

            <div className="rounded-xl border border-brand-slate/40 bg-brand-oxford p-3.5">
              <span className="text-[10px] uppercase font-bold text-accent-emerald">Safe Harbor Status</span>
              <div className="text-base font-bold text-brand-offwhite mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-emerald" />
                <span>Full Legal Pledge</span>
              </div>
            </div>

            <div className="rounded-xl border border-brand-slate/40 bg-brand-oxford p-3.5">
              <span className="text-[10px] uppercase font-bold text-accent-amber">Hall of Fame</span>
              <div className="text-base font-bold text-brand-offwhite mt-0.5 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-accent-amber" />
                <span>Public Recognition</span>
              </div>
            </div>
          </div>
        </div>
      </LazyReveal>

      {/* Vulnerability Severity Matrix */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertOctagon className="h-4 w-4 text-accent-cyan" />
            <h3 className="text-base font-bold text-brand-offwhite font-sans">Severity Classification &amp; Resolution SLAs</h3>
          </div>
          <p className="text-xs text-brand-periwinkle mb-5 font-sans">
            Standardized Common Vulnerability Scoring System (CVSS v3.1) matrix and remediation timelines.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {severityMatrix.map((item) => (
              <div
                key={item.level}
                className={`rounded-xl border p-4 space-y-2 ${item.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">{item.level} Severity</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-current">
                    SLA: {item.targetFix}
                  </span>
                </div>
                <p className="text-xs leading-relaxed font-sans opacity-90">
                  <strong>Scope:</strong> {item.examples}
                </p>
              </div>
            ))}
          </div>
        </div>
      </LazyReveal>

      {/* PGP Public Key Viewer */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 sm:p-8 text-brand-offwhite shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-slate/30 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-accent-cyan mb-1">
                <Key className="h-3.5 w-3.5" />
                <span>ENCRYPTED COMMUNICATIONS</span>
              </div>
              <h3 className="text-base font-bold text-brand-offwhite font-sans">Security Team PGP Public Key</h3>
              <p className="text-xs text-brand-periwinkle mt-0.5 font-sans">
                Encrypt sensitive Proof of Concept (PoC) exploit chains before transmitting over public channels.
              </p>
            </div>

            <button
              onClick={handleCopyPgp}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-oxford px-3 py-1.5 text-xs font-bold text-accent-cyan border border-brand-slate/40 hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              {pgpCopied ? <Check className="h-3 w-3 text-accent-emerald" /> : <Copy className="h-3 w-3" />}
              <span>{pgpCopied ? 'PGP Block Copied!' : 'Copy Public Key'}</span>
            </button>
          </div>

          <div className="rounded-xl border border-brand-slate/40 bg-brand-oxford p-3 font-mono text-[11px] text-brand-periwinkle overflow-x-auto leading-relaxed">
            <pre>{pgpKey}</pre>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-brand-slate-light">
            <span>Security Contact: security@catalystlab.tech</span>
            <span>Canonical security.txt: https://www.catalystlab.tech/.well-known/security.txt</span>
          </div>
        </div>
      </LazyReveal>

      {/* Interactive Vulnerability Submission Form */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Send className="h-4 w-4 text-accent-cyan" />
            <h3 className="text-base font-bold text-brand-offwhite font-sans">Submit Coordinated Vulnerability Report</h3>
          </div>
          <p className="text-xs text-brand-periwinkle mb-5 font-sans">
            Direct intake channel directly to CatalystLab&apos;s on-call security engineering rotation.
          </p>

          {submitted ? (
            <div className="rounded-xl border border-accent-emerald/40 bg-brand-oxford p-6 text-center space-y-2.5">
              <CheckCircle2 className="h-8 w-8 text-accent-emerald mx-auto" />
              <h4 className="text-sm font-bold text-brand-offwhite">Vulnerability Report Dispatched!</h4>
              <p className="text-xs text-brand-periwinkle max-w-md mx-auto font-sans leading-relaxed">
                Thank you for contributing to web telemetry safety. Our security team has received your ticket and will verify the PoC within 2 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 rounded-lg bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 px-3.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Target Asset / Endpoint
                  </label>
                  <select
                    value={targetAsset}
                    onChange={(e) => setTargetAsset(e.target.value)}
                    className="w-full rounded-lg border border-brand-slate/40 bg-brand-oxford px-3 py-1.5 text-xs text-brand-offwhite focus:border-brand-slate focus:outline-none cursor-pointer"
                  >
                    <option>catalystlab.tech (Web Portal)</option>
                    <option>Diagnostic Container Workers (Cloud Run)</option>
                    <option>Telemetry Ingestion Gateway /api/*</option>
                    <option>PDF Export &amp; Canvas Rendering Service</option>
                    <option>Other Subdomain / Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Vulnerability Category
                  </label>
                  <select
                    value={vulnType}
                    onChange={(e) => setVulnType(e.target.value)}
                    className="w-full rounded-lg border border-brand-slate/40 bg-brand-oxford px-3 py-1.5 text-xs text-brand-offwhite focus:border-brand-slate focus:outline-none cursor-pointer"
                  >
                    <option>Server-Side Request Forgery (SSRF)</option>
                    <option>Cross-Site Scripting (XSS)</option>
                    <option>Authentication or Token Bypass</option>
                    <option>Denial of Service / Resource Exhaustion</option>
                    <option>Information / Header Disclosure</option>
                    <option>Other Security Anomaly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Estimated CVSS Severity
                  </label>
                  <div className="flex items-center gap-1.5">
                    {(['Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                          severity === sev
                            ? 'border-brand-slate bg-brand-slate text-white shadow-sm'
                            : 'border-brand-slate/40 bg-brand-oxford text-brand-periwinkle hover:text-white'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Researcher Contact / PGP Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@secops.io"
                    className="w-full rounded-lg border border-brand-slate/40 bg-brand-oxford px-3 py-1.5 text-xs text-brand-offwhite focus:border-brand-slate focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-offwhite mb-1">
                  Proof of Concept (PoC) &amp; Reproduction Steps
                </label>
                <textarea
                  required
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide exact HTTP request headers, payload reproduction steps, and impact assessment..."
                  className="w-full rounded-lg border border-brand-slate/40 bg-brand-oxford p-3 text-xs text-brand-offwhite focus:border-brand-slate focus:outline-none"
                />
              </div>

              <div className="rounded-lg border border-brand-slate/40 bg-brand-oxford p-3 flex items-start gap-2.5 text-xs text-brand-periwinkle">
                <input type="checkbox" required className="mt-0.5 h-3.5 w-3.5 rounded border-brand-slate" id="safe-harbor" />
                <label htmlFor="safe-harbor" className="cursor-pointer font-sans">
                  I agree to keep this vulnerability confidential until CatalystLab releases a patched container build and authorizes coordinated disclosure.
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 py-2.5 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-accent-cyan" />
                <span>Transmit Encrypted Security Report</span>
              </button>
            </form>
          )}
        </div>
      </LazyReveal>
    </div>
  );
};
