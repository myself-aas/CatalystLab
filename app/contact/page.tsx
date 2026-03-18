'use client';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)]">
      <Sidebar />
      <main className="flex-1 md:ml-[220px] pb-20 md:pb-0">
        <TopBar title="Contact Us" />
        <div className="max-w-3xl mx-auto p-8 text-[var(--text-secondary)] leading-relaxed">
          <h1 className="text-[24px] font-semibold text-[var(--text-primary)] mb-6">Contact Us</h1>
          <p>Have questions? Reach out to us at <a href="mailto:contact@catalystlab.tech" className="text-[var(--accent)] hover:underline">contact@catalystlab.tech</a>.</p>
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
