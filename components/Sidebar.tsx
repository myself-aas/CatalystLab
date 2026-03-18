'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FlaskConical, FileText, Search, BookOpen, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export function Sidebar() {
  const pathname = usePathname();
  const { profile, user } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { label: 'Instruments', href: '/instruments', icon: FlaskConical },
    { label: 'My Reports', href: '/reports', icon: FileText },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Living Reviews', href: '/reviews', icon: BookOpen },
  ];

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Researcher';

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[var(--bg-elevated)] border-r border-[var(--border-faint)] hidden lg:flex flex-col z-50">
      {/* TOP */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-7 h-7 border-[1.5px] border-[var(--text-primary)] rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-[1.5px] border-[var(--text-primary)] rounded-full opacity-50" />
          </div>
          <div className="w-1.5 h-1.5 bg-[var(--text-primary)] rounded-full z-10" />
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[15px] font-medium text-[var(--text-primary)]">Catalyst</span>
          <span className="text-[15px] font-normal text-[var(--text-primary)]">Lab</span>
        </div>
        <span className="px-1.5 py-0.5 bg-[var(--accent-muted)] text-[var(--accent)] text-[10px] font-medium rounded-full">beta</span>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 h-9 px-3 rounded-[var(--r-md)] text-[13px] transition-all group relative",
                isActive 
                  ? "bg-[var(--bg-active)] text-[var(--text-primary)]" 
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--accent)] rounded-full" />
              )}
              <item.icon className={cn("w-4 h-4", isActive ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]")} />
              {item.label}
            </Link>
          );
        })}
        
        <div className="h-px bg-[var(--border-faint)] my-4 mx-3" />
        
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 h-9 px-3 rounded-[var(--r-md)] text-[13px] transition-all group",
            pathname === '/settings' 
              ? "bg-[var(--bg-active)] text-[var(--text-primary)]" 
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          )}
        >
          <Settings className={cn("w-4 h-4", pathname === '/settings' ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]")} />
          Settings
        </Link>
      </nav>

      {/* BOTTOM */}
      <div className="p-4 mt-auto border-t border-[var(--border-faint)]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-6 h-6 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{displayName}</p>
            <span className="text-[10px] font-medium text-[var(--accent)] uppercase tracking-wider">Free Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
