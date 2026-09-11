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

const PERF_TAG_COLOR = 'text-[#F0FAFF] bg-[#F0FAFF]/10 border-[#F0FAFF]/20';
const SEC_TAG_COLOR = 'text-purple-400 bg-[#F0FAFF]/10 border-purple-500/20';

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

  useMotionValueEvent(scrollY, 'change', (current) => {
    setIsScrolled(current > 8);

    if (scrollPauseTimeout.current) {
      clearTimeout(scrollPauseTimeout.current);
    }

    if (current <= 20) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      scrollPauseTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 180);
    }

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
            'relative flex items-center gap-1.5 text-sm transition-colors duration-200 focus:outline-none py-1.5 px-1 font-medium',
            active
              ? 'text-[#F0FAFF]'
              : 'text-[rgba(240,250,255,0.6)] hover:text-[#F0FAFF]',
          )}
        >
          {Icon && <Icon className="size-4" />}
          {item.label}
          {active && (
            <motion.span
              layoutId="nav-active-dot"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-[#F0FAFF]"
            />
          )}
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
          className="top-nav fixed top-[var(--trial-banner-height,0px)] inset-x-0 z-40 w-full border-b border-transparent bg-transparent transition-[background-color,backdrop-filter,border-color] duration-300"
      >
        <nav
          aria-label="Main Navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        >
          {/* Left Anchor: Monogram + Wordmark + Live Node Chip */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 group focus:outline-none">
              <BrandLogo size="md" />
            </Link>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-[#F0FAFF]/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0FAFF] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#F0FAFF]" />
              </span>
              <span>38/38 PoPs Active</span>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Engines Mega-Menu Trigger */}
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setIsEnginesOpen(!isEnginesOpen)}
                className={cn(
                  "flex items-center gap-1 text-sm transition-colors duration-200 focus:outline-none cursor-pointer py-1.5 px-2 font-medium",
                  isEnginesOpen ? "text-[#F0FAFF]" : "text-[rgba(240,250,255,0.6)] hover:text-[#F0FAFF]"
                )}
                aria-expanded={isEnginesOpen}
              >
                <span>Engines</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    isEnginesOpen && "rotate-180"
                  )}
                />
              </motion.button>

              <AnimatePresence>
                {isEnginesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -left-24 top-full pt-3 w-[580px] z-50 pointer-events-auto"
                  >
                    <div
                      className="bg-[#2C3032]/95 border border-[rgba(240,250,255,0.08)] rounded-3xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.3),0_24px_60px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(240,250,255,0.06)] backdrop-blur-2xl grid grid-cols-2 gap-3 relative overflow-hidden"
                    >
                      <div
                        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-20 blur-3xl"
                        style={{ background: 'radial-gradient(circle, #F0FAFF 0%, transparent 70%)' }}
                      />

                      <div className="space-y-1.5">
                        <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[rgba(240,250,255,0.5)] flex items-center justify-between border-b border-[rgba(240,250,255,0.06)] pb-2 mb-1.5">
                          <span>Performance</span>
                          <span className="text-[#F0FAFF]">4 Engines</span>
                        </div>
                        {PERFORMANCE_ENGINES.map((engine) => {
                          const Icon = engine.icon;
                          return (
                            <motion.div
                              key={engine.id}
                              whileHover={{ scale: 1.01, x: 2 }}
                              whileTap={{ scale: 0.99 }}
                              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <Link
                                to={engine.path}
                                onClick={() => setIsEnginesOpen(false)}
                                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[rgba(240,250,255,0.04)] transition-all duration-150 border border-transparent hover:border-[rgba(240,250,255,0.08)]"
                              >
                                <div className="size-10 rounded-xl bg-[#1F2223] border border-[rgba(240,250,255,0.06)] flex items-center justify-center shrink-0 text-[rgba(240,250,255,0.5)] group-hover:text-[#F0FAFF] group-hover:border-[#F0FAFF]/30 transition-colors shadow-inner">
                                  <Icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-[#F0FAFF] group-hover:text-[#F0FAFF] transition-colors truncate">{engine.name}</span>
                                  </div>
                                  <p className="text-[11px] text-[rgba(240,250,255,0.5)] leading-snug line-clamp-1 mt-0.5">{engine.tagline}</p>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="space-y-1.5 border-l border-[rgba(240,250,255,0.06)] pl-3">
                        <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[rgba(240,250,255,0.5)] flex items-center justify-between border-b border-[rgba(240,250,255,0.06)] pb-2 mb-1.5">
                          <span>Security & AI</span>
                          <span className="text-purple-400">4 Engines</span>
                        </div>
                        {SECURITY_AI_ENGINES.map((engine) => {
                          const Icon = engine.icon;
                          return (
                            <motion.div
                              key={engine.id}
                              whileHover={{ scale: 1.01, x: 2 }}
                              whileTap={{ scale: 0.99 }}
                              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <Link
                                to={engine.path}
                                onClick={() => setIsEnginesOpen(false)}
                                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[rgba(240,250,255,0.04)] transition-all duration-150 border border-transparent hover:border-[rgba(240,250,255,0.08)]"
                              >
                                <div className="size-10 rounded-xl bg-[#1F2223] border border-[rgba(240,250,255,0.06)] flex items-center justify-center shrink-0 text-[rgba(240,250,255,0.5)] group-hover:text-purple-400 group-hover:border-purple-400/30 transition-colors shadow-inner">
                                  <Icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-[#F0FAFF] group-hover:text-purple-400 transition-colors truncate">{engine.name}</span>
                                  </div>
                                  <p className="text-[11px] text-[rgba(240,250,255,0.5)] leading-snug line-clamp-1 mt-0.5">{engine.tagline}</p>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="col-span-2 mt-2 pt-3 border-t border-[rgba(240,250,255,0.06)] flex items-center justify-between px-2">
                        <Link to="/engines" onClick={() => setIsEnginesOpen(false)} className="text-[rgba(240,250,255,0.6)] hover:text-[#F0FAFF] flex items-center gap-1.5 text-xs font-medium group">
                          <span>Explore All 8 Telemetry Engines</span>
                          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <span className="text-[10px] font-mono text-[rgba(240,250,255,0.4)]">Zero-SDK • RFC 9110</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct Navigation Links */}
            <div className="flex items-center gap-1">
              {renderPrimaryLinks(links.filter((l) => l.id !== 'engines'))}
            </div>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-2">
            <NavbarSearch isScrolled={isScrolled} />

            {user ? (
              <div className="relative" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full border border-[rgba(240,250,255,0.10)] bg-[#2C3032]/70 backdrop-blur-xl px-2 py-1.5 text-xs font-medium text-[#F0FAFF] hover:border-[rgba(240,250,255,0.20)] transition-colors cursor-pointer shadow-[inset_0_1px_0_rgba(240,250,255,0.06)]"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#F0FAFF]/20 text-[#F0FAFF] text-[11px] font-bold border border-[#F0FAFF]/30">{initials}</span>
                  <span className="max-w-[110px] truncate">{userName}</span>
                  <ChevronDown className={cn('size-3.5 text-[rgba(240,250,255,0.5)] transition-transform', profileOpen && 'rotate-180')} />
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full pt-3 z-50 w-64"
                      role="menu"
                    >
                      <div className="rounded-3xl border border-[rgba(240,250,255,0.08)] bg-[#2C3032]/95 p-2 shadow-[0_2px_4px_rgba(0,0,0,0.3),0_24px_60px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(240,250,255,0.06)] backdrop-blur-2xl">
                        <div className="px-3 py-2.5 border-b border-[rgba(240,250,255,0.06)] mb-1 rounded-2xl">
                          <div className="text-sm font-semibold text-[#F0FAFF] truncate">{userName}</div>
                          <div className="text-[10px] font-mono text-[rgba(240,250,255,0.5)] uppercase tracking-wider">{planId} • {currentPlan?.name || 'Account'}</div>
                        </div>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[rgba(240,250,255,0.6)] hover:bg-[rgba(240,250,255,0.05)] hover:text-[#F0FAFF]">
                            <span className="size-8 rounded-xl bg-[#F0FAFF]/10 border border-amber-500/20 flex items-center justify-center"><Lock className="size-3.5 text-amber-400" /></span> Admin
                          </Link>
                        )}
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[rgba(240,250,255,0.6)] hover:bg-[rgba(240,250,255,0.05)] hover:text-[#F0FAFF]">
                          <span className="size-8 rounded-xl bg-[#F0FAFF]/10 border border-[#F0FAFF]/20 flex items-center justify-center"><LayoutDashboard className="size-3.5 text-[#F0FAFF]" /></span> Dashboard
                        </Link>
                        <Link to="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[rgba(240,250,255,0.6)] hover:bg-[rgba(240,250,255,0.05)] hover:text-[#F0FAFF]">
                          <span className="size-8 rounded-xl bg-[rgba(240,250,255,0.06)] border border-[rgba(240,250,255,0.08)] flex items-center justify-center"><HomeIcon /></span> Home
                        </Link>
                        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[rgba(240,250,255,0.6)] hover:bg-[#F7FDFF]/10 hover:text-rose-400 cursor-pointer">
                          <span className="size-8 rounded-xl bg-[#F7FDFF]/10 border border-rose-500/20 flex items-center justify-center"><LogOut className="size-3.5" /></span> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-[rgba(240,250,255,0.65)] hover:text-[#F0FAFF] px-3 py-1.5 transition-colors duration-200 focus:outline-none font-medium">
                  Login
                </Link>
                <Link to="/signup" className="rounded-full border border-[rgba(240,250,255,0.12)] bg-[#2C3032]/70 backdrop-blur hover:bg-[#2C2F32] px-4 py-1.5 text-sm font-medium text-[#F0FAFF] transition-colors shadow-[inset_0_1px_0_rgba(240,250,255,0.06)]">
                  Sign up
                </Link>
              </>
            )}
            <Link
              to="/audit"
              className="bg-[#F0FAFF] text-[#1F2223] font-semibold hover:bg-[#F7FDFF] rounded-full px-4 py-2 text-sm shadow-[0_2px_12px_rgba(240,250,255,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center gap-1.5 transition-all active:scale-95 focus:outline-none shrink-0 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(240,250,255,0.22)]"
            >
              <span>Audit</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#F0FAFF] focus:outline-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 cursor-pointer rounded-full hover:bg-[rgba(240,250,255,0.06)]"
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

/** Small inline Home icon. */
const HomeIcon = () => (
  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default Navbar;
