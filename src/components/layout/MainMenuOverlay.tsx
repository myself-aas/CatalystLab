import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  LogIn, 
  LogOut, 
  Activity, 
  Scale, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

interface MainMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MainMenuOverlay: React.FC<MainMenuOverlayProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, isAdmin, login, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  // The 5 Main Menu Items strictly corresponding to user specifications
  const mainMenuItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'pricing', label: 'Pricing', path: '/pricing' },
    { id: 'docs', label: 'Docs', path: '/docs' },
    { id: 'about', label: 'About Us', path: '/about' },
    { id: 'contact', label: 'Contact', path: '/contact' },
  ];

  const isCurrentActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const engines = [
    { name: 'Website Health', path: '/health', icon: 'health_and_safety' },
    { name: 'AI Readiness', path: '/ai-readiness', icon: 'psychology' },
    { name: 'Repo Hygiene', path: '/repo-scanner', icon: 'inventory_2' },
    { name: 'Edge Latency', path: '/latency', icon: 'public' },
    { name: 'Eco Carbon', path: '/eco-audit', icon: 'eco' },
    { name: 'Compliance & Risk', path: '/compliance', icon: 'shield' },
    { name: 'Security Posture', path: '/security', icon: 'lock' },
    { name: 'LLMO Optimizer', path: '/llmo', icon: 'bolt' },
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
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
        <Link 
          to="/" 
          onClick={onClose}
          className="transition-opacity hover:opacity-90"
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
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#415a77]/40 bg-[#0d1b2a] text-[#c5d3e8] transition-all hover:border-[#415a77] hover:bg-[#152238] hover:text-[#f8fafc] hover:scale-105 active:scale-95 shadow-sm"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Center Main Navigation Body: Exact High-Craft Design from User Reference */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-8 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Primary High-Impact Typography Menu */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <nav className="flex flex-col space-y-3 sm:space-y-4 md:space-y-5" aria-label="Main Menu">
              {mainMenuItems.map((item) => {
                const active = isCurrentActive(item.path);
                const isHovered = hoveredItem === item.id;
                const isHighlighted = isHovered || (hoveredItem === null && active);

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={onClose}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="group relative flex items-center transition-all duration-150 py-1"
                  >
                    {/* Active/Hover Arrow - Palette Steel Blue */}
                    <div 
                      className={`flex items-center transition-all duration-200 ${
                        isHighlighted 
                          ? 'opacity-100 translate-x-0 w-8 sm:w-10 md:w-12 mr-2' 
                          : 'opacity-0 -translate-x-4 w-0 mr-0 overflow-hidden'
                      }`}
                    >
                      <span className="text-[#415a77] font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl select-none">
                        →
                      </span>
                    </div>

                    {/* Menu Item Label */}
                    <span 
                      className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold sm:font-extrabold tracking-tight transition-colors duration-150 ${
                        isHighlighted 
                          ? 'text-[#c5d3e8] translate-x-1 sm:translate-x-2' 
                          : 'text-[#f8fafc] hover:text-[#c5d3e8]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Secondary Telemetry & Engine Hub (Palette-harmonized Dark Card) */}
          <div className="lg:col-span-5 flex flex-col space-y-6 rounded-2xl border border-[#415a77]/30 bg-[#0d1b2a] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            
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
                  className="text-[11px] font-semibold text-[#c5d3e8] hover:text-white transition-colors"
                >
                  View Docs →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {engines.map((eng) => (
                  <Link
                    key={eng.name}
                    to={eng.path}
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-xl border border-[#415a77]/20 bg-[#152238]/60 px-3 py-2 text-xs font-medium text-[#f8fafc] transition-all hover:border-[#415a77] hover:bg-[#152238] hover:text-[#c5d3e8]"
                  >
                    <span className="material-symbols-outlined text-base text-[#415a77]">{eng.icon}</span>
                    <span className="truncate">{eng.name}</span>
                  </Link>
                ))}
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
                  className="flex items-center gap-2 rounded-xl border border-[#415a77]/20 bg-[#152238]/50 p-2.5 text-[#f8fafc] hover:border-[#415a77] hover:text-[#c5d3e8]"
                >
                  <Scale className="h-4 w-4 text-[#415a77]" />
                  <span>Side-by-Side</span>
                </Link>

                <Link
                  to="/reports"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-[#415a77]/20 bg-[#152238]/50 p-2.5 text-[#f8fafc] hover:border-[#415a77] hover:text-[#c5d3e8]"
                >
                  <FileText className="h-4 w-4 text-[#415a77]" />
                  <span>Audit Reports</span>
                </Link>

                <Link
                  to="/blogs"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-[#415a77]/20 bg-[#152238]/50 p-2.5 text-[#f8fafc] hover:border-[#415a77] hover:text-[#c5d3e8]"
                >
                  <Sparkles className="h-4 w-4 text-[#c5d3e8]" />
                  <span>Tech Blogs</span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-[#415a77]/20 bg-[#152238]/50 p-2.5 text-[#f8fafc] hover:border-[#415a77] hover:text-[#c5d3e8]"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#415a77]" />
                  <span>My Dashboard</span>
                </Link>
              </div>
            </div>

            {/* User Account / Auth Status in Menu */}
            <div className="border-t border-[#415a77]/30 pt-4 flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="User" 
                        className="h-7 w-7 rounded-full object-cover border border-[#415a77]/40" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#415a77] text-xs font-bold text-[#f8fafc]">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-[#f8fafc] max-w-[120px] truncate">
                        {user.displayName || user.email?.split('@')[0]}
                      </div>
                      {isAdmin && (
                        <div className="text-[10px] text-[#c5d3e8] font-semibold">Superadmin</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={onClose}
                        className="flex items-center gap-1 rounded-lg border border-[#415a77]/40 bg-[#152238] px-2.5 py-1.5 text-xs font-bold text-[#c5d3e8] hover:bg-[#415a77]/30 hover:text-white"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-[#415a77]" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="rounded-lg border border-[#415a77]/30 bg-[#152238] p-1.5 text-[#c5d3e8] hover:text-red-400 hover:bg-red-950/30"
                      title="Log Out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    login();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#415a77] py-2.5 text-xs font-bold text-white hover:bg-[#33475e] transition-all shadow-md"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In with Google Account</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Footer Bar inside Overlay */}
      <div className="mx-auto flex w-full max-w-7xl flex-col sm:flex-row items-center justify-between border-t border-[#415a77]/30 px-6 py-5 text-xs text-[#c5d3e8] sm:px-8 gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <Link to="/privacy" onClick={onClose} className="hover:text-[#f8fafc] transition-colors">Privacy</Link>
          <Link to="/terms" onClick={onClose} className="hover:text-[#f8fafc] transition-colors">Terms</Link>
          <Link to="/cookies" onClick={onClose} className="hover:text-[#f8fafc] transition-colors">Cookies</Link>
          <Link to="/security" onClick={onClose} className="hover:text-[#f8fafc] transition-colors">SecOps</Link>
          <Link to="/methodology" onClick={onClose} className="hover:text-[#f8fafc] transition-colors">Audit Methodology</Link>
        </div>

        <div>
          <span>© 2026 CatalystLab Intelligence Platform</span>
        </div>
      </div>
    </div>
  );
};
export default MainMenuOverlay;
