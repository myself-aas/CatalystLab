import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SiteMonitoringView } from '../components/admin/SiteMonitoringView';
import { BlogManagementView } from '../components/admin/BlogManagementView';
import { SystemHealthWidget } from '../components/admin/SystemHealthWidget';
import { ContactInquiriesAdminView } from '../components/admin/ContactInquiriesAdminView';
import { 
  ShieldCheck, 
  ShieldAlert,
  Activity, 
  BookOpen, 
  LogIn, 
  Lock,
  ArrowLeft,
  Server,
  Mail
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, login, logout, isAdmin, loading, loginWithLocalSession, setShowDomainModal } = useAuth();
  const location = useLocation();

  const isBlogs = location.pathname === '/admin/blogs';
  const isInquiries = location.pathname === '/admin/inquiries';
  const isMonitoring = !isBlogs && !isInquiries;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-24 text-center text-[#415a77]">
        <span className="material-symbols-outlined text-3xl animate-spin text-[#415a77] mb-3 inline-block">progress_activity</span>
        <div className="text-base font-semibold">Verifying superadmin authorization...</div>
      </div>
    );
  }

  // Access Control: Strict Superadmin Authorization Gate
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-20 px-4 sm:px-6 text-[#0b192c]">
        <div className="mx-auto max-w-lg rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 text-center shadow-2xl text-[#f8fafc]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#415a77]/25 text-[#c5d3e8] border border-[#415a77]/40 mb-6 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#f8fafc] sm:text-3xl">
            Superadmin Access Required
          </h1>
          
          <p className="mt-3 text-base text-[#c5d3e8] leading-relaxed">
            The CatalystLab Command Center and Infrastructure Radar are strictly restricted to authorized Primary Superadmins.
          </p>

          {user ? (
            <div className="mt-6 rounded-2xl border border-[#415a77]/30 bg-[#152238] p-4 text-sm font-mono text-left">
              <div className="text-[#c5d3e8]">Signed in as:</div>
              <div className="text-[#f8fafc] font-bold mt-0.5 truncate">{user.email}</div>
              <div className="mt-2 text-[#ebe9e6] font-sans flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#c5d3e8]" />
                <span>This account is not in the Primary Superadmin registry.</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#c5d3e8]">
              Authenticate with an authorized superadmin Google account, or activate a sandbox preview session.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#415a77]/40 bg-[#152238] px-5 py-2.5 text-sm font-semibold text-[#f8fafc] hover:bg-[#1e2f4a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </Link>

              {user ? (
                <button
                  onClick={() => logout().then(() => login())}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-sm font-bold text-[#f8fafc] hover:bg-[#52718e] transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Switch Superadmin Account</span>
                </button>
              ) : (
                <button
                  onClick={() => login()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-sm font-bold text-[#f8fafc] hover:bg-[#52718e] transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In with Google</span>
                </button>
              )}
            </div>

            {/* Sandbox Quick Access Button */}
            <div className="pt-4 border-t border-[#415a77]/30 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => loginWithLocalSession({
                  email: 'asifahmedshuvo.aas@gmail.com',
                  displayName: 'Asif Ahmed Shuvo (Superadmin)',
                  isAdmin: true
                })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-900/40 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Activate Preview Superadmin Session</span>
              </button>

              <button
                onClick={() => setShowDomainModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#415a77]/30 bg-[#152238] px-3.5 py-2 text-sm font-semibold text-[#c5d3e8] hover:text-[#f8fafc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <span>Domain Auth Helper</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Superadmin Workspace
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-[#0b192c]">
      
      {/* Header Banner */}
      <section className="relative border-b border-[#415a77]/20 bg-[#0b192c] px-4 py-12 sm:px-6 lg:px-8 text-[#f8fafc] shadow-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/40 bg-[#415a77]/25 px-3 py-1 text-sm font-semibold text-[#c5d3e8] mb-3">
                <ShieldCheck className="h-3.5 w-3.5 text-[#c5d3e8]" />
                <span>Primary Superadmin Command Center</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#f8fafc] sm:text-4xl">
                Infrastructure Radar & Content Studio
              </h1>
              <p className="mt-1 text-sm sm:text-base text-[#c5d3e8]">
                Continuous uptime monitoring, live Firestore audit logs, diagnostic container telemetry, and blog publishing.
              </p>
            </div>

            {/* Auth / Superadmin Status Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-[#415a77]/40 bg-[#152238] px-4 py-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#ebe9e6] font-mono">{user.email}</span>
                <span className="rounded bg-[#415a77]/30 px-2 py-0.5 font-bold text-[#c5d3e8] border border-[#415a77]/40">
                  PRIMARY SUPERADMIN
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links with Dedicated URLs */}
          <div className="mt-8 flex border-b border-[#415a77]/30 gap-2">
            <Link
              to="/admin/monitoring"
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-base font-bold transition-colors ${
                isMonitoring
                  ? 'border-[#c5d3e8] text-[#f8fafc]'
                  : 'border-transparent text-[#c5d3e8]/70 hover:border-[#c5d3e8]/40 hover:text-[#f8fafc]'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Live System Health & Infrastructure</span>
            </Link>

            <Link
              to="/admin/blogs"
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-base font-bold transition-colors ${
                isBlogs
                  ? 'border-[#c5d3e8] text-[#f8fafc]'
                  : 'border-transparent text-[#c5d3e8]/70 hover:border-[#c5d3e8]/40 hover:text-[#f8fafc]'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Blog Post Creation & CMS</span>
            </Link>

            <Link
              to="/admin/inquiries"
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-base font-bold transition-colors ${
                isInquiries
                  ? 'border-[#c5d3e8] text-[#f8fafc]'
                  : 'border-transparent text-[#c5d3e8]/70 hover:border-[#c5d3e8]/40 hover:text-[#f8fafc]'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Contact Leads & Inquiries</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isMonitoring ? (
          <div>
            {/* Visual System Health Widget pulling live status from Firestore audit logs */}
            <SystemHealthWidget />
            
            {/* Monitored Endpoints & Infrastructure Probes */}
            <SiteMonitoringView />
          </div>
        ) : isBlogs ? (
          <div>
            {/* Visual System Health Snapshot */}
            <SystemHealthWidget />

            {/* Superadmin Blog Management */}
            <BlogManagementView />
          </div>
        ) : (
          <div>
            {/* Superadmin Inquiries & Leads Management */}
            <ContactInquiriesAdminView />
          </div>
        )}
      </main>
    </div>
  );
};

