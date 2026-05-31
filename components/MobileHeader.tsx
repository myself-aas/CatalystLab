'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Beaker, 
  BookOpen, 
  Settings, 
  UserCircle, 
  LogOut, 
  BrainCircuit, 
  ChevronRight,
  Sparkles,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, desc: 'Central research command' },
  { name: 'Feed', href: '/feed', icon: MessageSquare, desc: 'Academic dialogue' },
  { name: 'Instruments', href: '/instruments', icon: Beaker, desc: '21 specialized AI tools' },
  { name: 'Reviews', href: '/reviews', icon: BookOpen, desc: 'Dynamic syntheses' },
  { name: 'Account', href: '/user', icon: UserCircle, desc: 'My research profile' },
];

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Prevent background scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut(auth);
    router.push('/');
  };

  const triggerCmdK = () => {
    setIsOpen(false);
    // Dispatch Cmd+K event
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <>
      {/* Top sticky bar for mobile only */}
      <header className="md:hidden sticky top-0 left-0 right-0 h-16 bg-[#FAFDF6]/90 backdrop-blur-md border-b border-[#68BA7F]/20 px-4 flex items-center justify-between z-40 select-none">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#C6EFCE] text-[#002206] flex items-center justify-center border border-[#68BA7F]/30 shadow-sm">
            <BrainCircuit className="w-5 h-5 text-[#1E4D2B]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-[#253D2C]">CatalystLab</span>
            <span className="text-[9px] font-mono font-medium text-[#2E6F40]/70 uppercase tracking-widest -mt-0.5">Academic Portal</span>
          </div>
        </Link>

        {/* Decorative active indicator */}
        <div className="flex items-center gap-3">
          {/* Quick Command Trigger */}
          <button 
            onClick={triggerCmdK}
            className="p-2 rounded-xl bg-white border border-[#68BA7F]/15 hover:bg-[#FAFDF6] transition-all text-[#2E6F40] shadow-sm cursor-pointer flex items-center justify-center"
            title="Search command"
          >
            <Command className="w-4 h-4" />
          </button>

          {/* Interactive Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-10 h-10 rounded-xl bg-white border border-[#68BA7F]/15 text-[#253D2C] hover:bg-[#FAFDF6] active:scale-95 transition-all shadow-sm flex flex-col items-center justify-center gap-[4px] cursor-pointer ${
              isOpen ? 'fixed top-3 right-4 z-[10000]' : 'relative z-50'
            }`}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-5 h-[2px] bg-[#2E6F40] rounded-full origin-center"
            />
            <motion.span
              animate={isOpen ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="w-5 h-[2px] bg-[#2E6F40] rounded-full origin-center"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-5 h-[2px] bg-[#2E6F40] rounded-full origin-center"
            />
          </button>
        </div>
      </header>

      {/* Expressive Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop blur with fade effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/25 backdrop-blur-md z-[9990]"
            />

            {/* Sliding cabinet menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="md:hidden fixed right-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-[#FAFDF6] border-l border-[#68BA7F]/25 shadow-2xl z-[9995] flex flex-col overflow-hidden"
            >
              {/* Top Spacing to account for absolute components */}
              <div className="h-16 border-b border-[#68BA7F]/10 flex items-center px-6 bg-white/40">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#2E6F40]/75 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Navigation Command
                </span>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto subtle-scrollbar p-6 flex flex-col justify-between">
                <div>
                  {/* Profile Status Card */}
                  <div className="p-4 rounded-2xl bg-white border border-[#68BA7F]/20 shadow-sm flex items-center gap-3.5 mb-6">
                    <div className="relative">
                      {user?.photoURL ? (
                        <div className="w-12 h-12 rounded-[1.25rem] overflow-hidden border border-[#68BA7F]/30 shadow-inner">
                          <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-[1.25rem] bg-[#C6EFCE] flex items-center justify-center border border-[#68BA7F]/30">
                          <UserCircle className="w-6 h-6 text-[#1E4D2B]" />
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#68BA7F] border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#253D2C] truncate">
                        {user?.displayName || 'Academic Searcher'}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono truncate">
                        {user?.email || 'researcher@catalyst.edu'}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Destinations */}
                  <div className="space-y-1.5">
                    {NAV_ITEMS.map((item, index) => {
                      const isActive = pathname.startsWith(item.href);
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 + 0.1 }}
                        >
                          <Link
                            href={item.href}
                            className={`flex items-center justify-between p-3.5 rounded-[1.25rem] border transition-all ${
                              isActive
                                ? 'bg-[#C6EFCE] border-[#68BA7F]/30 text-[#002206] shadow-sm font-bold scale-[1.01]'
                                : 'bg-white/55 border-transparent text-[#434842] hover:bg-white hover:border-[#68BA7F]/15 hover:text-[#191E1A]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                                isActive ? 'bg-white shadow-sm text-[#1E4D2B]' : 'bg-[#F4F9F5] text-[#2E6F40]'
                              }`}>
                                <Icon className="w-4.5 h-4.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold">{item.name}</span>
                                <span className="text-[9px] text-[#434842]/60 font-medium">{item.desc}</span>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0.5 text-[#1E4D2B]' : 'text-[#434842]/40'}`} />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Section */}
                <div className="border-t border-[#68BA7F]/15 pt-6 mt-8 space-y-4">
                  {/* Secondary Configuration Links */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/settings"
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold border transition-all ${
                        pathname.startsWith('/settings')
                          ? 'bg-[#C6EFCE]/60 border-[#68BA7F]/25 text-[#1E4D2B]'
                          : 'bg-white border-[#68BA7F]/15 hover:bg-white/80 text-[#434842]'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-[#2E6F40]" />
                      Portal Settings
                    </Link>

                    <Link
                      href="/user"
                      className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-xs font-bold border transition-all ${
                        pathname.startsWith('/user')
                          ? 'bg-[#C6EFCE]/60 border-[#68BA7F]/25 text-[#1E4D2B]'
                          : 'bg-white border-[#68BA7F]/15 hover:bg-white/80 text-[#434842]'
                      }`}
                    >
                      <UserCircle className="w-4 h-4 text-[#2E6F40]" />
                      My Profile
                    </Link>
                  </div>

                  {/* Sign Out Trigger */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-red-50 hover:bg-red-100/80 active:scale-[0.98] text-red-700 hover:text-red-800 text-xs font-bold rounded-xl border border-red-200/50 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-red-500" />
                    Sign Out Academic Hub
                  </button>

                  {/* App Version Info */}
                  <div className="text-center font-mono text-[9px] text-[#2E6F40]/50 pt-2 selection:bg-transparent">
                    Academic Catalyst • v0.10.2
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
