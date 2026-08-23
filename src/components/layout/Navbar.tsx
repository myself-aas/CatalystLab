import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRoleSecurity } from '../../context/RoleSecurityContext';
import { 
  ChevronDown, 
  Menu,
  ShieldCheck,
  LayoutDashboard,
  LogIn,
  UserPlus
} from 'lucide-react';
import { MainMenuOverlay } from './MainMenuOverlay';
import { NavbarSearch } from './NavbarSearch';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission, roleConfig } = useRoleSecurity();
  const [menuOverlayOpen, setMenuOverlayOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Listen for scroll to toggle header background & text color
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/index.html')) {
      return true;
    }
    if (path === '/about' && (location.pathname === '/about' || location.pathname === '/methodology')) {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm text-brand-navy' 
          : 'bg-brand-navy/95 backdrop-blur-md border-b border-brand-slate/30 text-brand-offwhite'
      }`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="transition-opacity hover:opacity-90 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
              aria-label="CatalystLab Home"
            >
              <BrandLogo size="md" darkText={isScrolled} />
            </Link>
          </div>

          {/* Zone 2: Primary Desktop Navigation Links (4-6 links) */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1.5" aria-label="Main Navigation">
            <Link
              to="/"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                isActive('/') 
                  ? (isScrolled ? 'text-brand-navy font-bold bg-gray-100' : 'text-brand-offwhite font-bold bg-brand-slate/40') 
                  : (isScrolled ? 'text-gray-700 hover:text-brand-navy hover:bg-gray-100' : 'text-brand-periwinkle hover:text-brand-offwhite hover:bg-brand-slate/20')
              }`}
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setServicesOpen(!servicesOpen)}
                onBlur={() => setTimeout(() => setServicesOpen(false), 200)}
                aria-expanded={servicesOpen}
                className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                  isScrolled ? 'text-gray-700 hover:text-brand-navy hover:bg-gray-100' : 'text-brand-periwinkle hover:bg-brand-slate/20 hover:text-brand-offwhite'
                }`}
              >
                <span>Services</span>
                <ChevronDown className={`h-3.5 w-3.5 ${isScrolled ? 'text-gray-500' : 'text-brand-periwinkle'}`} />
              </button>
              {servicesOpen && (
                <div className="absolute left-0 mt-1.5 w-44 rounded-xl border border-brand-slate/30 bg-surface-panel p-1.5 shadow-xl z-50 text-brand-offwhite">
                  <Link
                    to="/pricing"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-brand-periwinkle hover:bg-brand-navy hover:text-brand-offwhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  >
                    Pricing & Plans
                  </Link>
                  <Link
                    to="/products"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-brand-periwinkle hover:bg-brand-navy hover:text-brand-offwhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  >
                    Products & Watchdog
                  </Link>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setResourcesOpen(!resourcesOpen)}
                onBlur={() => setTimeout(() => setResourcesOpen(false), 200)}
                aria-expanded={resourcesOpen}
                className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                  isScrolled ? 'text-gray-700 hover:text-brand-navy hover:bg-gray-100' : 'text-brand-periwinkle hover:bg-brand-slate/20 hover:text-brand-offwhite'
                }`}
              >
                <span>Resources</span>
                <ChevronDown className={`h-3.5 w-3.5 ${isScrolled ? 'text-gray-500' : 'text-brand-periwinkle'}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute left-0 mt-1.5 w-48 rounded-xl border border-brand-slate/30 bg-surface-panel p-1.5 shadow-xl z-50 text-brand-offwhite">
                  <Link
                    to="/docs"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-brand-periwinkle hover:bg-brand-navy hover:text-brand-offwhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  >
                    Documentation
                  </Link>
                  <Link
                    to="/api-docs"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-brand-periwinkle hover:bg-brand-navy hover:text-brand-offwhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  >
                    REST API Reference
                  </Link>
                  <Link
                    to="/playground"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-brand-periwinkle hover:bg-brand-navy hover:text-brand-offwhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  >
                    API Playground
                  </Link>
                  <Link
                    to="/blogs"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-brand-periwinkle hover:bg-brand-navy hover:text-brand-offwhite transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  >
                    Engineering Blogs
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                isActive('/about') 
                  ? (isScrolled ? 'text-brand-navy font-bold bg-gray-100' : 'text-brand-offwhite font-bold bg-brand-slate/40') 
                  : (isScrolled ? 'text-gray-700 hover:text-brand-navy hover:bg-gray-100' : 'text-brand-periwinkle hover:text-brand-offwhite hover:bg-brand-slate/20')
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                isActive('/contact') 
                  ? (isScrolled ? 'text-brand-navy font-bold bg-gray-100' : 'text-brand-offwhite font-bold bg-brand-slate/40') 
                  : (isScrolled ? 'text-gray-700 hover:text-brand-navy hover:bg-gray-100' : 'text-brand-periwinkle hover:text-brand-offwhite hover:bg-brand-slate/20')
              }`}
            >
              Contact
            </Link>

            {/* Admin link ONLY visible to authorized superadmins */}
            {hasPermission('page:view_admin') && (
              <Link
                to="/admin"
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/admin') 
                    ? 'bg-brand-navy text-white font-bold' 
                    : (isScrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-brand-navy' : 'text-brand-periwinkle hover:bg-brand-slate/20 hover:text-white')
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-accent-cyan" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Zone 3: Search Icon, Auth Buttons, and Hamburger Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Inline Expandable Navbar Search with Typing Suggestions */}
            <NavbarSearch isScrolled={isScrolled} />

            {/* Auth Actions */}
            {user ? (
              <Link
                to="/dashboard"
                className={`hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors border ${
                  isScrolled
                    ? 'border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100'
                    : 'border-brand-slate/40 bg-surface-panel text-brand-periwinkle hover:bg-surface-subtle hover:text-white'
                }`}
                title="Go to User Dashboard"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-accent-cyan" />
                <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Dashboard'}</span>
                <span className={`text-[9px] font-mono px-1 py-0.2 rounded border uppercase font-bold ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
                  {roleConfig.shortLabel}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`hidden sm:inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    isScrolled
                      ? 'text-gray-700 hover:text-brand-navy hover:bg-gray-100'
                      : 'text-brand-periwinkle hover:text-white hover:bg-brand-slate/20'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Log In</span>
                </Link>

                <Link
                  to="/signup"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-brand-slate hover:bg-brand-slate-hover text-white px-3.5 py-1.5 text-xs font-bold border border-brand-periwinkle/25 shadow-sm active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Main Menu Trigger (Hamburger Menu) */}
            <button
              type="button"
              onClick={() => setMenuOverlayOpen(true)}
              className={`h-9 w-9 rounded-lg transition-colors active:scale-95 cursor-pointer flex items-center justify-center ${
                isScrolled
                  ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-brand-periwinkle hover:text-white hover:bg-brand-slate/20'
              }`}
              aria-label="Open Full Navigation Menu"
              title="Open Navigation Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Signature Full-Screen Main Menu Layout Modal */}
      <MainMenuOverlay 
        isOpen={menuOverlayOpen} 
        onClose={() => setMenuOverlayOpen(false)} 
      />
    </>
  );
};

export default Navbar;
