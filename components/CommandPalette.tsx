'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Beaker, FileBox, LayoutDashboard, BookOpen, Settings, Home, UserCircle, MessageSquare } from 'lucide-react';

const ACTIONS = [
  { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'feed', name: 'Community Feed', href: '/feed', icon: MessageSquare },
  { id: 'instruments', name: 'Instruments', href: '/instruments', icon: Beaker },
  { id: 'discovery', name: 'Literature Search', href: '/dashboard?tab=search', icon: Search },
  { id: 'reviews', name: 'Living Reviews', href: '/reviews', icon: BookOpen },
  { id: 'settings', name: 'Settings', href: '/settings', icon: Settings },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  const filteredActions = query === '' 
    ? ACTIONS 
    : ACTIONS.filter((action) => action.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-[#2E6F40]/30 backdrop-blur-sm px-4">
      <div 
        className="w-full max-w-xl bg-white border border-[#68BA7F]/30 rounded-[1.5rem] shadow-xl overflow-hidden flex flex-col relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#68BA7F]/30 gap-3">
          <Search className="w-5 h-5 text-[#2E6F40]/60" />
          <input 
            type="text" 
            autoFocus 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-[#253D2C] placeholder-slate-400 focus:outline-none text-lg"
          />
          <button 
            onClick={() => setOpen(false)}
            className="text-xs bg-[#CFFFDC]/60 hover:bg-[#CFFFDC] text-[#2E6F40]/70 px-2.5 py-1 rounded-md transition-colors"
          >
            ESC
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-[#2E6F40]/70">
              No results found for "{query}"
            </div>
          ) : (
            filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleSelect(action.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[1.25rem] hover:bg-[#F4F9F5] text-left text-[#2E6F40]/80 hover:text-[#253D2C] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{action.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
      
      {/* Background overlay click handler */}
      <div className="absolute inset-0" onClick={() => setOpen(false)} />
    </div>
  );
}
