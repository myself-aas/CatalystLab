import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';

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

interface DevSiteLayoutProps {
  children: React.ReactNode;
}

export const DevSiteLayout: React.FC<DevSiteLayoutProps> = ({ children }) => {
  const location = useLocation();
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

  
  const NavTree = (
    <nav aria-label="Site sections" className="devsite-sidenav">
      <Link to="/" className="mb-4 flex items-center gap-2 px-1 no-underline">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">C</span>
        <span className="leading-tight">
          <span className="block text-[13px] font-medium text-foreground">CatalystLab</span>
          <span className="block text-[11px] text-muted-foreground">Developer platform</span>
        </span>
      </Link>

      {SITE_NAVIGATION.map((group) => {
        const expanded = openGroups[group.group] !== false;
        return (
          <div key={group.group} className="mb-1">
            <button
              type="button"
              onClick={() => setOpenGroups((prev) => ({ ...prev, [group.group]: !expanded }))}
              className="flex h-9 w-full items-center justify-between rounded-md px-2 text-left text-[12px] font-medium uppercase tracking-wide text-muted-foreground hover:bg-accent hover:text-foreground"
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
                        className={`flex min-h-9 items-center justify-between rounded-r-full border-l-[3px] py-1.5 pl-3 pr-3 text-[13px] leading-snug no-underline transition-colors ${
                          active
                            ? 'border-primary bg-primary/10 font-medium text-primary'
                            : 'border-transparent text-foreground/80 hover:bg-accent hover:text-foreground'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span className="ml-2 shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
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
    <div className="devsite-shell min-h-full bg-background text-foreground">
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-[268px] shrink-0 border-r border-border lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-3 py-5">{NavTree}</div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[min(86vw,300px)] overflow-y-auto bg-card px-3 py-5 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Menu</span>
                <button type="button" onClick={() => setMobileNavOpen(false)} className="flex size-9 items-center justify-center rounded-full hover:bg-accent" aria-label="Close">
                  <X className="size-5" />
                </button>
              </div>
              {NavTree}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">

          <div className="flex">
            <div className={`min-w-0 flex-1 ${currentPath === '/' ? 'p-0 max-w-none' : 'devsite-article px-4 py-6 sm:px-8 lg:px-10 xl:max-w-[960px]'}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevSiteLayout;
