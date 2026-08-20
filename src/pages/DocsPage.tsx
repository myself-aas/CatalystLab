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
  Server
} from 'lucide-react';
import { LazyReveal, LazyCard } from '../components/common/LazyAnimate';
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
    <div className="my-5 overflow-hidden rounded-xl border border-[#415a77]/30 bg-[#0b192c] shadow-md">
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
      group: 'Architecture & Fundamentals',
      items: [
        { id: 'overview', title: 'System Overview' },
        { id: 'quickstart', title: 'Quickstart Tutorial' },
        { id: 'scoring-matrix', title: 'Scoring Telemetry Formula' },
      ],
    },
    {
      group: '8 Diagnostic Engines Deep-Dive',
      items: [
        { id: 'engine-health', title: '1. Website Health & DOM' },
        { id: 'engine-ai-readiness', title: '2. AI Readiness & llms.txt' },
        { id: 'engine-repo-scanner', title: '3. Repository Hygiene' },
        { id: 'engine-latency', title: '4. Global Edge Latency (12 PoPs)' },
        { id: 'engine-eco-audit', title: '5. Eco-Carbon & Green Hosting' },
        { id: 'engine-compliance', title: '6. Compliance & OWASP Headers' },
        { id: 'engine-llmo', title: '7. AI Search Optimization (LLMO)' },
        { id: 'engine-migration', title: '8. Platform Migration Risk' },
      ],
    },
    {
      group: 'REST API & Reference',
      items: [
        { id: 'api-auth', title: 'Authentication & Headers' },
        { id: 'api-run-engine', title: 'POST /api/run-engine' },
        { id: 'api-schema', title: 'JSON Response Payload' },
        { id: 'api-limits', title: 'Rate Limiting & Quotas' },
      ],
    },
    {
      group: 'CI/CD & Integrations',
      items: [
        { id: 'ci-github', title: 'GitHub Actions Quality Gate' },
        { id: 'ci-gitlab', title: 'GitLab CI / CLI Integration' },
        { id: 'ci-webhooks', title: 'Telemetry Webhooks' },
      ],
    },
  ];

  // Scrollspy
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

      {/* Google Developers Top Header with Breadcrumbs and Global Search */}
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
              <span className="hidden sm:inline">Search docs & blogs...</span>
              <kbd className="rounded border border-[#e2e8f0] bg-white px-1.5 py-0.2 text-[10px] font-mono text-[#94a3b8]">⌘K</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-Layout Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Google Developers Sticky Navigation Sidebar */}
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

          {/* Center Column: Rich Main Documentation Stream */}
          <main className="lg:col-span-7 space-y-12">
            
            {/* Section 1: Overview */}
            <section id="overview" className="scroll-mt-24 space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-0.5 text-xs font-semibold text-sky-800">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                <span>Architecture Guide</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b192c] tracking-tight">
                CatalystLab Architecture & Diagnostic Specification
              </h1>
              <p className="text-sm text-[#415a77] leading-relaxed">
                CatalystLab is an enterprise-grade automated telemetry and web quality intelligence platform. It orchestrates synchronous diagnostics across 8 isolated evaluation modules to measure Core Web Vitals, AI LLM crawler accessibility, Git repository hygiene, multi-region edge latency, OWASP compliance, and green hosting carbon metrics.
              </p>

              {/* Google Developers Callout: Note */}
              <div className="rounded-xl border-l-4 border-sky-500 bg-sky-50/70 p-4 text-xs text-sky-950">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Note:</strong> All diagnostic engines run in sandboxed worker environments with headless DOM tree parsers, socket timing probes, and TLS certificate inspectors without executing untrusted third-party client-side JavaScript.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Quickstart */}
            <section id="quickstart" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-10">
              <h2 className="text-2xl font-bold text-[#0b192c]">Step-by-Step Quickstart</h2>
              <p className="text-sm text-[#415a77] leading-relaxed">
                You can execute a full multi-engine audit using the visual web interface or programmatically via our JSON REST API endpoint:
              </p>

              <div className="space-y-3">
                <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b192c] mb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[11px]">1</span>
                    <span>Define Target Endpoint</span>
                  </div>
                  <p className="text-xs text-[#64748b]">
                    Provide any public domain (e.g. <code>https://example.com</code>) or Git repository URL (e.g. <code>https://github.com/org/repo</code>).
                  </p>
                </div>

                <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b192c] mb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[11px]">2</span>
                    <span>Dispatch Audit Request</span>
                  </div>
                  <CodeSnippet
                    title="cURL Terminal Execution"
                    language="bash"
                    code={`curl -X POST https://www.catalystlab.tech/api/run-engine \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "engine": "all"
  }'`}
                  />
                </div>

                <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b192c] mb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b192c] text-white text-[11px]">3</span>
                    <span>Ingest Telemetry Report</span>
                  </div>
                  <p className="text-xs text-[#64748b]">
                    The response includes normalized 0-100 scores, microsecond-accurate edge latency timings, and prioritized remediation suggestions.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Telemetry Scoring Matrix */}
            <section id="scoring-matrix" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-10">
              <h2 className="text-2xl font-bold text-[#0b192c]">Telemetry Scoring & Geometric Weights</h2>
              <p className="text-sm text-[#415a77] leading-relaxed">
                The master score is an objective composite weighted index:
              </p>

              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Vector</th>
                      <th className="py-2.5 px-3">Target Standard</th>
                      <th className="py-2.5 px-3">Weight</th>
                      <th className="py-2.5 px-3">Impact</th>
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

            {/* Section 4: 8 Diagnostic Engines Deep Dive */}
            <section id="engine-health" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-600 text-base">health_and_safety</span>
                  <span>1. Website Health & DOM Engine</span>
                </h2>
                <Link to="/health" className="text-xs font-semibold text-[#415a77] hover:text-[#0b192c] flex items-center gap-1">
                  <span>Open Console</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm text-[#415a77]">
                Analyzes Document Object Model recursion depth, DOM node volume, synchronous stylesheet blocking, and preconnect meta declarations. Excessive depth triggers severe layout thrashing and reflow latency on mobile CPUs.
              </p>
            </section>

            <section id="engine-ai-readiness" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-base">psychology</span>
                  <span>2. AI Readiness & llms.txt Inspector</span>
                </h2>
                <Link to="/ai-readiness" className="text-xs font-semibold text-[#415a77] hover:text-[#0b192c] flex items-center gap-1">
                  <span>Open Console</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm text-[#415a77]">
                Checks whether generative AI crawlers (<code>GPTBot</code>, <code>ClaudeBot</code>, <code>PerplexityBot</code>, <code>Google-Extended</code>) are blocked in <code>robots.txt</code>, confirms presence of <code>/llms.txt</code> markdown digests, and inspects JSON-LD graph structures for LLM indexing.
              </p>
            </section>

            <section id="engine-repo-scanner" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-base">inventory_2</span>
                  <span>3. Repository Hygiene & SecOps</span>
                </h2>
                <Link to="/repo-scanner" className="text-xs font-semibold text-[#415a77] hover:text-[#0b192c] flex items-center gap-1">
                  <span>Open Console</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm text-[#415a77]">
                Evaluates GitHub/GitLab repository architecture, license declarations, SECURITY.md triage policies, Dependabot configurations, and stale commit velocity.
              </p>
            </section>

            <section id="engine-latency" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-pink-600 text-base">public</span>
                  <span>4. Global Edge Latency Radar</span>
                </h2>
                <Link to="/latency" className="text-xs font-semibold text-[#415a77] hover:text-[#0b192c] flex items-center gap-1">
                  <span>Open Console</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm text-[#415a77]">
                Dispatches edge probes to measure real-world Time-To-First-Byte (TTFB) across 12 global regions (North America, Europe, Asia Pacific, South America) to identify routing bottlenecks and origin caching gaps.
              </p>
            </section>

            <section id="engine-eco-audit" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-base">eco</span>
                  <span>5. Eco-Carbon & Green Hosting Audit</span>
                </h2>
                <Link to="/eco-audit" className="text-xs font-semibold text-[#415a77] hover:text-[#0b192c] flex items-center gap-1">
                  <span>Open Console</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm text-[#415a77]">
                Applies the Sustainable Web Design model to estimate kilowatt-hours (kWh) per 10,000 page views and validates Green Web Foundation certification for origin CDN providers.
              </p>
            </section>

            <section id="engine-compliance" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-base">shield</span>
                  <span>6. Compliance & Risk Mitigation</span>
                </h2>
                <Link to="/compliance" className="text-xs font-semibold text-[#415a77] hover:text-[#0b192c] flex items-center gap-1">
                  <span>Open Console</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm text-[#415a77]">
                Audits WCAG 2.2 AA accessibility contrast ratios, GDPR/CCPA cookie compliance, and OWASP cryptographic security headers (HSTS, CSP, X-Content-Type-Options).
              </p>
            </section>

            <section id="engine-llmo" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-base">smart_toy</span>
                  <span>7. AI Search Optimization (LLMO)</span>
                </h2>
                <Link to="/llmo" className="text-xs font-semibold text-[#415a77] hover:text-[#0b192c] flex items-center gap-1">
                  <span>Open Console</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm text-[#415a77]">
                Evaluates semantic citation readiness, AI content extractability, entity graph depth, and brand authority for generative answer engines like Perplexity, ChatGPT Search, and Gemini.
              </p>
            </section>

            <section id="engine-migration" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b192c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-600 text-base">transform</span>
                  <span>8. Platform Migration Risk Audit</span>
                </h2>
                <Link to="/migration" className="text-xs font-semibold text-[#415a77] hover:text-[#0b192c] flex items-center gap-1">
                  <span>Open Console</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm text-[#415a77]">
                Evaluates architectural debt, legacy CMS re-platforming risk, headless decoupling blockers, and CDN edge-routing compatibility.
              </p>
            </section>

            {/* Section 5: REST API Reference */}
            <section id="api-run-engine" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-10">
              <h2 className="text-2xl font-bold text-[#0b192c]">REST API Reference</h2>
              
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="rounded-md bg-emerald-600 px-2 py-1 font-bold text-white">POST</span>
                <span className="font-bold text-[#0b192c]">/api/run-engine</span>
              </div>

              <p className="text-sm text-[#415a77]">
                Executes a live audit probe against a targeted web application or Git repository URL.
              </p>

              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b192c] mt-4">Request Body Parameters</h3>
              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Required</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold">url</td>
                      <td className="py-2.5 px-3 font-mono text-sky-700">string</td>
                      <td className="py-2.5 px-3 text-rose-600 font-bold">Yes</td>
                      <td className="py-2.5 px-3 text-[#415a77]">Fully-qualified target URL or GitHub repo path.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold">engine</td>
                      <td className="py-2.5 px-3 font-mono text-sky-700">string</td>
                      <td className="py-2.5 px-3 text-[#64748b]">Optional</td>
                      <td className="py-2.5 px-3 text-[#415a77]">Engine identifier (<code>all</code>, <code>health</code>, <code>ai_ready</code>, <code>repo</code>, <code>latency</code>, <code>eco</code>, <code>compliance</code>, <code>llmo</code>, <code>migration</code>). Defaults to <code>all</code>.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6: JSON Response Schema */}
            <section id="api-schema" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-10">
              <h2 className="text-xl font-bold text-[#0b192c]">JSON Response Schema</h2>
              <CodeSnippet
                title="Response 200 OK"
                language="json"
                code={`{
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
  },
  "remediation": [
    "[+] Pass: HSTS header deployed with max-age=31536000",
    "[+] Pass: /llms.txt discovered and validated",
    "[~] Notice: 1 image missing descriptive alt attribute"
  ]
}`}
              />
            </section>

            {/* Section 7: CI/CD Quality Gate */}
            <section id="ci-github" className="scroll-mt-24 space-y-4 border-t border-[#e2e8f0] pt-10">
              <h2 className="text-2xl font-bold text-[#0b192c]">GitHub Actions CI/CD Quality Gate</h2>
              <p className="text-sm text-[#415a77]">
                Integrate CatalystLab into your pull request workflows to prevent merging regressions that breach DOM limits or missing security headers.
              </p>

              <CodeSnippet
                title=".github/workflows/catalystlab-audit.yml"
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
            -d '{"engine":"all","url":"\${{ secrets.STAGING_DEPLOY_URL }}"}')
          echo "Audit completed successfully: $RESPONSE"`}
              />
            </section>

            {/* Helpful Feedback Box (Google Developers Style) */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs mt-12">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#0b192c]">Was this documentation page helpful?</div>
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

          {/* Right Column: Google Developers "On This Page" Sticky Table of Contents */}
          <aside className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0b192c]">
                On This Page
              </div>
              <ul className="space-y-1.5 text-xs border-l border-[#e2e8f0] pl-3">
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
