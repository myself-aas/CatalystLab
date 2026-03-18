import React from 'react';
import { getPaperById } from '@/lib/research-api';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { PaperDetail } from '@/components/paper/PaperDetail';
import { notFound } from 'next/navigation';

export default async function PaperPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params;
  const paperId = id.map(decodeURIComponent).join('/');
  
  const paper = await getPaperById(paperId);
  
  if (!paper) {
    return notFound();
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)]">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] pb-20 md:pb-0">
        <TopBar title="Paper Details" />
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <PaperDetail paperId={paperId} initialData={paper} />
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
