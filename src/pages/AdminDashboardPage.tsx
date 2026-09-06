import React, { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SiteMonitoringView } from '../components/admin/SiteMonitoringView';
import { BlogManagementView } from '../components/admin/BlogManagementView';
import { SystemHealthWidget } from '../components/admin/SystemHealthWidget';
import { ContactInquiriesAdminView } from '../components/admin/ContactInquiriesAdminView';
import { FramerAdminCockpit } from '../components/admin/FramerAdminCockpit';
import { 
  ShieldCheck, 
  ShieldAlert,
  Globe, 
  BookOpen, 
  LogIn, 
  Lock,
  ArrowLeft,
  Mail,
  Cpu,
  Sliders,
  Terminal,
  Activity,
  Server
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { AdminDashboardSkeleton } from '../components/skeleton';

export const AdminDashboardPage: React.FC = () => {
  const { user, login, logout, isAdmin, loading, loginWithLocalSession, setShowDomainModal } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine active tab from URL search params or path
  const tabFromQuery = searchParams.get('tab');
  const activeTab = tabFromQuery || (
    location.pathname === '/admin/blogs' ? 'blogs' :
    location.pathname === '/admin/inquiries' ? 'inquiries' :
    location.pathname === '/admin/monitoring' ? 'monitoring' :
    'mesh'
  );

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  // Access Control: Strict Superadmin Authorization Gate
  if (!user || !isAdmin) {
    return (
      <div data-theme="dark" className="min-h-screen ds-page-top bg-background text-foreground font-mono flex items-center justify-center p-4 relative overflow-hidden">
        {/* Subsurface glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,102,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        
        <SEOHead
          title="Superadmin Access Required — CatalystLab"
          description="The CatalystLab Command Center and Infrastructure Radar are strictly restricted to authorized Primary Superadmins."
        />

        <div className="w-full max-w-md p-6 sm:p-8 ds-card backdrop-blur-xl relative z-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#00D2FF] border border-border mb-4 shadow-inner">
            <Lock className="h-6 w-6" />
          </div>

          {/* Admin badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full framer-micro-tag bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            <span>Access Control Restricted</span>
          </div>

          <h1 className="framer-card-title text-xl sm:text-2xl text-foreground">
            Superadmin Access Required
          </h1>
          
          <p className="mt-2 framer-body-text text-xs leading-relaxed">
            The CatalystLab Command Center, 38-PoP edge mesh control, and quota allocations are strictly restricted to authorized Primary Superadmins.
          </p>

          {user ? (
            <div className="mt-5 p-3.5 rounded-xl bg-background border border-border text-xs font-mono text-left space-y-1">
              <div className="text-muted-foreground">Signed in as:</div>
              <div className="text-foreground font-medium truncate">{user.email}</div>
              <div className="mt-2 text-amber-400 font-sans text-[11px] flex items-center gap-1.5 pt-1.5 border-t border-border">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>This account is not in the Primary Superadmin registry.</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 framer-body-text text-xs">
              Authenticate with an authorized superadmin Google account, or activate a sandbox preview session.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link
                to="/"
                className="ds-btn ds-btn-secondary text-xs w-full sm:w-1/2"
              >
                &larr; Back to Home
              </Link>

              {user ? (
                <button
                  onClick={() => logout().then(() => login())}
                  className="ds-btn ds-btn-primary text-xs w-full sm:w-1/2"
                >
                  Switch Account
                </button>
              ) : (
                <button
                  onClick={() => login()}
                  className="ds-btn ds-btn-primary text-xs w-full sm:w-1/2 flex items-center justify-center gap-1.5"
                >
                  <LogIn className="size-3.5 shrink-0" />
                  <span>Google SSO</span>
                </button>
              )}
            </div>

            {import.meta.env.DEV && (
              <div className="flex flex-col gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => loginWithLocalSession({
                    email: 'asifahmedshuvo.aas@gmail.com',
                    displayName: 'Asif Ahmed Shuvo (Superadmin)',
                    isAdmin: true
                  })}
                  className="w-full py-2 px-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Dev-only preview session</span>
                </button>

                <button
                  onClick={() => setShowDomainModal(true)}
                  className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white text-[11px] font-mono transition-all cursor-pointer"
                >
                  Domain Auth Helper
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authorized Superadmin Workspace
  return (
    <div data-theme="dark" className="min-h-screen ds-page-top bg-background pb-24 text-foreground font-sans selection:bg-[#0066FF] selection:text-white">
      <SEOHead
        title="Command Center & Infrastructure Radar — CatalystLab Admin"
        description="Continuous uptime monitoring, live Firestore audit logs, diagnostic container telemetry, and blog publishing."
        canonicalUrl="https://www.catalystlab.tech/admin"
      />

      {/* Admin Shell Header Banner */}
      <section className="border-b border-border bg-card pt-8 pb-6 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {/* Specification 5.1: Banner Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full framer-micro-tag bg-cyan-500/10 text-[#00D2FF] border border-cyan-500/20 mb-2">
                <Terminal className="size-3.5 text-amber-400 shrink-0" />
                <span>[ SYSTEM ADMIN · ROOT PRIVILEGES ENABLED ]</span>
              </div>
              
              <h1 className="framer-section-headline text-2xl sm:text-3xl text-foreground">
                Infrastructure Radar &amp; Control Console
              </h1>
              <p className="framer-body-text text-xs sm:text-sm mt-1 max-w-2xl">
                Global 38-PoP edge mesh management, multi-tenant quota enforcement, SDLC worker compute telemetry, and OWASP SOC2 compliance logs.
              </p>
            </div>

            {/* Superadmin Status Pill */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-xl ds-card flex items-center gap-2.5 font-mono text-xs">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-foreground truncate max-w-[180px]">{user.email}</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20 font-mono">
                  ROOT
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links Specification 5.1 */}
          <div className="pt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-xs border-t border-border">
            <button
              onClick={() => handleTabChange('mesh')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'mesh'
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe className="size-3.5 shrink-0" />
              <span>Global Mesh Topology</span>
            </button>

            <button
              onClick={() => handleTabChange('tenants')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'tenants'
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="size-3.5 shrink-0" />
              <span>Tenants &amp; Organizations</span>
            </button>

            <button
              onClick={() => handleTabChange('compute')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'compute'
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="size-3.5 shrink-0" />
              <span>Engine Load &amp; Compute</span>
            </button>

            <button
              onClick={() => handleTabChange('owasp')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'owasp'
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="size-3.5 shrink-0" />
              <span>OWASP Ingress Rules</span>
            </button>

            <button
              onClick={() => handleTabChange('monitoring')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'monitoring'
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="size-3.5 shrink-0" />
              <span>Host Health Radar</span>
            </button>

            <button
              onClick={() => handleTabChange('blogs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'blogs'
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="size-3.5 shrink-0" />
              <span>Content &amp; Blog CMS</span>
            </button>

            <button
              onClick={() => handleTabChange('inquiries')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'inquiries'
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="size-3.5 shrink-0" />
              <span>Contact Inquiries</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Admin Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mt-8 space-y-8">
        {/* Core Edge & Mesh Telemetry Modules */}
        {(activeTab === 'mesh' || activeTab === 'tenants' || activeTab === 'compute' || activeTab === 'owasp') && (
          <FramerAdminCockpit activeSubTab={activeTab} />
        )}

        {/* Host Radar & Container Health */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <SystemHealthWidget />
            <SiteMonitoringView />
          </div>
        )}

        {/* Blog Post CMS */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <SystemHealthWidget />
            <BlogManagementView />
          </div>
        )}

        {/* Contact Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <ContactInquiriesAdminView />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
