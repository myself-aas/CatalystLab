'use client';

import React, { useState } from 'react';
import { Bell, User, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export function TopBar({ title, className }: { title?: string, className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign Out Error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  let displayTitle = title;
  if (!displayTitle) {
    if (pathname === '/dashboard') displayTitle = 'Dashboard';
    else if (pathname.startsWith('/instruments')) displayTitle = 'Instruments';
    else if (pathname.startsWith('/reports')) displayTitle = 'My Reports';
    else if (pathname.startsWith('/search')) displayTitle = 'Literature Search';
    else if (pathname.startsWith('/reviews')) displayTitle = 'Living Reviews';
    else if (pathname.startsWith('/settings')) displayTitle = 'Settings';
    else displayTitle = 'CatalystLab';
  }

  return (
    <div className={cn("h-[52px] bg-[var(--bg-base)]/95 backdrop-blur-md border-b border-[var(--border-faint)] flex items-center justify-between px-6 sticky top-0 z-40", className)}>
      <div className="text-[14px] font-medium text-[var(--text-primary)]">{displayTitle}</div>
      
      <div className="flex items-center gap-3">
        {/* ⌘K Pill */}
        <Link href="/search" className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-[var(--r-sm)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer group">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]">⌘K</span>
        </Link>

        <div className="w-[1px] h-4 bg-[var(--border-faint)] mx-1 hidden md:block" />

        <button className="p-2 rounded-[var(--r-md)] hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--accent)] rounded-full border border-[var(--bg-base)]" />
        </button>
        
        <Link href="/profile" className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-full hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-all">
          <div className="w-6 h-6 rounded-full bg-[var(--bg-sunken)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] overflow-hidden">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-[12px] font-medium text-[var(--text-secondary)] hidden sm:block">Researcher</span>
        </Link>

        <button 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="p-2 rounded-[var(--r-md)] hover:bg-[var(--rose-muted)] text-[var(--text-tertiary)] hover:text-[var(--rose)] transition-all disabled:opacity-50"
          title="Sign Out"
        >
          {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
