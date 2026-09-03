import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { resolveBreadcrumbs } from './GlobalBreadcrumb';

export interface SiteNavItem {
  id: string;
  path: string;
  title: string;
  badge?: string;
}

export interface SiteNavGroup {
  group: string;
  items: SiteNavItem[];
}

export const SITE_NAVIGATION: SiteNavGroup[] = [
  {
    group: 'Platform',
    items: [
      { id: 'home', path: '/', title: 'Home' },
      { id: 'audit', path: '/launch-audit', title: 'Master audit' },
      { id: 'pricing', path: '/pricing', title: 'Pricing' },
      { id: 'products', path: '/products', title: 'Products' },
      { id: 'compare', path: '/compare', title: 'Compare' },
      { id: 'reports', path: '/reports', title: 'Reports' },
    ],
  },
  {
    group: 'Diagnostic engines',
    items: [
      { id: 'health', path: '/health', title: 'VitalZyme', badge: '1' },
      { id: 'repo', path: '/repo-scanner', title: 'GitLygase', badge: '2' },
      { id: 'eco', path: '/eco-audit', title: 'EcoHolo', badge: '3' },
      { id: 'latency', path: '/latency', title: 'EdgeVmax', badge: '4' },
      { id: 'compliance', path: '/compliance', title: 'RiskProtease', badge: '5' },
      { id: 'ai', path: '/ai-readiness', title: 'LLM-Kinase', badge: '6' },
      { id: 'migration', path: '/migration', title: 'SynthShift', badge: '7' },
      { id: 'llmo', path: '/llmo', title: 'AllosterSearch', badge: '8' },
    ],
  },
  {
    group: 'Developers',
    items: [
      { id: 'docs', path: '/docs', title: 'Documentation' },
      { id: 'api', path: '/api-docs', title: 'API studio' },
      { id: 'playground', path: '/playground', title: 'Playground' },
    ],
  },
  {
    group: 'Company',
    items: [
      { id: 'about', path: '/about', title: 'About' },
      { id: 'blogs', path: '/blogs', title: 'Blog' },
      { id: 'contact', path: '/contact', title: 'Contact' },
      { id: 'legal', path: '/legal', title: 'Legal' },
    ],
  },
];

interface TocItem {
  id: string;
  title: string;
}

interface DevSiteLayoutProps {
  children: React.ReactNode;
}

const slugify = (value: string, index: number) => {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
  return base || `section-${index}`;
};

export const DevSiteLayout: React.FC<DevSiteLayoutProps> = ({ children }) => {
  const location = useLocation();
  const articleRef = React.useRef<HTMLDivElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SITE_NAVIGATION.map((g) => [g.group, true]))
  );

  const currentPath = location.pathname.replace(/\/$/, '') || '/';
  const crumbMeta = resolveBreadcrumbs(location.pathname, location.search);

  useEffect(() => {
    setMobileNavOpen(false);
    setMobileTocOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    const collect = () => {
      const nodes = Array.from(root.querySelectorAll('h2, h3')) as HTMLElement[];
      const items: TocItem[] = [];
      const seen = new Set<string>();
      nodes.forEach((el, index) => {
        const title = (el.textContent || '').trim();
        if (!title || title.length > 80) return;
        if (!el.id) el.id = slugify(title, index);
        if (seen.has(el.id)) return;
        seen.add(el.id);
        items.push({ id: el.id, title });
      });
      setToc(items.slice(0, 18));
    };

    collect();
    const observer = new MutationObserver(collect);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

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

  const isCurrent = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath === '/index.html';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const related = useMemo(() => {
    const all = SITE_NAVIGATION.flatMap((g) => g.items);
    const idx = all.findIndex((item) => isCurrent(item.path) && item.path !== '/');
    if (idx < 0) return all.filter((item) => item.path !== currentPath).slice(0, 5);
    return [all[idx - 1], all[idx + 1], all[idx + 2]].filter(Boolean) as SiteNavItem[];
  }, [currentPath]);

  const scrollToTocSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveTocId(id);
      setMobileTocOpen(false);
    }
  };

  const NavTree = (
    <nav aria-label="Site sections" className="devsite-sidenav">
      <Link to="/" className="mb-4 flex items-center gap-2 px-1 no-underline">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#1a73e8] text-sm font-bold text-white">C</span>
        <span className="leading-tight">
          <span className="block text-[13px] font-medium text-[#202124] dark:text-[#e8eaed]">CatalystLab</span>
          <span className="block text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">Developer platform</span>
        </span>
      </Link>

      {SITE_NAVIGATION.map((group) => {
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

  const TocList = (
    <nav aria-label="On this page">
      <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6]">
        {toc.length > 0 ? 'On this page' : 'Related'}
      </p>
      {toc.length > 0 ? (
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
      ) : (
        <ul className="space-y-1">
          {related.map((item) => (
            <li key={item.id}>
              <Link to={item.path} className="block py-1 text-[13px] text-[#1a73e8] hover:underline dark:text-[#8ab4f8]">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );

  return (
    <div className="devsite-shell min-h-full bg-[#fff] text-[#202124] dark:bg-[#202124] dark:text-[#e8eaed]">
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-[268px] shrink-0 border-r border-[#dadce0] lg:block dark:border-white/10">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-3 py-5">{NavTree}</div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[min(86vw,300px)] overflow-y-auto bg-white px-3 py-5 shadow-xl dark:bg-[#202124]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Menu</span>
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
                aria-label="Open site menu"
              >
                <Menu className="size-5" />
              </button>
              <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-[13px] text-[#5f6368] sm:flex dark:text-[#9aa0a6]">
                <Link to="/" className="hover:text-[#1a73e8] dark:hover:text-[#8ab4f8]">Home</Link>
                {crumbMeta?.crumbs.map((crumb, idx) => (
                  <React.Fragment key={`${crumb.label}-${idx}`}>
                    <ChevronRight className="size-3.5 shrink-0 opacity-60" />
                    {crumb.href && !crumb.isCurrent ? (
                      <Link to={crumb.href} className="truncate hover:text-[#1a73e8] dark:hover:text-[#8ab4f8]">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="truncate text-[#202124] dark:text-[#e8eaed]">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>
            <button
              type="button"
              onClick={() => setMobileTocOpen((v) => !v)}
              className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-[#1a73e8] hover:bg-[#e8f0fe] xl:hidden dark:text-[#8ab4f8] dark:hover:bg-white/5"
            >
              On this page
              <ChevronDown className={`size-4 ${mobileTocOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {mobileTocOpen && (
            <div className="border-b border-[#dadce0] bg-white px-4 py-3 xl:hidden dark:border-white/10 dark:bg-[#202124]">
              {TocList}
            </div>
          )}

          <div className="flex">
            <div ref={articleRef} className="devsite-article min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-10 xl:max-w-[960px]">
              {children}
            </div>
            <aside className="hidden w-[220px] shrink-0 xl:block">
              <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto py-8 pr-4">{TocList}</div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevSiteLayout;
