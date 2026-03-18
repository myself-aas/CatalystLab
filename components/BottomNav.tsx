'use client';

import React from 'react';
import { 
  Home, 
  FlaskConical, 
  Search, 
  FileText,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useAuthStore } from '@/stores/authStore';

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Instruments', icon: FlaskConical, href: '/instruments' },
    { label: 'Search', icon: Search, href: '/search' },
    { label: 'Reports', icon: FileText, href: '/reports' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-elevated)]/95 backdrop-blur-xl border-t border-[var(--border-faint)] px-2 flex items-center justify-around z-50 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/feed' && item.href !== '/' && pathname.startsWith(item.href)) ||
          (item.label === 'Profile' && pathname.startsWith('/profile'));
        
        return (
          <Link 
            key={item.label}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-all duration-300 relative min-w-[64px] min-h-[48px]",
              isActive ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
            <span className={cn("text-[10px] font-bold transition-all uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-60")}>{item.label}</span>
            {isActive && (
              <motion.div 
                layoutId="bottom-nav-active"
                className="absolute -top-1 w-1 h-1 bg-[var(--accent)] rounded-full shadow-[0_0_12px_var(--accent)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
