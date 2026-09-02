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
  Sparkles
} from 'lucide-react';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
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

  const groupIsActive = (key: Exclude<MenuKey, null>) => menuItems[key].some((item) => isActive(item.to));
  
  const navLinkClass = (active: boolean) =>
    cn(
      'group relative inline-flex min-h-9 items-center px-3.5 text-[13px] font-medium tracking-tight transition-all duration-200 rounded-full cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
      active
        ? 'text-foreground bg-white/[0.08] dark:bg-white/[0.08] border border-border-default/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
        : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
    );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'border-b border-border-default bg-background/85 shadow-linear-card backdrop-blur-xl py-2'
            : 'border-b border-transparent bg-transparent py-3'
        )}
      >
        <div className="mx-auto flex min-h-12 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-transform active:scale-95" 
            aria-label="CatalystLab home"
          >
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav ref={navRef} className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            <Link to="/" className={navLinkClass(isActive('/'))}>
              Home
            </Link>
            
            {(Object.keys(menuItems) as Array<Exclude<MenuKey, null>>).map((key) => {
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
                    <ChevronDown aria-hidden="true" className={cn('size-3.5 transition-transform duration-200 text-foreground-muted group-hover:text-foreground', isOpen && 'rotate-180 text-accent-bright')} />
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
                        className="absolute left-0 top-[calc(100%+0.6rem)] w-[360px] rounded-2xl border border-border-default bg-card/95 backdrop-blur-2xl p-2 shadow-linear-card z-50 overflow-hidden"
                      >
                        <div className="flex flex-col gap-1">
                          {menuItems[key].map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link 
                                key={item.to} 
                                to={item.to} 
                                role="menuitem" 
                                className="group flex items-start gap-3 rounded-xl p-2.5 transition-all duration-150 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                              >
                                <div className="size-8 rounded-lg bg-white/[0.04] border border-border-default flex items-center justify-center text-foreground-muted group-hover:text-accent-bright group-hover:bg-accent/15 group-hover:border-accent/30 transition-all duration-200 shrink-0 mt-0.5 shadow-2xs">
                                  <Icon className="size-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[13px] font-medium text-foreground group-hover:text-accent-bright transition-colors">
                                      {item.label}
                                    </span>
                                    {item.badge && (
                                      <span className="rounded-md border border-accent/20 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent-bright">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs leading-relaxed text-foreground-muted line-clamp-1 mt-0.5 block">
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
            
            <Link to="/about" className={navLinkClass(isActive('/about'))}>
              About
            </Link>
            <Link to="/contact" className={navLinkClass(isActive('/contact'))}>
              Contact
            </Link>
            
            {hasPermission('page:view_admin') && (
              <Link to="/admin" className={cn(navLinkClass(isActive('/admin')), 'gap-1.5 text-accent-bright')}>
                <ShieldCheck aria-hidden="true" className="size-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Desktop-only Search & Dark Mode Toggle */}
            <div className="hidden lg:flex items-center gap-2">
              <NavbarSearch isScrolled={isScrolled} />
              <ThemeToggle />
            </div>
            
            {user ? (
              <Link
                to="/dashboard"
                className={cn(
                  'hidden h-9 items-center gap-2 rounded-full border border-border-default bg-card/80 px-3.5 text-[13px] font-medium text-foreground transition-all hover:bg-card-hover hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 shadow-linear-card active:scale-95',
                  'sm:flex'
                )}
                aria-label="Open dashboard"
              >
                <LayoutDashboard aria-hidden="true" className="size-3.5 text-accent-bright" />
                <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Dashboard'}</span>
                <span className="rounded-full bg-accent/15 border border-accent/30 px-2 py-0.5 font-mono text-[10px] uppercase text-accent-bright font-bold">
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
                  className={cn(
                    'relative group/cta overflow-hidden inline-flex h-9 items-center justify-center rounded-full bg-accent px-4 text-[13px] font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-accent-bright',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 shadow-linear-cta'
                  )}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/cta:translate-x-full transition-transform duration-700 ease-out" />
                  <Sparkles className="size-3.5 mr-1.5 text-indigo-200" />
                  <span>Sign up</span>
                </Link>
              </div>
            )}
            
            {/* Hamburger Menu Toggle */}
            <MenuOpenIcon 
              onClick={() => {
                if (onOpenMobileMenu) {
                  onOpenMobileMenu();
                } else {
                  setMenuOverlayOpen(true);
                }
              }}
              sx={{ fontSize: 28 }} 
              style={{ width: 28, height: 28 }}
              className="text-foreground-muted hover:text-foreground transition-colors cursor-pointer active:scale-95 shrink-0 block lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
              role="button"
              tabIndex={0}
              aria-label="Open navigation menu"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onOpenMobileMenu) {
                    onOpenMobileMenu();
                  } else {
                    setMenuOverlayOpen(true);
                  }
                }
              }}
            />
          </div>
        </div>
      </header>
      {!onOpenMobileMenu && <MainMenuOverlay isOpen={menuOverlayOpen} onClose={() => setMenuOverlayOpen(false)} />}
    </>
  );
};

export default Navbar;

