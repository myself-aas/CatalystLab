import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  FolderOpen,
  Settings,
  Activity,
  Sun,
  Moon,
  LogOut,
  LogIn,
  ChevronRight,
  Sidebar as SidebarIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface SidebarLink {
  name: string;
  icon: typeof LayoutDashboard;
  path: string;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [enginesExpanded, setEnginesExpanded] = useState(true);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const TOP_LINKS: SidebarLink[] = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Audits', icon: CheckSquare, path: '/dashboard/audits' },
    { name: 'Reports', icon: FolderOpen, path: '/reports' },
    { name: 'Webhooks', icon: Activity, path: '/dashboard/webhooks' },
    { name: 'Monitoring', icon: BarChart2, path: '/dashboard/monitoring' },
    { name: 'API Keys', icon: Settings, path: '/dashboard/api-keys' },
  ];

  const ENGINES = [
    { name: 'VitalZyme Engine', path: '/health' },
    { name: 'GitLygase Engine', path: '/repo-scanner' },
    { name: 'LLM-Kinase Engine', path: '/ai-readiness' },
    { name: 'EdgeVmax Engine', path: '/latency' },
    { name: 'Eco-Audit Engine', path: '/eco-audit' },
    { name: 'Compliance Engine', path: '/compliance' },
    { name: 'Migration Engine', path: '/migration' },
    { name: 'LLMO Engine', path: '/llmo' },
  ];

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const sidebarVariants = {
    expanded: { width: '260px' },
    collapsed: { width: '72px' }
  };

  const SidebarContent = (
    <div className="flex h-full flex-col bg-[var(--app-background)] border-r border-[var(--border-subtle)] overflow-hidden">
      <div className={cn("flex items-center h-16 shrink-0 px-4", isExpanded ? "justify-between" : "justify-center")}>
        {isExpanded && (
          <Link to="/" className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md" onClick={onCloseMobile}>
            <BrandLogo size="sm" />
            <span className="font-bold text-[15px] tracking-tight">CatalystLab</span>
          </Link>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={toggleSidebar}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className="p-1.5 rounded-md ds-muted hover:bg-[var(--bg-panel-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
        >
          <SidebarIcon className="size-[18px]" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
        {TOP_LINKS.map((item) => (
          <motion.div
            key={item.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <NavLink
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) => cn(
                "group relative flex items-center h-[36px] rounded-lg px-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isActive
                  ? "ds-nav-active shadow-sm"
                  : "bg-[var(--app-background)] ds-muted hover:text-foreground hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-subtle)]"
              )}
            >
              <item.icon className={cn("size-[18px] shrink-0", !isExpanded && "mx-auto")} />

              {isExpanded && (
                <span className="ml-3 text-[14px] flex-1 truncate">{item.name}</span>
              )}

              {isExpanded && item.badge && (
                <span className="text-[11px] font-medium ds-muted bg-[var(--bg-panel-hover)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}

              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-[var(--app-background)] text-xs font-medium rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center shadow-lg">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-white" />
                  {item.name}
                </div>
              )}
            </NavLink>
          </motion.div>
        ))}

        <div className="pt-4 pb-1">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
              setEnginesExpanded(!enginesExpanded);
            }}
            className={cn(
              "w-full flex items-center h-[36px] rounded-lg px-2.5 transition-colors ds-muted hover:bg-[var(--bg-surface)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer",
              !isExpanded && "justify-center"
            )}
          >
            {isExpanded ? (
              <motion.div
                animate={{ rotate: enginesExpanded ? 90 : 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0"
              >
                <ChevronRight className="size-4" />
              </motion.div>
            ) : (
              <FolderOpen className="size-[18px]" />
            )}

            {isExpanded && (
              <span className="ml-2 text-[14px] flex-1 text-left">Engines</span>
            )}
          </motion.button>

          <AnimatePresence initial={false}>
            {isExpanded && enginesExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pl-6 space-y-0.5 pt-1">
                  {ENGINES.map(engine => (
                    <motion.div
                      key={engine.name}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <NavLink
                        to={engine.path}
                        onClick={onCloseMobile}
                        className={({ isActive }) => cn(
                          "flex items-center h-[32px] rounded-lg px-2.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          isActive
                            ? "ds-nav-active"
                            : "ds-muted hover:bg-[var(--bg-surface)] hover:text-foreground border border-transparent hover:border-[var(--border-subtle)]"
                        )}
                      >
                        <span className="truncate">{engine.name}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-3 py-4 space-y-4 border-t border-[var(--border-subtle)] shrink-0">
        {isExpanded ? (
          <div className="flex p-0.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setTheme('light')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 text-[13px] font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer",
                theme === 'light' ? "bg-[var(--app-background)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]" : "ds-muted hover:text-foreground"
              )}
            >
              <Sun className="size-[15px]" />
              Light
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setTheme('dark')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 text-[13px] font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer",
                theme === 'dark' ? "bg-[var(--app-background)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]" : "ds-muted hover:text-foreground"
              )}
            >
              <Moon className="size-[15px]" />
              Dark
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-center h-[36px] rounded-lg ds-muted hover:bg-[var(--bg-surface)] hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </motion.button>
        )}

        <div className={cn("flex items-center", isExpanded ? "gap-3 px-2" : "justify-center")}>
          <div className="size-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 border border-accent/30 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="size-full object-cover" />
            ) : (
              <span className="text-[13px] font-medium text-accent-bright">
                {user?.email?.[0].toUpperCase() || 'C'}
              </span>
            )}
          </div>

          {isExpanded && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">
                  {user?.displayName || 'Guest User'}
                </p>
                <p className="text-[12px] ds-muted truncate">
                  {user?.email || 'Sign in to sync'}
                </p>
              </div>

              {user ? (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-1 rounded ds-muted hover:text-foreground hover:bg-[var(--bg-panel-hover)] transition-colors focus-visible:outline-none cursor-pointer"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="size-[18px]" />
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={onCloseMobile}
                  className="p-1 rounded ds-muted hover:text-foreground hover:bg-[var(--bg-panel-hover)] transition-colors focus-visible:outline-none"
                  title="Sign in"
                  aria-label="Sign in"
                >
                  <LogIn className="size-[18px]" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={sidebarVariants}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:block shrink-0 h-screen sticky top-0 z-40 bg-[var(--app-background)]"
      >
        {SidebarContent}
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-[var(--app-background)]/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 lg:hidden bg-[var(--app-background)] border-r border-[var(--border-subtle)] shadow-2xl"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
