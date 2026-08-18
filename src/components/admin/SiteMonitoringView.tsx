import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MonitoredSite, SiteProbeResult, SystemHealthStats } from '../../types';
import { getMonitoredSites, saveMonitoredSite, deleteMonitoredSite } from '../../lib/firebase';
import { 
  Activity, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Server, 
  Clock, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Cpu,
  Database
} from 'lucide-react';

export const SiteMonitoringView: React.FC = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<MonitoredSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [probingId, setProbingId] = useState<string | null>(null);
  const [probingAll, setProbingAll] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealthStats | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    checkIntervalMinutes: 5,
    notes: ''
  });
  const [savingSite, setSavingSite] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await getMonitoredSites();
      setSites(data);
    } catch (err) {
      console.error("Error fetching monitored sites:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const res = await fetch('/api/monitor/system-health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (err) {
      console.warn("Could not load system health:", err);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleProbeSite = async (site: MonitoredSite) => {
    if (!site.id) return;
    setProbingId(site.id);
    try {
      const res = await fetch('/api/monitor/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: site.url })
      });
      const probeData: SiteProbeResult = await res.json();
      
      const updatedSite: MonitoredSite = {
        ...site,
        status: probeData.status || (probeData.success ? 'healthy' : 'down'),
        responseTimeMs: probeData.responseTimeMs,
        statusCode: probeData.statusCode,
        sslDaysRemaining: probeData.sslDaysRemaining,
        sslValid: probeData.sslValid,
        lastCheckedAt: Date.now()
      };

      setSites((prev) => prev.map((s) => (s.id === site.id ? updatedSite : s)));
      await saveMonitoredSite(updatedSite);
      
      setFeedbackMsg({
        text: `Probe completed for ${site.name}: ${probeData.statusCode || 'N/A'} in ${probeData.responseTimeMs}ms`,
        type: 'success'
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      console.error("Probe error:", err);
      setFeedbackMsg({ text: `Probe failed: ${err.message}`, type: 'error' });
    } finally {
      setProbingId(null);
    }
  };

  const handleProbeAll = async () => {
    if (sites.length === 0) return;
    setProbingAll(true);
    try {
      const probePromises = sites.map(async (site) => {
        try {
          const res = await fetch('/api/monitor/probe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: site.url })
          });
          const probeData: SiteProbeResult = await res.json();
          const updated: MonitoredSite = {
            ...site,
            status: probeData.status || (probeData.success ? 'healthy' : 'down'),
            responseTimeMs: probeData.responseTimeMs,
            statusCode: probeData.statusCode,
            sslDaysRemaining: probeData.sslDaysRemaining,
            sslValid: probeData.sslValid,
            lastCheckedAt: Date.now()
          };
          saveMonitoredSite(updated).catch(() => {});
          return updated;
        } catch {
          return site;
        }
      });

      const updatedSites = await Promise.all(probePromises);
      setSites(updatedSites);
      setFeedbackMsg({ text: `Successfully probed ${sites.length} endpoints simultaneously!`, type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setProbingAll(false);
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) return;

    setSavingSite(true);
    try {
      let cleanUrl = formData.url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      const newSite: Partial<MonitoredSite> = {
        name: formData.name.trim(),
        url: cleanUrl,
        checkIntervalMinutes: Number(formData.checkIntervalMinutes) || 5,
        notes: formData.notes.trim(),
        status: 'untested',
        createdAt: Date.now()
      };

      const docId = await saveMonitoredSite(newSite);
      const createdSite: MonitoredSite = {
        ...newSite,
        id: docId,
        ownerId: 'admin'
      } as MonitoredSite;

      setSites((prev) => [createdSite, ...prev]);
      setShowAddModal(false);
      setFormData({ name: '', url: '', checkIntervalMinutes: 5, notes: '' });

      // Run initial probe
      handleProbeSite(createdSite);
    } catch (err: any) {
      alert(`Error saving endpoint: ${err.message}`);
    } finally {
      setSavingSite(false);
    }
  };

  const handleDeleteSite = async (siteId: string, name: string) => {
    if (!confirm(`Are you sure you want to stop monitoring ${name}?`)) return;
    try {
      await deleteMonitoredSite(siteId);
      setSites((prev) => prev.filter((s) => s.id !== siteId));
    } catch (err: any) {
      alert(`Error deleting site: ${err.message}`);
    }
  };

  // Metrics computation
  const healthyCount = sites.filter((s) => s.status === 'healthy').length;
  const degradedCount = sites.filter((s) => s.status === 'degraded').length;
  const downCount = sites.filter((s) => s.status === 'down').length;
  const testedSites = sites.filter((s) => s.responseTimeMs && s.responseTimeMs > 0);
  const avgLatency = testedSites.length > 0
    ? Math.round(testedSites.reduce((acc, s) => acc + (s.responseTimeMs || 0), 0) / testedSites.length)
    : 0;

  return (
    <div className="space-y-8">
      
      {/* Action Notification Toast */}
      {feedbackMsg && (
        <div className={`rounded-xl p-4 text-xs font-semibold flex items-center justify-between border ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
            : 'bg-red-950/40 border-red-500/40 text-red-300'
        }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Monitored Sites</span>
            <Globe className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{sites.length}</span>
            <span className="text-xs text-slate-500">endpoints</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Healthy Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{healthyCount}</span>
            <span className="text-xs text-slate-500">/ {sites.length} online</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Issues / Down</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${downCount > 0 ? 'text-red-400' : degradedCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {degradedCount + downCount}
            </span>
            <span className="text-xs text-slate-500">alerts</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Average Latency</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400">{avgLatency}</span>
            <span className="text-xs text-slate-500">ms TTFB</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            <span>Target Endpoints & Synthetic Health Radar</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous HTTP probes, SSL certificate validation, and real-time response latency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleProbeAll}
            disabled={probingAll || sites.length === 0}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${probingAll ? 'animate-spin' : ''}`} />
            <span>{probingAll ? 'Probing Cluster...' : 'Probe All Sites'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Monitored Site</span>
          </button>
        </div>
      </div>

      {/* Monitored Sites Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl backdrop-blur-md">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <div className="animate-spin inline-block mb-2">⏳</div>
            <div>Loading monitored endpoints...</div>
          </div>
        ) : sites.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Globe className="mx-auto h-8 w-8 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-300">No Monitored Sites Configured</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Add your primary web services, client applications, or microservice gateways for real-time uptime checks.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Your First Endpoint</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6">Endpoint & Host</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Latency</th>
                  <th className="py-3.5 px-4">HTTP Code</th>
                  <th className="py-3.5 px-4">SSL Certificate</th>
                  <th className="py-3.5 px-4">Last Checked</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {sites.map((site) => {
                  const isCurrentlyProbing = probingId === site.id;
                  return (
                    <tr key={site.id} className="hover:bg-slate-800/30 transition-colors">
                      
                      {/* Name & URL */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{site.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs text-cyan-400 hover:underline inline-flex items-center gap-1 max-w-[240px] truncate"
                          >
                            {site.url}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {site.status === 'healthy' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Operational</span>
                          </span>
                        ) : site.status === 'degraded' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Degraded</span>
                          </span>
                        ) : site.status === 'down' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 font-semibold text-red-400">
                            <XCircle className="h-3 w-3" />
                            <span>Outage</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 font-semibold text-slate-400">
                            <span>Untested</span>
                          </span>
                        )}
                      </td>

                      {/* Latency */}
                      <td className="py-4 px-4 font-mono font-bold whitespace-nowrap">
                        {site.responseTimeMs !== undefined ? (
                          <span className={site.responseTimeMs < 200 ? 'text-emerald-400' : site.responseTimeMs < 600 ? 'text-amber-400' : 'text-red-400'}>
                            {site.responseTimeMs} ms
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Status Code */}
                      <td className="py-4 px-4 font-mono whitespace-nowrap">
                        {site.statusCode ? (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            site.statusCode < 300 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : site.statusCode < 400 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            HTTP {site.statusCode}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* SSL Certificate */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {site.sslValid ? (
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>{site.sslDaysRemaining ?? 90}d remaining</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-400">
                            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                            <span>Unsecured / Check</span>
                          </span>
                        )}
                      </td>

                      {/* Last Checked */}
                      <td className="py-4 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {site.lastCheckedAt ? (
                          <span>{new Date(site.lastCheckedAt).toLocaleTimeString()}</span>
                        ) : (
                          <span>Never</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleProbeSite(site)}
                            disabled={isCurrentlyProbing}
                            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                            title="Instant Probe"
                          >
                            <Zap className={`h-3.5 w-3.5 ${isCurrentlyProbing ? 'animate-spin text-cyan-400' : ''}`} />
                          </button>

                          <button
                            onClick={() => navigate(`/?url=${encodeURIComponent(site.url)}`)}
                            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                            title="Run 8-Engine Master Audit"
                          >
                            <Server className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => site.id && handleDeleteSite(site.id, site.name)}
                            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:border-red-900/50 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                            title="Delete Endpoint"
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

      {/* System Infrastructure Telemetry Card */}
      {systemHealth && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Server className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Diagnostic Server & Node Runtime Telemetry</h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{systemHealth.status.toUpperCase()}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
              <div className="text-slate-500 text-[10px] uppercase font-sans">Platform & Node</div>
              <div className="text-white font-bold mt-1 truncate">{systemHealth.nodeVersion}</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{systemHealth.platform}</div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
              <div className="text-slate-500 text-[10px] uppercase font-sans">Server Uptime</div>
              <div className="text-cyan-400 font-bold mt-1">
                {Math.floor(systemHealth.uptimeSeconds / 60)}m {systemHealth.uptimeSeconds % 60}s
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Continuous session</div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
              <div className="text-slate-500 text-[10px] uppercase font-sans">Heap Memory Used</div>
              <div className="text-emerald-400 font-bold mt-1">{systemHealth.memoryUsageMb.heapUsed} MB</div>
              <div className="text-[11px] text-slate-400 mt-0.5">/ {systemHealth.memoryUsageMb.heapTotal} MB allocated</div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
              <div className="text-slate-500 text-[10px] uppercase font-sans">Active Engines</div>
              <div className="text-white font-bold mt-1">{systemHealth.activeEnginesCount} Engines Active</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{systemHealth.totalAuditsLogged} total audits run</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Monitored Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-cyan-400" />
                <span>Add Monitored Endpoint</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Service / Application Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. HazardNet Production Gateway"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Endpoint URL
                </label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com or api.example.com/health"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Probe Interval
                  </label>
                  <select
                    value={formData.checkIntervalMinutes}
                    onChange={(e) => setFormData({ ...formData, checkIntervalMinutes: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value={1}>Every 1 min</option>
                    <option value={5}>Every 5 mins</option>
                    <option value={15}>Every 15 mins</option>
                    <option value={60}>Every 1 hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SSL Alerts
                  </label>
                  <div className="flex h-[42px] items-center rounded-xl border border-slate-700 bg-slate-950/50 px-3 text-xs text-emerald-400 font-semibold">
                    ✓ Auto-Check (TLS 1.3)
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes / Architecture Context (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes about infrastructure, staging vs prod, SLA targets..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSite}
                  className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                >
                  {savingSite ? 'Saving...' : 'Add Endpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
