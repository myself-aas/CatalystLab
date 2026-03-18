'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Bookmark, 
  Repeat, 
  MoreHorizontal, 
  FileText, 
  Share2,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

import Image from 'next/image';

export function PostCard({ post }: { post: any }) {
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = async () => {
    if (!user) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev: number) => newLiked ? prev + 1 : prev - 1);
    
    try {
      const likeId = `${user.uid}_${post.id}`;
      const likeRef = doc(db, 'post_likes', likeId);
      if (newLiked) {
        await setDoc(likeRef, { user_id: user.uid, post_id: post.id, created_at: new Date() });
      } else {
        await deleteDoc(likeRef);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    
    try {
      const bookmarkId = `${user.uid}_${post.id}`;
      const bookmarkRef = doc(db, 'post_bookmarks', bookmarkId);
      if (newBookmarked) {
        await setDoc(bookmarkRef, { user_id: user.uid, post_id: post.id, created_at: new Date() });
        toast.success('Post bookmarked');
      } else {
        await deleteDoc(bookmarkRef);
        toast.info('Bookmark removed');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'paper_share': return 'bg-indigo-950/30 text-indigo-300 border-indigo-900/50';
      case 'research_problem': return 'bg-rose-950/30 text-rose-300 border-rose-900/50';
      case 'dataset_share': return 'bg-emerald-950/30 text-emerald-300 border-emerald-900/50';
      case 'insight': return 'bg-cyan-950/30 text-cyan-300 border-cyan-900/50';
      case 'question': return 'bg-amber-950/30 text-amber-300 border-amber-900/50';
      case 'collaboration_request': return 'bg-violet-950/30 text-violet-300 border-violet-900/50';
      default: return 'bg-slate-900/30 text-slate-400 border-slate-800/50';
    }
  };

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4 md:p-6 mb-4 hover:border-[var(--border-default)] transition-all group shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author?.username}`} className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex-shrink-0 relative">
            {post.author?.avatar_url ? (
              <Image 
                src={post.author.avatar_url} 
                alt="Avatar" 
                fill 
                className="object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                {post.author?.username?.[0] || 'U'}
              </div>
            )}
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${post.author?.username}`} className="font-bold text-[var(--text-primary)] text-[14px] hover:underline">
                {post.author?.full_name || post.author?.username}
              </Link>
              <span className="text-[13px] text-[var(--text-tertiary)]">@{post.author?.username}</span>
              {post.author?.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
              <span className="text-[10px] bg-[var(--bg-sunken)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)] font-mono uppercase tracking-wider">
                {post.author?.position || 'Researcher'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-[var(--text-tertiary)]">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-widest",
                getPostTypeColor(post.post_type)
              )}>
                {post.post_type?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 hover:bg-[var(--bg-hover)] rounded-full transition-all">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4 text-[14px] md:text-[15px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag: string) => (
            <Link 
              key={tag} 
              href={`/topic/${encodeURIComponent(tag)}`}
              className="text-[12px] text-[var(--accent)] hover:underline font-medium"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {post.paper && (
        <Link 
          href={`/paper/${post.paper.id}`}
          className="mb-4 border border-[var(--border-subtle)] rounded-[var(--r-lg)] p-4 flex gap-4 bg-[var(--bg-sunken)] hover:border-[var(--accent)] transition-all group/paper"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)]/10 flex items-center justify-center flex-shrink-0 border border-[var(--accent-glow)]/20">
            <FileText className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[14px] font-bold text-[var(--text-primary)] line-clamp-1 group-hover/paper:text-[var(--accent)] transition-colors">
                {post.paper.title}
              </h4>
              <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)]" />
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] line-clamp-1 mb-2">{post.paper.authors?.join(', ')}</p>
            <div className="flex items-center gap-3 text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-wider">
              <span>{post.paper.year}</span>
              <span>·</span>
              <span>{post.paper.journal || post.paper.source}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> {post.paper.citation_count} Citations
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--border-faint)]">
        <button className="flex items-center gap-2 text-[13px] text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span>{post.replies_count || 0}</span>
        </button>
        <button className="flex items-center gap-2 text-[13px] text-[var(--text-tertiary)] hover:text-emerald-400 transition-colors">
          <Repeat className="w-4 h-4" />
          <span>{post.reposts_count || 0}</span>
        </button>
        <button 
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 text-[13px] transition-colors",
            liked ? "text-rose-500" : "text-[var(--text-tertiary)] hover:text-rose-500"
          )}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          <span>{likesCount}</span>
        </button>
        <button 
          onClick={handleBookmark}
          className={cn(
            "flex items-center gap-2 text-[13px] transition-colors ml-auto",
            bookmarked ? "text-amber-500" : "text-[var(--text-tertiary)] hover:text-amber-500"
          )}
        >
          <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
        </button>
        <button className="flex items-center gap-2 text-[13px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
