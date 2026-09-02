import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Lock, Server } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const SecurityDoc: React.FC = () => {
  const toc = [
    { id: 'zero-trust-model', title: 'Zero-Trust Sandbox Model' },
    { id: 'ssrf-protection', title: 'SSRF & Address Verification' },
    { id: 'command-injection', title: 'Shell Escape Sanitization' },
    { id: 'owasp-hardening', title: 'OWASP Security Headers' },
  ];

  return (
    <DocsLayout
      title="Zero-Trust Probe Sandbox & Security"
      description="SSRF mitigation, CLI injection protection, memory buffer limits, and OWASP response header hardening."
      canonicalPath="/docs/security-sandbox"
      toc={toc}
    >
      <section id="zero-trust-model" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Security & Ingress Protection</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b192c] tracking-tight">
          Zero-Trust Probe Sandbox
        </h1>
        <p className="text-base text-[#415a77] leading-relaxed">
          To guarantee absolute security when analyzing arbitrary public URLs, all network requests and subprocess invocations are strictly sanitized against server-side request forgery (SSRF), command injection, and resource exhaustion.
        </p>

        <ul className="space-y-3 text-sm text-[#415a77] mt-4">
          <li className="flex items-start gap-2.5 rounded-xl border border-[#e2e8f0] bg-background p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0b192c]">Shell Escape Sanitization:</strong> All user-supplied URLs are scrubbed via <code>replace(/(["\\$`])/g, '\\$1')</code> before child process instantiation to eliminate CLI injection vectors.
            </div>
          </li>
          <li className="flex items-start gap-2.5 rounded-xl border border-[#e2e8f0] bg-background p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0b192c]">Memory & Buffer Caps:</strong> Execution buffers are restricted to a maximum of 5MB per audit stream with 40,000ms hard process timeouts.
            </div>
          </li>
          <li className="flex items-start gap-2.5 rounded-xl border border-[#e2e8f0] bg-background p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0b192c]">OWASP Header Hardening:</strong> Built-in response headers enforce <code>Strict-Transport-Security: max-age=63072000; includeSubDomains; preload</code> and strict CSP rules.
            </div>
          </li>
        </ul>
      </section>

      {/* SSRF Protection */}
      <section id="ssrf-protection" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">SSRF & Private IP Blocking</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          The API Gateway blocks requests to private IPv4/IPv6 ranges (e.g. <code>127.0.0.1</code>, <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>, and AWS/GCP metadata IP <code>169.254.169.254</code>) to ensure workers cannot probe internal cluster resources.
        </p>

        <CodeSnippet
          title="SSRF Validation Routine (TypeScript)"
          language="typescript"
          code={`function validateTargetUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    
    // Prevent internal loopback / metadata / LAN IPs
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname === '169.254.169.254'
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}`}
        />
      </section>

      {/* Command Injection */}
      <section id="command-injection" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">CLI Command Injection Prevention</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          All subprocess calls invoke parameter arrays directly or escape characters when executing Python scripts. No raw string interpolation is passed to the system shell.
        </p>
      </section>

      {/* OWASP Hardening */}
      <section id="owasp-hardening" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">OWASP Security Headers Implemented</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Every HTTP response emitted by CatalystLab carries hardened headers to prevent clickjacking, MIME-sniffing, and cross-site scripting:
        </p>

        <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-background">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
              <tr>
                <th className="py-2 px-3">Header Name</th>
                <th className="py-2 px-3">Production Value</th>
                <th className="py-2 px-3">Protection Vector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
              <tr>
                <td className="py-2 px-3 font-mono font-semibold">Strict-Transport-Security</td>
                <td className="py-2 px-3 font-mono text-xs text-sky-700">max-age=63072000; includeSubDomains; preload</td>
                <td className="py-2 px-3 text-[#64748b]">Forces HTTPS across all subdomains for 2 years</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold">X-Content-Type-Options</td>
                <td className="py-2 px-3 font-mono text-xs text-sky-700">nosniff</td>
                <td className="py-2 px-3 text-[#64748b]">Prevents browser MIME-type sniffing exploits</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold">X-Frame-Options</td>
                <td className="py-2 px-3 font-mono text-xs text-sky-700">SAMEORIGIN</td>
                <td className="py-2 px-3 text-[#64748b]">Blocks malicious clickjacking frames</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold">Referrer-Policy</td>
                <td className="py-2 px-3 font-mono text-xs text-sky-700">strict-origin-when-cross-origin</td>
                <td className="py-2 px-3 text-[#64748b]">Shields user privacy in outgoing referrers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </DocsLayout>
  );
};
export default SecurityDoc;
