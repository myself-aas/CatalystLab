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
  ChevronRight, 
  Radio, 
  Code2, 
  BookOpen, 
  ArrowRight 
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
  const { user, login, logout } = useAuth();
  const { effectiveRole, hasPermission, roleConfig } = useRoleSecurity();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
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
      className="fixed inset-0 z-[9999] flex flex-col justify-between bg-[#0b192c] text-[#f8fafc] selection:bg-[#415a77]/35 selection:text-[#f8fafc] animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Main Navigation Menu"
    >
      {/* Top Header Bar inside Overlay */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8 shrink-0">
        <Link 
          to="/" 
          onClick={onClose}
          className="transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="CatalystLab Home"
        >
          <BrandLogo size="md" />
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-xs text-[#c5d3e8] font-mono">
            PRESS <kbd className="rounded border border-[#415a77]/40 bg-[#0d1b2a] px-1.5 py-0.5 text-[#f8fafc]">ESC</kbd> TO CLOSE
          </span>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#415a77]/40 bg-[#0d1b2a] text-[#c5d3e8] transition-all hover:border-[#415a77] hover:bg-[#152238] hover:text-[#f8fafc] hover:scale-105 active:scale-95 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Center Main Navigation Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-6 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start lg:items-center">
          
          {/* Primary Structured Navigation Menu */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <nav className="flex flex-col space-y-4 sm:space-y-6" aria-label="Main Menu">
              
              {/* 1. Home */}
              <div 
                onMouseEnter={() => setHoveredSection('home')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <Link
                  to="/"
                  onClick={onClose}
                  className="group relative flex items-center transition-all duration-150 py-1"
                >
                  <div 
                    className={`flex items-center transition-all duration-200 ${
                      isCurrentActive('/') 
                        ? 'opacity-100 translate-x-0 w-8 sm:w-10 mr-2' 
                        : 'opacity-0 -translate-x-4 w-0 mr-0 overflow-hidden'
                    }`}
                  >
                    <span className="text-[#415a77] font-extrabold text-2xl sm:text-4xl select-none">
                      →
                    </span>
                  </div>
                  <span 
                    className={`text-3xl sm:text-4xl md:text-5xl font-bold sm:font-extrabold tracking-tight transition-colors duration-150 ${
                      isCurrentActive('/') 
                        ? 'text-[#c5d3e8]' 
                        : 'text-[#f8fafc] hover:text-[#c5d3e8]'
                    }`}
                  >
                    Home
                  </span>
                </Link>
              </div>

              {/* 2. Services (Pricing & Products) */}
              <div 
                className="flex flex-col space-y-2"
                onMouseEnter={() => setHoveredSection('services')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`flex items-center transition-all duration-200 ${
                        isServicesActive 
                          ? 'opacity-100 translate-x-0 w-8 sm:w-10 mr-2' 
                          : 'opacity-0 -translate-x-4 w-0 mr-0 overflow-hidden'
                      }`}
                    >
                      <span className="text-[#415a77] font-extrabold text-2xl sm:text-4xl select-none">
                        →
                      </span>
                    </div>
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold sm:font-extrabold tracking-tight text-[#f8fafc]">
                      Services
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedServices(!expandedServices)}
                    className="p-1.5 rounded-lg text-[#8ea8c3] hover:text-white hover:bg-[#152238] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    aria-label="Toggle Services sub-menu"
                  >
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${expandedServices ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {expandedServices && (
                  <div className="flex flex-col space-y-2 sm:space-y-3 pt-2 pl-6 sm:pl-10">
                    <Link
                      to="/pricing"
                      onClick={onClose}
                      className="group relative flex items-center transition-all duration-150 py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-200 ${
                          isCurrentActive('/pricing') 
                            ? 'opacity-100 translate-x-0 w-6 sm:w-8 mr-2' 
                            : 'opacity-0 -translate-x-3 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-[#415a77] font-extrabold text-xl sm:text-2xl select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl md:text-3xl font-semibold sm:font-bold tracking-tight transition-colors duration-150 ${
                          isCurrentActive('/pricing') 
                            ? 'text-[#c5d3e8]' 
                            : 'text-[#c5d3e8]/75 hover:text-[#f8fafc]'
                        }`}
                      >
                        Pricing
                      </span>
                    </Link>

                    <Link
                      to="/products"
                      onClick={onClose}
                      className="group relative flex items-center transition-all duration-150 py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-200 ${
                          isCurrentActive('/products') || isCurrentActive('/plugins')
                            ? 'opacity-100 translate-x-0 w-6 sm:w-8 mr-2' 
                            : 'opacity-0 -translate-x-3 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-[#415a77] font-extrabold text-xl sm:text-2xl select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl md:text-3xl font-semibold sm:font-bold tracking-tight transition-colors duration-150 ${
                          isCurrentActive('/products') || isCurrentActive('/plugins')
                            ? 'text-[#c5d3e8]' 
                            : 'text-[#c5d3e8]/75 hover:text-[#f8fafc]'
                        }`}
                      >
                        Products
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. Resources [Docs, API (Reference, Playground), Blogs] */}
              <div 
                className="flex flex-col space-y-2"
                onMouseEnter={() => setHoveredSection('resources')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`flex items-center transition-all duration-200 ${
                        isResourcesActive 
                          ? 'opacity-100 translate-x-0 w-8 sm:w-10 mr-2' 
                          : 'opacity-0 -translate-x-4 w-0 mr-0 overflow-hidden'
                      }`}
                    >
                      <span className="text-[#415a77] font-extrabold text-2xl sm:text-4xl select-none">
                        →
                      </span>
                    </div>
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold sm:font-extrabold tracking-tight text-[#f8fafc]">
                      Resources
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedResources(!expandedResources)}
                    className="p-1.5 rounded-lg text-[#8ea8c3] hover:text-white hover:bg-[#152238] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    aria-label="Toggle Resources sub-menu"
                  >
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${expandedResources ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {expandedResources && (
                  <div className="flex flex-col space-y-2 sm:space-y-3 pt-2 pl-6 sm:pl-10">
                    <Link
                      to="/docs"
                      onClick={onClose}
                      className="group relative flex items-center transition-all duration-150 py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-200 ${
                          isCurrentActive('/docs') 
                            ? 'opacity-100 translate-x-0 w-6 sm:w-8 mr-2' 
                            : 'opacity-0 -translate-x-3 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-[#415a77] font-extrabold text-xl sm:text-2xl select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl md:text-3xl font-semibold sm:font-bold tracking-tight transition-colors duration-150 ${
                          isCurrentActive('/docs') 
                            ? 'text-[#c5d3e8]' 
                            : 'text-[#c5d3e8]/75 hover:text-[#f8fafc]'
                        }`}
                      >
                        Docs
                      </span>
                    </Link>

                    <Link
                      to="/api-reference"
                      onClick={onClose}
                      className="group relative flex items-center transition-all duration-150 py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-200 ${
                          isCurrentActive('/api-reference') || isCurrentActive('/api-docs')
                            ? 'opacity-100 translate-x-0 w-6 sm:w-8 mr-2' 
                            : 'opacity-0 -translate-x-3 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-[#415a77] font-extrabold text-xl sm:text-2xl select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl md:text-3xl font-semibold sm:font-bold tracking-tight transition-colors duration-150 ${
                          isCurrentActive('/api-reference') || isCurrentActive('/api-docs')
                            ? 'text-[#c5d3e8]' 
                            : 'text-[#c5d3e8]/75 hover:text-[#f8fafc]'
                        }`}
                      >
                        API Reference
                      </span>
                    </Link>

                    <Link
                      to="/playground"
                      onClick={onClose}
                      className="group relative flex items-center transition-all duration-150 py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-200 ${
                          isCurrentActive('/playground') 
                            ? 'opacity-100 translate-x-0 w-6 sm:w-8 mr-2' 
                            : 'opacity-0 -translate-x-3 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-[#415a77] font-extrabold text-xl sm:text-2xl select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl md:text-3xl font-semibold sm:font-bold tracking-tight transition-colors duration-150 ${
                          isCurrentActive('/playground') 
                            ? 'text-[#c5d3e8]' 
                            : 'text-[#c5d3e8]/75 hover:text-[#f8fafc]'
                        }`}
                      >
                        Playground
                      </span>
                    </Link>

                    <Link
                      to="/blogs"
                      onClick={onClose}
                      className="group relative flex items-center transition-all duration-150 py-0.5"
                    >
                      <div 
                        className={`flex items-center transition-all duration-200 ${
                          isCurrentActive('/blogs') 
                            ? 'opacity-100 translate-x-0 w-6 sm:w-8 mr-2' 
                            : 'opacity-0 -translate-x-3 w-0 mr-0 overflow-hidden'
                        }`}
                      >
                        <span className="text-[#415a77] font-extrabold text-xl sm:text-2xl select-none">
                          →
                        </span>
                      </div>
                      <span 
                        className={`text-xl sm:text-2xl md:text-3xl font-semibold sm:font-bold tracking-tight transition-colors duration-150 ${
                          isCurrentActive('/blogs') 
                            ? 'text-[#c5d3e8]' 
                            : 'text-[#c5d3e8]/75 hover:text-[#f8fafc]'
                        }`}
                      >
                        Blogs
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 4. About Us */}
              <div 
                onMouseEnter={() => setHoveredSection('about')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <Link
                  to="/about"
                  onClick={onClose}
                  className="group relative flex items-center transition-all duration-150 py-1"
                >
                  <div 
                    className={`flex items-center transition-all duration-200 ${
                      isCurrentActive('/about') 
                        ? 'opacity-100 translate-x-0 w-8 sm:w-10 mr-2' 
                        : 'opacity-0 -translate-x-4 w-0 mr-0 overflow-hidden'
                    }`}
                  >
                    <span className="text-[#415a77] font-extrabold text-2xl sm:text-4xl select-none">
                      →
                    </span>
                  </div>
                  <span 
                    className={`text-3xl sm:text-4xl md:text-5xl font-bold sm:font-extrabold tracking-tight transition-colors duration-150 ${
                      isCurrentActive('/about') 
                        ? 'text-[#c5d3e8]' 
                        : 'text-[#f8fafc] hover:text-[#c5d3e8]'
                    }`}
                  >
                    About Us
                  </span>
                </Link>
              </div>

              {/* 5. Contact */}
              <div 
                onMouseEnter={() => setHoveredSection('contact')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="group relative flex items-center transition-all duration-150 py-1"
                >
                  <div 
                    className={`flex items-center transition-all duration-200 ${
                      isCurrentActive('/contact') 
                        ? 'opacity-100 translate-x-0 w-8 sm:w-10 mr-2' 
                        : 'opacity-0 -translate-x-4 w-0 mr-0 overflow-hidden'
                    }`}
                  >
                    <span className="text-[#415a77] font-extrabold text-2xl sm:text-4xl select-none">
                      →
                    </span>
                  </div>
                  <span 
                    className={`text-3xl sm:text-4xl md:text-5xl font-bold sm:font-extrabold tracking-tight transition-colors duration-150 ${
                      isCurrentActive('/contact') 
                        ? 'text-[#c5d3e8]' 
                        : 'text-[#f8fafc] hover:text-[#c5d3e8]'
                    }`}
                  >
                    Contact
                  </span>
                </Link>
              </div>

            </nav>
          </div>

          {/* Secondary Telemetry & Engine Hub Card */}
          <div className="lg:col-span-5 flex flex-col space-y-5 rounded-2xl border border-[#415a77]/30 bg-[#0d1b2a] p-6 sm:p-7 backdrop-blur-xl shadow-xl">
            
            {/* Quick Diagnostic Engines Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#c5d3e8] flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[#415a77]" />
                  <span>8 Diagnostic Engines</span>
                </span>
                <Link 
                  to="/docs" 
                  onClick={onClose}
                  className="text-[11px] font-semibold text-[#c5d3e8] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
                      className="flex items-center gap-2 rounded-xl border border-[#415a77]/20 bg-[#152238]/60 px-3 py-2 text-xs font-medium text-[#f8fafc] transition-all hover:border-[#415a77] hover:bg-[#152238] hover:text-[#c5d3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      <Icon className="h-4 w-4 text-[#415a77] shrink-0" />
                      <span className="truncate">{eng.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Tools & Insights */}
            <div className="border-t border-[#415a77]/30 pt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#c5d3e8] block mb-3">
                Platform Intelligence
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/compare"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-[#415a77]/20 bg-[#152238]/50 p-2.5 text-[#f8fafc] hover:border-[#415a77] hover:text-[#c5d3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Scale className="h-4 w-4 text-[#415a77]" />
                  <span>Side-by-Side</span>
                </Link>

                <Link
                  to="/reports"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-[#415a77]/20 bg-[#152238]/50 p-2.5 text-[#f8fafc] hover:border-[#415a77] hover:text-[#c5d3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <FileText className="h-4 w-4 text-[#415a77]" />
                  <span>Audit Reports</span>
                </Link>

                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-[#415a77]/20 bg-[#152238]/50 p-2.5 text-[#f8fafc] hover:border-[#415a77] hover:text-[#c5d3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Radio className="h-4 w-4 text-[#38bdf8]" />
                  <span>Domain Watchdog</span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-[#415a77]/20 bg-[#152238]/50 p-2.5 text-[#f8fafc] hover:border-[#415a77] hover:text-[#c5d3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#415a77]" />
                  <span>My Dashboard</span>
                </Link>
              </div>
            </div>

            {/* User Account / Auth Status in Menu */}
            <div className="border-t border-[#415a77]/30 pt-4">
              {user ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#152238]/60 border border-[#415a77]/30 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img alt="Visual asset" 
                        src={user.photoURL} 
                        alt="User" 
                        className="h-9 w-9 rounded-full object-cover border border-[#415a77]/50 shadow-sm" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#415a77] text-sm font-bold text-[#f8fafc] shadow-sm">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#f8fafc] truncate max-w-[160px] flex items-center gap-1.5">
                        <span className="truncate">{user.displayName || user.email?.split('@')[0]}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
                          {roleConfig.shortLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#c5d3e8] font-mono truncate max-w-[160px]">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasPermission('page:view_admin') && (
                      <Link
                        to="/admin"
                        onClick={onClose}
                        className="flex items-center gap-1.5 rounded-lg border border-[#415a77]/40 bg-[#0d1b2a] px-2.5 py-1.5 text-xs font-bold text-[#38bdf8] hover:bg-[#415a77]/30 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-300 hover:text-white hover:bg-red-900/50 hover:border-red-500/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      title="Sign Out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="flex flex-1 w-full items-center justify-center gap-2 rounded-xl bg-[#152238] border border-[#415a77]/50 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#1e304d] hover:border-cyan-400/50 transition-all shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <LogIn className="h-4 w-4 text-cyan-400" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={onClose}
                    className="flex flex-1 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create Account</span>
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Footer Bar inside Overlay */}
      <div className="mx-auto flex w-full max-w-7xl flex-col sm:flex-row items-center justify-between border-t border-[#415a77]/30 px-6 py-4 text-xs text-[#c5d3e8] sm:px-8 gap-3 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <Link to="/privacy" onClick={onClose} className="hover:text-[#f8fafc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Privacy</Link>
          <Link to="/terms" onClick={onClose} className="hover:text-[#f8fafc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Terms</Link>
          <Link to="/cookies" onClick={onClose} className="hover:text-[#f8fafc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Cookies</Link>
          <Link to="/security" onClick={onClose} className="hover:text-[#f8fafc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">SecOps</Link>
          <Link to="/methodology" onClick={onClose} className="hover:text-[#f8fafc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Audit Methodology</Link>
        </div>

        <div>
          <span>© 2026 CatalystLab Intelligence Platform</span>
        </div>
      </div>
    </div>
  );
};

export default MainMenuOverlay;
