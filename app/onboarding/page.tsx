'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, profile, fetchProfile } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    position: '',
    research_interests: [] as string[],
  });
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (profile?.username && profile?.full_name) {
      // If already onboarded, go to feed
      router.push('/feed');
    }
  }, [user, profile, router]);

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      e.preventDefault();
      if (!formData.research_interests.includes(interestInput.trim())) {
        setFormData(prev => ({
          ...prev,
          research_interests: [...prev.research_interests, interestInput.trim()]
        }));
      }
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      research_interests: prev.research_interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const docRef = doc(db, 'profiles', user.uid);
      await updateDoc(docRef, {
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        position: formData.position,
        research_interests: formData.research_interests,
        updated_at: serverTimestamp(),
      });
      
      await fetchProfile(user.uid);
      router.push('/feed');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Username might be taken.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Welcome to Catalyst</h1>
        <p className="text-[var(--text-secondary)] mb-8">Let&apos;s set up your researcher profile.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-md)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="Dr. Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Username</label>
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-md)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="janedoe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Position</label>
            <select 
              required
              value={formData.position}
              onChange={e => setFormData({...formData, position: e.target.value})}
              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-md)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">Select your role...</option>
              <option value="Professor">Professor</option>
              <option value="Researcher">Researcher</option>
              <option value="Postdoc">Postdoc</option>
              <option value="PhD Student">PhD Student</option>
              <option value="Student">Student</option>
              <option value="Engineer">Engineer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Bio</label>
            <textarea 
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-md)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] min-h-[100px]"
              placeholder="Briefly describe your research focus..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Research Interests</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.research_interests.map(interest => (
                <span key={interest} className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--bg-active)] text-[var(--text-primary)] rounded-full text-sm">
                  {interest}
                  <button type="button" onClick={() => removeInterest(interest)} className="hover:text-red-400">&times;</button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              value={interestInput}
              onChange={e => setInterestInput(e.target.value)}
              onKeyDown={handleAddInterest}
              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-md)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              placeholder="Type an interest and press Enter (e.g., Machine Learning)"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white rounded-[var(--r-md)] py-3 font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
}
