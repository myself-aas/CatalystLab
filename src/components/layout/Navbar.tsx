import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, 
  LogIn, 
  ChevronDown, 
  FileText,
  Search,
  Command
} from 'lucide-react';
import { MainMenuOverlay } from './MainMenuOverlay';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { BrandLogo } from '../common/BrandLogo';
import { CustomIconShieldAlt } from '../common/CustomSvgs';

export const Navbar: React.FC = () => {
  const { user, login, logout, loading, isAdmin } = useAuth();
  const [menuOverlayOpen, setMenuOverlayOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();

  // Listen for Cmd+K / Ctrl+K shortcut globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-[#f8fafc]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="transition-opacity hover:opacity-90 shrink-0"
              aria-label="CatalystLab Home"
            >
              <BrandLogo size="md" darkText={true} />
            </Link>
          </div>

          {/* Zone 2: Primary Desktop Navigation Links */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            <Link
              to="/"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive('/') 
                  ? 'text-[#0b192c] font-bold bg-[#e2e8f0]' 
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]/60'
              }`}
            >
              Home
            </Link>

            <Link
              to="/pricing"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive('/pricing') 
                  ? 'text-[#0b192c] font-bold bg-[#e2e8f0]' 
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]/60'
              }`}
            >
              Pricing
            </Link>

            <Link
              to="/docs"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive('/docs') 
                  ? 'text-[#0b192c] font-bold bg-[#e2e8f0]' 
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]/60'
              }`}
            >
              Docs
            </Link>

            <Link
              to="/blogs"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive('/blogs') || location.pathname.startsWith('/blog/') || location.pathname.startsWith('/blogs/')
                  ? 'text-[#0b192c] font-bold bg-[#e2e8f0]' 
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]/60'
              }`}
            >
              Blogs
            </Link>

            <Link
              to="/about"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive('/about') 
                  ? 'text-[#0b192c] font-bold bg-[#e2e8f0]' 
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]/60'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive('/contact') 
                  ? 'text-[#0b192c] font-bold bg-[#e2e8f0]' 
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]/60'
              }`}
            >
              Contact
            </Link>

            {/* Engines Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                onBlur={() => setTimeout(() => setProductsOpen(false), 200)}
                className="flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold text-[#415a77] transition-all hover:bg-[#e2e8f0]/60 hover:text-[#0b192c]"
              >
                <span>Engines</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#415a77]" />
              </button>

              {productsOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl border border-[#415a77]/30 bg-[#0b192c] p-2 shadow-2xl backdrop-blur-lg z-50">
                  <Link
                    to="/health"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#f8fafc] hover:bg-[#152238]"
                  >
                    <span className="material-symbols-outlined text-base text-[#38bdf8]">health_and_safety</span>
                    <div>
                      <div className="font-medium text-[#f8fafc]">Website Health</div>
                      <div className="text-xs text-[#c5d3e8]">DOM & Web Vitals</div>
                    </div>
                  </Link>
                  <Link
                    to="/ai-readiness"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#f8fafc] hover:bg-[#152238]"
                  >
                    <span className="material-symbols-outlined text-base text-[#c084fc]">psychology</span>
                    <div>
                      <div className="font-medium text-[#f8fafc]">AI Readiness</div>
                      <div className="text-xs text-[#c5d3e8]">llms.txt & Crawlers</div>
                    </div>
                  </Link>
                  <Link
                    to="/repo-scanner"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#f8fafc] hover:bg-[#152238]"
                  >
                    <span className="material-symbols-outlined text-base text-[#4ade80]">inventory_2</span>
                    <div>
                      <div className="font-medium text-[#f8fafc]">Repo Hygiene</div>
                      <div className="text-xs text-[#c5d3e8]">Git Security Audit</div>
                    </div>
                  </Link>
                  <Link
                    to="/latency"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#f8fafc] hover:bg-[#152238]"
                  >
                    <span className="material-symbols-outlined text-base text-[#f472b6]">public</span>
                    <div>
                      <div className="font-medium text-[#f8fafc]">Edge Latency</div>
                      <div className="text-xs text-[#c5d3e8]">Global TTFB Radar</div>
                    </div>
                  </Link>
                  <Link
                    to="/eco-audit"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#f8fafc] hover:bg-[#152238]"
                  >
                    <span className="material-symbols-outlined text-base text-[#34d399]">eco</span>
                    <div>
                      <div className="font-medium text-[#f8fafc]">Eco Carbon</div>
                      <div className="text-xs text-[#c5d3e8]">Green Hosting & CO2</div>
                    </div>
                  </Link>
                  <Link
                    to="/compliance"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#f8fafc] hover:bg-[#152238]"
                  >
                    <span className="material-symbols-outlined text-base text-[#fbbf24]">shield</span>
                    <div>
                      <div className="font-medium text-[#f8fafc]">Compliance & Risk</div>
                      <div className="text-xs text-[#c5d3e8]">WCAG & OWASP</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/reports"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/reports') || location.pathname.startsWith('/reports/') || location.pathname.startsWith('/report/')
                  ? 'text-[#0b192c] font-bold bg-[#e2e8f0]' 
                  : 'text-[#415a77] hover:text-[#0b192c] hover:bg-[#e2e8f0]/60'
              }`}
            >
              <FileText className="h-4 w-4 text-[#415a77]" />
              <span>Reports</span>
            </Link>

            {/* Admin link ONLY visible to authorized superadmins */}
            {user && isAdmin && (
              <Link
                to="/admin"
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/admin') 
                    ? 'bg-[#0b192c] text-[#f8fafc] font-bold' 
                    : 'text-[#415a77] hover:bg-[#e2e8f0]/60 hover:text-[#0b192c]'
                }`}
              >
                <CustomIconShieldAlt className="h-4 w-4 text-[#415a77]" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Zone 3: Global Search + Main Menu Trigger + Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Global Search Trigger Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-xs text-[#64748b] hover:border-[#cbd5e1] hover:text-[#0b192c] transition-all shadow-xs group"
              aria-label="Search Documentation & Articles"
              title="Search documentation and articles (Cmd+K / Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5 text-[#415a77] group-hover:text-[#0b192c]" />
              <span className="hidden sm:inline font-medium">Search...</span>
              <kbd className="hidden md:inline-flex items-center rounded border border-[#e2e8f0] bg-[#f8fafc] px-1.5 py-0.2 text-[10px] font-mono text-[#94a3b8]">
                ⌘K
              </kbd>
            </button>

            {/* Prominent High-Impact Menu Trigger - Dark Button */}
            <button
              onClick={() => setMenuOverlayOpen(true)}
              className="flex items-center justify-center rounded-xl bg-[#0b192c] p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold text-[#f8fafc] transition-all hover:bg-[#1a2d48] hover:text-[#38bdf8] border border-[#415a77]/40 active:scale-95 shadow-sm group"
              aria-label="Open Full Main Menu"
              title="Open Navigation Menu"
            >
              <span className="material-symbols-outlined text-[20px] leading-none text-[#f8fafc] group-hover:text-[#38bdf8] transition-colors">
                menu_open
              </span>
            </button>

            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-lg bg-[#e2e8f0]" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link 
                  to={isAdmin ? "/admin" : "/dashboard"} 
                  className="hidden sm:flex items-center gap-2 rounded-lg border border-[#415a77]/30 bg-[#0b192c] px-3 py-1.5 text-xs text-[#c5d3e8] transition-colors hover:bg-[#1a2d48] shadow-sm"
                  title={isAdmin ? "Superadmin Account" : "User Account"}
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="h-5 w-5 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isAdmin ? 'bg-[#415a77] text-[#f8fafc]' : 'bg-[#152238] text-[#f8fafc]'
                    }`}>
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[90px] truncate font-medium text-[#f8fafc]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  {isAdmin && (
                    <span className="rounded bg-[#415a77]/30 px-1 py-0.2 text-[10px] font-bold text-[#c5d3e8]">
                      SA
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 rounded-lg border border-[#415a77]/30 bg-[#0b192c] px-2.5 py-1.5 text-xs font-medium text-[#c5d3e8] transition-colors hover:border-red-500/50 hover:bg-red-950/30 hover:text-red-300 shadow-sm"
                  title="Log Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#0b192c] px-3.5 py-1.5 text-xs font-semibold text-[#f8fafc] transition-colors hover:bg-[#1a2d48] border border-[#415a77]/40 shadow-sm"
              >
                <LogIn className="h-3.5 w-3.5 text-[#c5d3e8]" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Signature Full-Screen Main Menu Layout Modal */}
      <MainMenuOverlay 
        isOpen={menuOverlayOpen} 
        onClose={() => setMenuOverlayOpen(false)} 
      />

      {/* Global Site Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};

