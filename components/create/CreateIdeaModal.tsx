'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { updateResearchDNA, updateUserReputation } from '@/lib/reputation';
import { useAuthStore } from '@/stores/authStore';
import { X, Loader2, Save, Zap, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Idea } from '@/lib/types';

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateIdeaModal({ isOpen, onClose }: CreateIdeaModalProps) {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'developing' | 'published' | 'completed'>('developing');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  if (!isOpen || !profile) return null;

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      setErrorDetails('Title and Description are required.');
      return;
    }

    setIsSaving(true);
    setErrorDetails('');

    try {
      const userId = profile.uid || profile.id;
      if (!userId) throw new Error("User identity not found. Please re-login.");

      const newIdea: Partial<Idea> = {
        title: title.trim(),
        description: description.trim(),
        status,
        tags,
        author_id: userId,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await addDoc(collection(db, 'ideas'), newIdea);
      
      await updateUserReputation(userId, 'created_idea', null, 'idea', title);
      await updateResearchDNA(userId, tags);

      await queryClient.invalidateQueries({ queryKey: ['profile-ideas', userId] });
      await queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });

      setTitle('');
      setDescription('');
      setStatus('developing');
      setTags([]);
      onClose();
    } catch (error: any) {
      console.error('Failed to save Idea:', error);
      setErrorDetails(error.message || 'Failed to save Idea');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-faint)] bg-[var(--bg-surface)] shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold">New Research Idea</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto no-scrollbar">
          <AnimatePresence>
            {errorDetails && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl text-[13px] flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorDetails}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-[var(--text-secondary)]">Idea Title</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all font-bold"
              placeholder="e.g. Novel architecture for graph transformers"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-[var(--text-secondary)]">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all min-h-[120px] resize-none"
              placeholder="Flesh out your idea. What's the problem? What's the proposed solution?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[var(--text-secondary)]">Status</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all appearance-none"
              >
                <option value="draft">Draft - Private</option>
                <option value="developing">Developing - Open for feedback</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[var(--text-secondary)]">Tags</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  className="flex-1 bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="e.g. ai, graphs"
                />
                <button 
                  onClick={addTag}
                  className="px-3 py-2 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[13px] font-medium">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-rose-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border-faint)] bg-[var(--bg-surface)] flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-xl text-[14px] font-bold hover:bg-[var(--bg-hover)] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[var(--accent)] text-white text-[14px] font-bold rounded-xl hover:bg-[var(--accent-hover)] transition-all items-center gap-2 inline-flex disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Idea
          </button>
        </div>
      </motion.div>
    </div>
  );
}
