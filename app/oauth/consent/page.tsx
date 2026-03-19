'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Image from 'next/image';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Info,
  Lock,
  User,
  Mail,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

function ConsentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appInfo, setAppInfo] = useState<{ name: string; logo_url?: string; site_url?: string } | null>(null);

  // OAuth Parameters
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope') || 'openid profile email';
  const state = searchParams.get('state');
  const responseType = searchParams.get('response_type');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect to login if not authenticated, preserving OAuth params
        const currentUrl = window.location.href;
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }
      
      if (!clientId) {
        setError('Missing client_id parameter.');
        setIsLoading(false);
        return;
      }

      // In a real Supabase OAuth Server setup, you might fetch app info from a public table or endpoint
      // For now, we'll simulate fetching app info or just use the clientId
      try {
        // Attempt to fetch app info if you have a table for it, otherwise use placeholder
        // const { data } = await supabase.from('oauth_applications').select('*').eq('client_id', clientId).single();
        // if (data) setAppInfo(data);
        
        // Placeholder for demo/prototype
        setAppInfo({
          name: 'Third-Party Application',
          site_url: redirectUri ? new URL(redirectUri).origin : undefined
        });
      } catch (err) {
        console.error('Error fetching app info:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [clientId, redirectUri, router]);

  const handleAuthorize = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Supabase OAuth Server handles the actual code generation and redirect.
      // We need to POST the user's consent to the Supabase Auth internal endpoint.
      // The endpoint is usually /auth/v1/authorize/consent
      
      // Note: The exact implementation depends on the Supabase Auth server version.
      // Typically, you'd perform a POST request to the Supabase Auth server.
      // However, since this is a client-side consent screen, we might need to redirect
      // back to the Supabase authorize endpoint with an "approve" parameter.
      
      // For Supabase's built-in OAuth server, the flow is:
      // 1. User is at /oauth/consent?client_id=...
      // 2. User clicks "Authorize"
      // 3. We redirect back to Supabase's authorize endpoint with the user's decision.
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Supabase URL not configured');

      // Construct the approval URL
      // This is a simplified representation. In a real Supabase OAuth server, 
      // you'd follow their specific redirect pattern for consent.
      const approvalUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
      approvalUrl.searchParams.set('client_id', clientId!);
      approvalUrl.searchParams.set('redirect_uri', redirectUri!);
      approvalUrl.searchParams.set('response_type', responseType || 'code');
      approvalUrl.searchParams.set('scope', scope);
      if (state) approvalUrl.searchParams.set('state', state);
      approvalUrl.searchParams.set('approve', 'true');

      window.location.href = approvalUrl.toString();
    } catch (err: any) {
      console.error('Authorization error:', err);
      setError(err.message || 'Failed to authorize application.');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (redirectUri) {
      const url = new URL(redirectUri);
      url.searchParams.set('error', 'access_denied');
      if (state) url.searchParams.set('state', state);
      window.location.href = url.toString();
    } else {
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Loading Authorization...</span>
        </div>
      </div>
    );
  }

  const scopes = scope.split(' ');

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-2xl)] overflow-hidden shadow-2xl"
      >
        {/* HEADER */}
        <div className="p-8 border-b border-[var(--border-faint)] bg-[var(--bg-overlay)] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-xl)] flex items-center justify-center mb-6 shadow-sm">
            {appInfo?.logo_url ? (
              <div className="relative w-10 h-10">
                <Image 
                  src={appInfo.logo_url} 
                  alt={appInfo.name} 
                  fill
                  className="object-contain" 
                  referrerPolicy="no-referrer" 
                />
              </div>
            ) : (
              <Globe className="w-8 h-8 text-[var(--text-tertiary)]" />
            )}
          </div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] mb-2">Authorize {appInfo?.name || 'Application'}</h1>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            This application is requesting access to your <span className="text-[var(--text-primary)] font-medium">CatalystLab</span> account.
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-[var(--rose-muted)] border border-[var(--rose)] rounded-[var(--r-lg)] flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[var(--rose)] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[var(--text-primary)]">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Requested Permissions</div>
            <div className="space-y-3">
              {scopes.map((s) => (
                <div key={s} className="flex items-start gap-3 p-3 bg-[var(--bg-sunken)] border border-[var(--border-faint)] rounded-[var(--r-lg)]">
                  <div className="mt-0.5">
                    {s === 'openid' && <Lock className="w-4 h-4 text-[var(--accent)]" />}
                    {s === 'profile' && <User className="w-4 h-4 text-[var(--accent)]" />}
                    {s === 'email' && <Mail className="w-4 h-4 text-[var(--accent)]" />}
                    {!['openid', 'profile', 'email'].includes(s) && <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--text-primary)] capitalize">{s}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">
                      {s === 'openid' && 'Verify your identity using OpenID Connect.'}
                      {s === 'profile' && 'Access your basic profile information (name, avatar).'}
                      {s === 'email' && 'Access your primary email address.'}
                      {!['openid', 'profile', 'email'].includes(s) && `Access to ${s} resources.`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-sunken)] border border-[var(--border-faint)] rounded-[var(--r-lg)] flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-muted)] flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">{profile?.full_name || 'Researcher'}</div>
              <div className="text-[11px] text-[var(--text-tertiary)] truncate">{user?.email}</div>
            </div>
            <div className="text-[10px] font-mono text-[var(--emerald)] bg-[var(--emerald-subtle)] px-2 py-0.5 rounded-full uppercase font-bold">Logged In</div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-[var(--bg-overlay)] border-t border-[var(--border-faint)] flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleCancel}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] text-[13px] font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
          <button 
            onClick={handleAuthorize}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] rounded-[var(--r-md)] text-[13px] font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-glow)] disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Authorize
          </button>
        </div>

        <div className="px-8 py-4 bg-[var(--bg-sunken)] flex items-center justify-center gap-2">
          <Info className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">
            Only authorize applications you trust.
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <div className={cn("w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin", className)} />;
}

export default function OAuthConsentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    }>
      <ConsentContent />
    </Suspense>
  );
}
