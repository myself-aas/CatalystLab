'use client';

import React, { useState } from 'react';
import { PostCard } from './PostCard';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export function Feed() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['feed-posts'],
    queryFn: async () => {
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('created_at', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        
        const postsData = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
          const post = { id: docSnap.id, ...docSnap.data() } as any;
          
          // Fetch author profile
          const authorRef = doc(db, 'users', post.uid);
          const authorSnap = await getDoc(authorRef);
          if (authorSnap.exists()) {
            post.author = authorSnap.data();
          }

          return post;
        }));

        return postsData;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'posts');
      }
    },
    enabled: !!user,
  });

  const postMutation = useMutation({
    mutationFn: async (newPost: any) => {
      try {
        const postsRef = collection(db, 'posts');
        await addDoc(postsRef, {
          ...newPost,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          likes_count: 0,
          replies_count: 0,
          reposts_count: 0,
          bookmarks_count: 0,
          views_count: 0,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'posts');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      setContent('');
      toast.success('Post shared!');
    },
  });

  const handlePost = () => {
    if (!content.trim() || !user) return;
    postMutation.mutate({
      uid: user.uid,
      content: content.trim(),
      post_type: 'insight',
      tags: [],
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Research Feed</h2>
      </div>
      
      {/* Post Input Area */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your research thoughts..."
          className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-lg)] p-3 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] min-h-[80px] focus:outline-none focus:border-[var(--accent)] transition-all resize-none"
        />
        <div className="flex justify-end mt-2">
          <button 
            onClick={handlePost}
            disabled={!content.trim() || postMutation.isPending}
            className="px-6 py-2 bg-[var(--accent)] text-white text-[13px] font-bold rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {postMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post
          </button>
        </div>
      </div>

      {/* Feed content */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-[14px] text-[var(--text-secondary)] italic py-20 text-center">
            No posts yet. Share your research thoughts to start the conversation.
          </div>
        )}
      </div>
    </div>
  );
}
