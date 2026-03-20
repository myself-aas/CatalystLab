'use client';

import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OAuthConsentPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 bg-[var(--rose-muted)] text-[var(--rose)] rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">OAuth Under Maintenance</h1>
          <p className="text-[14px] text-[var(--text-tertiary)]">
            The OAuth authorization service is currently undergoing migration to our new infrastructure. 
            Please check back soon.
          </p>
        </div>
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-[var(--r-md)] text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
