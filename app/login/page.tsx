'use client';

import React, { useState, Suspense } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create profile in Firestore
        const profilePath = `users/${user.uid}`;
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            full_name: email.split('@')[0],
            username: email.split('@')[0],
            created_at: new Date(),
            tokens_remaining: 50000,
            tokens_total: 50000,
            tokens_reset_at: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, profilePath);
        }

        router.push(redirectTo);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists, if not create it
      const profilePath = `users/${user.uid}`;
      let docSnap;
      try {
        const docRef = doc(db, 'users', user.uid);
        docSnap = await getDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, profilePath);
      }

      const profileData = {
        id: user.uid,
        uid: user.uid,
        full_name: user.displayName || user.email?.split('@')[0] || 'User',
        username: user.email?.split('@')[0] || user.uid.substring(0, 8),
        avatar_url: user.photoURL ? user.photoURL.replace(/=s\d+(-c)?$/, '=s1024-c') : null,
        updated_at: new Date().toISOString(),
      };

      try {
        const docRef = doc(db, 'users', user.uid);
        if (docSnap && !docSnap.exists()) {
          // New user: set full profile
          await setDoc(docRef, {
            ...profileData,
            created_at: new Date(),
            tokens_remaining: 50000,
            tokens_total: 50000,
            tokens_reset_at: new Date().toISOString()
          });
        } else {
          // Existing user: just update profile info (name, avatar, etc.)
          await setDoc(docRef, profileData, { merge: true });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, profilePath);
      }

      router.push(redirectTo);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed the popup, this is normal behavior, don't show an error
        return;
      }
      console.error('Google Login Exception:', err);
      setError(err.message || 'An error occurred during Google authentication.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 border-[1.5px] border-[var(--text-primary)] rounded-full opacity-50" />
            <div className="absolute inset-0 border-[1.5px] border-[var(--text-primary)] rounded-full translate-x-1 opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--text-primary)] rounded-full" />
          </div>
          <span className="font-medium text-[var(--text-primary)] text-[20px]">Catalyst<span className="font-normal">Lab</span></span>
        </div>

        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 text-center">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-[var(--r-md)] text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-md)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-md)] px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white rounded-[var(--r-md)] py-2 font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-[var(--text-tertiary)]">
          <div className="flex-1 h-px bg-[var(--border-faint)]" />
          <span className="px-4">OR</span>
          <div className="flex-1 h-px bg-[var(--border-faint)]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="mt-6 w-full bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--r-md)] py-2 font-medium hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[var(--accent)] hover:underline font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
