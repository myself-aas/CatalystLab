import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserReports, deleteReport } from '../lib/firebase';
import { ENGINES_MAP } from '../data/engines';
import { urlToDomainSlug, extractDomainFromUrl } from '../utils/slugUtils';
import { exportAuditReportDataToPdf } from '../utils/pdfExport';
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
  Sparkles
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'domain'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!authLoading) {
      fetchReports();
    }
  }, [user, authLoading]);

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
    if (sortBy === 'domain') return (a.url || '').localeCompare(b.url || '');
    return 0;
  });

  // Key Metrics
  const totalAudits = reports.length;
  const uniqueDomains = new Set(reports.map(r => extractDomainFromUrl(r.url))).size;
  const latestAuditDate = reports[0]?.createdAt 
    ? new Date(reports[0].createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'None';

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#415a77] border-t-transparent" />
          <span className="text-sm text-[#415a77]">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center bg-[#f8fafc]">
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 sm:p-10 shadow-2xl text-[#f8fafc]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#415a77]/20 text-[#c5d3e8] mb-4 border border-[#415a77]/40">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h2 className="text-2xl font-bold text-[#f8fafc]">Sign In Required</h2>
          <p className="mt-2 text-sm text-[#c5d3e8]">
            Access your personal audit history, benchmark dossiers, and export PDF reports tied to your account.
          </p>
          <button
            onClick={() => login()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#415a77] px-6 py-3 text-sm font-bold text-[#f8fafc] transition-all hover:bg-[#33475e] shadow-md"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      
      {/* Top Header Section */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0b192c] text-white">
                  <LayoutDashboard className="h-4 w-4 text-[#c5d3e8]" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b192c]">
                  Audit Telemetry Dashboard
                </h1>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-[#415a77]">
                Manage your saved website audits, permanent benchmark dossiers, and exported PDF records.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl bg-[#0b192c] px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#152238] shadow-md"
              >
                <Sparkles className="h-4 w-4 text-[#c5d3e8]" />
                <span>Run New Master Audit</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-5 shadow-lg text-[#f8fafc]">
              <div className="text-[11px] font-semibold text-[#c5d3e8] uppercase tracking-wider">Total Audits</div>
              <div className="mt-1 text-2xl font-black text-[#f8fafc] font-mono">{totalAudits}</div>
              <div className="text-[10px] text-[#c5d3e8]/70 mt-1">Saved in cloud</div>
            </div>

            <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-5 shadow-lg text-[#f8fafc]">
              <div className="text-[11px] font-semibold text-[#c5d3e8] uppercase tracking-wider">Unique Domains</div>
              <div className="mt-1 text-2xl font-black text-[#c5d3e8] font-mono">{uniqueDomains}</div>
              <div className="text-[10px] text-[#c5d3e8]/70 mt-1">Monitored endpoints</div>
            </div>

            <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-5 shadow-lg text-[#f8fafc]">
              <div className="text-[11px] font-semibold text-[#c5d3e8] uppercase tracking-wider">Latest Activity</div>
              <div className="mt-1 text-lg font-black text-[#f8fafc] font-mono truncate">{latestAuditDate}</div>
              <div className="text-[10px] text-[#c5d3e8]/70 mt-1">Most recent scan</div>
            </div>

            <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-5 shadow-lg text-[#f8fafc]">
              <div className="text-[11px] font-semibold text-[#c5d3e8] uppercase tracking-wider">Account Tier</div>
              <div className="mt-1 text-lg font-black text-[#c5d3e8] font-mono">Pro Telemetry</div>
              <div className="text-[10px] text-[#c5d3e8]/70 mt-1 truncate">{user.email}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Controls Toolbar: Search, Filters, Sort, View Toggle */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#415a77]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by domain, URL, or engine..."
              className="w-full rounded-2xl border border-[#415a77]/30 bg-white py-2.5 pl-10 pr-4 text-xs text-[#0b192c] placeholder:text-[#415a77]/60 focus:border-[#0b192c] focus:outline-none shadow-sm"
            />
          </div>

          {/* Engine Filter & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="rounded-xl border border-[#415a77]/30 bg-white px-3 py-2 text-xs font-semibold text-[#0b192c] focus:border-[#0b192c] focus:outline-none shadow-sm"
            >
              <option value="all">All Engines ({reports.length})</option>
              <option value="master-audit">Master 8-Engine Audit</option>
              <option value="health">Website Health</option>
              <option value="latency">Edge Latency</option>
              <option value="ai_ready">AI Readiness</option>
              <option value="repo">Repo Hygiene</option>
              <option value="eco">Eco Carbon</option>
              <option value="compliance">Compliance & Risk</option>
              <option value="migration">Platform Migration</option>
              <option value="llmo">AI Search Optimization</option>
            </select>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="rounded-xl border border-[#415a77]/30 bg-white px-3 py-2 text-xs font-semibold text-[#0b192c] focus:border-[#0b192c] focus:outline-none shadow-sm"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="domain">Sort: Domain (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-[#415a77]/30 bg-[#0b192c] p-0.5 shadow-sm text-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-[#415a77] text-white' : 'text-[#c5d3e8] hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === 'table' ? 'bg-[#415a77] text-white' : 'text-[#c5d3e8] hover:text-white'
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#415a77] border-t-transparent" />
              <span className="text-xs text-[#415a77]">Loading your telemetry history from Firestore...</span>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-12 text-center shadow-2xl text-[#f8fafc]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#152238] text-[#c5d3e8] mb-4 border border-[#415a77]/40">
              <span className="material-symbols-outlined text-3xl">folder_open</span>
            </div>
            <h3 className="text-lg font-bold text-[#f8fafc]">No Audit Records Found</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[#c5d3e8]">
              {searchQuery || selectedEngine !== 'all'
                ? "No reports match your active search or engine filter criteria."
                : "You haven't run any web health scans yet. Launch your first diagnostic audit to start building your history."}
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#33475e] shadow-md"
              >
                Launch First Audit
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => {
              const meta = ENGINES_MAP[report.engine] || {
                name: report.engine,
                icon: 'bolt',
                badgeClass: 'bg-[#152238] text-[#c5d3e8] border-[#415a77]/40'
              };

              const domain = extractDomainFromUrl(report.url);
              const domainSlug = urlToDomainSlug(report.url);

              const formattedDate = report.createdAt
                ? new Date(report.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Recent';

              return (
                <div
                  key={report.id || domainSlug}
                  onClick={() => handleNavigateToReport(report)}
                  className="group relative flex flex-col justify-between rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 transition-all hover:border-[#c5d3e8] hover:bg-[#152238] hover:shadow-2xl cursor-pointer text-[#f8fafc]"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#152238] text-[#c5d3e8] border border-[#415a77]/40 text-base">
                          <span className="material-symbols-outlined text-base">{meta.icon}</span>
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-[#f8fafc] group-hover:text-[#c5d3e8] transition-colors truncate max-w-[170px]">
                            {domain}
                          </h3>
                          <span className="text-[10px] text-[#c5d3e8] font-mono">
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-lg border shrink-0 ${meta.badgeClass}`}>
                        {meta.name}
                      </span>
                    </div>

                    <p className="text-xs text-[#c5d3e8] line-clamp-1 font-mono break-all mb-4">
                      {report.url}
                    </p>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between border-t border-[#415a77]/30 pt-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      {/* PDF Export Button */}
                      <button
                        onClick={(e) => handleDirectExportPdf(report, e)}
                        disabled={exportingId === report.id}
                        className="flex items-center gap-1 rounded-lg border border-[#415a77]/40 bg-[#152238] px-2.5 py-1 text-[11px] font-semibold text-[#c5d3e8] hover:bg-[#1f314d] transition-colors disabled:opacity-50"
                        title="Export PDF Dossier"
                      >
                        <Download className="h-3 w-3" />
                        <span>{exportingId === report.id ? 'Exporting...' : 'PDF'}</span>
                      </button>

                      {/* Copy Link Button */}
                      <button
                        onClick={(e) => handleCopyLink(report, e)}
                        className="rounded-lg p-1.5 text-[#c5d3e8] hover:bg-[#152238] hover:text-white transition-colors"
                        title="Copy Benchmark Article Link"
                      >
                        {copiedId === (report.id || domainSlug) ? (
                          <Check className="h-3.5 w-3.5 text-[#c5d3e8]" />
                        ) : (
                          <Share2 className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(report.id!, e)}
                        disabled={deletingId === report.id}
                        className="rounded-lg p-1.5 text-[#c5d3e8] hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-semibold text-[#c5d3e8] group-hover:translate-x-0.5 transition-transform">
                      <span>Read Dossier</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-hidden rounded-2xl border border-[#415a77]/30 bg-[#0b192c] shadow-2xl text-[#f8fafc]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#415a77]/30 bg-[#152238] px-4 py-3 text-[#c5d3e8] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Target Domain & URL</th>
                    <th className="px-4 py-3">Engine</th>
                    <th className="px-4 py-3">Audit Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#415a77]/20 text-[#f8fafc]">
                  {filteredReports.map((report) => {
                    const meta = ENGINES_MAP[report.engine] || {
                      name: report.engine,
                      icon: 'bolt'
                    };
                    const formattedDate = report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString()
                      : 'Recent';
                    const domainSlug = urlToDomainSlug(report.url);

                    return (
                      <tr 
                        key={report.id || domainSlug}
                        onClick={() => handleNavigateToReport(report)}
                        className="hover:bg-[#152238]/60 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-[#f8fafc] max-w-[280px] truncate">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-[#c5d3e8]">{meta.icon}</span>
                            <span className="truncate">{report.url}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-lg bg-[#152238] px-2.5 py-0.5 text-[11px] text-[#c5d3e8] font-mono border border-[#415a77]/40">
                            {meta.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#c5d3e8]">
                          {formattedDate}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* PDF Export Button */}
                            <button
                              onClick={(e) => handleDirectExportPdf(report, e)}
                              disabled={exportingId === report.id}
                              className="flex items-center gap-1 rounded-lg border border-[#415a77]/40 bg-[#152238] px-2.5 py-0.5 text-[11px] font-semibold text-[#c5d3e8] hover:bg-[#1f314d] transition-colors disabled:opacity-50"
                              title="Export PDF"
                            >
                              <Download className="h-3 w-3" />
                              <span>{exportingId === report.id ? 'Exporting...' : 'PDF'}</span>
                            </button>

                            <button
                              onClick={(e) => handleCopyLink(report, e)}
                              className="rounded p-1 text-[#c5d3e8] hover:text-white"
                              title="Copy Link"
                            >
                              {copiedId === (report.id || domainSlug) ? <Check className="h-3.5 w-3.5 text-[#c5d3e8]" /> : <Share2 className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={(e) => handleDelete(report.id!, e)}
                              className="rounded p-1 text-[#c5d3e8] hover:text-rose-300"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleNavigateToReport(report)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#415a77] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#33475e]"
                            >
                              <span>Read Article</span>
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
