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
  Search,
  ShoppingBag,
  User as UserIcon,
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
import { TOTAL_POPS_COUNT } from '../../lib/edge/pops';

interface EngineItem {
  id: string;
  name: string;
  tagline: string;
  tag: string;
  tagColor: string;
  path: string;
  icon: React.ElementType;
}

const PERF_TAG_COLOR = 'text-foreground bg-cream/10 border-cream/20';
const SEC_TAG_COLOR = 'text-purple-400 bg-cream/10 border-purple-500/20';

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

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile || current <= 20) {
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

      const handleScroll = () => {
        setIsScrolled(window.scrollY > 8);
      };

      const handleScrollEnd = () => {
        setIsVisible(true);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('scrollend', handleScrollEnd, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
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
            'relative flex items-center gap-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring py-2 px-3 rounded-xl font-medium',
            active
              ? 'text-foreground bg-cream/8 shadow-sm'
              : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100',
          )}
        >
          {Icon && <Icon className="size-4 shrink-0" />}
          <span>{item.label}</span>
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
            "top-nav fixed top-[var(--trial-banner-height,0px)] inset-x-0 z-40 w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300",
            isScrolled
              ? "scrolled bg-background/75 md:bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
              : "border-b border-black/5 bg-white"
          )}
      >
        <nav
          aria-label="Main Navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        >
          {/* Left Anchor: Hamburger + Official Meta Logo */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring p-2 min-h-[var(--control-min-size)] min-w-[var(--control-min-size)] flex items-center justify-center -ml-1 cursor-pointer rounded-full hover:bg-cream/8"
              onClick={() => {
                setIsMobileMenuOpen(true);
                window.dispatchEvent(new CustomEvent('catalyst:open-mobile-menu'));
              }}
              aria-label="Open navigation menu"
            >
              <Menu className="size-6 text-foreground stroke-[2.2]" />
            </motion.button>

            <Link to="/" className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <BrandLogo size="md" />
            </Link>

            <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-cream/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cream opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cream" />
              </span>
              <span>{TOTAL_POPS_COUNT} PoPs Active</span>
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
                  "flex items-center gap-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer py-2 px-3 rounded-xl font-medium",
                  isEnginesOpen 
                    ? "text-foreground bg-cream/8 shadow-sm" 
                    : "text-cream/70 hover:text-foreground hover:bg-cream/5"
                )}
                aria-expanded={isEnginesOpen}
              >
                <Activity className="size-4 shrink-0 text-[var(--chart-blue)]" />
                <span>Engines</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform duration-200 ml-0.5",
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
                      className="bg-fog/95 border border-foreground/8 rounded-3xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.3),0_24px_60px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(240,250,255,0.06)] backdrop-blur-2xl grid grid-cols-2 gap-3 relative overflow-hidden"
                    >
                      <div
                        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-20 blur-3xl"
                        style={{ background: 'radial-gradient(circle, var(--color-cream) 0%, transparent 70%)' }}
                      />

                      <div className="space-y-1.5">
                        <div className="px-2 py-1.5 text-[11px] font-mono uppercase tracking-wider text-cream/50 flex items-center justify-between border-b border-cream/6 pb-2 mb-1.5">
                          <span>Performance</span>
                          <span className="text-foreground">4 Engines</span>
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
                                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-cream/4 transition duration-150 border border-transparent hover:border-cream/8"
                              >
                                <div className="size-10 rounded-xl bg-background border border-foreground/6 flex items-center justify-center shrink-0 text-foreground/50 group-hover:text-foreground group-hover:border-cream/30 transition-colors shadow-inner">
                                  <Icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors truncate">{engine.name}</span>
                                  </div>
                                  <p className="text-[11px] text-cream/50 leading-snug line-clamp-1 mt-0.5">{engine.tagline}</p>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="space-y-1.5 border-l border-cream/6 pl-3">
                        <div className="px-2 py-1.5 text-[11px] font-mono uppercase tracking-wider text-cream/50 flex items-center justify-between border-b border-cream/6 pb-2 mb-1.5">
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
                                className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-cream/4 transition duration-150 border border-transparent hover:border-cream/8"
                              >
                                <div className="size-10 rounded-xl bg-background border border-foreground/6 flex items-center justify-center shrink-0 text-foreground/50 group-hover:text-purple-400 group-hover:border-purple-400/30 transition-colors shadow-inner">
                                  <Icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-foreground group-hover:text-purple-400 transition-colors truncate">{engine.name}</span>
                                  </div>
                                  <p className="text-[11px] text-cream/50 leading-snug line-clamp-1 mt-0.5">{engine.tagline}</p>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="col-span-2 mt-2 pt-3 border-t border-cream/6 flex items-center justify-between px-2">
                        <Link to="/engines" onClick={() => setIsEnginesOpen(false)} className="text-cream/60 hover:text-foreground flex items-center gap-1.5 text-xs font-medium group">
                          <span>Explore All 8 Telemetry Engines</span>
                          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <span className="text-[11px] font-mono text-cream/40">Zero-SDK • RFC 9110</span>
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

          {/* Right Action Area (Meta Standard: Search, Bag, User, Shop CTA) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <NavbarSearch isScrolled={isScrolled} />

            <Link
              to="/pricing"
              className="p-2 min-h-[var(--control-min-size)] min-w-[var(--control-min-size)] flex items-center justify-center rounded-full text-foreground hover:bg-foreground/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Store & Plans"
              title="Store & Plans"
            >
              <ShoppingBag className="size-5 stroke-[2]" />
            </Link>

            {user ? (
              <div className="relative" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="p-2 min-h-[var(--control-min-size)] min-w-[var(--control-min-size)] flex items-center justify-center rounded-full text-foreground hover:bg-foreground/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-label="User Account"
                >
                  <UserIcon className="size-5 stroke-[2]" />
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
                      <div className="rounded-3xl border border-cream/8 bg-fog/95 dark:bg-ink-soft/95 p-2 shadow-[0_2px_4px_rgba(0,0,0,0.3),0_24px_60px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
                        <div className="px-3 py-2.5 border-b border-border/50 mb-1 rounded-2xl">
                          <div className="text-sm font-semibold text-foreground truncate">{userName}</div>
                          <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">{planId} • {currentPlan?.name || 'Account'}</div>
                        </div>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground">
                            <span className="size-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><Lock className="size-3.5 text-amber-400" /></span> Admin
                          </Link>
                        )}
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground">
                          <span className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><LayoutDashboard className="size-3.5 text-foreground" /></span> Dashboard
                        </Link>
                        <Link to="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground">
                          <span className="size-8 rounded-xl bg-foreground/5 border border-border flex items-center justify-center"><HomeIcon /></span> Home
                        </Link>
                        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/80 hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer">
                          <span className="size-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center"><LogOut className="size-3.5" /></span> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 min-h-[var(--control-min-size)] min-w-[var(--control-min-size)] flex items-center justify-center rounded-full text-foreground hover:bg-foreground/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Sign in"
                title="Sign in"
              >
                <UserIcon className="size-5 stroke-[2]" />
              </Link>
            )}

            <Link
              to="/audit"
              className="hidden sm:inline-flex bg-buy hover:bg-buy-hover text-white font-semibold rounded-full px-5 py-2 text-sm shadow-md transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-1"
            >
              Shop
            </Link>
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
