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
import { UserBlogManagementView } from '../components/user/UserBlogManagementView';
import { UserRateLimitAllocationCard } from '../components/user/UserRateLimitAllocationCard';
import { UserDomainMonitoringRadar } from '../components/user/UserDomainMonitoringRadar';
import { UserAnalyticsDashboard } from '../components/user/UserAnalyticsDashboard';
import { UserApiKeyManagementView } from '../components/user/UserApiKeyManagementView';
import { UserGithubWebhookView } from '../components/user/UserGithubWebhookView';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { FramerDossierCockpit } from '../components/dashboard/FramerDossierCockpit';
import { SEOHead } from '../components/common/SEOHead';
import { useLocation, useParams } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { logger } from '../lib/logger';
import { UserDashboardSkeleton, SkeletonCard, SkeletonTable } from '../components/skeleton';

export const UserDashboardPage: React.FC = () => {
 const { user, isAdmin, loading: authLoading, loginWithLocalSession, setShowDomainModal } = useAuth();
 const { roleConfig } = useRoleSecurity();
 const navigate = useNavigate();
 const location = useLocation();
 const { tab } = useParams<{ tab: string }>();

 const getActiveView = (): string => {
 if (tab) {
   if (tab === 'github') return 'patches';
   if (tab === 'webhooks') return 'patches';
   return tab;
 }
 if (location.pathname.endsWith('/webhooks') || location.pathname.endsWith('/github')) return 'patches';
 if (location.pathname.endsWith('/audits')) return 'audits';
 if (location.pathname.endsWith('/rate-limits')) return 'rate-limits';
 if (location.pathname.endsWith('/api-keys')) return 'api-keys';
 if (location.pathname.endsWith('/monitoring')) return 'monitoring';
 if (location.pathname.endsWith('/blogs')) return 'blogs';
 if (location.pathname.endsWith('/security')) return 'security';
 if (location.pathname.endsWith('/engines')) return 'engines';
 if (location.pathname.endsWith('/patches')) return 'patches';
 const params = new URLSearchParams(location.search);
 const tabParam = params.get('tab');
 if (tabParam) {
   if (tabParam === 'github' || tabParam === 'webhooks') return 'patches';
   return tabParam;
 }
 return 'analytics';
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
 const [targetDomain, setTargetDomain] = useState<string>('acme.corp');
 const [isScanning, setIsScanning] = useState<boolean>(false);

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
 <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-[#000000] text-white relative overflow-hidden font-sans">
 <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_50%_20%,rgba(0,102,255,0.12),transparent_70%)] pointer-events-none" />
 <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

 <div className="w-full max-w-md p-8 bg-[#0B0B0B] border border-white/12 rounded-3xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl relative z-10 text-center">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#141414] border border-white/15 text-[#00D2FF] mb-5 shadow-inner">
 <LogIn className="h-5 w-5" />
 </div>
 <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-white">Developer Access Required</h2>
 <p className="mt-2 text-xs sm:text-[13px] text-[#999999] leading-relaxed">
 Sign in to access real-time telemetry dossiers, autonomous patch branches, domain uptime monitoring, and API tokens.
 </p>

 <div className="mt-6 space-y-3 font-mono text-xs">
 <Link
 to="/login?redirect=/dashboard"
 className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-all shadow-[0_0_18px_rgba(255,255,255,0.25)] cursor-pointer"
 >
 <LogIn className="h-3.5 w-3.5" />
 <span>Sign In with Email or Google</span>
 </Link>

 <Link
 to="/signup?redirect=/dashboard"
 className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#141414] border border-white/10 text-white font-medium hover:border-white/25 hover:bg-[#1A1A1A] transition-all cursor-pointer"
 >
 <span>Create Free Developer Account &rarr;</span>
 </Link>
 </div>

 <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center justify-center gap-2 font-mono sm:flex-row">
 <button
 onClick={() => loginWithLocalSession({
 email: 'developer@catalystlab.io',
 displayName: 'CatalystLab Developer',
 isAdmin: false
 })}
 className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-all cursor-pointer"
 >
 <Sparkles className="h-3.5 w-3.5" />
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

 <div className="space-y-6">
 {/* TAB 0: ANALYTICS & 8 ENGINES COCKPIT */}
 {(activeTab === 'analytics' || activeTab === 'engines') && (
 <div className="space-y-8">
 <FramerDossierCockpit
 targetDomain={targetDomain}
 onRefreshScan={handleRefreshScan}
 isScanning={isScanning}
 />

 {/* Quick Recent Dossiers Vault Strip */}
 <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 shadow-xl">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2 font-mono">
 <span className="text-xs uppercase tracking-wider text-[#666666]">Telemetry Dossiers</span>
 <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white">
 {reports.length} Recorded
 </span>
 </div>
 <button
 onClick={() => navigate('/dashboard?tab=audits')}
 className="text-xs font-mono text-[#00D2FF] hover:underline cursor-pointer"
 >
 Open Full Audit Vault &rarr;
 </button>
 </div>

 {reports.length === 0 ? (
 <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-xs text-[#666666] font-mono">
 No telemetry audits recorded yet. Run a domain inspection above or click "Run Audit" to record your first dossier.
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
 {reports.slice(0, 6).map((report) => (
 <div
 key={report.id}
 onClick={() => setQuickViewReport(report)}
 className="p-3.5 rounded-xl bg-[#0F0F0F] border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
 >
 <div className="flex items-center justify-between text-xs font-mono mb-1.5">
 <span className="text-white font-medium truncate max-w-[160px]">{extractDomainFromUrl(report.url)}</span>
 <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
 (report.score ?? 0) >= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
 }`}>
 {report.score ?? 85}/100
 </span>
 </div>
 <div className="text-[11px] text-[#666666] flex items-center justify-between font-mono">
 <span>{report.engine ? report.engine.toUpperCase() : 'MASTER AUDIT'}</span>
 <span>{new Date(report.createdAt).toLocaleDateString()}</span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {/* TAB: AUTOMATED PR PATCHES */}
 {activeTab === 'patches' && (
 <div className="space-y-6">
 <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 font-mono">
 <div className="flex items-center gap-2 text-xs text-[#00D2FF] mb-1">
 <GitBranch className="size-3.5" />
 <span>GHLyase · Autonomous Patch Deployment Pipeline</span>
 </div>
 <h2 className="text-base font-semibold text-white font-sans">Automated GitHub Pull Request Patches</h2>
 <p className="text-xs text-[#888888] font-sans mt-1 max-w-xl">
 When CatalystLab engines detect Core Web Vitals degradation, render-blocking scripts, or OWASP transport gaps, GHLyase automatically compiles AST patches and dispatches verified PRs directly to your GitHub repository.
 </p>
 </div>
 <UserGithubWebhookView />
 </div>
 )}

 {/* TAB: SECURITY */}
 {activeTab === 'security' && (
 <div className="space-y-6">
 <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 font-mono">
 <div className="flex items-center gap-2 text-xs text-amber-400 mb-1">
 <ShieldAlert className="size-3.5" />
 <span>RiskProtease · OWASP Transport Security Vault</span>
 </div>
 <h2 className="text-base font-semibold text-white font-sans">Security Alerts &amp; Compliance Logs</h2>
 <p className="text-xs text-[#888888] font-sans mt-1 max-w-xl">
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
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ds-muted"/>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search domain, engine, or keywords..."
 className="ds-card w-full text-xs p-4"
 />
 </div>

 {/* Engine Selector Dropdown */}
 <div className="flex flex-wrap items-center gap-2">
 <div className="flex items-center gap-1 text-xs font-bold ds-muted">
 <Filter className="h-3 w-3 ds-muted"/>
 <span>Catalyst:</span>
 </div>
 <select
 value={selectedEngine}
 onChange={(e) => setSelectedEngine(e.target.value)}
 className="ds-card text-xs font-bold p-4"
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
 className="ds-card text-xs font-bold p-4"
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
 <div className="ds-card p-10 text-center font-mono">
 <FileText className="mx-auto h-10 w-10 ds-muted mb-3"/>
 <h2 className="text-sm font-bold text-foreground">No Reports Found</h2>
 <p className="mt-1 max-w-3xl mx-auto text-xs ds-muted">
 {searchQuery || selectedEngine !== 'all' 
 ?"No reports match your active search filters. Try clearing the search query."
 :"You haven't run any audits yet. Launch your first Master Audit to generate a permanent dossier."}
 </p>
 <div className="mt-5">
 <Link
 to="/master-audit"
 className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover border border-border px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-sm"
 >
 <Sparkles className="h-3.5 w-3.5 text-amber-500"/>
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
 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
 : (report.score || 90) >= 75
 ? 'bg-amber-50 text-amber-700 border-amber-200'
 : 'bg-red-50 text-red-700 border-red-200'
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
 className="p-1 rounded ds-muted hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
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
 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
 : 'bg-amber-50 text-amber-700 border-amber-200'
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

 </div>
 </DashboardShell>
 );
};

export default UserDashboardPage;
