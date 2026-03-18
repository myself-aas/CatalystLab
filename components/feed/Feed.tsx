'use client';

import React from 'react';
import { PostCard } from './PostCard';

export function Feed() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Research Feed</h2>
      </div>
      
      {/* Post Input Area */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <textarea 
          placeholder="Share your research thoughts..."
          className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-lg)] p-3 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] min-h-[80px] focus:outline-none focus:border-[var(--accent)] transition-all resize-none"
        />
        <div className="flex justify-end mt-2">
          <button className="px-4 py-2 bg-[var(--accent)] text-white text-[13px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all">
            Post
          </button>
        </div>
      </div>

      {/* Feed content will go here */}
      <div className="text-[14px] text-[var(--text-secondary)] italic">No posts yet. Share your research thoughts to start the conversation.</div>
    </div>
  );
}
