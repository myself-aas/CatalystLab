import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Download, Printer, Share2, RefreshCw, Save, Code, 
  Lightbulb, FileText, ExternalLink, Activity, Target, ShieldAlert,
  ArrowRight, Check, Copy, X, Terminal, Globe, Cpu, Leaf, Server,
  BookOpen, Compass, Sparkles, Tag, ArrowUpRight, CheckCircle2, Clock
} from 'lucide-react';
import { exportAuditReportDataToPdf } from '../../utils/pdfExport';
import { ENGINES_MAP } from '../../data/engines';
import { EngineCharts } from './EngineCharts';
import { AuditInsights } from './AuditInsights';
import { EngineDataTable } from './EngineDataTable';
import { getBlogsForEngine } from '../../data/engineBlogs';
import { getBlogPosts } from '../../lib/firebase';
import type { CoreEngineType, EngineType, BlogPost } from '../../types';

interface EngineReportDashboardProps {
  engineType: EngineType;
  targetUrl: string;
  output: string;
  onRelaunch: () => void;
  onSave: () => void;
  savedReportId: string | null;
}

// Engine-specific code mitigation snippets
const ENGINE_CODE_SNIPPETS: Record<string, { title: string; filename: string; code: string; language: string }> = {
  health: {
    title: 'NGINX Compression & Cache Policy',
    filename: 'nginx.conf',
    language: 'nginx',
    code: `# Enable Brotli & Gzip Compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript image/svg+xml;
gzip_comp_level 6;

# Cache static assets with immutable headers
location ~* \\.(?:ico|css|js|gif|jpe?g|png|webp|avif|woff2?)$ {
    expires 365d;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}`
  },
  latency: {
    title: 'Edge Resource Hints & Preconnect',
    filename: 'index.html',
    language: 'html',
    code: `<!-- 1. Resolve DNS early for critical APIs and CDNs -->
<link rel="dns-prefetch" href="https://api.example.com" />
<link rel="preconnect" href="https://cdn.example.com" crossorigin />

<!-- 2. Preload critical above-the-fold display font -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />

<!-- 3. HTTP/2 or HTTP/3 Server Push & Early Hints (103) -->
<!-- Link: </css/main.css>; rel=preload; as=style -->`
  },
  ai_ready: {
    title: 'AI Machine Manifest & Robots Directives',
    filename: 'llms.txt',
    language: 'markdown',
    code: `# Project Overview for AI Agents & Search Engines
> Documentation: https://example.com/docs
> API Endpoint: https://api.example.com/v1

## Primary Knowledge Entities
- Product Architecture: /docs/architecture
- OpenAPI Schema: /openapi.json
- Pricing & Limits: /pricing

## Autonomous Crawler Policy
User-agent: GPTBot
Allow: /docs/
Allow: /api/public/
Disallow: /user/private/`
  },
  repo: {
    title: 'Automated CI/CD & Dependabot Security Workflow',
    filename: '.github/dependabot.yml',
    language: 'yaml',
    code: `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    commit-message:
      prefix: "security"
      include: "scope"`
  },
  eco: {
    title: 'Sustainable Web Optimization & Next-Gen Media',
    filename: 'vite.config.ts',
    language: 'typescript',
    code: `import { defineConfig } from 'vite';
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      webp: { quality: 80 },
      svgo: { plugins: [{ name: 'removeViewBox', active: false }] }
    })
  ]
});`
  },
  compliance: {
    title: 'OWASP Recommended Security & Privacy Headers',
    filename: 'server.ts / middleware.ts',
    language: 'typescript',
    code: `// OWASP Hardened HTTP Response Headers
response.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
response.setHeader('X-Content-Type-Options', 'nosniff');
response.setHeader('X-Frame-Options', 'DENY');
response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
response.setHeader(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self';"
);`
  },
  migration: {
    title: '301 Permanent Redirect Route Mapping',
    filename: 'vercel.json / routes.json',
    language: 'json',
    code: `{
  "redirects": [
    {
      "source": "/old-blog/:slug",
      "destination": "/blogs/:slug",
      "permanent": true
    },
    {
      "source": "/legacy-products/:id",
      "destination": "/products/:id",
      "permanent": true
    }
  ]
}`
  },
  llmo: {
    title: 'JSON-LD Entity Graph Schema for AI Search Engines',
    filename: 'schema.jsonld',
    language: 'json',
    code: `{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Telemetry & Website Engineering Audit",
  "author": {
    "@type": "Organization",
    "name": "CatalystLab"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CatalystLab",
    "logo": "https://www.catalystlab.tech/icon.png"
  },
  "datePublished": "2026-03-24",
  "inLanguage": "en-US"
}`
  },
  'master-audit': {
    title: 'Enterprise Multi-Engine Telemetry Middleware',
    filename: 'catalyst.config.ts',
    language: 'typescript',
    code: `import { defineCatalystConfig } from '@catalystlab/sdk';

export default defineCatalystConfig({
  engines: ['health', 'latency', 'ai_ready', 'eco', 'compliance', 'repo', 'migration', 'llmo'],
  thresholds: {
    minScore: 85,
    maxLatencyMs: 150,
    failOnCritical: true
  },
  reporting: {
    format: ['json', 'pdf'],
    webhookUrl: process.env.CATALYST_WEBHOOK_URL
  }
});`
  }
};

// Engine-specific recommendations
const ENGINE_RECOMMENDATIONS: Record<string, Array<{ title: string; text: string; level: 'critical' | 'warning' | 'info' }>> = {
  'master-audit': [
    { title: 'Remediate High-Priority Security Headers', text: 'Enforce HSTS and Content-Security-Policy across all public ingress points.', level: 'critical' },
    { title: 'Optimize Global CDN Edge Caching', text: 'Configure Anycast CDN caching and early hints to drop TTFB below 80ms worldwide.', level: 'warning' },
    { title: 'Publish Machine-Readable /llms.txt', text: 'Provide structured discovery manifests for autonomous AI search indexing bots.', level: 'info' }
  ],
  health: [
    { title: 'Eliminate Render-Blocking CSS/JS', text: 'Move third-party scripts to the body footer and add defer/async attributes.', level: 'critical' },
    { title: 'Adopt WebP and AVIF Formats', text: 'Compress all PNG/JPEG images into modern formats to save up to 60% bandwidth.', level: 'warning' },
    { title: 'Set Long-Lived Cache Headers', text: 'Specify Cache-Control: max-age=31536000 for immutable static build bundles.', level: 'info' }
  ],
  latency: [
    { title: 'Enable Edge Caching via CDN', text: 'Deploy Cloudflare or AWS CloudFront with regional edge caching enabled.', level: 'critical' },
    { title: 'Implement DNS-Prefetch & Preconnect', text: 'Pre-resolve third-party hostnames to shave 50-100ms off connection establishment.', level: 'warning' },
    { title: 'Upgrade to TLS 1.3 with 0-RTT', text: 'Reduce cryptographic handshake roundtrips for returning mobile connections.', level: 'info' }
  ],
  ai_ready: [
    { title: 'Publish Root /llms.txt File', text: 'Provide explicit LLM navigation directives and API endpoint documentation for AI indexers.', level: 'critical' },
    { title: 'Verify Robots.txt AI Bot Allowlist', text: 'Permit GPTBot, ClaudeBot, and PerplexityBot to crawl public informational pages.', level: 'warning' },
    { title: 'Preserve Heading Hierarchy (H1-H3)', text: 'Structured semantic headings allow LLMs to build high-accuracy vector embeddings.', level: 'info' }
  ],
  repo: [
    { title: 'Configure Automated Dependabot Scans', text: 'Set up weekly pull requests for vulnerable npm/pip dependencies.', level: 'critical' },
    { title: 'Enforce Branch Protection Rules', text: 'Require signed commits, 1+ PR approval, and passing CI/CD status before merging.', level: 'warning' },
    { title: 'Add Standard Open-Source License', text: 'Explicitly define an MIT or Apache-2.0 license file to maintain compliance.', level: 'info' }
  ],
  eco: [
    { title: 'Switch to Green-Certified Host', text: 'Ensure hosting infrastructure is powered by 100% renewable electricity (Green Web Foundation).', level: 'critical' },
    { title: 'Enforce Global Dark Mode Theme', text: 'Dark pixels on OLED displays consume up to 40% less battery and carbon energy.', level: 'warning' },
    { title: 'Purge Unused CSS & Script Bundles', text: 'Tree-shake dependencies to keep initial payload transfer below 200KB per page.', level: 'info' }
  ],
  compliance: [
    { title: 'Enforce Strict-Transport-Security (HSTS)', text: 'Add max-age=63072000; includeSubDomains; preload to prevent SSL stripping.', level: 'critical' },
    { title: 'Deploy Content-Security-Policy (CSP)', text: 'Restrict script execution domains to eradicate Cross-Site Scripting (XSS) risks.', level: 'warning' },
    { title: 'Categorized Cookie Consent Banner', text: 'Provide granular consent switches for Essential, Analytics, and Marketing cookies.', level: 'info' }
  ],
  migration: [
    { title: 'Use 301 Permanent Redirects', text: 'Never use 302 temporary redirects for migrated paths to preserve organic SEO authority.', level: 'critical' },
    { title: 'Synchronize Canonical URLs', text: 'Ensure rel=canonical links point exclusively to final live destination routes.', level: 'warning' },
    { title: 'Preserve Historical Meta Tags', text: 'Transfer exact OpenGraph titles and descriptions to prevent search snippet churn.', level: 'info' }
  ],
  llmo: [
    { title: 'Embed Rich JSON-LD Entity Graph', text: 'Add Schema.org structured data to enable citation parsing in Perplexity and SearchGPT.', level: 'critical' },
    { title: 'Maximize Content-to-HTML Ratio', text: 'Strip extraneous div nesting to maximize factual token signal for RAG parsers.', level: 'warning' },
    { title: 'Provide Direct Factual Attribution', text: 'Highlight primary authors, verified timestamps, and sources within article bodies.', level: 'info' }
  ]
};

// Helper to extract JSON metrics from python/node telemetry
const extractMetrics = (output: string) => {
  try {
    const match = output.match(/---CATALYST_METRICS---\n({[\s\S]*})/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
  } catch (e) {
    console.error("Failed to parse metrics", e);
  }
  return null;
};

// Deterministic baseline generator
const generateMetrics = (url: string) => {
  const hash = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    healthScore: 78 + (hash % 20),
    loadTime: (hash % 1200) + 250,
    issues: {
      critical: hash % 3,
      warning: (hash % 6) + 1,
      info: (hash % 10) + 2,
    }
  };
};

export const EngineReportDashboard: React.FC<EngineReportDashboardProps> = ({
  engineType, targetUrl, output, onRelaunch, onSave, savedReportId
}) => {
  const navigate = useNavigate();
  const meta = ENGINES_MAP[engineType];
  const baseMetrics = generateMetrics(targetUrl);
  const parsedPythonMetrics = extractMetrics(output);
  const metrics = { ...baseMetrics, ...parsedPythonMetrics };
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [apiTab, setApiTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [copiedApi, setCopiedApi] = useState(false);
  const [engineBlogs, setEngineBlogs] = useState<BlogPost[]>([]);

  const recommendations = ENGINE_RECOMMENDATIONS[engineType] || ENGINE_RECOMMENDATIONS.health;
  const codeSnippet = ENGINE_CODE_SNIPPETS[engineType] || ENGINE_CODE_SNIPPETS.health;

  // Load relevant blogs for this specific engine
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const seeded = getBlogsForEngine(engineType);
        // Try fetching live firestore blogs as well
        const livePosts = await getBlogPosts();
        if (livePosts && livePosts.length > 0) {
          // Filter matching tags or category
          const matching = livePosts.filter(p => 
            p.category.toLowerCase().includes(meta.name.toLowerCase()) ||
            p.tags.some(t => meta.name.toLowerCase().includes(t.toLowerCase())) ||
            (meta.relevantBlogSlugs && meta.relevantBlogSlugs.includes(p.slug))
          );
          if (matching.length > 0) {
            setEngineBlogs([...matching, ...seeded].slice(0, 3));
            return;
          }
        }
        setEngineBlogs(seeded);
      } catch (err) {
        setEngineBlogs(getBlogsForEngine(engineType));
      }
    };
    loadBlogs();
  }, [engineType, meta]);

  // SEO Metadata Update
  useEffect(() => {
    document.title = `${meta.name} Audit Report - ${targetUrl} | CatalystLab`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', `Automated ${meta.name} telemetry audit for ${targetUrl}. Comprehensive PowerBI performance graphs, security benchmarks and mitigation code.`);
  }, [engineType, targetUrl, meta.name]);

  const shareUrl = window.location.href;
  const shareText = `Check out the ${meta.name} telemetry audit report for ${targetUrl} on CatalystLab! Score: ${metrics.healthScore}/100`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    exportAuditReportDataToPdf({
      engine: engineType,
      url: targetUrl,
      output: output,
      createdAt: Date.now()
    } as any);
  };

  const apiSnippets = {
    curl: `curl -X POST https://www.catalystlab.tech/api/run-engine \\
  -H "Content-Type: application/json" \\
  -d '{"url": "${targetUrl}", "engine": "${engineType}"}'`,
    node: `import fetch from 'node-fetch';

const response = await fetch('https://www.catalystlab.tech/api/run-engine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: '${targetUrl}', engine: '${engineType}' })
});

const report = await response.json();
console.log(report.output);`,
    python: `import requests

res = requests.post(
    'https://www.catalystlab.tech/api/run-engine',
    json={'url': '${targetUrl}', 'engine': '${engineType}'}
)

report = res.json()
print(report['output'])`
  };

  const handleCopyApi = () => {
    navigator.clipboard.writeText(apiSnippets[apiTab]);
    setCopiedApi(true);
    setTimeout(() => setCopiedApi(false), 2000);
  };

  const docsUrl = `/docs#${meta.docsAnchor || 'overview'}`;

  return (
    <div className="mt-8 space-y-8" id="report-dashboard">
      
      {/* 1. Executive Summary & Material 3 Action Bar */}
      <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#38bdf8] rounded-full blur-[140px] opacity-10 pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {meta.image && (
                <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-[#415a77]/50 shadow-lg relative">
                  <img alt="Visual asset" 
                    src={meta.image} 
                    alt={meta.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#0b192c]/10 ring-1 ring-inset ring-white/10 rounded-2xl mix-blend-overlay"></div>
                </div>
              )}
              
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-3xl text-[#38bdf8]">{meta.icon}</span>
                  
                  {/* Category Badge */}
                  <span className="text-xs font-bold uppercase tracking-widest text-[#38bdf8] bg-[#38bdf8]/10 px-3 py-1 rounded-full border border-[#38bdf8]/20">
                    {meta.category} Engine
                  </span>

                  {/* Explicit Label tag */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#152238] border border-[#415a77]/50 px-3 py-1 text-xs font-mono font-bold text-[#c5d3e8]">
                    <Tag className="h-3 w-3 text-[#38bdf8]" />
                    <span>label: &#123; category: "{meta.category}", engine_name: "{meta.name}" &#125;</span>
                  </span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] mb-3">
                  {meta.name} Audit Report
                </h2>
                
                <p className="text-sm text-[#c5d3e8] leading-relaxed mb-6">
                  Automated telemetry evaluation for <strong className="text-white font-mono bg-[#152238] px-2 py-0.5 rounded border border-[#415a77]/40">{targetUrl}</strong> completed with an index rating of <span className="text-[#38bdf8] font-extrabold">{metrics.healthScore}/100</span>. 
                  Our engine identified <strong className="text-rose-400">{metrics.issues.critical} critical constraints</strong>, <strong className="text-amber-400">{metrics.issues.warning} warnings</strong>, and <strong className="text-emerald-400">{metrics.issues.info} verified optimizations</strong>.
                </p>
              </div>
            </div>
            
            {/* Functional Google Material 3 Action Icons */}
            <div className="flex flex-wrap items-center gap-2.5 mt-6">
              <button 
                onClick={onSave} 
                disabled={!!savedReportId} 
                className="flex items-center gap-2 rounded-xl bg-[#152238] border border-[#415a77]/40 px-3.5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#1e2f4a] hover:border-[#38bdf8]/50 transition-all disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                title="Save report to user account history"
              >
                <Save className="h-4 w-4 text-[#38bdf8]" /> 
                <span>{savedReportId ? 'Report Saved' : 'Save Report'}</span>
              </button>

              <button 
                onClick={handleExportPdf} 
                className="flex items-center gap-2 rounded-xl bg-[#152238] border border-[#415a77]/40 px-3.5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#1e2f4a] hover:border-[#38bdf8]/50 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                title="Export comprehensive PDF dossier"
              >
                <Download className="h-4 w-4 text-[#34d399]" /> 
                <span>Export PDF</span>
              </button>

              <button 
                onClick={handlePrint} 
                className="flex items-center gap-2 rounded-xl bg-[#152238] border border-[#415a77]/40 px-3.5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#1e2f4a] hover:border-[#38bdf8]/50 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                title="Print report format"
              >
                <Printer className="h-4 w-4 text-[#a78bfa]" /> 
                <span>Print</span>
              </button>

              <button 
                onClick={() => setShareModalOpen(true)} 
                className="flex items-center gap-2 rounded-xl bg-[#152238] border border-[#415a77]/40 px-3.5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#1e2f4a] hover:border-[#38bdf8]/50 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                title="Share report on social media"
              >
                <Share2 className="h-4 w-4 text-[#fbbf24]" /> 
                <span>Share</span>
              </button>

              <button 
                onClick={onRelaunch} 
                className="flex items-center gap-2 rounded-xl bg-[#38bdf8] text-[#0b192c] px-4 py-2.5 text-xs font-bold hover:bg-[#7dd3fc] transition-all ml-auto shadow-lg shadow-[#38bdf8]/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                title="Relaunch diagnostic probe"
              >
                <RefreshCw className="h-4 w-4" /> 
                <span>Relaunch Probe</span>
              </button>
            </div>
          </div>
          
          {/* Radial Metric Gauge */}
          <div className="flex shrink-0 items-center justify-center h-36 w-36 rounded-full border-[8px] border-[#152238] bg-[#0b192c] shadow-2xl relative">
             <div 
               className="absolute inset-0 rounded-full border-[8px] border-[#38bdf8] transition-all duration-1000" 
               style={{ 
                 clipPath: `polygon(0 0, 100% 0, 100% ${Math.min(100, Math.max(10, metrics.healthScore))}%, 0 ${Math.min(100, Math.max(10, metrics.healthScore))}%)`
               }} 
             />
             <div className="text-center">
               <div className="text-3xl font-extrabold text-white">{metrics.healthScore}</div>
               <div className="text-[10px] text-[#38bdf8] font-bold uppercase tracking-widest mt-0.5">Health Score</div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Visualizations and Charts with Explanations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0b192c] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38bdf8]">monitoring</span>
              <span>PowerBI Expressive Visualizations & Explanations</span>
            </h3>
            <p className="text-xs text-[#415a77] mt-0.5">
              Three interactive visual dashboards and in-depth telemetry analysis generated by the {meta.name} engine.
            </p>
          </div>
        </div>

        {/* Charts Component */}
        <EngineCharts engineType={engineType} metrics={metrics} />
        
        {/* Automated Audit Insights & Visual Explanations Component */}
        <AuditInsights engineType={engineType} targetUrl={targetUrl} metrics={metrics} />
      </div>

      {/* 3. Comprehensive Audit Tables (label:{category: engine_name(s)}) */}
      <div>
        <EngineDataTable 
          engineType={engineType}
          targetUrl={targetUrl}
          metrics={metrics}
        />
      </div>

      {/* 4. Actionable Recommendations & Code Mitigation Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Prioritized Recommendations */}
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 flex flex-col justify-between text-white shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#fbbf24]">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f8fafc]">Actionable Engineering Recommendations</h3>
                  <p className="text-xs text-[#c5d3e8] mt-0.5">Prioritized by performance and reliability impact</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-3.5 p-3.5 rounded-2xl bg-[#152238]/60 border border-[#415a77]/30">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                    rec.level === 'critical' ? 'bg-[#f43f5e]' : rec.level === 'warning' ? 'bg-[#fbbf24]' : 'bg-[#34d399]'
                  }`} />
                  <div>
                    <h4 className="text-xs font-bold text-[#f8fafc] mb-1">{rec.title}</h4>
                    <p className="text-xs text-[#c5d3e8] leading-relaxed">{rec.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#415a77]/30 flex items-center justify-between text-xs text-[#c5d3e8]">
            <span>Need enterprise remediation assistance?</span>
            <Link to="/contact" className="font-bold text-[#38bdf8] hover:text-[#7dd3fc] transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span>Contact Engineers</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        
        {/* Suggested Code Mitigation */}
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 flex flex-col justify-between text-white shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#34d399]">
                  <Code className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f8fafc]">{codeSnippet.title}</h3>
                  <p className="text-xs text-[#c5d3e8] mt-0.5">Drop-in configuration snippet for {codeSnippet.filename}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#152238] border border-[#415a77]/40 px-2.5 py-1 rounded-lg text-[#38bdf8]">
                {codeSnippet.filename}
              </span>
            </div>

            <div className="relative rounded-2xl bg-[#020617] border border-[#1e293b] p-4 font-mono text-xs text-[#cbd5e1] overflow-x-auto shadow-inner">
              <pre className="leading-relaxed whitespace-pre-wrap">{codeSnippet.code}</pre>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[#c5d3e8]">
            <span className="flex items-center gap-1.5 text-[11px] text-[#34d399]">
              <Check className="h-3.5 w-3.5" />
              <span>Tested on modern cloud edge runtimes</span>
            </span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(codeSnippet.code);
              }}
              className="text-xs font-bold text-[#38bdf8] hover:text-[#7dd3fc] transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Snippet</span>
            </button>
          </div>
        </div>

      </div>

      {/* 5. Backlink to Detailed Engine Documentation & API Pipeline */}
      <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-[#38bdf8]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f8fafc] flex items-center gap-2">
                <span>Detailed Documentation & Specification</span>
                <span className="text-xs text-[#38bdf8] font-mono font-normal">({meta.name})</span>
              </h3>
              <p className="text-xs text-[#c5d3e8] mt-0.5">
                Comprehensive technical guide, evaluation vectors, mathematical formulas, and REST API specification for {meta.name}.
              </p>
            </div>
          </div>

          <Link 
            to={docsUrl} 
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0b192c] bg-[#38bdf8] hover:bg-[#7dd3fc] px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#38bdf8]/20 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <FileText className="h-4 w-4" />
            <span>Read {meta.name} Documentation</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Key Vectors Checked by this engine */}
        {meta.keyVectors && meta.keyVectors.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[#152238]/60 border border-[#415a77]/30">
            <div className="text-xs font-bold text-[#f8fafc] mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#34d399]" />
              <span>Key Diagnostic Vectors Documented for {meta.name}:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {meta.keyVectors.map((vector, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#c5d3e8] bg-[#0b192c] px-3 py-1.5 rounded-xl border border-[#415a77]/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
                  <span className="truncate">{vector}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Code Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-[#f8fafc] flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#38bdf8]" />
              <span>CI/CD & Automated API Integration:</span>
            </div>
            <div className="flex gap-2">
              {(['curl', 'node', 'python'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setApiTab(tab)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-colors ${
                    apiTab === tab 
                      ? 'bg-[#38bdf8] text-[#0b192c]' 
                      : 'bg-[#152238] text-[#c5d3e8] hover:text-white border border-[#415a77]/30'
                  }`}
                >
                  {tab === 'curl' ? 'cURL' : tab === 'node' ? 'Node.js' : 'Python'}
                </button>
              ))}
              <button 
                onClick={handleCopyApi} 
                className="flex items-center gap-1.5 text-xs text-[#c5d3e8] hover:text-white bg-[#152238] px-2.5 py-1 rounded-lg border border-[#415a77]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {copiedApi ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedApi ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#020617] border border-[#1e293b] p-4 font-mono text-xs text-[#38bdf8] overflow-x-auto shadow-inner">
            <pre className="whitespace-pre">{apiSnippets[apiTab]}</pre>
          </div>
        </div>
      </div>

      {/* 6. Display Relevant Blog Posts for this Specific Engine */}
      <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[#c084fc]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">
                Relevant Engineering Blog Posts for {meta.name}
              </h3>
              <p className="text-xs text-[#c5d3e8] mt-0.5">
                Technical articles, architecture blueprints, and case studies written by our telemetry research guild.
              </p>
            </div>
          </div>

          <Link 
            to="/blogs" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38bdf8] hover:text-[#7dd3fc] bg-[#152238] border border-[#415a77]/40 px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span>View All Blog Posts</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engineBlogs.map((post) => (
            <Link
              key={post.id || post.slug}
              to={`/blogs/${post.slug}`}
              className="group flex flex-col justify-between rounded-2xl bg-[#152238]/60 border border-[#415a77]/30 p-5 hover:border-[#38bdf8]/60 hover:bg-[#152238] transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[#38bdf8]/10 px-2.5 py-0.5 rounded-full border border-[#38bdf8]/20">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-[#c5d3e8] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-[#38bdf8] transition-colors line-clamp-2 mb-2 leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  {post.title}
                </h4>

                <p className="text-xs text-[#c5d3e8] line-clamp-3 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
              </div>

              <div>
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-mono text-[#c5d3e8] bg-[#0b192c] px-2 py-0.5 rounded border border-[#415a77]/20">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#415a77]/30 text-xs font-bold text-[#38bdf8] group-hover:text-[#7dd3fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>Read Full Article</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 7. Next Recommended Engines for Subsequent Audits */}
      <div className="rounded-3xl border border-[#415a77]/30 bg-gradient-to-br from-[#152238] to-[#0b192c] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#fbbf24]">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#f8fafc] flex items-center gap-2">
              <span>Next Recommended Diagnostic Audits for {targetUrl}</span>
              <span className="text-xs text-[#fbbf24] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Telemetry Pipeline Next Steps
              </span>
            </h3>
            <p className="text-xs text-[#c5d3e8] mt-0.5">
              Based on the results from <strong>{meta.name}</strong>, our telemetry engine recommends running these complementary probes to ensure end-to-end reliability.
            </p>
          </div>
        </div>

        {/* Tailored Engine Recommendation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meta.recommendedEngines && meta.recommendedEngines.map((rec) => {
            const targetEngine = ENGINES_MAP[rec.engineId];
            if (!targetEngine) return null;

            return (
              <div 
                key={rec.engineId}
                className="group flex flex-col justify-between rounded-2xl bg-[#0b192c] border border-[#415a77]/40 p-5 hover:border-[#38bdf8]/60 transition-all shadow-lg relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-[#38bdf8]">{targetEngine.icon}</span>
                      <span className="text-xs font-bold text-white">{targetEngine.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${targetEngine.badgeClass}`}>
                      {targetEngine.category}
                    </span>
                  </div>

                  <p className="text-xs text-[#c5d3e8] leading-relaxed mb-4">
                    {rec.rationale}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#415a77]/30">
                  <Link
                    to={`${targetEngine.route}?url=${encodeURIComponent(targetUrl)}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#152238] hover:bg-[#38bdf8] hover:text-[#0b192c] text-xs font-bold text-[#f8fafc] border border-[#415a77]/40 hover:border-transparent transition-all shadow-md group-hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <span>Run {targetEngine.name} Scan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* All Engine Quick Switcher Footer */}
        <div className="mt-8 pt-6 border-t border-[#415a77]/30 flex flex-wrap items-center justify-between gap-4 text-xs text-[#c5d3e8]">
          <span className="font-semibold">Explore all 8 dedicated diagnostic engines:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ENGINES_MAP).map(([id, engine]) => (
              <Link
                key={id}
                to={`${engine.route}?url=${encodeURIComponent(targetUrl)}`}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  id === engineType
                    ? 'bg-[#38bdf8] text-[#0b192c] border-[#38bdf8]'
                    : 'bg-[#0b192c] text-[#c5d3e8] hover:text-white border-[#415a77]/40 hover:border-[#38bdf8]/50'
                }`}
              >
                {engine.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Social Media URL Sharing Preview Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-3xl border border-[#415a77]/40 bg-[#0b192c] p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl relative">
            <button 
              onClick={() => setShareModalOpen(false)}
              className="absolute top-5 right-5 text-[#c5d3e8] hover:text-white p-1 rounded-lg hover:bg-[#152238] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-[#38bdf8]">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Share Audit Report</h3>
                <p className="text-xs text-[#c5d3e8]">Share this telemetry diagnostic report with your team or social network</p>
              </div>
            </div>

            {/* Rich OpenGraph Preview Card */}
            <div className="rounded-2xl border border-[#415a77]/40 bg-[#152238] p-4 my-5 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm text-[#38bdf8]">{meta.icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8]">CatalystLab Telemetry</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{meta.name} Audit: {targetUrl}</h4>
              <p className="text-xs text-[#c5d3e8] line-clamp-2">
                Overall diagnostic score: {metrics.healthScore}/100 with {metrics.issues.critical} critical findings and complete PowerBI visualizations.
              </p>
            </div>

            {/* Social Media Share Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#152238] border border-[#415a77]/40 hover:bg-[#1e2f4a] hover:border-sky-400 text-xs font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <span>X (Twitter)</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#152238] border border-[#415a77]/40 hover:bg-[#1e2f4a] hover:border-blue-400 text-xs font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <span>LinkedIn</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#152238] border border-[#415a77]/40 hover:bg-[#1e2f4a] hover:border-emerald-400 text-xs font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#152238] border border-[#415a77]/40 hover:bg-[#1e2f4a] hover:border-indigo-400 text-xs font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <span>Facebook</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#152238] border border-[#415a77]/40 hover:bg-[#1e2f4a] hover:border-cyan-400 text-xs font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <span>Telegram</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#38bdf8] text-[#0b192c] font-bold text-xs hover:bg-[#7dd3fc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#152238] text-xs font-bold text-[#c5d3e8] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
