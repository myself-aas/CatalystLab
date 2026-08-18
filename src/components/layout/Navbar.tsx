import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck,
  BookOpen,
  FileText
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, login, logout, loading, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Brand Title (Single line, text element) */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-sm font-bold text-slate-950 shadow-inner">
            ⚡
          </div>
          <span>CatalystLab</span>
          <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
            PRO
          </span>
        </Link>

        {/* Zone 2: Navigation Links (4-6 links, single-line, clean) */}
        <nav className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
          <Link
            to="/"
            className={`whitespace-nowrap shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'bg-slate-800/80 text-cyan-400' 
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            Master Audit
          </Link>

          {/* Admin link ONLY visible to authorized primary superadmins */}
          {user && isAdmin && (
            <Link
              to="/admin"
              className={`whitespace-nowrap shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/admin') 
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold' 
                  : 'text-cyan-400 hover:bg-slate-900 hover:text-cyan-300'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Admin</span>
            </Link>
          )}

          <Link
            to="/reports"
            className={`whitespace-nowrap shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/reports') || location.pathname.startsWith('/reports/') || location.pathname.startsWith('/report/')
                ? 'bg-slate-800/80 text-cyan-400 font-semibold' 
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>Reports</span>
          </Link>

          <Link
            to="/blogs"
            className={`whitespace-nowrap shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/blogs') || location.pathname.startsWith('/blogs/') 
                ? 'bg-slate-800/80 text-cyan-400 font-semibold' 
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span>Blog</span>
          </Link>

          <Link
            to="/dashboard"
            className={`whitespace-nowrap shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/dashboard') 
                ? 'bg-slate-800/80 text-cyan-400 font-semibold' 
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-cyan-400" />
            <span>My Audits</span>
          </Link>

          {/* Products Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              onBlur={() => setTimeout(() => setProductsOpen(false), 200)}
              className="flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
            >
              <span>Engines</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {productsOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-lg">
                <Link
                  to="/health"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  <span>🩺</span>
                  <div>
                    <div className="font-medium">Website Health</div>
                    <div className="text-xs text-slate-400">DOM & Web Vitals</div>
                  </div>
                </Link>
                <Link
                  to="/ai-readiness"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  <span>🧠</span>
                  <div>
                    <div className="font-medium">AI Readiness</div>
                    <div className="text-xs text-slate-400">llms.txt & Crawlers</div>
                  </div>
                </Link>
                <Link
                  to="/repo-scanner"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  <span>📦</span>
                  <div>
                    <div className="font-medium">Repo Hygiene</div>
                    <div className="text-xs text-slate-400">Git Security Audit</div>
                  </div>
                </Link>
                <Link
                  to="/latency"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  <span>🌍</span>
                  <div>
                    <div className="font-medium">Edge Latency</div>
                    <div className="text-xs text-slate-400">Global TTFB Radar</div>
                  </div>
                </Link>
                <Link
                  to="/eco-audit"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  <span>🌱</span>
                  <div>
                    <div className="font-medium">Eco Carbon</div>
                    <div className="text-xs text-slate-400">Green Hosting & CO2</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/compare"
            className={`whitespace-nowrap shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors hidden xl:inline-block ${
              isActive('/compare') 
                ? 'bg-slate-800/80 text-cyan-400' 
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            Compare
          </Link>
        </nav>

        {/* Zone 3: Primary Actions (Google Auth & User Profile) */}
        <div className="flex items-center gap-3 shrink-0">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-800" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link 
                to={isAdmin ? "/admin" : "/dashboard"} 
                className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800"
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
                    isAdmin ? 'bg-cyan-400 text-slate-950' : 'bg-slate-700 text-white'
                  }`}>
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[110px] truncate font-medium text-slate-200">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                {isAdmin && (
                  <span className="rounded bg-cyan-500/20 px-1 py-0.2 text-[10px] font-bold text-cyan-300">
                    SA
                  </span>
                )}
              </Link>

              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-400"
                title="Log Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => login()}
              className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20 hover:border-cyan-500/50"
            >
              <LogIn className="h-3.5 w-3.5 text-cyan-400" />
              <span>Log In</span>
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                isActive('/') ? 'bg-slate-800 text-cyan-400' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              ⚡ Master 8-Engine Audit
            </Link>

            {/* Mobile Admin Link only for Superadmin */}
            {user && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-bold flex items-center gap-2 ${
                  isActive('/admin') ? 'bg-cyan-500/20 text-cyan-300' : 'text-cyan-400 hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Superadmin Command Center</span>
              </Link>
            )}

            <Link
              to="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 ${
                isActive('/reports') || location.pathname.startsWith('/reports/') ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>📑 Audit Reports Directory</span>
            </Link>

            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                isActive('/blogs') ? 'bg-slate-800 text-cyan-400' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              📖 Engineering Insights & Blogs
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                isActive('/dashboard') ? 'bg-slate-800 text-cyan-400' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              📊 My Audits Dashboard
            </Link>
            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                isActive('/compare') ? 'bg-slate-800 text-cyan-400' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              ⚖️ Side-by-Side Compare
            </Link>
            <div className="border-t border-slate-800 pt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">
              Diagnostic Engines
            </div>
            <Link
              to="/health"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900"
            >
              🩺 Website Health Analyzer
            </Link>
            <Link
              to="/ai-readiness"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900"
            >
              🧠 AI Readiness Inspector
            </Link>
            <Link
              to="/repo-scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900"
            >
              📦 Repository Hygiene Scanner
            </Link>
            <Link
              to="/latency"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900"
            >
              🌍 Global Edge Latency
            </Link>
            <Link
              to="/eco-audit"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900"
            >
              🌱 Eco-Carbon Audit
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
