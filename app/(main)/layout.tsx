'use client';

import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { BottomNav } from '@/components/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0c0c0f] overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main id="main-content" className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
