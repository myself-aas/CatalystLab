'use client';
import React from 'react';
import { useAuth } from './AuthProvider';
import { LogOut, User, Search, MessageSquare } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TopBar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const triggerCmdK = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[#f3f6f1] border-b border-[#68BA7F]/15 sticky top-0 z-20">
      <div className="flex-1 flex items-center">
        <button 
          onClick={triggerCmdK}
          className="hidden sm:flex items-center gap-2.5 max-w-sm px-4 py-2 rounded-full bg-white border border-[#68BA7F]/20 hover:bg-[#FAFDF6] hover:border-[#2E6F40]/40 transition-all text-[#434842]/70 text-sm w-64 group shadow-sm"
        >
          <Search className="w-4 h-4 text-[#2E6F40]/70 group-hover:text-[#2E6F40] transition-colors" />
          <span className="flex-1 text-left select-none text-[13px] font-medium tracking-wide">Search Literature...</span>
          <span className="text-[10px] font-mono font-semibold bg-[#CFFFDC]/40 px-2 py-0.5 rounded-full text-[#1E4D2B] transition-colors">⌘K</span>
        </button>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/settings" className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#1E4D2B] hover:text-[#002206] transition-colors">
            <User className="w-3.5 h-3.5" /> Settings
        </Link>
        <Link href="/blogs" className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#1E4D2B] hover:text-[#002206] transition-colors">
            <MessageSquare className="w-3.5 h-3.5" /> Blogs
        </Link>
        <div className="flex items-center gap-2.5 text-sm text-[#191E1A] bg-white/50 py-1.5 pl-2 pr-3.5 rounded-full border border-[#68BA7F]/15">
          <div className="w-7 h-7 rounded-full bg-[#C6EFCE] border border-[#68BA7F]/30 flex items-center justify-center overflow-hidden shadow-sm">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-3.5 h-3.5 text-[#1E4D2B]" />
            )}
          </div>
          <span className="hidden sm:inline-block font-semibold text-xs tracking-wide text-[#1E4D2B]">
            {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Researcher'}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 text-[#434842] hover:text-[#002206] rounded-full hover:bg-[#C6EFCE]/40 active:scale-95 transition-all"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
