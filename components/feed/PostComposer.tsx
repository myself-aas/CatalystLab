'use client';

import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  Hash, 
  Globe, 
  Users, 
  Loader2,
  X,
  Send
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';

export function PostComposer({ onPostCreated }: { onPostCreated?: () => void }) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [postType, setPostType] = useState('thought');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showTags, setShowTags] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePost = async () => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        author_id: user.uid,
        content: content.trim(),
        post_type: postType,
        tags: tags,
        created_at: serverTimestamp()
      });

      setContent('');
      setTags([]);
      setPostType('thought');
      toast.success('Post shared successfully!');
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to share post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const enhancePost = async () => {
    if (!content.trim()) return;

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: content })
      });

      if (!response.ok) throw new Error('Failed to enhance post');

      const data = await response.json();
      setContent(data.enhancedText);
      if (data.suggestedTags) {
        setTags(Array.from(new Set([...tags, ...data.suggestedTags])));
      }
      toast.success('Post enhanced by AI!');
    } catch (error) {
      console.error('Error enhancing post:', error);
      toast.error('Failed to enhance post. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4 shadow-sm mb-6">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex-shrink-0 relative">
          {user?.user_metadata?.avatar_url ? (
            <Image 
              src={user.user_metadata.avatar_url} 
              alt="Avatar" 
              fill 
              className="object-cover" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col gap-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a research thought, question, or insight..."
            className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none min-h-[100px]"
          />

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-0.5 bg-[var(--accent-glow)]/10 text-[var(--accent)] text-[11px] font-bold rounded-full border border-[var(--accent-glow)]/20 flex items-center gap-1"
                >
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--border-faint)]">
            <div className="flex items-center gap-1">
              <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]/10 rounded-full transition-all" title="Add Image">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]/10 rounded-full transition-all" title="Attach Paper">
                <FileText className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowTags(!showTags)}
                className={cn(
                  "p-2 rounded-full transition-all",
                  showTags ? "text-[var(--accent)] bg-[var(--accent-glow)]/10" : "text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]/10"
                )} 
                title="Add Tags"
              >
                <Hash className="w-5 h-5" />
              </button>
              <button 
                onClick={enhancePost}
                disabled={!content.trim() || isEnhancing}
                className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]/10 rounded-full transition-all disabled:opacity-50" 
                title="AI Enhance"
              >
                {isEnhancing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
              
              <select 
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="ml-2 bg-[var(--bg-sunken)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px] font-bold rounded-full px-3 py-1 focus:outline-none focus:border-[var(--accent)] transition-all uppercase tracking-wider"
              >
                <option value="thought">Thought</option>
                <option value="paper_share">Paper Share</option>
                <option value="question">Question</option>
                <option value="insight">Insight</option>
                <option value="research_problem">Problem</option>
                <option value="dataset_share">Dataset</option>
                <option value="collaboration_request">Collab</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[11px] font-mono",
                content.length > 450 ? "text-red-500" : "text-[var(--text-tertiary)]"
              )}>
                {content.length}/500
              </span>
              <button
                onClick={handlePost}
                disabled={!content.trim() || isSubmitting || content.length > 500}
                className="flex items-center gap-2 px-5 py-2 bg-[var(--accent)] text-white text-sm font-bold rounded-full hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all shadow-lg shadow-[var(--accent-glow)]/20"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Share
              </button>
            </div>
          </div>

          {showTags && (
            <div className="mt-3 pt-3 border-t border-[var(--border-faint)]">
              <input 
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={addTag}
                placeholder="Add a tag and press Enter..."
                className="w-full bg-[var(--bg-sunken)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
