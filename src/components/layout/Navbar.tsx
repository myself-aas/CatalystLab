import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Menu,
  X,
  ChevronDown,
  Activity,
  ShieldCheck,
  Globe,
  Leaf,
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Lock,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import {
  ENGINE_ITEMS,
  getPrimaryNav,
  isNavItemActive,
  type NavItem,
} from '../../navigation';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { cn } from '../../lib/utils';
import { NavbarSearch } from './NavbarSearch';
import { ThemeToggle } from './ThemeToggle';

interface EngineItem {
  id: string;
  name: string;
  tagline: string;
  tag: string;
  tagColor: string;
  path: string;
  icon: React.ElementType;
}

const PERF_TAG_COLOR = 'text-[#00D2FF] bg-[#00D2FF]/10 border-[#00D2FF]/20';
const SEC_TAG_COLOR = 'text-purple-400 bg-purple-500/10 border-purple-500/20';

const PERFORMANCE_ENGINES: EngineItem[] = ENGINE_ITEMS.slice(0, 4).map((e) => ({
  id: e.id,
  name: e.label,
  tagline: 'Real-time web health & edge intelligence engine',
  tag: e.badge || 'Telemetry',
  tagColor: PERF_TAG_COLOR,
  path: e.to,
  icon: e.icon || Activity,
}));

const SECURITY_AI_ENGINES: EngineItem[] = ENGINE_ITEMS.slice(4).map((e) => ({
  id: e.id,
  name: e.label,
  tagline: 'Security, AST and AI-readiness engine',
  tag: e.badge || 'SecOps',
  tagColor: SEC_TAG_COLOR,
  path: e.to,
  icon: e.icon || ShieldCheck,
}));

const PRIMARY_LINKS = (audience: 'visitor' | 'user' | 'admin') => getPrimaryNav(audience);

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEnginesOpen, setIsEnginesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { planId, currentPlan } = useSubscription();

  const audience: 'visitor' | 'user' | 'admin' = user ? (isAdmin ? 'admin' : 'user') : 'visitor';
  const links = PRIMARY_LINKS(audience);
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Developer';
  const initials = (user?.displayName || user?.email || 'C').trim().charAt(0).toUpperCase();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsEnginesOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleMouseEnter = () => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setIsEnginesOpen(true);
  };

  const handleMouseLeave = () => {
    megaMenuTimeout.current = setTimeout(() => setIsEnginesOpen(false), 180);
  };

  const handleProfileEnter = () => {
    if (profileTimeout.current) clearTimeout(profileTimeout.current);
    setProfileOpen(true);
  };
  const handleProfileLeave = () => {
    profileTimeout.current = setTimeout(() => setProfileOpen(false), 180);
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const closeAll = () => {
    setIsMobileMenuOpen(false);
    setIsEnginesOpen(false);
    setProfileOpen(false);
  };

  const renderPrimaryLinks = (items: NavItem[]) =>
    items.map((item) => {
      const active = isNavItemActive(item, location.pathname);
      const Icon = item.icon;
      return (
        <Link
          key={item.id}
          to={item.to}
          onClick={() => setIsEnginesOpen(false)}
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors duration-150 focus:outline-none py-1',
            active ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {Icon && <Icon className="size-4" />}
          {item.label}
          {item.badge && (
            <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--theme-slate-900)]/5 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
              {item.badge}
            </span>
          )}
        </Link>
      );
    });

  return (
    <>
      <header
        id="catalyst-main-navbar"
        className={cn(
          "fixed top-[var(--trial-banner-height,0px)] inset-x-0 w-full z-40 transition-all duration-200",
          isScrolled
            ? "bg-[var(--app-background)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-[0_4px_30px_rgba(0,0,0,0.35)]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <nav
          aria-label="Main Navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-all"
        >
          {/* Left Anchor: Monogram + Wordmark + Live Node Chip */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 group focus:outline-none">
              <BrandLogo size="md" />
            </Link>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>38/38 PoPs Active</span>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Engines Mega-Menu Trigger */}
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setIsEnginesOpen(!isEnginesOpen)}
                className={cn(
                  "flex items-center gap-1 text-sm transition-colors duration-150 focus:outline-none cursor-pointer py-1",
                  isEnginesOpen ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                )}
                aria-expanded={isEnginesOpen}
              >
                <span>Engines</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform duration-200 text-muted-foreground",
                    isEnginesOpen && "rotate-180 text-foreground"
                  )}
                />
              </motion.button>

              <AnimatePresence>
                {isEnginesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -left-20 top-full pt-3 w-[540px] z-50 pointer-events-auto"
                  >
                    <div className="bg-[var(--app-background)]/95 border border-[var(--border-subtle)] rounded-2xl p-4 shadow-2xl backdrop-blur-2xl grid grid-cols-2 gap-3 relative overflow-hidden">
                      <div
                        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-20 blur-2xl"
                        style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }}
                      />

                      <div className="space-y-1.5">
                        <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between border-b border-[var(--border-subtle)] pb-1 mb-1">
                          <span>Performance &amp; Readiness</span>
                          <span className="text-[#00D2FF]">4 Engines</span>
                        </div>
                        {PERFORMANCE_ENGINES.map((engine) => {
                          const Icon = engine.icon;
                          return (
                            <motion.div
                              key={engine.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <Link
                                to={engine.path}
                                onClick={() => setIsEnginesOpen(false)}
                                className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-[var(--theme-slate-900)]/5 transition-all duration-150 border border-transparent hover:border-[var(--border-subtle)]"
                              >
                                <div className="size-8 rounded-lg bg-[var(--theme-slate-900)]/5 border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-[#00D2FF] group-hover:border-[#00D2FF]/40 transition-colors">
                                  <Icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-foreground group-hover:text-[#00D2FF] transition-colors truncate">{engine.name}</span>
                                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${engine.tagColor}`}>{engine.tag}</span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1 mt-0.5">{engine.tagline}</p>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="space-y-1.5 border-l border-[var(--border-subtle)] pl-3">
                        <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between border-b border-[var(--border-subtle)] pb-1 mb-1">
                          <span>SecOps &amp; AI</span>
                          <span className="text-purple-400">4 Engines</span>
                        </div>
                        {SECURITY_AI_ENGINES.map((engine) => {
                          const Icon = engine.icon;
                          return (
                            <motion.div
                              key={engine.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <Link
                                to={engine.path}
                                onClick={() => setIsEnginesOpen(false)}
                                className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-[var(--theme-slate-900)]/5 transition-all duration-150 border border-transparent hover:border-[var(--border-subtle)]"
                              >
                                <div className="size-8 rounded-lg bg-[var(--theme-slate-900)]/5 border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-purple-400 group-hover:border-purple-400/40 transition-colors">
                                  <Icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-foreground group-hover:text-purple-400 transition-colors truncate">{engine.name}</span>
                                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${engine.tagColor}`}>{engine.tag}</span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1 mt-0.5">{engine.tagline}</p>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="col-span-2 mt-1 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between px-2 text-xs">
                        <Link to="/engines" onClick={() => setIsEnginesOpen(false)} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px] font-mono group">
                          <span>Explore All 8 Telemetry Engines</span>
                          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <span className="text-[10px] font-mono text-muted-foreground">Zero-SDK &bull; RFC 9110 Compliant</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct Navigation Links (role-aware) */}
            <div className="flex items-center gap-5">
              {renderPrimaryLinks(links.filter((l) => l.id !== 'engines'))}
            </div>
          </div>

          {/* Right Action Area (role-aware) */}
          <div className="hidden md:flex items-center gap-2.5">
            <NavbarSearch isScrolled={isScrolled} />
            <ThemeToggle className="size-8 rounded-lg hover:bg-[var(--theme-slate-900)]/10 text-muted-foreground hover:text-foreground transition-colors" />

            {user ? (
              <div className="relative" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--app-background)] px-2.5 py-1.5 text-xs font-medium text-foreground hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#0066FF]/20 text-[#00D2FF] text-[11px] font-bold">{initials}</span>
                  <span className="max-w-[110px] truncate">{userName}</span>
                  <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform', profileOpen && 'rotate-180')} />
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full pt-3 z-50 w-64"
                      role="menu"
                    >
                      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--app-background)]/95 p-2 shadow-2xl backdrop-blur-2xl">
                        <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                          <div className="text-xs font-semibold text-foreground truncate">{userName}</div>
                          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{planId} &bull; {currentPlan?.name || 'Account'}</div>
                        </div>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-[var(--theme-slate-900)]/5 hover:text-foreground">
                            <Lock className="size-3.5 text-amber-400" /> Admin Console
                          </Link>
                        )}
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-[var(--theme-slate-900)]/5 hover:text-foreground">
                          <LayoutDashboard className="size-3.5 text-[#00D2FF]" /> Developer Dashboard
                        </Link>
                        <Link to="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-[var(--theme-slate-900)]/5 hover:text-foreground">
                          <HomeIcon /> Back to Website
                        </Link>
                        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-[var(--theme-slate-900)]/5 hover:text-rose-400 cursor-pointer">
                          <LogOut className="size-3.5" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground px-2.5 py-1.5 transition-colors duration-150 focus:outline-none font-medium">
                  Log in
                </Link>
                <Link to="/signup" className="rounded-full border border-[var(--border-subtle)] bg-[var(--app-background)] hover:bg-[var(--theme-slate-900)]/5 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors">
                  Sign up
                </Link>
              </>
            )}
            <Link
              to="/audit"
              className="bg-white text-black font-semibold hover:bg-neutral-200 rounded-full px-3.5 py-1.5 text-xs sm:text-sm shadow-[0_0_18px_rgba(255,255,255,0.35)] flex items-center gap-1.5 transition-all active:scale-95 focus:outline-none shrink-0"
            >
              <span>Run Audit</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <ThemeToggle className="size-8 rounded-lg text-muted-foreground hover:text-foreground" />
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="text-foreground focus:outline-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
            >
              <Menu className="size-5" />
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Responsive Full-Screen Mobile Sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-[var(--app-background)]/95 backdrop-blur-2xl flex flex-col text-foreground"
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2 focus:outline-none" onClick={closeAll}>
                  <BrandLogo size="md" />
                </Link>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>38 PoPs</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle className="size-8 rounded-lg text-muted-foreground hover:text-foreground" />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="text-foreground focus:outline-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  onClick={closeAll}
                  aria-label="Close mobile menu"
                >
                  <X className="size-6" />
                </motion.button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
              {/* Primary role-aware links */}
              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Navigation</div>
                {links.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1], delay: 0.05 + idx * 0.04 }}
                    whileHover={{ x: 4 }}
                  >
                    <Link
                      to={item.to}
                      onClick={closeAll}
                      className="text-lg font-medium text-foreground min-h-[44px] flex items-center justify-between py-2 border-b border-[var(--border-subtle)] hover:bg-[var(--theme-slate-900)]/5 px-1.5 rounded-lg transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        {item.icon && <item.icon className="size-5 text-[#00D2FF]" aria-hidden="true" />}
                        {item.label}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Engine grid */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>8 Autonomous Engines</span>
                  <Link to="/engines" onClick={closeAll} className="text-[#00D2FF] text-[11px] font-mono">View All &rarr;</Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ENGINE_ITEMS.map((engine) => {
                    const Icon = engine.icon || Activity;
                    return (
                      <motion.div
                        key={engine.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          to={engine.to}
                          onClick={closeAll}
                          className="p-2.5 rounded-xl bg-[var(--app-background)] border border-[var(--border-subtle)] flex flex-col gap-1 hover:border-[var(--border-subtle)] hover:bg-[var(--theme-slate-900)]/5 transition-all min-h-[58px]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground truncate">{engine.label}</span>
                            <span className="text-[8px] font-mono px-1 rounded border border-[var(--border-subtle)] bg-[var(--theme-slate-900)]/5 text-muted-foreground">{engine.badge}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground truncate"><Icon className="inline size-3 mr-1" />Engine dossier</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons (role-aware) */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1], delay: 0.25 }} className="mt-auto pt-4 flex flex-col gap-3">
                <Link to="/audit" onClick={closeAll} className="w-full bg-white text-black font-semibold hover:bg-neutral-200 rounded-xl px-4 py-3.5 min-h-[48px] flex justify-center items-center gap-2 transition-colors shadow-[0_0_24px_rgba(255,255,255,0.25)] text-sm">
                  <span>Run Autonomous Audit</span>
                  <ArrowRight className="size-4" />
                </Link>
                {user ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link to="/dashboard" onClick={closeAll} className="w-full text-center text-foreground bg-[var(--app-background)] border border-[var(--border-subtle)] hover:bg-[var(--theme-slate-900)]/5 rounded-xl min-h-[44px] flex justify-center items-center font-medium text-xs transition-colors">
                      <LayoutDashboard className="size-3.5 mr-1.5" /> Dashboard
                    </Link>
                    <button type="button" onClick={handleLogout} className="w-full text-center text-rose-400 bg-[var(--app-background)] border border-[var(--border-subtle)] hover:bg-[var(--theme-slate-900)]/5 rounded-xl min-h-[44px] flex justify-center items-center font-medium text-xs transition-colors cursor-pointer">
                      <LogOut className="size-3.5 mr-1.5" /> Sign out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link to="/login" onClick={closeAll} className="w-full text-center text-muted-foreground hover:text-foreground bg-[var(--app-background)] border border-[var(--border-subtle)] hover:bg-[var(--theme-slate-900)]/5 rounded-xl min-h-[44px] flex justify-center items-center font-medium text-xs transition-colors">
                      Log In
                    </Link>
                    <Link to="/signup" onClick={closeAll} className="w-full text-center text-foreground bg-[var(--app-background)] border border-[var(--border-subtle)] hover:bg-[var(--theme-slate-900)]/5 rounded-xl min-h-[44px] flex justify-center items-center font-medium text-xs transition-colors">
                      Sign Up
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/** Small inline Home icon (kept out of the lucide tree-shake hot path). */
const HomeIcon = () => (
  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default Navbar;
