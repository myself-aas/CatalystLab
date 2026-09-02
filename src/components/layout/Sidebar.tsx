import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  BarChart2, 
  FolderOpen, 
  Settings, 
  Search,
  Activity,
  Terminal,
  Cpu,
  Globe,
  Sun,
  Moon,
  MoreVertical,
  LogOut,
  LogIn,
  ChevronRight,
  Menu,
  X,
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

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [enginesExpanded, setEnginesExpanded] = useState(true);
  const { user, logOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const TOP_LINKS = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Reports', icon: CheckSquare, path: '/reports', badge: '12' },
    { name: 'Blogs', icon: Users, path: '/blogs' },
    { name: 'Methodology', icon: BarChart2, path: '/methodology' },
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
    <div className="flex h-full flex-col bg-[#F9FAFB] dark:bg-card border-r border-border-default overflow-hidden transition-colors">
      {/* Header */}
      <div className={cn("flex items-center h-16 shrink-0 px-4", isExpanded ? "justify-between" : "justify-center")}>
        {isExpanded && (
          <Link to="/" className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md" onClick={onCloseMobile}>
            <BrandLogo size="sm" />
            <span className="font-bold text-[15px] tracking-tight">CatalystLab</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-foreground-muted hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SidebarIcon className="size-[18px]" />
        </button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
        {TOP_LINKS.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onCloseMobile}
            className={({ isActive }) => cn(
              "group relative flex items-center h-[36px] rounded-lg px-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              isActive 
                ? "bg-black/5 dark:bg-white/10 text-foreground font-medium" 
                : "text-foreground-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
            )}
          >
            <item.icon className={cn("size-[18px] shrink-0", !isExpanded && "mx-auto")} />
            
            {isExpanded && (
              <span className="ml-3 text-[14px] flex-1 truncate">{item.name}</span>
            )}
            
            {isExpanded && item.badge && (
              <span className="text-[11px] font-medium text-foreground-muted bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-md">
                {item.badge}
              </span>
            )}

            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center shadow-lg">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-foreground" />
                {item.name}
              </div>
            )}
          </NavLink>
        ))}

        {/* Folders (Engines) Accordion */}
        <div className="pt-4 pb-1">
          <button
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
              setEnginesExpanded(!enginesExpanded);
            }}
            className={cn(
              "w-full flex items-center h-[36px] rounded-lg px-2.5 transition-colors text-foreground-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              !isExpanded && "justify-center"
            )}
          >
            {isExpanded ? (
              <motion.div
                animate={{ rotate: enginesExpanded ? 90 : 0 }}
                transition={{ duration: 0.15 }}
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

            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center shadow-lg">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-foreground" />
                Engines
              </div>
            )}
          </button>
          
          <AnimatePresence initial={false}>
            {isExpanded && enginesExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pl-6 space-y-0.5 pt-1">
                  {ENGINES.map(engine => (
                    <NavLink
                      key={engine.name}
                      to={engine.path}
                      onClick={onCloseMobile}
                      className={({ isActive }) => cn(
                        "flex items-center h-[32px] rounded-lg px-2.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        isActive 
                          ? "bg-black/5 dark:bg-white/10 text-foreground font-medium" 
                          : "text-foreground-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                      )}
                    >
                      <span className="truncate">{engine.name}</span>
                    </NavLink>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Area */}
      <div className="px-3 py-4 space-y-4 border-t border-border-default/50 shrink-0">
        {/* Theme Toggle segmented control */}
        {isExpanded ? (
          <div className="flex p-0.5 bg-black/5 dark:bg-white/5 rounded-lg">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 text-[13px] font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                theme === 'light' ? "bg-white text-black shadow-sm dark:bg-black dark:text-white" : "text-foreground-muted hover:text-foreground"
              )}
            >
              <Sun className="size-[15px]" />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 text-[13px] font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                theme === 'dark' ? "bg-white text-black shadow-sm dark:bg-black dark:text-white" : "text-foreground-muted hover:text-foreground"
              )}
            >
              <Moon className="size-[15px]" />
              Dark
            </button>
          </div>
        ) : (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-center h-[36px] rounded-lg text-foreground-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>
        )}

        {/* User Profile */}
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
                <p className="text-[12px] text-foreground-muted truncate">
                  {user?.email || 'Sign in to sync'}
                </p>
              </div>
              
              <button className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none">
                <MoreVertical className="size-[18px]" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <motion.aside
        initial={false}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:block shrink-0 h-screen sticky top-0 z-40 bg-background"
      >
        {SidebarContent}
      </motion.aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 lg:hidden bg-background shadow-2xl"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
