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
  Key
} from 'lucide-react';
import { UserBlogManagementView } from '../components/user/UserBlogManagementView';
import { UserRateLimitAllocationCard } from '../components/user/UserRateLimitAllocationCard';
import { UserDomainMonitoringRadar } from '../components/user/UserDomainMonitoringRadar';
import { UserAnalyticsDashboard } from '../components/user/UserAnalyticsDashboard';
import { UserApiKeyManagementView } from '../components/user/UserApiKeyManagementView';
import { SEOHead } from '../components/common/SEOHead';
import { useLocation, useParams } from 'react-router-dom';

export const UserDashboardPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading, loginWithLocalSession, setShowDomainModal } = useAuth();
  const { roleConfig } = useRoleSecurity();
  const navigate = useNavigate();
  const location = useLocation();
  const { tab } = useParams<{ tab: string }>();

  const getActiveView = (): 'analytics' | 'audits' | 'rate-limits' | 'api-keys' | 'monitoring' | 'blogs' => {
    if (tab && ['analytics', 'audits', 'rate-limits', 'api-keys', 'monitoring', 'blogs'].includes(tab)) {
      return tab as any;
    }
    if (location.pathname.endsWith('/audits')) return 'audits';
    if (location.pathname.endsWith('/rate-limits')) return 'rate-limits';
    if (location.pathname.endsWith('/api-keys')) return 'api-keys';
    if (location.pathname.endsWith('/monitoring')) return 'monitoring';
    if (location.pathname.endsWith('/blogs')) return 'blogs';
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['analytics', 'audits', 'rate-limits', 'api-keys', 'monitoring', 'blogs'].includes(tabParam)) {
      return tabParam as any;
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
      console.error("Error fetching reports:", err);
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
      console.error("Failed to delete report:", err);
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
      console.error("Export PDF failed:", err);
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
      <div className="flex min-h-[60vh] items-center justify-center bg-white font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-accent-cyan" />
          <span className="text-xs text-gray-600">Synchronizing user telemetry...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-white text-black">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-accent-amber-strong mb-4 border border-gray-200">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-black">Developer Access Required</h2>
          <p className="mt-2 text-xs text-gray-600 leading-relaxed">
            Sign in to access your persistent audit dossiers, real-time rate limit allocations, domain uptime monitoring, and technical research articles.
          </p>
          
          <div className="mt-6 space-y-2.5 font-mono">
            <Link
              to="/login?redirect=/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black hover:bg-black-hover border border-brand-periwinkle/30 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In with Email or Google</span>
            </Link>

            <Link
              to="/signup?redirect=/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 py-2.5 text-xs font-bold text-black hover:bg-gray-50 hover:text-white transition-all cursor-pointer"
            >
              <span>Create Free Developer Account &rarr;</span>
            </Link>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-2 font-mono">
            <button
              onClick={() => loginWithLocalSession({
                email: 'developer@catalystlab.io',
                displayName: 'CatalystLab Developer',
                isAdmin: false
              })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-bold text-accent-amber-strong hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Preview Developer Session</span>
            </button>

            <button
              onClick={() => setShowDomainModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <span>Domain Helper</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 text-black selection:bg-black selection:text-white">
      <SEOHead
        title="Developer Telemetry Dashboard & Audits — CatalystLab"
        description="View real-time audit dossiers, rate limit allocations, domain uptime monitoring, and API keys."
        canonicalUrl="https://www.catalystlab.tech/dashboard"
      />
      
      {/* Top Header Section */}
      <section className="border-b border-gray-200 bg-gray-100 px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            {/* User Greeting & Status */}
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User Avatar'} 
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-xl border border-gray-200 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white font-bold text-base shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-black">
                    {getGreeting()}, {userName}!
                  </h1>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
                    {roleConfig.displayName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-gray-600 font-mono">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-accent-emerald font-bold">
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
                className="flex items-center gap-2 rounded-xl bg-black hover:bg-black-hover border border-brand-periwinkle/30 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent-amber-strong" />
                <span>Run Master Audit</span>
              </Link>
              <Link
                to="/api-docs"
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-white transition-all shadow-sm"
              >
                <FileText className="h-3.5 w-3.5 text-gray-500" />
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
            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:bg-gray-50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent-amber-strong uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                Compute Quota
              </span>
              <span className="text-[10px] text-accent-emerald bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                {rateStatus.formattedResetTime}
              </span>
            </div>

            <div className="my-2.5">
              <div className="text-2xl font-black text-black">
                {rateStatus.isUnlimited ? 'Unlimited' : `${rateStatus.remaining} / ${rateStatus.limit}`}
                <span className="text-xs font-normal text-gray-500 ml-1">Units</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {rateStatus.isUnlimited 
                  ? 'Zero throttling applied' 
                  : `${rateStatus.masterRemaining} Master or ${rateStatus.singleRemaining} Single audits`}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-gray-200 text-xs font-bold text-gray-500 group-hover:text-white">
              <span>Inspect Allocations</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: Saved Dossiers */}
          <Link 
            to="/dashboard/audits"
            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:bg-gray-50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent-amber-strong uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Saved Reports
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-accent-emerald bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" />
                Synced
              </span>
            </div>

            <div className="my-2.5">
              <div className="text-2xl font-black text-black">
                {totalAudits}
                <span className="text-xs font-normal text-gray-500 ml-1">Dossiers</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Permanent Firestore telemetry records with PDF export
              </p>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-gray-200 text-xs font-bold text-gray-500 group-hover:text-white">
              <span>View All Reports</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Average Benchmark Score */}
          <Link 
            to="/dashboard"
            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:bg-gray-50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent-amber-strong uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                System Health
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                avgScore >= 90 ? 'bg-emerald-950/40 text-accent-emerald border-emerald-500/30' : 'bg-blue-950/40 text-blue-300 border-blue-500/30'
              }`}>
                Grade {avgScore >= 90 ? 'A+' : 'A'}
              </span>
            </div>

            <div className="my-2.5">
              <div className="text-2xl font-black text-black">
                {avgScore}
                <span className="text-xs font-normal text-gray-500 ml-1">/ 100</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Composite benchmark across all audited domains
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-500 group-hover:text-white">
              <span>View Full Analytics</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 4: Monitored Endpoints */}
          <Link 
            to="/dashboard/monitoring"
            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:bg-gray-50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent-amber-strong uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Monitored Hosts
              </span>
              <span className="text-[10px] font-bold text-accent-emerald bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                100% SSL
              </span>
            </div>

            <div className="my-2.5">
              <div className="text-2xl font-black text-black">
                {uniqueDomains}
                <span className="text-xs font-normal text-gray-500 ml-1">Domains</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Real-time TTFB radar &amp; certificate expiry alerts
              </p>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-gray-200 text-xs font-bold text-gray-500 group-hover:text-white">
              <span>Open Monitoring Radar</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

        </div>
      </section>

      {/* Main Navigation Links with Dedicated URLs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-7 font-mono">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
          
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-black text-white shadow-sm border border-brand-periwinkle/30'
                : 'bg-white text-gray-600 hover:text-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-accent-emerald" />
            <span>Real-Time Analytics</span>
          </Link>

          <Link
            to="/dashboard/audits"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'audits'
                ? 'bg-black text-white shadow-sm border border-brand-periwinkle/30'
                : 'bg-white text-gray-600 hover:text-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-accent-amber-strong" />
            <span>Audit Reports &amp; Dossiers</span>
            <span className={`ml-1 rounded px-1.5 py-0.2 text-[10px] ${
              activeTab === 'audits' ? 'bg-gray-100 text-black' : 'bg-gray-100 text-gray-500'
            }`}>
              {reports.length}
            </span>
          </Link>

          <Link
            to="/dashboard/rate-limits"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'rate-limits'
                ? 'bg-black text-white shadow-sm border border-brand-periwinkle/30'
                : 'bg-white text-gray-600 hover:text-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-accent-amber-strong" />
            <span>Rate Limits</span>
          </Link>

          <Link
            to="/dashboard/api-keys"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'api-keys'
                ? 'bg-black text-white shadow-sm border border-brand-periwinkle/30'
                : 'bg-white text-gray-600 hover:text-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-accent-amber" />
            <span>API Keys &amp; Tokens</span>
          </Link>

          <Link
            to="/dashboard/monitoring"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'monitoring'
                ? 'bg-black text-white shadow-sm border border-brand-periwinkle/30'
                : 'bg-white text-gray-600 hover:text-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-accent-amber-strong" />
            <span>Domain Health Radar</span>
          </Link>

          <Link
            to="/dashboard/blogs"
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'blogs'
                ? 'bg-black text-white shadow-sm border border-brand-periwinkle/30'
                : 'bg-white text-gray-600 hover:text-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-accent-amber-strong" />
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3.5 sm:p-4 shadow-sm font-mono">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search domain, engine, or keywords..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 pl-9 pr-3.5 py-1.5 text-xs text-black placeholder:text-gray-500 focus:border-gray-200 focus:outline-none"
                />
              </div>

              {/* Engine Selector Dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                  <Filter className="h-3 w-3" />
                  <span>Catalyst:</span>
                </div>
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-black focus:outline-none"
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
                  className="rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-black focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="score_high">Score: High to Low</option>
                  <option value="score_low">Score: Low to High</option>
                  <option value="domain">Domain: A to Z</option>
                </select>

                {/* View Mode Switcher */}
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-500 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1 rounded transition-colors ${
                      viewMode === 'table' ? 'bg-black text-white' : 'text-gray-500 hover:text-white'
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
              <div className="py-16 text-center text-gray-600 font-mono text-xs">
                <RotateCw className="mx-auto h-6 w-6 animate-spin text-accent-amber-strong mb-2.5" />
                <div>Fetching telemetry dossier records...</div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm font-mono">
                <FileText className="mx-auto h-10 w-10 text-gray-500 mb-3" />
                <h2 className="text-sm font-bold text-black">No Reports Found</h2>
                <p className="mt-1 max-w-sm mx-auto text-xs text-gray-600">
                  {searchQuery || selectedEngine !== 'all' 
                    ? "No reports match your active search filters. Try clearing the search query."
                    : "You haven't run any audits yet. Launch your first Master Audit to generate a permanent dossier."}
                </p>
                <div className="mt-5">
                  <Link
                    to="/master-audit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black hover:bg-black-hover border border-brand-periwinkle/30 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-accent-amber-strong" />
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
                      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:bg-gray-50 flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Card Bar */}
                        <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-gray-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 border border-gray-200 text-accent-amber-strong shrink-0">
                              <Globe className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-black truncate group-hover:text-accent-amber-strong transition-colors">
                                {domain}
                              </h4>
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" />
                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                          </div>

                          {/* Score Pill */}
                          <div className={`px-2 py-0.5 rounded text-xs font-bold border ${
                            (report.score || 90) >= 90
                              ? 'bg-emerald-950/40 text-accent-emerald border-emerald-500/30'
                              : (report.score || 90) >= 75
                                ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                                : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                          }`}>
                            {report.score || 92}/100
                          </div>
                        </div>

                        {/* Middle Content */}
                        <div className="py-3 space-y-1.5">
                          <div className="inline-flex items-center gap-1 rounded bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                            <Sparkles className="h-2.5 w-2.5 text-accent-amber-strong" />
                            <span>{engineMeta.name}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed font-sans">
                            {report.summary || report.title || `Telemetry audit evaluated for ${report.url}`}
                          </p>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="pt-2.5 border-t border-gray-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDirectExportPdf(report, e)}
                            disabled={exportingId === report.id}
                            className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-white transition-colors cursor-pointer"
                            title="Export PDF"
                          >
                            <Download className={`h-3.5 w-3.5 ${exportingId === report.id ? 'animate-bounce' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => handleCopyLink(report, e)}
                            className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-white transition-colors cursor-pointer"
                            title="Copy Permalink"
                          >
                            {copiedId === report.id ? <Check className="h-3.5 w-3.5 text-accent-emerald" /> : <Share2 className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={(e) => handleDelete(report.id!, e)}
                            disabled={deletingId === report.id}
                            className="p-1 rounded text-gray-500 hover:bg-rose-950/40 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-gray-500 group-hover:text-white flex items-center gap-1">
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
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm font-mono">
                <table className="w-full text-left text-xs" aria-label="Audit reports list">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">Target Domain</th>
                      <th className="px-4 py-3">Diagnostic Engine</th>
                      <th className="px-4 py-3">Health Score</th>
                      <th className="px-4 py-3">Audited Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-slate/30">
                    {filteredReports.map((report) => {
                      const domain = extractDomainFromUrl(report.url);
                      const isMaster = report.engine === 'all' || report.engine === 'master';
                      const engineName = isMaster ? 'Master Audit (All 8)' : ENGINES_MAP[report.engine]?.name || report.engine;

                      return (
                        <tr 
                          key={report.id}
                          onClick={() => handleNavigateToReport(report)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-bold text-black">
                            <div className="flex items-center gap-2">
                              <Globe className="h-3.5 w-3.5 text-accent-amber-strong" />
                              <span>{domain}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className="rounded bg-gray-100 px-2 py-0.5 font-bold text-[11px] border border-gray-200">
                              {engineName}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">
                            <span className={`px-2 py-0.5 rounded text-[11px] border ${
                              (report.score || 90) >= 90
                                ? 'bg-emerald-950/40 text-accent-emerald border-emerald-500/30'
                                : 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                            }`}>
                              {report.score || 92}/100
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => handleDirectExportPdf(report, e)}
                                className="p-1 rounded text-gray-500 hover:text-white cursor-pointer"
                                title="Export PDF"
                              >
                                <Download className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => handleCopyLink(report, e)}
                                className="p-1 rounded text-gray-500 hover:text-white cursor-pointer"
                                title="Copy Link"
                              >
                                {copiedId === report.id ? <Check className="h-3 w-3 text-accent-emerald" /> : <Share2 className="h-3 w-3" />}
                              </button>
                              <button
                                onClick={(e) => handleDelete(report.id!, e)}
                                className="p-1 rounded text-gray-500 hover:text-rose-400 cursor-pointer"
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

      </section>

    </div>
  );
};

export default UserDashboardPage;
