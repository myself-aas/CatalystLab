'use client';
import React from 'react';
import { AuthProvider, useAuth } from '../../components/AuthProvider';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import MobileHeader from '../../components/MobileHeader';
import CommandPalette from '../../components/CommandPalette';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user && pathname !== '/blogs') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if ((loading || !user) && pathname !== '/blogs') return <div className="h-screen flex items-center justify-center bg-[#FAFDF6] text-[#1E4D2B]/70 font-medium">Loading CatalystLab...</div>;

  if (!user && pathname === '/blogs') {
    return (
      <div className="min-h-screen bg-[#FAFDF6] text-[#191E1A] flex flex-col">
        {/* Public Header */}
        <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#68BA7F]/30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-[1rem] bg-[#CFFFDC] flex items-center justify-center border border-[#68BA7F]/50 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5 text-[#2E6F40]" />
              </div>
              <span className="font-bold text-lg tracking-tight text-[#253D2C]">CatalystLab</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-[#2E6F40] hover:text-[#253D2C] transition-colors">
                Log in
              </Link>
              <Link href="/login" className="text-sm font-medium bg-[#2E6F40] text-white px-5 py-2.5 rounded-[1.25rem] hover:bg-[#253D2C] transition-all hover:scale-105 active:scale-95 shadow-sm">
                Try for free
              </Link>
            </div>
          </div>
        </header>

        {/* Public Blog Area */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#68BA7F]/15 py-8 text-center text-xs text-[#2E6F40]/60">
          <p>© {new Date().getFullYear()} CatalystLab. All academic rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAFDF6] text-[#191E1A] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative bg-white/40 pb-20 md:pb-8">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
      <CommandPalette />
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
}
