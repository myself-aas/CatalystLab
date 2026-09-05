import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Check, Copy, AlertTriangle, Lock, Key } from 'lucide-react';

interface OWASPSecurityMatrixChartProps {
  hsts: boolean;
  csp: boolean;
  xFrameOptions: boolean;
  referrerPolicy: boolean;
  permissionsPolicy: boolean;
  riskCount: number;
  score: number;
}

export const OWASPSecurityMatrixChart: React.FC<OWASPSecurityMatrixChartProps> = React.memo(({
  hsts,
  csp,
  xFrameOptions,
  referrerPolicy,
  permissionsPolicy,
  riskCount: _riskCount,
  score
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [snippetFormat, setSnippetFormat] = useState<'vercel' | 'nginx' | 'caddy'>('vercel');

  const headersList = [
    {
      name: 'Strict-Transport-Security (HSTS)',
      present: hsts,
      severity: 'Critical',
      desc: 'Enforces HTTPS encryption and prevents SSL-stripping downgrade attacks.',
      recommended: 'max-age=63072000; includeSubDomains; preload'
    },
    {
      name: 'Content-Security-Policy (CSP)',
      present: csp,
      severity: 'Critical',
      desc: 'Restricts script execution sources to neutralize Cross-Site Scripting (XSS).',
      recommended: "default-src 'self'; script-src 'self' 'nonce-...' https:"
    },
    {
      name: 'X-Frame-Options',
      present: xFrameOptions,
      severity: 'High',
      desc: 'Prevents unauthorized embedding in iframes to protect against Clickjacking.',
      recommended: 'DENY'
    },
    {
      name: 'Referrer-Policy',
      present: referrerPolicy,
      severity: 'Medium',
      desc: 'Protects user privacy by controlling how much referrer metadata is sent.',
      recommended: 'strict-origin-when-cross-origin'
    },
    {
      name: 'Permissions-Policy',
      present: permissionsPolicy,
      severity: 'Medium',
      desc: 'Disables unused browser hardware APIs (camera, microphone, geolocation).',
      recommended: 'camera=(), microphone=(), geolocation=()'
    },
    {
      name: 'X-Content-Type-Options',
      present: true,
      severity: 'Medium',
      desc: 'Prevents MIME-type sniffing by browsers.',
      recommended: 'nosniff'
    }
  ];

  const passedCount = headersList.filter(h => h.present).length;
  const totalHeaders = headersList.length;
  const compliancePct = Math.round((passedCount / totalHeaders) * 100);

  const getVercelConfig = () => {
    return JSON.stringify({
      headers: [
        {
          source: "/(.*)",
          headers: [
            { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
          ]
        }
      ]
    }, null, 2);
  };

  const getNginxConfig = () => {
    return `# OWASP Hardened Headers for Nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;`;
  };

  const getCaddyConfig = () => {
    return `# Caddyfile Hardened Headers
header {
    Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    X-Frame-Options "DENY"
    X-Content-Type-Options "nosniff"
    Referrer-Policy "strict-origin-when-cross-origin"
    Permissions-Policy "camera=(), microphone=(), geolocation=()"
}`;
  };

  const currentSnippet = snippetFormat === 'vercel' ? getVercelConfig() : snippetFormat === 'nginx' ? getNginxConfig() : getCaddyConfig();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-black/30 bg-background p-6 shadow-xl space-y-6 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/25 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/25 text-muted-foreground border border-black/40">
              <Lock className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-foreground">
              OWASP Top 10 Security Headers Matrix
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Zero-Trust HTTP response header audit against MITM, Clickjacking, and Cross-Site Scripting (XSS).
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-muted-foreground">Security Index</div>
            <div className="text-xl font-black text-emerald-400 font-mono">{score}/100</div>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
            score >= 80 ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400' : 'border-black/40 bg-foreground/25 text-muted-foreground'
          }`}>
            {score >= 80 ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
        </div>
      </div>

      {/* Compliance Meter */}
      <div className="rounded-xl border border-black/30 bg-background p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-foreground">OWASP Hardening Coverage ({passedCount}/{totalHeaders} Passed)</span>
          <span className="font-mono font-bold text-emerald-400">{compliancePct}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-background overflow-hidden border border-black/30">
          <div
            className={`h-full transition-all ${
              compliancePct >= 80 ? 'bg-emerald-400' : compliancePct >= 50 ? 'bg-primary' : 'bg-rose-500'
            }`}
            style={{ width: `${compliancePct}%` }}
          />
        </div>
      </div>

      {/* Interactive Headers Table */}
      <div className="overflow-x-auto scrollbar-none touch-pan-x rounded-xl border border-black/30 bg-background">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-black/25 bg-background font-semibold text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Security Header Directive</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 hidden md:table-cell">Protection Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/20 text-foreground">
            {headersList.map((header) => (
              <tr key={header.name} className="hover:bg-background/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <td className="px-4 py-3 font-mono font-semibold text-foreground">
                  <div>{header.name}</div>
                  <div className="text-[11px] text-muted-foreground font-sans md:hidden mt-0.5">{header.desc}</div>
                </td>
                <td className="px-4 py-3 shrink-0">
                  {header.present ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                      <Check className="h-3 w-3" /> ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/30">
                      <AlertTriangle className="h-3 w-3" /> MISSING
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {header.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Remediation Snippet */}
      <div className="rounded-xl border border-black/30 bg-background p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-bold text-foreground">One-Click Remediation Blueprint</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-background p-0.5 border border-black/30 text-[11px]">
              <button
                onClick={() => setSnippetFormat('vercel')}
                className={`rounded px-2.5 py-1 font-semibold transition-colors ${snippetFormat === 'vercel' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                vercel.json
              </button>
              <button
                onClick={() => setSnippetFormat('nginx')}
                className={`rounded px-2.5 py-1 font-semibold transition-colors ${snippetFormat === 'nginx' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                nginx.conf
              </button>
              <button
                onClick={() => setSnippetFormat('caddy')}
                className={`rounded px-2.5 py-1 font-semibold transition-colors ${snippetFormat === 'caddy' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Caddyfile
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-black/40 bg-foreground/25 px-3 py-1 text-xs font-semibold text-foreground hover:bg-foreground/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <pre className="overflow-x-auto scrollbar-none touch-pan-x rounded-lg bg-background p-3.5 font-mono text-[11px] text-muted-foreground border border-black/30">
          <code>{currentSnippet}</code>
        </pre>
      </div>
    </div>
  );
});
