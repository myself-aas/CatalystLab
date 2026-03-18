'use client';
import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';

export function MobileNavWrapper() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return null;

  return user ? <BottomNav /> : <MobileHeader />;
}
