'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, Target, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CommunityCardProps {
  community: any;
}

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Link href={`/communities/${community.slug}`}>
      <Card className="group p-8 bg-[var(--bg-surface)] border-[var(--border)] rounded-[32px] hover:border-indigo-500/30 transition-all h-full flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            {community.cover_emoji || '🔬'}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
            <Target className="w-3 h-3" /> Problem-Based
          </div>
        </div>

        <h3 className="text-xl font-black uppercase tracking-tight mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
          {community.name}
        </h3>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2 font-medium italic">
          &quot;{community.problem_statement}&quot;
        </p>

        <p className="text-slate-500 text-xs leading-relaxed mb-8 line-clamp-3 flex-grow">
          {community.description || 'No description provided.'}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <Users className="w-3.5 h-3.5" /> {community.members_count || 0} Members
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <MessageSquare className="w-3.5 h-3.5" /> {community.posts_count || 0} Posts
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
}
