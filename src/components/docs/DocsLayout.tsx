import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  HelpCircle,
  Menu,
  MessageSquare,
  Play,
  Search,
  Terminal as TerminalIcon,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { SEOHead } from '../common/SEOHead';
import { CLISimulator } from './CLISimulator';

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
    group: 'Get started',
    items: [
      { id: 'overview', path: '/docs', title: 'Overview' },
      { id: 'architecture', path: '/docs/architecture', title: 'Architecture' },
      { id: 'security-sandbox', path: '/docs/security-sandbox', title: 'Security sandbox' },
      { id: 'rate-limiting', path: '/docs/rate-limiting', title: 'Rate limiting' },
      { id: 'scoring-matrix', path: '/docs/scoring-matrix', title: 'Scoring matrix' },
    ],
  },
  {
    group: 'Diagnostic engines',
    items: [
      { id: 'synthshift', path: '/docs/synthshift', title: 'SynthShift', badge: '1' },
      { id: 'gitlygase', path: '/docs/gitlygase', title: 'GitLygase', badge: '2' },
      { id: 'ecoholo', path: '/docs/ecoholo', title: 'EcoHolo', badge: '3' },
      { id: 'vitalzyme', path: '/docs/vitalzyme', title: 'VitalZyme', badge: '4' },
      { id: 'edgevmax', path: '/docs/edgevmax', title: 'EdgeVmax', badge: '5' },
      { id: 'riskprotease', path: '/docs/riskprotease', title: 'RiskProtease', badge: '6' },
      { id: 'llm-kinase', path: '/docs/llm-kinase', title: 'LLM-Kinase', badge: '7' },
      { id: 'allostersearch', path: '/docs/allostersearch', title: 'AllosterSearch', badge: '8' },
      { id: 'orchestrator', path: '/docs/orchestrator', title: 'Master orchestrator' },
    ],
  },
  {
    group: 'API reference',
    items: [
      { id: 'api-reference', path: '/docs/api', title: 'REST API' },
      { id: 'api-interactive', path: '/api-docs', title: 'API studio' },
      { id: 'api-playground', path: '/playground', title: 'Playground' },
    ],
  },
  {
    group: 'Guides',
    items: [
      { id: 'cicd', path: '/docs/cicd', title: 'CI/CD quality gates' },
    ],
  },
];

interface CodeSnippetProps {
  code: string;
  language: string;
  title?: string;
  runnableCommand?: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, language, title, runnableCommand }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunInCli = () => {
    const cmd = runnableCommand || (code.startsWith('catalyst') || code.startsWith('curl') || code.startsWith('npm') ? code.split('\n')[0] : 'catalyst audit');
    window.dispatchEvent(new CustomEvent('catalyst:cli-run', { detail: { command: cmd } }));
  };

  return (
    <div className="docs-codeblock my-5 overflow-hidden rounded-lg border border-[#dadce0] dark:border-white/10 bg-[#f8f9fa] dark:bg-[#202124]">
      <div className="flex items-center justify-between border-b border-[#dadce0] dark:border-white/10 px-3 py-1.5 text-xs">
        <span className="font-medium text-[#5f6368] dark:text-[#9aa0a6]">{title || language}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRunInCli}
            className="inline-flex h-8 items-center gap-1 rounded px-2 text-[12px] font-medium text-[#1a73e8] hover:bg-[#e8f0fe] dark:text-[#8ab4f8] dark:hover:bg-white/5"
            title="Run in CLI"
          >
            <Play className="size-3 fill-current" />
            Run
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex h-8 items-center gap-1 rounded px-2 text-[12px] font-medium text-[#5f6368] hover:bg-[#e8eaed] dark:text-[#9aa0a6] dark:hover:bg-white/5"
            title="Copy code"
          >
            {copied ? <Check className="size-3.5 text-[#188038]" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-[#202124] dark:text-[#e8eaed]">
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
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
  const [activeTocId, setActiveTocId] = useState('');
  const [cliOpen, setCliOpen] = useState(false);
  const [injectedCommand, setInjectedCommand] = useState('catalyst run --engine vitalzyme');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DOC_NAVIGATION.map((g) => [g.group, true]))
  );

  useEffect(() => {
    const handleCliRun = (e: Event) => {
      const customEvent = e as CustomEvent<{ command: string }>;
      if (customEvent.detail?.command) {
        setInjectedCommand(customEvent.detail.command);
        setCliOpen(true);
      }
    };
    window.addEventListener('catalyst:cli-run', handleCliRun);
    return () => window.removeEventListener('catalyst:cli-run', handleCliRun);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setMobileNavOpen(false);
        setMobileTocOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  useEffect(() => {
    setMobileNavOpen(false);
    setMobileTocOpen(false);
  }, [location.pathname]);

  const allNavItems = DOC_NAVIGATION.flatMap((g) => g.items);
  const currentPath = location.pathname.replace(/\/$/, '') || '/docs';
  const currentIndex = allNavItems.findIndex(
    (item) => item.path === currentPath || (currentPath === '/docs' && item.path === '/docs')
  );
  const currentItem = currentIndex >= 0 ? allNavItems[currentIndex] : null;
  const prevItem = currentIndex > 0 ? allNavItems[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < allNavItems.length - 1 ? allNavItems[currentIndex + 1] : null;

  const filteredNav = useMemo(
    () =>
      DOC_NAVIGATION.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase())),
      })).filter((group) => group.items.length > 0),
    [searchQuery]
  );

  const scrollToTocSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveTocId(id);
      setMobileTocOpen(false);
    }
  };

  const isCurrent = (path: string) =>
    path === currentPath || (path === '/docs' && (currentPath === '/docs' || currentPath === '/docs/overview'));

  const NavTree = (
    <nav aria-label="Documentation" className="docs-sidenav-inner">
      <Link to="/docs" className="mb-4 flex items-center gap-2 px-1 no-underline">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#1a73e8] text-white text-sm font-bold">C</span>
        <span className="leading-tight">
          <span className="block text-[13px] font-medium text-[#202124] dark:text-[#e8eaed]">CatalystLab</span>
          <span className="block text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">Documentation</span>
        </span>
      </Link>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#5f6368]" />
        <input
          ref={searchRef}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter docs"
          aria-label="Filter documentation"
          className="h-9 w-full rounded-full border border-[#dadce0] bg-white pl-9 pr-10 text-[13px] text-[#202124] outline-none placeholder:text-[#80868b] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] dark:border-white/15 dark:bg-[#303134] dark:text-[#e8eaed]"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[#dadce0] bg-[#f8f9fa] px-1.5 py-0.5 font-mono text-[10px] text-[#5f6368] dark:border-white/15 dark:bg-[#3c4043] dark:text-[#9aa0a6]">
          /
        </kbd>
      </div>

      {filteredNav.map((group) => {
        const expanded = openGroups[group.group] !== false;
        return (
          <div key={group.group} className="mb-1">
            <button
              type="button"
              onClick={() => setOpenGroups((prev) => ({ ...prev, [group.group]: !expanded }))}
              className="flex h-9 w-full items-center justify-between rounded-md px-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-white/5"
              aria-expanded={expanded}
            >
              {group.group}
              <ChevronDown className={`size-4 transition-transform ${expanded ? '' : '-rotate-90'}`} />
            </button>
            {expanded && (
              <ul className="mb-2">
                {group.items.map((item) => {
                  const active = isCurrent(item.path);
                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex min-h-9 items-center justify-between rounded-r-full border-l-[3px] py-1.5 pl-3 pr-3 text-[13px] leading-snug no-underline ${
                          active
                            ? 'border-[#1a73e8] bg-[#e8f0fe] font-medium text-[#1967d2] dark:border-[#8ab4f8] dark:bg-[#174ea6]/30 dark:text-[#8ab4f8]'
                            : 'border-transparent text-[#3c4043] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-white/5'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span className="ml-2 shrink-0 rounded-full bg-[#e8f0fe] px-1.5 py-0.5 font-mono text-[10px] text-[#1967d2] dark:bg-[#174ea6]/40 dark:text-[#8ab4f8]">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  const TocList = toc.length > 0 && (
    <nav aria-label="On this page">
      <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6]">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-[#dadce0] dark:border-white/15">
        {toc.map((item) => {
          const active = activeTocId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollToTocSection(item.id)}
                className={`block w-full border-l-2 py-1 pl-3 pr-2 text-left text-[13px] leading-snug ${
                  active
                    ? '-ml-px border-[#1a73e8] font-medium text-[#1a73e8] dark:border-[#8ab4f8] dark:text-[#8ab4f8]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:text-[#e8eaed]'
                }`}
              >
                {item.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="docs-devsite min-h-screen bg-[#fff] text-[#202124] dark:bg-[#202124] dark:text-[#e8eaed]">
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
          description,
          author: {
            '@type': 'Organization',
            name: 'CatalystLab Telemetry Team',
            url: 'https://www.catalystlab.tech',
          },
        }}
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-[268px] shrink-0 border-r border-[#dadce0] lg:block dark:border-white/10">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-3 py-5">{NavTree}</div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[min(86vw,300px)] overflow-y-auto bg-white px-3 py-5 shadow-xl dark:bg-[#202124]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Docs</span>
                <button type="button" onClick={() => setMobileNavOpen(false)} className="flex size-9 items-center justify-center rounded-full hover:bg-[#f1f3f4]" aria-label="Close">
                  <X className="size-5" />
                </button>
              </div>
              {NavTree}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="sticky top-16 z-30 flex h-12 items-center justify-between gap-3 border-b border-[#dadce0] bg-white/95 px-4 backdrop-blur lg:px-8 dark:border-white/10 dark:bg-[#202124]/95">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-[#f1f3f4] lg:hidden dark:hover:bg-white/5"
                aria-label="Open documentation menu"
              >
                <Menu className="size-5" />
              </button>
              <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-[13px] text-[#5f6368] sm:flex dark:text-[#9aa0a6]">
                <Link to="/" className="hover:text-[#1a73e8] dark:hover:text-[#8ab4f8]">Home</Link>
                <ChevronRight className="size-3.5 shrink-0 opacity-60" />
                <Link to="/docs" className="hover:text-[#1a73e8] dark:hover:text-[#8ab4f8]">Docs</Link>
                {currentItem && currentItem.path !== '/docs' && (
                  <>
                    <ChevronRight className="size-3.5 shrink-0 opacity-60" />
                    <span className="truncate text-[#202124] dark:text-[#e8eaed]">{currentItem.title}</span>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-1">
              {toc.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMobileTocOpen((v) => !v)}
                  className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-[#1a73e8] hover:bg-[#e8f0fe] xl:hidden dark:text-[#8ab4f8] dark:hover:bg-white/5"
                >
                  On this page
                  <ChevronDown className={`size-4 ${mobileTocOpen ? 'rotate-180' : ''}`} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setCliOpen((v) => !v)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium ${
                  cliOpen
                    ? 'bg-[#e8f0fe] text-[#1967d2] dark:bg-[#174ea6]/40 dark:text-[#8ab4f8]'
                    : 'text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-white/5'
                }`}
              >
                <TerminalIcon className="size-4" />
                <span className="hidden sm:inline">Try it</span>
              </button>
              <Link
                to="/contact"
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-white/5"
              >
                <MessageSquare className="size-4" />
                <span className="hidden md:inline">Send feedback</span>
              </Link>
            </div>
          </div>

          {mobileTocOpen && toc.length > 0 && (
            <div className="border-b border-[#dadce0] bg-white px-4 py-3 xl:hidden dark:border-white/10 dark:bg-[#202124]">
              {TocList}
            </div>
          )}

          <div className="flex">
            <article className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 xl:max-w-[860px]">
              <header className="mb-8">
                <p className="mb-2 text-[13px] font-medium text-[#1a73e8] dark:text-[#8ab4f8]">CatalystLab documentation</p>
                <h1 className="text-[2rem] font-normal leading-tight tracking-tight text-[#202124] sm:text-[2.5rem] dark:text-[#e8eaed]">
                  {title}
                </h1>
                <p className="mt-3 max-w-[42rem] text-[16px] leading-7 text-[#3c4043] dark:text-[#9aa0a6]">{description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
                  <span>Stay organized with collections</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime="2026-09-03">Last updated 2026-09-03 UTC</time>
                </div>
              </header>

              {toc.length > 0 && (
                <aside className="mb-8 rounded-lg border border-[#dadce0] bg-[#f8f9fa] p-4 dark:border-white/10 dark:bg-[#303134]">
                  <p className="mb-2 text-[13px] font-medium text-[#202124] dark:text-[#e8eaed]">Page summary</p>
                  <ul className="list-disc space-y-1 pl-5 text-[14px] leading-6 text-[#3c4043] dark:text-[#9aa0a6]">
                    {toc.slice(0, 4).map((item) => (
                      <li key={item.id}>
                        <button type="button" onClick={() => scrollToTocSection(item.id)} className="text-left text-[#1a73e8] hover:underline dark:text-[#8ab4f8]">
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}

              <div className="docs-content docs-devsite-article">{children}</div>

              <nav className="mt-12 grid grid-cols-1 gap-3 border-t border-[#dadce0] pt-6 sm:grid-cols-2 dark:border-white/10" aria-label="Page pagination">
                {prevItem ? (
                  <Link
                    to={prevItem.path}
                    className="group flex flex-col gap-1 rounded-lg border border-[#dadce0] p-4 no-underline hover:border-[#1a73e8] dark:border-white/15 dark:hover:border-[#8ab4f8]"
                  >
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6]">
                      <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                      Previous
                    </span>
                    <span className="text-[15px] text-[#1a73e8] dark:text-[#8ab4f8]">{prevItem.title}</span>
                  </Link>
                ) : (
                  <div />
                )}
                {nextItem && (
                  <Link
                    to={nextItem.path}
                    className="group flex flex-col items-end gap-1 rounded-lg border border-[#dadce0] p-4 text-right no-underline hover:border-[#1a73e8] sm:col-start-2 dark:border-white/15 dark:hover:border-[#8ab4f8]"
                  >
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6]">
                      Next
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="text-[15px] text-[#1a73e8] dark:text-[#8ab4f8]">{nextItem.title}</span>
                  </Link>
                )}
              </nav>

              <div className="mt-8 rounded-lg border border-[#dadce0] p-5 dark:border-white/15">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[15px] font-medium text-[#202124] dark:text-[#e8eaed]">Was this helpful?</p>
                    <p className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">Except as otherwise noted, content is licensed for developer use.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven('yes')}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium ${
                        feedbackGiven === 'yes'
                          ? 'border-[#188038] bg-[#e6f4ea] text-[#188038]'
                          : 'border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4] dark:border-white/15 dark:text-[#e8eaed] dark:hover:bg-white/5'
                      }`}
                    >
                      <ThumbsUp className="size-4" /> Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven('no')}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium ${
                        feedbackGiven === 'no'
                          ? 'border-[#d93025] bg-[#fce8e6] text-[#d93025]'
                          : 'border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4] dark:border-white/15 dark:text-[#e8eaed] dark:hover:bg-white/5'
                      }`}
                    >
                      <ThumbsDown className="size-4" /> No
                    </button>
                  </div>
                </div>
                {feedbackGiven && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-[#188038]">
                    <CheckCircle2 className="size-4" />
                    Thank you for your feedback.
                  </p>
                )}
              </div>

              <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#dadce0] pt-5 text-[12px] text-[#5f6368] dark:border-white/10 dark:text-[#9aa0a6]">
                <p>Except as otherwise noted, the content of this page is licensed for CatalystLab developer documentation.</p>
                <div className="flex gap-4">
                  <Link to="/blogs" className="inline-flex items-center gap-1 hover:text-[#1a73e8] dark:hover:text-[#8ab4f8]">
                    <BookOpen className="size-3.5" /> Blog
                  </Link>
                  <Link to="/contact" className="inline-flex items-center gap-1 hover:text-[#1a73e8] dark:hover:text-[#8ab4f8]">
                    <HelpCircle className="size-3.5" /> Support
                  </Link>
                </div>
              </footer>
            </article>

            {toc.length > 0 && (
              <aside className="hidden w-[220px] shrink-0 xl:block">
                <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto py-8 pr-4">{TocList}</div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {cliOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dadce0] bg-white shadow-[0_-8px_32px_rgba(32,33,36,0.12)] dark:border-white/10 dark:bg-[#202124] lg:left-[268px]">
          <div className="flex items-center justify-between border-b border-[#dadce0] px-4 py-2 dark:border-white/10">
            <span className="text-[13px] font-medium">Try it in the CLI</span>
            <button type="button" onClick={() => setCliOpen(false)} className="flex size-8 items-center justify-center rounded-full hover:bg-[#f1f3f4] dark:hover:bg-white/5" aria-label="Close CLI">
              <X className="size-4" />
            </button>
          </div>
          <div className="max-h-[42vh] overflow-hidden">
            <CLISimulator key={injectedCommand} initialCommand={injectedCommand} className="rounded-none border-0 shadow-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsLayout;
