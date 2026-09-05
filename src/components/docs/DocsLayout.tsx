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
import { CopyButton } from '../ui/CopyButton';

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
  const handleRunInCli = () => {
    const cmd = runnableCommand || (code.startsWith('catalyst') || code.startsWith('curl') || code.startsWith('npm') ? code.split('\n')[0] : 'catalyst audit');
    window.dispatchEvent(new CustomEvent('catalyst:cli-run', { detail: { command: cmd } }));
  };

  return (
    <div className="docs-codeblock my-5 overflow-hidden rounded-lg border border-white/10 bg-[#0B0B0B] dark:bg-[#050505]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 text-xs">
        <span className="font-medium text-[#999999]">{title || language}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRunInCli}
            className="inline-flex h-7 items-center gap-1 rounded px-2 text-[12px] font-medium text-[#0066FF] hover:bg-[#0066FF]/10 transition-colors"
            title="Run in CLI"
          >
            <Play className="size-3 fill-current" />
            Run
          </button>
          <CopyButton
            text={code}
            variant="terminal"
            label="Copy"
            copiedLabel="Copied"
            className="h-7 text-[11px] px-2"
          />
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};

interface DocsLayoutProps {
  title: string;
  description: string;
  canonicalPath: string;
  children: React.ReactNode;
}

export const DocsLayout: React.FC<DocsLayoutProps> = ({
  title,
  description,
  canonicalPath,
  children,
}) => {
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!contentRef.current) return;
    const headings = Array.from(contentRef.current.querySelectorAll('h2, h3'));
    const newToc = headings.map((h) => ({
      id: h.id || h.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
      text: h.textContent || '',
      level: parseInt(h.tagName.substring(1))
    }));
    // Assign ids to headings if missing
    headings.forEach((h, i) => {
      if (!h.id) h.id = newToc[i].id;
    });
    setToc(newToc);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [children]);

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
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
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
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

  
  const isCurrent = (path: string) =>
    path === currentPath || (path === '/docs' && (currentPath === '/docs' || currentPath === '/docs/overview'));

  const NavTree = (
    <nav aria-label="Documentation" className="docs-sidenav-inner">
      <Link to="/docs" className="mb-4 flex items-center gap-2 px-1 no-underline">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#0066FF] text-[#0066FF]-foreground text-sm font-bold">C</span>
        <span className="leading-tight">
          <span className="block text-[13px] font-medium text-white">CatalystLab</span>
          <span className="block text-[11px] text-[#999999]">Documentation</span>
        </span>
      </Link>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#999999]" />
        <input
          ref={searchRef}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter docs"
          aria-label="Filter documentation"
          className="h-9 w-full rounded-full border border-white/10 bg-[#000000] pl-9 pr-10 text-[13px] text-white outline-none placeholder:text-[#999999] focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-[#999999]">
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
              className="flex h-9 w-full items-center justify-between rounded-md px-2 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-[#999999] hover:bg-accent"
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
                            ? 'border-[#0066FF] bg-[#0066FF]/10 font-semibold text-white'
                            : 'border-transparent text-[#999999] hover:text-white hover:bg-white/5'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span className="ml-2 shrink-0 rounded-full bg-[#0066FF]/10 px-1.5 py-0.5 font-mono text-[10px] text-[#0066FF]">
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

  
  return (
    <div className="docs-devsite min-h-screen bg-[#000000] text-white">
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
        <aside className="hidden w-[268px] shrink-0 border-r border-white/10 lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-3 py-5">{NavTree}</div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[min(86vw,300px)] overflow-y-auto bg-[#050505] px-3 py-5 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Docs</span>
                <button type="button" onClick={() => setMobileNavOpen(false)} className="flex size-9 items-center justify-center rounded-full hover:bg-accent" aria-label="Close">
                  <X className="size-5" />
                </button>
              </div>
              {NavTree}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="sticky top-16 z-30 flex h-12 items-center justify-between gap-3 border-b border-white/10 bg-[#000000]/95 px-4 backdrop-blur lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-accent lg:hidden"
                aria-label="Open documentation menu"
              >
                <Menu className="size-5" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              
              <button
                type="button"
                onClick={() => setCliOpen((v) => !v)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium ${
                  cliOpen
                    ? 'bg-[#0066FF]/10 text-[#0066FF]'
                    : 'text-[#999999] hover:text-white hover:bg-accent'
                }`}
              >
                <TerminalIcon className="size-4" />
                <span className="hidden sm:inline">Try it</span>
              </button>
              <Link
                to="/contact"
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#999999] hover:text-white hover:bg-accent"
              >
                <MessageSquare className="size-4" />
                <span className="hidden md:inline">Send feedback</span>
              </Link>
            </div>
          </div>

          

          <div className="flex">
            <article className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 xl:max-w-[860px]">
              <header className="mb-8">
                <p className="mb-2 text-[13px] font-medium text-[#0066FF]">CatalystLab documentation</p>
                <h1 className="text-4xl font-display font-medium leading-tight text-white sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-[42rem] text-[16px] leading-7 text-[#999999]">{description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#999999]">
                  <span>Stay organized with collections</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime="2026-09-03">Last updated 2026-09-03 UTC</time>
                </div>
              </header>

              <div ref={contentRef} className="docs-content docs-devsite-article">{children}</div>

              <nav className="mt-12 grid grid-cols-1 gap-3 border-t border-white/10 pt-6 sm:grid-cols-2" aria-label="Page pagination">
                {prevItem ? (
                  <Link
                    to={prevItem.path}
                    className="group flex flex-col gap-1 rounded-lg border border-white/10 p-4 no-underline hover:border-primary"
                  >
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#999999]">
                      <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                      Previous
                    </span>
                    <span className="text-[15px] text-[#0066FF]">{prevItem.title}</span>
                  </Link>
                ) : (
                  <div />
                )}
                {nextItem && (
                  <Link
                    to={nextItem.path}
                    className="group flex flex-col items-end gap-1 rounded-lg border border-white/10 p-4 text-right no-underline hover:border-primary sm:col-start-2"
                  >
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#999999]">
                      Next
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="text-[15px] text-[#0066FF]">{nextItem.title}</span>
                  </Link>
                )}
              </nav>

              <div className="mt-8 rounded-lg border border-white/10 p-5">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[15px] font-medium text-white">Was this helpful?</p>
                    <p className="text-[13px] text-[#999999]">Except as otherwise noted, content is licensed for developer use.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven('yes')}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium ${
                        feedbackGiven === 'yes'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-white/10 text-white hover:bg-accent'
                      }`}
                    >
                      <ThumbsUp className="size-4" /> Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven('no')}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium ${
                        feedbackGiven === 'no'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-white/10 text-white hover:bg-accent'
                      }`}
                    >
                      <ThumbsDown className="size-4" /> No
                    </button>
                  </div>
                </div>
                {feedbackGiven && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    Thank you for your feedback.
                  </p>
                )}
              </div>

              <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[12px] text-[#999999]">
                <p>Except as otherwise noted, the content of this page is licensed for CatalystLab developer documentation.</p>
                <div className="flex gap-4">
                  <Link to="/blogs" className="inline-flex items-center gap-1 hover:text-[#0066FF]">
                    <BookOpen className="size-3.5" /> Blog
                  </Link>
                  <Link to="/contact" className="inline-flex items-center gap-1 hover:text-[#0066FF]">
                    <HelpCircle className="size-3.5" /> Support
                  </Link>
                </div>
              </footer>
            </article>

            <aside className="hidden xl:block w-[240px] shrink-0 border-l border-white/10 py-8 px-6">
              <div className="sticky top-24">
                <h4 className="text-sm font-semibold text-white mb-4">On this page</h4>
                <nav className="flex flex-col gap-2.5">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`text-[13px] leading-tight transition-colors ${
                        activeId === item.id ? 'text-[#0066FF] font-medium' : 'text-[#999999] hover:text-white'
                      }`}
                      style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
</div>
</div>
      </div>

      
      {/* Mobile Sticky Bottom Pill */}
      {!mobileNavOpen && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center lg:hidden pointer-events-none">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="pointer-events-auto bg-[#0B0B0B]/95 backdrop-blur-xl border border-white/10 text-white shadow-[0_12px_36px_-8px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.12)] px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-[#161616] transition-colors"
          >
            <Menu className="size-4" /> Table of Contents
          </button>
        </div>
      )}
      
      {cliOpen && (

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#050505] shadow-xl lg:left-[268px]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <span className="text-[13px] font-medium">Try it in the CLI</span>
            <button type="button" onClick={() => setCliOpen(false)} className="flex size-8 items-center justify-center rounded-full hover:bg-accent" aria-label="Close CLI">
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
