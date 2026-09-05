import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, CheckSquare, Menu, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Reports', path: '/reports', icon: CheckSquare },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden backdrop-blur-lg bg-black/80 border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      {/* Hairline Top Glow Border */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      
      <div className="flex items-center justify-around h-16 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all group",
                isActive ? "text-foreground font-medium" : "ds-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 w-10 h-1 bg-accent rounded-b-full shadow-[0_2px_12px_rgba(94,106,210,0.8)]"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <div className={cn(
                "p-1 rounded-xl transition-all duration-200",
                isActive ? "bg-accent/10 text-accent shadow-sm" : "group-hover:bg-black/5 dark:group-hover:bg-white/5"
              )}>
                <item.icon className={cn("size-5 transition-transform duration-200", isActive && "scale-110")} />
              </div>
              <span className={cn("text-[11px] font-medium tracking-tight transition-colors", isActive ? "text-accent-bright font-semibold" : "ds-muted")}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
        <button
          onClick={onOpenMenu}
          className="relative flex flex-col items-center justify-center w-full h-full gap-1 ds-muted hover:text-foreground transition-all group active:scale-95"
        >
          <div className="p-1 rounded-xl group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors">
            <Menu className="size-5 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <span className="text-[11px] font-medium tracking-tight ds-muted group-hover:text-foreground transition-colors">
            Menu
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;

