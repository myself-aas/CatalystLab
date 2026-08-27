import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, Menu, ShieldCheck } from 'lucide-react';
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
    { label: 'Pricing & plans', description: 'Choose the right audit tier', to: '/pricing' },
    { label: 'Products & Watchdog', description: 'Continuous monitoring tools', to: '/products' },
    { label: 'GitHub Webhooks', description: 'Real-time commit & PR telemetry', to: '/dashboard/webhooks' },
  ],
  resources: [
    { label: 'Documentation', description: 'Understand the platform', to: '/docs' },
    { label: 'REST API reference', description: 'Build with CatalystLab', to: '/api-docs' },
    { label: 'API playground', description: 'Test an endpoint interactively', to: '/playground' },
    { label: 'Engineering blogs', description: 'Research and technical deep dives', to: '/blogs' },
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
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
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
      'group relative inline-flex h-9 items-center px-4 text-[13px] font-medium transition-all duration-300 rounded-full',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      active
        ? 'text-foreground bg-zinc-100/50 dark:bg-zinc-800/50'
        : 'text-muted-foreground hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
    );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b transition-all duration-300',
          isScrolled
            ? 'border-border bg-background/80 shadow-sm backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        )}
      >
        <div className="mx-auto flex min-h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="CatalystLab home">
            <BrandLogo size="md" />
          </Link>

          <nav ref={navRef} className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            <Link to="/" className={navLinkClass(isActive('/'))}>Home</Link>
            
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
                    <ChevronDown aria-hidden="true" className={cn('size-3.5 transition-transform duration-300', isOpen && 'rotate-180')} />
                  </button>
                  
                  {isOpen && (
                    <div role="menu" aria-label={`${label} menu`} className="absolute left-0 top-[calc(100%+0.5rem)] w-[320px] rounded-2xl border border-border bg-background/95 backdrop-blur-xl p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                      {menuItems[key].map((item) => (
                        <Link key={item.to} to={item.to} role="menuitem" className="group flex flex-col justify-center rounded-xl px-4 py-3 transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                          <span className="text-xs leading-relaxed text-muted-foreground mt-0.5">{item.description}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            <Link to="/about" className={navLinkClass(isActive('/about'))}>About</Link>
            <Link to="/contact" className={navLinkClass(isActive('/contact'))}>Contact</Link>
            
            {hasPermission('page:view_admin') && (
              <Link to="/admin" className={cn(navLinkClass(isActive('/admin')), 'gap-1.5')}>
                <ShieldCheck aria-hidden="true" className="size-3.5 text-emerald-500" />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <NavbarSearch isScrolled={isScrolled} />
            <ThemeToggle />
            
            {user ? (
              <Link
                to="/dashboard"
                className={cn(
                  'hidden h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-[13px] font-medium text-foreground transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm',
                  'sm:flex'
                )}
                aria-label="Open dashboard"
              >
                <LayoutDashboard aria-hidden="true" className="size-3.5 text-muted-foreground" />
                <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Dashboard'}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase text-primary font-bold">{roleConfig.shortLabel}</span>
              </Link>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className={navLinkClass(false)}>Log in</Link>
                <Link to="/signup" className={cn(
                  'inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-[13px] font-medium text-background transition-transform hover:scale-105 active:scale-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-md'
                )}>Sign up</Link>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setMenuOverlayOpen(true)}
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm',
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
