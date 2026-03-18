'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { Feed } from '@/components/feed/Feed';
import { Sidebar } from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#090910] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] transition-all duration-300 pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          <Feed />
        </div>
      </main>
    </div>
  );
}
