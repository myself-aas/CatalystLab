'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileRedirect() {
  const { profile, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (profile?.username) {
        router.replace(`/profile/${profile.username}`);
      } else {
        router.replace('/settings');
      }
    }
  }, [profile, isLoading, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-8 h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0.15s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
        <p className="text-[14px] text-[var(--text-tertiary)] animate-pulse">Redirecting to profile...</p>
      </div>
    </div>
  );
}
