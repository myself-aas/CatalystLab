import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
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
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoleSecurity } from '../../context/RoleSecurityContext';
import { MainMenuOverlay } from './MainMenuOverlay';
import { NavbarSearch } from './NavbarSearch';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../../lib/utils';

type MenuKey = 'services' | 'resources' | null;

interface MenuItem {
  label: string;
  description: string;
  to: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: Record<'services' | 'resources', MenuItem[]> = {
  services: [
    {
      label: 'Pricing & plans',
      description: 'Choose the right diagnostic tier for your team',
      to: '/pricing',
      badge: 'Tier RFC',
      icon: CreditCard
    },
    {
      label: 'Products & Watchdog',
      description: 'Continuous telemetry & automated domain monitoring',
      to: '/products',
      badge: 'Live',
      icon: Radio
    },
    {
      label: 'GitHub Webhooks',
      description: 'Real-time commit & PR regression telemetry',
      to: '/dashboard/webhooks',
      badge: 'CI/CD',
      icon: GitBranch
    },
    {
      label: 'Side-by-Side Compare',
      description: 'Compare multi-domain architectural vitals',
      to: '/compare',
      badge: 'Dual Radar',
      icon: Scale
    },
  ],
  resources: [
    {
      label: 'Documentation',
      description: 'Understand the multi-dimensional auditing platform',
      to: '/docs',
      badge: '14 Modules',
      icon: BookOpen
    },
    {
      label: 'REST API reference',
      description: 'Programmatic access with CatalystLab SDKs',
      to: '/api-docs',
      badge: 'v2.4',
      icon: Code2
    },
    {
      label: 'API playground',
      description: 'Interactive live testbed for diagnostic endpoints',
      to: '/playground',
      badge: 'Interactive',
      icon: Terminal
    },
    {
      label: 'Engineering blogs',
      description: 'Deep dives on web performance & LLMO search',
      to: '/blogs',
      badge: 'Articles',
      icon: FileText
    },
    {
      label: 'Audit Methodology',
      description: 'Standardized weights across 8 diagnostic engines',
      to: '/methodology',
      badge: 'RFC 2026',
      icon: Compass
    },
  ],
};

export const Navbar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const { hasPermission, roleConfig } = useRoleSecurity();
  const [menuOverlayOpen, setMenuOverlayOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

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

  const webhookTo = user ? '/dashboard/webhooks' : '/login?redirect=/dashboard/webhooks';
  const resolvedMenu: Record<'services' | 'resources', MenuItem[]> = {
    services: menuItems.services.map((item) =>
      item.label === 'GitHub Webhooks' ? { ...item, to: webhookTo } : item
    ),
    resources: menuItems.resources,
  };

  const groupIsActive = (key: Exclude<MenuKey, null>) => resolvedMenu[key].some((item) => isActive(item.to.split('?')[0]));

  const navLinkClass = (active: boolean) =>
    cn(
      'group relative inline-flex min-h-9 items-center px-3 text-[14px] font-medium tracking-tight transition-colors rounded-md cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/50',
      active
        ? 'text-[#1967d2] bg-[#e8f0fe] dark:text-[#8ab4f8] dark:bg-[#174ea6]/30'
        : 'text-[#3c4043] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-white/5'
    );

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'border-b border-[#dadce0]/80 bg-white/80 backdrop-blur-md shadow-[0_1px_3px_rgba(60,64,67,0.1)] dark:border-white/10 dark:bg-[#202124]/80'
            : 'border-b border-transparent bg-transparent'
        )}
      >
        <div className="w-full flex h-16 min-h-12 items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">

          <Link
            to="/"
            className="flex items-center shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/50"
            aria-label="CatalystLab home"
          >
            <BrandLogo size="md" />
          </Link>

          <nav ref={navRef} className="hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">
            <Link to="/" className={navLinkClass(isActive('/'))}>
              Home
            </Link>

            {(Object.keys(resolvedMenu) as Array<Exclude<MenuKey, null>>).map((key) => {
              const isOpen = openMenu === key;
              const label = key === 'services' ? 'Services' : 'Resources';

              return (
                <div key={key} className="relative">
                  <button
                    type="button"
                    className={cn(navLinkClass(isOpen || groupIsActive(key)), 'gap-1.5')}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu(isOpen ? null : key)}
                  >
                    <span>{label}</span>
                    <ChevronDown aria-hidden="true" className={cn('size-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        role="menu"
                        aria-label={`${label} menu`}
                        className="absolute left-0 top-[calc(100%+0.6rem)] w-[360px] rounded-lg border border-[#dadce0] bg-white p-2 shadow-[0_8px_24px_rgba(60,64,67,0.15)] z-50 overflow-hidden dark:border-white/10 dark:bg-[#303134]"
                      >
                        <div className="flex flex-col gap-1">
                          {resolvedMenu[key].map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.to}
                                to={item.to}
                                role="menuitem"
                                className="group flex items-start gap-3 rounded-md p-2.5 transition-colors hover:bg-[#f1f3f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/50 dark:hover:bg-white/5"
                              >
                                <div className="size-8 rounded-md bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8] shrink-0 mt-0.5 dark:bg-[#174ea6]/40 dark:text-[#8ab4f8]">
                                  <Icon className="size-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[13px] font-medium text-[#202124] group-hover:text-[#1a73e8] dark:text-[#e8eaed] dark:group-hover:text-[#8ab4f8]">
                                      {item.label}
                                    </span>
                                    {item.badge && (
                                      <span className="rounded bg-[#e8f0fe] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#1967d2] dark:bg-[#174ea6]/40 dark:text-[#8ab4f8]">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs leading-relaxed text-[#5f6368] line-clamp-1 mt-0.5 block dark:text-[#9aa0a6]">
                                    {item.description}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <Link to="/docs" className={navLinkClass(isActive('/docs'))}>
              Docs
            </Link>
            <Link to="/about" className={navLinkClass(isActive('/about'))}>
              About
            </Link>
            <Link to="/contact" className={navLinkClass(isActive('/contact'))}>
              Contact
            </Link>

            {hasPermission('page:view_admin') && (
              <Link to="/admin" className={cn(navLinkClass(isActive('/admin')), 'gap-1.5')}>
                <ShieldCheck aria-hidden="true" className="size-3.5" />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <NavbarSearch isScrolled={isScrolled} />
              <ThemeToggle />
            </div>

            {user ? (
              <Link
                to="/dashboard"
                className="hidden h-9 items-center gap-2 rounded-full border border-[#dadce0] bg-white px-3.5 text-[13px] font-medium text-[#202124] transition-colors hover:bg-[#f1f3f4] sm:flex dark:border-white/15 dark:bg-[#303134] dark:text-[#e8eaed]"
                aria-label="Open dashboard"
              >
                <LayoutDashboard aria-hidden="true" className="size-3.5 text-[#1a73e8]" />
                <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Dashboard'}</span>
                <span className="rounded-full bg-[#e8f0fe] px-2 py-0.5 font-mono text-[10px] uppercase text-[#1967d2] font-bold dark:bg-[#174ea6]/40 dark:text-[#8ab4f8]">
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
                  className="inline-flex h-9 items-center justify-center rounded-full bg-[#1a73e8] px-4 text-[13px] font-medium text-white hover:bg-[#1967d2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/50"
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
              className="inline-flex size-11 items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-[#f1f3f4] lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/50 dark:text-[#9aa0a6] dark:hover:bg-white/5 active:scale-95"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>
      {!onOpenMobileMenu && <MainMenuOverlay isOpen={menuOverlayOpen} onClose={() => setMenuOverlayOpen(false)} />}
    </>
  );
};

export default Navbar;
