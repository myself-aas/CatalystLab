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
import { ThemeToggle } from './ThemeToggle';

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
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-zinc-200/80 dark:border-zinc-800/80 text-zinc-950 dark:text-zinc-100' 
          : 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-transparent text-zinc-950 dark:text-zinc-100'
      }`}>
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-12">
          
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="transition-opacity hover:opacity-80 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
              aria-label="CatalystLab Home"
            >
              <BrandLogo size="md" />
            </Link>
          </div>

          {/* Zone 2: Primary Desktop Navigation Links */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1" aria-label="Main Navigation">
            <Link
              to="/"
              className={`whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-zinc-950 dark:text-white font-semibold' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
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
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  servicesOpen 
                    ? 'text-zinc-950 dark:text-white bg-zinc-100/50 dark:bg-zinc-800/50' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span>Services</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
              </button>
              {servicesOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50">
                  <Link
                    to="/pricing"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors focus-visible:outline-none"
                  >
                    Pricing &amp; Plans
                  </Link>
                  <Link
                    to="/products"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors focus-visible:outline-none"
                  >
                    Products &amp; Watchdog
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
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  resourcesOpen 
                    ? 'text-zinc-950 dark:text-white bg-zinc-100/50 dark:bg-zinc-800/50' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span>Resources</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${resourcesOpen ? 'rotate-180 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50">
                  <Link
                    to="/docs"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors focus-visible:outline-none"
                  >
                    Documentation
                  </Link>
                  <Link
                    to="/api-docs"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors focus-visible:outline-none"
                  >
                    REST API Reference
                  </Link>
                  <Link
                    to="/playground"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors focus-visible:outline-none"
                  >
                    API Playground
                  </Link>
                  <Link
                    to="/blogs"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors focus-visible:outline-none"
                  >
                    Engineering Blogs
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-zinc-950 dark:text-white font-semibold' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-zinc-950 dark:text-white font-semibold' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              Contact
            </Link>

            {/* Admin link ONLY visible to authorized superadmins */}
            {hasPermission('page:view_admin') && (
              <Link
                to="/admin"
                className={`ml-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/admin') 
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Zone 3: Search Icon, Theme Toggle, Auth Buttons, and Hamburger Menu */}
          <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-3.5 shrink-0">
            {/* Inline Expandable Navbar Search with Typing Suggestions */}
            <NavbarSearch isScrolled={true} />

            {/* Dark / Light Mode Switcher */}
            <ThemeToggle />

            {/* Auth Actions */}
            {user ? (
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs"
                title="Go to User Dashboard"
              >
                <LayoutDashboard className="h-4 w-4 text-zinc-500" />
                <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Dashboard'}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-wide bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300`}>
                  {roleConfig.shortLabel}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium transition-colors text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                >
                  Log In
                </Link>

                <Link
                  to="/signup"
                  className="hidden md:inline-flex items-center justify-center rounded-md bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 py-2 text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] focus-visible:outline-none"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Main Menu Trigger (Hamburger Menu) */}
            <button
              type="button"
              onClick={() => setMenuOverlayOpen(true)}
              className="lg:hidden h-9 w-9 rounded-xl transition-colors active:scale-95 cursor-pointer flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Open Full Navigation Menu"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
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
