import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, Menu, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoleSecurity } from '../../context/RoleSecurityContext';
import { MainMenuOverlay } from './MainMenuOverlay';
import { NavbarSearch } from './NavbarSearch';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../../lib/utils';

type MenuKey = 'services' | 'resources' | null;

const menuItems = {
  services: [
    { label: 'Pricing & plans', description: 'Choose the right audit tier', to: '/pricing', badge: 'Tier RFC' },
    { label: 'Products & Watchdog', description: 'Continuous monitoring tools', to: '/products', badge: 'Live' },
    { label: 'GitHub Webhooks', description: 'Real-time commit & PR telemetry', to: '/dashboard/webhooks', badge: 'CI/CD' },
  ],
  resources: [
    { label: 'Documentation', description: 'Understand the platform & SDLC', to: '/docs', badge: '14 Modules' },
    { label: 'REST API reference', description: 'Build with CatalystLab SDKs', to: '/api-docs', badge: 'v2.4' },
    { label: 'API playground', description: 'Test an endpoint interactively', to: '/playground', badge: 'Interactive' },
    { label: 'Engineering blogs', description: 'Research & technical deep dives', to: '/blogs', badge: 'Articles' },
  ],
} as const;

export const Navbar: React.FC = () => {
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
      'group relative inline-flex min-h-10 items-center px-3.5 text-[13px] font-medium transition-all duration-200 rounded-full',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
      active
        ? 'text-foreground bg-zinc-100/80 dark:bg-zinc-800/70 shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40'
    );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'border-b border-border/80 bg-background/85 shadow-[0_12px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl py-2'
            : 'border-b border-transparent bg-transparent py-3.5'
        )}
      >
        <div className="mx-auto flex min-h-12 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo with Live Edge Indicator */}
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50" 
              aria-label="CatalystLab home"
            >
              <BrandLogo size="md" />
            </Link>

            <div className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>42 Edge Nodes</span>
            </div>
          </div>

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
                    {label}
                    <ChevronDown aria-hidden="true" className={cn('size-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
                  </button>
                  
                  {isOpen && (
                    <div 
                      role="menu" 
                      aria-label={`${label} menu`} 
                      className="absolute left-0 top-[calc(100%+0.5rem)] w-[320px] rounded-2xl border border-border/80 bg-background/95 backdrop-blur-2xl p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      {menuItems[key].map((item) => (
                        <Link 
                          key={item.to} 
                          to={item.to} 
                          role="menuitem" 
                          className="group flex flex-col justify-center rounded-xl px-3.5 py-2.5 transition-colors hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground group-hover:text-cyan-400 transition-colors">
                              {item.label}
                            </span>
                            {'badge' in item && (
                              <span className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs leading-relaxed text-muted-foreground mt-0.5">
                            {item.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
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
              <Link to="/admin" className={cn(navLinkClass(isActive('/admin')), 'gap-1.5 text-emerald-400')}>
                <ShieldCheck aria-hidden="true" className="size-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex shrink-0 items-center gap-2.5">
            <NavbarSearch isScrolled={isScrolled} />
            <ThemeToggle />
            
            {user ? (
              <Link
                to="/dashboard"
                className={cn(
                  'hidden h-9 items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3.5 text-[13px] font-medium text-foreground transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 shadow-sm',
                  'sm:flex'
                )}
                aria-label="Open dashboard"
              >
                <LayoutDashboard aria-hidden="true" className="size-3.5 text-muted-foreground" />
                <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Dashboard'}</span>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-mono text-[10px] uppercase text-cyan-400 font-bold">
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
                    'inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-transform hover:scale-[1.03] active:scale-[0.98]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 shadow-md'
                  )}
                >
                  Sign up
                </Link>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setMenuOverlayOpen(true)}
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-background/80 text-foreground transition-all',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 shadow-sm',
                'lg:hidden'
              )}
              aria-label="Open navigation menu"
            >
              <Menu aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </header>
      <MainMenuOverlay isOpen={menuOverlayOpen} onClose={() => setMenuOverlayOpen(false)} />
    </>
  );
};

export default Navbar;

