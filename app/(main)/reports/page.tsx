'use client';
import React from 'react';
import { FileBox } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileBox className="w-8 h-8 text-[#2E6F40]" />
        <h1 className="text-3xl font-bold tracking-tight text-[#253D2C]">Saved Sessions</h1>
      </div>
      <p className="text-[#2E6F40]/80">Your historical brainstorms, hypotheses, and discovered literature.</p>
      
      <div className="p-8 rounded-[1.5rem] bg-[#F4F9F5] border border-dashed border-[#68BA7F]/40 text-center text-[#2E6F40]/70 mt-12 shadow-lg">
        We are building the session list view. Sessions are auto-saved to Firestore.
      </div>
    </div>
  );
}
