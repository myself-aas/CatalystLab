import React, { useState } from 'react';
import { Copy, Check, Maximize2, Minimize2, Code2, Terminal, ShieldCheck, BadgeCheck } from 'lucide-react';

interface TerminalOutputProps {
  title?: string;
  engine?: string;
  icon?: string;
  output: string;
  loading?: boolean;
  statusText?: string;
  maxHeight?: string;
  onCopy?: () => void;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  title = 'Terminal Output',
  engine = 'health',
  icon = 'bolt',
  output,
  loading = false,
  statusText,
  maxHeight = 'max-h-72',
  onCopy
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'remediation' | 'badge'>('terminal');
  const [snippetFramework, setSnippetFramework] = useState<'nextjs' | 'nginx' | 'caddy' | 'vercel'>('nextjs');

  const handleCopy = (textToCopy?: string) => {
    const text = textToCopy || (activeTab === 'remediation' ? getRemediationSnippet(snippetFramework) : activeTab === 'badge' ? getBadgeSnippet() : output);
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const getBadgeSnippet = () => {
    return `[![CatalystLab Telemetry Health](https://www.catalystlab.tech/api/badge?domain=catalystlab.tech&score=98)](https://www.catalystlab.tech/)`;
  };

  const getRemediationSnippet = (framework: 'nextjs' | 'nginx' | 'caddy' | 'vercel') => {
    switch (framework) {
      case 'nextjs':
        return `// next.config.js - Remediation for OWASP Headers & Security\nmodule.exports = {\n  async headers() {\n    return [\n      {\n        source: '/:path*',\n        headers: [\n          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },\n          { key: 'X-Content-Type-Options', value: 'nosniff' },\n          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },\n          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },\n          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }\n        ]\n      }\n    ];\n  }\n};`;
      case 'nginx':
        return `# /etc/nginx/conf.d/catalyst-security.conf\nserver {\n    listen 443 ssl http2;\n    server_name example.com;\n\n    # OWASP Recommended Security Headers\n    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;\n    add_header X-Content-Type-Options "nosniff" always;\n    add_header X-Frame-Options "SAMEORIGIN" always;\n    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n    add_header Content-Security-Policy "default-src 'self' https: data:; img-src 'self' data: https:;" always;\n\n    # Compression & Latency Optimization\n    gzip on;\n    gzip_types text/plain text/css application/json application/javascript text/xml;\n}`;
      case 'caddy':
        return `# Caddyfile Security & Header Hardening\nexample.com {\n    header {\n        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"\n        X-Content-Type-Options "nosniff"\n        X-Frame-Options "SAMEORIGIN"\n        Referrer-Policy "strict-origin-when-cross-origin"\n        Content-Security-Policy "default-src 'self' https: data:;"\n    }\n    encode zstd gzip\n}`;
      case 'vercel':
        return `{\n  "headers": [\n    {\n      "source": "/(.*)",\n      "headers": [\n        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },\n        { "key": "X-Content-Type-Options", "value": "nosniff" },\n        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },\n        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }\n      ]\n    }\n  ]\n}`;
    }
  };

  const formatTerminalText = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let colorClass = 'text-[#d6e2f0]';

      if (line.includes('[+] PASS:') || line.includes('STATUS: OPTIMAL') || line.includes('STATUS: EXCELLENT') || line.includes('STATUS: FULLY COMPATIBLE') || line.includes('STATUS: PRODUCTION-READY') || line.includes('STATUS: COMPLIANT')) {
        colorClass = 'text-emerald-400 font-medium';
      } else if (line.includes('[-] FAIL:') || line.includes('[!] CRITICAL:') || line.includes('[!] HIGH RISK:') || line.includes('STATUS: CRITICAL') || line.includes('STATUS: INVISIBLE') || line.includes('STATUS: HIGH LIABILITY') || line.includes('STATUS: AT RISK')) {
        colorClass = 'text-rose-400 font-bold';
      } else if (line.includes('[~] WARNING:') || line.includes('STATUS: MODERATE') || line.includes('STATUS: PARTIAL') || line.includes('STATUS: WARNING') || line.includes('STATUS: FAIR')) {
        colorClass = 'text-amber-300 font-medium';
      } else if (line.startsWith('[sys]') || line.startsWith('[*]')) {
        colorClass = 'text-[#c5d3e8] font-semibold';
      } else if (line.startsWith('===') || line.startsWith('---')) {
        colorClass = 'text-[#415a77] font-bold';
      }

      return (
        <div key={idx} className={`${colorClass} leading-relaxed break-words`}>
          {line || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col rounded-xl border border-[#415a77]/40 bg-[#0b192c] shadow-xl overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-[#415a77]/30 bg-[#0d1b2a] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-[#152238] rounded-lg p-0.5 border border-[#415a77]/40">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                activeTab === 'terminal' ? 'bg-[#0b192c] text-[#f8fafc] shadow-sm' : 'text-[#c5d3e8] hover:text-[#f8fafc]'
              }`}
            >
              <Terminal className="h-3 w-3" />
              <span>Telemetry Trace</span>
            </button>
            <button
              onClick={() => setActiveTab('remediation')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                activeTab === 'remediation' ? 'bg-[#0b192c] text-[#f8fafc] shadow-sm' : 'text-[#c5d3e8] hover:text-[#f8fafc]'
              }`}
            >
              <Code2 className="h-3 w-3 text-sky-400" />
              <span>Remediation Snippets</span>
            </button>
            <button
              onClick={() => setActiveTab('badge')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                activeTab === 'badge' ? 'bg-[#0b192c] text-[#f8fafc] shadow-sm' : 'text-[#c5d3e8] hover:text-[#f8fafc]'
              }`}
            >
              <BadgeCheck className="h-3 w-3 text-emerald-400" />
              <span>Embed Badge</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <span className="flex items-center gap-1.5 text-xs text-[#c5d3e8]">
              <span className="h-2 w-2 rounded-full bg-[#c5d3e8] animate-ping" />
              <span className="hidden sm:inline">Executing...</span>
            </span>
          )}

          <button
            onClick={() => handleCopy()}
            className="flex items-center gap-1 rounded bg-[#152238] border border-[#415a77]/40 px-2 py-1 text-xs text-[#c5d3e8] hover:bg-[#1f314d] hover:text-[#f8fafc] transition-colors"
            title="Copy current tab content"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-[#c5d3e8]" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1 text-[#c5d3e8] hover:bg-[#152238] hover:text-[#f8fafc] transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Remediation Framework Sub-header */}
      {activeTab === 'remediation' && (
        <div className="flex items-center justify-between border-b border-[#415a77]/30 bg-[#0b192c] px-4 py-2 text-xs">
          <span className="text-[#c5d3e8] font-mono">Target Web Framework / Server:</span>
          <div className="flex gap-1.5">
            {(['nextjs', 'nginx', 'caddy', 'vercel'] as const).map((fw) => (
              <button
                key={fw}
                onClick={() => setSnippetFramework(fw)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold transition-colors ${
                  snippetFramework === fw ? 'bg-sky-500 text-white' : 'bg-[#152238] text-[#c5d3e8] hover:text-white'
                }`}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Terminal / Content Body */}
      <div
        className={`p-4 font-mono text-xs overflow-y-auto bg-[#07111e] selection:bg-[#415a77]/40 ${
          expanded ? 'max-h-[600px]' : maxHeight
        }`}
      >
        {activeTab === 'terminal' ? (
          loading && !output ? (
            <div className="space-y-2 py-4">
              <div className="text-[#c5d3e8] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span>{statusText || 'Initializing diagnostic container and dispatching telemetry trace...'}</span>
              </div>
              <div className="text-[#415a77] animate-pulse">Tracing socket connections, DOM depth, and headers...</div>
            </div>
          ) : output ? (
            formatTerminalText(output)
          ) : (
            <div className="text-[#415a77] italic">Awaiting target initialization...</div>
          )
        ) : activeTab === 'remediation' ? (
          <pre className="text-sky-300 leading-relaxed overflow-x-auto whitespace-pre font-mono">
            {getRemediationSnippet(snippetFramework)}
          </pre>
        ) : (
          <div className="space-y-4 py-2">
            <div className="text-[#c5d3e8]">
              Embed your live CatalystLab verified health badge in your GitHub repository <code className="text-emerald-400 font-mono">README.md</code> or documentation:
            </div>
            <div className="p-3 bg-[#0b192c] rounded-lg border border-[#415a77]/40 flex items-center gap-4">
              <img
                src="https://www.catalystlab.tech/api/badge?domain=catalystlab.tech&score=98"
                alt="CatalystLab Health"
                className="h-7"
                onError={(e) => {
                  // Fallback visual simulation for preview container
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-xs text-[#c5d3e8] font-mono">Live SVG Status Badge</span>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-[#c5d3e8] mb-1">Markdown:</div>
              <pre className="p-2.5 rounded bg-[#0d1b2a] text-emerald-300 border border-[#415a77]/30 text-[11px] overflow-x-auto">
                {getBadgeSnippet()}
              </pre>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-[#c5d3e8] mb-1">HTML:</div>
              <pre className="p-2.5 rounded bg-[#0d1b2a] text-sky-300 border border-[#415a77]/30 text-[11px] overflow-x-auto">
                {`<a href="https://www.catalystlab.tech/"><img src="https://www.catalystlab.tech/api/badge?domain=catalystlab.tech&score=98" alt="CatalystLab Telemetry Health" /></a>`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
