'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, Users, Globe, Lock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ReadingListCardProps {
  list: any;
}

export function ReadingListCard({ list }: ReadingListCardProps) {
  return (
    <Link href={`/lists/${list.id}`}>
      <Card className="group p-8 bg-[var(--bg-surface)] border-[var(--border)] rounded-[32px] hover:border-indigo-500/30 transition-all h-full flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            {list.cover_emoji || '📚'}
          </div>
          <div className="flex items-center gap-2">
            {list.is_public ? (
              <Globe className="w-4 h-4 text-slate-500" />
            ) : (
              <Lock className="w-4 h-4 text-slate-500" />
            )}
            {list.is_collaborative && (
              <Users className="w-4 h-4 text-indigo-400" />
            )}
          </div>
        </div>

        <h3 className="text-xl font-black uppercase tracking-tight mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
          {list.title}
        </h3>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 flex-grow">
          {list.description || 'No description provided.'}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <BookOpen className="w-3.5 h-3.5" /> {list.papers_count || 0} Papers
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <Users className="w-3.5 h-3.5" /> {list.followers_count || 0} Followers
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
}
