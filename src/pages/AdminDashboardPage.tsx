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
import { AdminDashboardSkeleton } from '../components/skeleton';

export const AdminDashboardPage: React.FC = () => {
 const { user, login, logout, isAdmin, loading, loginWithLocalSession, setShowDomainModal } = useAuth();
 const location = useLocation();

 const isBlogs = location.pathname === '/admin/blogs';
 const isInquiries = location.pathname === '/admin/inquiries';
 const isMonitoring = !isBlogs && !isInquiries;

 if (loading) {
 return <AdminDashboardSkeleton />;
 }

 // Access Control: Strict Superadmin Authorization Gate
 if (!user || !isAdmin) {
 return (
 <div className="min-h-screen bg-background ds-section text-foreground font-mono flex items-center justify-center">
 <SEOHead
 title="Superadmin Access Required — CatalystLab"
 description="The CatalystLab Command Center and Infrastructure Radar are strictly restricted to authorized Primary Superadmins."
 />
 <div className="ds-card p-6 sm:p-8 text-center">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-foreground border border-border mb-5 shadow-xs">
 <Lock className="h-7 w-7"/>
 </div>

 <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground font-sans">
 Superadmin Access Required
 </h1>
 
 <p className="mt-2.5 text-xs sm:text-sm ds-muted leading-relaxed font-sans">
 The CatalystLab Command Center and Infrastructure Radar are strictly restricted to authorized Primary Superadmins.
 </p>

 {user ? (
 <div className="ds-card p-3.5 text-xs font-mono text-left space-y-1">
 <div className="ds-muted">Signed in as:</div>
 <div className="text-foreground font-bold truncate">{user.email}</div>
 <div className="mt-2 text-amber-500 font-sans text-[11px] flex items-center gap-1.5 pt-1 border-t border-border">
 <ShieldAlert className="h-3.5 w-3.5 shrink-0"/>
 <span>This account is not in the Primary Superadmin registry.</span>
 </div>
 </div>
 ) : (
 <p className="mt-3 text-xs ds-muted font-sans">
 Authenticate with an authorized superadmin Google account, or activate a sandbox preview session.
 </p>
 )}

 <div className="mt-6 flex flex-col gap-3">
 <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
 <Link
 to="/"
 className="ds-card w-full items-center gap-2 text-xs font-semibold ds-card-interactive p-4"
 >
 <ArrowLeft className="h-3.5 w-3.5"/>
 <span>Back to Home</span>
 </Link>

 {user ? (
 <button
 onClick={() => logout().then(() => login())}
 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-xs cursor-pointer whitespace-nowrap"
 >
 <LogIn className="h-3.5 w-3.5 text-amber-500"/>
 <span>Switch Superadmin</span>
 </button>
 ) : (
 <button
 onClick={() => login()}
 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-xs cursor-pointer whitespace-nowrap"
 >
 <LogIn className="h-3.5 w-3.5 text-amber-500"/>
 <span>Sign In with Google</span>
 </button>
 )}
 </div>

 {import.meta.env.DEV && (
 <div className="flex flex-col items-center justify-center gap-2 border-t border-border pt-3 sm:flex-row">
 <button
 onClick={() => loginWithLocalSession({
 email: 'asifahmedshuvo.aas@gmail.com',
 displayName: 'Asif Ahmed Shuvo (Superadmin)',
 isAdmin: true
 })}
 className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/20 sm:w-auto"
 >
 <ShieldCheck className="h-3.5 w-3.5 text-emerald-400"/>
 <span>Dev-only preview session</span>
 </button>

 <button
 onClick={() => setShowDomainModal(true)}
 className="ds-card w-full items-center gap-1 text-xs font-semibold ds-muted ds-card-interactive p-4"
 >
 <span>Domain Auth Helper</span>
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
 <div className="min-h-screen bg-background pb-16 text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
 <SEOHead
 title="Command Center & Infrastructure Radar — CatalystLab Admin"
 description="Continuous uptime monitoring, live Firestore audit logs, diagnostic container telemetry, and blog publishing."
 canonicalUrl="https://www.catalystlab.tech/admin/monitoring"
 />

 {/* Header Banner */}
 <section className="relative border-b border-border bg-muted ds-section text-foreground shadow-xs">
 <div className="ds-page-shell">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-semibold text-foreground mb-1 font-sans">
 <ShieldCheck className="h-3.5 w-3.5"/>
 <span>Primary Superadmin Command Center</span>
 </div>
 <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-sans">
 Infrastructure Radar &amp; Content Studio
 </h1>
 <p className="text-xs sm:text-sm ds-muted font-sans">
 Continuous uptime monitoring, live Firestore audit logs, diagnostic container telemetry, and blog publishing.
 </p>
 </div>

 {/* Auth / Superadmin Status Badge */}
 <div className="flex items-center gap-3 shrink-0">
 <div className="ds-card flex items-center gap-2 text-xs p-4">
 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>
 <span className="text-foreground font-mono text-[11px] truncate max-w-[180px]">{user.email}</span>
 <span className="rounded bg-muted border border-border px-2.5 py-0.5 font-bold text-foreground text-[10px]">
 SUPERADMIN
 </span>
 </div>
 </div>
 </div>

 {/* Navigation Links */}
 <div className="mt-6 flex border-b border-border gap-2 overflow-x-auto scrollbar-none">
 <Link
 to="/admin/monitoring"
 className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
 isMonitoring
 ? 'bg-primary text-primary-foreground shadow-sm border border-border'
 : 'bg-background ds-muted hover:text-foreground hover:bg-muted border border-border'
 }`}
 >
 <Activity className="h-3.5 w-3.5"/>
 <span>System Health &amp; Infrastructure</span>
 </Link>

 <Link
 to="/admin/blogs"
 className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
 isBlogs
 ? 'bg-primary text-primary-foreground shadow-sm border border-border'
 : 'bg-background ds-muted hover:text-foreground hover:bg-muted border border-border'
 }`}
 >
 <BookOpen className="h-3.5 w-3.5"/>
 <span>Blog Post CMS</span>
 </Link>

 <Link
 to="/admin/inquiries"
 className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
 isInquiries
 ? 'bg-primary text-primary-foreground shadow-sm border border-border'
 : 'bg-background ds-muted hover:text-foreground hover:bg-muted border border-border'
 }`}
 >
 <Mail className="h-3.5 w-3.5"/>
 <span>Contact Inquiries</span>
 </Link>
 </div>
 </div>
 </section>

 {/* Main Workspace */}
 <main className="ds-page-shell space-y-6">
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
