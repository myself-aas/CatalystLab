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
import { SEOHead } from '../components/common/SEOHead';
import { useLocation, useParams } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { logger } from '../lib/logger';

export const UserDashboardPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading, loginWithLocalSession, setShowDomainModal } = useAuth();
  const { roleConfig } = useRoleSecurity();
  const navigate = useNavigate();
  const location = useLocation();
  const { tab } = useParams<{ tab: string }>();

  const getActiveView = (): 'analytics' | 'audits' | 'rate-limits' | 'api-keys' | 'monitoring' | 'blogs' | 'webhooks' => {
    if (tab && ['analytics', 'audits', 'rate-limits', 'api-keys', 'monitoring', 'blogs', 'webhooks', 'github'].includes(tab)) {
      return (tab === 'github' ? 'webhooks' : tab) as any;
    }
    if (location.pathname.endsWith('/webhooks') || location.pathname.endsWith('/github')) return 'webhooks';
    if (location.pathname.endsWith('/audits')) return 'audits';
    if (location.pathname.endsWith('/rate-limits')) return 'rate-limits';
    if (location.pathname.endsWith('/api-keys')) return 'api-keys';
    if (location.pathname.endsWith('/monitoring')) return 'monitoring';
    if (location.pathname.endsWith('/blogs')) return 'blogs';
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['analytics', 'audits', 'rate-limits', 'api-keys', 'monitoring', 'blogs', 'webhooks', 'github'].includes(tabParam)) {
      return (tabParam === 'github' ? 'webhooks' : tabParam) as any;
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
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-amber-500" />
          <span className="text-xs text-muted-foreground">Synchronizing user telemetry...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-background text-foreground">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-amber-600 mb-4 border border-border">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground">Developer Access Required</h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Sign in to access your persistent audit dossiers, real-time rate limit allocations, domain uptime monitoring, and technical research articles.
          </p>
          
          <div className="mt-6 space-y-2.5 font-mono">
            <Link
              to="/login?redirect=/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover border border-border py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In with Email or Google</span>
            </Link>

            <Link
              to="/signup?redirect=/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-accent py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <span>Create Free Developer Account &rarr;</span>
            </Link>
          </div>

          {import.meta.env.DEV && (
          <div className="mt-5 flex flex-col items-center justify-center gap-2 border-t border-white/[0.06] pt-4 font-mono sm:flex-row">
            <button
              onClick={() => loginWithLocalSession({
                email: 'developer@catalystlab.io',
                displayName: 'CatalystLab Developer',
                isAdmin: false
              })}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-amber-300 transition-all hover:text-[#EDEDEF] sm:w-auto"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Preview Developer Session</span>
            </button>

            <button
              onClick={() => setShowDomainModal(true)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#8A8F98] transition-colors hover:text-[#EDEDEF] sm:w-auto"
            >
              <span>Domain Helper</span>
            </button>
          </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24 text-[#EDEDEF]">
      <SEOHead
        title="Developer Telemetry Dashboard & Audits — CatalystLab"
        description="View real-time audit dossiers, rate limit allocations, domain uptime monitoring, and API keys."
        canonicalUrl="https://www.catalystlab.tech/dashboard"
      />
      
      {/* Top Header Section */}
      <section className="border-b border-border bg-muted px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            {/* User Greeting & Status */}
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User Avatar'} 
                  
                  className="h-12 w-12 rounded-xl border border-border object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                    {getGreeting()}, {userName}!
                  </h1>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
                    {roleConfig.displayName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-muted-foreground font-mono">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    8 SDLC Engines Operational
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5 font-mono">
              <Link
                to="/master-audit"
                className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover border border-border px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Run Master Audit</span>
              </Link>
              <Link
                to="/api-docs"
                className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-sm"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>API Reference</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4-Bento KPI Metrics Row */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          
          {/* Card 1: Daily Resource Allocation */}
          <Link 
            to="/dashboard/rate-limits"
            className="group cursor-pointer rounded-xl border border-border bg-background p-4 shadow-sm transition-all hover:bg-muted flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                Compute Quota
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                {rateStatus.formattedResetTime}
              </span>
            </div>

            <div className="my-2.5">
              <div className="text-2xl font-black text-foreground">
                {rateStatus.isUnlimited ? 'Unlimited' : `${rateStatus.remaining} / ${rateStatus.limit}`}
                <span className="text-xs font-normal text-muted-foreground ml-1">Units</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {rateStatus.isUnlimited 
                  ? 'Zero throttling applied' 
                  : `${rateStatus.masterRemaining} Master or ${rateStatus.singleRemaining} Single audits`}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-border text-xs font-bold text-muted-foreground group-hover:text-foreground">
              <span>Inspect Allocations</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: Saved Dossiers */}
          <Link 
            to="/dashboard/audits"
            className="group cursor-pointer rounded-xl border border-border bg-background p-4 shadow-sm transition-all hover:bg-muted flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Saved Reports
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Synced
              </span>
            </div>

            <div className="my-2.5">
              <div className="text-2xl font-black text-foreground">
                {totalAudits}
                <span className="text-xs font-normal text-muted-foreground ml-1">Dossiers</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Permanent Firestore telemetry records with PDF export
              </p>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-border text-xs font-bold text-muted-foreground group-hover:text-foreground">
              <span>View All Reports</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Average Benchmark Score */}
          <Link 
            to="/dashboard"
            className="group cursor-pointer rounded-xl border border-border bg-background p-4 shadow-sm transition-all hover:bg-muted flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                System Health
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                avgScore >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Grade {avgScore >= 90 ? 'A+' : 'A'}
              </span>
            </div>

            <div className="my-2.5">
              <div className="text-2xl font-black text-foreground">
                {avgScore}
                <span className="text-xs font-normal text-muted-foreground ml-1">/ 100</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Composite benchmark across all audited domains
              </p>
            </div>

            <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs font-bold text-muted-foreground group-hover:text-foreground">
              <span>View Full Analytics</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 4: Monitored Endpoints */}
          <Link 
            to="/dashboard/monitoring"
            className="group cursor-pointer rounded-xl border border-border bg-background p-4 shadow-sm transition-all hover:bg-muted flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Monitored Hosts
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                100% SSL
              </span>
            </div>

            <div className="my-2.5">
              <div className="text-2xl font-black text-foreground">
                {uniqueDomains}
                <span className="text-xs font-normal text-muted-foreground ml-1">Domains</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Real-time TTFB radar &amp; certificate expiry alerts
              </p>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-border text-xs font-bold text-muted-foreground group-hover:text-foreground">
              <span>Open Monitoring Radar</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

        </div>
      </section>

      {/* Main Navigation Links with Dedicated URLs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-7 font-mono">
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-primary text-primary-foreground shadow-sm border border-border'
                : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            <span>Real-Time Analytics</span>
          </Link>

          <Link
            to="/dashboard/audits"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'audits'
                ? 'bg-primary text-primary-foreground shadow-sm border border-border'
                : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-amber-500" />
            <span>Audit Reports &amp; Dossiers</span>
            <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] ${
              activeTab === 'audits' ? 'bg-muted text-primary-foreground' : 'bg-accent text-muted-foreground'
            }`}>
              {reports.length}
            </span>
          </Link>

          <Link
            to="/dashboard/rate-limits"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'rate-limits'
                ? 'bg-primary text-primary-foreground shadow-sm border border-border'
                : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-amber-500" />
            <span>Rate Limits</span>
          </Link>

          <Link
            to="/dashboard/api-keys"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'api-keys'
                ? 'bg-primary text-primary-foreground shadow-sm border border-border'
                : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-amber-500" />
            <span>API Keys &amp; Tokens</span>
          </Link>

          <Link
            to="/dashboard/monitoring"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'monitoring'
                ? 'bg-primary text-primary-foreground shadow-sm border border-border'
                : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-amber-500" />
            <span>Domain Health Radar</span>
          </Link>

          <Link
            to="/dashboard/webhooks"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'webhooks'
                ? 'bg-primary text-primary-foreground shadow-sm border border-border'
                : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5 text-blue-500" />
            <span>GitHub Webhooks</span>
            <span className="relative flex h-2 w-2 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </Link>

          <Link
            to="/dashboard/blogs"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'blogs'
                ? 'bg-primary text-primary-foreground shadow-sm border border-border'
                : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-500" />
            <span>My Technical Articles</span>
          </Link>

        </div>
      </section>

      {/* Tab Contents */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-5">
        
        {/* TAB 0: ANALYTICS */}
        {activeTab === 'analytics' && (
          <UserAnalyticsDashboard reports={reports} />
        )}

        {/* TAB 1: AUDIT REPORTS & DOSSIERS */}
        {activeTab === 'audits' && (
          <div className="space-y-5">
            
            {/* Search & Filtering Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5 sm:p-4 shadow-sm font-mono">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search domain, engine, or keywords..."
                  className="w-full rounded-lg border border-border bg-muted pl-9 pr-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Engine Selector Dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <Filter className="h-3 w-3 text-muted-foreground" />
                  <span>Catalyst:</span>
                </div>
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value)}
                  className="rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none"
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
                  className="rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none"
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
                      viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Table View"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Reports List / Grid */}
            {loading ? (
              <div className="py-16 text-center text-muted-foreground font-mono text-xs">
                <RotateCw className="mx-auto h-6 w-6 animate-spin text-amber-500 mb-2.5" />
                <div>Fetching telemetry dossier records...</div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="rounded-2xl border border-border bg-background p-10 text-center shadow-sm font-mono">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <h2 className="text-sm font-bold text-foreground">No Reports Found</h2>
                <p className="mt-1 max-w-sm mx-auto text-xs text-muted-foreground">
                  {searchQuery || selectedEngine !== 'all' 
                    ? "No reports match your active search filters. Try clearing the search query."
                    : "You haven't run any audits yet. Launch your first Master Audit to generate a permanent dossier."}
                </p>
                <div className="mt-5">
                  <Link
                    to="/master-audit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover border border-border px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
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
                      className="group cursor-pointer rounded-xl border border-border bg-background p-4 shadow-sm transition-all hover:bg-muted flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Card Bar */}
                        <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent border border-border text-amber-600 shrink-0">
                              <Globe className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-foreground truncate group-hover:text-amber-600 transition-colors">
                                {domain}
                              </h4>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" />
                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                          </div>

                          {/* Score Pill */}
                          <div className={`px-2 py-0.5 rounded text-xs font-bold border ${
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
                          <div className="inline-flex items-center gap-1 rounded bg-accent border border-border px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                            <span>{engineMeta.name}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-sans">
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
                            className="p-1 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                            title="Quick View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDirectExportPdf(report, e)}
                            disabled={exportingId === report.id}
                            className="p-1 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                            title="Export PDF"
                          >
                            <Download className={`h-3.5 w-3.5 ${exportingId === report.id ? 'animate-bounce' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => handleCopyLink(report, e)}
                            className="p-1 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                            title="Copy Permalink"
                          >
                            {copiedId === report.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={(e) => handleDelete(report.id!, e)}
                            disabled={deletingId === report.id}
                            className="p-1 rounded text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground flex items-center gap-1">
                          <span>Read Dossier</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (

              /* TABLE VIEW */
              <div className="overflow-x-auto rounded-xl border border-border bg-background shadow-sm font-mono">
                <table className="w-full text-left text-xs" aria-label="Audit reports list">
                  <thead className="bg-muted border-b border-border text-muted-foreground uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">Target Domain</th>
                      <th className="px-4 py-3">Diagnostic Engine</th>
                      <th className="px-4 py-3">Health Score</th>
                      <th className="px-4 py-3">Audited Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
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
                          <td className="px-4 py-3 font-bold text-foreground">
                            <div className="flex items-center gap-2">
                              <Globe className="h-3.5 w-3.5 text-amber-600" />
                              <span>{domain}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <span className="rounded bg-accent px-2 py-0.5 font-bold text-[11px] border border-border text-foreground">
                              {engineName}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">
                            <span className={`px-2 py-0.5 rounded text-[11px] border ${
                              (report.score || 90) >= 90
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {report.score || 92}/100
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickViewReport(report);
                                }}
                                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Quick View"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => handleDirectExportPdf(report, e)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Export PDF"
                              >
                                <Download className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => handleCopyLink(report, e)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Copy Link"
                              >
                                {copiedId === report.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Share2 className="h-3 w-3" />}
                              </button>
                              <button
                                onClick={(e) => handleDelete(report.id!, e)}
                                className="p-1 rounded text-muted-foreground hover:text-red-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
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
          <RoleContentGate requiredPermission="feature:write_blogs" minPlan="Pro" mode="blur">
            <UserBlogManagementView />
          </RoleContentGate>
        )}

        {/* TAB 5: API KEYS & WHITE-LABEL ACCESS */}
        {activeTab === 'api-keys' && (
          <RoleContentGate requiredPermission="feature:api_access" minPlan="Pro" mode="blur">
            <UserApiKeyManagementView />
          </RoleContentGate>
        )}

        {/* TAB 6: GITHUB WEBHOOKS & REAL-TIME TELEMETRY */}
        {activeTab === 'webhooks' && (
          <UserGithubWebhookView />
        )}

      </section>

    </div>
  );
};

export default UserDashboardPage;
