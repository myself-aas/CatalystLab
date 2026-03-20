'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { updateUserReputation } from '@/lib/reputation';
import { useAuthStore } from '@/stores/authStore';
import { X, Search, Loader2, Save, AlertCircle, FileText, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'paper' | 'dataset';
}

export function AddEntityModal({ isOpen, onClose, entityType }: AddEntityModalProps) {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [doi, setDoi] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  
  const [metadata, setMetadata] = useState<any>(null);

  if (!isOpen || !profile) return null;

  const handleFetchDOI = async () => {
    if (!doi.trim()) return;
    setIsFetching(true);
    setErrorDetails('');
    setMetadata(null);

    try {
      // Clean DOI
      const cleanDoi = doi.trim().replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '');
      
      const response = await fetch(`https://api.crossref.org/works/${cleanDoi}`);
      if (!response.ok) {
        throw new Error('DOI not found or Crossref API error');
      }
      
      const data = await response.json();
      const item = data.message;
      
      setMetadata({
        title: item.title?.[0] || 'Unknown Title',
        authors: item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [],
        year: item.published?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
        abstract: item.abstract?.replace(/(<([^>]+)>)/gi, '') || '',
        publisher: item.publisher || '',
        url: item.URL || `https://doi.org/${cleanDoi}`,
        doi: cleanDoi
      });
    } catch (error: any) {
      console.error('Failed to fetch DOI:', error);
      setErrorDetails(error.message || 'Failed to fetch DOI metadata');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    if (!metadata) return;
    setIsSaving(true);
    setErrorDetails('');

    try {
      const collectionName = entityType === 'paper' ? 'papers' : 'datasets';
      
      const userId = profile.uid || profile.id;
      if (!userId) throw new Error("User identity not found. Please re-login.");

      const newEntity = {
        ...metadata,
        author_id: userId, // Who shared it
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await addDoc(collection(db, collectionName), newEntity);
      
      // Update Reputation
      const actionType = entityType === 'paper' ? 'shared_paper' : 'added_dataset';
      await updateUserReputation(userId, actionType as any, null, entityType, metadata.title);

      // Invalidate queries so feed updates instantly
      await queryClient.invalidateQueries({ queryKey: [`profile-${collectionName}`, userId] });
      await queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });

      setDoi('');
      setMetadata(null);
      onClose();
    } catch (error: any) {
      console.error(`Failed to save ${entityType}:`, error);
      setErrorDetails(`Failed to save ${entityType}`);
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
        className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-faint)] bg-[var(--bg-surface)] shrink-0">
          <div className="flex items-center gap-2">
            {entityType === 'paper' ? <FileText className="w-5 h-5 text-indigo-500" /> : <Database className="w-5 h-5 text-emerald-500" />}
            <h2 className="text-lg font-bold capitalize">Add {entityType}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Digital Object Identifier (DOI)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={doi}
                onChange={e => setDoi(e.target.value)}
                placeholder="e.g. 10.1038/s41586-020-2649-2"
                onKeyDown={e => e.key === 'Enter' && handleFetchDOI()}
                className="flex-1 bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all font-mono"
              />
              <button 
                onClick={handleFetchDOI}
                disabled={isFetching || !doi.trim()}
                className="px-6 py-3 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-xl text-[14px] font-bold hover:bg-[var(--bg-hover)] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Fetch
              </button>
            </div>
          </div>

          <AnimatePresence>
            {errorDetails && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 bg-rose-500/10 text-rose-500 rounded-xl text-[13px] flex items-center gap-2 font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {errorDetails}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {metadata && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-4 p-5 bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-black leading-tight">{metadata.title}</h3>
                  <p className="text-[13px] text-[var(--text-tertiary)]">{metadata.authors.join(', ')} • {metadata.year}</p>
                </div>

                {metadata.abstract && (
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border-faint)]">
                    <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Metadata Abstract</h4>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-4">
                      {metadata.abstract}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
            disabled={isSaving || !metadata}
            className="px-6 py-2.5 bg-[var(--accent)] text-white text-[14px] font-bold rounded-xl hover:bg-[var(--accent-hover)] transition-all items-center gap-2 inline-flex disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save {entityType}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
