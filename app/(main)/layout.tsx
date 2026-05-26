'use client';
import React from 'react';
import { AuthProvider, useAuth } from '../../components/AuthProvider';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import CommandPalette from '../../components/CommandPalette';
import { useRouter } from 'next/navigation';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="h-screen flex items-center justify-center bg-[#FAFDF6] text-[#1E4D2B]/70 font-medium">Loading CatalystLab...</div>;

  return (
    <div className="flex h-screen bg-[#FAFDF6] text-[#191E1A] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative bg-white/40">
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
