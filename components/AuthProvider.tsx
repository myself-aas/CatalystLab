'use client';

import React, { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, fetchProfile } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        useAuthStore.setState({ profile: null });
      }
      useAuthStore.setState({ isLoading: false });
    });

    return () => {
      unsubscribe();
    };
  }, [setUser, fetchProfile]);

  return <>{children}</>;
}
