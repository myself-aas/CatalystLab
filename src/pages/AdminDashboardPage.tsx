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
  Mail,
  RefreshCw
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const AdminDashboardPage: React.FC = () => {
  const { user, login, logout, isAdmin, loading, loginWithLocalSession, setShowDomainModal } = useAuth();
  const location = useLocation();

  const isBlogs = location.pathname === '/admin/blogs';
  const isInquiries = location.pathname === '/admin/inquiries';
  const isMonitoring = !isBlogs && !isInquiries;

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-24 text-center text-slate-600 font-mono">
        <RefreshCw className="h-6 w-6 animate-spin text-black mx-auto mb-3" />
        <div className="text-sm font-semibold">Verifying superadmin authorization...</div>
      </div>
    );
  }

  // Access Control: Strict Superadmin Authorization Gate
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 text-slate-900 font-mono flex items-center justify-center">
        <SEOHead
          title="Superadmin Access Required — CatalystLab"
          description="The CatalystLab Command Center and Infrastructure Radar are strictly restricted to authorized Primary Superadmins."
        />
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-sm text-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-black border border-slate-200 mb-5 shadow-xs">
            <Lock className="h-7 w-7" />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            Superadmin Access Required
          </h1>
          
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            The CatalystLab Command Center and Infrastructure Radar are strictly restricted to authorized Primary Superadmins.
          </p>

          {user ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-mono text-left space-y-1">
              <div className="text-slate-500">Signed in as:</div>
              <div className="text-slate-900 font-bold truncate">{user.email}</div>
              <div className="mt-2 text-amber-500 font-sans text-[11px] flex items-center gap-1.5 pt-1 border-t border-slate-200">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>This account is not in the Primary Superadmin registry.</span>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500 font-sans">
              Authenticate with an authorized superadmin Google account, or activate a sandbox preview session.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </Link>

              {user ? (
                <button
                  onClick={() => logout().then(() => login())}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-black-hover px-4 py-2 text-xs font-bold text-white transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="h-3.5 w-3.5 text-amber-500" />
                  <span>Switch Superadmin</span>
                </button>
              ) : (
                <button
                  onClick={() => login()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-black-hover px-4 py-2 text-xs font-bold text-white transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="h-3.5 w-3.5 text-amber-500" />
                  <span>Sign In with Google</span>
                </button>
              )}
            </div>

            {/* Sandbox Quick Access Button */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => loginWithLocalSession({
                  email: 'asifahmedshuvo.aas@gmail.com',
                  displayName: 'Asif Ahmed Shuvo (Superadmin)',
                  isAdmin: true
                })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Activate Preview Session</span>
              </button>

              <button
                onClick={() => setShowDomainModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-black transition-all cursor-pointer whitespace-nowrap"
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
    <div className="min-h-screen bg-white pb-16 text-slate-900 font-mono selection:bg-black selection:text-white">
      <SEOHead
        title="Command Center & Infrastructure Radar — CatalystLab Admin"
        description="Continuous uptime monitoring, live Firestore audit logs, diagnostic container telemetry, and blog publishing."
        canonicalUrl="https://www.catalystlab.tech/admin/monitoring"
      />

      {/* Header Banner */}
      <section className="relative border-b border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 text-slate-900 shadow-xs">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-black mb-1 font-sans">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Primary Superadmin Command Center</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
                Infrastructure Radar &amp; Content Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-sans">
                Continuous uptime monitoring, live Firestore audit logs, diagnostic container telemetry, and blog publishing.
              </p>
            </div>

            {/* Auth / Superadmin Status Badge */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-900 font-mono text-[11px] truncate max-w-[180px]">{user.email}</span>
                <span className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 font-bold text-black text-[10px]">
                  SUPERADMIN
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-6 flex border-b border-slate-200 gap-2 overflow-x-auto scrollbar-none">
            <Link
              to="/admin/monitoring"
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isMonitoring
                  ? 'border-black text-black'
                  : 'border-transparent text-slate-600 hover:text-black'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>System Health &amp; Infrastructure</span>
            </Link>

            <Link
              to="/admin/blogs"
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isBlogs
                  ? 'border-black text-black'
                  : 'border-transparent text-slate-600 hover:text-black'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Blog Post CMS</span>
            </Link>

            <Link
              to="/admin/inquiries"
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isInquiries
                  ? 'border-black text-black'
                  : 'border-transparent text-slate-600 hover:text-black'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact Inquiries</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {isMonitoring ? (
          <div className="space-y-6">
            <SystemHealthWidget />
            <SiteMonitoringView />
          </div>
        ) : isBlogs ? (
          <div className="space-y-6">
            <SystemHealthWidget />
            <BlogManagementView />
          </div>
        ) : (
          <div className="space-y-6">
            <ContactInquiriesAdminView />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
