import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Terminal, Code, Cpu, ShieldCheck, Globe, Leaf, Zap, ArrowRight, ExternalLink } from 'lucide-react';

export const DocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'api' | 'engines' | 'webhooks'>('overview');

  const engines = [
    {
      id: 'health',
      name: 'Website Health & DOM Engine',
      desc: 'Inspects DOM tree depth (≤32 levels target), node count, resource preconnects, and scripts blocking rendering.',
      route: '/health',
      icon: 'health_and_safety',
    },
    {
      id: 'ai-readiness',
      name: 'AI Readiness & llms.txt Inspector',
      desc: 'Validates /llms.txt, /llms-full.txt, robots.txt crawler access (GPTBot, ClaudeBot, Perplexity), and structured JSON-LD schemas.',
      route: '/ai-readiness',
      icon: 'psychology',
    },
    {
      id: 'repo-scanner',
      name: 'Repository Hygiene & SecOps',
      desc: 'Evaluates GitHub/GitLab repository structure, open-source license compliance, SECURITY.md policies, and active maintenance.',
      route: '/repo-scanner',
      icon: 'inventory_2',
    },
    {
      id: 'latency',
      name: 'Global Edge Latency Radar',
      desc: 'Measures multi-region Time-to-First-Byte (TTFB), DNS resolution latency, and TLS handshake metrics across 12 global PoPs.',
      route: '/latency',
      icon: 'public',
    },
    {
      id: 'eco-audit',
      name: 'Eco-Carbon & Green Hosting Audit',
      desc: 'Calculates CO2 emissions per page view, estimates annual grid load, and validates Green Web Foundation certified hosting.',
      route: '/eco-audit',
      icon: 'eco',
    },
    {
      id: 'compliance',
      name: 'Compliance & Risk Mitigation',
      desc: 'Audits WCAG 2.2 AA accessibility, GDPR/CCPA cookie consent banners, and OWASP cryptographic security headers.',
      route: '/compliance',
      icon: 'shield',
    },
    {
      id: 'llmo',
      name: 'AI Search Optimization (LLMO)',
      desc: 'Measures semantic citation readiness, AI content extractability, entity graph depth, and brand authority for generative answer engines.',
      route: '/llmo',
      icon: 'smart_toy',
    },
    {
      id: 'migration',
      name: 'Platform Migration Risk Audit',
      desc: 'Evaluates architectural debt, legacy framework migration readiness, CDN compatibility, and headless re-platforming risk.',
      route: '/migration',
      icon: 'transform',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-[#e2e8f0] bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-xs font-semibold text-[#415a77] mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Developer Documentation & Specifications</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b192c] sm:text-5xl">
            CatalystLab Architecture & API Docs
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#415a77] sm:text-base">
            Technical guides, metric telemetry formulas, and programmatic integration docs for the 8 diagnostic engines.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-8 flex justify-center gap-2 border-b border-[#e2e8f0] pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#0b192c] text-[#f8fafc] font-bold shadow-md'
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]'
              }`}
            >
              System Overview
            </button>
            <button
              onClick={() => setActiveTab('engines')}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'engines'
                  ? 'bg-[#0b192c] text-[#f8fafc] font-bold shadow-md'
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]'
              }`}
            >
              8 Diagnostic Engines
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'api'
                  ? 'bg-[#0b192c] text-[#f8fafc] font-bold shadow-md'
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]'
              }`}
            >
              REST API & CLI
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'webhooks'
                  ? 'bg-[#0b192c] text-[#f8fafc] font-bold shadow-md'
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]'
              }`}
            >
              CI/CD Webhooks
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-2xl">
              <h2 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
                <Cpu className="h-5 w-5 text-[#c5d3e8]" />
                <span>Multi-Dimensional Audit Pipeline Architecture</span>
              </h2>
              <p className="mt-3 text-sm text-[#c5d3e8] leading-relaxed">
                CatalystLab orchestrates synchronous telemetry probes across 8 isolated audit engines written in TypeScript and Python. When an audit is triggered for a target URL or repository, the engine executes asynchronous HTTP stream inspections, header validation, DOM tree traversal, SSL handshake timing, and LLM indexing verification.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-[#415a77]/40 bg-[#152238] p-5 shadow-inner">
                  <div className="text-2xl font-extrabold text-[#c5d3e8]">100 / 100</div>
                  <div className="text-xs font-semibold text-[#f8fafc] mt-1">Catalyst Health Score</div>
                  <div className="text-[11px] text-[#c5d3e8]/70 mt-0.5">Normalized weighted geometric mean</div>
                </div>
                <div className="rounded-2xl border border-[#415a77]/40 bg-[#152238] p-5 shadow-inner">
                  <div className="text-2xl font-extrabold text-[#f8fafc]">&lt; 350 ms</div>
                  <div className="text-xs font-semibold text-[#f8fafc] mt-1">Global TTFB Target</div>
                  <div className="text-[11px] text-[#c5d3e8]/70 mt-0.5">Measured across 12 edge PoPs</div>
                </div>
                <div className="rounded-2xl border border-[#415a77]/40 bg-[#152238] p-5 shadow-inner">
                  <div className="text-2xl font-extrabold text-[#c5d3e8]">AA Standard</div>
                  <div className="text-xs font-semibold text-[#f8fafc] mt-1">WCAG 2.2 Accessibility</div>
                  <div className="text-[11px] text-[#c5d3e8]/70 mt-0.5">Automated color contrast & ARIA check</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-2xl">
              <h3 className="text-lg font-bold text-[#f8fafc] mb-4">Quick Navigation & Tool Index</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {engines.slice(0, 4).map((eng) => (
                  <Link
                    key={eng.id}
                    to={eng.route}
                    className="flex items-center justify-between rounded-2xl border border-[#415a77]/40 bg-[#152238] p-4 transition-all hover:border-[#c5d3e8] hover:bg-[#1f314d]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl text-[#c5d3e8]">{eng.icon}</span>
                      <span className="text-sm font-semibold text-[#f8fafc]">{eng.name}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#c5d3e8]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engines' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {engines.map((eng) => (
              <div key={eng.id} className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-7 text-[#f8fafc] flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-2xl text-[#c5d3e8]">{eng.icon}</span>
                    <h3 className="text-base font-bold text-[#f8fafc]">{eng.name}</h3>
                  </div>
                  <p className="text-xs text-[#c5d3e8] leading-relaxed">{eng.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#415a77]/30">
                  <Link
                    to={eng.route}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c5d3e8] hover:text-[#f8fafc] transition-colors"
                  >
                    <span>Launch Dedicated Tool</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-2xl">
              <h2 className="text-lg font-bold text-[#f8fafc] flex items-center gap-2 mb-2">
                <Terminal className="h-5 w-5 text-[#c5d3e8]" />
                <span>Trigger Scan via REST API</span>
              </h2>
              <p className="text-xs text-[#c5d3e8] mb-4">
                Execute programmatic audits from terminal scripts or CI pipelines by POSTing to the CatalystLab engine endpoint.
              </p>

              <div className="rounded-2xl border border-[#415a77]/40 bg-[#152238] p-5 font-mono text-xs text-[#f8fafc] overflow-x-auto shadow-inner">
                <div className="text-[#c5d3e8]/70 mb-2"># Execute 8-Engine Master Audit via cURL</div>
                <div className="text-[#c5d3e8] font-bold">curl -X POST https://www.catalystlab.tech/api/run-engine \</div>
                <div className="pl-4 text-[#ebe9e6]">-H "Content-Type: application/json" \</div>
                <div className="pl-4 text-[#ebe9e6]">-d '{JSON.stringify({ engine: "all", url: "https://example.com" }, null, 2)}'</div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-2xl">
              <h3 className="text-base font-bold text-[#f8fafc] mb-2">Sample JSON Response Schema</h3>
              <div className="rounded-2xl border border-[#415a77]/40 bg-[#152238] p-5 font-mono text-xs text-[#c5d3e8] overflow-x-auto max-h-72 shadow-inner">
{`{
  "status": "success",
  "domain": "example.com",
  "timestamp": 1787003910328,
  "scores": {
    "overall": 94,
    "webVitals": 96,
    "security": 92,
    "aiReadiness": 98,
    "accessibility": 95,
    "ecoCarbon": 88
  },
  "metrics": {
    "ttfbMs": 142,
    "domNodes": 380,
    "maxDomDepth": 14,
    "hstsActive": true,
    "llmsTxtFound": true
  }
}`}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#f8fafc] flex items-center gap-2 mb-2">
                <Code className="h-5 w-5 text-[#c5d3e8]" />
                <span>GitHub Actions CI/CD Quality Gate</span>
              </h2>
              <p className="text-xs text-[#c5d3e8] leading-relaxed">
                Automatically fail pull requests if DOM depth exceeds limits or OWASP security headers are missing in staging deployments.
              </p>
            </div>

            <div className="rounded-2xl border border-[#415a77]/40 bg-[#152238] p-5 font-mono text-xs text-[#f8fafc] overflow-x-auto shadow-inner">
{`name: CatalystLab Web Quality Gate
on: [push, pull_request]

jobs:
  telemetry-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger CatalystLab Diagnostic Scan
        run: |
          curl -f -X POST https://www.catalystlab.tech/api/run-engine \\
            -H "Content-Type: application/json" \\
            -d '{"engine":"compliance","url":"\${{ secrets.STAGING_URL }}"}'`}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default DocsPage;

