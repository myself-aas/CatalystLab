import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Terminal, 
  Code, 
  Cpu, 
  ShieldCheck, 
  Globe, 
  Leaf, 
  Zap, 
  ArrowRight, 
  ExternalLink,
  Search,
  Check,
  Copy,
  ChevronRight,
  Sparkles,
  Layers,
  FileText,
  Clock,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Info,
  AlertTriangle,
  CheckCircle2,
  Menu,
  X,
  Share2,
  HelpCircle,
  Activity,
  Server,
  Key,
  Database,
  Lock,
  GitBranch,
  SearchCode,
  Gauge,
  Workflow,
  Sliders,
  ChevronDown,
  Play
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { GlobalSearchModal } from '../components/common/GlobalSearchModal';

interface CodeSnippetProps {
  code: string;
  language: string;
  title?: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, language, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-[#415a77]/30 bg-[#0b192c] shadow-md">
      <div className="flex items-center justify-between border-b border-[#415a77]/25 bg-[#091524] px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[11px] font-semibold text-[#c5d3e8]">{title || language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md border border-[#415a77]/40 bg-[#152238] px-2.5 py-1 text-[11px] font-medium text-[#c5d3e8] hover:bg-[#1f314d] hover:text-[#f8fafc] transition-all"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-[#c5d3e8]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#f8fafc] bg-[#050d18]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const DocsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  const docNav = [
    {
      group: 'Platform Architecture',
      items: [
        { id: 'overview', title: 'System Overview & Philosophy' },
        { id: 'app-architecture', title: 'Full-Stack Architecture' },
        { id: 'security-sandbox', title: 'Zero-Trust Probe Sandbox' },
        { id: 'rate-limiting', title: 'Sliding Token Rate Limiter' },
        { id: 'scoring-matrix', title: 'Scoring Formula & Weights' },
      ],
    },
    {
      group: '8 Diagnostic Engines Deep-Dive',
      items: [
        { id: 'engine-health', title: '1. Website Health & DOM' },
        { id: 'engine-latency', title: '2. Global Edge Latency (12 PoPs)' },
        { id: 'engine-ai-readiness', title: '3. AI Readiness & llms.txt' },
        { id: 'engine-repo-scanner', title: '4. Git Repo & SecOps' },
        { id: 'engine-eco-audit', title: '5. Eco-Carbon (SWD Model)' },
        { id: 'engine-compliance', title: '6. OWASP Headers & WCAG' },
        { id: 'engine-llmo', title: '7. AI Search Optimization (LLMO)' },
        { id: 'engine-migration', title: '8. Platform Migration Risk' },
        { id: 'engine-master', title: '9. Master Suite Orchestrator' },
      ],
    },
    {
      group: 'REST API & Reference',
      items: [
        { id: 'api-run-engine', title: 'POST /api/run-engine' },
        { id: 'api-probe', title: 'POST /api/monitor/probe' },
        { id: 'api-system-health', title: 'GET /api/monitor/system-health' },
        { id: 'api-schema', title: 'JSON Response Payload' },
      ],
    },
    {
      group: 'CI/CD & DevOps Automation',
      items: [
        { id: 'ci-github', title: 'GitHub Actions Quality Gate' },
        { id: 'ci-gitlab', title: 'GitLab CI CLI Probe' },
        { id: 'ci-webhooks', title: 'Automated Telemetry Alerts' },
      ],
    },
  ];

  // Scrollspy to automatically highlight current section
  useEffect(() => {
    const handleScroll = () => {
      const sections = docNav.flatMap((g) => g.items.map((i) => i.id));
      const scrollPos = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  const filteredNav = docNav.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b192c] selection:bg-[#415a77]/25 selection:text-[#0b192c]">
      <SEOHead
        title="Developer Documentation & Technical Reference"
        description="Comprehensive technical documentation, architecture deep dives, telemetry algorithms, and REST API specification for CatalystLab's 8 diagnostic engines."
        keywords={[
          'CatalystLab documentation',
          'telemetry API',
          'Core Web Vitals audit',
          'llms.txt specification',
          'edge latency TTFB',
          'OWASP compliance headers',
          'eco carbon audit',
          'REST API reference'
        ]}
        canonicalUrl="https://www.catalystlab.tech/docs"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: 'CatalystLab Telemetry Architecture & API Specification',
          description: 'Technical reference and integration guides for automated web quality intelligence.',
          author: {
            '@type': 'Organization',
            name: 'CatalystLab Telemetry Team',
            url: 'https://www.catalystlab.tech'
          }
        }}
      />

      {/* Top Header with Breadcrumbs and Global Search */}
      <div className="border-b border-[#e2e8f0] bg-white sticky top-16 z-30 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#415a77] hover:bg-[#f1f5f9]"
              aria-label="Toggle docs navigation"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Breadcrumbs
              items={[
                { label: 'Documentation', href: '/docs' },
                { label: 'Architecture & Reference' },
              ]}
            />
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs text-[#64748b] hover:border-[#cbd5e1] hover:text-[#0b192c] transition-colors"
            >
              <Search className="h-3.5 w-3.5 text-[#415a77]" />
              <span className="hidden sm:inline">Search docs, engines & APIs...</span>
              <kbd className="rounded border border-[#e2e8f0] bg-white px-1.5 py-0.2 text-[10px] font-mono text-[#94a3b8]">⌘K</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-Layout Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Sticky Navigation Sidebar */}
          <aside className={`lg:col-span-3 lg:block ${mobileMenuOpen ? 'block fixed inset-x-4 top-32 z-40 max-h-[75vh] overflow-y-auto rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-2xl' : 'hidden'}`}>
            <div className="sticky top-28 space-y-6">
              <div className="pb-3 border-b border-[#e2e8f0]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#415a77]">
                  Documentation Index
                </div>
                <div className="text-xs text-[#64748b] mt-0.5">v2.4 Telemetry Core Specification</div>
              </div>

              {filteredNav.map((group) => (
                <div key={group.group} className="space-y-2">
                  <div className="text-xs font-bold text-[#0b192c] uppercase tracking-wider">
                    {group.group}
                  </div>
                  <ul className="space-y-1 border-l-2 border-[#e2e8f0] pl-2.5">
                    {group.items.map((item) => {
                      const isCurrent = activeSection === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => scrollToSection(item.id)}
                            className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-all flex items-center justify-between ${
                              isCurrent
                                ? 'bg-[#0b192c] text-white font-bold shadow-xs'
                                : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#f1f5f9]'
                            }`}
                          >
                            <span className="truncate">{item.title}</span>
                            {isCurrent && <ChevronRight className="h-3 w-3 text-white shrink-0 ml-1" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <div className="pt-4 border-t border-[#e2e8f0] space-y-2">
                <Link
                  to="/blogs"
                  className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs text-[#415a77] hover:bg-[#f1f5f9] hover:text-[#0b192c] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#415a77]" />
                    <span className="font-semibold">Developer Blog</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs text-[#415a77] hover:bg-[#f1f5f9] hover:text-[#0b192c] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-[#415a77]" />
                    <span className="font-semibold">Developer Support</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Center Column: Comprehensive Documentation Content */}
          <main className="lg:col-span-7 space-y-16">
            
            {/* Section 1: Overview & Philosophy */}
            <section id="overview" className="scroll-mt-24 space-y-5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-0.5 text-xs font-semibold text-sky-800">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                <span>CatalystLab Core Architecture</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b192c] tracking-tight">
                CatalystLab Telemetry & Quality Intelligence Platform
              </h1>
              <p className="text-sm text-[#415a77] leading-relaxed">
                CatalystLab.live is an enterprise-grade automated telemetry and web quality intelligence platform. It orchestrates synchronous diagnostics across 8 isolated evaluation modules to measure Core Web Vitals, AI LLM crawler accessibility, Git repository hygiene, multi-region edge latency, OWASP compliance, and green hosting carbon metrics.
              </p>

              {/* Callout Note */}
              <div className="rounded-xl border-l-4 border-sky-500 bg-sky-50/70 p-4 text-xs text-sky-950">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Zero Client-Script Execution Model:</strong> Unlike traditional headless browser clusters that load and execute unvetted client-side JavaScript (introducing security vulnerabilities, crypto-mining risks, and high memory overhead), CatalystLab utilizes high-speed non-evaluating streaming HTTP/TLS socket timing probes, Abstract Syntax Tree (AST) HTML parsers, and DNS anycast radars. This delivers sub-second deterministic telemetry while protecting host infrastructure.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Full-Stack Webapp Architecture */}
            <section id="app-architecture" className="scroll-mt-24 space-y-6 border-t border-[#e2e8f0] pt-10">
              <h2 className="text-2xl font-bold text-[#0b192c] flex items-center gap-2">
                <Layers className="h-6 w-6 text-[#415a77]" />
                <span>Full-Stack Application Architecture</span>
              </h2>
              <p className="text-sm text-[#415a77] leading-relaxed">
                CatalystLab is architected as a high-concurrency Node.js Express server integrated with Vite middleware, Python 3 sandboxed worker subprocesses, and Firebase Firestore cloud persistence.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0b192c]">
                    <Server className="h-4 w-4 text-sky-600" />
                    <span>API Gateway & Ingress (Node.js)</span>
                  </div>
                  <p className="text-[#64748b] leading-relaxed">
                    Terminates external traffic, enforces OWASP response headers (HSTS 2-year preload, strict CSP, X-Content-Type-Options: nosniff), executes token bucket rate limiting, and dispatches audit requests to engine subprocesses.
                  </p>
                </div>

                <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0b192c]">
                    <Cpu className="h-4 w-4 text-purple-600" />
                    <span>Python & Native Engine Workers</span>
                  </div>
                  <p className="text-[#64748b] leading-relaxed">
                    Executes dedicated audit scripts (<code>website_health.py</code>, <code>edge_latency.py</code>, <code>ai_readiness.py</code>, etc.) in sandboxed child processes with a 40-second timeout guard and automatic fallback to native Node.js Cheerio AST engines.
                  </p>
                </div>

                <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0b192c]">
                    <Database className="h-4 w-4 text-emerald-600" />
                    <span>Cloud Persistence & Permalinks</span>
                  </div>
                  <p className="text-[#64748b] leading-relaxed">
                    Google Cloud Firestore stores structured audit reports, site uptime monitor histories, and user profiles. Generates deterministic SEO-friendly permalink routes (e.g. <code>/reports/example-com</code>).
                  </p>
                </div>

                <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0b192c]">
                    <Activity className="h-4 w-4 text-pink-600" />
                    <span>Client React UI & Visualization</span>
                  </div>
                  <p className="text-[#64748b] leading-relaxed">
                    Tailwind CSS and Lucide-powered executive dashboards, real-time streaming terminal outputs, multi-region latency radar charts, and instant JSON/PDF export modules.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Security & Sandbox Isolation */}
            <section id="security-sandbox" className="scroll-mt-24 space-y-6 border-t border-[#e2e8f0] pt-10">
              <h2 className="text-2xl font-bold text-[#0b192c] flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <span>Zero-Trust Sandbox & Ingress Protection</span>
              </h2>
              <p className="text-sm text-[#415a77] leading-relaxed">
                To guarantee security when analyzing arbitrary public URLs, all network requests are strictly sanitized against server-side request forgery (SSRF), command injection, and resource exhaustion:
              </p>

              <ul className="space-y-2 text-xs text-[#415a77]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Shell Escape Sanitization:</strong> All user-supplied URLs are scrubbed via <code>replace(/(["\\$`])/g, '\\$1')</code> before child process instantiation to eliminate CLI injection vectors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Memory & Buffer Caps:</strong> Execution buffers are restricted to a maximum of 5MB per audit stream with 40,000ms hard process timeouts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>OWASP Header Hardening:</strong> Built-in response headers enforce <code>Strict-Transport-Security: max-age=63072000; includeSubDomains; preload</code> and strict CSP rules.</span>
                </li>
              </ul>
            </section>

            {/* Section 4: Rate Limiting & Sliding Quotas */}
            <section id="rate-limiting" className="scroll-mt-24 space-y-6 border-t border-[#e2e8f0] pt-10">
              <h2 className="text-2xl font-bold text-[#0b192c] flex items-center gap-2">
                <Sliders className="h-6 w-6 text-indigo-600" />
                <span>Multi-Tier Sliding Rate Limiter</span>
              </h2>
              <p className="text-sm text-[#415a77] leading-relaxed">
                CatalystLab employs a hybrid client-device and IP rate limiter to protect upstream infrastructure and ensure fair resource allocation:
              </p>

              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">User Tier</th>
                      <th className="py-2.5 px-3">Daily Single Scans</th>
                      <th className="py-2.5 px-3">Daily Master Audits</th>
                      <th className="py-2.5 px-3">Identification Key</th>
                      <th className="py-2.5 px-3">Reset Window</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Anonymous Visitor</td>
                      <td className="py-2.5 px-3 font-mono">5 scans / day</td>
                      <td className="py-2.5 px-3 font-mono">1 audit / day</td>
                      <td className="py-2.5 px-3 text-[#64748b]"><code>vis_&#123;deviceId|IP&#125;</code></td>
                      <td className="py-2.5 px-3">Midnight UTC</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-sky-700">Authenticated User (Google)</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">10 scans / day</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">3 audits / day</td>
                      <td className="py-2.5 px-3 text-[#64748b]"><code>user_&#123;UID|Email&#125;</code></td>
                      <td className="py-2.5 px-3">Midnight UTC</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-purple-700">SuperAdmin Tier</td>
                      <td className="py-2.5 px-3 font-mono text-purple-700 font-bold">Unlimited</td>
                      <td className="py-2.5 px-3 font-mono text-purple-700 font-bold">Unlimited</td>
                      <td className="py-2.5 px-3 text-[#64748b]">Verified Admin Email</td>
                      <td className="py-2.5 px-3">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5: Telemetry Scoring Formula */}
            <section id="scoring-matrix" className="scroll-mt-24 space-y-6 border-t border-[#e2e8f0] pt-10">
              <h2 className="text-2xl font-bold text-[#0b192c] flex items-center gap-2">
                <Gauge className="h-6 w-6 text-amber-600" />
                <span>Mathematical Scoring Calculus & Weights</span>
              </h2>
              <p className="text-sm text-[#415a77] leading-relaxed">
                The Master Quality Score is an objective, deterministic 0–100 composite index calculated through weighted sub-engine scores and penalty deductions:
              </p>

              <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 font-mono text-xs text-[#0b192c] space-y-2">
                <div className="text-sky-700 font-bold">// Master Composite Score Formula:</div>
                <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-sm font-semibold">
                  Score = (0.20 &times; Health) + (0.20 &times; Latency) + (0.15 &times; AI_Ready) + (0.15 &times; Security) + (0.15 &times; Accessibility) + (0.15 &times; Eco) - Penalties
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Evaluation Vector</th>
                      <th className="py-2.5 px-3">Optimal Target</th>
                      <th className="py-2.5 px-3">Weight</th>
                      <th className="py-2.5 px-3">Direct Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">DOM Health & Depth</td>
                      <td className="py-2.5 px-3 text-[#415a77]">&le; 32 levels, &lt; 800 nodes</td>
                      <td className="py-2.5 px-3 font-mono font-bold">20%</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium">Core Web Vitals INP/CLS</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Global TTFB Latency</td>
                      <td className="py-2.5 px-3 text-[#415a77]">&lt; 350 ms across 12 PoPs</td>
                      <td className="py-2.5 px-3 font-mono font-bold">20%</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium">Server Latency & LCP</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">AI Search Readiness</td>
                      <td className="py-2.5 px-3 text-[#415a77]">llms.txt + JSON-LD Schemas</td>
                      <td className="py-2.5 px-3 font-mono font-bold">15%</td>
                      <td className="py-2.5 px-3 text-sky-700 font-medium">Perplexity/GPT Citation</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">OWASP SecOps & SSL</td>
                      <td className="py-2.5 px-3 text-[#415a77]">HSTS, CSP, X-Frame, TLS 1.3</td>
                      <td className="py-2.5 px-3 font-mono font-bold">15%</td>
                      <td className="py-2.5 px-3 text-rose-700 font-medium">Zero-Trust Security</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">WCAG 2.2 Accessibility</td>
                      <td className="py-2.5 px-3 text-[#415a77]">AA Contrast & ARIA Labels</td>
                      <td className="py-2.5 px-3 font-mono font-bold">15%</td>
                      <td className="py-2.5 px-3 text-amber-700 font-medium">Legal Compliance</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Eco Carbon Emissions</td>
                      <td className="py-2.5 px-3 text-[#415a77]">&lt; 0.25g CO2 / Page Load</td>
                      <td className="py-2.5 px-3 font-mono font-bold">15%</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium">ESG Sustainability</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* ENGINE 1: WEBSITE HEALTH & DOM */}
            {/* ========================================================================= */}
            <section id="engine-health" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/30">
                    <span className="material-symbols-outlined text-2xl">health_and_safety</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0b192c]">1. Website Health & DOM Engine</h2>
                    <div className="text-xs text-[#64748b]">Identifier: <code>health</code> | Script: <code>website_health.py</code></div>
                  </div>
                </div>
                <Link
                  to="/health"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-sky-400" />
                  <span>Launch Health Console</span>
                </Link>
              </div>

              <div className="text-sm text-[#415a77] leading-relaxed space-y-3">
                <p>
                  The Website Health engine evaluates Document Object Model (DOM) recursion depth, total node volume, synchronous render-blocking stylesheets/scripts, and initial HTML wire payload weight. Deeply nested DOM structures (such as excessive <code>&lt;div&gt;</code> nesting produced by unoptimized component trees) exponentially increase browser style recalculation and layout reflow time on mobile processors, directly degrading Google Core Web Vitals Interaction to Next Paint (INP) and Cumulative Layout Shift (CLS).
                </p>
              </div>

              {/* Step-by-Step Execution Pipeline */}
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b192c]">
                  Telemetry Execution Pipeline
                </h3>
                <ol className="space-y-2 text-xs text-[#415a77]">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[10px] font-bold shrink-0">1</span>
                    <span><strong>Network & Compression Profiling:</strong> Issues a streaming GET request with <code>Accept-Encoding: gzip, deflate, br</code>. Measures payload size and validates Brotli/Gzip wire compression.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[10px] font-bold shrink-0">2</span>
                    <span><strong>AST Traversal & Recursion Depth:</strong> Traverses the HTML document tree recursively using an iterative depth-first search (DFS) algorithm to calculate maximum nesting depth and count total elements.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[10px] font-bold shrink-0">3</span>
                    <span><strong>Render-Blocking Resource Detection:</strong> Inspects all <code>&lt;script&gt;</code> and <code>&lt;link rel="stylesheet"&gt;</code> tags in the <code>&lt;head&gt;</code>. Flags any synchronous scripts lacking <code>async</code> or <code>defer</code> attributes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[10px] font-bold shrink-0">4</span>
                    <span><strong>Resource Hints & Preconnect Audit:</strong> Checks for critical optimization tags such as <code>&lt;link rel="preconnect"&gt;</code> and <code>&lt;link rel="preload"&gt;</code> for fonts and external CDNs.</span>
                  </li>
                </ol>
              </div>

              {/* Threshold Benchmarks Table */}
              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
                    <tr>
                      <th className="py-2 px-3">Metric</th>
                      <th className="py-2 px-3">Pass (&ge; 90)</th>
                      <th className="py-2 px-3">Warning (70–89)</th>
                      <th className="py-2 px-3">Fail (&lt; 70)</th>
                      <th className="py-2 px-3">Remediation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
                    <tr>
                      <td className="py-2 px-3 font-semibold">DOM Max Depth</td>
                      <td className="py-2 px-3 text-emerald-700">&le; 32 levels</td>
                      <td className="py-2 px-3 text-amber-700">33 – 64 levels</td>
                      <td className="py-2 px-3 text-rose-700">&gt; 64 levels</td>
                      <td className="py-2 px-3 text-[#64748b]">Flatten React component trees; remove wrapper divs</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Total DOM Nodes</td>
                      <td className="py-2 px-3 text-emerald-700">&lt; 800 nodes</td>
                      <td className="py-2 px-3 text-amber-700">800 – 1,400 nodes</td>
                      <td className="py-2 px-3 text-rose-700">&gt; 1,400 nodes</td>
                      <td className="py-2 px-3 text-[#64748b]">Implement virtualized windowing (react-window) for long feeds</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">HTML Payload Size</td>
                      <td className="py-2 px-3 text-emerald-700">&lt; 100 KB</td>
                      <td className="py-2 px-3 text-amber-700">100 – 150 KB</td>
                      <td className="py-2 px-3 text-rose-700">&gt; 150 KB</td>
                      <td className="py-2 px-3 text-[#64748b]">Enable Brotli compression; prune large inlined state</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Render-Blocking Scripts</td>
                      <td className="py-2 px-3 text-emerald-700">0 blocking</td>
                      <td className="py-2 px-3 text-amber-700">1 – 2 blocking</td>
                      <td className="py-2 px-3 text-rose-700">&gt; 2 blocking</td>
                      <td className="py-2 px-3 text-[#64748b]">Add <code>defer</code> / <code>async</code> or move to footer</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Remediation Snippet */}
              <CodeSnippet
                title="Production NGINX Configuration (Brotli & Caching)"
                language="nginx"
                code={`# /etc/nginx/conf.d/performance.conf
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

# Aggressive cache headers for immutable static assets
location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 365d;
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header X-Content-Type-Options "nosniff";
}`}
              />
            </section>

            {/* ========================================================================= */}
            {/* ENGINE 2: GLOBAL EDGE LATENCY & ANYCAST */}
            {/* ========================================================================= */}
            <section id="engine-latency" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 border border-pink-500/30">
                    <span className="material-symbols-outlined text-2xl">public</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0b192c]">2. Global Edge Latency & Multi-Region Anycast</h2>
                    <div className="text-xs text-[#64748b]">Identifier: <code>latency</code> | Script: <code>edge_latency.py</code></div>
                  </div>
                </div>
                <Link
                  to="/latency"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-pink-400" />
                  <span>Launch Latency Radar</span>
                </Link>
              </div>

              <p className="text-sm text-[#415a77] leading-relaxed">
                Evaluates synthetic Time-To-First-Byte (TTFB), TCP handshake latency, TLS 1.3 0-RTT session resumption, and DNS Anycast routing across 12 distributed Points of Presence (PoPs): US East, US West, Frankfurt, London, Singapore, Tokyo, Sydney, São Paulo, Mumbai, Johannesburg, Bahrain, and Seoul.
              </p>

              {/* Step-by-Step Execution Pipeline */}
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b192c]">
                  Telemetry Execution Pipeline
                </h3>
                <ol className="space-y-2 text-xs text-[#415a77]">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[10px] font-bold shrink-0">1</span>
                    <span><strong>DNS Resolution & TLS Handshake:</strong> Measures socket connection timings down to the microsecond level using high-resolution timers (<code>performance.now()</code>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[10px] font-bold shrink-0">2</span>
                    <span><strong>Synthetic Anycast Multi-Region Simulation:</strong> Simulates geographic propagation delays based on international submarine fiber route distances, BGP routing hops, and origin CDN edge cache hit ratios.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[10px] font-bold shrink-0">3</span>
                    <span><strong>Edge Cache Status Header Extraction:</strong> Inspects CDN cache headers (<code>cf-cache-status</code>, <code>x-cache</code>, <code>x-vercel-cache</code>) to detect whether responses were served from memory at the edge or fetched from origin.</span>
                  </li>
                </ol>
              </div>

              {/* Thresholds Table */}
              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
                    <tr>
                      <th className="py-2 px-3">PoP Region</th>
                      <th className="py-2 px-3">Excellent (&lt; 150ms)</th>
                      <th className="py-2 px-3">Moderate (150–350ms)</th>
                      <th className="py-2 px-3">High Latency (&gt; 350ms)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
                    <tr>
                      <td className="py-2 px-3 font-semibold">North America & Europe</td>
                      <td className="py-2 px-3 text-emerald-700">&lt; 100 ms</td>
                      <td className="py-2 px-3 text-amber-700">100 – 250 ms</td>
                      <td className="py-2 px-3 text-rose-700">&gt; 250 ms</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Asia Pacific & Japan</td>
                      <td className="py-2 px-3 text-emerald-700">&lt; 180 ms</td>
                      <td className="py-2 px-3 text-amber-700">180 – 350 ms</td>
                      <td className="py-2 px-3 text-rose-700">&gt; 350 ms</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">South America & Africa</td>
                      <td className="py-2 px-3 text-emerald-700">&lt; 220 ms</td>
                      <td className="py-2 px-3 text-amber-700">220 – 400 ms</td>
                      <td className="py-2 px-3 text-rose-700">&gt; 400 ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <CodeSnippet
                title="Cloudflare Edge Worker Cache Recipe (sub-50ms TTFB)"
                language="typescript"
                code={`export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const cacheUrl = new URL(request.url);
    const cacheKey = new Request(cacheUrl.toString(), request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);
    if (!response) {
      response = await fetch(request);
      response = new Response(response.body, response);
      // Cache at edge for 1 hour, serve stale up to 24 hours while revalidating
      response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
      response.headers.set('X-Edge-Cache', 'HIT');
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  }
};`}
              />
            </section>

            {/* ========================================================================= */}
            {/* ENGINE 3: AI READINESS & LLMS.TXT */}
            {/* ========================================================================= */}
            <section id="engine-ai-readiness" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/30">
                    <span className="material-symbols-outlined text-2xl">psychology</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0b192c]">3. AI Readiness & /llms.txt Inspector</h2>
                    <div className="text-xs text-[#64748b]">Identifier: <code>ai_ready</code> | Script: <code>ai_readiness.py</code></div>
                  </div>
                </div>
                <Link
                  to="/ai-readiness"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-purple-400" />
                  <span>Launch AI Inspector</span>
                </Link>
              </div>

              <p className="text-sm text-[#415a77] leading-relaxed">
                Inspects whether autonomous AI crawlers (OpenAI <code>GPTBot</code>, Anthropic <code>ClaudeBot</code>, Perplexity <code>PerplexityBot</code>, Google <code>Google-Extended</code>, Apple <code>Applebot-Extended</code>) are allowed or blocked in <code>robots.txt</code>, checks for the presence of the proposed <code>/llms.txt</code> standard markdown manifest, and parses Schema.org JSON-LD entity graphs.
              </p>

              {/* Execution Pipeline */}
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b192c]">
                  Telemetry Execution Pipeline
                </h3>
                <ol className="space-y-2 text-xs text-[#415a77]">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[10px] font-bold shrink-0">1</span>
                    <span><strong>Robots.txt AI Directive Parser:</strong> Fetches <code>/robots.txt</code> and evaluates user-agent permission blocks for all 7 generative crawler agents.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[10px] font-bold shrink-0">2</span>
                    <span><strong>Root /llms.txt Standard Discovery:</strong> Probes <code>/llms.txt</code> and <code>/llms-full.txt</code> to verify plain-text Markdown summaries designed for LLM context ingestion.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[10px] font-bold shrink-0">3</span>
                    <span><strong>JSON-LD Schema Graph Extraction:</strong> Parses all <code>&lt;script type="application/ld+json"&gt;</code> blocks to confirm Schema.org validation (<code>Organization</code>, <code>TechArticle</code>, <code>FAQPage</code>).</span>
                  </li>
                </ol>
              </div>

              <CodeSnippet
                title="Specification-Compliant /public/llms.txt"
                language="markdown"
                code={`# CatalystLab Intelligence Platform
> Autonomous Web Telemetry & AI Diagnostic Engine

CatalystLab delivers sub-second deterministic audits across 8 vectors:
- Core Web Vitals (DOM recursion depth & node count)
- Global Anycast TTFB latency across 12 worldwide PoPs
- OWASP security headers (HSTS, CSP, X-Frame-Options)
- Sustainable Web Design (SWD) carbon footprint

## Key Endpoints
- [API Reference](https://www.catalystlab.tech/docs#api-run-engine): Programmatic execution
- [Diagnostic Console](https://www.catalystlab.tech/health): Interactive DOM inspector`}
              />
            </section>

            {/* ========================================================================= */}
            {/* ENGINE 4: GIT REPOSITORY HYGIENE & SECOPS */}
            {/* ========================================================================= */}
            <section id="engine-repo-scanner" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-600 border border-green-500/30">
                    <span className="material-symbols-outlined text-2xl">inventory_2</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0b192c]">4. Git Repository Hygiene & SecOps Engine</h2>
                    <div className="text-xs text-[#64748b]">Identifier: <code>repo</code> | Script: <code>repo_scanner.py</code></div>
                  </div>
                </div>
                <Link
                  to="/repo-scanner"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-green-400" />
                  <span>Launch Repo Scanner</span>
                </Link>
              </div>

              <p className="text-sm text-[#415a77] leading-relaxed">
                Evaluates GitHub, GitLab, and Bitbucket repositories for open-source license compliance (MIT, Apache-2.0, GPL), vulnerability disclosure policy (<code>SECURITY.md</code>), automated Dependabot configuration, CI/CD pipeline presence, and commit velocity.
              </p>

              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
                    <tr>
                      <th className="py-2 px-3">File / Capability</th>
                      <th className="py-2 px-3">Requirement Level</th>
                      <th className="py-2 px-3">Risk if Missing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
                    <tr>
                      <td className="py-2 px-3 font-semibold font-mono">LICENSE</td>
                      <td className="py-2 px-3 text-rose-700 font-bold">Mandatory</td>
                      <td className="py-2 px-3 text-[#64748b]">Unclear intellectual property rights and legal liability</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold font-mono">SECURITY.md</td>
                      <td className="py-2 px-3 text-amber-700 font-bold">Recommended</td>
                      <td className="py-2 px-3 text-[#64748b]">Public zero-day exploit disclosure without responsible triage</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold font-mono">.github/dependabot.yml</td>
                      <td className="py-2 px-3 text-sky-700 font-bold">Recommended</td>
                      <td className="py-2 px-3 text-[#64748b]">Stale npm/pip dependencies containing known CVE vulnerabilities</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <CodeSnippet
                title=".github/dependabot.yml Configuration Recipe"
                language="yaml"
                code={`version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"`}
              />
            </section>

            {/* ========================================================================= */}
            {/* ENGINE 5: ECO CARBON FOOTPRINT */}
            {/* ========================================================================= */}
            <section id="engine-eco-audit" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                    <span className="material-symbols-outlined text-2xl">eco</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0b192c]">5. Eco Carbon Footprint & Green Web Engine</h2>
                    <div className="text-xs text-[#64748b]">Identifier: <code>eco</code> | Script: <code>eco_carbon_audit.py</code></div>
                  </div>
                </div>
                <Link
                  to="/eco-audit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-emerald-400" />
                  <span>Launch Eco Audit</span>
                </Link>
              </div>

              <p className="text-sm text-[#415a77] leading-relaxed">
                Applies the internationally recognized <strong>Sustainable Web Design (SWD) Model v4</strong> to calculate energy consumption (kWh) and greenhouse gas emissions (g CO&#8322;) per 10,000 pageviews, incorporating Green Web Foundation origin server verification.
              </p>

              <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 font-mono text-xs text-[#0b192c] space-y-2">
                <div className="text-emerald-700 font-bold">// SWD Energy & Carbon Formula:</div>
                <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-xs">
                  E = [Data &times; 0.81 &times; 0.75 + Data &times; 0.81 &times; 0.25 &times; 0.02] kWh<br />
                  Carbon = E &times; 442 gCO2/kWh (Standard Grid) or E &times; 50 gCO2/kWh (Green Grid)
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
                    <tr>
                      <th className="py-2 px-3">Carbon Rating</th>
                      <th className="py-2 px-3">g CO2 / View</th>
                      <th className="py-2 px-3">Annual (100k views)</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-emerald-700">A+ (Pristine)</td>
                      <td className="py-2 px-3 font-mono">&lt; 0.095 g</td>
                      <td className="py-2 px-3 font-mono">9.5 kg CO2</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">Top 5% Worldwide</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-emerald-600">A (Eco-Friendly)</td>
                      <td className="py-2 px-3 font-mono">0.095 – 0.185 g</td>
                      <td className="py-2 px-3 font-mono">18.5 kg CO2</td>
                      <td className="py-2 px-3 text-emerald-600 font-bold">Sustainable</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-amber-600">C (Moderate)</td>
                      <td className="py-2 px-3 font-mono">0.341 – 0.495 g</td>
                      <td className="py-2 px-3 font-mono">49.5 kg CO2</td>
                      <td className="py-2 px-3 text-amber-600 font-bold">Average Web Page</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-rose-600">F (Heavy Emitter)</td>
                      <td className="py-2 px-3 font-mono">&gt; 0.850 g</td>
                      <td className="py-2 px-3 font-mono">&gt; 85.0 kg CO2</td>
                      <td className="py-2 px-3 text-rose-600 font-bold">High Carbon Risk</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* ENGINE 6: COMPLIANCE, RISK & OWASP HEADERS */}
            {/* ========================================================================= */}
            <section id="engine-compliance" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/30">
                    <span className="material-symbols-outlined text-2xl">shield</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0b192c]">6. Compliance, Risk & OWASP Security Headers</h2>
                    <div className="text-xs text-[#64748b]">Identifier: <code>compliance</code> | Script: <code>compliance_risk_audit.py</code></div>
                  </div>
                </div>
                <Link
                  to="/compliance"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-amber-400" />
                  <span>Launch Compliance Probe</span>
                </Link>
              </div>

              <p className="text-sm text-[#415a77] leading-relaxed">
                Performs defense-in-depth audits verifying OWASP cryptographic security headers (HSTS Preload, Content-Security-Policy, X-Content-Type-Options), TLS 1.3 cipher suite strength, WCAG 2.2 AA accessibility contrast ratios, and GDPR/CCPA cookie consent mechanisms.
              </p>

              <CodeSnippet
                title="Complete Enterprise OWASP Security Header Recipe"
                language="nginx"
                code={`# OWASP Recommended Production Headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; object-src 'none';" always;`}
              />
            </section>

            {/* ========================================================================= */}
            {/* ENGINE 7: AI SEARCH OPTIMIZATION (LLMO) */}
            {/* ========================================================================= */}
            <section id="engine-llmo" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
                    <span className="material-symbols-outlined text-2xl">smart_toy</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0b192c]">7. AI Search Optimization (LLMO / GEO)</h2>
                    <div className="text-xs text-[#64748b]">Identifier: <code>llmo</code> | Script: <code>llmo_optimizer.py</code></div>
                  </div>
                </div>
                <Link
                  to="/llmo"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-indigo-400" />
                  <span>Launch LLMO Optimizer</span>
                </Link>
              </div>

              <p className="text-sm text-[#415a77] leading-relaxed">
                Evaluates Retrieval-Augmented Generation (RAG) extractability, high-density factual information indexing, semantic heading hierarchy (H1 &rarr; H2 &rarr; H3), entity knowledge graphs, and brand authority citations for answer engines like Perplexity, ChatGPT Search, Gemini, and Claude.
              </p>

              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
                    <tr>
                      <th className="py-2 px-3">LLMO Vector</th>
                      <th className="py-2 px-3">Target Threshold</th>
                      <th className="py-2 px-3">Significance in AI RAG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
                    <tr>
                      <td className="py-2 px-3 font-semibold">Text-to-HTML Ratio</td>
                      <td className="py-2 px-3 font-mono text-emerald-700">&gt; 25%</td>
                      <td className="py-2 px-3 text-[#64748b]">Prevents crawler vectorization noise and token truncation</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Entity Graph Schema</td>
                      <td className="py-2 px-3 font-mono text-emerald-700">TechArticle / FAQPage</td>
                      <td className="py-2 px-3 text-[#64748b]">Enables zero-shot citation linking in Perplexity answers</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Author Authority</td>
                      <td className="py-2 px-3 font-mono text-emerald-700">Person + SameAs links</td>
                      <td className="py-2 px-3 text-[#64748b]">Establishes E-E-A-T trust signals for generative summarizers</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* ENGINE 8: PLATFORM MIGRATION RISK */}
            {/* ========================================================================= */}
            <section id="engine-migration" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/30">
                    <span className="material-symbols-outlined text-2xl">transform</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0b192c]">8. Platform Migration & SEO Parity Risk</h2>
                    <div className="text-xs text-[#64748b]">Identifier: <code>migration</code> | Script: <code>platform_migration_audit.py</code></div>
                  </div>
                </div>
                <Link
                  to="/migration"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-orange-400" />
                  <span>Launch Migration Pre-Flight</span>
                </Link>
              </div>

              <p className="text-sm text-[#415a77] leading-relaxed">
                Audits architectural debt, legacy CMS re-platforming risk (e.g. WordPress or Shopify to Next.js/Astro/Remix), 301 permanent redirect chain latency, canonical URL integrity, and OpenGraph social preview parity.
              </p>

              <CodeSnippet
                title="Next.js Zero-Downtime 301 Redirect Matrix"
                language="javascript"
                code={`// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/legacy-blog/:slug*',
        destination: '/blogs/:slug*',
        permanent: true, // Emits 301 Moved Permanently for SEO link equity
      },
      {
        source: '/wp-content/uploads/:year/:month/:file',
        destination: 'https://cdn.example.com/assets/:year/:month/:file',
        permanent: true,
      }
    ];
  }
};
export default nextConfig;`}
              />
            </section>

            {/* ========================================================================= */}
            {/* MASTER AUDIT SUITE ORCHESTRATION */}
            {/* ========================================================================= */}
            <section id="engine-master" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sky-400 border border-slate-700">
                    <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0b192c]">9. Master Full-Suite Orchestration Audit</h2>
                    <div className="text-xs text-[#64748b]">Identifier: <code>all</code> / <code>master-audit</code></div>
                  </div>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-sky-400" />
                  <span>Launch Master Audit</span>
                </Link>
              </div>

              <p className="text-sm text-[#415a77] leading-relaxed">
                The Master Audit executes all 8 sub-engines concurrently in isolated worker threads. It performs cross-engine correlation analysis (e.g. correlating excessive DOM recursion depth with mobile edge TTFB delays, or highlighting where missing CSP headers conflict with modern AI bot indexing).
              </p>
            </section>

            {/* ========================================================================= */}
            {/* REST API REFERENCE */}
            {/* ========================================================================= */}
            <section id="api-run-engine" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-[#0b192c] flex items-center gap-2">
                  <Code className="h-6 w-6 text-sky-600" />
                  <span>REST API Specification</span>
                </h2>

                <Link
                  to="/api-docs"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-[#38bdf8] shadow-md hover:bg-[#152238] transition"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Interactive API Playground</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Callout to Dedicated API Reference */}
              <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-950 flex items-center justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Explore All 24+ REST Endpoints:</strong> Looking for endpoint schemas, live telemetry sandboxing, multi-language SDK code generation (cURL, JS, Python, Go, Rust, PHP), and automated CI/CD deployment test runners? Visit our full <Link to="/api-docs" className="font-bold text-sky-800 underline">Interactive API Reference & Studio</Link>.
                  </div>
                </div>
                <Link
                  to="/api-docs"
                  className="shrink-0 rounded-lg bg-sky-700 px-3 py-1.5 font-bold text-white text-xs hover:bg-sky-800 transition"
                >
                  Open Studio
                </Link>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="rounded-md bg-emerald-600 px-2.5 py-1 font-bold text-white">POST</span>
                  <span className="font-bold text-sm text-[#0b192c]">/api/run-engine</span>
                </div>

                <p className="text-sm text-[#415a77]">
                  Dispatches a synchronous telemetry audit against any public domain or Git repository.
                </p>

                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b192c] mt-4">
                  Request Parameters
                </h3>
                <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
                      <tr>
                        <th className="py-2 px-3">Field</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Required</th>
                        <th className="py-2 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold">url</td>
                        <td className="py-2 px-3 font-mono text-sky-700">string</td>
                        <td className="py-2 px-3 text-rose-600 font-bold">Yes</td>
                        <td className="py-2 px-3 text-[#415a77]">Target web address (e.g. <code>https://example.com</code>) or Git repository URL.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold">engine</td>
                        <td className="py-2 px-3 font-mono text-sky-700">string</td>
                        <td className="py-2 px-3 text-rose-600 font-bold">Yes</td>
                        <td className="py-2 px-3 text-[#415a77]">Engine identifier (<code>health</code>, <code>latency</code>, <code>ai_ready</code>, <code>repo</code>, <code>eco</code>, <code>compliance</code>, <code>llmo</code>, <code>migration</code>).</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold">userEmail</td>
                        <td className="py-2 px-3 font-mono text-sky-700">string</td>
                        <td className="py-2 px-3 text-[#64748b]">Optional</td>
                        <td className="py-2 px-3 text-[#415a77]">Authenticated user's email for higher quota allotment and auto-save.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold">visitorId</td>
                        <td className="py-2 px-3 font-mono text-sky-700">string</td>
                        <td className="py-2 px-3 text-[#64748b]">Optional</td>
                        <td className="py-2 px-3 text-[#415a77]">Client device fingerprint hash for rate limit attribution.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <CodeSnippet
                  title="cURL Terminal Invocation"
                  language="bash"
                  code={`curl -X POST https://www.catalystlab.tech/api/run-engine \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "engine": "health"
  }'`}
                />
              </div>
            </section>

            {/* Section: Probe API */}
            <section id="api-probe" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="rounded-md bg-emerald-600 px-2.5 py-1 font-bold text-white">POST</span>
                <span className="font-bold text-sm text-[#0b192c]">/api/monitor/probe</span>
              </div>
              <p className="text-sm text-[#415a77]">
                Performs a lightweight HTTP status, SSL certificate expiration, and response time probe for automated uptime monitoring.
              </p>
            </section>

            {/* Section: System Health API */}
            <section id="api-system-health" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="rounded-md bg-sky-600 px-2.5 py-1 font-bold text-white">GET</span>
                <span className="font-bold text-sm text-[#0b192c]">/api/monitor/system-health</span>
              </div>
              <p className="text-sm text-[#415a77]">
                Returns live server infrastructure telemetry, node process memory usage, active engines count, and uptime seconds.
              </p>
            </section>

            {/* Section: JSON Response Schema */}
            <section id="api-schema" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <h3 className="text-lg font-bold text-[#0b192c]">Standard JSON Response Payload</h3>
              <CodeSnippet
                title="Response 200 OK"
                language="json"
                code={`{
  "success": true,
  "engine": "health",
  "url": "https://example.com",
  "rateLimit": {
    "tier": "visitor",
    "remaining": 4,
    "limit": 5
  },
  "output": "--- CORE WEBSITE HEALTH ANALYSIS ---\\nTarget: https://example.com\\n[*] 1. Network & Payload Profiling...\\n  [>] HTML Payload Size: 1.25 KB\\n  [>] Time To First Byte (TTFB proxy): 142 ms\\n  [+] PASS: Lean HTML payload.\\n[*] 2. DOM Complexity & Nesting Tree Depth...\\n  [>] Max DOM Tree Depth: 8 levels\\n  [>] Total DOM Elements: 48 nodes\\n  [+] PASS: Clean shallow DOM tree.\\n[*] Final Score: 100/100"
}`}
              />
            </section>

            {/* ========================================================================= */}
            {/* CI/CD & DEVOPS AUTOMATION */}
            {/* ========================================================================= */}
            <section id="ci-github" className="scroll-mt-24 space-y-6 border-t-2 border-[#0b192c] pt-10">
              <h2 className="text-2xl font-bold text-[#0b192c] flex items-center gap-2">
                <Workflow className="h-6 w-6 text-emerald-600" />
                <span>CI/CD Automation & Quality Gates</span>
              </h2>
              <p className="text-sm text-[#415a77] leading-relaxed">
                Integrate CatalystLab into your continuous deployment pipeline to prevent pull request merges that introduce render-blocking scripts, excessive DOM recursion, or missing OWASP security headers:
              </p>

              <CodeSnippet
                title=".github/workflows/catalystlab-quality-gate.yml"
                language="yaml"
                code={`name: CatalystLab Quality Gate
on:
  pull_request:
    branches: [main]

jobs:
  telemetry-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger CatalystLab Diagnostic Scan
        run: |
          RESPONSE=$(curl -s -X POST https://www.catalystlab.tech/api/run-engine \\
            -H "Content-Type: application/json" \\
            -d '{"engine":"health","url":"\${{ secrets.STAGING_DEPLOY_URL }}"}')
          echo "Audit Output: $RESPONSE"`}
              />
            </section>

            {/* Section: GitLab CI */}
            <section id="ci-gitlab" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <h3 className="text-lg font-bold text-[#0b192c]">GitLab CI Integration</h3>
              <CodeSnippet
                title=".gitlab-ci.yml"
                language="yaml"
                code={`catalystlab_quality_check:
  stage: test
  image: curlimages/curl:latest
  script:
    - curl -s -X POST https://www.catalystlab.tech/api/run-engine -H "Content-Type: application/json" -d '{"engine":"compliance","url":"'$CI_ENVIRONMENT_URL'"}'`}
              />
            </section>

            {/* Section: Webhooks */}
            <section id="ci-webhooks" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <h3 className="text-lg font-bold text-[#0b192c]">Automated Telemetry Alerts & Webhooks</h3>
              <p className="text-sm text-[#415a77]">
                Configure real-time Slack and Discord alerts when monitored domain scores drop below specified quality thresholds.
              </p>
            </section>

            {/* Helpful Feedback Box */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs mt-12">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#0b192c]">Was this technical documentation helpful?</div>
                  <div className="text-xs text-[#64748b] mt-0.5">Let us know how we can improve our developer guides.</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFeedbackGiven('yes')}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                      feedbackGiven === 'yes'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-[#e2e8f0] bg-white text-[#415a77] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>Yes</span>
                  </button>
                  <button
                    onClick={() => setFeedbackGiven('no')}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                      feedbackGiven === 'no'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-[#e2e8f0] bg-white text-[#415a77] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    <span>No</span>
                  </button>
                </div>
              </div>
              {feedbackGiven && (
                <div className="mt-3 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Thank you for your feedback! Our telemetry engineering team reviews updates weekly.</span>
                </div>
              )}
            </div>

          </main>

          {/* Right Column: "On This Page" Sticky Table of Contents */}
          <aside className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0b192c]">
                On This Page
              </div>
              <ul className="space-y-1.5 text-xs border-l border-[#e2e8f0] pl-3 max-h-[calc(100vh-180px)] overflow-y-auto">
                {docNav.flatMap((g) => g.items).map((item) => {
                  const isCurrent = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className={`text-left transition-colors hover:text-[#0b192c] truncate block w-full py-0.5 ${
                          isCurrent
                            ? 'font-bold text-[#0b192c] border-l-2 -ml-[13px] pl-2.5 border-[#0b192c]'
                            : 'text-[#64748b]'
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="pt-4 border-t border-[#e2e8f0] space-y-2 text-xs text-[#64748b]">
                <Link to="/blogs" className="flex items-center gap-1.5 hover:text-[#0b192c] transition-colors">
                  <FileText className="h-3.5 w-3.5 text-[#415a77]" />
                  <span>Developer Blog</span>
                </Link>
                <Link to="/contact" className="flex items-center gap-1.5 hover:text-[#0b192c] transition-colors">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#415a77]" />
                  <span>Developer Support</span>
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
};

export default DocsPage;
