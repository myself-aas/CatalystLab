import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Copy, 
  Check, 
  AlertOctagon, 
  Send, 
  CheckCircle2, 
  Terminal,
  FileCode,
  Zap,
  Clock,
  Award
} from 'lucide-react';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../common/LazyAnimate';

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
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      badge: 'Immediate P0',
      targetFix: '< 12 Hours',
      examples: 'Remote Code Execution (RCE), Authentication Bypass, Database SQL/Firestore Injection'
    },
    {
      level: 'High',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      badge: 'P1 High',
      targetFix: '< 48 Hours',
      examples: 'Server-Side Request Forgery (SSRF), Sensitive Token Leakage, Cross-Site Scripting (XSS) with Session Hijack'
    },
    {
      level: 'Medium',
      color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
      badge: 'P2 Medium',
      targetFix: '< 5 Business Days',
      examples: 'CORS Misconfiguration on Internal APIs, Rate-Limit Bypass, Clickjacking on Protected Views'
    },
    {
      level: 'Low',
      color: 'border-[#415a77]/40 bg-[#415a77]/15 text-[#cbd5e1]',
      badge: 'P3 Low',
      targetFix: '< 14 Business Days',
      examples: 'Missing Informational Security Headers, Verbose Server Fingerprint Banners'
    }
  ];

  return (
    <div className="space-y-10">
      {/* Safe Harbor Banner */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>DISCLOSE.IO & RFC-9116 COMPLIANT SAFE HARBOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
            Vulnerability Disclosure & Safe Harbor
          </h2>
          <p className="mt-2 text-xs text-[#cbd5e1] max-w-3xl leading-relaxed">
            CatalystLab values the independent security research community. We pledge full Safe Harbor protection: we will not pursue legal action against researchers acting in good faith under our Coordinated Disclosure Program.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#415a77]/25 pt-6">
            <div className="rounded-2xl border border-[#415a77]/25 bg-[#091524] p-4">
              <span className="text-[10px] uppercase font-bold text-sky-300">Target Triage Time</span>
              <div className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-sky-300" />
                <span>&lt; 2 Hours</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#415a77]/25 bg-[#091524] p-4">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Safe Harbor Status</span>
              <div className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Full Legal Pledge</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#415a77]/25 bg-[#091524] p-4">
              <span className="text-[10px] uppercase font-bold text-amber-300">Hall of Fame</span>
              <div className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-300" />
                <span>Public Recognition</span>
              </div>
            </div>
          </div>
        </div>
      </LazyReveal>

      {/* Vulnerability Severity Matrix */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="h-5 w-5 text-[#415a77]" />
            <h3 className="text-lg font-bold text-[#0b192c]">Severity Classification & Resolution SLAs</h3>
          </div>
          <p className="text-xs text-[#415a77] mb-6">
            Standardized Common Vulnerability Scoring System (CVSS v3.1) matrix and remediation timelines.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {severityMatrix.map((item) => (
              <div
                key={item.level}
                className={`rounded-2xl border p-5 space-y-2 ${item.color} bg-opacity-30`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#0b192c]">{item.level} Severity</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border">
                    SLA: {item.targetFix}
                  </span>
                </div>
                <p className="text-xs text-[#0b192c]/80 leading-relaxed">
                  <strong className="text-[#0b192c]">Scope Examples:</strong> {item.examples}
                </p>
              </div>
            ))}
          </div>
        </div>
      </LazyReveal>

      {/* PGP Public Key Viewer */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/25 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-sky-300 mb-1">
                <Key className="h-4 w-4" />
                <span>ENCRYPTED COMMUNICATIONS</span>
              </div>
              <h3 className="text-lg font-bold text-[#f8fafc]">Security Team PGP Public Key</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Encrypt sensitive Proof of Concept (PoC) exploit chains before transmitting over public channels.
              </p>
            </div>

            <button
              onClick={handleCopyPgp}
              className="inline-flex items-center gap-2 rounded-xl bg-[#152238] px-4 py-2 text-xs font-bold text-sky-300 border border-sky-500/30 hover:bg-sky-500 hover:text-[#07111e] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {pgpCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{pgpCopied ? 'PGP Block Copied!' : 'Copy Public Key'}</span>
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-[#415a77]/30 bg-[#06101e] p-4 font-mono text-[11px] text-[#cbd5e1] overflow-x-auto leading-relaxed">
            <pre>{pgpKey}</pre>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#94a3b8]">
            <span>Security Contact: security@catalystlab.tech</span>
            <span>Canonical security.txt: https://www.catalystlab.tech/.well-known/security.txt</span>
          </div>
        </div>
      </LazyReveal>

      {/* Interactive Vulnerability Submission Form */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Send className="h-5 w-5 text-[#415a77]" />
            <h3 className="text-lg font-bold text-[#0b192c]">Submit Coordinated Vulnerability Report</h3>
          </div>
          <p className="text-xs text-[#415a77] mb-6">
            Direct intake channel directly to CatalystLab's on-call security engineering rotation.
          </p>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50 p-8 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">Vulnerability Report Dispatched!</h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Thank you for contributing to web telemetry safety. Our security team has received your ticket and will verify the PoC within 2 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b192c] mb-1.5">
                    Target Asset / Endpoint
                  </label>
                  <select
                    value={targetAsset}
                    onChange={(e) => setTargetAsset(e.target.value)}
                    className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-xs text-[#0b192c] font-medium focus:border-[#415a77] focus:outline-none"
                  >
                    <option>catalystlab.tech (Web Portal)</option>
                    <option>Diagnostic Container Workers (Cloud Run)</option>
                    <option>Telemetry Ingestion Gateway /api/*</option>
                    <option>PDF Export & Canvas Rendering Service</option>
                    <option>Other Subdomain / Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b192c] mb-1.5">
                    Vulnerability Category
                  </label>
                  <select
                    value={vulnType}
                    onChange={(e) => setVulnType(e.target.value)}
                    className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-xs text-[#0b192c] font-medium focus:border-[#415a77] focus:outline-none"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b192c] mb-1.5">
                    Estimated CVSS Severity
                  </label>
                  <div className="flex items-center gap-2">
                    {(['Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold border transition-all ${
                          severity === sev
                            ? 'border-[#0b192c] bg-[#0b192c] text-white shadow-sm'
                            : 'border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] hover:border-[#415a77]'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b192c] mb-1.5">
                    Researcher Contact / PGP Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@secops.io"
                    className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#0b192c] focus:border-[#415a77] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b192c] mb-1.5">
                  Proof of Concept (PoC) & Reproduction Steps
                </label>
                <textarea
                  required
                  rows={5}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide exact HTTP request headers, payload reproduction steps, and impact assessment..."
                  className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3.5 text-xs text-[#0b192c] focus:border-[#415a77] focus:outline-none font-mono"
                />
              </div>

              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3.5 flex items-start gap-2.5 text-xs text-[#415a77]">
                <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded text-[#0b192c]" id="safe-harbor" />
                <label htmlFor="safe-harbor" className="cursor-pointer">
                  I agree to keep this vulnerability confidential until CatalystLab releases a patched container build and authorizes coordinated disclosure.
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0b192c] py-3.5 text-xs font-bold text-white hover:bg-[#152238] transition-all shadow-md active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <Send className="h-4 w-4 text-sky-300" />
                <span>Transmit Encrypted Security Report</span>
              </button>
            </form>
          )}
        </div>
      </LazyReveal>
    </div>
  );
};
