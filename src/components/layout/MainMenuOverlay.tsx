import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { 
  X, 
  LogIn, 
  LogOut, 
  UserPlus,
  Activity, 
  Scale, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  LayoutDashboard, 
  GitBranch, 
  Terminal, 
  Leaf, 
  Globe, 
  Cpu, 
  ChevronDown, 
  Radio,
  Home,
  BookOpen,
  Code2,
  CreditCard,
  Info,
  Mail,
  ArrowRight,
  Search,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoleSecurity } from '../../context/RoleSecurityContext';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../../lib/utils';

interface MainMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCHABLE_ITEMS = [
  // 8 Engines
  { title: 'VitalZyme Engine', category: 'Engine', desc: 'DOM Tree depth (≤32) & Core Web Vitals', path: '/health', icon: Activity, keywords: ['vitals', 'dom', 'ttfb', 'inp', 'cls', 'lcp', 'speed'] },
  { title: 'LLM-Kinase Engine', category: 'Engine', desc: 'llms.txt manifests & AI bot indexing', path: '/ai-readiness', icon: Cpu, keywords: ['ai', 'llms.txt', 'robots.txt', 'crawler', 'rag'] },
  { title: 'GitLygase Engine', category: 'Engine', desc: 'Git repository SecOps & hygiene', path: '/repo-scanner', icon: Terminal, keywords: ['repo', 'git', 'github', 'security', 'hygiene'] },
  { title: 'EdgeVmax Engine', category: 'Engine', desc: '42 Global Edge PoPs latency & TLS', path: '/latency', icon: Globe, keywords: ['latency', 'edge', 'pops', 'dns', 'global'] },
  { title: 'EcoHolo Engine', category: 'Engine', desc: 'Digital carbon CO2 footprint audit', path: '/eco-audit', icon: Leaf, keywords: ['carbon', 'eco', 'green', 'co2', 'hosting'] },
  { title: 'RiskProtease Engine', category: 'Engine', desc: 'OWASP security headers & CSP audit', path: '/compliance', icon: ShieldCheck, keywords: ['security', 'owasp', 'csp', 'hsts', 'headers'] },
  { title: 'SynthShift Engine', category: 'Engine', desc: 'Re-platforming & migration risks', path: '/migration', icon: GitBranch, keywords: ['migration', 'risk', 'headless', 'par'] },
  { title: 'AllosterSearch Engine', category: 'Engine', desc: 'LLMO AI Search citation indexing', path: '/llmo', icon: Sparkles, keywords: ['llmo', 'search', 'perplexity', 'gemini', 'chatgpt'] },
  // Tools & Pages
  { title: 'Master Audit Launch', category: 'Platform', desc: 'Run 8 concurrent automated audits', path: '/launch-audit', icon: Sparkles, keywords: ['audit', 'scan', 'probe', 'test', 'analyze'] },
  { title: 'Pricing & Plans', category: 'Platform', desc: 'Explore Free, Pro, and Enterprise tiers', path: '/pricing', icon: CreditCard, keywords: ['pricing', 'plans', 'cost', 'subscription', 'upgrade'] },
  { title: 'Products & Watchdog', category: 'Platform', desc: 'Continuous domain telemetry & alert triggers', path: '/products', icon: Radio, keywords: ['products', 'watchdog', 'plugins', 'monitor'] },
  { title: 'Side-by-Side Domain Compare', category: 'Platform', desc: 'Compare 2 domains across all 8 vectors', path: '/compare', icon: Scale, keywords: ['compare', 'versus', 'benchmark', 'side by side'] },
  { title: 'Documentation & Guides', category: 'Docs', desc: 'System overview, scoring formulas & specs', path: '/docs', icon: BookOpen, keywords: ['docs', 'guides', 'manual', 'weights', 'formula'] },
  { title: 'REST API Reference', category: 'API', desc: 'Interactive API endpoints & specs', path: '/api-docs', icon: Code2, keywords: ['api', 'rest', 'endpoints', 'json', 'tokens'] },
  { title: 'Interactive API Playground', category: 'API', desc: 'Test requests with live responses', path: '/playground', icon: Terminal, keywords: ['playground', 'sandbox', 'test', 'curl'] },
  { title: 'Engineering Blogs', category: 'Blog', desc: 'Case studies, web performance, and edge tech', path: '/blogs', icon: FileText, keywords: ['blogs', 'articles', 'news', 'engineering'] },
  { title: 'Audit Methodology', category: 'Docs', desc: 'Geometric weight distribution matrix', path: '/methodology', icon: Compass, keywords: ['methodology', 'matrix', 'weights', 'formula'] },
  { title: 'About CatalystLab', category: 'Company', desc: 'Mission, telemetry standards, and engineering team', path: '/about', icon: Info, keywords: ['about', 'mission', 'team', 'company'] },
  { title: 'Contact Support', category: 'Company', desc: 'Enterprise SLAs, security disclosures, and sales', path: '/contact', icon: Mail, keywords: ['contact', 'support', 'help', 'sla'] },
];

const PRESET_CHIPS = [
  'All Engines',
  'Testing & Vitals',
  'Core Web Vitals',
  'OWASP SecOps',
  'Edge Latency',
  'API & Playground',
  'Pricing & Plans'
];

export const MainMenuOverlay: React.FC<MainMenuOverlayProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission, roleConfig } = useRoleSecurity();
  const [expandedServices, setExpandedServices] = useState(true);
  const [expandedResources, setExpandedResources] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const isCurrentActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/index.html')) return true;
    if (path === '/about' && (location.pathname === '/about' || location.pathname === '/methodology')) return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isServicesActive = location.pathname.startsWith('/pricing') || location.pathname.startsWith('/products') || location.pathname.startsWith('/plugins') || location.pathname.startsWith('/compare');
  const isResourcesActive = location.pathname.startsWith('/docs') || location.pathname.startsWith('/api') || location.pathname.startsWith('/playground') || location.pathname.startsWith('/blogs') || location.pathname.startsWith('/methodology');

  const engines = [
    { name: 'VitalZyme', sub: 'DOM & TTFB', path: '/health', icon: Activity },
    { name: 'LLM-Kinase', sub: 'llms.txt Readiness', path: '/ai-readiness', icon: Cpu },
    { name: 'GitLygase', sub: 'Repo Hygiene', path: '/repo-scanner', icon: Terminal },
    { name: 'EdgeVmax', sub: '42 PoP Latency', path: '/latency', icon: Globe },
    { name: 'EcoHolo', sub: 'Carbon & CO2e', path: '/eco-audit', icon: Leaf },
    { name: 'RiskProtease', sub: 'OWASP SecOps', path: '/compliance', icon: ShieldCheck },
    { name: 'SynthShift', sub: 'Architecture PAR', path: '/migration', icon: GitBranch },
    { name: 'AllosterSearch', sub: 'LLMO & GEO Search', path: '/llmo', icon: Sparkles },
  ];

  // Real-time search matches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return SEARCHABLE_ITEMS.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  const handleChipClick = (chip: string) => {
    if (chip === 'All Engines') {
      setSearchQuery('');
    } else if (chip === 'Core Web Vitals' || chip === 'Testing & Vitals') {
      setSearchQuery('vitals');
    } else if (chip === 'OWASP SecOps') {
      setSearchQuery('owasp');
    } else if (chip === 'Edge Latency') {
      setSearchQuery('latency');
    } else if (chip === 'API & Playground') {
      setSearchQuery('api');
    } else if (chip === 'Pricing & Plans') {
      setSearchQuery('pricing');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          id="main-menu-overlay" 
          ref={overlayRef} 
          className="mobile-nav-menu fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-2xl text-foreground overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Main Navigation Menu"
        >
          {/* Ambient Lighting Blobs */}
          <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[130px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,transparent_70%)] opacity-60" />

          {/* Top Header Bar inside Drawer */}
          <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 shrink-0 border-b border-border-default sticky top-0 bg-background/85 backdrop-blur-xl z-20 shadow-linear-card">
            <div className="flex items-center gap-3">
              <Link 
                to="/" 
                onClick={onClose}
                className="transition-transform active:scale-95 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50" 
                aria-label="CatalystLab Home"
              >
                <BrandLogo size="md" />
              </Link>

              <div className="hidden sm:flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[11px] font-mono text-accent-bright">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent shadow-[0_0_8px_rgba(94,106,210,0.8)]" />
                </span>
                <span>Edge Telemetry Active</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Dark Mode Toggle inside hamburger menu drawer */}
              <div 
                className="flex items-center rounded-full border border-border-default bg-card/80 p-0.5 shadow-2xs"
                title="Toggle Dark / Light Mode"
              >
                <ThemeToggle />
              </div>

              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-foreground-muted font-mono">
                PRESS <kbd className="rounded-md border border-border-default bg-white/[0.06] px-1.5 py-0.5 text-foreground font-semibold text-[10px]">ESC</kbd> TO CLOSE
              </span>

              {/* Close Button with high contrast and accessible touch area */}
              <button
                onClick={onClose}
                className="group flex size-10 items-center justify-center rounded-full border border-border-default bg-card/90 text-foreground transition-all duration-200 hover:bg-card-hover hover:border-accent/40 active:scale-95 cursor-pointer shadow-linear-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                aria-label="Close navigation menu"
              >
                <X className="size-5 text-foreground-muted group-hover:text-foreground group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>
          </div>

          {/* Center Main Navigation Body */}
          <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-8 lg:px-12 py-6 sm:py-8 z-10">
            
            {/* Dedicated High-Contrast Mobile Search Bar inside Drawer */}
            <div className="mb-6 w-full max-w-2xl">
              <div className="relative flex items-center rounded-2xl border border-border-default bg-card/90 backdrop-blur-xl px-3.5 py-2.5 shadow-linear-card focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                <Search className="size-4.5 text-accent-bright shrink-0 mr-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 8 diagnostic engines, documentation, APIs, and tools..."
                  className="w-full bg-transparent text-[13px] sm:text-sm text-foreground placeholder:text-foreground-muted/60 focus:outline-none font-mono"
                  aria-label="Search navigation and engines"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-mono text-foreground-muted hover:text-foreground p-1 rounded-md hover:bg-white/[0.08] transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Quick Preset Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted mr-1">
                  Quick:
                </span>
                {PRESET_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer border',
                      (chip === 'All Engines' && !searchQuery) || searchQuery.toLowerCase() === chip.toLowerCase()
                        ? 'border-accent/40 bg-accent/15 text-accent-bright font-semibold'
                        : 'border-border-default bg-card/60 text-foreground-muted hover:text-foreground hover:border-accent/30 hover:bg-white/[0.04]'
                    )}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Results View (If search query active) */}
            {searchQuery.trim() ? (
              <div className="mb-8 rounded-2xl border border-border-default bg-card/80 backdrop-blur-xl p-4 sm:p-6 shadow-linear-card">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-default">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Search className="size-3.5 text-accent-bright" />
                    <span>Search Results ({searchResults.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-mono text-accent-bright hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {searchResults.map((res) => {
                      const Icon = res.icon;
                      return (
                        <Link
                          key={res.path}
                          to={res.path}
                          onClick={onClose}
                          className="group flex flex-col justify-between rounded-xl border border-border-default bg-white/[0.02] p-3 transition-all duration-200 hover:border-accent/50 hover:bg-white/[0.06] hover:shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="size-7 rounded-lg border border-border-default bg-card/80 flex items-center justify-center text-accent-bright group-hover:scale-105 transition-transform">
                                  <Icon className="size-3.5" />
                                </div>
                                <span className="text-[13px] font-semibold text-foreground tracking-tight group-hover:text-accent-bright transition-colors">
                                  {res.title}
                                </span>
                              </div>
                              <span className="rounded-md border border-accent/20 bg-accent/10 px-1.5 py-0.5 text-[9px] font-mono uppercase text-accent-bright font-medium">
                                {res.category}
                              </span>
                            </div>
                            <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed mt-1">
                              {res.desc}
                            </p>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-border-default/50 flex items-center justify-between text-[11px] font-mono text-accent-bright">
                            <span>Open Vector</span>
                            <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Search className="size-8 text-foreground-muted/40 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">No matches found for "{searchQuery}"</p>
                    <p className="text-xs text-foreground-muted mt-1 font-mono">Try keywords like vitals, security, latency, api, or pricing.</p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Standard Navigation Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Primary Structured Navigation Menu (Left Column) */}
              <div className="lg:col-span-7 flex flex-col space-y-3">
                <nav className="mobile-nav-links flex flex-col space-y-2.5" aria-label="Main Menu">
                  
                  {/* 1. Home */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: 0.04 }}
                  >
                    <Link
                      to="/"
                      onClick={onClose}
                      className={cn(
                        'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all duration-200 border',
                        isCurrentActive('/')
                          ? 'border-accent/40 bg-accent/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                          : 'border-transparent hover:border-border-default hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'size-8.5 rounded-lg border flex items-center justify-center transition-colors',
                          isCurrentActive('/')
                            ? 'border-accent/40 bg-accent/20 text-accent-bright'
                            : 'border-border-default bg-white/[0.03] text-foreground-muted group-hover:text-foreground group-hover:border-accent/30'
                        )}>
                          <Home className="size-4" />
                        </div>
                        <span className={cn(
                          'text-base sm:text-lg font-semibold tracking-tight transition-colors',
                          isCurrentActive('/') ? 'text-foreground' : 'text-foreground-muted group-hover:text-foreground'
                        )}>
                          Home
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-foreground-muted/40 group-hover:text-foreground-muted group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>

                  {/* 2. Services & Architecture Accordion */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: 0.08 }}
                    className="flex flex-col rounded-xl border border-border-default bg-card/40 p-2 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-2 py-1">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'size-8.5 rounded-lg border flex items-center justify-center transition-colors',
                          isServicesActive
                            ? 'border-accent/40 bg-accent/20 text-accent-bright'
                            : 'border-border-default bg-white/[0.03] text-foreground-muted'
                        )}>
                          <Layers className="size-4" />
                        </div>
                        <span className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                          Services &amp; Platform
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedServices(!expandedServices)}
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-white/[0.06] transition-colors cursor-pointer"
                        aria-label="Toggle Services sub-menu"
                      >
                        <ChevronDown className={cn('size-4.5 transition-transform duration-200', expandedServices && 'rotate-180 text-accent-bright')} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedServices && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="flex flex-col space-y-1 pt-1.5 overflow-hidden"
                        >
                          <Link
                            to="/pricing"
                            onClick={onClose}
                            className={cn(
                              'group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-all',
                              isCurrentActive('/pricing')
                                ? 'bg-accent/15 text-accent-bright font-medium'
                                : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <CreditCard className="size-3.5 text-accent-bright" />
                              <span className="font-medium">Pricing &amp; Plans</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-default bg-white/[0.04] text-foreground-muted">
                              RFC 2026
                            </span>
                          </Link>

                          <Link
                            to="/products"
                            onClick={onClose}
                            className={cn(
                              'group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-all',
                              isCurrentActive('/products')
                                ? 'bg-accent/15 text-accent-bright font-medium'
                                : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <Radio className="size-3.5 text-emerald-400" />
                              <span className="font-medium">Products &amp; Watchdog</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                              Continuous
                            </span>
                          </Link>

                          <Link
                            to="/dashboard/webhooks"
                            onClick={onClose}
                            className={cn(
                              'group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-all',
                              isCurrentActive('/dashboard/webhooks')
                                ? 'bg-accent/15 text-accent-bright font-medium'
                                : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <GitBranch className="size-3.5 text-indigo-400" />
                              <span className="font-medium">GitHub CI/CD Webhooks</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-default bg-white/[0.04] text-foreground-muted">
                              Real-time
                            </span>
                          </Link>

                          <Link
                            to="/compare"
                            onClick={onClose}
                            className={cn(
                              'group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-all',
                              isCurrentActive('/compare')
                                ? 'bg-accent/15 text-accent-bright font-medium'
                                : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <Scale className="size-3.5 text-amber-400" />
                              <span className="font-medium">Side-by-Side Domain Compare</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-default bg-white/[0.04] text-foreground-muted">
                              Dual Radar
                            </span>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* 3. Resources Accordion */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: 0.12 }}
                    className="flex flex-col rounded-xl border border-border-default bg-card/40 p-2 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-2 py-1">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'size-8.5 rounded-lg border flex items-center justify-center transition-colors',
                          isResourcesActive
                            ? 'border-accent/40 bg-accent/20 text-accent-bright'
                            : 'border-border-default bg-white/[0.03] text-foreground-muted'
                        )}>
                          <BookOpen className="size-4" />
                        </div>
                        <span className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                          Resources &amp; Developer APIs
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedResources(!expandedResources)}
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-white/[0.06] transition-colors cursor-pointer"
                        aria-label="Toggle Resources sub-menu"
                      >
                        <ChevronDown className={cn('size-4.5 transition-transform duration-200', expandedResources && 'rotate-180 text-accent-bright')} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedResources && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="flex flex-col space-y-1 pt-1.5 overflow-hidden"
                        >
                          <Link
                            to="/docs"
                            onClick={onClose}
                            className={cn(
                              'group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-all',
                              isCurrentActive('/docs')
                                ? 'bg-accent/15 text-accent-bright font-medium'
                                : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <BookOpen className="size-3.5 text-accent-bright" />
                              <span className="font-medium">Documentation &amp; Architecture</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-default bg-white/[0.04] text-foreground-muted">
                              14 Modules
                            </span>
                          </Link>

                          <Link
                            to="/api-docs"
                            onClick={onClose}
                            className={cn(
                              'group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-all',
                              isCurrentActive('/api-docs')
                                ? 'bg-accent/15 text-accent-bright font-medium'
                                : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <Code2 className="size-3.5 text-purple-400" />
                              <span className="font-medium">REST API Reference</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400">
                              v2.4
                            </span>
                          </Link>

                          <Link
                            to="/playground"
                            onClick={onClose}
                            className={cn(
                              'group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-all',
                              isCurrentActive('/playground')
                                ? 'bg-accent/15 text-accent-bright font-medium'
                                : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <Terminal className="size-3.5 text-cyan-400" />
                              <span className="font-medium">Interactive Playground</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-default bg-white/[0.04] text-foreground-muted">
                              Sandbox
                            </span>
                          </Link>

                          <Link
                            to="/blogs"
                            onClick={onClose}
                            className={cn(
                              'group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-all',
                              isCurrentActive('/blogs')
                                ? 'bg-accent/15 text-accent-bright font-medium'
                                : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <FileText className="size-3.5 text-emerald-400" />
                              <span className="font-medium">Engineering Blogs</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-default bg-white/[0.04] text-foreground-muted">
                              Articles
                            </span>
                          </Link>

                          <Link
                            to="/methodology"
                            onClick={onClose}
                            className={cn(
                              'group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-all',
                              isCurrentActive('/methodology')
                                ? 'bg-accent/15 text-accent-bright font-medium'
                                : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <Compass className="size-3.5 text-indigo-400" />
                              <span className="font-medium">Audit Methodology</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-default bg-white/[0.04] text-foreground-muted">
                              Weights
                            </span>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* 4. About Us */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: 0.16 }}
                  >
                    <Link
                      to="/about"
                      onClick={onClose}
                      className={cn(
                        'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all duration-200 border',
                        isCurrentActive('/about')
                          ? 'border-accent/40 bg-accent/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                          : 'border-transparent hover:border-border-default hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'size-8.5 rounded-lg border flex items-center justify-center transition-colors',
                          isCurrentActive('/about')
                            ? 'border-accent/40 bg-accent/20 text-accent-bright'
                            : 'border-border-default bg-white/[0.03] text-foreground-muted group-hover:text-foreground group-hover:border-accent/30'
                        )}>
                          <Info className="size-4" />
                        </div>
                        <span className={cn(
                          'text-base sm:text-lg font-semibold tracking-tight transition-colors',
                          isCurrentActive('/about') ? 'text-foreground' : 'text-foreground-muted group-hover:text-foreground'
                        )}>
                          About Us
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-foreground-muted/40 group-hover:text-foreground-muted group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>

                  {/* 5. Contact */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: 0.2 }}
                  >
                    <Link
                      to="/contact"
                      onClick={onClose}
                      className={cn(
                        'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all duration-200 border',
                        isCurrentActive('/contact')
                          ? 'border-accent/40 bg-accent/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                          : 'border-transparent hover:border-border-default hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'size-8.5 rounded-lg border flex items-center justify-center transition-colors',
                          isCurrentActive('/contact')
                            ? 'border-accent/40 bg-accent/20 text-accent-bright'
                            : 'border-border-default bg-white/[0.03] text-foreground-muted group-hover:text-foreground group-hover:border-accent/30'
                        )}>
                          <Mail className="size-4" />
                        </div>
                        <span className={cn(
                          'text-base sm:text-lg font-semibold tracking-tight transition-colors',
                          isCurrentActive('/contact') ? 'text-foreground' : 'text-foreground-muted group-hover:text-foreground'
                        )}>
                          Contact
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-foreground-muted/40 group-hover:text-foreground-muted group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>

                  {/* 6. Admin (Conditional) */}
                  {hasPermission('page:view_admin') && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, delay: 0.24 }}
                    >
                      <Link
                        to="/admin"
                        onClick={onClose}
                        className={cn(
                          'group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all duration-200 border',
                          isCurrentActive('/admin')
                            ? 'border-accent/40 bg-accent/10'
                            : 'border-transparent hover:border-border-default hover:bg-white/[0.04]'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-8.5 rounded-lg border border-accent/40 bg-accent/20 text-accent-bright flex items-center justify-center">
                            <ShieldCheck className="size-4" />
                          </div>
                          <span className="text-base sm:text-lg font-semibold tracking-tight text-accent-bright">
                            Admin Console
                          </span>
                        </div>
                        <ChevronRight className="size-4 text-accent-bright" />
                      </Link>
                    </motion.div>
                  )}

                </nav>

                {/* Mobile Direct Audit Launch Banner */}
                <div className="pt-2">
                  <Link
                    to="/launch-audit"
                    onClick={onClose}
                    className="relative group/launch overflow-hidden flex items-center justify-between w-full rounded-2xl bg-accent p-3.5 text-white font-medium shadow-linear-cta transition-transform hover:scale-[1.01] active:scale-[0.99] hover:bg-accent-bright"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/launch:translate-x-full transition-transform duration-700 ease-out" />
                    <div className="flex items-center gap-3">
                      <div className="size-8.5 rounded-xl bg-white/10 flex items-center justify-center">
                        <Sparkles className="size-4.5 text-indigo-200" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold">Launch Master Audit</div>
                        <div className="text-xs text-indigo-200/80">Audit 8 vectors concurrently</div>
                      </div>
                    </div>
                    <ArrowRight className="size-4.5 text-white/80 group-hover/launch:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>

              {/* Secondary Telemetry & Engine Hub Card (Right Column) */}
              <div className="lg:col-span-5 flex flex-col space-y-4 rounded-2xl border border-border-default bg-card/90 backdrop-blur-xl p-4 sm:p-5 shadow-linear-card font-mono relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                
                {/* 8 Diagnostic Engines Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-accent" />
                      </span>
                      <span>8 Diagnostic Engines</span>
                    </span>
                    <Link 
                      to="/docs" 
                      onClick={onClose}
                      className="text-[11px] font-semibold text-accent-bright hover:underline transition-colors flex items-center gap-1"
                    >
                      <span>Architecture</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {engines.map((eng) => {
                      const Icon = eng.icon;
                      return (
                        <Link
                          key={eng.name}
                          to={eng.path}
                          onClick={onClose}
                          className="group flex flex-col justify-between rounded-xl border border-border-default bg-white/[0.02] p-2.5 transition-all duration-150 hover:border-accent/40 hover:bg-white/[0.06] hover:shadow-2xs"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="size-3.5 text-accent-bright shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="truncate text-xs font-medium text-foreground">{eng.name}</span>
                          </div>
                          <span className="text-[10px] text-foreground-muted truncate font-normal">
                            {eng.sub}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Tools & Insights */}
                <div className="border-t border-border-default pt-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block mb-2">
                    Platform Tools
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link
                      to="/compare"
                      onClick={onClose}
                      className="flex items-center gap-2 rounded-xl border border-border-default bg-white/[0.02] p-2 text-foreground hover:border-accent/40 hover:bg-white/[0.05] transition-all font-medium"
                    >
                      <Scale className="size-3.5 text-accent-bright shrink-0" />
                      <span className="truncate">Side-by-Side</span>
                    </Link>

                    <Link
                      to="/reports"
                      onClick={onClose}
                      className="flex items-center gap-2 rounded-xl border border-border-default bg-white/[0.02] p-2 text-foreground hover:border-accent/40 hover:bg-white/[0.05] transition-all font-medium"
                    >
                      <FileText className="size-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Saved Audits</span>
                    </Link>

                    <Link
                      to="/products"
                      onClick={onClose}
                      className="flex items-center gap-2 rounded-xl border border-border-default bg-white/[0.02] p-2 text-foreground hover:border-accent/40 hover:bg-white/[0.05] transition-all font-medium"
                    >
                      <Radio className="size-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">Watchdog Hub</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={onClose}
                      className="flex items-center gap-2 rounded-xl border border-border-default bg-white/[0.02] p-2 text-foreground hover:border-accent/40 hover:bg-white/[0.05] transition-all font-medium"
                    >
                      <LayoutDashboard className="size-3.5 text-accent-bright shrink-0" />
                      <span className="truncate">Dashboard</span>
                    </Link>
                  </div>
                </div>

                {/* User Account / Auth Status in Menu */}
                <div className="border-t border-border-default pt-3.5">
                  {user ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] border border-border-default rounded-xl p-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt="User profile avatar" 
                            className="size-8 rounded-lg object-cover border border-border-default shrink-0" 
                          />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 text-xs font-bold text-accent-bright shrink-0">
                            {(user.displayName || user.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                            <span className="truncate">{user.displayName || user.email?.split('@')[0]}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
                              {roleConfig.shortLabel}
                            </span>
                          </div>
                          <div className="text-[10px] text-foreground-muted truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasPermission('page:view_admin') && (
                          <Link
                            to="/admin"
                            onClick={onClose}
                            className="flex items-center gap-1 rounded-lg border border-border-default bg-card px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-card-hover transition-colors"
                          >
                            <ShieldCheck className="size-3 text-accent-bright" />
                            <span>Admin</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            onClose();
                          }}
                          className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          title="Sign Out"
                        >
                          <LogOut className="size-3" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Link
                        to="/login"
                        onClick={onClose}
                        className="flex flex-1 w-full items-center justify-center gap-1.5 rounded-xl bg-card border border-border-default py-2 text-xs font-medium text-foreground hover:bg-card-hover hover:border-accent/40 transition-all shadow-linear-card"
                      >
                        <LogIn className="size-3.5 text-foreground-muted" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        to="/signup"
                        onClick={onClose}
                        className="flex flex-1 w-full items-center justify-center gap-1.5 rounded-xl bg-accent hover:bg-accent-bright text-white py-2 text-xs font-medium shadow-linear-cta transition-all"
                      >
                        <UserPlus className="size-3.5" />
                        <span>Create Account</span>
                      </Link>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>

          {/* Bottom Footer Bar inside Overlay */}
          <div className="relative mx-auto flex w-full max-w-7xl flex-col sm:flex-row items-center justify-between border-t border-border-default px-6 py-4 text-xs font-mono text-foreground-muted sm:px-8 gap-3 shrink-0 mt-auto bg-background/60">
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/privacy" onClick={onClose} className="hover:text-foreground transition-colors" aria-label="Read privacy policy and GDPR details">Privacy</Link>
              <Link to="/terms" onClick={onClose} className="hover:text-foreground transition-colors" aria-label="Read terms of service agreement">Terms</Link>
              <Link to="/cookies" onClick={onClose} className="hover:text-foreground transition-colors" aria-label="Manage cookie preferences">Cookies</Link>
              <Link to="/security" onClick={onClose} className="hover:text-foreground transition-colors" aria-label="Read security policy and SecOps disclosures">SecOps</Link>
              <Link to="/methodology" onClick={onClose} className="hover:text-foreground transition-colors" aria-label="Read audit methodology and scoring weights">Audit Methodology</Link>
            </div>

            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span>&copy; 2026 <strong className="text-foreground font-semibold">CatalystLab</strong> Intelligence Platform</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MainMenuOverlay;
