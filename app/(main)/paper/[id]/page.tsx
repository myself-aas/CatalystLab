'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PaperDetail } from '@/components/paper/PaperDetail';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PaperPage() {
  const { id } = useParams();
  const paperId = decodeURIComponent(id as string);

  const { data: paper, isLoading, error } = useQuery({
    queryKey: ['paper', paperId],
    queryFn: async () => {
      // First check local cache
      const { data: cached, error: cacheError } = await supabase
        .from('papers')
        .select('*')
        .eq('id', paperId)
        .single();

      if (cached) return cached;

      // If not in cache, we might need to fetch from API (handled in PaperDetail)
      return null;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Error Loading Paper</h1>
        <p className="text-slate-400">We couldn&apos;t find the paper you&apos;re looking for.</p>
      </div>
    );
  }

  return <PaperDetail paperId={paperId} initialData={paper} />;
}
