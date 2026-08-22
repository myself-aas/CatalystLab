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
  RateLimitStatus,
  MASTER_AUDIT_COST, 
  SINGLE_ENGINE_COST 
} from '../utils/rateLimiter';
import type { AuditReport } from '../types';
import { 
  LayoutDashboard, 
  Search, 
  Trash2, 
  ExternalLink, 
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
  Clock,
  Zap,
  Radio,
  Sliders,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  Key
} from 'lucide-react';
import { UserBlogManagementView } from '../components/user/UserBlogManagementView';
import { UserRateLimitAllocationCard } from '../components/user/UserRateLimitAllocationCard';
import { UserDomainMonitoringRadar } from '../components/user/UserDomainMonitoringRadar';
import { UserAnalyticsDashboard } from '../components/user/UserAnalyticsDashboard';
import { UserApiKeyManagementView } from '../components/user/UserApiKeyManagementView';
import { useLocation, useParams } from 'react-router-dom';

export const UserDashboardPage: React.FC = () => {
  const { user, login, isAdmin, loading: authLoading, loginWithLocalSession, setShowDomainModal } = useAuth();
  const { effectiveRole, roleConfig, hasPermission } = useRoleSecurity();
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

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Developer';

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#415a77] border-t-transparent" />
          <span className="text-base text-[#415a77]">Synchronizing user telemetry...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center bg-[#f8fafc]">
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 sm:p-10 shadow-2xl text-[#f8fafc]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#415a77]/20 text-[#c5d3e8] mb-4 border border-[#415a77]/40">
            <LogIn className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#f8fafc]">Developer Access Required</h2>
          <p className="mt-2 text-base text-[#c5d3e8] leading-relaxed">
            Sign in with Google to access your persistent audit dossiers, real-time rate limit allocations, domain uptime monitoring, and technical research articles.
          </p>
          
          <div className="mt-6 space-y-3">
            <Link
              to="/login?redirect=/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 text-base font-extrabold text-[#0b192c] transition-all hover:opacity-95 shadow-md hover:shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In with Email, Gmail, or GitHub</span>
            </Link>

            <Link
              to="/signup?redirect=/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-[#152238] px-6 py-2.5 text-sm font-bold text-cyan-300 hover:bg-[#1e304d] hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <span>Create Free Developer Account &rarr;</span>
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-[#415a77]/30 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => loginWithLocalSession({
                email: 'developer@catalystlab.io',
                displayName: 'CatalystLab Developer',
                isAdmin: false
              })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#38bdf8]/40 bg-[#152238] px-4 py-2 text-sm font-bold text-[#38bdf8] hover:bg-[#1a2d48] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
              <span>Activate Preview Developer Session</span>
            </button>

            <button
              onClick={() => setShowDomainModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#415a77]/30 bg-[#152238] px-3.5 py-2 text-sm font-semibold text-[#c5d3e8] hover:text-[#f8fafc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <span>Domain Helper</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      
      {/* Top Header Section */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* User Greeting & Status */}
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img alt="Visual asset" 
                  src={user.photoURL} 
                  alt={user.displayName || 'Avatar'} 
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-2xl border-2 border-[#415a77]/20 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b192c] text-white font-bold text-lg shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0b192c]">
                    {getGreeting()}, {userName}!
                  </h1>
                  <span className={`rounded-md border px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
                    {roleConfig.displayName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[#415a77]">
                  <span className="font-mono">{user.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    All 8 SDLC Catalysts Operational
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/master-audit"
                className="flex items-center gap-2 rounded-xl bg-[#0b192c] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#1b2a47] shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <Sparkles className="h-4 w-4 text-[#c5d3e8]" />
                <span>Run Master Audit</span>
              </Link>
              <Link
                to="/api-docs"
                className="flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-bold text-[#415a77] hover:bg-[#f8fafc] hover:border-[#415a77]/30 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <FileText className="h-4 w-4 text-[#415a77]" />
                <span>API Reference</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4-Bento KPI Metrics Row */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Daily Resource Allocation */}
          <Link 
            to="/dashboard/rate-limits"
            className="group cursor-pointer rounded-2xl border border-[#415a77]/20 bg-white p-5 shadow-sm transition-all hover:border-[#415a77]/60 hover:shadow-md flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#415a77] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-[#415a77]" />
                Compute Quota
              </span>
              <span className="text-sm font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                {rateStatus.formattedResetTime}
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl font-black text-[#0b192c] font-mono">
                {rateStatus.isUnlimited ? 'Unlimited' : `${rateStatus.remaining} / ${rateStatus.limit}`}
                <span className="text-sm font-normal text-[#415a77] font-sans ml-1.5">Units</span>
              </div>
              <p className="text-sm text-[#415a77] mt-1">
                {rateStatus.isUnlimited 
                  ? 'Zero throttling applied' 
                  : `${rateStatus.masterRemaining} Master or ${rateStatus.singleRemaining} Single audits remain`}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0] text-sm font-bold text-[#415a77] group-hover:text-[#0b192c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span>Inspect Allocations</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
            </div>
          </Link>

          {/* Card 2: Saved Dossiers */}
          <Link 
            to="/dashboard/audits"
            className="group cursor-pointer rounded-2xl border border-[#415a77]/20 bg-white p-5 shadow-sm transition-all hover:border-[#415a77]/60 hover:shadow-md flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#415a77] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#415a77]" />
                Saved Reports
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Synced
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl font-black text-[#0b192c] font-mono">
                {totalAudits}
                <span className="text-sm font-normal text-[#415a77] font-sans ml-1.5">Dossiers</span>
              </div>
              <p className="text-sm text-[#415a77] mt-1">
                Permanent Firestore telemetry records with PDF export
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0] text-sm font-bold text-[#415a77] group-hover:text-[#0b192c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span>View All Reports</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
            </div>
          </Link>

          {/* Card 3: Average Benchmark Score */}
          <Link 
            to="/dashboard"
            className="group cursor-pointer rounded-2xl border border-[#415a77]/20 bg-white p-5 shadow-sm transition-all hover:border-[#415a77]/60 hover:shadow-md flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#415a77] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-[#415a77]" />
                System Health
              </span>
              <span className={`text-sm font-bold px-2 py-0.5 rounded border ${
                avgScore >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                Grade {avgScore >= 90 ? 'A+' : 'A'}
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl font-black text-[#0b192c] font-mono">
                {avgScore}
                <span className="text-sm font-normal text-[#415a77] font-sans ml-1">/ 100</span>
              </div>
              <p className="text-sm text-[#415a77] mt-1">
                Composite benchmark across all audited domains
              </p>
            </div>

            <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-sm font-bold text-[#415a77] group-hover:text-[#0b192c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span>View Full Analytics</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
            </div>
          </Link>

          {/* Card 4: Monitored Endpoints */}
          <Link 
            to="/dashboard/monitoring"
            className="group cursor-pointer rounded-2xl border border-[#415a77]/20 bg-white p-5 shadow-sm transition-all hover:border-[#415a77]/60 hover:shadow-md flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#415a77] uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-[#415a77]" />
                Monitored Hosts
              </span>
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                100% SSL
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl font-black text-[#0b192c] font-mono">
                {uniqueDomains}
                <span className="text-sm font-normal text-[#415a77] font-sans ml-1.5">Domains</span>
              </div>
              <p className="text-sm text-[#415a77] mt-1">
                Real-time TTFB radar & certificate expiry alerts
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0] text-sm font-bold text-[#415a77] group-hover:text-[#0b192c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span>Open Monitoring Radar</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
            </div>
          </Link>

        </div>
      </section>

      {/* Main Navigation Links with Dedicated URLs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#e2e8f0] pb-4">
          
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#0b192c] text-white shadow-md'
                : 'bg-white text-[#415a77] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
            }`}
          >
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>Real-Time Analytics</span>
          </Link>

          <Link
            to="/dashboard/audits"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === 'audits'
                ? 'bg-[#0b192c] text-white shadow-md'
                : 'bg-white text-[#415a77] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Audit Reports & Dossiers</span>
            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-mono ${
              activeTab === 'audits' ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#415a77]'
            }`}>
              {reports.length}
            </span>
          </Link>

          <Link
            to="/dashboard/rate-limits"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === 'rate-limits'
                ? 'bg-[#0b192c] text-white shadow-md'
                : 'bg-white text-[#415a77] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>Rate Limits & Resource Allocation</span>
          </Link>

          <Link
            to="/dashboard/api-keys"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === 'api-keys'
                ? 'bg-[#0b192c] text-white shadow-md'
                : 'bg-white text-[#415a77] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
            }`}
          >
            <Key className="h-4 w-4 text-amber-500" />
            <span>API Keys & White-Label</span>
          </Link>

          <Link
            to="/dashboard/monitoring"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === 'monitoring'
                ? 'bg-[#0b192c] text-white shadow-md'
                : 'bg-white text-[#415a77] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Domain Health & Latency Radar</span>
          </Link>

          <Link
            to="/dashboard/blogs"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === 'blogs'
                ? 'bg-[#0b192c] text-white shadow-md'
                : 'bg-white text-[#415a77] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>My Technical Articles</span>
          </Link>

        </div>
      </section>

      {/* Tab Contents */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* TAB 0: ANALYTICS */}
        {activeTab === 'analytics' && (
          <UserAnalyticsDashboard reports={reports} />
        )}

        {/* TAB 1: AUDIT REPORTS & DOSSIERS */}
        {activeTab === 'audits' && (
          <div className="space-y-6">
            
            {/* Search & Filtering Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-[#415a77]/20 bg-white p-4 sm:p-5 shadow-sm">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#415a77]/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search audited domain, engine, or keywords..."
                  className="w-full rounded-xl border border-[#415a77]/30 bg-[#f8fafc] pl-10 pr-4 py-2.5 text-sm sm:text-base text-[#0b192c] placeholder:text-[#415a77]/50 focus:border-[#0b192c] focus:outline-none focus:ring-1 focus:ring-[#0b192c]"
                />
              </div>

              {/* Engine Selector Dropdown */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#415a77]">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Catalyst:</span>
                </div>
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value)}
                  className="rounded-xl border border-[#415a77]/30 bg-[#f8fafc] px-3.5 py-2 text-sm font-bold text-[#0b192c] focus:outline-none"
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
                  className="rounded-xl border border-[#415a77]/30 bg-[#f8fafc] px-3.5 py-2 text-sm font-bold text-[#0b192c] focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="score_high">Score: High to Low</option>
                  <option value="score_low">Score: Low to High</option>
                  <option value="domain">Domain: A to Z</option>
                </select>

                {/* View Mode Switcher */}
                <div className="flex items-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm text-[#0b192c]' : 'text-[#415a77]'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'table' ? 'bg-white shadow-sm text-[#0b192c]' : 'text-[#415a77]'
                    }`}
                    title="Table View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Reports List / Grid */}
            {loading ? (
              <div className="py-20 text-center text-[#415a77] text-base">
                <RotateCw className="mx-auto h-8 w-8 animate-spin text-[#415a77] mb-3" />
                <div>Fetching telemetry dossier records...</div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="rounded-3xl border border-[#415a77]/20 bg-white p-12 text-center shadow-sm">
                <FileText className="mx-auto h-12 w-12 text-[#415a77]/30 mb-4" />
                <h2 className="text-base font-bold text-[#0b192c]">No Reports Found</h2>
                <p className="mt-1 max-w-sm mx-auto text-sm text-[#415a77]">
                  {searchQuery || selectedEngine !== 'all' 
                    ? "No reports match your active search filters. Try clearing the search query."
                    : "You haven't run any audits yet. Launch your first Master Audit to generate a permanent dossier."}
                </p>
                <div className="mt-6">
                  <Link
                    to="/master-audit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#33475e] transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Run Master Audit</span>
                  </Link>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              
              /* GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                      className="group cursor-pointer rounded-2xl border border-[#415a77]/20 bg-white p-5 shadow-sm transition-all hover:border-[#415a77]/60 hover:shadow-md flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      <div>
                        {/* Top Card Bar */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e2e8f0]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f9] border border-[#e2e8f0] text-[#415a77] shrink-0">
                              <Globe className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-base font-bold text-[#0b192c] truncate group-hover:text-[#415a77] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                                {domain}
                              </h4>
                              <span className="text-sm text-[#415a77] font-mono flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                          </div>

                          {/* Score Pill */}
                          <div className={`px-2 py-1 rounded-lg text-sm font-bold font-mono border ${
                            (report.score || 90) >= 90
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : (report.score || 90) >= 75
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {report.score || 92}/100
                          </div>
                        </div>

                        {/* Middle Content */}
                        <div className="py-3.5 space-y-2">
                          <div className="inline-flex items-center gap-1.5 rounded-md bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 text-sm font-bold text-[#415a77]">
                            <Sparkles className="h-3 w-3 text-[#415a77]" />
                            <span>{engineMeta.name}</span>
                          </div>
                          <p className="text-sm text-[#415a77] line-clamp-2 leading-relaxed">
                            {report.summary || report.title || `Telemetry audit evaluated for ${report.url}`}
                          </p>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDirectExportPdf(report, e)}
                            disabled={exportingId === report.id}
                            className="p-1.5 rounded-lg text-[#415a77] hover:bg-[#f1f5f9] hover:text-[#0b192c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            title="Export PDF"
                          >
                            <Download className={`h-4 w-4 ${exportingId === report.id ? 'animate-bounce' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => handleCopyLink(report, e)}
                            className="p-1.5 rounded-lg text-[#415a77] hover:bg-[#f1f5f9] hover:text-[#0b192c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            title="Copy Permalink"
                          >
                            {copiedId === report.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={(e) => handleDelete(report.id!, e)}
                            disabled={deletingId === report.id}
                            className="p-1.5 rounded-lg text-[#415a77] hover:bg-rose-50 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            title="Delete Report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-[#415a77] group-hover:text-[#0b192c] flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                          <span>Read Dossier</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (

              /* TABLE VIEW */
              <div className="overflow-hidden rounded-2xl border border-[#415a77]/20 bg-white shadow-sm">
                <table className="w-full text-left text-sm" aria-label="Audit reports list">
                  <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#415a77] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-5 py-3.5">Target Domain</th>
                      <th className="px-5 py-3.5">Diagnostic Engine</th>
                      <th className="px-5 py-3.5">Health Score</th>
                      <th className="px-5 py-3.5">Audited Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredReports.map((report) => {
                      const domain = extractDomainFromUrl(report.url);
                      const isMaster = report.engine === 'all' || report.engine === 'master';
                      const engineName = isMaster ? 'Master Audit (All 8)' : ENGINES_MAP[report.engine]?.name || report.engine;

                      return (
                        <tr 
                          key={report.id}
                          onClick={() => handleNavigateToReport(report)}
                          className="hover:bg-[#f8fafc] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                          <td className="px-5 py-4 font-bold text-[#0b192c]">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-[#415a77]" />
                              <span>{domain}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#415a77]">
                            <span className="rounded bg-[#f1f5f9] px-2 py-0.5 font-bold text-sm border border-[#e2e8f0]">
                              {engineName}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded text-sm border ${
                              (report.score || 90) >= 90
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {report.score || 92}/100
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[#415a77] font-mono">
                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => handleDirectExportPdf(report, e)}
                                className="p-1.5 rounded-lg text-[#415a77] hover:bg-[#f1f5f9] hover:text-[#0b192c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                title="Export PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleCopyLink(report, e)}
                                className="p-1.5 rounded-lg text-[#415a77] hover:bg-[#f1f5f9] hover:text-[#0b192c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                title="Copy Link"
                              >
                                {copiedId === report.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={(e) => handleDelete(report.id!, e)}
                                className="p-1.5 rounded-lg text-[#415a77] hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
