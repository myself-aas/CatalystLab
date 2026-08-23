import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div 
      id="main-menu-overlay" 
      className="mobile-nav-menu fixed inset-0 z-[99999] flex flex-col bg-[#07111e] text-white selection:bg-brand-slate selection:text-white overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Main Navigation Menu"
    >
      {/* Top Header Bar inside Overlay */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 sm:px-8 shrink-0 border-b border-brand-slate/30 sticky top-0 bg-[#07111e]/98 backdrop-blur-md z-[100000]">
        <Link 
          to="/" 
          onClick={onClose}
          className="transition-opacity hover:opacity-90"
          aria-label="CatalystLab Home"
        >
          <BrandLogo size="md" />
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-xs text-slate-300 font-mono">
            PRESS <kbd className="rounded border border-slate-600 bg-[#0f1d32] px-1.5 py-0.5 text-white">ESC</kbd> TO CLOSE
          </span>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-[#0f1d32] text-white transition-colors hover:bg-slate-800 cursor-pointer shadow-lg"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Center Main Navigation Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8 sm:px-12 lg:px-16 my-auto z-[99999]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Primary Structured Navigation Menu */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <nav className="mobile-nav-links flex flex-col space-y-4 text-white" aria-label="Main Menu">
              
              {/* 1. Home */}
              <div>
                <Link
                  to="/"
                  onClick={onClose}
                  className="group relative flex items-center transition-colors py-1"
                >
                  <div 
                    className={`flex items-center transition-all duration-150 ${
                      isCurrentActive('/') 
                        ? 'opacity-100 translate-x-0 w-6 mr-2' 
                        : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                    }`}
                  >
                    <span className="text-accent-cyan font-bold text-xl select-none">
                      →
                    </span>
                  </div>
                  <span 
                    className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight transition-colors ${
                      isCurrentActive('/') 
                        ? 'text-accent-cyan' 
                        : 'text-brand-offwhite hover:text-accent-cyan'
                    }`}
                  >
                    Home
                  </span>
                </Link>
              </div>

              {/* 2. Services */}
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`flex items-center transition-all duration-150 ${
                        isServicesActive 
                          ? 'opacity-100 translate-x-0 w-6 mr-2' 
                          : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                      }`}
                    >
                      <span className="text-accent-cyan font-bold text-xl select-none">
                        →
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-brand-offwhite">
                      Services
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedServices(!expandedServices)}
                    className="p-1 rounded-lg text-brand-slate-light hover:text-white hover:bg-surface-panel transition-colors cursor-pointer"
                    aria-label="Toggle Services sub-menu"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expandedServices ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {expandedServices && (
                  <div className="flex flex-col space-y-1.5 pt-1 pl-6">
                    <Link
                      to="/pricing"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/pricing') 
                            ? 'opacity-100 translate-x-0 w-5 mr-1.5' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-accent-cyan font-bold text-sm select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-lg sm:text-xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/pricing') 
                            ? 'text-accent-cyan' 
                            : 'text-brand-periwinkle hover:text-white'
                        }`}
                      >
                        Pricing
                      </span>
                    </Link>

                    <Link
                      to="/products"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/products') || isCurrentActive('/plugins')
                            ? 'opacity-100 translate-x-0 w-5 mr-1.5' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-accent-cyan font-bold text-sm select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-lg sm:text-xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/products') || isCurrentActive('/plugins')
                            ? 'text-accent-cyan' 
                            : 'text-brand-periwinkle hover:text-white'
                        }`}
                      >
                        Products
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. Resources */}
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`flex items-center transition-all duration-150 ${
                        isResourcesActive 
                          ? 'opacity-100 translate-x-0 w-6 mr-2' 
                          : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                      }`}
                    >
                      <span className="text-accent-cyan font-bold text-xl select-none">
                        →
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-brand-offwhite">
                      Resources
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedResources(!expandedResources)}
                    className="p-1 rounded-lg text-brand-slate-light hover:text-white hover:bg-surface-panel transition-colors cursor-pointer"
                    aria-label="Toggle Resources sub-menu"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expandedResources ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {expandedResources && (
                  <div className="flex flex-col space-y-1.5 pt-1 pl-6">
                    <Link
                      to="/docs"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/docs') 
                            ? 'opacity-100 translate-x-0 w-5 mr-1.5' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-accent-cyan font-bold text-sm select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-lg sm:text-xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/docs') 
                            ? 'text-accent-cyan' 
                            : 'text-brand-periwinkle hover:text-white'
                        }`}
                      >
                        Docs
                      </span>
                    </Link>

                    <Link
                      to="/api-reference"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/api-reference') || isCurrentActive('/api-docs')
                            ? 'opacity-100 translate-x-0 w-5 mr-1.5' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-accent-cyan font-bold text-sm select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-lg sm:text-xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/api-reference') || isCurrentActive('/api-docs')
                            ? 'text-accent-cyan' 
                            : 'text-brand-periwinkle hover:text-white'
                        }`}
                      >
                        API Reference
                      </span>
                    </Link>

                    <Link
                      to="/playground"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/playground') 
                            ? 'opacity-100 translate-x-0 w-5 mr-1.5' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-accent-cyan font-bold text-sm select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-lg sm:text-xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/playground') 
                            ? 'text-accent-cyan' 
                            : 'text-brand-periwinkle hover:text-white'
                        }`}
                      >
                        Playground
                      </span>
                    </Link>

                    <Link
                      to="/blogs"
                      onClick={onClose}
                      className="group relative flex items-center transition-colors py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-150 ${
                          isCurrentActive('/blogs') 
                            ? 'opacity-100 translate-x-0 w-5 mr-1.5' 
                            : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-accent-cyan font-bold text-sm select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-lg sm:text-xl font-bold font-mono tracking-tight transition-colors ${
                          isCurrentActive('/blogs') 
                            ? 'text-accent-cyan' 
                            : 'text-brand-periwinkle hover:text-white'
                        }`}
                      >
                        Blogs
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
                  className="group relative flex items-center transition-colors py-1"
                >
                  <div 
                    className={`flex items-center transition-all duration-150 ${
                      isCurrentActive('/about') 
                        ? 'opacity-100 translate-x-0 w-6 mr-2' 
                        : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                    }`}
                  >
                    <span className="text-accent-cyan font-bold text-xl select-none">
                      →
                    </span>
                  </div>
                  <span 
                    className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight transition-colors ${
                      isCurrentActive('/about') 
                        ? 'text-accent-cyan' 
                        : 'text-brand-offwhite hover:text-accent-cyan'
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
                  className="group relative flex items-center transition-colors py-1"
                >
                  <div 
                    className={`flex items-center transition-all duration-150 ${
                      isCurrentActive('/contact') 
                        ? 'opacity-100 translate-x-0 w-6 mr-2' 
                        : 'opacity-0 -translate-x-2 w-0 mr-0 overflow-hidden'
                    }`}
                  >
                    <span className="text-accent-cyan font-bold text-xl select-none">
                      →
                    </span>
                  </div>
                  <span 
                    className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight transition-colors ${
                      isCurrentActive('/contact') 
                        ? 'text-accent-cyan' 
                        : 'text-brand-offwhite hover:text-accent-cyan'
                    }`}
                  >
                    Contact
                  </span>
                </Link>
              </div>

            </nav>
          </div>

          {/* Secondary Telemetry & Engine Hub Card */}
          <div className="lg:col-span-5 flex flex-col space-y-4 rounded-xl border border-brand-slate/40 bg-surface-panel p-5 sm:p-6 shadow-xl font-mono">
            
            {/* Quick Diagnostic Engines Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  <span>8 Diagnostic Engines</span>
                </span>
                <Link 
                  to="/docs" 
                  onClick={onClose}
                  className="text-[11px] font-semibold text-brand-periwinkle hover:text-white transition-colors"
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
                      className="flex items-center gap-2 rounded-lg border border-brand-slate/30 bg-brand-oxford px-2.5 py-1.5 text-xs text-brand-offwhite transition-colors hover:border-brand-slate hover:bg-surface-subtle"
                    >
                      <Icon className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
                      <span className="truncate">{eng.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Tools & Insights */}
            <div className="border-t border-brand-slate/30 pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate-light block mb-2">
                Platform Intelligence
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/compare"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg border border-brand-slate/30 bg-brand-oxford p-2 text-brand-offwhite hover:border-brand-slate hover:text-accent-cyan"
                >
                  <Scale className="h-3.5 w-3.5 text-accent-cyan" />
                  <span>Side-by-Side</span>
                </Link>

                <Link
                  to="/reports"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg border border-brand-slate/30 bg-brand-oxford p-2 text-brand-offwhite hover:border-brand-slate hover:text-accent-cyan"
                >
                  <FileText className="h-3.5 w-3.5 text-accent-cyan" />
                  <span>Audit Reports</span>
                </Link>

                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg border border-brand-slate/30 bg-brand-oxford p-2 text-brand-offwhite hover:border-brand-slate hover:text-accent-cyan"
                >
                  <Radio className="h-3.5 w-3.5 text-accent-cyan" />
                  <span>Domain Watchdog</span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg border border-brand-slate/30 bg-brand-oxford p-2 text-brand-offwhite hover:border-brand-slate hover:text-accent-cyan"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-accent-cyan" />
                  <span>My Dashboard</span>
                </Link>
              </div>
            </div>

            {/* User Account / Auth Status in Menu */}
            <div className="border-t border-brand-slate/30 pt-3">
              {user ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-oxford border border-brand-slate/30 rounded-xl p-3">
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="User profile avatar" 
                        className="h-8 w-8 rounded-lg object-cover border border-brand-slate/40" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-slate text-xs font-bold text-white">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-brand-offwhite truncate max-w-[150px] flex items-center gap-1">
                        <span className="truncate">{user.displayName || user.email?.split('@')[0]}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
                          {roleConfig.shortLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-brand-slate-light truncate max-w-[150px]">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasPermission('page:view_admin') && (
                      <Link
                        to="/admin"
                        onClick={onClose}
                        className="flex items-center gap-1 rounded-lg border border-brand-slate/40 bg-surface-panel px-2.5 py-1 text-xs font-bold text-accent-cyan hover:bg-surface-subtle"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/50 cursor-pointer"
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
                    className="flex flex-1 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-oxford border border-brand-slate/40 py-2 text-xs font-bold text-brand-offwhite hover:bg-surface-subtle"
                  >
                    <LogIn className="h-3.5 w-3.5 text-accent-cyan" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={onClose}
                    className="flex flex-1 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 py-2 text-xs font-bold text-white shadow-sm"
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
      <div className="mx-auto flex w-full max-w-7xl flex-col sm:flex-row items-center justify-between border-t border-brand-slate/30 px-6 py-3.5 text-xs font-mono text-brand-slate-light sm:px-8 gap-2 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <Link to="/privacy" onClick={onClose} className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/terms" onClick={onClose} className="hover:text-white transition-colors">Terms</Link>
          <Link to="/cookies" onClick={onClose} className="hover:text-white transition-colors">Cookies</Link>
          <Link to="/security" onClick={onClose} className="hover:text-white transition-colors">SecOps</Link>
          <Link to="/methodology" onClick={onClose} className="hover:text-white transition-colors">Audit Methodology</Link>
        </div>

        <div>
          <span>&copy; 2026 CatalystLab Intelligence Platform</span>
        </div>
      </div>
    </div>
  );
};

export default MainMenuOverlay;
