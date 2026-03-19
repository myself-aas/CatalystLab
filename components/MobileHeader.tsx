'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-base)]/95 backdrop-blur-xl border-b border-[var(--border-faint)] px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-[1.5px] border-[var(--text-primary)] rounded-full flex items-center justify-center relative">
            <div className="w-1 h-1 bg-[var(--text-primary)] rounded-full" />
          </div>
          <span className="text-[16px] font-medium text-[var(--text-primary)]">CatalystLab</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="px-4 py-2 bg-[var(--accent)] text-white text-[13px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all">
            Get started free
          </Link>
          <button 
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-[var(--bg-base)] border-b border-[var(--border-faint)] p-6 flex flex-col gap-6 z-40">
          <Link href="#features" onClick={() => setIsOpen(false)} className="text-[16px] font-medium text-[var(--text-primary)]">Features</Link>
          <Link href="#instruments" onClick={() => setIsOpen(false)} className="text-[16px] font-medium text-[var(--text-primary)]">Instruments</Link>
          <Link href="#about" onClick={() => setIsOpen(false)} className="text-[16px] font-medium text-[var(--text-primary)]">About</Link>
        </div>
      )}
    </>
  );
}
