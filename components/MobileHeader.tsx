'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-base)]/95 backdrop-blur-xl border-b border-[var(--border-faint)] px-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 border-[1.5px] border-[var(--text-primary)] rounded-full flex items-center justify-center relative">
          <div className="w-1 h-1 bg-[var(--text-primary)] rounded-full" />
        </div>
        <span className="text-[16px] font-medium text-[var(--text-primary)]">CatalystLab</span>
      </div>

      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-[var(--text-secondary)]">
        {isOpen ? <X className="w-6 h-6" /> : <MoreHorizontal className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-[var(--bg-elevated)] border-b border-[var(--border-faint)] p-4 flex flex-col gap-4 shadow-xl"
          >
            <Link href="/pricing" className="text-[15px] text-[var(--text-primary)] py-2" onClick={() => setIsOpen(false)}>Pricing</Link>
            <Link href="/instruments" className="text-[15px] text-[var(--text-primary)] py-2" onClick={() => setIsOpen(false)}>Instruments</Link>
            <div className="h-px bg-[var(--border-faint)]" />
            <Link href="/login" className="text-[15px] text-[var(--accent)] font-medium py-2" onClick={() => setIsOpen(false)}>Sign in / Sign up</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
