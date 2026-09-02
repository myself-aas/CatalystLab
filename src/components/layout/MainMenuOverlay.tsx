import React, { useEffect, useRef, useState } from 'react';
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
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoleSecurity } from '../../context/RoleSecurityContext';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from './ThemeToggle';

interface MainMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MainMenuOverlay: React.FC<MainMenuOverlayProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission, roleConfig } = useRoleSecurity();
  const [expandedServices, setExpandedServices] = useState(true);
  const [expandedResources, setExpandedResources] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  // Basic focus trap: keep Tab cycling inside the open dialog
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

  const isServicesActive = location.pathname.startsWith('/pricing') || location.pathname.startsWith('/products') || location.pathname.startsWith('/plugins');
  const isResourcesActive = location.pathname.startsWith('/docs') || location.pathname.startsWith('/api') || location.pathname.startsWith('/playground') || location.pathname.startsWith('/blogs');

  const engines = [
    { name: 'PAR (Phase 1)', path: '/migration', icon: GitBranch },
    { name: 'Code Quality', path: '/repo-scanner', icon: Terminal },
    { name: 'Build & Eco', path: '/eco-audit', icon: Leaf },
    { name: 'Testing & Vitals', path: '/health', icon: Activity },
    { name: 'Edge Latency', path: '/latency', icon: Globe },
    { name: 'DevSecOps', path: '/compliance', icon: ShieldCheck },
    { name: 'AI Readiness', path: '/ai-readiness', icon: Cpu },
    { name: 'LLMO Search', path: '/llmo', icon: Sparkles },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          id="main-menu-overlay" ref={overlayRef} 
          className="mobile-nav-menu fixed inset-0 z-[100] flex flex-col bg-background text-foreground overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Main Navigation Menu"
        >
      {/* Top Header Bar inside Overlay */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4 shrink-0 border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-[100]">
        <Link 
          to="/" 
          onClick={onClose}
          className="transition-opacity hover:opacity-90 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="CatalystLab Home"
        >
          <BrandLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <span className="hidden sm:inline-block text-xs text-muted-foreground font-mono">
            PRESS <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-foreground font-bold">ESC</kbd> TO CLOSE
          </span>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-foreground transition-colors hover:bg-accent cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Center Main Navigation Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-12 sm:px-12 lg:px-16 z-[100]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Primary Structured Navigation Menu */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <nav className="mobile-nav-links flex flex-col space-y-5" aria-label="Main Menu">
              
              {/* 1. Home */}
              <div>
                <Link
                  to="/"
                  onClick={onClose}
                  className="group relative flex items-center transition-colors py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div 
                    className={`flex items-center transition-all duration-150 ${
                      isCurrentActive('/') 
                        ? 'opacity-100 translate-x-0 w-6 mr-2' 
                        : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                    }`}
                  >
                    <span className="text-primary font-black text-2xl select-none">
                      →
                    </span>
                  </div>
                  <span 
                    className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight transition-colors ${
                      isCurrentActive('/') 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Home
                  </span>
                </Link>
              </div>

              {/* 2. Services */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`flex items-center transition-all duration-150 ${
                        isServicesActive 
                          ? 'opacity-100 translate-x-0 w-6 mr-2' 
                          : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                      }`}
                    >
                      <span className="text-primary font-black text-2xl select-none">
                        →
                      </span>
                    </div>
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
                      Services
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedServices(!expandedServices)}
                    className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                    aria-label="Toggle Services sub-menu"
                  >
                    <ChevronDown className={`h-6 w-6 transition-transform duration-200 ${expandedServices ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {expandedServices && (
                  <div className="flex flex-col space-y-2.5 pt-2 pl-6 border-l-2 border-border ml-2">
                    <Link
                      to="/pricing"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/pricing') 
                            ? 'opacity-100 translate-x-0 w-5 mr-2' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-primary font-bold text-lg select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/pricing') 
                            ? 'text-foreground font-extrabold' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Pricing Plans
                      </span>
                    </Link>

                    <Link
                      to="/products"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/products') || isCurrentActive('/plugins')
                            ? 'opacity-100 translate-x-0 w-5 mr-2' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-primary font-bold text-lg select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/products') || isCurrentActive('/plugins')
                            ? 'text-foreground font-extrabold' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Products & Plugins
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. Resources */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`flex items-center transition-all duration-150 ${
                        isResourcesActive 
                          ? 'opacity-100 translate-x-0 w-6 mr-2' 
                          : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                      }`}
                    >
                      <span className="text-primary font-black text-2xl select-none">
                        →
                      </span>
                    </div>
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
                      Resources
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedResources(!expandedResources)}
                    className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                    aria-label="Toggle Resources sub-menu"
                  >
                    <ChevronDown className={`h-6 w-6 transition-transform duration-200 ${expandedResources ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {expandedResources && (
                  <div className="flex flex-col space-y-2.5 pt-2 pl-6 border-l-2 border-border ml-2">
                    <Link
                      to="/docs"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/docs') 
                            ? 'opacity-100 translate-x-0 w-5 mr-2' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-primary font-bold text-lg select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/docs') 
                            ? 'text-foreground font-extrabold' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Documentation
                      </span>
                    </Link>

                    <Link
                      to="/api-reference"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/api-reference') || isCurrentActive('/api-docs')
                            ? 'opacity-100 translate-x-0 w-5 mr-2' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-primary font-bold text-lg select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/api-reference') || isCurrentActive('/api-docs')
                            ? 'text-foreground font-extrabold' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        API Reference
                      </span>
                    </Link>

                    <Link
                      to="/playground"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/playground') 
                            ? 'opacity-100 translate-x-0 w-5 mr-2' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-primary font-bold text-lg select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/playground') 
                            ? 'text-foreground font-extrabold' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Interactive Playground
                      </span>
                    </Link>

                    <Link
                      to="/blogs"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/blogs') 
                            ? 'opacity-100 translate-x-0 w-5 mr-2' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-primary font-bold text-lg select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/blogs') 
                            ? 'text-foreground font-extrabold' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Engineering Blogs
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 4. About Us */}
              <div>
                <Link
                  to="/about"
                  onClick={onClose}
                  className="group relative flex items-center transition-colors py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div 
                    className={`flex items-center transition-all duration-150 ${
                      isCurrentActive('/about') 
                        ? 'opacity-100 translate-x-0 w-6 mr-2' 
                        : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                    }`}
                  >
                    <span className="text-primary font-black text-2xl select-none">
                      →
                    </span>
                  </div>
                  <span 
                    className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight transition-colors ${
                      isCurrentActive('/about') 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    About Us
                  </span>
                </Link>
              </div>

              {/* 5. Contact */}
              <div>
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="group relative flex items-center transition-colors py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div 
                    className={`flex items-center transition-all duration-150 ${
                      isCurrentActive('/contact') 
                        ? 'opacity-100 translate-x-0 w-6 mr-2' 
                        : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                    }`}
                  >
                    <span className="text-primary font-black text-2xl select-none">
                      →
                    </span>
                  </div>
                  <span 
                    className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight transition-colors ${
                      isCurrentActive('/contact') 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Contact
                  </span>
                </Link>
              </div>

            </nav>
          </div>

          {/* Secondary Telemetry & Engine Hub Card */}
          <div className="lg:col-span-5 flex flex-col space-y-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 sm:p-6 shadow-md font-mono">
            
            {/* Quick Diagnostic Engines Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  <span>8 Diagnostic Engines</span>
                </span>
                <Link 
                  to="/docs" 
                  onClick={onClose}
                  className="text-[11px] font-semibold text-primary hover:underline transition-colors"
                >
                  View Docs →
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
                      className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 transition-colors hover:border-primary hover:bg-accent shadow-2xs"
                    >
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate font-medium">{eng.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Tools & Insights */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                Platform Intelligence
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/compare"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2.5 text-zinc-900 dark:text-zinc-100 hover:border-primary hover:bg-accent shadow-2xs font-medium"
                >
                  <Scale className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">Side-by-Side</span>
                </Link>

                <Link
                  to="/reports"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2.5 text-zinc-900 dark:text-zinc-100 hover:border-primary hover:bg-accent shadow-2xs font-medium"
                >
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">Audit Reports</span>
                </Link>

                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2.5 text-zinc-900 dark:text-zinc-100 hover:border-primary hover:bg-accent shadow-2xs font-medium"
                >
                  <Radio className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">Domain Watchdog</span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2.5 text-zinc-900 dark:text-zinc-100 hover:border-primary hover:bg-accent shadow-2xs font-medium"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">My Dashboard</span>
                </Link>
              </div>
            </div>

            {/* User Account / Auth Status in Menu */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
              {user ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="User profile avatar" 
                        className="h-9 w-9 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0" 
                        
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-xs font-bold text-white dark:text-zinc-900 shrink-0">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                        <span className="truncate">{user.displayName || user.email?.split('@')[0]}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
                          {roleConfig.shortLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasPermission('page:view_admin') && (
                      <Link
                        to="/admin"
                        onClick={onClose}
                        className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <ShieldCheck className="h-3 w-3 text-primary" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="h-3 w-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="flex flex-1 w-full items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 py-2.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-2xs"
                  >
                    <LogIn className="h-3.5 w-3.5 text-primary" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={onClose}
                    className="flex flex-1 w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-primary hover:text-zinc-900 dark:hover:bg-primary dark:hover:text-zinc-900 border border-transparent py-2.5 text-xs font-bold text-white dark:text-zinc-900 shadow-xs transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Create Account</span>
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Footer Bar inside Overlay */}
      <div className="mx-auto flex w-full max-w-7xl flex-col sm:flex-row items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 text-xs font-mono text-zinc-500 dark:text-zinc-400 sm:px-8 gap-3 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <Link to="/privacy" onClick={onClose} className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" onClick={onClose} className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/cookies" onClick={onClose} className="hover:text-foreground transition-colors">Cookies</Link>
          <Link to="/security" onClick={onClose} className="hover:text-foreground transition-colors">SecOps</Link>
          <Link to="/methodology" onClick={onClose} className="hover:text-foreground transition-colors">Audit Methodology</Link>
        </div>

        <div>
          <span>&copy; 2026 CatalystLab Intelligence Platform</span>
        </div>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MainMenuOverlay;

