import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Layers, 
  GitPullRequest, 
  Globe, 
  ShieldAlert, 
  Key, 
  Search, 
  RotateCw, 
  LogOut, 
  ChevronDown, 
  Command,
  X,
  CheckCircle2,
  ExternalLink,
  Terminal,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

interface DashboardShellProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  targetDomain: string;
  onTargetDomainChange?: (domain: string) => void;
  onRefreshScan: () => void;
  isScanning: boolean;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activeView,
  onViewChange,
  targetDomain,
  onTargetDomainChange,
  onRefreshScan,
  isScanning,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('Acme Mesh Prod');

  // Handle Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const navItems = [
    { id: 'analytics', label: 'Dossier Overview', icon: Activity, badge: null },
    { id: 'engines', label: '8 Engines Explorer', icon: Layers, badge: '8 Active' },
    { id: 'patches', label: 'Automated PR Patches', icon: GitPullRequest, badge: '3 Ready' },
    { id: 'monitoring', label: 'Live Edge Mesh Matrix', icon: Globe, badge: '38 PoPs' },
    { id: 'security', label: 'Alerts & Security Logs', icon: ShieldAlert, badge: '0 Critical' },
    { id: 'api-keys', label: 'API Keys & CLI Tokens', icon: Key, badge: null },
    { id: 'audits', label: 'Audit History', icon: FileText, badge: null },
  ];

  // Quick search results
  const searchResults = [
    { title: 'VitalZyme Core Web Vitals Audit', desc: 'P95 LCP sub-second optimization engine', href: '/health' },
    { title: 'SynthShift AST & DOM Preloader', desc: 'Eliminates render-blocking CSS and JS scripts', href: '/dashboard?tab=engines' },
    { title: 'RiskProtease OWASP Transport Check', desc: 'TLS 1.3, HSTS, CSP and Permissions-Policy audit', href: '/dashboard?tab=security' },
    { title: 'EdgeKinase Anycast DNS Mesh', desc: '38 Global Point-of-Presence latency matrix', href: '/dashboard?tab=monitoring' },
    { title: 'RFC 8446: The Transport Layer Security (TLS) Protocol v1.3', desc: 'Official IETF standard specification', href: 'https://datatracker.ietf.org/doc/html/rfc8446', isExternal: true },
    { title: 'RFC 6797: HTTP Strict Transport Security (HSTS)', desc: 'Web security mechanism standard', href: 'https://datatracker.ietf.org/doc/html/rfc6797', isExternal: true },
  ].filter(item => 
    !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#000000] text-white">
      {/* 4.1 Left Docked Sidebar (w-16 on tablet/mobile, w-60 on lg) */}
      <aside className="w-16 lg:w-60 bg-[#070707] border-r border-white/10 flex flex-col justify-between p-3 shrink-0 select-none z-30">
        {/* Top: Monogram & Workspace */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <Link to="/" className="flex items-center gap-2 group">
              <BrandLogo size="sm" />
              <span className="hidden lg:inline text-xs font-semibold tracking-[-0.02em] text-white">
                Catalyst<span className="text-[#00D2FF]">Lab</span>
              </span>
            </Link>
          </div>

          {/* Workspace selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#0F0F0F] border border-white/10 hover:border-white/20 text-left transition-all cursor-pointer"
            >
              <div className="truncate">
                <div className="hidden lg:block text-[10px] font-mono uppercase tracking-wider text-[#666666]">Workspace</div>
                <div className="text-xs font-medium text-white truncate">{currentWorkspace}</div>
              </div>
              <ChevronDown className="size-3 text-[#666666] shrink-0" />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-[#0F0F0F] border border-white/12 rounded-xl p-1.5 shadow-2xl z-50 animate-fadeIn">
                <div className="text-[10px] font-mono uppercase text-[#666666] px-2 py-1">Select Mesh</div>
                {['Acme Mesh Prod', 'Staging Edge V2', 'Personal Lab'].map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setCurrentWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      currentWorkspace === ws ? 'bg-white/10 text-white font-medium' : 'text-[#999999] hover:text-white'
                    }`}
                  >
                    {ws}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white/10 text-white font-medium shadow-sm' 
                      : 'text-[#888888] hover:text-white hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`size-4 shrink-0 ${isActive ? 'text-[#00D2FF]' : 'text-[#666666]'}`} />
                    <span className="hidden lg:inline truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/5 text-[#999999] border border-white/10">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Pill */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-[#0F0F0F] border border-white/5">
            <div className="flex items-center gap-2 truncate">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Avatar'} 
                  className="size-7 rounded-lg object-cover"
                />
              ) : (
                <div className="size-7 rounded-lg bg-[#1A1A1A] border border-white/15 flex items-center justify-center text-xs font-semibold text-[#00D2FF]">
                  {user?.displayName ? user.displayName[0].toUpperCase() : 'A'}
                </div>
              )}
              <div className="hidden lg:block truncate text-left">
                <div className="text-xs font-medium text-white truncate">
                  {user?.displayName || 'Engineering Team'}
                </div>
                <div className="text-[10px] font-mono text-[#00F298]">
                  {isAdmin ? 'Superadmin' : 'Team Pro'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-[#666666] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* 4.1 Top Utility Chrome */}
        <header className="sticky top-0 z-20 h-14 bg-[#000000]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Active Target Domain Pill & Live Scan Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0A0A] border border-white/10 text-xs font-mono">
              <span className="text-[#666666]">target:</span>
              <strong className="text-white font-medium">{targetDomain}</strong>
              <button
                onClick={onRefreshScan}
                disabled={isScanning}
                className="ml-1 p-0.5 text-[#666666] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh scan"
              >
                <RotateCw className={`size-3.5 ${isScanning ? 'animate-spin text-[#00D2FF]' : ''}`} />
              </button>
            </div>

            {/* Live Edge Mesh Health Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Pass P95 1.06s</span>
            </div>
          </div>

          {/* Quick Search Trigger (Cmd + K) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A0A0A] border border-white/10 hover:border-white/20 text-xs text-[#999999] hover:text-white transition-all cursor-pointer font-mono"
            >
              <Search className="size-3.5" />
              <span className="hidden sm:inline">Search RFCs &amp; audits...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white">
                <Command className="size-2.5" />K
              </kbd>
            </button>

            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium hover:bg-amber-500/20 transition-all"
              >
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Cmd + K Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-[#0B0B0B] border border-white/15 rounded-2xl shadow-2xl overflow-hidden font-sans">
            {/* Input row */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <Search className="size-4 text-[#00D2FF] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audits, RFC standards, engine metrics..."
                className="w-full bg-transparent text-sm text-white placeholder-[#666666] outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-[#666666] hover:text-white hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Results list */}
            <div className="p-2 max-h-80 overflow-y-auto divide-y divide-white/5 font-mono text-xs">
              {searchResults.length > 0 ? (
                searchResults.map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    target={item.isExternal ? '_blank' : '_self'}
                    rel={item.isExternal ? 'noreferrer' : undefined}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="text-white font-medium group-hover:text-[#00D2FF] flex items-center gap-1.5">
                        <span>{item.title}</span>
                        {item.isExternal && <ExternalLink className="size-3 text-[#666666]" />}
                      </div>
                      <div className="text-[11px] text-[#888888] font-sans mt-0.5">{item.desc}</div>
                    </div>
                    <span className="text-[10px] text-[#666666] group-hover:text-white">&rarr;</span>
                  </a>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#666666]">
                  No matching telemetry standards found.
                </div>
              )}
            </div>

            <div className="p-2.5 bg-[#050505] border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#666666] px-4">
              <span>Navigate with arrow keys</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardShell;
