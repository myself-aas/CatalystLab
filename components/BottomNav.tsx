'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, LayoutDashboard, Beaker, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';

const TABS = [
  { id: 'feed', name: 'Feed', href: '/feed', icon: MessageSquare },
  { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'instruments', name: 'Instruments', href: '/instruments', icon: Beaker },
  { id: 'profile', name: 'Profile', href: '/user', icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-1 p-1.5 bg-[#FAFDF6]/95 backdrop-blur-xl border border-[#68BA7F]/20 rounded-full shadow-[0_8px_32px_rgba(30,77,43,0.12)]">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative flex items-center justify-center h-14 transition-all duration-300 rounded-full ${
                isActive ? 'w-24 text-white' : 'w-14 text-[#434842] hover:bg-[#E5F3E9]/50'
              }`}
              title={tab.name}
            >
              {isActive && (
                <motion.div
                  layoutId="m3-bottom-nav-active-pill"
                  className="absolute inset-0 bg-[#2E6F40] rounded-full shadow-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center">
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
