'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { updateResearchDNA, updateUserReputation } from '@/lib/reputation';
import { useAuthStore } from '@/stores/authStore';
import { X, Loader2, Sparkles, Send, AlertCircle, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Post } from '@/lib/types';

interface CreateMicroPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMicroPostModal({ isOpen, onClose }: CreateMicroPostModalProps) {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  if (!isOpen || !profile) return null;

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isOverLimit = wordCount > 80;

  const handleEnhance = async () => {
    if (!content.trim()) return;
    setIsEnhancing(true);
    setErrorDetails('');
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error("Please log in to use AI enhancement");

      const idToken = await user.getIdToken();
      const response = await fetch('/api/enhance-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ draft: content })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'INSUFFICIENT_TOKENS') {
          throw new Error("Insufficient tokens! Your daily limit has been reached.");
        }
        throw new Error(data.error || "AI Enhancement failed");
      }

      if (data.enhancedText) {
        setContent(data.enhancedText);
      } else if (data.text) {
        setContent(data.text);
      } else if (typeof data === 'string') {
        setContent(data);
      }
    } catch (error: any) {
      console.error("AI Enhancement failed:", error);
      setErrorDetails(error.message || "Failed to connect to AI");
    } finally {
      setIsEnhancing(false);
    }
  };

  const extractHashtags = (text: string) => {
    const match = text.match(/#[\p{L}0-9_]+/gu);
    return match ? match.map(tag => tag.slice(1)) : [];
  };

  const handleSubmit = async () => {
    if (!content.trim() || isOverLimit) return;
    setIsSubmitting(true);
    setErrorDetails('');

    try {
      const tags = extractHashtags(content);
      
      const userId = profile.uid || profile.id;
      if (!userId) throw new Error("User identity not found. Please re-login.");

      const newPost: Partial<Post> = {
        author_id: userId,
        content: content,
        post_type: 'insight',
        tags: tags,
        likes_count: 0,
        replies_count: 0,
        reposts_count: 0,
        bookmarks_count: 0,
        views_count: 0,
        is_pinned: false,
        ai_enhanced: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to global posts collection
      await addDoc(collection(db, 'posts'), newPost);
      
      // Update Reputation & DNA (under 50KB footprint)
      await updateUserReputation(userId, 'created_post', null, 'post', content);
      await updateResearchDNA(userId, tags);

      // Invalidate queries so feed updates instantly
      await queryClient.invalidateQueries({ queryKey: ['profile-posts', profile.id] });
      await queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });

      setContent('');
      onClose();
    } catch (error: any) {
      console.error("Post creation failed:", error);
      setErrorDetails(error.message || "Failed to post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-faint)]">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-lg font-bold">New Micro Post</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share a quick thought, finding, or keyword... (max 80 words)"
              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl p-4 text-[15px] focus:outline-none focus:border-[var(--accent)] transition-all min-h-[140px] resize-none"
            />
            <div className={`absolute bottom-3 right-4 text-[12px] font-bold ${isOverLimit ? 'text-rose-500' : 'text-[var(--text-tertiary)]'}`}>
              {wordCount} / 80 words
            </div>
          </div>

          <AnimatePresence>
            {errorDetails && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-[13px] flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorDetails}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleEnhance}
              disabled={isEnhancing || !content.trim()}
              className="px-4 py-2 bg-indigo-500/10 text-indigo-400 font-bold text-[13px] rounded-lg hover:bg-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Enhance with AI
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim() || isOverLimit}
              className="px-6 py-2 bg-[var(--accent)] text-white font-bold text-[13px] rounded-lg hover:bg-[var(--accent-hover)] transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
