import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ChevronDown, 
  FileText,
  Menu,
  ShieldCheck,
  GitBranch,
  Terminal,
  Leaf,
  Activity,
  Globe,
  Cpu,
  Sparkles
} from 'lucide-react';
import { MainMenuOverlay } from './MainMenuOverlay';
import { NavbarSearch } from './NavbarSearch';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [menuOverlayOpen, setMenuOverlayOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Listen for scroll to toggle header background & text color
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
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
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm text-gray-900' 
          : 'bg-[#0b192c]/90 backdrop-blur-xl border-b border-[#415a77]/40 shadow-[0_4px_30px_rgba(11,25,44,0.4)] text-white'
      }`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="transition-opacity hover:opacity-90 shrink-0"
              aria-label="CatalystLab Home"
            >
              <BrandLogo size="md" darkText={isScrolled} />
            </Link>
          </div>

          {/* Zone 2: Primary Desktop Navigation Links */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            <Link
              to="/"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive('/') 
                  ? (isScrolled ? 'text-[#0b192c] font-bold bg-gray-100' : 'text-white font-bold bg-[#415a77]/40') 
                  : (isScrolled ? 'text-gray-700 hover:text-[#0b192c] hover:bg-gray-100' : 'text-[#c5d3e8] hover:text-white hover:bg-[#415a77]/20')
              }`}
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                onBlur={() => setTimeout(() => setServicesOpen(false), 200)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
                  isScrolled ? 'text-gray-700 hover:text-[#0b192c] hover:bg-gray-100' : 'text-[#c5d3e8] hover:bg-[#415a77]/20 hover:text-white'
                }`}
              >
                <span>Services</span>
                <ChevronDown className={`h-3.5 w-3.5 ${isScrolled ? 'text-gray-500' : 'text-[#c5d3e8]'}`} />
              </button>
              {servicesOpen && (
                <div className="absolute left-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl z-50 text-gray-900">
                  <Link
                    to="/pricing"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-[#0b192c] transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    to="/products"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-[#0b192c] transition-colors"
                  >
                    Products
                  </Link>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                onBlur={() => setTimeout(() => setResourcesOpen(false), 200)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
                  isScrolled ? 'text-gray-700 hover:text-[#0b192c] hover:bg-gray-100' : 'text-[#c5d3e8] hover:bg-[#415a77]/20 hover:text-white'
                }`}
              >
                <span>Resources</span>
                <ChevronDown className={`h-3.5 w-3.5 ${isScrolled ? 'text-gray-500' : 'text-[#c5d3e8]'}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl z-50 text-gray-900">
                  <Link
                    to="/docs"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-[#0b192c] transition-colors"
                  >
                    Docs
                  </Link>
                  <Link
                    to="/api-reference"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-[#0b192c] transition-colors"
                  >
                    API Reference
                  </Link>
                  <Link
                    to="/playground"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-[#0b192c] transition-colors"
                  >
                    Playground
                  </Link>
                  <Link
                    to="/blogs"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 hover:text-[#0b192c] transition-colors"
                  >
                    Blogs
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive('/about') 
                  ? (isScrolled ? 'text-[#0b192c] font-bold bg-gray-100' : 'text-white font-bold bg-[#415a77]/40') 
                  : (isScrolled ? 'text-gray-700 hover:text-[#0b192c] hover:bg-gray-100' : 'text-[#c5d3e8] hover:text-white hover:bg-[#415a77]/20')
              }`}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive('/contact') 
                  ? (isScrolled ? 'text-[#0b192c] font-bold bg-gray-100' : 'text-white font-bold bg-[#415a77]/40') 
                  : (isScrolled ? 'text-gray-700 hover:text-[#0b192c] hover:bg-gray-100' : 'text-[#c5d3e8] hover:text-white hover:bg-[#415a77]/20')
              }`}
            >
              Contact
            </Link>

            {/* Admin link ONLY visible to authorized superadmins */}
            {user && isAdmin && (
              <Link
                to="/admin"
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/admin') 
                    ? 'bg-[#0b192c] text-white font-bold' 
                    : (isScrolled ? 'text-gray-700 hover:bg-gray-100 hover:text-[#0b192c]' : 'text-[#c5d3e8] hover:bg-[#415a77]/20 hover:text-white')
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Zone 3: Search Icon and Hamburger Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Inline Expandable Navbar Search with Typing Suggestions */}
            <NavbarSearch isScrolled={isScrolled} />

            {/* Main Menu Trigger (Hamburger Menu) */}
            <button
              type="button"
              onClick={() => setMenuOverlayOpen(true)}
              className={`p-2 rounded-lg transition-colors active:scale-95 cursor-pointer flex items-center justify-center ${
                isScrolled
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-[#c5d3e8] hover:text-white hover:bg-white/10'
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
