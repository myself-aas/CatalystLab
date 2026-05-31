'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrainCircuit, Home, Beaker, FileBox, LayoutDashboard, Search, BookOpen, Settings, UserCircle, MessageSquare, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Feed', href: '/feed', icon: MessageSquare },
  { name: 'Instruments', href: '/instruments', icon: Beaker },
  { name: 'Reviews', href: '/reviews', icon: BookOpen },
  { name: 'Account', href: '/user', icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

      {/* M3 Navigation Rail Footer Destination: Merged Account Hub */}
      <div ref={menuRef} className="mt-auto w-full flex flex-col items-center gap-2 px-1 pb-4 relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full flex flex-col items-center group cursor-pointer relative"
        >
          {/* Active indicator is active when on profile, settings, or menu is open */}
          <div
            className={`h-12 w-14 rounded-full flex items-center justify-center transition-all duration-300 relative ${
              menuOpen || pathname.startsWith('/settings') || pathname.startsWith('/user')
                ? 'bg-[#C6EFCE] text-[#002206] ring-2 ring-[#68BA7F]/40'
                : 'text-[#434842] group-hover:bg-[#E0E4DB] group-hover:text-[#191E1A]'
            }`}
          >
            {/* Display User Photo or UserCircle */}
            {user?.photoURL ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#68BA7F]/20 shadow-sm relative group-hover:scale-105 transition-transform">
                <img src={user.photoURL} alt="User Avatar" className="w-full h-full object-cover animate-fadeIn" referrerPolicy="no-referrer" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#68BA7F] border border-white" />
              </div>
            ) : (
              <div className="relative group-hover:scale-105 transition-transform">
                <UserCircle className="w-6 h-6 text-[#1E4D2B]" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#68BA7F] border border-white" />
              </div>
            )}
          </div>
          <span
            className={`text-[10px] uppercase tracking-wider mt-1.5 text-center px-1 font-bold select-none truncate w-full transition-colors ${
              menuOpen || pathname.startsWith('/settings') || pathname.startsWith('/user')
                ? 'text-[#1E4D2B]'
                : 'text-[#434842]/80 group-hover:text-[#191E1A]'
            }`}
          >
            Account
          </span>
        </button>

        {/* Floating Actions Panel Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -12, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="absolute left-[84px] bottom-4 w-56 bg-white border border-[#68BA7F]/35 rounded-[1.5rem] shadow-xl p-3 z-50 flex flex-col gap-1.5 focus:outline-none"
            >
              {/* User Overview Section */}
              <div className="px-2 py-1.5 flex flex-col select-none">
                <span className="text-xs font-bold text-[#253D2C] truncate">
                  {user?.displayName || 'Academic Researcher'}
                </span>
                <span className="text-[10px] text-gray-500 font-mono truncate">
                  {user?.email || 'researcher@catalyst.edu'}
                </span>
              </div>
              
              <div className="h-px bg-[#68BA7F]/15 my-0.5" />

              {/* Profile Link */}
              <Link
                href="/user"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  pathname.startsWith('/user')
                    ? 'bg-[#C6EFCE]/55 text-[#002206] font-bold'
                    : 'text-[#434842] hover:bg-[#FAFDF6] hover:text-[#1E4D2B]'
                }`}
              >
                <UserCircle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium">Research Profile</span>
              </Link>

              {/* Settings Link */}
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  pathname.startsWith('/settings')
                    ? 'bg-[#C6EFCE]/55 text-[#002206] font-bold'
                    : 'text-[#434842] hover:bg-[#FAFDF6] hover:text-[#1E4D2B]'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium">Portal Settings</span>
              </Link>

              <div className="h-px bg-[#68BA7F]/15 my-0.5" />

              {/* Sign Out Action */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleSignOut();
                }}
                className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-xl transition-all cursor-pointer text-[#434842] hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 shrink-0 text-red-500 group-hover:text-red-700" />
                <span className="text-xs font-semibold">Sign Out Hub</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

