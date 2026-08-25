import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LazyReveal } from '../common/LazyAnimate';
import { TelemetryCard, type SubVectorItem } from '../ui/TelemetryCard';
import { CodeBlock } from '../ui/CodeBlock';
import { TiltCard } from '../media/TiltCard';
import { CinematicMedia } from '../media/CinematicMedia';
import {
  Activity,
  Cpu,
  ShieldCheck,
  Zap,
  Leaf,
  Globe,
  GitBranch,
  Terminal,
  Sparkles,
  Bot,
  Layers,
  ArrowRight,
  CheckCircle2,
  Filter,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export interface EnzymeDefinition {
  id: string;
  name: string;
  shortCode: string;
  category: 'Core' | 'Enterprise' | 'Developer & AI';
  role: string;
  score: number;
  themeColor: string;
  icon: React.ElementType;
  primaryMetric: {
    label: string;
    value: string | number;
    unit?: string;
    status: 'optimal' | 'pass' | 'warn' | 'fail';
    deltaText?: string;
  };
  subVectors: [
    SubVectorItem,
    SubVectorItem,
    SubVectorItem,
    SubVectorItem,
    SubVectorItem,
    SubVectorItem
  ];
  codeSnippet: {
    filename: string;
    language: string;
    code: string;
  };
  description: string;
  route: string;
}

export const ENZYME_CATALYSTS: EnzymeDefinition[] = [
  {
    id: 'health',
    name: 'VitalZyme',
    shortCode: 'ZYME',
    category: 'Core',
    role: 'Core Web Vitals & DOM Depth',
    score: 99,
    themeColor: '#06B6D4',
    icon: Activity,
    primaryMetric: {
      label: 'Edge TTFB & Server Latency',
      value: 18.4,
      unit: 'ms',
      status: 'optimal',
      deltaText: '76% Faster Edge Handshake',
    },
    subVectors: [
      { id: 'v1', name: 'DOM Tree Recursion Depth', value: 14, unit: 'levels', status: 'optimal', description: 'Maximum nesting depth of client DOM elements.', benchmark: '< 32' },
      { id: 'v2', name: 'Total DOM Node Volume', value: 420, unit: 'nodes', status: 'optimal', description: 'Total rendered elements parsed during critical path.', benchmark: '< 800' },
      { id: 'v3', name: 'Render-Blocking Stylesheets', value: 0, unit: 'blocks', status: 'optimal', description: 'Zero blocking CSS tags delaying first paint.', benchmark: '0' },
      { id: 'v4', name: 'Preload Resource Hints', value: '4/4', unit: 'active', status: 'optimal', description: 'Hero fonts and critical scripts preloaded via HTTP/2 push.', benchmark: '4/4' },
      { id: 'v5', name: 'Static Asset Cache-Control', value: '31536000s', unit: 'immutable', status: 'optimal', description: '1-year immutable caching for static hashes.', benchmark: '1 yr' },
      { id: 'v6', name: 'WCAG 2.2 Contrast Ratio', value: '7.2:1', unit: 'AAA', status: 'optimal', description: 'Meets highest AAA accessibility contrast standards.', benchmark: '> 4.5:1' },
    ],
    codeSnippet: {
      filename: 'vitalzyme.config.ts',
      language: 'typescript',
      code: `import { defineVitalZyme } from "@catalystlab/vitalzyme";

export default defineVitalZyme({
  target: "https://yourdomain.com",
  budgets: {
    ttfbMaxMs: 50,
    domDepthMax: 18,
    maxNodeCount: 600,
    wcagStandard: "AAA",
  },
  preload: {
    criticalFonts: ["/fonts/jetbrains-mono.woff2"],
    dnsPrefetch: ["https://api.catalystlab.tech"],
  },
});`,
    },
    description: 'Autonomous micro-engine measuring DOM tree recursion, render-blocking stylesheets, and edge server response times.',
    route: '/health',
  },
  {
    id: 'ai_ready',
    name: 'LLM-Kinase',
    shortCode: 'KINASE',
    category: 'Developer & AI',
    role: 'AI Discoverability & /llms.txt',
    score: 98,
    themeColor: '#C084FC',
    icon: Bot,
    primaryMetric: {
      label: 'Indexable AI RAG Tokens',
      value: '24.8k',
      unit: 'tokens',
      status: 'optimal',
      deltaText: '+42pt Context Extraction',
    },
    subVectors: [
      { id: 'v1', name: '/llms.txt Manifest Presence', value: 'Valid', unit: 'v1.0', status: 'optimal', description: 'Standardized AI search context manifest at root.', benchmark: 'Present' },
      { id: 'v2', name: '/llms-full.txt Context Corpus', value: '84.2kb', unit: 'raw text', status: 'optimal', description: 'Full context document for deep agentic reasoning.', benchmark: 'Present' },
      { id: 'v3', name: 'Schema.org JSON-LD Entities', value: 18, unit: 'graphs', status: 'optimal', description: 'Structured WebPage, TechArticle, and Organization schemas.', benchmark: '> 10' },
      { id: 'v4', name: 'GPTBot / ClaudeBot Crawl Policy', value: 'Allowed', unit: 'robots.txt', status: 'optimal', description: 'Unblocked indexing for frontier model knowledge agents.', benchmark: 'Allowed' },
      { id: 'v5', name: 'Markdown AST Cleanliness', value: '99.8%', unit: 'clean', status: 'optimal', description: 'Semantic markdown output with no boilerplate noise.', benchmark: '> 95%' },
      { id: 'v6', name: 'OpenGraph Meta Parity', value: '6/6', unit: 'complete', status: 'optimal', description: 'Rich preview cards formatted for Claude & Perplexity.', benchmark: '6/6' },
    ],
    codeSnippet: {
      filename: 'public/llms.txt',
      language: 'markdown',
      code: `# CatalystLab Telemetry Platform
> High-performance synchronous telemetry and autonomous web auditing OS.

## Core Capabilities
- 8 Synchronous SDLC Micro-Engines (VitalZyme, LLM-Kinase, RiskProtease)
- 42 Global Anycast Edge PoPs (< 20ms P95 latency)
- Zero-Agent Autonomous Diagnostic Remediation

## Canonical Documentation
- Architecture: https://catalystlab.tech/docs/architecture
- RFC Scoring: https://catalystlab.tech/docs/scoring-matrix`,
    },
    description: 'Verifies /llms.txt manifests, robots.txt bot directives, and Schema.org knowledge graphs for frontier LLM search engines.',
    route: '/ai-readiness',
  },
  {
    id: 'compliance',
    name: 'RiskProtease',
    shortCode: 'PROTEASE',
    category: 'Enterprise',
    role: 'OWASP Transport & Zero-Trust',
    score: 100,
    themeColor: '#F43F5E',
    icon: ShieldCheck,
    primaryMetric: {
      label: 'OWASP SecOps Transport Headers',
      value: '6/6',
      unit: 'Passed',
      status: 'optimal',
      deltaText: 'Zero-Trust Perimeter Active',
    },
    subVectors: [
      { id: 'v1', name: 'Strict-Transport-Security (HSTS)', value: '63072000s', unit: 'preload', status: 'optimal', description: '2-year HSTS enforcement with subdomains enabled.', benchmark: '63072000s' },
      { id: 'v2', name: 'Content-Security-Policy (CSP)', value: 'Strict Nonce', unit: 'v3', status: 'optimal', description: 'Zero inline scripts without cryptographically secure nonces.', benchmark: 'Enforced' },
      { id: 'v3', name: 'X-Content-Type-Options', value: 'nosniff', unit: 'active', status: 'optimal', description: 'Prevents MIME-sniffing attacks on client downloads.', benchmark: 'nosniff' },
      { id: 'v4', name: 'X-Frame-Options', value: 'DENY', unit: 'active', status: 'optimal', description: 'Zero clickjacking vulnerability; iframe embedding prohibited.', benchmark: 'DENY' },
      { id: 'v5', name: 'Referrer-Policy', value: 'strict-origin', unit: 'active', status: 'optimal', description: 'Restricts origin disclosure to secure HTTPS destinations.', benchmark: 'strict-origin' },
      { id: 'v6', name: 'Permissions-Policy', value: 'Lockdown', unit: '12 sensors', status: 'optimal', description: 'Blocks unauthorized camera, microphone, and geolocation access.', benchmark: 'Locked' },
    ],
    codeSnippet: {
      filename: 'nginx.security.conf',
      language: 'nginx',
      code: `# OWASP Zero-Trust Transport Security Headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-$request_id'; object-src 'none';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;`,
    },
    description: 'Enforces OWASP zero-trust transport protocols, strict Content-Security-Policies, and automated vulnerability mitigations.',
    route: '/compliance',
  },
  {
    id: 'eco',
    name: 'EcoHolo',
    shortCode: 'HOLO',
    category: 'Enterprise',
    role: 'Carbon Footprint & SWD v4',
    score: 94,
    themeColor: '#34D399',
    icon: Leaf,
    primaryMetric: {
      label: 'Estimated Carbon per Pageview',
      value: 0.12,
      unit: 'g CO2',
      status: 'optimal',
      deltaText: '78% Lower Emissions',
    },
    subVectors: [
      { id: 'v1', name: 'SWD v4 Model Score', value: '0.12g', unit: 'per view', status: 'optimal', description: 'Calculated using Sustainable Web Design v4 standard.', benchmark: '< 0.20g' },
      { id: 'v2', name: 'Green Web Foundation Host', value: 'Verified', unit: '100% Green', status: 'optimal', description: 'Hosting infrastructure powered by verified renewable energy.', benchmark: 'Verified' },
      { id: 'v3', name: 'Modern Media Compression', value: 'AVIF/WebP', unit: '100%', status: 'optimal', description: 'Zero uncompressed raster bitmaps served on critical paths.', benchmark: '100%' },
      { id: 'v4', name: 'Total Transfer Payload Budget', value: '410kb', unit: 'gzipped', status: 'optimal', description: 'Compressed asset payload across initial route render.', benchmark: '< 600kb' },
      { id: 'v5', name: 'Client JS CPU Power Budget', value: '38ms', unit: 'main-thread', status: 'optimal', description: 'Minimized CPU execution reducing client hardware battery drain.', benchmark: '< 100ms' },
      { id: 'v6', name: 'Dark Mode Battery Efficiency', value: '42%', unit: 'OLED saving', status: 'optimal', description: 'Deep dark backgrounds reducing OLED display power consumption.', benchmark: '> 30%' },
    ],
    codeSnippet: {
      filename: 'cloudflare.eco.js',
      language: 'javascript',
      code: `// Cloudflare Worker for Auto-Compressing AVIF & WebP
export default {
  async fetch(request, env) {
    const accept = request.headers.get("Accept") || "";
    const format = accept.includes("image/avif") ? "avif" : "webp";
    
    return fetch(request, {
      cf: {
        image: { format, quality: 82, compression: "fast" },
        cacheTtl: 31536000,
        cacheEverything: true,
      },
    });
  },
};`,
    },
    description: 'Calculates digital carbon emissions per 10k pageviews based on the Sustainable Web Design (SWD v4) model.',
    route: '/eco-audit',
  },
  {
    id: 'latency',
    name: 'EdgeVmax',
    shortCode: 'VMAX',
    category: 'Developer & AI',
    role: 'Global Edge Routing & Anycast',
    score: 96,
    themeColor: '#F472B6',
    icon: Globe,
    primaryMetric: {
      label: 'Global Edge P95 Latency',
      value: 14.2,
      unit: 'ms',
      status: 'optimal',
      deltaText: '42 Global Edge PoPs',
    },
    subVectors: [
      { id: 'v1', name: '42-Region Anycast Latency', value: '14.2ms', unit: 'P95', status: 'optimal', description: 'Edge response across US, Europe, Asia, and South America.', benchmark: '< 25ms' },
      { id: 'v2', name: 'TLS 1.3 0-RTT Resumption', value: '0-RTT', unit: 'active', status: 'optimal', description: 'Zero round-trip cryptographic session resumption.', benchmark: '0-RTT' },
      { id: 'v3', name: 'HTTP/3 QUIC Support', value: 'Enabled', unit: 'UDP/443', status: 'optimal', description: 'Head-of-line blocking eliminated over multiplexed streams.', benchmark: 'Enabled' },
      { id: 'v4', name: 'Edge CDN Cache Hit Ratio', value: '98.4%', unit: 'hit rate', status: 'optimal', description: 'Static assets served directly from local edge memory.', benchmark: '> 95%' },
      { id: 'v5', name: 'BGP Anycast Routing', value: 'Optimal', unit: '0 flap', status: 'optimal', description: 'Direct peering with tier-1 global transit providers.', benchmark: 'Optimal' },
      { id: 'v6', name: 'DNS Anycast Handshake', value: '4.8ms', unit: 'lookup', status: 'optimal', description: 'Sub-5ms multi-region authoritative DNS resolution.', benchmark: '< 10ms' },
    ],
    codeSnippet: {
      filename: 'edge.routing.ts',
      language: 'typescript',
      code: `import { EdgeRouter } from "@catalystlab/edgevmax";

export const router = new EdgeRouter({
  regions: ["iad1", "fra1", "nrt1", "sin1", "gru1", "lhr1"],
  protocol: "HTTP/3",
  zeroRttSessionResumption: true,
  cacheHeaderControl: "public, max-age=31536000, immutable",
  failoverThresholdMs: 40,
});`,
    },
    description: 'Benchmarks global edge routing, multi-region anycast DNS resolution, and TLS 1.3 0-RTT session resumption.',
    route: '/latency',
  },
  {
    id: 'repo',
    name: 'GitLygase',
    shortCode: 'LYGASE',
    category: 'Enterprise',
    role: 'Repository Hygiene & Branch CVEs',
    score: 98,
    themeColor: '#4ADE80',
    icon: GitBranch,
    primaryMetric: {
      label: 'Pre-Commit Secret Leaks',
      value: 0,
      unit: 'Detected',
      status: 'optimal',
      deltaText: 'Zero CVE Risk in Dependencies',
    },
    subVectors: [
      { id: 'v1', name: 'Open-Source License Check', value: 'MIT', unit: 'Compliant', status: 'optimal', description: 'Zero copyleft contamination in production bundle.', benchmark: 'Compliant' },
      { id: 'v2', name: 'SECURITY.md Policy', value: 'Present', unit: 'v2.4', status: 'optimal', description: 'Standardized vulnerability disclosure workflow.', benchmark: 'Present' },
      { id: 'v3', name: 'Automated Dependabot Fixes', value: 'Active', unit: 'Daily', status: 'optimal', description: 'Continuous CVE scanning across package dependencies.', benchmark: 'Active' },
      { id: 'v4', name: 'Branch Protection Rules', value: '2 Approvals', unit: 'enforced', status: 'optimal', description: 'Mandatory linear history and status check passes.', benchmark: 'Enforced' },
      { id: 'v5', name: 'Secret & Token Scanning', value: '0 Leaks', unit: 'clean', status: 'optimal', description: 'Pre-commit hook blocking AWS, OpenAI, and GitHub tokens.', benchmark: '0 Leaks' },
      { id: 'v6', name: 'CI/CD Pipeline Velocity', value: '1m 12s', unit: 'build time', status: 'optimal', description: 'Parallelized build and test test suites.', benchmark: '< 3 min' },
    ],
    codeSnippet: {
      filename: '.github/dependabot.yml',
      language: 'yaml',
      code: `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    commit-message:
      prefix: "security"`,
    },
    description: 'Inspects open-source repository hygiene, branch protection rules, license compliance, and secret token scanning.',
    route: '/repo-scanner',
  },
  {
    id: 'migration',
    name: 'SynthShift',
    shortCode: 'SYNTH',
    category: 'Core',
    role: 'Migration Parity & Route AST',
    score: 95,
    themeColor: '#FB923C',
    icon: Layers,
    primaryMetric: {
      label: 'Circular Redirect Loops',
      value: 0,
      unit: 'Detected',
      status: 'optimal',
      deltaText: '100% 301 Redirect Parity',
    },
    subVectors: [
      { id: 'v1', name: 'Site Topology Route Tree', value: '1,420', unit: 'routes', status: 'optimal', description: 'Complete AST map of all dynamic and static URLs.', benchmark: 'Mapped' },
      { id: 'v2', name: 'Canonical URL Synchronization', value: '100%', unit: 'parity', status: 'optimal', description: 'Zero mismatch between head canonical and real route.', benchmark: '100%' },
      { id: 'v3', name: '301 vs 302 Redirect Tree', value: '0 Temp', unit: 'permanent', status: 'optimal', description: 'All legacy links upgraded to permanent 301 redirects.', benchmark: '0 Temp' },
      { id: 'v4', name: 'OpenGraph Meta Blueprint', value: '100%', unit: 'preserved', status: 'optimal', description: 'Social cards and schema properties preserved in cutover.', benchmark: '100%' },
      { id: 'v5', name: 'Database Resource Allocation', value: 'Optimal', unit: 'balanced', status: 'optimal', description: 'Connection pooling and query latency verified.', benchmark: 'Optimal' },
      { id: 'v6', name: 'DNS Cutover TTL Readiness', value: '300s', unit: 'TTL', status: 'optimal', description: 'Low TTL set for zero-downtime traffic switchover.', benchmark: '< 600s' },
    ],
    codeSnippet: {
      filename: 'synthshift.redirects.json',
      language: 'json',
      code: `[
  {
    "source": "/legacy-docs/:slug",
    "destination": "/docs/:slug",
    "permanent": true,
    "preserveQuery": true
  },
  {
    "source": "/v1/api/:path*",
    "destination": "/api/v2/:path*",
    "permanent": true
  }
]`,
    },
    description: 'Ensures zero-downtime architecture migration parity, route hierarchy integrity, and automated 301 redirect matrices.',
    route: '/migration',
  },
  {
    id: 'llmo',
    name: 'AllosterSearch',
    shortCode: 'ALLOSTER',
    category: 'Core',
    role: 'Search Graph & Crawl Parity',
    score: 92,
    themeColor: '#FBBF24',
    icon: Sparkles,
    primaryMetric: {
      label: 'Crawl Budget Efficiency',
      value: '100%',
      unit: 'Indexable',
      status: 'optimal',
      deltaText: 'Zero Orphaned Routes',
    },
    subVectors: [
      { id: 'v1', name: 'XML Sitemap Validation', value: '100%', unit: 'valid', status: 'optimal', description: 'Clean sitemap.xml with lastmod dates and priority flags.', benchmark: 'Valid' },
      { id: 'v2', name: 'Canonical URL Graph Parity', value: 'Self-Ref', unit: 'clean', status: 'optimal', description: 'Zero duplicate content indexation risk.', benchmark: 'Self-Ref' },
      { id: 'v3', name: 'Robots.txt Directives', value: 'Optimal', unit: 'clean', status: 'optimal', description: 'Clean allow/disallow rules with zero crawl traps.', benchmark: 'Optimal' },
      { id: 'v4', name: 'BreadcrumbList Hierarchy', value: 'Present', unit: 'JSON-LD', status: 'optimal', description: 'Rich search breadcrumbs for SERP display.', benchmark: 'Present' },
      { id: 'v5', name: 'Semantic HTML5 Hierarchy', value: 'H1-H4', unit: 'structured', status: 'optimal', description: 'Strict single H1 per page with logical heading levels.', benchmark: 'Strict' },
      { id: 'v6', name: 'Googlebot Smartphone Parity', value: '100%', unit: 'responsive', status: 'optimal', description: 'Zero desktop-mobile content discrepancies.', benchmark: '100%' },
    ],
    codeSnippet: {
      filename: 'sitemap.config.ts',
      language: 'typescript',
      code: `export default {
  siteUrl: "https://catalystlab.tech",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
    ],
    additionalSitemaps: [
      "https://catalystlab.tech/sitemap.xml",
      "https://catalystlab.tech/llms.txt",
    ],
  },
};`,
    },
    description: 'Audits SERP knowledge graphs, semantic heading hierarchies, crawl budget efficiency, and Googlebot mobile parity.',
    route: '/llmo',
  },
];

export const EnzymeGrid: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEnzymeId, setSelectedEnzymeId] = useState<string>(ENZYME_CATALYSTS[0].id);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(ENZYME_CATALYSTS[0].id);

  const activeEnzyme = ENZYME_CATALYSTS.find((e) => e.id === selectedEnzymeId) || ENZYME_CATALYSTS[0];

  const filteredEnzymes = activeCategory === 'All'
    ? ENZYME_CATALYSTS
    : ENZYME_CATALYSTS.filter((e) => e.category === activeCategory);

  const categories = ['All', 'Core', 'Enterprise', 'Developer & AI'];

  return (
    <section
      id="enzyme-grid-section"
      className="py-20 lg:py-28 bg-[#060912] text-slate-100 border-b border-slate-800 relative overflow-hidden"
    >
      {/* Background Subtle Tech Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b1a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3.5 py-1 text-xs font-mono font-medium text-[#00F0FF] shadow-sm mb-3">
              <Cpu className="h-3.5 w-3.5 text-[#00F0FF]" />
              <span>THE 8 AUTONOMOUS SDLC CATALYSTS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Precision Micro-Engine Matrix
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mt-2 leading-relaxed">
              Eight synchronous diagnostic engines that inspect, benchmark, and generate autonomous remediation code across your entire stack.
            </p>
          </LazyReveal>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0B101D] p-1.5 rounded-xl border border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                id={`filter-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#06B6D4] text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            DESKTOP: 2-COLUMN LAYOUT (GRID OF 8 CARDS ON LEFT + STICKY HUD SIDEBAR ON RIGHT)
        ========================================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 8 Enzyme Catalyst Cards Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredEnzymes.map((enzyme) => {
              const Icon = enzyme.icon;
              const isSelected = selectedEnzymeId === enzyme.id;

              return (
                <div
                  key={enzyme.id}
                  id={`enzyme-card-${enzyme.id}`}
                  onMouseEnter={() => setSelectedEnzymeId(enzyme.id)}
                  onClick={() => setSelectedEnzymeId(enzyme.id)}
                  className={`p-4.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#0E1526] border-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-[#06B6D4]/40'
                      : 'bg-[#0B101D]/90 border-slate-800 hover:border-slate-700 hover:bg-[#0D1322]'
                  }`}
                >
                  {/* Top Bar: Icon + Enzyme Code + Score */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            color: enzyme.themeColor,
                            backgroundColor: `${enzyme.themeColor}15`,
                            borderColor: `${enzyme.themeColor}30`,
                          }}
                          className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                            <span>{enzyme.name}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              [{enzyme.shortCode}]
                            </span>
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 block truncate">
                            {enzyme.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-[#00FF66] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                          {enzyme.score}/100
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-medium mt-3 line-clamp-2">
                      {enzyme.role}
                    </p>
                  </div>

                  {/* Bottom Metric Preview */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-[#00F0FF] truncate">
                      {enzyme.primaryMetric.label}:
                    </span>
                    <strong className="text-slate-100 shrink-0 ml-1">
                      {enzyme.primaryMetric.value} {enzyme.primaryMetric.unit || ''}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Sticky Active Engine Telemetry & Code Inspector */}
          <div className="lg:col-span-6 sticky top-24 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEnzyme.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Catalyst-Grade Tilt Holo Media Visual */}
                <TiltCard className="rounded-xl overflow-hidden border border-slate-800 h-36 relative">
                  <CinematicMedia 
                    assetId={activeEnzyme.id === 'ai_ready' ? 'enzyme-fiber-optics' : activeEnzyme.id === 'compliance' ? 'enzyme-server-racks' : activeEnzyme.id === 'eco' ? 'enzyme-lab-optics' : 'enzyme-silicon-macro'} 
                    mode="ken-burns" 
                    containerClassName="absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none p-3 flex items-end justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#00F0FF] uppercase tracking-wider bg-black/70 px-2 py-0.5 rounded border border-[#06B6D4]/30">
                      [{activeEnzyme.shortCode}] TELEMETRY OPTICS
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">
                      Catalyst Grade
                    </span>
                  </div>
                </TiltCard>

                {/* Active Telemetry Card with 6 Sub-Vectors */}
                <TelemetryCard
                  enzymeName={activeEnzyme.name}
                  techTranslation={activeEnzyme.role}
                  shortCode={activeEnzyme.shortCode}
                  category={activeEnzyme.category}
                  score={activeEnzyme.score}
                  primaryMetric={activeEnzyme.primaryMetric}
                  subVectors={activeEnzyme.subVectors}
                  themeColor={activeEnzyme.themeColor}
                  onInspectDetails={() => navigate(activeEnzyme.route)}
                  id={`inspector-telemetry-${activeEnzyme.id}`}
                />

                {/* Remediation CodeBlock */}
                <CodeBlock
                  filename={activeEnzyme.codeSnippet.filename}
                  language={activeEnzyme.codeSnippet.language}
                  code={activeEnzyme.codeSnippet.code}
                  autoStartTypewriter={false}
                  enableScanline={true}
                  id={`inspector-code-${activeEnzyme.id}`}
                />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* =========================================================================
            MOBILE: RESPONSIVE STACKED ACCORDION VIEW
        ========================================================================= */}
        <div className="lg:hidden space-y-3">
          {filteredEnzymes.map((enzyme) => {
            const Icon = enzyme.icon;
            const isExpanded = mobileExpandedId === enzyme.id;

            return (
              <div
                key={enzyme.id}
                id={`mobile-enzyme-card-${enzyme.id}`}
                className="rounded-xl border border-slate-800 bg-[#0B101D] overflow-hidden"
              >
                {/* Mobile Header Bar */}
                <div
                  onClick={() => setMobileExpandedId(isExpanded ? null : enzyme.id)}
                  className="p-4 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        color: enzyme.themeColor,
                        backgroundColor: `${enzyme.themeColor}15`,
                        borderColor: `${enzyme.themeColor}30`,
                      }}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">
                        {enzyme.name} <span className="text-xs text-slate-500">[{enzyme.shortCode}]</span>
                      </h4>
                      <span className="text-[11px] text-slate-400 block">
                        {enzyme.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#00FF66] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                      {enzyme.score}
                    </span>
                  </div>
                </div>

                {/* Mobile Expanded Drawer */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="p-4 pt-0 border-t border-slate-800/80 bg-[#080D1A] space-y-4"
                    >
                      {/* Telemetry Card */}
                      <TelemetryCard
                        enzymeName={enzyme.name}
                        techTranslation={enzyme.role}
                        shortCode={enzyme.shortCode}
                        category={enzyme.category}
                        score={enzyme.score}
                        primaryMetric={enzyme.primaryMetric}
                        subVectors={enzyme.subVectors}
                        themeColor={enzyme.themeColor}
                        onInspectDetails={() => navigate(enzyme.route)}
                        id={`mobile-telemetry-${enzyme.id}`}
                      />

                      {/* Code Block */}
                      <CodeBlock
                        filename={enzyme.codeSnippet.filename}
                        language={enzyme.codeSnippet.language}
                        code={enzyme.codeSnippet.code}
                        autoStartTypewriter={false}
                        id={`mobile-code-${enzyme.id}`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Section Footer Link */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-base font-bold text-white">
              Autonomous Remediation Sandbox
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Every catalyst compiles machine-validated patches ready for instantaneous CD deployment.
            </p>
          </div>

          <Link
            to="/products"
            id="enzyme-grid-explore-all"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06B6D4] hover:bg-[#00F0FF] text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
          >
            <span>Explore All 8 Engines</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default EnzymeGrid;
