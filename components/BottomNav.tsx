'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Beaker, Search, FileBox, MessageSquare } from 'lucide-react';

const ITEMS = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Feed', href: '/feed', icon: MessageSquare },
  { name: 'Tools', href: '/instruments', icon: Beaker },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Sessions', href: '/reports', icon: FileBox },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden border-t border-[#68BA7F]/20 bg-[#f3f6f1]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] selection:bg-transparent">
      <div className="flex items-center justify-around h-16 px-2">
        {ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 w-full h-full group pb-1 cursor-pointer"
            >
              {/* Active state indicator pill */}
              <div
                className={`h-7 w-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#C6EFCE] text-[#002206]'
                    : 'text-[#434842] group-hover:bg-[#E0E4DB]/50'
                }`}
              >
                <Icon className="w-5 h-5 transition-transform duration-200 group-active:scale-90" />
              </div>
              <span
                className={`text-[10px] tracking-wide font-medium transition-colors ${
                  isActive ? 'text-[#1E4D2B] font-bold' : 'text-[#434842]/80'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

