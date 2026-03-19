'use client';

import React from 'react';
import Image from 'next/image';
import { 
  MapPin, 
  Link as LinkIcon, 
  Github, 
  Twitter, 
  ExternalLink, 
  Mail, 
  MessageSquare, 
  UserPlus,
  CheckCircle,
  MoreHorizontal
} from 'lucide-react';
import { Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile?: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Cover */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border-b border-[var(--border)] overflow-hidden">
        {profile.cover_url && (
          <Image 
            src={profile.cover_url} 
            alt="Cover" 
            fill
            className="object-cover opacity-50" 
            referrerPolicy="no-referrer" 
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-24 space-y-6">
          {/* Avatar & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="relative inline-block w-32 h-32 sm:w-48 sm:h-48">
              <Image 
                src={profile.avatar_url || `https://picsum.photos/seed/${profile.username}/200/200`} 
                alt={profile.full_name || profile.username} 
                fill
                className="rounded-3xl border-4 border-[var(--bg-base)] bg-[var(--bg-surface)] shadow-2xl object-cover"
                referrerPolicy="no-referrer"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-500 text-white rounded-xl border-4 border-[var(--bg-base)] shadow-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pb-2">
              {isOwnProfile ? (
                <button className="px-6 py-2.5 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-xl text-[14px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all">
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-[14px] font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-xl text-[14px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  <button className="p-2.5 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-lg text-indigo-400 font-bold">@{profile.username}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-[var(--text-tertiary)]">
                {profile.position && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                      {profile.position}
                    </span>
                  </div>
                )}
                {profile.institution && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.institution}</span>
                  </div>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                    <LinkIcon className="w-4 h-4" />
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>

              <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                {profile.bio || "No bio provided yet."}
              </p>

              {profile.research_interests && profile.research_interests.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile.research_interests.map((interest) => (
                    <span key={interest} className="px-3 py-1 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-full text-[12px] font-bold text-[var(--text-secondary)] hover:border-indigo-500/20 transition-all cursor-pointer">
                      #{interest}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex items-center lg:justify-end gap-8">
              <div className="text-center">
                <p className="text-2xl font-black text-[var(--text-primary)]">{profile.followers_count}</p>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-[var(--text-primary)]">{profile.following_count}</p>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Following</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-[var(--text-primary)]">{profile.posts_count}</p>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Posts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
