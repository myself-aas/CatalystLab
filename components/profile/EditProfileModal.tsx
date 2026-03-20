'use client';

import React, { useState, useEffect } from 'react';
import { Profile } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { X, Loader2, Save, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

interface EditProfileModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ profile, isOpen, onClose }: EditProfileModalProps) {
  const queryClient = useQueryClient();
  const { fetchProfile } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    position: profile.position || '',
    institution: profile.institution || '',
    bio: profile.bio || '',
    website: profile.website || '',
    github_username: profile.github_username || '',
    research_interests: profile.research_interests || [],
    skills: profile.skills || [],
  });

  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');

  // Reset form when opened with a new profile
  useEffect(() => {
    if (isOpen) {
      setFormData({
        full_name: profile.full_name || '',
        position: profile.position || '',
        institution: profile.institution || '',
        bio: profile.bio || '',
        website: profile.website || '',
        github_username: profile.github_username || '',
        research_interests: profile.research_interests || [],
        skills: profile.skills || [],
      });
      setSaveMessage(null);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const docRef = doc(db, 'users', profile.id);
      await updateDoc(docRef, {
        ...formData,
        updated_at: new Date().toISOString(),
      });

      // Refetch for the global profile query
      await queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });
      
      // Update global auth store if this is the logged-in user
      await fetchProfile(profile.id);

      setSaveMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.research_interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        research_interests: [...prev.research_interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      research_interests: prev.research_interests.filter(i => i !== interest)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-faint)] bg-[var(--bg-surface)] shrink-0">
          <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-[var(--bg-base)]">
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Basic Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 pt-1">
                <label className="text-[12px] font-bold text-[var(--text-secondary)]">Full Name</label>
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="e.g. Dr. Jane Doe"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[12px] font-bold text-[var(--text-secondary)]">Current Position</label>
                <input 
                  type="text" 
                  value={formData.position}
                  onChange={e => setFormData({...formData, position: e.target.value})}
                  className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="e.g. Postdoctoral Researcher"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2 pt-1">
                <label className="text-[12px] font-bold text-[var(--text-secondary)]">Institution</label>
                <input 
                  type="text" 
                  value={formData.institution}
                  onChange={e => setFormData({...formData, institution: e.target.value})}
                  className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="e.g. Stanford University"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2 pt-1">
                <label className="text-[12px] font-bold text-[var(--text-secondary)]">Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all min-h-[100px] resize-none"
                  placeholder="Tell others about your research and background..."
                />
              </div>
            </div>
          </section>

          <hr className="border-[var(--border-faint)]" />

          {/* Specializations & DNA */}
          <section className="space-y-6">
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Research DNA</h3>
            
            <div className="space-y-3">
              <label className="text-[12px] font-bold text-[var(--text-secondary)]">Research Interests (Tags)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.research_interests.map(interest => (
                  <span key={interest} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[13px] font-medium">
                    {interest}
                    <button 
                      onClick={() => removeInterest(interest)}
                      className="hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newInterest}
                  onChange={e => setNewInterest(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                  className="flex-1 bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="Add a new interest (e.g. Deep Learning) & press Enter"
                />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    addInterest();
                  }}
                  className="px-4 py-2.5 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[12px] font-bold text-[var(--text-secondary)]">Technical Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[13px] font-medium">
                    {skill}
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1 bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="Add a new skill (e.g. PyTorch) & press Enter"
                />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    addSkill();
                  }}
                  className="px-4 py-2.5 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

          <hr className="border-[var(--border-faint)]" />

          {/* Links */}
          <section className="space-y-4">
            <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">External Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 pt-1">
                <label className="text-[12px] font-bold text-[var(--text-secondary)]">Personal Website</label>
                <input 
                  type="url" 
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[12px] font-bold text-[var(--text-secondary)]">GitHub Username</label>
                <input 
                  type="text" 
                  value={formData.github_username}
                  onChange={e => setFormData({...formData, github_username: e.target.value})}
                  className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="username"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-[var(--border-faint)] bg-[var(--bg-surface)] flex items-center justify-between shrink-0">
          <div className="flex-1">
            <AnimatePresence>
              {saveMessage && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-[13px] font-bold flex items-center gap-1.5 ${saveMessage.type === "success" ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {saveMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {saveMessage.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-xl text-[14px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[var(--accent)] text-white text-[14px] font-bold rounded-xl hover:bg-[var(--accent-hover)] transition-all uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
