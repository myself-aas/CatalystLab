import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useMotionValueEvent, useReducedMotion } from 'motion/react';
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
import { MainMenuOverlay } from './MainMenuOverlay';

interface EngineItem {
  id: string;
  name: string;
  tagline: string;
  tag: string;
  tagColor: string;
  path: string;
  icon: React.ElementType;
}

const PERF_TAG_COLOR = 'text-[var(--accent-cyan-edge)] bg-[var(--accent-cyan-edge)]/10 border-[var(--accent-cyan-edge)]/20';
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
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEnginesOpen, setIsEnginesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollPauseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { planId, currentPlan } = useSubscription();
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const audience: 'visitor' | 'user' | 'admin' = user ? (isAdmin ? 'admin' : 'user') : 'visitor';
  const links = PRIMARY_LINKS(audience);
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Developer';
  const initials = (user?.displayName || user?.email || 'C').trim().charAt(0).toUpperCase();

  // Framer Motion scroll listener with pause-reveal and reverse-reveal detection
  useMotionValueEvent(scrollY, 'change', (current) => {
    const prev = lastScrollY.current;
    const diff = current - prev;

    setIsScrolled(current > 8);

    // Clear any previous pause reveal timeout
    if (scrollPauseTimeout.current) {
      clearTimeout(scrollPauseTimeout.current);
    }

    if (current <= 20) {
      // Near top of document: always reveal
      setIsVisible(true);
    } else if (diff > 5) {
      // Scrolling down: hide
      setIsVisible(false);
    } else if (diff < -4) {
      // Scrolling reverses (scrolls up): reveal
      setIsVisible(true);
    }

    // When scrolling pauses/stops: reveal smoothly after a short pause
    scrollPauseTimeout.current = setTimeout(() => {
      setIsVisible(true);
    }, 180);

    lastScrollY.current = current;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialY = window.scrollY;
      lastScrollY.current = initialY;
      setIsScrolled(initialY > 8);

      const handleScrollEnd = () => {
        setIsVisible(true);
      };

      window.addEventListener('scrollend', handleScrollEnd, { passive: true });
      return () => {
        window.removeEventListener('scrollend', handleScrollEnd);
        if (scrollPauseTimeout.current) {
          clearTimeout(scrollPauseTimeout.current);
        }
      };
    }
  }, []);

  useEffect(() => {
    setIsVisible(true);
    setIsMobileMenuOpen(false);
    setIsEnginesOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOpen = () => setIsMobileMenuOpen(true);
    const handleClose = () => setIsMobileMenuOpen(false);
    window.addEventListener('catalyst:open-mobile-menu', handleOpen);
    window.addEventListener('catalyst:close-mobile-menu', handleClose);
    return () => {
      window.removeEventListener('catalyst:open-mobile-menu', handleOpen);
      window.removeEventListener('catalyst:close-mobile-menu', handleClose);
    };
  }, []);

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
        </Link>
      );
    });

  const shouldShow = isVisible || isEnginesOpen || isMobileMenuOpen || profileOpen;

  const navbarVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
    hidden: {
      y: prefersReducedMotion ? 0 : -80,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <>
      <motion.header
        id="catalyst-main-navbar"
        variants={navbarVariants}
        initial="visible"
        animate={shouldShow ? 'visible' : 'hidden'}
        style={{
          pointerEvents: shouldShow ? 'auto' : 'none',
        }}
        className={cn(
          "top-nav fixed top-[var(--trial-banner-height,0px)] inset-x-0 w-full z-40 border-b shadow-none transition-colors duration-200",
          isScrolled ? "bg-background/80 backdrop-blur-md border-border" : "bg-transparent border-transparent"
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
                          <span>Performance</span>
                          <span className="text-[var(--accent-cyan-edge)]">4 Engines</span>
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
                                className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-all duration-150 border border-transparent hover:border-[var(--border-subtle)]"
                              >
                                <div className="size-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-[var(--accent-cyan-edge)] group-hover:border-[var(--accent-cyan-edge)]/40 transition-colors">
                                  <Icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-foreground group-hover:text-[var(--accent-cyan-edge)] transition-colors truncate">{engine.name}</span>
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
                          <span>Security</span>
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
                                className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-all duration-150 border border-transparent hover:border-[var(--border-subtle)]"
                              >
                                <div className="size-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-purple-400 group-hover:border-purple-400/40 transition-colors">
                                  <Icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-foreground group-hover:text-purple-400 transition-colors truncate">{engine.name}</span>
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
                  <span className="flex size-6 items-center justify-center rounded-full bg-[var(--accent-framer-blue)]/20 text-[var(--accent-cyan-edge)] text-[11px] font-bold">{initials}</span>
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
                          <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-[var(--bg-surface)] hover:text-foreground">
                            <Lock className="size-3.5 text-amber-400" /> Admin
                          </Link>
                        )}
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-[var(--bg-surface)] hover:text-foreground">
                          <LayoutDashboard className="size-3.5 text-[var(--accent-cyan-edge)]" /> Dashboard
                        </Link>
                        <Link to="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-[var(--bg-surface)] hover:text-foreground">
                          <HomeIcon /> Home
                        </Link>
                        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-[var(--bg-surface)] hover:text-rose-400 cursor-pointer">
                          <LogOut className="size-3.5" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground px-2.5 py-1.5 transition-colors duration-150 focus:outline-none font-medium">
                  Login
                </Link>
                <Link to="/signup" className="rounded-full border border-[var(--border-subtle)] bg-[var(--app-background)] hover:bg-[var(--bg-surface)] px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors">
                  Signup
                </Link>
              </>
            )}
            <Link
              to="/audit"
              className="bg-foreground text-background font-semibold hover:bg-neutral-200 rounded-full px-3.5 py-1.5 text-xs sm:text-sm shadow-[0_0_18px_rgba(255,255,255,0.35)] flex items-center gap-1.5 transition-all active:scale-95 focus:outline-none shrink-0"
            >
              <span>Audit</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="text-foreground focus:outline-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 cursor-pointer"
              onClick={() => {
                setIsMobileMenuOpen(true);
                window.dispatchEvent(new CustomEvent('catalyst:open-mobile-menu'));
              }}
              aria-label="Open mobile navigation menu"
            >
              <Menu className="size-5" />
            </motion.button>
          </div>
        </nav>
      </motion.header>

      <MainMenuOverlay
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
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
