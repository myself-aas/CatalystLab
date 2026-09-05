import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { 
  X, 
  LogOut, 
  UserPlus,
  Activity, 
  Scale, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  LayoutDashboard, 
  Terminal, 
  Leaf, 
  Cpu, 
  ChevronDown, 
  Radio,
  Home,
  BookOpen,
  Code2,
  CreditCard,
  Info,
  ArrowRight,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoleSecurity } from '../../context/RoleSecurityContext';
import { AppPermission } from '../../utils/rolePermissions';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../../lib/utils';

interface MainMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}


export interface NavItem {
  id: string;
  title: string;
  path?: string;
  icon?: any;
  badge?: string;
  badgeColor?: string;
  children?: NavItem[];
  permission?: AppPermission;
}

export const useMainMenuData = (user: any, isAdmin = false): NavItem[] => {
  return useMemo(() => {
    const engineChildren: NavItem[] = [
      { id: 'all-engines', title: 'View All Engines', path: '/engines', icon: Layers, badge: 'Matrix' },
      { id: 'vitalzyme', title: 'VitalZyme Engine', path: '/docs/vitalzyme', icon: Activity, badge: 'Vitals' },
      { id: 'riskprotease', title: 'RiskProtease Engine', path: '/docs/riskprotease', icon: ShieldCheck, badge: 'OWASP' },
      { id: 'gitlygase', title: 'GitLygase Engine', path: '/docs/gitlygase', icon: Terminal, badge: 'SecOps' },
      { id: 'llmkinase', title: 'LLM-Kinase Engine', path: '/docs/llm-kinase', icon: Cpu, badge: 'AI' },
    ];

    if (user) {
      return [
        {
          id: 'cmd-center',
          title: 'Command Center',
          path: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'diagnostic-hub',
          title: 'Diagnostic Hub (Engines)',
          icon: Activity,
          children: engineChildren,
        },
        {
          id: 'tools',
          title: 'Platform Tools',
          icon: Layers,
          children: [
            { id: 'products', title: 'Products & Watchdog', path: '/products', icon: Radio, badge: 'Continuous', badgeColor: 'emerald' },
            { id: 'compare', title: 'Side-by-Side Compare', path: '/compare', icon: Scale, badge: 'Radar' },
            { id: 'reports', title: 'Audit Dossiers', path: '/reports', icon: FileText },
          ]
        },
        {
          id: 'resources',
          title: 'Resources & API',
          icon: BookOpen,
          children: [
            { id: 'docs', title: 'Documentation & Architecture', path: '/docs', icon: BookOpen, badge: '14 Modules' },
            { id: 'api', title: 'REST API Reference', path: '/api-docs', icon: Code2, badge: 'v2.4', badgeColor: 'purple' },
            { id: 'playground', title: 'Interactive Playground', path: '/playground', icon: Terminal, badge: 'Sandbox' },
          ]
        },
        ...(isAdmin
          ? [{
              id: 'admin',
              title: 'Admin Console',
              path: '/admin',
              icon: ShieldCheck,
              permission: 'page:view_admin' as const,
            }]
          : []),
      ];
    } else {
      return [
        {
          id: 'home',
          title: 'Home',
          path: '/',
          icon: Home,
        },
        {
          id: 'diagnostic-hub',
          title: 'Diagnostic Hub',
          path: '/engines',
          icon: Activity,
        },
        {
          id: 'products',
          title: 'Platform Overview',
          path: '/products',
          icon: Layers,
        },
        {
          id: 'pricing',
          title: 'Pricing & Plans',
          path: '/pricing',
          icon: CreditCard,
        },
        {
          id: 'resources-unauth',
          title: 'Resources',
          icon: BookOpen,
          children: [
            { id: 'docs-unauth', title: 'Documentation', path: '/docs', icon: BookOpen },
            { id: 'blogs', title: 'Engineering Blogs', path: '/blogs', icon: FileText, badge: 'Articles' },
            { id: 'methodology', title: 'Audit Methodology', path: '/methodology', icon: Compass },
          ]
        },
        {
          id: 'about',
          title: 'About Us',
          path: '/about',
          icon: Info,
        },
      ];
    }
  }, [user, isAdmin]);
};

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
  hasPermission,
  expandedId,
  onToggle,
  index = 0
}: { 
  item: NavItem, 
  level?: number, 
  currentPath: string, 
  onClose: () => void,
  hasPermission: (permission: AppPermission) => boolean,
  expandedId: string | null,
  onToggle: (id: string) => void,
  index?: number
}) => {
  const isExpanded = expandedId === item.id;

  if (item.permission && !hasPermission(item.permission)) return null;

  const isActive = item.path ? (currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))) : false;
  const childActive = isAnyChildActive(item, currentPath);

  const Icon = item.icon;

  const MotionWrapper = level === 0 ? motion.li : 'li';
  const motionProps = level === 0 ? {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.18, delay: 0.04 + index * 0.04 }
  } : {};

  if (item.children) {
    return (
      <MotionWrapper className="flex flex-col w-full list-none" {...motionProps}>
        <button
          onClick={() => onToggle(item.id)}
          className={cn(
            "group flex items-center justify-between rounded-xl px-3.5 transition-all duration-200 border w-full",
            level > 0 ? "py-2 px-3 border-transparent" : "py-2.5 border-transparent hover:border-border hover:bg-muted/40",
            childActive && level === 0 ? "bg-muted/20" : ""
          )}
          style={{ paddingLeft: level > 0 ? `${Math.max(0.875, level * 1.25 + 0.875)}rem` : undefined }}
          aria-expanded={isExpanded}
          aria-controls={`submenu-${item.id}`}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn(
                "rounded-lg border flex items-center justify-center transition-colors border-border bg-muted/30 ds-muted group-hover:text-foreground group-hover:border-accent/30",
                level === 0 ? "size-8.5" : "size-7"
              )}>
                <Icon className={level === 0 ? "size-4" : "size-3.5"} />
              </div>
            )}
            <span className={cn(
              "font-semibold tracking-tight transition-colors ds-muted group-hover:text-foreground",
              level === 0 ? "text-sm sm:text-base" : "text-xs font-medium"
            )}>
              {item.title}
            </span>
          </div>
          <ChevronDown className={cn("size-4 ds-muted/40 transition-transform duration-200", isExpanded && "rotate-180 text-accent-bright")} aria-hidden="true" />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id={`submenu-${item.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col overflow-hidden"
              role="region"
              aria-label={`${item.title} submenu`}
            >
              <ul className="pt-1 pb-1 space-y-0.5 m-0 p-0">
                {item.children.map((child, childIdx) => (
                  <CollapsibleMenuItem 
                    key={child.id} 
                    item={child} 
                    level={level + 1} 
                    currentPath={currentPath}
                    onClose={onClose}
                    hasPermission={hasPermission}
                    expandedId={expandedId}
                    onToggle={onToggle}
                    index={childIdx}
                  />
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionWrapper>
    );
  }

  return (
    <MotionWrapper className="list-none w-full" {...motionProps}>
      <Link
        to={item.path || "#"}
        onClick={onClose}
        className={cn(
          "group flex items-center justify-between rounded-xl px-3.5 transition-all duration-200 border w-full",
          isActive
            ? "border-accent/40 bg-accent/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
            : "border-transparent hover:border-border hover:bg-muted/40",
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
                : "border-border bg-muted/30 ds-muted group-hover:text-foreground group-hover:border-accent/30",
              level === 0 ? "size-8.5" : "size-7"
            )}>
              <Icon className={level === 0 ? "size-4" : "size-3.5"} aria-hidden="true" />
            </div>
          )}
          <span className={cn(
            "font-semibold tracking-tight transition-colors",
            isActive ? "text-foreground" : "ds-muted group-hover:text-foreground",
            level === 0 ? "text-sm sm:text-base" : "text-xs font-medium ds-muted hover:text-foreground",
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
              "border-border bg-muted/40 ds-muted"
            )}>
              {item.badge}
            </span>
          )}
          {level === 0 && (
            <ChevronRight className={cn(
              "size-4 transition-all",
              isActive ? "text-accent-bright" : "ds-muted/40 group-hover:ds-muted group-hover:translate-x-1"
            )} aria-hidden="true" />
          )}
        </div>
      </Link>
    </MotionWrapper>
  );
}

export const MainMenuOverlay: React.FC<MainMenuOverlayProps> = ({ isOpen, onClose }) => {

  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { hasPermission, roleConfig } = useRoleSecurity();
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const menuData = useMainMenuData(user, Boolean(isAdmin));
  
  // Auto-collapse logic: only one root item can be expanded at a time
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Set initial expanded item based on current active path
  useEffect(() => {
    if (isOpen) {
      const activeParent = menuData.find(item => isAnyChildActive(item, location.pathname));
      if (activeParent) {
        setExpandedId(activeParent.id);
      }
    }
  }, [isOpen, location.pathname, menuData]);

  const handleToggle = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

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
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            id="main-menu-overlay" 
            ref={overlayRef} 
            className="relative w-[85vw] max-w-sm sm:max-w-md h-[100dvh] bg-background border-l border-border text-foreground flex flex-col shadow-2xl z-10"
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
          <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 shrink-0 border-b border-border bg-background/85 backdrop-blur-xl z-20 shadow-linear-card">
            {/* User Profile / Login Link */}
            <div className="flex items-center">
              {user ? (
                <Link to="/admin" onClick={onClose} className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
                  <div className="size-8 rounded-full overflow-hidden bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User profile'} className="size-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-sm font-bold text-accent-bright">{user.email?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div className="flex flex-col text-left max-w-[140px] hidden sm:flex">
                    <span className="text-sm font-semibold text-foreground truncate">{user.displayName || 'Platform User'}</span>
                    <span className="text-[10px] ds-muted truncate">{user.email}</span>
                  </div>
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card-hover hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50" 
                >
                  <div className="size-5 rounded-full bg-muted/80 flex items-center justify-center shrink-0">
                    <UserPlus className="size-3 ds-muted" aria-hidden="true" />
                  </div>
                  Sign In
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div 
                className="flex items-center rounded-full border border-border bg-card/80 p-0.5 shadow-2xs"
                title="Toggle Dark / Light Mode"
              >
                <ThemeToggle />
              </div>

              <span className="hidden md:inline-flex items-center gap-1.5 text-xs ds-muted font-mono">
                PRESS <kbd className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-foreground font-semibold text-[10px]">ESC</kbd> TO CLOSE
              </span>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="group flex size-11 items-center justify-center rounded-full border border-border bg-card/90 text-foreground transition-all duration-200 hover:bg-card-hover hover:border-accent/40 active:scale-95 cursor-pointer shadow-linear-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                aria-label="Close navigation menu"
              >
                <X className="size-5 ds-muted group-hover:text-foreground group-hover:rotate-90 transition-all duration-300" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Center Main Navigation Body */}
          <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-4 z-10 flex-1 overflow-y-auto no-scrollbar">
            
            <div className="flex flex-col space-y-4 flex-1">
              <nav aria-label="Main Menu">
                  <ul className="flex flex-col space-y-2 m-0 p-0">
                    {menuData.map((item, index) => (
                      <CollapsibleMenuItem
                        key={item.id}
                        item={item}
                        currentPath={location.pathname}
                        onClose={onClose}
                        hasPermission={hasPermission}
                        expandedId={expandedId}
                        onToggle={handleToggle}
                        index={index}
                      />
                    ))}
                  </ul>
                </nav>
            </div>
          </div>
          
          {/* Action-Oriented Pinned CTA - Phase 3 */}
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 py-4 shrink-0 bg-background/80 backdrop-blur-md border-t border-border/50 z-20">
            <Link
              to="/audit"
              onClick={onClose}
              className="relative group/launch overflow-hidden flex items-center justify-between w-full rounded-2xl bg-accent p-3.5 text-white font-medium shadow-linear-cta transition-transform hover:scale-[1.01] active:scale-[0.99] hover:bg-accent-bright"
              aria-label="Launch Master Audit"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/launch:translate-x-full transition-transform duration-700 ease-out" />
              <div className="flex items-center gap-3">
                <div className="size-8.5 rounded-xl bg-white/10 flex items-center justify-center">
                  <Sparkles className="size-4.5 text-indigo-200" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold">Launch Master Audit</div>
                  <div className="text-xs text-indigo-200/80">Audit 8 vectors concurrently</div>
                </div>
              </div>
              <ArrowRight className="size-4.5 text-white/80 group-hover/launch:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>

          {/* Bottom Footer Bar inside Overlay */}
          <div className="relative mx-auto flex w-full max-w-7xl flex-col sm:flex-row items-center justify-between border-t border-border px-6 py-4 text-xs font-mono ds-muted sm:px-8 gap-3 shrink-0 bg-background/95 backdrop-blur-xl">
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/privacy" onClick={onClose} className="hover:text-foreground transition-colors" aria-label="Read privacy policy and GDPR details">Privacy</Link>
              <Link to="/terms" onClick={onClose} className="hover:text-foreground transition-colors" aria-label="Read terms of service agreement">Terms</Link>
              <Link to="/cookies" onClick={onClose} className="hover:text-foreground transition-colors" aria-label="Manage cookie preferences">Cookies</Link>
              <Link to="/security" onClick={onClose} className="hover:text-foreground transition-colors" aria-label="Read security policy and SecOps disclosures">SecOps</Link>
              <Link to="/methodology" onClick={onClose} className="hover:text-foreground transition-colors" aria-label="Read audit methodology and scoring weights">Audit Methodology</Link>
            </div>

            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>&copy; 2026 <strong className="text-foreground font-semibold">CatalystLab</strong> Platform</span>
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MainMenuOverlay;
