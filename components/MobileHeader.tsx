'use client';
import React from 'react';
import Link from 'next/link';

export function MobileHeader() {
  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-base)]/95 backdrop-blur-xl border-b border-[var(--border-faint)] px-4 flex items-center justify-between z-50">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-5 h-5 sm:w-6 sm:h-6 border-[1.5px] border-[var(--text-primary)] rounded-full flex items-center justify-center relative">
            <div className="w-1 h-1 bg-[var(--text-primary)] rounded-full" />
          </div>
          <div className="flex items-baseline gap-[1px]">
            <span className="text-[15px] sm:text-[16px] font-medium text-[var(--text-primary)]">Catalyst</span>
            <span className="text-[15px] sm:text-[16px] font-normal text-[var(--text-primary)]">Lab</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Sign in</Link>
          <Link href="/login" className="px-4 py-2 sm:px-5 sm:py-2 bg-[var(--accent)] text-white text-[13px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all whitespace-nowrap">
            Get started free
          </Link>
        </div>
      </header>
    </>
  );
}
