import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Layers, 
  GitPullRequest, 
  Globe, 
  ShieldAlert, 
  Key, 
  Search, 
  RotateCw, 
  LogOut, 
  ChevronDown, 
  Command,
  X,
  CheckCircle2,
  ExternalLink,
  Terminal,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Blocks,
  Sliders,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

interface DashboardShellProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  targetDomain: string;
  onTargetDomainChange?: (domain: string) => void;
  onRefreshScan: () => void;
  isScanning: boolean;
}

export interface NavItemDef {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | null;
  badgeColor?: string;
  group: 'core' | 'tools';
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activeView,
  onViewChange,
  targetDomain,
  onTargetDomainChange,
  onRefreshScan,
  isScanning,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('Acme Mesh Prod');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Handle Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // Canonical navigation items matching Superadmin Command Center architecture
  // Highlighting: Overview, Audits, Reports, Webhooks, Monitoring, API Keys
  const coreNavItems: NavItemDef[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: 'Live', group: 'core' },
    { id: 'audits', label: 'Audits', icon: ShieldCheck, badge: null, group: 'core' },
    { id: 'reports', label: 'Reports', icon: FileText, badge: 'Dossiers', group: 'core' },
    { id: 'webhooks', label: 'Webhooks', icon: Blocks, badge: 'GHLyase', group: 'core' },
    { id: 'monitoring', label: 'Monitoring', icon: Globe, badge: '38 PoPs', group: 'core' },
    { id: 'api-keys', label: 'API Keys', icon: Key, badge: 'v2.4', group: 'core' },
  ];

  const secondaryNavItems: NavItemDef[] = [
    { id: 'engines', label: '8 Engines Explorer', icon: Layers, badge: '8 Active', group: 'tools' },
    { id: 'patches', label: 'Automated PR Patches', icon: GitPullRequest, badge: '3 Ready', group: 'tools' },
    { id: 'security', label: 'Security & OWASP', icon: ShieldAlert, badge: 'Zero-Trust', group: 'tools' },
    { id: 'rate-limits', label: 'Compute Quotas', icon: Sliders, badge: null, group: 'tools' },
  ];

  // Helper to test uniform active state across aliases
  const isItemActive = (itemId: string) => {
    if (itemId === 'overview') {
      return activeView === 'overview' || activeView === 'analytics' || activeView === 'home';
    }
    if (itemId === 'webhooks') {
      return activeView === 'webhooks' || activeView === 'patches';
    }
    return activeView === itemId;
  };

  // Quick search results
  const searchResults = [
    { title: 'VitalZyme Core Web Vitals Audit', desc: 'P95 LCP sub-second optimization engine', href: '/docs/vitalzyme' },
    { title: 'SynthShift AST & DOM Preloader', desc: 'Eliminates render-blocking CSS and JS scripts', href: '/dashboard?tab=engines' },
    { title: 'RiskProtease OWASP Transport Check', desc: 'TLS 1.3, HSTS, CSP and Permissions-Policy audit', href: '/dashboard?tab=security' },
    { title: 'EdgeKinase Anycast DNS Mesh', desc: '38 Global Point-of-Presence latency matrix', href: '/dashboard?tab=monitoring' },
    { title: 'RFC 8446: The Transport Layer Security (TLS) Protocol v1.3', desc: 'Official IETF standard specification', href: 'https://datatracker.ietf.org/doc/html/rfc8446', isExternal: true },
    { title: 'RFC 6797: HTTP Strict Transport Security (HSTS)', desc: 'Web security mechanism standard', href: 'https://datatracker.ietf.org/doc/html/rfc6797', isExternal: true },
  ].filter(item => 
    !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render individual navigation button
  const renderNavButton = (item: NavItemDef, isMobile = false) => {
    const Icon = item.icon;
    const active = isItemActive(item.id);

    return (
      <button
        key={item.id}
        onClick={() => {
          onViewChange(item.id);
          if (isMobile) setIsMobileNavOpen(false);
        }}
        className={`group relative w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all duration-160 cursor-pointer ${
          active 
            ? 'ds-nav-active' 
            : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
        }`}
        title={item.label}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon className={`size-4 shrink-0 transition-colors ${active ? 'text-[var(--accent-framer-blue)]' : 'text-muted-foreground/70 group-hover:text-white'}`} />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="truncate">{item.label}</span>
          )}
        </div>
        {(!isSidebarCollapsed || isMobile) && (
          <div className="flex items-center gap-1.5 shrink-0">
            {item.badge && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                active 
                  ? 'bg-[var(--accent-framer-blue)]/10 text-[var(--accent-framer-blue)] border-[var(--accent-framer-blue)]/30 font-medium' 
                  : 'bg-white/5 text-muted-foreground border-border group-hover:border-white/20 group-hover:text-white'
              }`}>
                {item.badge}
              </span>
            )}
            {active && (
              <span className="size-1.5 rounded-full bg-[var(--accent-framer-blue)] shadow-[0_0_8px_var(--accent-framer-blue)] animate-pulse" />
            )}
          </div>
        )}

        {isSidebarCollapsed && !isMobile && active && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-[var(--accent-framer-blue)] shadow-[0_0_8px_var(--accent-framer-blue)]" />
        )}
      </button>
    );
  };

  return (
    <div data-theme="dark" className="flex min-h-screen bg-background text-foreground">
      {/* ================= DESKTOP DOCKED SIDEBAR ================= */}
      <aside 
        className={`hidden lg:flex flex-col justify-between p-3 shrink-0 select-none z-30 sticky top-0 h-screen ds-page-top bg-background border-r border-[var(--border-subtle)] transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {/* Top: Monogram, Workspace, and Nav Groups */}
        <div className="space-y-4 overflow-y-auto scrollbar-none">
          {/* Monogram & Collapse Toggle */}
          <div className="flex items-center justify-between px-1">
            <Link to="/" className="flex items-center gap-2 group">
              <BrandLogo size="sm" />
              {!isSidebarCollapsed && (
                <span className="text-xs font-semibold tracking-[-0.02em] text-white">
                  Catalyst<span className="text-[#00D2FF]">Lab</span>
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </div>

          {/* Workspace selector dropdown */}
          {!isSidebarCollapsed ? (
            <div className="relative">
              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-surface border border-border hover:border-border-strong text-left transition-all cursor-pointer"
              >
                <div className="truncate">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span>Workspace</span>
                    <span className="size-1 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-xs font-medium text-white truncate">{currentWorkspace}</div>
                </div>
                <ChevronDown className="size-3 text-muted-foreground shrink-0" />
              </button>

              {workspaceMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-surface border border-border rounded-xl p-1.5 shadow-2xl z-50 animate-fadeIn">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground px-2 py-1 flex items-center justify-between">
                    <span>Select Mesh</span>
                    <span className="text-emerald-400">Pro Plan</span>
                  </div>
                  {['Acme Mesh Prod', 'Staging Edge V2', 'Personal Lab'].map((ws) => (
                    <button
                      key={ws}
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        setWorkspaceMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        currentWorkspace === ws ? 'bg-white/10 text-white font-medium' : 'text-muted-foreground hover:text-white'
                      }`}
                    >
                      {ws}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <div 
                className="size-9 rounded-xl bg-surface border border-border flex items-center justify-center text-xs font-mono font-bold text-[#00D2FF]"
                title={`Active: ${currentWorkspace}`}
              >
                {currentWorkspace.charAt(0)}
              </div>
            </div>
          )}

          {/* Core Platform Navigation Links (Overview, Audits, Reports, Webhooks, Monitoring, API Keys) */}
          <div className="space-y-1 pt-1">
            {!isSidebarCollapsed && (
              <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 font-semibold">
                Platform Suite
              </div>
            )}
            <nav className="space-y-1">
              {coreNavItems.map((item) => renderNavButton(item, false))}
            </nav>
          </div>

          {/* Secondary Telemetry & Infrastructure Tools */}
          <div className="space-y-1 pt-2 border-t border-border">
            {!isSidebarCollapsed && (
              <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 font-semibold">
                Engines &amp; Security
              </div>
            )}
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => renderNavButton(item, false))}
            </nav>
          </div>
        </div>

        {/* Bottom User Profile Pill */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-2 truncate">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Avatar'} 
                  className="size-7 rounded-lg object-cover"
                />
              ) : (
                <div className="size-7 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-semibold text-[#00D2FF]">
                  {user?.displayName ? user.displayName[0].toUpperCase() : 'A'}
                </div>
              )}
              {!isSidebarCollapsed && (
                <div className="truncate text-left">
                  <div className="text-xs font-medium text-white truncate">
                    {user?.displayName || 'Engineering Team'}
                  </div>
                  <div className="text-[10px] font-mono text-[#00F298]">
                    {isAdmin ? 'Superadmin Root' : 'Team Pro'}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE SLIDE-OVER HAMBURGER DRAWER ================= */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Slide-over Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[280px] sm:w-[320px] max-w-[85vw] h-full bg-background border-r border-border p-4 flex flex-col justify-between overflow-y-auto shadow-2xl"
            >
              <div className="space-y-4">
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileNavOpen(false)}>
                    <BrandLogo size="sm" />
                    <span className="text-xs font-semibold tracking-[-0.02em] text-white">
                      Catalyst<span className="text-[#00D2FF]">Lab</span>
                    </span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live</span>
                    </span>
                    <button
                      onClick={() => setIsMobileNavOpen(false)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Close navigation menu"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>

                {/* Workspace Switcher in Drawer */}
                <div className="p-2 rounded-xl bg-surface border border-border">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Active Workspace</div>
                  <div className="text-xs font-medium text-white mt-0.5">{currentWorkspace}</div>
                </div>

                {/* Core Navigation Items */}
                <div className="space-y-1">
                  <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 font-semibold">
                    Core Platform
                  </div>
                  <nav className="space-y-1">
                    {coreNavItems.map((item) => renderNavButton(item, true))}
                  </nav>
                </div>

                {/* Secondary Diagnostics Navigation Items */}
                <div className="space-y-1 pt-2 border-t border-border">
                  <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 font-semibold">
                    Diagnostic Tools
                  </div>
                  <nav className="space-y-1">
                    {secondaryNavItems.map((item) => renderNavButton(item, true))}
                  </nav>
                </div>
              </div>

              {/* Mobile Drawer Bottom User Profile */}
              <div className="pt-4 border-t border-border mt-4">
                <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border">
                  <div className="flex items-center gap-2.5 truncate">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'Avatar'} 
                        className="size-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-semibold text-[#00D2FF]">
                        {user?.displayName ? user.displayName[0].toUpperCase() : 'A'}
                      </div>
                    )}
                    <div className="truncate text-left">
                      <div className="text-xs font-medium text-white truncate">
                        {user?.displayName || 'Engineering Team'}
                      </div>
                      <div className="text-[10px] font-mono text-[#00F298]">
                        {isAdmin ? 'Superadmin Root' : 'Team Pro'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="size-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MAIN PANEL CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* 4.1 Top Utility Chrome */}
        <header className="sticky top-0 z-20 ds-page-top pb-3 bg-transparent backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Left: Mobile Hamburger & Desktop Toggle + Target Domain Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Button for Mobile / Tablet */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="size-5" />
            </button>

            {/* Desktop Sidebar Quick Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>

            {/* Target Domain Pill & Live Scan Refresh */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-mono">
              <span className="text-muted-foreground hidden sm:inline">target:</span>
              <strong className="text-white font-medium truncate max-w-[120px] sm:max-w-none">{targetDomain}</strong>
              <button
                onClick={onRefreshScan}
                disabled={isScanning}
                className="ml-1 p-0.5 text-muted-foreground hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh scan"
              >
                <RotateCw className={`size-3.5 ${isScanning ? 'animate-spin text-[#00D2FF]' : ''}`} />
              </button>
            </div>

            {/* Live Edge Mesh Health Pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Pass P95 1.06s</span>
            </div>
          </div>

          {/* Quick Search Trigger (Cmd + K) & Admin Console Link */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-border-strong text-xs text-muted-foreground hover:text-white transition-all cursor-pointer font-mono"
            >
              <Search className="size-3.5" />
              <span className="hidden sm:inline">Search RFCs &amp; audits...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white">
                <Command className="size-2.5" />K
              </kbd>
            </button>

            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium hover:bg-amber-500/20 transition-all"
              >
                <Terminal className="size-3 text-amber-400" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Cmd + K Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden font-sans">
            {/* Input row */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="size-4 text-[#00D2FF] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audits, RFC standards, engine metrics..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Results list */}
            <div className="p-2 max-h-80 overflow-y-auto divide-y divide-white/5 font-mono text-xs">
              {searchResults.length > 0 ? (
                searchResults.map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    target={item.isExternal ? '_blank' : '_self'}
                    rel={item.isExternal ? 'noreferrer' : undefined}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="text-white font-medium group-hover:text-[#00D2FF] flex items-center gap-1.5">
                        <span>{item.title}</span>
                        {item.isExternal && <ExternalLink className="size-3 text-muted-foreground" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-sans mt-0.5">{item.desc}</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground group-hover:text-white">&rarr;</span>
                  </a>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No matching telemetry standards found.
                </div>
              )}
            </div>

            <div className="p-2.5 bg-background border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground px-4">
              <span>Navigate with arrow keys</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardShell;
