'use client';
import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Loader2, Github, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import ReCAPTCHA from "react-google-recaptcha";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleError = (err: any) => {
    console.error(err);
    if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user') || err?.code === 'auth/cancelled-popup-request') {
      setError('The sign-in popup was closed before completion. Please try again.');
    } else if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
      setError('This domain is not authorized for OAuth operations. Please add it to your Firebase Console under Authentication -> Settings -> Authorized domains.');
    } else if (err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
      setError('Invalid email or password. If you do not have an account yet, please switch to Sign up.');
    } else if (err?.code === 'auth/email-already-in-use') {
      setError('An account with this email already exists. Please sign in instead.');
    } else if (err?.code === 'auth/weak-password') {
      setError('Password should be at least 6 characters.');
    } else if (err?.code === 'auth/invalid-email') {
      setError('Please enter a valid email address.');
    } else if (err?.code === 'auth/operation-not-allowed') {
      setError('This sign-in method is not enabled. Please enable it in your Firebase Console.');
    } else {
      setError(err?.message || 'Failed to authenticate. Please try again.');
    }
    setLoading(false);
    setAuthLoading(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }
    
    setLoading(true);
    setAuthLoading('email');
    setError('');
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleProviderAuth = async (providerName: string) => {
    setLoading(true);
    setAuthLoading(providerName);
    setError('');
    try {
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
      } else if (providerName === 'github') {
        provider = new GithubAuthProvider();
      } else if (providerName === 'orcid') {
        provider = new OAuthProvider('oidc.orcid'); // Example generic OIDC provider identifier for ORCID
      }

      if (provider) {
        await signInWithPopup(auth, provider);
        router.push('/dashboard');
      }
    } catch (err: any) {
      handleError(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F9F5] text-[#253D2C] px-4 py-8">
      <div className="w-full max-w-md p-8 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#CFFFDC] blur-[60px] pointer-events-none"></div>

        <div className="relative text-center space-y-6">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-[1.25rem] bg-[#CFFFDC]/40 border border-[#68BA7F]/30">
            <BrainCircuit className="w-6 h-6 text-[#2E6F40]" />
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#253D2C]">
               {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-[#2E6F40]/80 text-sm">
               {isSignUp ? 'Sign up to start your research journey' : 'Sign in to your CatalystLab account'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-3 text-xs text-center font-medium animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2E6F40] ml-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#2E6F40]/50" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F4F9F5] border border-[#68BA7F]/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#68BA7F] transition-all"
                  placeholder="name@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2E6F40] ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#2E6F40]/50" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F4F9F5] border border-[#68BA7F]/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#68BA7F] transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-center py-2">
              <ReCAPTCHA
                sitekey="6Lf7hgQtAAAAACL5FXXfD9ov5kElSUZe2VVOJLer"
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !recaptchaToken}
              className="w-full bg-[#2E6F40] hover:bg-[#1E4D2B] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading === 'email' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>{isSignUp ? 'Sign up' : 'Sign in'}</span>
            </button>
          </form>

          <div className="text-sm">
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#2E6F40] font-medium hover:underline focus:outline-none"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#68BA7F]/30"></div>
            <span className="flex-shrink-0 mx-4 text-[#2E6F40]/60 text-xs font-medium">Or continue with</span>
            <div className="flex-grow border-t border-[#68BA7F]/30"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleProviderAuth('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#68BA7F]/40 text-[#253D2C] font-semibold py-2.5 px-4 rounded-xl hover:bg-[#F4F9F5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-slate-200 transition-all disabled:opacity-50 shadow-sm"
            >
              {authLoading === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>Google</span>
            </button>
            <button
              onClick={() => handleProviderAuth('github')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#68BA7F]/40 text-[#253D2C] font-semibold py-2.5 px-4 rounded-xl hover:bg-[#F4F9F5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-slate-200 transition-all disabled:opacity-50 shadow-sm"
            >
              {authLoading === 'github' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Github className="w-5 h-5" />}
              <span>GitHub</span>
            </button>
            <button
              onClick={() => handleProviderAuth('orcid')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#A6CE39]/10 border border-[#A6CE39]/40 text-[#253D2C] font-semibold py-2.5 px-4 rounded-xl hover:bg-[#A6CE39]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#A6CE39] transition-all disabled:opacity-50 shadow-sm"
            >
              {authLoading === 'orcid' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <div className="w-5 h-5 flex items-center justify-center bg-[#A6CE39] rounded-full text-white font-bold text-[10px]">
                  iD
                </div>
              )}
              <span>ORCID</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
