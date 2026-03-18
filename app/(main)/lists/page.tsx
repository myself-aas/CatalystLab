'use client';

import React from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { ReadingListCard } from '@/components/lists/ReadingListCard';
import { Plus, Loader2, BookOpen, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ReadingListsPage() {
  const { user } = useUser();

  const { data: lists, isLoading } = useQuery({
    queryKey: ['reading-lists', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_lists')
        .select(`
          *,
          owner:profiles!owner_id(username, full_name, avatar_url),
          collaborators:reading_list_collaborators(user_id)
        `)
        .or(`owner_id.eq.${user?.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const myLists = lists?.filter(l => l.owner_id === user?.id) || [];
  const publicLists = lists?.filter(l => l.owner_id !== user?.id) || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Reading Lists</h1>
          <p className="text-slate-400">Curate and share academic knowledge.</p>
        </div>
        <Link 
          href="/lists/new"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Create List
        </Link>
      </div>

      <section className="mb-16">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5" /> My Lists
        </h2>
        {myLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myLists.map(list => (
              <ReadingListCard key={list.id} list={list} />
            ))}
          </div>
        ) : (
          <div className="p-12 border-2 border-dashed border-white/5 rounded-[40px] text-center">
            <p className="text-slate-500 mb-6">You haven&apos;t created any reading lists yet.</p>
            <Link 
              href="/lists/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
            >
              Create your first list
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" /> Featured Lists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicLists.map(list => (
            <ReadingListCard key={list.id} list={list} />
          ))}
        </div>
      </section>
    </div>
  );
}
