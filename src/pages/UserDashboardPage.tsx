import React, { useEffect, useState } from 'react';
import { clickableProps } from '../lib/keyboard';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleSecurity } from '../context/RoleSecurityContext';
import { RoleContentGate } from '../components/common/RoleContentGate';
import { getUserReports, deleteReport } from '../lib/firebase';
import { ENGINES_MAP } from '../data/engines';
import { urlToDomainSlug, extractDomainFromUrl } from '../utils/slugUtils';
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
 Printer,
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

 const handlePrintReport = (report: AuditReport, e: React.MouseEvent) => {
 e.stopPropagation();
 // There is no server-side PDF renderer, so this opens the browser print dialog
 // (where "Save as PDF" is available) instead of claiming a generated file.
 window.print();
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
 : null;

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
 <div className="min-h-screen ds-page-top flex items-center justify-center px-4 bg-background text-foreground relative overflow-hidden font-sans">
 <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_50%_20%,rgba(240,250,255,0.05),transparent_70%)] pointer-events-none" />
 
 <div className="w-full max-w-md p-8 ds-card bg-surface border-border shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl relative z-10 text-center">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border text-foreground mb-5 shadow-inner">
 <LogIn className="h-5 w-5" />
 </div>
 <h2 className="framer-card-title text-xl sm:text-2xl text-foreground">Sign in to open your dashboard</h2>
 <p className="mt-2 framer-body-text text-sm">
 Your saved audits, score history, API keys and monitoring all live under your account.
 </p>

 <div className="mt-6 space-y-3 font-mono text-xs">
 <Link
 to="/login?redirect=/dashboard"
 className="ds-btn ds-btn-primary w-full text-xs sm:text-sm"
 >
 <LogIn className="h-3.5 w-3.5 shrink-0" />
 <span>Sign in</span>
 </Link>

 <Link
 to="/signup?redirect=/dashboard"
 className="ds-btn ds-btn-secondary w-full text-xs sm:text-sm"
 >
 <span>Create an account &rarr;</span>
 </Link>
 </div>

 {import.meta.env.DEV && (
 <div className="mt-6 border-t border-border pt-5 font-mono">
 <button
 onClick={() => loginWithLocalSession({
 email: 'developer@catalystlab.io',
 displayName: 'CatalystLab Developer',
 isAdmin: false
 })}
 className="ds-btn ds-btn-secondary w-full text-xs text-success bg-cream/10 border-success/20 hover:bg-cream/20"
 >
 <Sparkles className="h-3.5 w-3.5 shrink-0" />
 <span>Preview developer session</span>
 </button>
 </div>
 )}
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
   <div className="sticky top-[var(--nav-height,4rem)] z-20 pt-0 pb-5 bg-background/85 backdrop-blur-xl border-b border-border px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
     <div>
       <h1 className="framer-hero-title text-3xl sm:text-4xl lg:text-5xl text-foreground">
         {getGreeting()}, <span className="text-foreground/60">{userName}</span>
       </h1>
       <p className="framer-body-text mt-2 max-w-2xl">
         {totalAudits === 0
           ? 'No audits saved yet. Run one and the result, with a shareable permalink, appears here.'
           : <>
               {totalAudits} {totalAudits === 1 ? 'audit' : 'audits'} across {uniqueDomains}{' '}
               {uniqueDomains === 1 ? 'domain' : 'domains'}.
               {avgScore !== null && <> Mean health score <span className="font-medium text-foreground">{avgScore}/100</span>.</>}
             </>}
       </p>
     </div>
     <div className="flex items-center gap-3">
       <Link to="/audit" className="ds-btn ds-btn-primary px-5">
         <Sparkles className="size-4" aria-hidden="true" />
         <span>Run a new audit</span>
       </Link>
     </div>
   </div>
 {/* Summary tiles */}
 <DashboardMetricsBentoGrid
 totalAudits={totalAudits}
 avgScore={avgScore}
 uniqueDomains={uniqueDomains}
 rateStatus={rateStatus}
 targetDomain={targetDomain}
 onNavigateTab={(tabKey) => navigate(`/dashboard?tab=${tabKey}`)}
 />


 {/* New audit panel */}
 <FramerDossierCockpit
 targetDomain={targetDomain}
 onRefreshScan={handleRefreshScan}
 isScanning={isScanning}
 showTopKpi={false}
 />

 {/* Recent audits */}
<div className="space-y-4">
<div className="flex items-center justify-between gap-3">
<h2 className="framer-card-title text-foreground">Recent audits</h2>
<button
type="button"
onClick={() => navigate('/dashboard?tab=audits')}
className="ds-btn ds-btn-secondary h-9 px-3 text-xs"
>
<span>View all</span>
<ArrowRight className="size-3 ml-1.5" aria-hidden="true" />
</button>
</div>

{reports.length === 0 ? (
<div className="ds-card p-12 text-center border-dashed border-foreground/10">
<FileText className="size-8 mx-auto text-muted-foreground/30 mb-3" />
<p className="framer-body-text mx-auto max-w-sm">
No audits yet. Run one and the reading appears here, with a permalink you can share.
</p>
<Link to="/audit" className="ds-btn ds-btn-primary mt-5 text-sm">Run your first audit</Link>
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
 {/* Card header */}
 <div className="flex items-start justify-between gap-3 pb-3 border-b border-foreground/5">
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-foreground/10 text-foreground shrink-0 group-hover:border-cream/30 transition-colors">
 <Globe className="h-4 w-4" />
 </div>
 <div className="min-w-0">
 <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-foreground transition-colors tracking-tight">
 {extractDomainFromUrl(report.url)}
 </h4>
 {report.createdAt ? (
 <span className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
 <Calendar className="h-3 w-3" aria-hidden="true" />
 <time dateTime={new Date(report.createdAt).toISOString()}>
 {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
 </time>
 </span>
 ) : null}
 </div>
 </div>

 {/* Score */}
 <div
 className={`shrink-0 rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold ${
 typeof report.score !== 'number'
 ? 'border-border bg-muted text-muted-foreground'
 : report.score >= 90
 ? 'border-success/20 bg-success/10 text-success'
 : report.score >= 75
 ? 'border-warning/20 bg-warning/10 text-warning'
 : 'border-danger/20 bg-danger/10 text-danger'
 }`}
 >
 {typeof report.score === 'number' ? report.score : 'No score'}
 </div>
 </div>

 {/* Middle Content */}
 <div className="py-4 space-y-2">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-foreground">
 <Sparkles className="h-3 w-3" aria-hidden="true" />
 <span>
 {report.engine && ENGINES_MAP[report.engine]
 ? ENGINES_MAP[report.engine].name
 : 'Master audit (8 engines)'}
 </span>
 </div>
 <p className="framer-body-text text-sm line-clamp-2 leading-relaxed">
 {report.summary || report.title || `Audit of ${extractDomainFromUrl(report.url)}`}
 </p>
 </div>
 </div>

 {/* Card footer */}
 <div className="flex items-center justify-between border-t border-foreground/5 pt-3">
 <span className="truncate font-mono text-xs text-muted-foreground">
 {report.createdAt
 ? new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
 : 'Date not recorded'}
 </span>
 <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
 <span>Open report</span>
 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
 </span>
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
 <div className="ds-card p-5 sm:p-6">
 <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
 <GitBranch className="size-4 text-muted-foreground" aria-hidden="true" />
 Automated pull requests
 </h2>
 <p className="mt-2 max-w-xl text-sm text-muted-foreground">
 When an engine finds a Core Web Vitals regression, a render-blocking script, or a
 transport-security gap, GitLygase can open a pull request with the fix in the GitHub
 repository you connect below.
 </p>
 </div>
 <UserGithubWebhookView />
 </div>
 )}

 {/* TAB: SECURITY */}
 {activeTab === 'security' && (
 <div className="space-y-6">
 <div className="ds-card p-5 sm:p-6">
 <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
 <ShieldAlert className="size-4 text-warning" aria-hidden="true" />
 Security checks
 </h2>
 <p className="mt-2 max-w-xl text-sm text-muted-foreground">
 The RiskProtease engine reads the transport layer of one URL: TLS version and
 cipher, Strict-Transport-Security, Content-Security-Policy, and Permissions-Policy
 headers. Run it on demand; results appear under Audits.
 </p>
 <Link to="/audit" className="ds-btn ds-btn-secondary mt-4 h-11 text-sm">
 <span>Run an audit</span>
 <ArrowRight className="size-4" aria-hidden="true" />
 </Link>
 </div>
 <ul className="grid gap-3 sm:grid-cols-2">
 {['TLS version and cipher negotiation', 'HSTS max-age and includeSubDomains', 'Content-Security-Policy presence', 'Permissions-Policy presence'].map((check) => (
 <li key={check} className="ds-card flex items-center gap-2 p-3 text-sm text-muted-foreground">
 <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
 {check}
 </li>
 ))}
 </ul>
 </div>
 )}

 {/* TAB 1: AUDITS */}
 {activeTab === 'audits' && (
 <div className="space-y-5">
 
 {/* Search & Filtering Bar */}
 <div className="ds-card flex flex-col gap-3 p-3.5 sm:p-4 font-mono">
 
 {/* Search Bar */}
 <div className="relative flex-1">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/>
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
 <Filter className="h-3 w-3 text-muted-foreground" aria-hidden="true"/>
 <span>Engine</span>
 </div>
 <select
 value={selectedEngine}
 onChange={(e) => setSelectedEngine(e.target.value)}
 className="ds-select text-xs font-mono"
 >
 <option value="all">All engines</option>
 <option value="master">Master audit (all 8 engines)</option>
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
 <h2 className="text-base font-semibold text-foreground sm:text-lg">
 {searchQuery || selectedEngine !== 'all' ? 'No audits match these filters' : 'No saved audits yet'}
 </h2>
 <p className="mx-auto mt-3 max-w-lg font-sans text-sm leading-relaxed text-muted-foreground">
 {searchQuery || selectedEngine !== 'all'
 ? 'Clear the search or choose "All engines" to see every audit you have run.'
 : 'A master audit runs all eight engines against one URL and saves the result here.'}
 </p>
 <div className="mt-6 flex justify-center">
 {(searchQuery || selectedEngine !== 'all') ? (
 <button
 type="button"
 onClick={() => { setSearchQuery(''); setSelectedEngine('all'); }}
 className="ds-btn ds-btn-secondary text-sm"
 >
 <span>Clear filters</span>
 </button>
 ) : (
 <Link to="/audit" className="ds-btn ds-btn-primary text-sm">
 <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true"/>
 <span>Run a master audit</span>
 </Link>
 )}
 </div>
 </div>
 ) : viewMode === 'grid' ? (
 
 /* GRID VIEW */
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
 {filteredReports.map((report) => {
 const domain = extractDomainFromUrl(report.url);
 const isMaster = report.engine === 'all' || report.engine === 'master';
 const engineMeta = isMaster
 ? { name: 'Master audit (all 8 engines)' }
 : ENGINES_MAP[report.engine] || { name: report.engine };

 return (
 <div
 key={report.id}
 {...clickableProps} onClick={() => handleNavigateToReport(report)}
 className="ds-card group p-4 flex flex-col ds-card-interactive"
 >
 <div>
 {/* Top Card Bar */}
 <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
 <div className="flex items-center gap-2 min-w-0">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent border border-border text-warning shrink-0">
 <Globe className="h-3.5 w-3.5"/>
 </div>
 <div className="min-w-0">
 <h4 className="text-xs font-bold text-foreground truncate group-hover:text-warning transition-colors">
 {domain}
 </h4>
 {report.createdAt ? (
 <span className="flex items-center gap-1 text-xs ds-muted">
 <Calendar className="h-2.5 w-2.5" aria-hidden="true"/>
 <time dateTime={new Date(report.createdAt).toISOString()}>
 {new Date(report.createdAt).toLocaleDateString()}
 </time>
 </span>
 ) : null}
 </div>
 </div>

 {/* Score Pill */}
 <div className={` py-0.5 rounded text-xs font-bold border ${
 (report.score ?? 0) >= 90
 ? 'bg-success/10 text-success border-success/30'
 : (report.score ?? 0) >= 75
 ? 'bg-warning/10 text-warning border-warning/30'
 : 'bg-danger/10 text-danger border-danger/30'
 }`}>
 {typeof report.score === 'number' ? <>{report.score}/100</> : 'No score'}
 </div>
 </div>

 {/* Middle Content */}
 <div className="py-3 space-y-1.5">
 <div className="inline-flex items-center gap-1 rounded border border-border bg-accent px-1.5 py-0.5 text-xs font-medium ds-muted">
 <Sparkles className="h-2.5 w-2.5 text-warning"/>
 <span>{engineMeta.name}</span>
 </div>
 <p className="line-clamp-2 text-sm leading-relaxed ds-muted">
 {report.summary || report.title || `Audit of ${domain}`}
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
 className="flex size-11 items-center justify-center rounded ds-muted transition-colors hover:bg-accent hover:text-foreground sm:size-8"
 aria-label={`Quick view of the ${domain} audit`}
 title="Quick view"
 >
 <Eye className="h-3.5 w-3.5" aria-hidden="true"/>
 </button>
 <button
 onClick={(e) => handlePrintReport(report, e)}
 className="flex size-11 items-center justify-center rounded ds-muted transition-colors hover:bg-accent hover:text-foreground sm:size-8"
 aria-label={`Print the ${domain} audit`}
 title="Print or save as PDF"
 >
 <Printer className="h-3.5 w-3.5" aria-hidden="true" />
 </button>
 <button
 onClick={(e) => handleCopyLink(report, e)}
 className="flex size-11 items-center justify-center rounded ds-muted transition-colors hover:bg-accent hover:text-foreground sm:size-8"
 aria-label={`Copy the link to the ${domain} audit`}
 title="Copy link"
 >
 {copiedId === report.id ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true"/> : <Share2 className="h-3.5 w-3.5" aria-hidden="true"/>}
 </button>
 <button
 onClick={(e) => handleDelete(report.id!, e)}
 disabled={deletingId === report.id}
 className="flex size-11 items-center justify-center rounded ds-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50 sm:size-8"
 aria-label={`Delete the ${domain} audit`}
 title="Delete audit"
 >
 <Trash2 className="h-3.5 w-3.5" aria-hidden="true"/>
 </button>
 </div>

 <span className="flex items-center gap-1 text-xs font-bold ds-muted group-hover:text-foreground">
 <span>Open report</span>
 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true"/>
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
 <th className="py-3">Domain</th>
 <th className="py-3">Engine</th>
 <th className="py-3">Health score</th>
 <th className="py-3">Audited</th>
 <th className="py-3 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filteredReports.map((report) => {
 const domain = extractDomainFromUrl(report.url);
 const isMaster = report.engine === 'all' || report.engine === 'master';
 const engineName = isMaster ? 'Master audit (8 engines)' : ENGINES_MAP[report.engine]?.name || report.engine;

 return (
 <tr 
 key={report.id}
 onClick={() => handleNavigateToReport(report)}
 className="hover:bg-muted cursor-pointer transition-colors"
 >
 <td className="py-3 font-bold text-foreground">
 <div className="flex items-center gap-2">
 <Globe className="h-3.5 w-3.5 text-warning"/>
 <span>{domain}</span>
 </div>
 </td>
 <td className="py-3 ds-muted">
 <span className="rounded border border-border bg-accent px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
 {engineName}
 </span>
 </td>
 <td className="py-3 font-bold">
 <span className={`rounded border px-1.5 py-0.5 font-mono text-xs ${
 typeof report.score !== 'number'
 ? 'border-border bg-muted text-muted-foreground'
 : report.score >= 90
 ? 'border-success/20 bg-success/10 text-success'
 : report.score >= 75
 ? 'border-warning/20 bg-warning/10 text-warning'
 : 'border-danger/20 bg-danger/10 text-danger'
 }`}>
 {typeof report.score === 'number' ? `${report.score}/100` : 'No score'}
 </span>
 </td>
 <td className="py-3 ds-muted">
 {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'}
 </td>
 <td className="py-3 text-right"onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-end gap-1">
 <button
 onClick={(e) => {
 e.stopPropagation();
 setQuickViewReport(report);
 }}
 className="flex size-11 items-center justify-center rounded ds-muted hover:text-foreground sm:size-8"
 aria-label={`Quick view of the ${domain} audit`}
 title="Quick view"
 >
 <Eye className="h-3 w-3" aria-hidden="true"/>
 </button>
 <button
 onClick={(e) => handlePrintReport(report, e)}
 className="flex size-11 items-center justify-center rounded ds-muted hover:text-foreground sm:size-8"
 aria-label={`Print the ${domain} audit`}
 title="Print or save as PDF"
 >
 <Printer className="h-3 w-3" aria-hidden="true"/>
 </button>
 <button
 onClick={(e) => handleCopyLink(report, e)}
 className="flex size-11 items-center justify-center rounded ds-muted hover:text-foreground sm:size-8"
 aria-label={`Copy the link to the ${domain} audit`}
 title="Copy link"
 >
 {copiedId === report.id ? <Check className="h-3 w-3 text-success" aria-hidden="true"/> : <Share2 className="h-3 w-3" aria-hidden="true"/>}
 </button>
 <button
 onClick={(e) => handleDelete(report.id!, e)}
 className="flex size-11 items-center justify-center rounded ds-muted hover:text-danger sm:size-8"
 aria-label={`Delete the ${domain} audit`}
 title="Delete audit"
 >
 <Trash2 className="h-3 w-3" aria-hidden="true"/>
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

 {/* TAB: SAVED REPORTS */}
 {activeTab === 'reports' && (
 <div className="space-y-6">
 <div className="ds-card p-5 sm:p-6">
 <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
 <div>
 <h2 className="text-base font-semibold text-foreground">Saved reports</h2>
 <p className="mt-2 max-w-xl text-sm text-muted-foreground">
 Every completed audit is stored to your account. Open one to read the full
 readings, copy its permalink, or print it.
 </p>
 </div>
 <Link to="/audit" className="ds-btn ds-btn-primary h-11 shrink-0 self-start text-sm">
 <Sparkles className="size-4" aria-hidden="true" />
 <span>Run a master audit</span>
 </Link>
 </div>

 {/* Summary Metrics Grid */}
 <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
 <div className="rounded-xl border border-border bg-surface p-3">
 <dt className="text-xs text-muted-foreground">Audits saved</dt>
 <dd className="mt-0.5 font-mono text-lg font-semibold text-foreground">{reports.length}</dd>
 </div>
 <div className="rounded-xl border border-border bg-surface p-3">
 <dt className="text-xs text-muted-foreground">Mean health score</dt>
 <dd className="mt-0.5 font-mono text-lg font-semibold text-foreground">
 {avgScore !== null ? `${avgScore}/100` : '—'}
 </dd>
 </div>
 <div className="rounded-xl border border-border bg-surface p-3">
 <dt className="text-xs text-muted-foreground">Domains audited</dt>
 <dd className="mt-0.5 font-mono text-lg font-semibold text-foreground">{uniqueDomains}</dd>
 </div>
 </dl>
 </div>

 {/* Reports list */}
 <div className="ds-card p-5">
 <h2 className="mb-4 border-b border-border pb-3 text-base font-semibold text-foreground">
 All audits
 <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">{reports.length}</span>
 </h2>

 {reports.length === 0 ? (
 <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
 No audits saved yet. A master audit runs all eight engines against one URL and
 stores the result here.
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
 {reports.map((report) => (
 <div
 key={report.id}
 className="ds-card ds-card-interactive flex flex-col justify-between p-4"
 >
 <div>
 <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
 <span className="max-w-[160px] truncate text-sm font-semibold text-foreground">
 {extractDomainFromUrl(report.url)}
 </span>
 <span className={`font-mono text-sm font-semibold ${
 typeof report.score === 'number' ? 'text-foreground' : 'text-muted-foreground'
 }`}>
 {typeof report.score === 'number' ? `${report.score}/100` : 'No score'}
 </span>
 </div>
 <p className="my-2 line-clamp-2 font-sans text-xs text-muted-foreground">
 {report.summary || report.title || `Audit of ${extractDomainFromUrl(report.url)}`}
 </p>
 </div>
 <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
 <button
 onClick={(e) => handlePrintReport(report, e)}
 className="ds-btn ds-btn-secondary h-11 px-3 text-xs"
 >
 <Printer className="size-3.5" aria-hidden="true" />
 <span>Print</span>
 </button>
 <button
 onClick={() => handleNavigateToReport(report)}
 className="text-xs text-foreground hover:underline flex items-center gap-1 cursor-pointer"
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
