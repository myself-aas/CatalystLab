import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';

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
      const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SITE_NAVIGATION.map((g) => [g.group, true]))
  );

  const currentPath = location.pathname.replace(/\/$/, '') || '/';

  useEffect(() => {
    setMobileNavOpen(false);
    
  }, [location.pathname]);

  
  
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

          <div className="flex">
            <div ref={articleRef} className="devsite-article min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-10 xl:max-w-[960px]">
              {children}
            </div>
                      </div>
        </div>
      </div>
    </div>
  );
};

export default DevSiteLayout;
