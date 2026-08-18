import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SiteMonitoringView } from '../components/admin/SiteMonitoringView';
import { BlogManagementView } from '../components/admin/BlogManagementView';
import { 
  ShieldCheck, 
  ShieldAlert,
  Activity, 
  BookOpen, 
  LogIn, 
  Lock,
  ArrowLeft
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, login, logout, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'monitoring' | 'blogs'>('monitoring');

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-[#f8fafc] py-24 text-center text-[#415a77]">
        <span className="material-symbols-outlined text-3xl animate-spin text-[#415a77] mb-3 inline-block">progress_activity</span>
        <div className="text-sm font-semibold">Verifying superadmin authorization...</div>
=======
      <div className="min-h-screen bg-slate-950 py-24 text-center text-slate-500">
        <div className="animate-spin inline-block mb-3 text-2xl">⏳</div>
        <div className="text-sm">Verifying superadmin authorization...</div>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
      </div>
    );
  }

  // Access Control: Strict Superadmin Authorization Gate
  if (!user || !isAdmin) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-[#f8fafc] py-20 px-4 sm:px-6 text-[#0b192c]">
        <div className="mx-auto max-w-lg rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 text-center shadow-2xl text-[#f8fafc]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#415a77]/25 text-[#c5d3e8] border border-[#415a77]/40 mb-6 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#f8fafc] sm:text-3xl">
            Superadmin Access Required
          </h1>
          
          <p className="mt-3 text-sm text-[#c5d3e8] leading-relaxed">
=======
      <div className="min-h-screen bg-slate-950 py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Superadmin Access Required
          </h1>
          
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            The CatalystLab Command Center and Infrastructure Radar are strictly restricted to authorized Primary Superadmins.
          </p>

          {user ? (
<<<<<<< HEAD
            <div className="mt-6 rounded-2xl border border-[#415a77]/30 bg-[#152238] p-4 text-xs font-mono text-left">
              <div className="text-[#c5d3e8]">Signed in as:</div>
              <div className="text-[#f8fafc] font-bold mt-0.5 truncate">{user.email}</div>
              <div className="mt-2 text-[#ebe9e6] font-sans flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#c5d3e8]" />
=======
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-left">
              <div className="text-slate-500">Signed in as:</div>
              <div className="text-slate-300 font-bold mt-0.5 truncate">{user.email}</div>
              <div className="mt-2 text-amber-400 font-sans flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                <span>This account is not in the Primary Superadmin registry.</span>
              </div>
            </div>
          ) : (
<<<<<<< HEAD
            <p className="mt-4 text-xs text-[#c5d3e8]">
=======
            <p className="mt-4 text-xs text-slate-500">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              Please authenticate with an authorized superadmin Google account to proceed.
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
<<<<<<< HEAD
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#415a77]/40 bg-[#152238] px-5 py-2.5 text-xs font-semibold text-[#f8fafc] hover:bg-[#1e2f4a] transition-colors"
=======
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>

            {user ? (
              <button
                onClick={() => logout().then(() => login())}
<<<<<<< HEAD
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#52718e] transition-all shadow-md"
=======
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Switch Superadmin Account</span>
              </button>
            ) : (
              <button
                onClick={() => login()}
<<<<<<< HEAD
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#52718e] transition-all shadow-md"
=======
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In with Superadmin Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authorized Superadmin Workspace
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-[#0b192c]">
      
      {/* Header Banner */}
      <section className="relative border-b border-[#415a77]/20 bg-[#0b192c] px-4 py-12 sm:px-6 lg:px-8 text-[#f8fafc] shadow-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/40 bg-[#415a77]/25 px-3 py-1 text-xs font-semibold text-[#c5d3e8] mb-3">
                <ShieldCheck className="h-3.5 w-3.5 text-[#c5d3e8]" />
                <span>Primary Superadmin Command Center</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#f8fafc] sm:text-4xl">
                Infrastructure Radar & Content Studio
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#c5d3e8]">
=======
    <div className="min-h-screen bg-slate-950 pb-20">
      
      {/* Header Banner */}
      <section className="relative border-b border-slate-800 bg-radial-[at_top] from-slate-900 via-slate-950 to-slate-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Primary Superadmin Command Center</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                Infrastructure Radar & Content Studio
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                Continuous uptime monitoring, SSL tracking, diagnostic container telemetry, and blog publishing.
              </p>
            </div>

            {/* Auth / Superadmin Status Badge */}
            <div className="flex items-center gap-3">
<<<<<<< HEAD
              <div className="flex items-center gap-2.5 rounded-xl border border-[#415a77]/40 bg-[#152238] px-4 py-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#ebe9e6] font-mono">{user.email}</span>
                <span className="rounded bg-[#415a77]/30 px-2 py-0.5 font-bold text-[#c5d3e8] border border-[#415a77]/40">
=======
              <div className="flex items-center gap-2.5 rounded-xl border border-cyan-500/30 bg-slate-900/90 px-4 py-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-200 font-mono">{user.email}</span>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-bold text-cyan-300 border border-cyan-500/30">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                  PRIMARY SUPERADMIN
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
<<<<<<< HEAD
          <div className="mt-8 flex border-b border-[#415a77]/30 gap-2">
=======
          <div className="mt-8 flex border-b border-slate-800 gap-2">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                activeTab === 'monitoring'
<<<<<<< HEAD
                  ? 'border-[#c5d3e8] text-[#f8fafc]'
                  : 'border-transparent text-[#c5d3e8]/70 hover:border-[#c5d3e8]/40 hover:text-[#f8fafc]'
=======
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Site Monitoring & Infrastructure</span>
            </button>

            <button
              onClick={() => setActiveTab('blogs')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                activeTab === 'blogs'
<<<<<<< HEAD
                  ? 'border-[#c5d3e8] text-[#f8fafc]'
                  : 'border-transparent text-[#c5d3e8]/70 hover:border-[#c5d3e8]/40 hover:text-[#f8fafc]'
=======
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Blog Post Creation & CMS</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'monitoring' ? (
          <SiteMonitoringView />
        ) : (
          <BlogManagementView />
        )}
      </main>
    </div>
  );
};
