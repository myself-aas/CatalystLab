'use client';

import React from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { CommunityCard } from '@/components/community/CommunityCard';
import { Plus, Loader2, Target, Globe, Users } from 'lucide-react';
import Link from 'next/link';

export default function CommunitiesPage() {
  const { user } = useUser();

  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          members:community_members(user_id)
        `)
        .order('members_count', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const myCommunities = communities?.filter(c => 
    c.members.some((m: any) => m.user_id === user?.id)
  ) || [];
  
  const otherCommunities = communities?.filter(c => 
    !c.members.some((m: any) => m.user_id === user?.id)
  ) || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Communities</h1>
          <p className="text-slate-400">Join problem-focused research groups.</p>
        </div>
        <Link 
          href="/communities/new"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Start Community
        </Link>
      </div>

      {myCommunities.length > 0 && (
        <section className="mb-16">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> My Communities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCommunities.map(community => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" /> Explore Communities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherCommunities.map(community => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </section>
    </div>
  );
}
