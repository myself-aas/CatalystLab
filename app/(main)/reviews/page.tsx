'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

export default function ReviewsPage() {
  return (
    <>
      <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <h2 className="text-[20px] md:text-[24px] font-medium text-[var(--text-primary)] mb-1">Living Reviews</h2>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)]">AI-curated literature reviews that update as new research emerges.</p>
          </header>

          <div className="py-20 text-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)]">
            <BookOpen className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4 opacity-20" />
            <h3 className="text-[16px] font-medium text-[var(--text-primary)] mb-2">No reviews yet</h3>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
              Start a new research session to begin building your first living literature review.
            </p>
          </div>
      </div>
    </>
  );
}
