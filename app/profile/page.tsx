'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

export default function ProfileRedirect() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
    } else if (profile?.username) {
      router.push(`/profile/${profile.username}`);
    } else {
      // If user is logged in but profile is not yet loaded or username is missing
      // (though it should be created by trigger)
      // We can fallback to a generic profile page or wait
      // For now, if profile exists but no username, we might have an issue
      // but the trigger should handle it.
      // If profile is null, it might still be loading.
    }
  }, [user, profile, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-base)]">
      <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
    </div>
  );
}
