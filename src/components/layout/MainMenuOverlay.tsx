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


export interface NavItem {
  title: string;
  path?: string;
  icon?: any;
  badge?: string;
  badgeColor?: string;
  children?: NavItem[];
  permission?: string;
}

export const MAIN_MENU_DATA: NavItem[] = [
  {
    title: 'Home',
    path: '/',
    icon: Home,
  },
  {
    title: 'Catalysts',
    icon: Activity,
    children: [
      { title: 'VitalZyme Engine', path: '/health', icon: Activity, badge: 'Vitals' },
      { title: 'LLM-Kinase Engine', path: '/ai-readiness', icon: Cpu, badge: 'AI' },
      { title: 'GitLygase Engine', path: '/repo-scanner', icon: Terminal, badge: 'SecOps' },
      { title: 'EdgeVmax Engine', path: '/latency', icon: Globe, badge: 'Global' },
      { title: 'EcoHolo Engine', path: '/eco-audit', icon: Leaf, badge: 'Carbon' },
      { title: 'RiskProtease Engine', path: '/compliance', icon: ShieldCheck, badge: 'OWASP' },
      { title: 'SynthShift Engine', path: '/migration', icon: GitBranch, badge: 'Migration' },
      { title: 'AllosterSearch Engine', path: '/llmo', icon: Sparkles, badge: 'LLMO' }
    ]
  },
  {
    title: 'Platform Tools',
    icon: Layers,
    children: [
      { title: 'Master Audit Launch', path: '/launch-audit', icon: Sparkles, badgeColor: 'emerald' },
      { title: 'Products & Watchdog', path: '/products', icon: Radio, badge: 'Continuous', badgeColor: 'emerald' },
      { title: 'Side-by-Side Compare', path: '/compare', icon: Scale, badge: 'Radar' },
      { title: 'GitHub Webhooks', path: '/dashboard/webhooks', icon: GitBranch },
      { title: 'Pricing & Plans', path: '/pricing', icon: CreditCard }
    ]
  },
  {
    title: 'Resources & Developer APIs',
    icon: BookOpen,
    children: [
      { title: 'Documentation & Architecture', path: '/docs', icon: BookOpen, badge: '14 Modules' },
      { title: 'REST API Reference', path: '/api-docs', icon: Code2, badge: 'v2.4', badgeColor: 'purple' },
      { title: 'Interactive Playground', path: '/playground', icon: Terminal, badge: 'Sandbox' },
      { title: 'Engineering Blogs', path: '/blogs', icon: FileText, badge: 'Articles' },
      { title: 'Audit Methodology', path: '/methodology', icon: Compass, badge: 'Weights' },
    ]
  },
  {
    title: 'About Us',
    path: '/about',
    icon: Info,
  },
  {
    title: 'Contact',
    path: '/contact',
    icon: Mail,
  },
  {
    title: 'Admin Console',
    path: '/admin',
    icon: ShieldCheck,
    permission: 'page:view_admin'
  }
];

const isAnyChildActive = (item: NavItem, currentPath: string): boolean => {
  if (item.path && (currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path)))) return true;
  if (item.children) {
    return item.children.some(child => isAnyChildActive(child, currentPath));
  }
  return false;
};

const CollapsibleMenuItem = ({ 
  item, 
  level = 0,
  currentPath,
  onClose,
  hasPermission
}: { 
  item: NavItem, 
  level?: number, 
  currentPath: string, 
  onClose: () => void,
  hasPermission: (p: string) => boolean 
}) => {
  const [isExpanded, setIsExpanded] = useState(() => isAnyChildActive(item, currentPath));

  if (item.permission && !hasPermission(item.permission)) return null;

  const isActive = item.path ? (currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))) : false;
  const childActive = isAnyChildActive(item, currentPath);

  const Icon = item.icon;

  if (item.children) {
    return (
      <div className="flex flex-col w-full">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "group flex items-center justify-between rounded-xl px-3.5 transition-all duration-200 border w-full",
            level > 0 ? "py-2 px-3 border-transparent" : "py-2.5 border-transparent hover:border-border-default hover:bg-white/[0.04]",
            childActive && level === 0 ? "bg-white/[0.02]" : ""
          )}
          style={{ paddingLeft: level > 0 ? `${Math.max(0.875, level * 1.25 + 0.875)}rem` : undefined }}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn(
                "rounded-lg border flex items-center justify-center transition-colors border-border-default bg-white/[0.03] text-foreground-muted group-hover:text-foreground group-hover:border-accent/30",
                level === 0 ? "size-8.5" : "size-7"
              )}>
                <Icon className={level === 0 ? "size-4" : "size-3.5"} />
              </div>
            )}
            <span className={cn(
              "font-semibold tracking-tight transition-colors text-foreground-muted group-hover:text-foreground",
              level === 0 ? "text-sm sm:text-base" : "text-xs font-medium"
            )}>
              {item.title}
            </span>
          </div>
          <ChevronDown className={cn("size-4 text-foreground-muted/40 transition-transform duration-200", isExpanded && "rotate-180 text-accent-bright")} />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col overflow-hidden"
            >
              <div className="pt-1 pb-1 space-y-0.5">
                {item.children.map((child, index) => (
                  <CollapsibleMenuItem 
                    key={index} 
                    item={child} 
                    level={level + 1} 
                    currentPath={currentPath}
                    onClose={onClose}
                    hasPermission={hasPermission}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      to={item.path || "#"}
      onClick={onClose}
      className={cn(
        "group flex items-center justify-between rounded-xl px-3.5 transition-all duration-200 border w-full",
        isActive
          ? "border-accent/40 bg-accent/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
          : "border-transparent hover:border-border-default hover:bg-white/[0.04]",
        level > 0 ? "py-2 px-3" : "py-2.5"
      )}
      style={{ paddingLeft: level > 0 ? `${Math.max(0.875, level * 1.25 + 0.875)}rem` : undefined }}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn(
            "rounded-lg border flex items-center justify-center transition-colors",
            isActive
              ? "border-accent/40 bg-accent/20 text-accent-bright"
              : "border-border-default bg-white/[0.03] text-foreground-muted group-hover:text-foreground group-hover:border-accent/30",
            level === 0 ? "size-8.5" : "size-7"
          )}>
            <Icon className={level === 0 ? "size-4" : "size-3.5"} />
          </div>
        )}
        <span className={cn(
          "font-semibold tracking-tight transition-colors",
          isActive ? "text-foreground" : "text-foreground-muted group-hover:text-foreground",
          level === 0 ? "text-sm sm:text-base" : "text-xs font-medium text-foreground-muted hover:text-foreground",
          level > 0 && isActive && "text-accent-bright font-semibold"
        )}>
          {item.title}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {item.badge && (
          <span className={cn(
            "text-[10px] font-mono px-1.5 py-0.5 rounded border",
            item.badgeColor === 'emerald' ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
            item.badgeColor === 'purple' ? "border-purple-500/30 bg-purple-500/10 text-purple-400" :
            "border-border-default bg-white/[0.04] text-foreground-muted"
          )}>
            {item.badge}
          </span>
        )}
        {level === 0 && (
          <ChevronRight className={cn(
            "size-4 transition-all",
            isActive ? "text-accent-bright" : "text-foreground-muted/40 group-hover:text-foreground-muted group-hover:translate-x-1"
          )} />
        )}
      </div>
    </Link>
  );
}

export const MainMenuOverlay: React.FC<MainMenuOverlayProps> = ({ isOpen, onClose }) => {

  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission, roleConfig } = useRoleSecurity();
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
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            id="main-menu-overlay" 
            ref={overlayRef} 
            className="relative w-[85vw] max-w-sm sm:max-w-md h-full bg-background border-l border-border-default text-foreground overflow-y-auto shadow-2xl flex flex-col z-10"
            role="dialog"
            aria-modal="true"
            aria-label="Main Navigation Menu"
          >
          {/* Ambient Lighting Blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[140px]" />
            <div className="absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[130px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,transparent_70%)] opacity-60" />
          </div>

          {/* Top Header Bar inside Drawer */}
          <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 shrink-0 border-b border-border-default sticky top-0 bg-background/85 backdrop-blur-xl z-20 shadow-linear-card">
            {/* User Profile / Login Link */}
            <div className="flex items-center">
              {user ? (
                <Link to="/admin" onClick={onClose} className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
                  <div className="size-8 rounded-full overflow-hidden bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User profile'} className="size-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-sm font-bold text-accent-bright">{user.email?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div className="flex flex-col text-left max-w-[140px] hidden sm:flex">
                    <span className="text-sm font-semibold text-foreground truncate">{user.displayName || 'Platform User'}</span>
                    <span className="text-[10px] text-foreground-muted truncate">{user.email}</span>
                  </div>
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-full border border-border-default bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card-hover hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50" 
                >
                  <div className="size-5 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0">
                    <UserPlus className="size-3 text-foreground-muted" />
                  </div>
                  Sign In
                </Link>
              )}
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
                className="group flex size-11 items-center justify-center rounded-full border border-border-default bg-card/90 text-foreground transition-all duration-200 hover:bg-card-hover hover:border-accent/40 active:scale-95 cursor-pointer shadow-linear-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
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
              <div className="relative flex items-center rounded-2xl border border-border-default bg-card/90 backdrop-blur-xl px-3 py-1.5 shadow-linear-card focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                <Search className="size-4 text-accent-bright shrink-0 mr-2.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search diagnostic engines and tools..."
                  className="w-full bg-transparent text-xs sm:text-[13px] text-foreground placeholder:text-foreground-muted/60 focus:outline-none font-mono"
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

            <div className="flex flex-col space-y-4">
              <nav className="mobile-nav-links flex flex-col space-y-2" aria-label="Main Menu">
                  {MAIN_MENU_DATA.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, delay: 0.04 + index * 0.04 }}
                    >
                      <CollapsibleMenuItem
                        item={item}
                        currentPath={location.pathname}
                        onClose={onClose}
                        hasPermission={hasPermission}
                      />
                    </motion.div>
                  ))}
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
        </div>
      )}
    </AnimatePresence>
  );
};

export default MainMenuOverlay;
