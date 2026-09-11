import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleSecurity } from '../context/RoleSecurityContext';
import { RoleContentGate } from '../components/common/RoleContentGate';
import { getUserReports, deleteReport } from '../lib/firebase';
import { ENGINES_MAP } from '../data/engines';
import { urlToDomainSlug, extractDomainFromUrl } from '../utils/slugUtils';
import { exportAuditReportDataToPdf } from '../utils/pdfExport';
import { 
 getRateLimitStatus, 
 fetchServerRateLimitStatus,
 RateLimitStatus
} from '../utils/rateLimiter';
import type { AuditReport } from '../types';
import { 
 Search, 
 Trash2, 
 Share2, 
 RotateCw, 
 Check, 
 Grid, 
 List, 
 ShieldCheck, 
 ShieldAlert,
 Activity, 
 Globe, 
 Calendar,
 LogIn,
 Download,
 FileText,
 ArrowRight,
 Sparkles,
 BookOpen,
 Cpu,
 Filter,
 CheckCircle2,
 Key,
 Eye,
 X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserBlogManagementView } from '../components/user/UserBlogManagementView';
import { UserRateLimitAllocationCard } from '../components/user/UserRateLimitAllocationCard';
import { UserDomainMonitoringRadar } from '../components/user/UserDomainMonitoringRadar';
import { UserAnalyticsDashboard } from '../components/user/UserAnalyticsDashboard';
import { UserApiKeyManagementView } from '../components/user/UserApiKeyManagementView';
import { UserGithubWebhookView } from '../components/user/UserGithubWebhookView';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { FramerDossierCockpit } from '../components/dashboard/FramerDossierCockpit';
import { DashboardMetricsBentoGrid } from '../components/dashboard/DashboardMetricsBentoGrid';
import { AuditDetailModal } from '../components/dashboard/AuditDetailModal';

import { SEOHead } from '../components/common/SEOHead';
import { useLocation, useParams } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { logger } from '../lib/logger';
import { UserDashboardSkeleton, SkeletonCard, SkeletonTable } from '../components/skeleton';

export const UserDashboardPage: React.FC = () => {
 const { 
  user, 
  isAdmin, 
  loading: authLoading, 
  loginWithLocalSession, 
  setShowDomainModal,
  targetDomain,
  setTargetDomain,
  isScanning,
  setIsScanning
 } = useAuth();
 const { roleConfig } = useRoleSecurity();
 const navigate = useNavigate();
 const location = useLocation();
 const { tab } = useParams<{ tab: string }>();

 const getActiveView = (): string => {
 if (tab) {
 if (tab === 'analytics' || tab === 'home') return 'overview';
 if (tab === 'github') return 'webhooks';
 return tab;
 }
 if (location.pathname.endsWith('/overview')) return 'overview';
 if (location.pathname.endsWith('/audits')) return 'audits';
 if (location.pathname.endsWith('/reports')) return 'reports';
 if (location.pathname.endsWith('/webhooks') || location.pathname.endsWith('/github')) return 'webhooks';
 if (location.pathname.endsWith('/monitoring')) return 'monitoring';
 if (location.pathname.endsWith('/api-keys')) return 'api-keys';
 if (location.pathname.endsWith('/rate-limits')) return 'rate-limits';
 if (location.pathname.endsWith('/blogs')) return 'blogs';
 if (location.pathname.endsWith('/security')) return 'security';
 if (location.pathname.endsWith('/engines')) return 'engines';
 if (location.pathname.endsWith('/patches')) return 'patches';
 const params = new URLSearchParams(location.search);
 const tabParam = params.get('tab');
 if (tabParam) {
 if (tabParam === 'analytics' || tabParam === 'home') return 'overview';
 if (tabParam === 'github') return 'webhooks';
 return tabParam;
 }
 return 'overview';
 };

 const activeTab = getActiveView();

 const [reports, setReports] = useState<AuditReport[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedEngine, setSelectedEngine] = useState<string>('all');
 const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score_high' | 'score_low' | 'domain'>('newest');
 const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
 const [copiedId, setCopiedId] = useState<string | null>(null);
 const [deletingId, setDeletingId] = useState<string | null>(null);
 const [exportingId, setExportingId] = useState<string | null>(null);
 const [quickViewReport, setQuickViewReport] = useState<AuditReport | null>(null);

 const [rateStatus, setRateStatus] = useState<RateLimitStatus>(() => getRateLimitStatus(user, isAdmin));

 const handleRefreshScan = () => {
 setIsScanning(true);
 setTimeout(() => {
 setIsScanning(false);
 fetchReports();
 }, 1200);
 };

 const fetchReports = async () => {
 if (!user) {
 setLoading(false);
 return;
 }
 setLoading(true);
 try {
 const data = await getUserReports();
 setReports(data);
 } catch (err) {
 logger.error("Error fetching reports:", err);
 } finally {
 setLoading(false);
 }
 };

 const refreshRateLimit = async () => {
 try {
 const serverStatus = await fetchServerRateLimitStatus(user);
 if (serverStatus) {
 setRateStatus(serverStatus);
 } else {
 setRateStatus(getRateLimitStatus(user, isAdmin));
 }
 } catch {
 setRateStatus(getRateLimitStatus(user, isAdmin));
 }
 };

 useEffect(() => {
 if (!authLoading) {
 fetchReports();
 refreshRateLimit();
 }
 const handleRateLimitUpdate = (e: CustomEvent<RateLimitStatus>) => {
 if (e.detail) setRateStatus(e.detail);
 };
 window.addEventListener('catalyst-rate-limit-updated' as any, handleRateLimitUpdate);
 return () => {
 window.removeEventListener('catalyst-rate-limit-updated' as any, handleRateLimitUpdate);
 };
 }, [user, authLoading, isAdmin]);

 const handleDelete = async (reportId: string, e: React.MouseEvent) => {
 e.stopPropagation();
 if (!confirm("Are you sure you want to permanently delete this audit record?")) return;
 
 setDeletingId(reportId);
 try {
 await deleteReport(reportId);
 setReports((prev) => prev.filter((r) => r.id !== reportId));
 } catch (err) {
 logger.error("Failed to delete report:", err);
 alert("Failed to delete report.");
 } finally {
 setDeletingId(null);
 }
 };

 const handleCopyLink = (report: AuditReport, e: React.MouseEvent) => {
 e.stopPropagation();
 const slug = urlToDomainSlug(report.url);
 const fullUrl = `${window.location.origin}/reports/${slug}`;
 navigator.clipboard.writeText(fullUrl);
 setCopiedId(report.id || slug);
 setTimeout(() => setCopiedId(null), 2000);
 };

 const handleDirectExportPdf = async (report: AuditReport, e: React.MouseEvent) => {
 e.stopPropagation();
 setExportingId(report.id || 'current');
 try {
 await exportAuditReportDataToPdf(report);
 } catch (err) {
 logger.error("Export PDF failed:", err);
 window.print();
 } finally {
 setExportingId(null);
 }
 };

 const handleNavigateToReport = (report: AuditReport) => {
 const slug = urlToDomainSlug(report.url);
 navigate(`/reports/${slug}`);
 };

 // Filter & Sort
 const filteredReports = reports.filter((r) => {
 const matchesSearch = 
 r.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 r.engine?.toLowerCase().includes(searchQuery.toLowerCase());
 
 const matchesEngine = selectedEngine === 'all' || r.engine === selectedEngine;
 return matchesSearch && matchesEngine;
 });

 filteredReports.sort((a, b) => {
 if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
 if (sortBy === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
 if (sortBy === 'score_high') return (b.score || 0) - (a.score || 0);
 if (sortBy === 'score_low') return (a.score || 0) - (b.score || 0);
 if (sortBy === 'domain') return (a.url || '').localeCompare(b.url || '');
 return 0;
 });

 // Key Metrics
 const totalAudits = reports.length;
 const uniqueDomains = new Set(reports.map(r => extractDomainFromUrl(r.url))).size;
 const validScores = reports.filter(r => typeof r.score === 'number').map(r => r.score!);
 const avgScore = validScores.length > 0
 ? Math.round(validScores.reduce((acc, s) => acc + s, 0) / validScores.length)
 : 92;

 const getGreeting = () => {
 const hour = new Date().getHours();
 if (hour < 12) return 'Good morning';
 if (hour < 18) return 'Good afternoon';
 return 'Good evening';
 };

 const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Developer';

 if (authLoading) {
 return <UserDashboardSkeleton />;
 }

 if (!user) {
 return (
 <div data-theme="dark" className="min-h-screen ds-page-top flex items-center justify-center px-4 bg-background text-foreground relative overflow-hidden font-sans">
 <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_50%_20%,rgba(240,250,255,0.05),transparent_70%)] pointer-events-none" />
 
 <div className="w-full max-w-md p-8 ds-card bg-surface border-border shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl relative z-10 text-center">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border text-[#F0FAFF] mb-5 shadow-inner">
 <LogIn className="h-5 w-5" />
 </div>
 <h2 className="framer-card-title text-xl sm:text-2xl text-foreground">Developer Access Required</h2>
 <p className="mt-2 framer-body-text text-xs sm:text-[13px]">
 Sign in to access real-time telemetry dossiers, autonomous patch branches, domain uptime monitoring, and API tokens.
 </p>

 <div className="mt-6 space-y-3 font-mono text-xs">
 <Link
 to="/login?redirect=/dashboard"
 className="ds-btn ds-btn-primary w-full text-xs sm:text-sm"
 >
 <LogIn className="h-3.5 w-3.5 shrink-0" />
 <span>Sign In with Email or Google</span>
 </Link>

 <Link
 to="/signup?redirect=/dashboard"
 className="ds-btn ds-btn-secondary w-full text-xs sm:text-sm"
 >
 <span>Create Free Developer Account &rarr;</span>
 </Link>
 </div>

 <div className="mt-6 pt-5 border-t border-border flex flex-col items-center justify-center gap-2 font-mono sm:flex-row">
 <button
 onClick={() => loginWithLocalSession({
 email: 'developer@catalystlab.io',
 displayName: 'CatalystLab Developer',
 isAdmin: false
 })}
 className="ds-btn ds-btn-secondary w-full text-xs text-emerald-400 bg-[#F0FAFF]/10 border-emerald-500/20 hover:bg-[#F0FAFF]/20"
 >
 <Sparkles className="h-3.5 w-3.5 shrink-0" />
 <span>Preview Developer Session</span>
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <DashboardShell
 activeView={activeTab}
 onViewChange={(view) => {
 navigate(`/dashboard?tab=${view}`);
 }}
 targetDomain={targetDomain}
 onTargetDomainChange={setTargetDomain}
 onRefreshScan={handleRefreshScan}
 isScanning={isScanning}
 >
 <SEOHead
 title="Developer Telemetry Dashboard & Audits — CatalystLab"
 description="View real-time audit dossiers, rate limit allocations, domain uptime monitoring, and API keys."
 canonicalUrl="https://www.catalystlab.tech/dashboard"
 />

 <div className="relative min-h-full">
   {/* Ambient Subsurface Glows */}
   <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#F0FAFF]/10 blur-[120px] rounded-full pointer-events-none" />
   <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#F0FAFF]/5 blur-[100px] rounded-full pointer-events-none" />

   <AnimatePresence mode="wait">
     <motion.div
       key={activeTab}
       initial={{ opacity: 0, y: 15 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -15 }}
       transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
       className="space-y-6 relative z-10 pt-6"
     >
 {/* TAB 0: OVERVIEW & 8 ENGINES COCKPIT */}
 {(activeTab === 'overview' || activeTab === 'analytics' || activeTab === 'engines') && (
 <div className="space-y-8">
   {/* Welcome Header Section */}
   <div className="sticky top-[var(--nav-height,4rem)] z-20 pt-0 pb-5 bg-[rgba(31,34,35,0.85)] backdrop-blur-2xl border-b border-[rgba(240,250,255,0.08)] px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
     <div>
       <div className="framer-micro-tag text-[#F0FAFF] mb-2">Platform Control Center</div>
       <h1 className="framer-hero-title text-3xl sm:text-4xl lg:text-5xl text-foreground">
         {getGreeting()}, <span className="text-foreground/60">{userName}</span>
       </h1>
       <p className="framer-body-text mt-2 max-w-2xl">
         Your telemetry mesh is active across <span className="text-foreground font-medium">{uniqueDomains} domains</span>. 
         The mean health score is currently <span className="text-emerald-400 font-medium">{avgScore}/100</span>.
       </p>
     </div>
     <div className="flex items-center gap-3">
       <Link 
         to="/master-audit" 
         className="ds-btn ds-btn-primary px-5"
       >
         <Sparkles className="size-4 mr-2" />
         <span>New Master Audit</span>
       </Link>
     </div>
   </div>
 {/* 3-Column Bento-Grid Layout for Platform Metrics (Visual Parity with Audit Dossiers) */}
 <DashboardMetricsBentoGrid
 totalAudits={totalAudits}
 avgScore={avgScore}
 uniqueDomains={uniqueDomains}
 rateStatus={rateStatus}
 targetDomain={targetDomain}
 onNavigateTab={(tabKey) => navigate(`/dashboard?tab=${tabKey}`)}
 />


 {/* Autonomous Dossier Engine Cockpit */}
 <FramerDossierCockpit
 targetDomain={targetDomain}
 onRefreshScan={handleRefreshScan}
 isScanning={isScanning}
 showTopKpi={false}
 />

 {/* Quick Recent Dossiers Vault Strip - 3-Column Bento Grid Layout with ds-card and ds-card-interactive */}
<div className="space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="framer-micro-tag text-[#F0FAFF]">Telemetry Vault</div>
<h2 className="framer-card-title text-foreground">Recent Audit Dossiers</h2>
</div>
<button
onClick={() => navigate('/dashboard?tab=audits')}
className="ds-btn ds-btn-secondary py-1 px-3 text-[11px] h-8"
>
<span>View All Vaults</span>
<ArrowRight className="size-3 ml-1.5" />
</button>
</div>

{reports.length === 0 ? (
<div className="ds-card p-12 text-center border-dashed border-foreground/10">
<FileText className="size-8 mx-auto text-muted-foreground/30 mb-3" />
<p className="framer-body-text max-w-xs mx-auto">
No telemetry audits recorded yet. Run a domain inspection above to record your first dossier.
</p>
</div>
) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {reports.slice(0, 6).map((report) => (
 <motion.div
 key={report.id}
 whileHover={{ y: -4 }}
 onClick={() => setQuickViewReport(report)}
 className="ds-card ds-card-interactive group p-5 flex flex-col justify-between cursor-pointer bg-surface/50 backdrop-blur-sm"
 >
 <div>
 {/* Top Card Bar - Visual Parity with Audit Dossier Cards */}
 <div className="flex items-start justify-between gap-3 pb-3 border-b border-foreground/5">
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-foreground/10 text-[#F0FAFF] shrink-0 group-hover:border-[#F0FAFF]/30 transition-colors">
 <Globe className="h-4 w-4" />
 </div>
 <div className="min-w-0">
 <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-[#F0FAFF] transition-colors tracking-tight">
 {extractDomainFromUrl(report.url)}
 </h4>
 <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5">
 <Calendar className="h-3 w-3" />
 {report.createdAt ? new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
 </span>
 </div>
 </div>

 {/* Score Pill */}
 <div
 className={`py-1 px-2.5 rounded-lg text-[11px] font-bold border shrink-0 ${
 (report.score ?? 0) >= 90
 ?"bg-[#F0FAFF]/10 text-emerald-400 border-emerald-500/20"
 :"bg-[#F0FAFF]/10 text-amber-400 border-amber-500/20"
 }`}
 >
 {report.score ?? 85}
 </div>
 </div>

 {/* Middle Content */}
 <div className="py-4 space-y-2">
 <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FAFF]/10 border border-[#F0FAFF]/20 py-0.5 px-2 text-[9px] font-mono font-bold text-[#F0FAFF] uppercase tracking-wider">
 <Sparkles className="h-2.5 w-2.5" />
 <span>{report.engine ? report.engine.toUpperCase() : 'MASTER AUDIT'}</span>
 </div>
 <p className="framer-body-text text-[13px] line-clamp-2 leading-relaxed">
 {report.summary || report.title || `Autonomous telemetry dossier evaluated for ${report.url}`}
 </p>
 </div>
 </div>

 {/* Card Action Footer */}
 <div className="pt-3 border-t border-foreground/5 flex items-center justify-between">
 <div className="flex items-center gap-2">
   <div className="flex -space-x-1">
     {[1, 2, 3].map((i) => (
       <div key={i} className="size-4 rounded-full bg-surface border border-background flex items-center justify-center overflow-hidden">
         <Activity className="size-2 text-muted-foreground/50" />
       </div>
     ))}
   </div>
   <span className="text-[10px] font-mono text-muted-foreground">38 PoPs</span>
 </div>
 <div className="text-[11px] font-semibold text-[#F0FAFF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
 <span>Open Dossier</span>
 <ArrowRight className="h-3 w-3" />
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {/* TAB: AUTOMATED PR PATCHES */}
 {activeTab === 'patches' && (
 <div className="space-y-6">
 <div className="ds-card p-5 sm:p-6 font-mono">
 <div className="flex items-center gap-2 text-xs text-[#F0FAFF] mb-1">
 <GitBranch className="size-3.5" />
 <span>GHLyase · Autonomous Patch Deployment Pipeline</span>
 </div>
 <h2 className="text-base font-semibold text-foreground font-sans">Automated GitHub Pull Request Patches</h2>
 <p className="text-xs text-muted-foreground font-sans mt-1 max-w-xl">
 When CatalystLab engines detect Core Web Vitals degradation, render-blocking scripts, or OWASP transport gaps, GHLyase automatically compiles AST patches and dispatches verified PRs directly to your GitHub repository.
 </p>
 </div>
 <UserGithubWebhookView />
 </div>
 )}

 {/* TAB: SECURITY */}
 {activeTab === 'security' && (
 <div className="space-y-6">
 <div className="ds-card p-5 sm:p-6 font-mono">
 <div className="flex items-center gap-2 text-xs text-amber-400 mb-1">
 <ShieldAlert className="size-3.5" />
 <span>RiskProtease · OWASP Transport Security Vault</span>
 </div>
 <h2 className="text-base font-semibold text-foreground font-sans">Security Alerts &amp; Compliance Logs</h2>
 <p className="text-xs text-muted-foreground font-sans mt-1 max-w-xl">
 Continuous inspection of TLS 1.3 cipher negotiation, Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), and Permissions-Policy headers.
 </p>
 </div>
 <FramerDossierCockpit targetDomain={targetDomain} />
 </div>
 )}

 {/* TAB 1: AUDIT REPORTS & DOSSIERS */}
 {activeTab === 'audits' && (
 <div className="space-y-5">
 
 {/* Search & Filtering Bar */}
 <div className="ds-card flex flex-col gap-3 p-3.5 sm:p-4 font-mono">
 
 {/* Search Bar */}
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"/>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search domain, engine, or keywords..."
 className="ds-input pl-9 w-full text-xs bg-background"
 />
 </div>

 {/* Engine Selector Dropdown */}
 <div className="flex flex-wrap items-center gap-2">
 <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
 <Filter className="h-3 w-3 text-muted-foreground"/>
 <span>Catalyst:</span>
 </div>
 <select
 value={selectedEngine}
 onChange={(e) => setSelectedEngine(e.target.value)}
 className="ds-select text-xs font-mono"
 >
 <option value="all">All Catalysts</option>
 <option value="master">Master Audit (All 8)</option>
 {Object.entries(ENGINES_MAP).map(([key, item]) => (
 <option key={key} value={key}>
 {item.shortCode ? `[${item.shortCode}] ` : ''}{item.name}
 </option>
 ))}
 </select>

 {/* Sort Selector */}
 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value as any)}
 className="ds-select text-xs font-mono"
 >
 <option value="newest">Newest First</option>
 <option value="oldest">Oldest First</option>
 <option value="score_high">Score: High to Low</option>
 <option value="score_low">Score: Low to High</option>
 <option value="domain">Domain: A to Z</option>
 </select>

 {/* View Mode Switcher */}
 <div className="flex items-center rounded-lg border border-border bg-accent p-0.5">
 <button
 onClick={() => setViewMode('grid')}
 className={`p-1 rounded transition-colors cursor-pointer ${
 viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'ds-muted hover:text-foreground'
 }`}
 title="Grid View"
 >
 <Grid className="h-3.5 w-3.5"/>
 </button>
 <button
 onClick={() => setViewMode('table')}
 className={`p-1 rounded transition-colors cursor-pointer ${
 viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'ds-muted hover:text-foreground'
 }`}
 title="Table View"
 >
 <List className="h-3.5 w-3.5"/>
 </button>
 </div>
 </div>

 </div>

 {/* Reports List / Grid */}
 {loading ? (
 viewMode === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"role="status"aria-label="Loading reports...">
 {Array.from({ length: 6 }).map((_, i) => (
 <SkeletonCard key={i} />
 ))}
 </div>
 ) : (
 <SkeletonTable rows={5} columns={4} />
 )
 ) : filteredReports.length === 0 ? (
 <div className="ds-card p-8 sm:p-12 text-center">
 <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5 border border-foreground/10">
 <FileText className="h-7 w-7 text-muted-foreground"/>
 </div>
 <h2 className="text-base sm:text-lg font-semibold text-foreground">No Reports Found</h2>
 <p className="mt-4 max-w-lg mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">
 {searchQuery || selectedEngine !== 'all' 
 ?"No reports match your active search filters. Try clearing the search query."
 :"You haven't run any audits yet. Launch your first Master Audit to generate a permanent dossier."}
 </p>
 <div className="mt-8 flex justify-center">
 <Link
 to="/master-audit"
 className="ds-btn ds-btn-primary text-sm"
 >
 <Sparkles className="h-4 w-4 shrink-0"/>
 <span>Run Master Audit</span>
 </Link>
 </div>
 </div>
 ) : viewMode === 'grid' ? (
 
 /* GRID VIEW */
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
 {filteredReports.map((report) => {
 const domain = extractDomainFromUrl(report.url);
 const isMaster = report.engine === 'all' || report.engine === 'master';
 const engineMeta = isMaster 
 ? { name: 'Master Multi-Catalyst Audit', icon: 'auto_awesome' } 
 : ENGINES_MAP[report.engine] || { name: report.engine, icon: 'analytics' };

 return (
 <div
 key={report.id}
 onClick={() => handleNavigateToReport(report)}
 className="ds-card group p-4 flex flex-col ds-card-interactive"
 >
 <div>
 {/* Top Card Bar */}
 <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
 <div className="flex items-center gap-2 min-w-0">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent border border-border text-amber-600 shrink-0">
 <Globe className="h-3.5 w-3.5"/>
 </div>
 <div className="min-w-0">
 <h4 className="text-xs font-bold text-foreground truncate group-hover:text-amber-600 transition-colors">
 {domain}
 </h4>
 <span className="text-[10px] ds-muted flex items-center gap-1">
 <Calendar className="h-2.5 w-2.5"/>
 {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
 </span>
 </div>
 </div>

 {/* Score Pill */}
 <div className={` py-0.5 rounded text-xs font-bold border ${
 (report.score || 90) >= 90
 ? 'bg-[#F0FAFF]/10 text-emerald-400 border-emerald-500/20'
 : (report.score || 90) >= 75
 ? 'bg-[#F0FAFF]/10 text-amber-400 border-amber-500/20'
 : 'bg-[#F7FDFF]/10 text-rose-400 border-rose-500/20'
 }`}>
 {report.score || 92}/100
 </div>
 </div>

 {/* Middle Content */}
 <div className="py-3 space-y-1.5">
 <div className="inline-flex items-center gap-1 rounded bg-accent border border-border py-0.5 text-[10px] font-bold ds-muted">
 <Sparkles className="h-2.5 w-2.5 text-amber-500"/>
 <span>{engineMeta.name}</span>
 </div>
 <p className="text-[11px] ds-muted line-clamp-2 leading-relaxed font-sans">
 {report.summary || report.title || `Telemetry audit evaluated for ${report.url}`}
 </p>
 </div>
 </div>

 {/* Card Action Footer */}
 <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
 <div className="flex items-center gap-1">
 <button
 onClick={(e) => {
 e.stopPropagation();
 setQuickViewReport(report);
 }}
 className="p-1 rounded ds-muted hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
 title="Quick View"
 >
 <Eye className="h-3.5 w-3.5"/>
 </button>
 <button
 onClick={(e) => handleDirectExportPdf(report, e)}
 disabled={exportingId === report.id}
 className="p-1 rounded ds-muted hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
 title="Export PDF"
 >
 <Download className={`h-3.5 w-3.5 ${exportingId === report.id ? 'animate-bounce' : ''}`} />
 </button>
 <button
 onClick={(e) => handleCopyLink(report, e)}
 className="p-1 rounded ds-muted hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
 title="Copy Permalink"
 >
 {copiedId === report.id ? <Check className="h-3.5 w-3.5 text-emerald-600"/> : <Share2 className="h-3.5 w-3.5"/>}
 </button>
 <button
 onClick={(e) => handleDelete(report.id!, e)}
 disabled={deletingId === report.id}
 className="p-1 rounded ds-muted hover:bg-[#F7FDFF]/10 hover:text-rose-400 transition-colors cursor-pointer"
 title="Delete Report"
 >
 <Trash2 className="h-3.5 w-3.5"/>
 </button>
 </div>

 <span className="text-xs font-bold ds-muted group-hover:text-foreground flex items-center gap-1">
 <span>Read Dossier</span>
 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1"/>
 </span>
 </div>
 </div>
 );
 })}
 </div>
 ) : (

 /* TABLE VIEW */
 <div className="ds-card font-mono p-4">
 <table className="w-full text-left text-xs"aria-label="Audit reports list">
 <thead className="bg-muted border-b border-border ds-eyebrow">
 <tr>
 <th className="py-3">Target Domain</th>
 <th className="py-3">Diagnostic Engine</th>
 <th className="py-3">Health Score</th>
 <th className="py-3">Audited Date</th>
 <th className="py-3 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filteredReports.map((report) => {
 const domain = extractDomainFromUrl(report.url);
 const isMaster = report.engine === 'all' || report.engine === 'master';
 const engineName = isMaster ? 'Master Audit (All 8)' : ENGINES_MAP[report.engine]?.name || report.engine;

 return (
 <tr 
 key={report.id}
 onClick={() => handleNavigateToReport(report)}
 className="hover:bg-muted cursor-pointer transition-colors"
 >
 <td className="py-3 font-bold text-foreground">
 <div className="flex items-center gap-2">
 <Globe className="h-3.5 w-3.5 text-amber-600"/>
 <span>{domain}</span>
 </div>
 </td>
 <td className="py-3 ds-muted">
 <span className="rounded bg-accent py-0.5 font-bold text-[11px] border border-border text-foreground">
 {engineName}
 </span>
 </td>
 <td className="py-3 font-bold">
 <span className={` py-0.5 rounded text-[11px] border ${
 (report.score || 90) >= 90
 ? 'bg-[#F0FAFF]/10 text-emerald-400 border-emerald-500/20'
 : 'bg-[#F0FAFF]/10 text-amber-400 border-amber-500/20'
 }`}>
 {report.score || 92}/100
 </span>
 </td>
 <td className="py-3 ds-muted">
 {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
 </td>
 <td className="py-3 text-right"onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-end gap-1">
 <button
 onClick={(e) => {
 e.stopPropagation();
 setQuickViewReport(report);
 }}
 className="p-1 rounded ds-muted hover:text-foreground cursor-pointer"
 title="Quick View"
 >
 <Eye className="h-3 w-3"/>
 </button>
 <button
 onClick={(e) => handleDirectExportPdf(report, e)}
 className="p-1 rounded ds-muted hover:text-foreground cursor-pointer"
 title="Export PDF"
 >
 <Download className="h-3 w-3"/>
 </button>
 <button
 onClick={(e) => handleCopyLink(report, e)}
 className="p-1 rounded ds-muted hover:text-foreground cursor-pointer"
 title="Copy Link"
 >
 {copiedId === report.id ? <Check className="h-3 w-3 text-emerald-600"/> : <Share2 className="h-3 w-3"/>}
 </button>
 <button
 onClick={(e) => handleDelete(report.id!, e)}
 className="p-1 rounded ds-muted hover:text-red-600 cursor-pointer"
 title="Delete"
 >
 <Trash2 className="h-3 w-3"/>
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}

 </div>
 )}

 {/* TAB: EXECUTIVE TELEMETRY REPORTS & DOSSIERS */}
 {activeTab === 'reports' && (
 <div className="space-y-6">
 <div className="ds-card p-5 sm:p-6 font-mono">
 <div className="flex items-center gap-2 text-xs text-[#F0FAFF] mb-1">
 <FileText className="size-3.5" />
 <span>CatalystLab · Telemetry Dossiers &amp; Executive Compliance Reports</span>
 </div>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <h2 className="text-base font-semibold text-foreground font-sans">Executive Telemetry Reports &amp; Audit Dossiers</h2>
 <p className="text-xs text-muted-foreground font-sans mt-1 max-w-xl">
 Permanent audit compliance records, Core Web Vitals score distributions, and certified PDF dossier exports across inspected edge domains.
 </p>
 </div>
 <Link
 to="/master-audit"
 className="ds-btn ds-btn-primary text-xs shrink-0 self-start sm:self-auto"
 >
 <Sparkles className="size-3.5 text-amber-300 shrink-0" />
 <span>Generate New Report</span>
 </Link>
 </div>

 {/* Summary Metrics Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border">
 <div className="p-3 rounded-xl bg-surface border border-border">
 <div className="text-[10px] uppercase text-muted-foreground">Total Dossiers</div>
 <div className="text-lg font-bold text-foreground mt-0.5">{reports.length}</div>
 </div>
 <div className="p-3 rounded-xl bg-surface border border-border">
 <div className="text-[10px] uppercase text-muted-foreground">Mean Health Score</div>
 <div className="text-lg font-bold text-emerald-400 mt-0.5">{avgScore}/100</div>
 </div>
 <div className="p-3 rounded-xl bg-surface border border-border">
 <div className="text-[10px] uppercase text-muted-foreground">Unique Edge Meshes</div>
 <div className="text-lg font-bold text-[#F0FAFF] mt-0.5">{uniqueDomains}</div>
 </div>
 <div className="p-3 rounded-xl bg-surface border border-border">
 <div className="text-[10px] uppercase text-muted-foreground">Export Standards</div>
 <div className="text-lg font-bold text-purple-400 mt-0.5">PDF · JSON · CSV</div>
 </div>
 </div>
 </div>

 {/* Dossiers Archive Grid */}
 <div className="ds-card p-5 font-mono">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
 <div className="flex items-center gap-2">
 <span className="text-xs uppercase tracking-wider text-muted-foreground">Certified Audit Dossiers Vault</span>
 <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)] border border-border text-foreground">
 {reports.length} Recorded
 </span>
 </div>
 </div>

 {reports.length === 0 ? (
 <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
 No audit dossiers recorded yet. Launch a Master Audit to generate your first certified telemetry report.
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {reports.map((report) => (
 <div
 key={report.id}
 className="ds-card ds-card-interactive p-4 flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between pb-2 border-b border-border">
 <span className="text-xs font-bold text-foreground truncate max-w-[160px]">
 {extractDomainFromUrl(report.url)}
 </span>
 <span className="text-xs font-bold text-emerald-400">
 {report.score || 92}/100
 </span>
 </div>
 <p className="text-[11px] text-muted-foreground my-2 line-clamp-2 font-sans">
 {report.summary || report.title || `Autonomous telemetry audit dossier evaluated for ${report.url}`}
 </p>
 </div>
 <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
 <button
 onClick={(e) => handleDirectExportPdf(report, e)}
 disabled={exportingId === report.id}
 className="ds-btn ds-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1.5 cursor-pointer"
 >
 <Download className={`size-3 ${exportingId === report.id ? 'animate-bounce' : ''}`} />
 <span>Export PDF</span>
 </button>
 <button
 onClick={() => handleNavigateToReport(report)}
 className="text-xs text-[#F0FAFF] hover:underline flex items-center gap-1 cursor-pointer"
 >
 <span>View</span>
 <ArrowRight className="size-3" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {/* TAB 2: COMPUTE QUOTA & RATE LIMITS */}
 {activeTab === 'rate-limits' && (
 <UserRateLimitAllocationCard />
 )}

 {/* TAB 3: DOMAIN MONITORING RADAR */}
 {activeTab === 'monitoring' && (
 <UserDomainMonitoringRadar reports={reports} />
 )}

 {/* TAB 4: BLOGS & RESEARCH */}
 {activeTab === 'blogs' && (
 <RoleContentGate requiredPermission="feature:write_blogs"minPlan="Pro"mode="blur">
 <UserBlogManagementView />
 </RoleContentGate>
 )}

 {/* TAB 5: API KEYS & WHITE-LABEL ACCESS */}
 {activeTab === 'api-keys' && (
 <RoleContentGate requiredPermission="feature:api_access"minPlan="Pro"mode="blur">
 <UserApiKeyManagementView />
 </RoleContentGate>
 )}

 {/* TAB 6: GITHUB WEBHOOKS & REAL-TIME TELEMETRY */}
 {activeTab === 'webhooks' && (
 <UserGithubWebhookView />
 )}

     </motion.div>
   </AnimatePresence>
 </div>

 {/* Audit Detail Modal with Staggered Entry Animation */}
 <AuditDetailModal
 report={quickViewReport}
 isOpen={Boolean(quickViewReport)}
 onClose={() => setQuickViewReport(null)}
 onViewFullReport={handleNavigateToReport}
 />
 </DashboardShell>
 );
};

export default UserDashboardPage;
