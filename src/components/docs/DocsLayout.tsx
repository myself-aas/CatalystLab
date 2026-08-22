import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  ExternalLink,
  Search,
  Check,
  Copy,
  ChevronRight,
  Sparkles,
  Layers,
  FileText,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Info,
  CheckCircle2,
  Menu,
  X,
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
  Play
} from 'lucide-react';
import { SEOHead } from '../common/SEOHead';

export interface DocNavItem {
  id: string;
  path: string;
  title: string;
  badge?: string;
}

export interface DocNavGroup {
  group: string;
  items: DocNavItem[];
}

export const DOC_NAVIGATION: DocNavGroup[] = [
  {
    group: 'Platform Architecture',
    items: [
      { id: 'overview', path: '/docs', title: 'System Overview & Philosophy' },
      { id: 'architecture', path: '/docs/architecture', title: 'Full-Stack Architecture' },
      { id: 'security-sandbox', path: '/docs/security-sandbox', title: 'Zero-Trust Probe Sandbox' },
      { id: 'rate-limiting', path: '/docs/rate-limiting', title: 'Sliding Token Rate Limiter' },
      { id: 'scoring-matrix', path: '/docs/scoring-matrix', title: 'Scoring Formula & Weights' },
    ],
  },
  {
    group: '8 SDLC Catalysts Deep-Dive',
    items: [
      { id: 'synthshift', path: '/docs/synthshift', title: '1. SynthShift (Phase 1)', badge: 'Phase 1' },
      { id: 'gitlygase', path: '/docs/gitlygase', title: '2. GitLygase (Phase 2)', badge: 'Phase 2' },
      { id: 'ecoholo', path: '/docs/ecoholo', title: '3. EcoHolo (Phase 3)', badge: 'Phase 3' },
      { id: 'vitalzyme', path: '/docs/vitalzyme', title: '4. VitalZyme (Phase 4)', badge: 'Phase 4' },
      { id: 'edgevmax', path: '/docs/edgevmax', title: '5. EdgeVmax (Phase 5)', badge: 'Phase 5' },
      { id: 'riskprotease', path: '/docs/riskprotease', title: '6. RiskProtease (Phase 6)', badge: 'Phase 6' },
      { id: 'llm-kinase', path: '/docs/llm-kinase', title: '7. LLM-Kinase (Phase 7)', badge: 'Phase 7' },
      { id: 'allostersearch', path: '/docs/allostersearch', title: '8. AllosterSearch (Phase 8)', badge: 'Phase 8' },
      { id: 'orchestrator', path: '/docs/orchestrator', title: '9. Master Suite Orchestrator', badge: 'Master' },
    ],
  },
  {
    group: 'REST API & Reference',
    items: [
      { id: 'api-reference', path: '/docs/api', title: 'REST API Specification' },
      { id: 'api-interactive', path: '/api-docs', title: 'Interactive API Studio ↗' },
      { id: 'api-playground', path: '/playground', title: 'Live API Playground ↗' },
    ],
  },
  {
    group: 'CI/CD & DevOps Automation',
    items: [
      { id: 'cicd', path: '/docs/cicd', title: 'CI/CD Quality Gates & DevOps' },
    ],
  },
];

interface CodeSnippetProps {
  code: string;
  language: string;
  title?: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, language, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-[#415a77]/30 bg-[#0b192c] shadow-md">
      <div className="flex items-center justify-between border-b border-[#415a77]/25 bg-[#091524] px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-sm font-semibold text-[#c5d3e8]">{title || language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md border border-[#415a77]/40 bg-[#152238] px-2.5 py-1 text-sm font-medium text-[#c5d3e8] hover:bg-[#1f314d] hover:text-[#f8fafc] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-[#f8fafc] bg-[#050d18]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

interface TocItem {
  id: string;
  title: string;
}

interface DocsLayoutProps {
  title: string;
  description: string;
  canonicalPath: string;
  toc?: TocItem[];
  children: React.ReactNode;
}

export const DocsLayout: React.FC<DocsLayoutProps> = ({
  title,
  description,
  canonicalPath,
  toc = [],
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
  const [activeTocId, setActiveTocId] = useState<string>('');

  // Scrollspy for on-page table of contents
  useEffect(() => {
    if (toc.length === 0) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (let i = toc.length - 1; i >= 0; i--) {
        const el = document.getElementById(toc[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveTocId(toc[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  // Flattened navigation list for previous/next page calculation
  const allNavItems = DOC_NAVIGATION.flatMap((g) => g.items);
  const currentPath = location.pathname.replace(/\/$/, '') || '/docs';
  const currentIndex = allNavItems.findIndex(
    (item) => item.path === currentPath || (currentPath === '/docs' && item.path === '/docs')
  );

  const prevItem = currentIndex > 0 ? allNavItems[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < allNavItems.length - 1 ? allNavItems[currentIndex + 1] : null;

  // Filter navigation by sidebar search query
  const filteredNav = DOC_NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((group) => group.items.length > 0);

  const scrollToTocSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveTocId(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b192c] selection:bg-[#415a77]/25 selection:text-[#0b192c]">
      <SEOHead
        title={`${title} | CatalystLab Documentation`}
        description={description}
        keywords={[
          'CatalystLab documentation',
          'telemetry API',
          'Core Web Vitals audit',
          'llms.txt specification',
          'edge latency TTFB',
          'OWASP compliance headers',
          'eco carbon audit',
          'REST API reference',
        ]}
        canonicalUrl={`https://www.catalystlab.tech${canonicalPath}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title,
          description: description,
          author: {
            '@type': 'Organization',
            name: 'CatalystLab Telemetry Team',
            url: 'https://www.catalystlab.tech',
          },
        }}
      />

      {/* Docs Toolbar with Mobile Menu Toggle and Global Search */}
      <div className="border-b border-[#e2e8f0] bg-white sticky top-16 z-30 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#415a77] hover:bg-[#f1f5f9] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="Toggle docs navigation"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#415a77] lg:hidden">
              Docs Navigation
            </span>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs sm:text-sm text-[#64748b] hover:border-[#cbd5e1] hover:text-[#0b192c] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Search documentation (Cmd+K)"
            >
              <Search className="h-3.5 w-3.5 text-[#415a77]" />
              <span className="hidden sm:inline">Search documentation...</span>
              <kbd className="rounded border border-[#e2e8f0] bg-white px-1.5 py-0.2 text-xs font-mono text-[#94a3b8]">⌘K</kbd>
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
                <div className="text-sm font-bold uppercase tracking-wider text-[#415a77]">
                  Documentation Index
                </div>
                <div className="text-sm text-[#64748b] mt-0.5">v2.4 Telemetry Specification</div>
                
                {/* Search in sidebar */}
                <div className="mt-3 relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#94a3b8]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter topics..."
                    className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] py-1.5 pl-8 pr-3 text-xs text-[#0b192c] placeholder:text-[#94a3b8] focus:border-[#415a77] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {filteredNav.map((group) => (
                <div key={group.group} className="space-y-2">
                  <div className="text-xs font-bold text-[#0b192c] uppercase tracking-wider">
                    {group.group}
                  </div>
                  <ul className="space-y-1 border-l-2 border-[#e2e8f0] pl-2.5">
                    {group.items.map((item) => {
                      const isCurrent = 
                        item.path === currentPath ||
                        (item.path === '/docs' && (currentPath === '/docs' || currentPath === '/docs/overview'));

                      return (
                        <li key={item.id}>
                          <Link
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition-all flex items-center justify-between ${
                              isCurrent
                                ? 'bg-[#0b192c] text-white font-bold shadow-xs'
                                : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#f1f5f9]'
                            }`}
                          >
                            <span className="truncate">{item.title}</span>
                            {isCurrent && <ChevronRight className="h-3 w-3 text-white shrink-0 ml-1" />}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <div className="pt-4 border-t border-[#e2e8f0] space-y-2">
                <Link
                  to="/blogs"
                  className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm text-[#415a77] hover:bg-[#f1f5f9] hover:text-[#0b192c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#415a77]" />
                    <span className="font-semibold">Developer Blog</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm text-[#415a77] hover:bg-[#f1f5f9] hover:text-[#0b192c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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

          {/* Center Column: Documentation Content */}
          <main className={`${toc.length > 0 ? 'lg:col-span-7' : 'lg:col-span-9'} space-y-12`}>
            {children}

            {/* Pagination Controls: Previous & Next Page */}
            <div className="pt-8 border-t border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevItem ? (
                <Link
                  to={prevItem.path}
                  className="flex flex-col gap-1 rounded-xl border border-[#e2e8f0] bg-white p-4 text-left transition-all hover:border-[#cbd5e1] hover:bg-[#f8fafc] shadow-xs group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <span className="text-xs font-semibold text-[#64748b] flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
                    <span>Previous</span>
                  </span>
                  <span className="text-sm font-bold text-[#0b192c] group-hover:text-sky-700 transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    {prevItem.title}
                  </span>
                </Link>
              ) : <div />}

              {nextItem ? (
                <Link
                  to={nextItem.path}
                  className="flex flex-col items-end gap-1 rounded-xl border border-[#e2e8f0] bg-white p-4 text-right transition-all hover:border-[#cbd5e1] hover:bg-[#f8fafc] shadow-xs group sm:col-start-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <span className="text-xs font-semibold text-[#64748b] flex items-center gap-1">
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
                  </span>
                  <span className="text-sm font-bold text-[#0b192c] group-hover:text-sky-700 transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    {nextItem.title}
                  </span>
                </Link>
              ) : null}
            </div>

            {/* Helpful Feedback Box */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-base font-bold text-[#0b192c]">Was this documentation helpful?</div>
                  <div className="text-sm text-[#64748b] mt-0.5">Let us know how we can improve our developer guides.</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFeedbackGiven('yes')}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
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
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
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
                <div className="mt-3 text-sm text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Thank you for your feedback! Our telemetry engineering team reviews updates weekly.</span>
                </div>
              )}
            </div>
          </main>

          {/* Right Column: "On This Page" Sticky Table of Contents */}
          {toc.length > 0 && (
            <aside className="hidden lg:col-span-2 lg:block">
              <div className="sticky top-28 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0b192c]">
                  On This Page
                </div>
                <ul className="space-y-1.5 text-xs border-l border-[#e2e8f0] pl-3 max-h-[calc(100vh-180px)] overflow-y-auto">
                  {toc.map((item) => {
                    const isCurrent = activeTocId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToTocSection(item.id)}
                          className={`text-left transition-colors hover:text-[#0b192c] truncate block w-full py-0.5 cursor-pointer ${
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
                  <Link to="/blogs" className="flex items-center gap-1.5 hover:text-[#0b192c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <FileText className="h-3.5 w-3.5 text-[#415a77]" />
                    <span>Developer Blog</span>
                  </Link>
                  <Link to="/contact" className="flex items-center gap-1.5 hover:text-[#0b192c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#415a77]" />
                    <span>Developer Support</span>
                  </Link>
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
};
