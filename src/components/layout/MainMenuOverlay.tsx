import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  LogOut,
  UserPlus,
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Blocks,
  Globe,
  Key,
  Layers,
  GitPullRequest,
  ShieldAlert,
  Sliders,
  BookOpen,
  Terminal,
  CreditCard,
  Scale,
  RotateCw,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../../lib/utils';

export interface MainMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkspace?: string;
}

export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  badgeColor?: string;
  group?: 'core' | 'tools' | 'resources';
  tab?: string;
}

export const useMainMenuData = (user: unknown, isAdmin = false): NavItem[] => {
  return [
    { id: 'overview', title: 'Overview', path: '/dashboard', icon: LayoutDashboard, group: 'core', tab: 'overview' },
    { id: 'audits', title: 'Audits', path: '/dashboard?tab=audits', icon: ShieldCheck, group: 'core', tab: 'audits' },
    { id: 'reports', title: 'Reports', path: '/dashboard?tab=reports', icon: FileText, group: 'core', tab: 'reports' },
    { id: 'webhooks', title: 'Webhooks', path: '/dashboard?tab=webhooks', icon: Blocks, group: 'core', tab: 'webhooks' },
    { id: 'monitoring', title: 'Nodes', path: '/dashboard?tab=monitoring', icon: Globe, group: 'core', tab: 'monitoring' },
    { id: 'api-keys', title: 'API', path: '/dashboard?tab=api-keys', icon: Key, group: 'core', tab: 'api-keys' },
    { id: 'engines', title: 'Engines', path: '/engines', icon: Layers, group: 'tools' },
    { id: 'patches', title: 'Patches', path: '/dashboard?tab=patches', icon: GitPullRequest, group: 'tools', tab: 'patches' },
    { id: 'security', title: 'Security', path: '/dashboard?tab=security', icon: ShieldAlert, group: 'tools', tab: 'security' },
    { id: 'rate-limits', title: 'Quotas', path: '/dashboard?tab=rate-limits', icon: Sliders, group: 'tools', tab: 'rate-limits' },
  ];
};

export const MainMenuOverlay: React.FC<MainMenuOverlayProps> = ({
  isOpen,
  onClose,
  currentWorkspace = 'Acme Mesh Prod',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout, targetDomain, isScanning } = useAuth();
  const displayDomain = targetDomain || 'acme.corp';
  const overlayRef = useRef<HTMLDivElement>(null);

  const [activeWorkspace, setActiveWorkspace] = useState(currentWorkspace);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  // Sync workspace if prop changes
  useEffect(() => {
    if (currentWorkspace) {
      setActiveWorkspace(currentWorkspace);
    }
  }, [currentWorkspace]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open + move focus into the dialog
  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const firstFocusable = overlayRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus({ preventScroll: true });
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [isOpen]);

  // Focus trap: keep Tab cycling inside the open dialog
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !overlayRef.current) return;
      const focusables = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleTabTrap);
    return () => window.removeEventListener('keydown', handleTabTrap);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // Helper to test if item is active
  const isItemActive = (path: string, tab?: string) => {
    if (tab) {
      const searchParams = new URLSearchParams(location.search);
      const currentTab = searchParams.get('tab') || 'overview';
      return location.pathname === '/dashboard' && currentTab === tab;
    }
    if (path === '/dashboard') {
      const searchParams = new URLSearchParams(location.search);
      const currentTab = searchParams.get('tab');
      return location.pathname === '/dashboard' && (!currentTab || currentTab === 'overview');
    }
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const corePlatformItems = [
    { id: 'overview', title: 'Overview', path: '/dashboard', icon: LayoutDashboard, tab: 'overview' },
    { id: 'audits', title: 'Audits', path: '/dashboard?tab=audits', icon: ShieldCheck, tab: 'audits' },
    { id: 'reports', title: 'Reports', path: '/dashboard?tab=reports', icon: FileText, tab: 'reports' },
    { id: 'webhooks', title: 'Webhooks', path: '/dashboard?tab=webhooks', icon: Blocks, tab: 'webhooks' },
    { id: 'monitoring', title: 'Nodes', path: '/dashboard?tab=monitoring', icon: Globe, tab: 'monitoring' },
    { id: 'api-keys', title: 'API', path: '/dashboard?tab=api-keys', icon: Key, tab: 'api-keys' },
  ];

  const diagnosticHubItems = [
    { id: 'engines', title: '8 Engines Explorer', path: '/engines', icon: Layers },
    { id: 'patches', title: 'Automated PR Patches', path: '/dashboard?tab=patches', icon: GitPullRequest, tab: 'patches' },
    { id: 'security', title: 'Security & OWASP', path: '/dashboard?tab=security', icon: ShieldAlert, tab: 'security' },
    { id: 'rate-limits', title: 'Quotas', path: '/dashboard?tab=rate-limits', icon: Sliders, tab: 'rate-limits' },
  ];

  const exploreResourcesItems = [
    { id: 'docs', title: 'Documentation & Architecture', path: '/docs', icon: BookOpen },
    { id: 'api', title: 'API', path: '/api-docs', icon: Terminal },
    { id: 'pricing', title: 'Pricing', path: '/pricing', icon: CreditCard },
    { id: 'compare', title: 'Compare', path: '/compare', icon: Scale },
  ];

  const renderNavItem = (item: {
    id: string;
    title: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | null;
    tab?: string;
  }) => {
    const Icon = item.icon;
    const active = isItemActive(item.path, item.tab);

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavigate(item.path)}
        className={cn(
          'group relative w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-all duration-160 cursor-pointer',
          active
            ? 'ds-nav-active bg-foreground/10 text-foreground font-medium border border-border'
            : 'text-muted-foreground hover:text-foreground hover:bg-[var(--bg-surface)] border border-transparent'
        )}
        title={item.title}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon
            className={cn(
              'size-4 shrink-0 transition-colors',
              active ? 'text-[var(--accent-framer-blue)]' : 'text-muted-foreground/70 group-hover:text-foreground'
            )}
          />
          <span className="truncate">{item.title}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {active && (
            <span className="size-1.5 rounded-full bg-[var(--accent-framer-blue)] shadow-[0_0_8px_#0066FF] animate-pulse shrink-0" />
          )}
        </div>
      </button>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Slide-over Drawer on the right with responsive full viewport height */}
          <motion.aside
            id="main-navigation-menu"
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main Navigation Menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 w-[320px] sm:w-[360px] md:w-[400px] max-w-[88vw] sm:max-w-[420px] h-screen h-[100dvh] max-h-[100dvh] bg-background border-l border-border p-4 sm:p-5 flex flex-col justify-between overflow-y-auto shadow-2xl z-10 select-none text-foreground"
          >
            {/* Ambient Lighting Blobs inside drawer */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
              <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-[var(--accent-framer-blue)]/10 blur-[90px]" />
              <div className="absolute bottom-10 left-0 h-64 w-64 rounded-full bg-[var(--accent-cyan-edge)]/8 blur-[90px]" />
            </div>

            {/* Top Header & Navigation Body */}
            <div className="space-y-4 relative z-10">
              {/* Header: Monogram, Status Badge, Close Button */}
              <div className="flex items-center justify-between pb-3.5 border-b border-border">
                <Link
                  to="/"
                  className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                  onClick={onClose}
                >
                  <BrandLogo size="sm" showText={true} />
                </Link>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live</span>
                  </span>

                  {user ? (
                    <Link
                      to="/dashboard"
                      onClick={onClose}
                      className="size-8 rounded-lg overflow-hidden border border-border bg-surface flex items-center justify-center hover:border-[var(--accent-framer-blue)] transition-all"
                      title="User CMS"
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'Avatar'}
                          className="size-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--accent-cyan-edge)]">
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <ThemeToggle className="size-8 rounded-lg text-muted-foreground hover:text-foreground" />
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors cursor-pointer focus:outline-none"
                    aria-label="Close navigation menu"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Workspace Switcher / Active Status Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border hover:border-border-strong text-left transition-all cursor-pointer"
                >
                  <div className="truncate">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span>Active Workspace</span>
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-xs font-medium text-foreground mt-0.5 flex items-center gap-2 truncate">
                      <span className="truncate">{activeWorkspace}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--accent-framer-blue)]/20 text-[var(--accent-framer-blue)] border border-[var(--accent-framer-blue)]/30 shrink-0">
                        Pro Mesh
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'size-3.5 text-muted-foreground shrink-0 transition-transform duration-200',
                      isWorkspaceMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                {isWorkspaceMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-lg p-1.5 shadow-2xl z-50 animate-fadeIn">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground px-2 py-1 flex items-center justify-between">
                      <span>Mesh</span>
                      <span className="text-emerald-400">Pro Plan</span>
                    </div>
                    {['Acme Mesh Prod', 'Staging Edge V2', 'Personal Lab'].map((ws) => (
                      <button
                        key={ws}
                        type="button"
                        onClick={() => {
                          setActiveWorkspace(ws);
                          setIsWorkspaceMenuOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer',
                          activeWorkspace === ws
                            ? 'bg-foreground/10 text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-[var(--bg-surface)]'
                        )}
                      >
                        <span>{ws}</span>
                        {activeWorkspace === ws && <Check className="size-3 text-[var(--accent-cyan-edge)]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Sections */}
              <div className="space-y-4">
                {/* Dashboard Telemetry (Only for Authenticated Users) */}
                {user && (
                  <div className="space-y-2 px-1">
                    <div className="p-2.5 rounded-lg bg-surface border border-border">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-foreground/5">
                        <div className="flex items-center gap-1.5 truncate">
                          <Globe className="size-3 text-muted-foreground" />
                          <span className="text-[10px] font-mono text-foreground truncate font-medium">{displayDomain}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[9px] font-mono text-emerald-400">Live</span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleNavigate('/dashboard?tab=monitoring')}
                        className="w-full flex items-center justify-between text-[10px] font-mono text-muted-foreground hover:text-[var(--accent-cyan-edge)] transition-colors cursor-pointer"
                      >
                        <span>Mesh Health Nodes</span>
                        <div className="flex items-center gap-1">
                          {isScanning ? (
                            <RotateCw className="size-2.5 animate-spin text-[var(--accent-cyan-edge)]" />
                          ) : (
                            <span className="text-[9px] px-1 rounded bg-[var(--bg-surface)] border border-border">38 Global</span>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* 1. Platform Overview / Core Platform */}
                <div className="space-y-1">
                  <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 font-semibold flex items-center justify-between">
                    <span>Platform Overview</span>
                    <span className="text-[9px] font-mono text-muted-foreground">Core</span>
                  </div>
                  <nav className="space-y-1" aria-label="Platform Overview">
                    {corePlatformItems.map(renderNavItem)}
                  </nav>
                </div>

                {/* 2. Diagnostic Hub / Tools */}
                <div className="space-y-1 pt-2 border-t border-border">
                  <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 font-semibold flex items-center justify-between">
                    <span>Diagnostic Hub</span>
                    <span className="text-[9px] font-mono text-muted-foreground">8 Active</span>
                  </div>
                  <nav className="space-y-1" aria-label="Diagnostic Hub">
                    {diagnosticHubItems.map(renderNavItem)}
                  </nav>
                </div>

                {/* 3. Explore & Resources */}
                <div className="space-y-1 pt-2 border-t border-border">
                  <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 font-semibold flex items-center justify-between">
                    <span>Explore & Resources</span>
                    <span className="text-[9px] font-mono text-muted-foreground">Docs</span>
                  </div>
                  <nav className="space-y-1" aria-label="Explore and Resources">
                    {exploreResourcesItems.map(renderNavItem)}
                  </nav>
                </div>

                {/* Audit CTA */}
                <div className="pt-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to="/audit"
                      onClick={onClose}
                      className="group relative overflow-hidden flex items-center justify-between w-full p-3 rounded-lg bg-gradient-to-r from-[var(--accent-framer-blue)] to-[var(--accent-cyan-edge)] text-foreground font-medium shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer"
                      aria-label="Launch Audit"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-md bg-foreground/20 flex items-center justify-center">
                          <Sparkles className="size-4 text-foreground" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-semibold text-foreground">Run Autonomous Audit</div>
                          <div className="text-[9px] text-foreground/70 font-mono">Autonomous Edge Engines</div>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-foreground group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Bottom Drawer User Profile & Authentication */}
            <div className="pt-4 border-t border-border mt-4 relative z-10 space-y-3">
              {user ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border">
                  <div className="flex items-center gap-2.5 truncate">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Avatar'}
                        className="size-8 rounded-md object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="size-8 rounded-md bg-surface border border-border flex items-center justify-center text-xs font-semibold text-[var(--accent-cyan-edge)]">
                        {user.displayName
                          ? user.displayName[0].toUpperCase()
                          : user.email
                          ? user.email[0].toUpperCase()
                          : 'U'}
                      </div>
                    )}
                    <div className="truncate text-left">
                      <div className="text-xs font-medium text-foreground truncate">
                        {user.displayName || user.email?.split('@')[0] || 'Engineering Team'}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--accent-emerald-vital)]">
                        {isAdmin ? 'Superadmin Root' : 'Team Pro'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-lg transition-colors cursor-pointer"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-border bg-[var(--bg-surface)] hover:bg-foreground/10 text-xs font-medium text-foreground transition-colors text-center"
                    >
                      <UserPlus className="size-3.5 text-muted-foreground" />
                      <span>Log In</span>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={onClose}
                      className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-[var(--accent-framer-blue)] hover:bg-[var(--accent-framer-blue)]/90 text-xs font-medium text-foreground transition-colors shadow-sm text-center"
                    >
                      <span>Sign Up</span>
                    </Link>
                  </div>
                  <div className="text-center text-[10px] font-mono text-muted-foreground">
                    CatalystLab Platform &bull; v2.4 Edge
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MainMenuOverlay;
