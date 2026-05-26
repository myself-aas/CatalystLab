'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrainCircuit, Home, Beaker, FileBox, LayoutDashboard, Search, BookOpen, Settings, UserCircle, MessageSquare, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Feed', href: '/feed', icon: MessageSquare },
  { name: 'Study Room', href: '/study', icon: Home },
  { name: 'Instruments', href: '/instruments', icon: Beaker },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Reviews', href: '/reviews', icon: BookOpen },
  { name: 'Blogs', href: '/blogs', icon: MessageSquare },
  { name: 'Sessions', href: '/reports', icon: FileBox },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <aside className="w-[96px] flex flex-col h-full bg-[#f3f6f1] border-r border-[#68BA7F]/20 hidden md:flex items-center py-4 select-none">
      {/* M3 Navigation Rail Header / FAB Area */}
      <div className="mb-6 flex flex-col items-center">
        <Link href="/dashboard" className="group flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-[1.25rem] bg-[#C6EFCE] text-[#002206] flex items-center justify-center border border-[#68BA7F]/30 hover:scale-105 active:scale-95 transition-all shadow-sm">
            <BrainCircuit className="w-6 h-6 text-[#1E4D2B]" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1E4D2B] mt-1 text-center scale-90">
            Catalyst
          </span>
        </Link>
      </div>

      {/* M3 Navigation Rail Destinations */}
      <nav className="flex-1 w-full flex flex-col items-center gap-4 px-1 overflow-y-auto subtle-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="w-full flex flex-col items-center group relative cursor-pointer"
            >
              {/* M3 Active Destination Indicator (Pill) */}
              <div
                className={`h-8 w-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#C6EFCE] text-[#002206] font-medium shadow-none'
                    : 'text-[#434842] group-hover:bg-[#E0E4DB] group-hover:text-[#191E1A]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-active:scale-90`} />
              </div>
              
              {/* Destination Label */}
              <span
                className={`text-[11px] tracking-wide mt-1.5 text-center px-1 font-medium select-none truncate w-full transition-colors ${
                  isActive ? 'text-[#1E4D2B] font-bold' : 'text-[#434842]/80 group-hover:text-[#191E1A]'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* M3 Navigation Rail Footer Destination */}
      <div className="mt-auto w-full flex flex-col items-center gap-4 px-1 pb-4">
        <Link
          href="/settings"
          className="w-full flex flex-col items-center group cursor-pointer"
        >
          <div
            className={`h-8 w-14 rounded-full flex items-center justify-center transition-all duration-200 ${
              pathname.startsWith('/settings')
                ? 'bg-[#C6EFCE] text-[#002206] font-medium'
                : 'text-[#434842] group-hover:bg-[#E0E4DB] group-hover:text-[#191E1A]'
            }`}
          >
            <Settings className="w-5 h-5 transition-transform duration-200 group-active:scale-95" />
          </div>
          <span
            className={`text-[11px] tracking-wide mt-1.5 text-center px-1 font-medium select-none truncate w-full transition-colors ${
              pathname.startsWith('/settings') ? 'text-[#1E4D2B] font-bold' : 'text-[#434842]/80 group-hover:text-[#191E1A]'
            }`}
          >
            Settings
          </span>
        </Link>
        <Link
          href="/user"
          className="w-full flex flex-col items-center group cursor-pointer"
        >
          <div
            className={`h-8 w-14 rounded-full flex items-center justify-center transition-all duration-200 ${
              pathname.startsWith('/user')
                ? 'bg-[#C6EFCE] text-[#002206] font-medium'
                : 'text-[#434842] group-hover:bg-[#E0E4DB] group-hover:text-[#191E1A]'
            }`}
          >
            <UserCircle className="w-5 h-5 transition-transform duration-200 group-active:scale-95" />
          </div>
          <span
            className={`text-[11px] tracking-wide mt-1.5 text-center px-1 font-medium select-none truncate w-full transition-colors ${
              pathname.startsWith('/user') ? 'text-[#1E4D2B] font-bold' : 'text-[#434842]/80 group-hover:text-[#191E1A]'
            }`}
          >
            Profile
          </span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex flex-col items-center group cursor-pointer"
        >
          <div className="h-8 w-14 rounded-full flex items-center justify-center transition-all duration-200 text-[#434842] group-hover:bg-red-100 group-hover:text-red-700">
            <LogOut className="w-5 h-5 transition-transform duration-200 group-active:scale-95" />
          </div>
          <span className="text-[11px] tracking-wide mt-1.5 text-center px-1 font-medium select-none truncate w-full transition-colors text-[#434842]/80 group-hover:text-red-700">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}

