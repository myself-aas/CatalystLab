import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserReports, deleteReport } from '../lib/firebase';
import { ENGINES_MAP } from '../data/engines';
import { TerminalOutput } from '../components/TerminalOutput';
import { exportAuditReportDataToPdf, exportReportToPdf } from '../utils/pdfExport';
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
  Printer,
  X,
  FileText,
  Eye
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
  
  // Selected Report for In-Dashboard Modal Viewer
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [modalExporting, setModalExporting] = useState(false);

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
    if (!confirm("Are you sure you want to permanently delete this audit report?")) return;
    
    setDeletingId(reportId);
    try {
      await deleteReport(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
      alert("Failed to delete report.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/report/${reportId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(reportId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDirectExportPdf = async (report: AuditReport, e: React.MouseEvent) => {
    e.stopPropagation();
    setExportingId(report.id || 'current');
    try {
      await exportAuditReportDataToPdf(report);
    } catch (err) {
      console.error("Export PDF failed:", err);
      alert("PDF export encountered an issue. Using print preview fallback.");
      window.print();
    } finally {
      setExportingId(null);
    }
  };

  const handleModalExportPdf = async () => {
    if (!selectedReport) return;
    setModalExporting(true);
    try {
      const modalElement = document.getElementById('dashboard-modal-dossier-content');
      if (modalElement) {
        let domain = selectedReport.url;
        try {
          domain = new URL(selectedReport.url.startsWith('http') ? selectedReport.url : `https://${selectedReport.url}`).hostname;
        } catch {}
        const safeDomain = domain.replace(/[^a-zA-Z0-9]/g, '_');
        await exportReportToPdf('dashboard-modal-dossier-content', `CatalystLab-${safeDomain}-${selectedReport.engine}.pdf`);
      } else {
        await exportAuditReportDataToPdf(selectedReport);
      }
    } catch (err) {
      console.error("Modal PDF export failed:", err);
      window.print();
    } finally {
      setModalExporting(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
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

  // Metrics
  const totalAudits = reports.length;
  const uniqueDomains = new Set(reports.map(r => {
    try {
      return new URL(r.url.startsWith('http') ? r.url : `https://${r.url}`).hostname;
    } catch {
      return r.url;
    }
  })).size;
  const latestAuditDate = reports[0]?.createdAt 
    ? new Date(reports[0].createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'None';

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-sm text-slate-400">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl text-cyan-400 mb-4 border border-cyan-500/20">
            🔐
          </div>
          <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
          <p className="mt-2 text-sm text-slate-400">
            Access your personal audit dashboard, manage saved reports, and export PDF dossiers tied to your Google Account.
          </p>
          <button
            onClick={() => login()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      
      {/* Dashboard Top Header */}
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            
            {/* User Profile Card */}
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className="h-16 w-16 rounded-2xl border-2 border-cyan-500/40 object-cover shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl font-bold text-slate-950 shadow-lg">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white">
                    {user.displayName || 'Audit Engineer'}
                  </h1>
                  <span className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Google Account
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{user.email}</p>
              </div>
            </div>

            {/* Launch Action */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all"
              >
                <span>+ Launch New Master Audit</span>
              </Link>
            </div>
          </div>

          {/* Metric Telemetry Stats */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Saved Audits</span>
                <Activity className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">{totalAudits}</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unique Domains Analyzed</span>
                <Globe className="h-4 w-4 text-blue-400" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">{uniqueDomains}</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest Activity</span>
                <Calendar className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">{latestAuditDate}</div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content & Audit Directory */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Filter & Search Bar */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by domain, engine, or title..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Engine Filter & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 focus:border-cyan-500 focus:outline-none"
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
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="domain">Sort: Domain (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-white'
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
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              <span className="text-xs text-slate-400">Loading your telemetry history from Firestore...</span>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl text-slate-400 mb-4">
              📂
            </div>
            <h3 className="text-lg font-bold text-white">No Audit Records Found</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
              {searchQuery || selectedEngine !== 'all'
                ? "No reports match your active search or engine filter criteria."
                : "You haven't run any web health scans yet. Launch your first diagnostic audit to start building your history."}
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
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
                icon: '⚡',
                badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              };

              let domain = report.url;
              try {
                domain = new URL(report.url.startsWith('http') ? report.url : `https://${report.url}`).hostname;
              } catch {}

              const formattedDate = report.createdAt
                ? new Date(report.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Recent';

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-all hover:border-cyan-500/40 hover:bg-slate-900 hover:shadow-xl cursor-pointer"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{meta.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate max-w-[180px]">
                            {domain}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${meta.badgeClass}`}>
                        {meta.name}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 font-mono break-all mb-4">
                      {report.url}
                    </p>
                  </div>

                  {/* Card Bottom Actions with PDF Export Button */}
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-2">
                    <div className="flex items-center gap-1">
                      {/* PDF Export Button */}
                      <button
                        onClick={(e) => handleDirectExportPdf(report, e)}
                        disabled={exportingId === report.id}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] font-semibold text-cyan-400 hover:bg-slate-700 transition-colors disabled:opacity-50"
                        title="Export PDF Dossier"
                      >
                        <Download className="h-3 w-3" />
                        <span>{exportingId === report.id ? 'Exporting...' : 'PDF'}</span>
                      </button>

                      {/* Copy Link Button */}
                      <button
                        onClick={(e) => handleCopyLink(report.id!, e)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        title="Copy Permalink"
                      >
                        {copiedId === report.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(report.id!, e)}
                        disabled={deletingId === report.id}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900 px-4 py-3 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Target Domain & URL</th>
                    <th className="px-4 py-3">Engine</th>
                    <th className="px-4 py-3">Audit Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredReports.map((report) => {
                    const meta = ENGINES_MAP[report.engine] || {
                      name: report.engine,
                      icon: '⚡'
                    };
                    const formattedDate = report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString()
                      : 'Recent';

                    return (
                      <tr 
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-white max-w-[280px] truncate">
                          <div className="flex items-center gap-2">
                            <span>{meta.icon}</span>
                            <span className="truncate">{report.url}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-cyan-400">
                            {meta.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {formattedDate}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* PDF Export Button */}
                            <button
                              onClick={(e) => handleDirectExportPdf(report, e)}
                              disabled={exportingId === report.id}
                              className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-cyan-400 hover:bg-slate-700 transition-colors disabled:opacity-50"
                              title="Export PDF"
                            >
                              <Download className="h-3 w-3" />
                              <span>{exportingId === report.id ? 'Exporting...' : 'PDF'}</span>
                            </button>

                            <button
                              onClick={(e) => handleCopyLink(report.id!, e)}
                              className="rounded p-1 text-slate-400 hover:text-white"
                              title="Copy Link"
                            >
                              {copiedId === report.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={(e) => handleDelete(report.id!, e)}
                              className="rounded p-1 text-slate-500 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="rounded bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400 hover:bg-cyan-500/20"
                            >
                              View →
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

      {/* Interactive In-Dashboard Report Dossier View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            
            {/* Modal Header & Action Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {ENGINES_MAP[selectedReport.engine]?.icon || '⚡'}
                </span>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Audit Dossier View</span>
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400 border border-cyan-500/20">
                      {ENGINES_MAP[selectedReport.engine]?.name || selectedReport.engine}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono max-w-md truncate">
                    {selectedReport.url}
                  </p>
                </div>
              </div>

              {/* Action Buttons: PDF Export, Print, Share, Close */}
              <div className="flex items-center gap-2">
                {/* PDF Export Button */}
                <button
                  onClick={handleModalExportPdf}
                  disabled={modalExporting}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  title="Trigger PDF Export of Current Audit Results"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{modalExporting ? 'Exporting PDF...' : 'Export PDF'}</span>
                </button>

                {/* Print Utility Button */}
                <button
                  onClick={handleBrowserPrint}
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                  title="Print via Browser Utility"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-400" />
                  <span>Print</span>
                </button>

                {/* Open Permalink Page */}
                <Link
                  to={`/report/${selectedReport.id}`}
                  className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                  title="Open Dedicated Permalink Page"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Permalink</span>
                </Link>

                {/* Close Modal */}
                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  title="Close Preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Rendered Dossier Content */}
            <div id="dashboard-modal-dossier-content" className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/70">
              
              {/* Dossier Header Info */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    <strong className="text-slate-200">Target URL:</strong>{' '}
                    <span className="font-mono text-cyan-400">{selectedReport.url}</span>
                  </div>
                  <div>
                    <strong className="text-slate-200">Audit Timestamp:</strong>{' '}
                    <span>{selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopyLink(selectedReport.id!, e)}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    <Share2 className="h-3 w-3 text-cyan-400" />
                    <span>{copiedId === selectedReport.id ? 'Copied' : 'Share Link'}</span>
                  </button>
                </div>
              </div>

              {/* Terminal Output */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-1">
                <TerminalOutput
                  title={`Diagnostic Telemetry Output`}
                  icon={ENGINES_MAP[selectedReport.engine]?.icon || '⚡'}
                  output={selectedReport.output}
                  maxHeight="max-h-[500px]"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-500">
              <span>Verified Firestore Audit ID: <span className="font-mono text-slate-400">{selectedReport.id}</span></span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleModalExportPdf}
                  disabled={modalExporting}
                  className="text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
