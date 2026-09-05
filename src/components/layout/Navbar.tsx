import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'motion/react';
import {
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Radio,
  GitBranch,
  BookOpen,
  Code2,
  Terminal,
  FileText,
  Scale,
  Compass,
  LayoutDashboard,
  Menu,
  Activity,
  Cpu,
  Leaf,
  Sparkles,
  Layers,
  Search,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoleSecurity } from '../../context/RoleSecurityContext';
import { MainMenuOverlay } from './MainMenuOverlay';
import { NavbarSearch } from './NavbarSearch';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../../lib/utils';

type MenuKey = 'products' | 'resources' | null;

interface MegaMenuItem {
  label: string;
  description: string;
  to: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MegaMenuConfig {
  columns: {
    title: string;
    items: MegaMenuItem[];
  }[];
  featured?: {
    title: string;
    description: string;
    to: string;
    image?: string;
    actionLabel: string;
  };
}

const getMenuItems = (user: any): Record<'products' | 'resources', MegaMenuConfig> => ({
  products: {
    columns: [
      {
        title: 'Diagnostic Engines (Matrix)',
        items: [
          { label: 'VitalZyme Engine', description: 'DOM & TTFB Analysis', to: '/health', icon: Activity, badge: 'Vitals' },
          { label: 'LLM-Kinase Engine', description: 'llms.txt Readiness', to: '/ai-readiness', icon: Cpu, badge: 'AI' },
          { label: 'RiskProtease Engine', description: 'OWASP Security Scanner', to: '/compliance', icon: ShieldCheck, badge: 'OWASP' },
          { label: 'GitLygase Engine', description: 'Repo Hygiene & Security', to: '/repo-scanner', icon: Terminal, badge: 'SecOps' },
          { label: 'EcoHolo Engine', description: 'Carbon & CO2e Profiling', to: '/eco-audit', icon: Leaf },
          { label: 'SynthShift Engine', description: 'Migration Analysis', to: '/migration', icon: GitBranch },
          { label: 'AllosterSearch', description: 'SEO & LLMO Scoring', to: '/llmo', icon: Search },
          { label: 'EdgeVmax Engine', description: 'Multi-Region Latency', to: '/latency', icon: Globe },
        ]
      },
      {
        title: 'Platform Tools',
        items: [
          { label: 'Master Audit Launch', description: 'Run all engines concurrently', to: '/launch-audit', icon: Sparkles, badge: 'New' },
          { label: 'Side-by-Side Compare', description: 'Multi-domain architecture', to: '/compare', icon: Scale },
          { label: 'Products & Watchdog', description: 'Continuous domain monitoring', to: '/products', icon: Radio },
          { label: 'GitHub Webhooks', description: 'Commit & PR telemetry', to: user ? '/dashboard/webhooks' : '/login?redirect=/dashboard/webhooks', icon: GitBranch },
        ]
      }
    ],
    featured: {
      title: 'Web Performance Deep Dive',
      description: 'Read our latest article on DOM metrics and render-blocking resources.',
      to: '/blogs',
      actionLabel: 'Read Article'
    }
  },
  resources: {
    columns: [
      {
        title: 'Developer Hub',
        items: [
          { label: 'Documentation', description: 'Platform architecture & guides', to: '/docs', icon: BookOpen },
          { label: 'REST API reference', description: 'Integrate via CatalystLab SDKs', to: '/api-docs', icon: Code2, badge: 'v2.4' },
          { label: 'API playground', description: 'Live diagnostic endpoints', to: '/playground', icon: Terminal },
        ]
      },
      {
        title: 'Knowledge Base',
        items: [
          { label: 'Engineering blogs', description: 'Web performance deep dives', to: '/blogs', icon: FileText },
          { label: 'Audit Methodology', description: 'Scoring weights across 8 engines', to: '/methodology', icon: Compass, badge: 'RFC' },
        ]
      }
    ]
  },
});

export const Navbar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const { hasPermission, roleConfig } = useRoleSecurity();
  const menuItems = getMenuItems(user);
  const [menuOverlayOpen, setMenuOverlayOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    // Hide when scrolling down past 150px, show when scrolling up
    if (current > previous && current > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    // Clear the existing timeout when scrolling happens
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set a timeout to reveal the header when scrolling pauses/stops
    if (current > 150) {
      scrollTimeoutRef.current = setTimeout(() => {
        setHidden(false);
      }, 600); // Reveal after 600ms of no scrolling
    }
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handlePointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenMenu(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => setOpenMenu(null), [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/index.html';
    if (path === '/about') return location.pathname === '/about' || location.pathname === '/methodology';
    return location.pathname.startsWith(path);
  };

  const groupIsActive = (key: Exclude<MenuKey, null>) => {
    return menuItems[key].columns.some(col => col.items.some(item => isActive(item.to.split('?')[0])));
  };

  const navLinkClass = (active: boolean) =>
    cn(
      'group relative inline-flex min-h-9 items-center px-3 text-[14px] font-medium tracking-tight transition-colors rounded-md cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      active
        ? 'text-primary bg-primary/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
    );

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          isScrolled
            ? 'border-b border-border bg-background/80 backdrop-blur-md shadow-sm'
            : 'border-b border-transparent bg-transparent'
        )}
        animate={{
          y: hidden ? '-100%' : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="w-full flex h-16 min-h-12 items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">

          <Link
            to="/"
            className="flex items-center shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="CatalystLab home"
          >
            <BrandLogo size="md" />
          </Link>

          <nav ref={navRef} className="hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">
            <ul className="flex items-center gap-1 m-0 p-0 list-none">
              <li>
                <Link to="/" className={navLinkClass(isActive('/'))} aria-current={isActive('/') ? 'page' : undefined}>
                  Home
                </Link>
              </li>

              {(Object.keys(menuItems) as Array<Exclude<MenuKey, null>>).map((key) => {
                const isOpen = openMenu === key;
                const label = key === 'products' ? 'Products & Hub' : 'Resources';
                const config = menuItems[key];

                return (
                  <li key={key} className="relative">
                    <button
                      type="button"
                      className={cn(navLinkClass(isOpen || groupIsActive(key)), 'gap-1.5')}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-controls={`mega-menu-${key}`}
                      onClick={() => setOpenMenu(isOpen ? null : key)}
                    >
                      <span>{label}</span>
                      <ChevronDown aria-hidden="true" className={cn('size-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          id={`mega-menu-${key}`}
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.99 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          role="region"
                          aria-label={`${label} mega menu`}
                          className={cn(
                            "absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.75rem)] rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden flex",
                            key === 'products' ? 'w-[900px]' : 'w-[700px]'
                          )}
                        >
                          {/* Columns Section */}
                          <div className="flex-1 flex flex-row gap-6 p-6">
                            {config.columns.map((col, idx) => (
                              <div key={idx} className={col.items.length > 4 ? "flex-[2]" : "flex-1"}>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{col.title}</h3>
                                <ul className={cn("grid gap-1 list-none m-0 p-0", col.items.length > 4 ? "grid-cols-2 gap-x-4" : "grid-cols-1")}>
                                  {col.items.map((item) => {
                                    const Icon = item.icon;
                                    // Adjust path for auth dependencies if necessary (e.g. webhooks)
                                    const resolvedTo = item.label === 'GitHub Webhooks' ? (user ? '/dashboard/webhooks' : '/login?redirect=/dashboard/webhooks') : item.to;
                                    return (
                                      <li key={resolvedTo}>
                                        <Link
                                          to={resolvedTo}
                                          className="group flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                          aria-current={isActive(resolvedTo.split('?')[0]) ? 'page' : undefined}
                                        >
                                          <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                            <Icon className="size-4" aria-hidden="true" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                              <span className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {item.label}
                                              </span>
                                              {item.badge && (
                                                <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary shrink-0">
                                                  {item.badge}
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-xs leading-relaxed text-muted-foreground line-clamp-1 mt-0.5 block">
                                              {item.description}
                                            </span>
                                          </div>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ))}
                          </div>

                          {/* Featured Section */}
                          {config.featured && (
                            <div className="w-[240px] bg-muted/30 border-l border-border p-6 flex flex-col justify-center">
                              <h3 className="text-sm font-semibold text-foreground mb-2">{config.featured.title}</h3>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{config.featured.description}</p>
                              <Link 
                                to={config.featured.to}
                                className="inline-flex items-center justify-center h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-full"
                              >
                                {config.featured.actionLabel}
                              </Link>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}

              <li>
                <Link to="/about" className={navLinkClass(isActive('/about'))} aria-current={isActive('/about') ? 'page' : undefined}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className={navLinkClass(isActive('/contact'))} aria-current={isActive('/contact') ? 'page' : undefined}>
                  Contact
                </Link>
              </li>

              {hasPermission('page:view_admin') && (
                <li>
                  <Link to="/admin" className={cn(navLinkClass(isActive('/admin')), 'gap-1.5')}>
                    <ShieldCheck aria-hidden="true" className="size-3.5" />
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <NavbarSearch isScrolled={isScrolled} />
              <ThemeToggle />
            </div>

            {user ? (
              <Link
                to="/dashboard"
                className="hidden h-9 items-center gap-2 rounded-full border border-border bg-background px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-accent sm:flex"
                aria-label="Open command center dashboard"
              >
                <LayoutDashboard aria-hidden="true" className="size-3.5 text-primary" />
                <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Dashboard'}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase text-primary font-bold">
                  {roleConfig.shortLabel}
                </span>
              </Link>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className={navLinkClass(false)}>
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (onOpenMobileMenu) {
                  onOpenMobileMenu();
                } else {
                  setMenuOverlayOpen(true);
                }
              }}
              className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95"
              aria-expanded={menuOverlayOpen}
              aria-haspopup="dialog"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.header>
      {!onOpenMobileMenu && <MainMenuOverlay isOpen={menuOverlayOpen} onClose={() => setMenuOverlayOpen(false)} />}
    </>
  );
};

export default Navbar;
