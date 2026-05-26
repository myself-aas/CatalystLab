'use client';
import React from 'react';
import { BookOpen } from 'lucide-react';

export default function ReviewsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-[#2E6F40]" />
        <h1 className="text-3xl font-bold tracking-tight text-[#253D2C]">Living Reviews</h1>
      </div>
      <p className="text-[#2E6F40]/80">Literature reviews that update themselves automatically as new papers are published.</p>
      
      <div className="p-8 rounded-[1.5rem] bg-[#F4F9F5] border border-dashed border-[#68BA7F]/40 text-center text-[#2E6F40]/70 mt-12 shadow-lg">
        We are building the Living Reviews module. Create topics and let AI summarize incoming papers passively.
      </div>
    </div>
  );
}
