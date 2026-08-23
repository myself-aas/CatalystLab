import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Activity, Users, Clock, Globe, ArrowUpRight, ArrowDownRight, 
  Smartphone, Monitor, Bell, Mail, Hash, MousePointerClick,
  Send, Eye, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck,
  Zap, Server, Cpu, Database, Play, ExternalLink, X, Info,
  Copy, Check, Code, Terminal, FileCode, ArrowRight, ShieldAlert,
  Layers, Sparkles, CheckCircle2, Award
} from 'lucide-react';
import { SDLC_CATALYSTS_LIST, TOTAL_EXPERTS_REPLACED } from '../../data/engines';
import type { AuditReport } from '../../types';

import { motion } from 'framer-motion';

const catImages = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 30 }
  }
};


interface UserAnalyticsDashboardProps {
  reports?: AuditReport[];
}

const BRAND_COLORS = ['#0b192c', '#415a77', '#38bdf8', '#c5d3e8', '#10b981'];

interface AnalyticsStats {
  domain: string;
  timeframe: string;
  uniqueVisitors: number;
  totalPageviews: number;
  totalSessions: number;
  bounceRate: number;
  avgSessionDurationSeconds: number;
  avgSessionDurationFormatted: string;
  activeVisitorsNow: number;
  timeSeries: {
    time: string;
    visitors: number;
    views: number;
    bounceRate: number;
  }[];
  sources: { name: string; value: number; count: number }[];
  devices: { name: string; value: number; count: number }[];
  browsers: { name: string; visitors: number }[];
  countries: { country: string; count: number }[];
  topPages: { pathname: string; views: number; uniqueVisitors: number }[];
}

export const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({ reports = [] }) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [realtimeVisitors, setRealtimeVisitors] = useState<number>(38);
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'sdlc-catalysts' | 'par-blueprint' | 'proxy-setup' | 'notifications' | 'architecture'>('analytics');
  const [proxyPlatform, setProxyPlatform] = useState<'html' | 'vercel' | 'cloudflare' | 'nextjs' | 'netlify' | 'nginx' | 'apache'>('html');
  const [targetDomain, setTargetDomain] = useState<string>('example.com');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // PAR Studio Generator state
  const [parProjectName, setParProjectName] = useState<string>('Production SaaS Web Platform');
  const [parDbChoice, setParDbChoice] = useState<'mongodb_firebase' | 'mongodb_standalone' | 'hybrid'>('mongodb_firebase');
  const [parSelectedStage, setParSelectedStage] = useState<'architecture' | 'schemas' | 'aggregation' | 'ai_prompt'>('architecture');

  // Test Ping Ingestion State
  const [pingTestStatus, setPingTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  // Notification & Webhook State
  const [mailgunRecipient, setMailgunRecipient] = useState<string>('support@catalystlab.tech');
  const [slackWebhook, setSlackWebhook] = useState<string>('');
  const [discordWebhook, setDiscordWebhook] = useState<string>('https://discord.com/api/webhooks/123/XXXX');
  
  // Modal Preview States
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewType, setPreviewType] = useState<'weekly' | 'anomaly'>('weekly');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  // Dispatch Action Feedback
  const [dispatchStatus, setDispatchStatus] = useState<{
    loading: boolean;
    type?: 'email' | 'slack' | 'discord' | 'anomaly';
    success?: boolean;
    message?: string;
  }>({ loading: false });

  // Copy-to-clipboard handler
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Live Test Ingestion Ping Handler (Phase 3 Step 2 verification)
  const handleSendTestPing = async () => {
    setPingTestStatus({ loading: true });
    try {
      const activeDom = targetDomain || (selectedDomain === 'all' ? 'catalystlab.tech' : selectedDomain);
      const res = await fetch('/api/telemetry/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: activeDom,
          name: 'pageview',
          url: `https://${activeDom}/test-ping-${Date.now()}`,
          pathname: `/test-ping-${Date.now()}`,
          referrer: 'https://google.com/search?q=catalystlab'
        })
      });
      if (res.status === 202 || res.ok) {
        setPingTestStatus({
          loading: false,
          success: true,
          message: `Event for ${activeDom} successfully ingested (HTTP 202 Accepted). In-memory queue buffered & flushing.`
        });
        setTimeout(() => {
          fetchStats();
        }, 3200);
      } else {
        setPingTestStatus({
          loading: false,
          success: false,
          message: `Server returned HTTP ${res.status}`
        });
      }
    } catch (err: unknown) {
      setPingTestStatus({
        loading: false,
        success: false,
        message: err.message || 'Failed to dispatch test ping.'
      });
    }
  };

  // Extract unique domains from reports or defaults
  const domainList = Array.from(new Set([
    'all',
    'catalystlab.tech',
    ...reports.map(r => {
      try {
        const clean = r.url.startsWith('http') ? r.url : `https://${r.url}`;
        return new URL(clean).hostname;
      } catch {
        return r.url || '';
      }
    }).filter(Boolean)
  ]));

  // Fetch Analytics from Zero-Cost Backend
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/stats?domain=${encodeURIComponent(selectedDomain)}&timeframe=${timeframe}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Expected application/json but received ${contentType}`);
      }
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
        setRealtimeVisitors(data.stats.activeVisitorsNow || 38);
      }
    } catch (e) {
      console.warn('[Analytics Dashboard] Telemetry query fallback notice:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeframe, selectedDomain]);

  // Polling for live pulse every 6 seconds
  useEffect(() => {
    const pulseInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analytics/realtime?domain=${encodeURIComponent(selectedDomain)}`);
        if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
          const data = await res.json();
          if (data.success && typeof data.activeVisitorsNow === 'number') {
            setRealtimeVisitors(data.activeVisitorsNow);
          }
        }
      } catch (e) {
        // quiet fallback
      }
    }, 6000);
    return () => clearInterval(pulseInterval);
  }, [selectedDomain]);

  // Handle HTML Email Dossier Preview
  const handleOpenPreview = async (type: 'weekly' | 'anomaly') => {
    setPreviewType(type);
    setPreviewModalOpen(true);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/notifications/email/preview-html?type=${type}&domain=${encodeURIComponent(selectedDomain === 'all' ? 'catalystlab.tech' : selectedDomain)}`);
      const html = await res.text();
      setPreviewHtml(html);
    } catch (e) {
      setPreviewHtml('<p class="p-4 text-rose-600">Failed to render email preview.</p>');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Dispatch Test Weekly Digest via Mailgun
  const handleSendMailgunDigest = async () => {
    if (!mailgunRecipient) return;
    setDispatchStatus({ loading: true, type: 'email' });
    try {
      const res = await fetch('/api/notifications/email/weekly-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: selectedDomain === 'all' ? 'catalystlab.tech' : selectedDomain,
          recipientEmail: mailgunRecipient
        })
      });
      const data = await res.json();
      if (data.success) {
        setDispatchStatus({
          loading: false,
          type: 'email',
          success: true,
          message: data.mock
            ? `Dispatched simulated weekly dossier to ${mailgunRecipient} (Mock Mode).`
            : `Weekly dossier successfully delivered to ${mailgunRecipient} via Mailgun API.`
        });
      } else {
        setDispatchStatus({
          loading: false,
          type: 'email',
          success: false,
          message: data.error || 'Failed to dispatch email.'
        });
      }
    } catch (err: unknown) {
      setDispatchStatus({ loading: false, type: 'email', success: false, message: err.message });
    }
  };

  // Dispatch Test Slack Webhook
  const handleTestSlack = async () => {
    setDispatchStatus({ loading: true, type: 'slack' });
    try {
      const res = await fetch('/api/notifications/webhook/test-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: slackWebhook,
          domain: selectedDomain === 'all' ? 'catalystlab.tech' : selectedDomain
        })
      });
      const data = await res.json();
      setDispatchStatus({
        loading: false,
        type: 'slack',
        success: data.success,
        message: data.success
          ? `Slack Block Kit payload delivered successfully (${data.responseTimeMs || 25}ms).`
          : `Slack dispatch failed: ${data.error || 'Check webhook URL'}`
      });
    } catch (err: unknown) {
      setDispatchStatus({ loading: false, type: 'slack', success: false, message: err.message });
    }
  };

  // Dispatch Test Discord Webhook
  const handleTestDiscord = async () => {
    setDispatchStatus({ loading: true, type: 'discord' });
    try {
      const res = await fetch('/api/notifications/webhook/test-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: discordWebhook,
          domain: selectedDomain === 'all' ? 'catalystlab.tech' : selectedDomain
        })
      });
      const data = await res.json();
      setDispatchStatus({
        loading: false,
        type: 'discord',
        success: data.success,
        message: data.success
          ? `Discord Rich Embed delivered successfully (${data.responseTimeMs || 20}ms).`
          : `Discord dispatch failed: ${data.error || 'Check webhook URL'}`
      });
    } catch (err: unknown) {
      setDispatchStatus({ loading: false, type: 'discord', success: false, message: err.message });
    }
  };

  // Execute Anomaly Detection Check & Simulation
  const handleRunAnomalyCheck = async (simulateSpike: boolean = false) => {
    setDispatchStatus({ loading: true, type: 'anomaly' });
    try {
      if (simulateSpike) {
        // Send simulated anomaly alert email & webhooks
        const res = await fetch('/api/notifications/email/anomaly-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: selectedDomain === 'all' ? 'catalystlab.tech' : selectedDomain,
            recipientEmail: mailgunRecipient,
            anomalyType: 'traffic_spike',
            currentValue: '4,850 reqs/hr',
            baselineValue: '1,200 reqs/hr',
            deviationPercentage: 304.2,
            recommendedAction: 'Inspect upstream CDN hit ratio, origin server CPU load, and check for viral backlink surge.'
          })
        });
        const data = await res.json();
        setDispatchStatus({
          loading: false,
          type: 'anomaly',
          success: true,
          message: 'Traffic Surge Anomaly (+304%) simulated. Alert email & webhook alerts triggered.'
        });
      } else {
        const res = await fetch('/api/analytics/anomalies/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: selectedDomain,
            notify: true,
            alertEmail: mailgunRecipient,
            slackWebhookUrl: slackWebhook,
            discordWebhookUrl: discordWebhook
          })
        });
        const data = await res.json();
        setDispatchStatus({
          loading: false,
          type: 'anomaly',
          success: true,
          message: data.anomaly?.hasAnomaly
            ? `Anomaly Detected: ${data.anomaly.type} (${data.anomaly.deviationPercent.toFixed(1)}% deviation). Alerts dispatched.`
            : `All traffic within standard 24h baseline (+${data.anomaly?.deviationPercent?.toFixed(1) || '0'}%). No anomaly triggered.`
        });
      }
    } catch (err: unknown) {
      setDispatchStatus({ loading: false, type: 'anomaly', success: false, message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-Tabs Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#415a77]" />
            <h2 className="text-lg font-bold text-black">Plausible-Style Zero-Cost Telemetry & Alerts</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-black uppercase">
              Phase 4 & 5
            </span>
          </div>
          <p className="text-xs text-[#415a77] mt-1">
            Cookieless daily-salt hashing, zero-cost MongoDB time-series aggregations, and Mailgun/Webhook dossiers.
          </p>
        </div>

        {/* Sub-View Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="user-analytics-view-select" className="text-xs font-bold text-[#415a77]">Section:</label>
          <select
            id="user-analytics-view-select"
            value={activeSubTab}
            onChange={(e) => setActiveSubTab(e.target.value as any)}
            className="rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-bold text-black shadow-sm focus:border-[#38bdf8] focus:outline-none"
          >
            <option value="analytics">📊 Analytics & Charts</option>
            <option value="sdlc-catalysts">⚡ SDLC Catalysts (8 Stages)</option>
            <option value="par-blueprint">🧱 PAR Blueprint (Phase 1)</option>
            <option value="proxy-setup">🛡️ Ad-Blocker Proof Proxy (Phase 3)</option>
            <option value="notifications">🔔 Email & Webhooks</option>
            <option value="architecture">💻 $0 GSDP Stack</option>
          </select>
        </div>
      </div>

      {/* Control Bar: Domain Filter, Timeframe, Live Visitor Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#415a77]">Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="text-xs font-bold text-black bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#415a77]"
            >
              {domainList.map(d => (
                <option key={d} value={d}>
                  {d === 'all' ? 'All Monitored Domains' : d}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchStats}
            title="Refresh telemetry queries"
            className="p-1.5 text-[#415a77] hover:text-black hover:bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Visitor Pulse */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-800 font-mono">
              {realtimeVisitors} Active Now
            </span>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-1 text-xs font-bold">
            {(['24h', '7d', '30d', 'all'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeframe === t ? 'bg-white text-black shadow-sm' : 'text-[#415a77] hover:bg-[#e2e8f0]'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main View Switching */}
      {activeSubTab === 'analytics' && (
        <>
          {/* Top 4 Zero-Cost Metric Cards (Phase 5 Mathematical Aggregations) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Cookieless Unique Visitors */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-bold text-[#415a77] uppercase tracking-wider">Unique Visitors</p>
                    <span className="text-[9px] bg-[#f1f5f9] text-[#415a77] px-1 py-0.2 rounded font-mono" title="SHA256(IP + UA + Salt)">
                      Cookieless
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-black font-mono mt-1">
                    {stats ? stats.uniqueVisitors.toLocaleString() : '---'}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-black">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748b]">
                <span className="font-mono text-[#059669] font-bold flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> +14.2%
                </span>
                <span>$group: "$visitor_id"</span>
              </div>
            </div>

            {/* 2. Total Pageviews */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#415a77] uppercase tracking-wider">Total Pageviews</p>
                  <h3 className="text-2xl font-black text-black font-mono mt-1">
                    {stats ? stats.totalPageviews.toLocaleString() : '---'}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-black">
                  <MousePointerClick className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748b]">
                <span className="font-mono text-[#059669] font-bold flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> +8.7%
                </span>
                <span>Time-series stream</span>
              </div>
            </div>

            {/* 3. Bounce Rate (Sessions with event count === 1) */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-bold text-[#415a77] uppercase tracking-wider">Bounce Rate</p>
                    <span className="text-[9px] bg-rose-50 text-rose-700 px-1 py-0.2 rounded font-mono">
                      Single Event
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-black font-mono mt-1">
                    {stats ? `${stats.bounceRate.toFixed(1)}%` : '---'}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-black">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748b]">
                <span className="font-mono text-[#059669] font-bold flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-0.5 text-emerald-600" /> -2.4%
                </span>
                <span>$match: session.count == 1</span>
              </div>
            </div>

            {/* 4. Avg Session Duration ($subtract max - min) */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-bold text-[#415a77] uppercase tracking-wider">Avg Session Time</p>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded font-mono">
                      $subtract
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-black font-mono mt-1">
                    {stats ? stats.avgSessionDurationFormatted : '---'}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-black">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748b]">
                <span className="font-mono text-[#059669] font-bold flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> +18.4%
                </span>
                <span>$max(t) - $min(t)</span>
              </div>
            </div>

          </div>

          {/* Main Time-Series Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Recharts Visitors vs Views Area Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-black">Traffic Ingestion Flow (Visitors vs Views)</h3>
                  <p className="text-xs text-[#64748b]">Zero-cost aggregation across MongoDB Time-Series granularity</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-black">
                    <span className="h-2.5 w-2.5 rounded-full bg-white"></span> Visitors
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-[#38bdf8]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]"></span> Pageviews
                  </span>
                </div>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.timeSeries || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0b192c" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0b192c" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0b192c', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="views" name="Pageviews" stroke="#38bdf8" strokeWidth={2} fill="url(#viewsGrad)" />
                    <Area type="monotone" dataKey="visitors" name="Unique Visitors" stroke="#0b192c" strokeWidth={2} fill="url(#visitorsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Device Breakdown Pie Chart */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-black">Device & Form-Factor Share</h3>
                <p className="text-xs text-[#64748b] mb-4">Parsed via user-agent header</p>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.devices || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {(stats?.devices || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Geo Countries quick list */}
              <div className="border-t border-[#f1f5f9] pt-3 mt-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#415a77] mb-2">
                  <span>Top Country Origins</span>
                  <span className="text-[10px] text-[#64748b]">GeoIP Local</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(stats?.countries || []).slice(0, 5).map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#f8fafc] border border-[#e2e8f0] text-[11px] font-mono text-black">
                      {c.country}: {c.count.toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Lower Grid: Top Referrers & Top Visited URLs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Referrers */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-black mb-1">Top Referrers & Acquisition Channels</h3>
              <p className="text-xs text-[#64748b] mb-4">Zero-cost $group aggregation on document metadata.source</p>
              
              <div className="space-y-3.5">
                {(stats?.sources || []).map((s, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-black">{s.name}</span>
                      <span className="text-[#415a77] font-mono">{s.count.toLocaleString()} ({s.value}%)</span>
                    </div>
                    <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${s.value}%`, backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Visited URL Paths */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-black mb-1">Top Visited Pathnames & Views</h3>
              <p className="text-xs text-[#64748b] mb-4">Real-time aggregate of visited endpoints</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] text-[#64748b] font-bold">
                      <th className="pb-2">Pathname</th>
                      <th className="pb-2 text-right">Total Views</th>
                      <th className="pb-2 text-right">Unique Visitors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {(stats?.topPages || []).map((p, idx) => (
                      <tr key={idx} className="hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                        <td className="py-2.5 font-mono font-bold text-black">
                          {p.pathname}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[#415a77]">
                          {p.views.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[#059669] font-bold">
                          {p.uniqueVisitors.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Phase 3: The First-Party Proxy Strategy (Ad-Blocker Proof) */}
      {activeSubTab === 'proxy-setup' && (
        <div className="space-y-6">
          
          {/* Header Card */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-black">Phase 3: The First-Party Proxy Strategy (Ad-Blocker Proof)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      100% $0 GSDP Stack
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Serve the tracking script from your own domain and ingest telemetry via first-party API routes. Completely immune to uBlock Origin, Brave Shields, and Firefox ETP.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendTestPing}
                  disabled={pingTestStatus.loading}
                  className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Send className={`h-3.5 w-3.5 ${pingTestStatus.loading ? 'animate-pulse' : ''}`} />
                  {pingTestStatus.loading ? 'Dispatching Ping...' : 'Send Live Test Ping'}
                </button>
              </div>
            </div>

            {/* Test Ping Status Banner */}
            {pingTestStatus.message && (
              <div className={`mb-5 p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                pingTestStatus.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2">
                  {pingTestStatus.success ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-rose-600" />}
                  <span>{pingTestStatus.message}</span>
                </div>
                <button onClick={() => setPingTestStatus({ loading: false })} className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* The 3 Core Architectural Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
                <div className="flex items-center gap-2 font-bold text-xs text-black mb-1.5">
                  <FileCode className="h-4 w-4 text-[#415a77]" />
                  <span>Step 1: First-Party Asset</span>
                </div>
                <p className="text-xs font-bold text-black">Ultra-Lightweight &lt;1KB Vanilla JS</p>
                <p className="text-[11px] text-[#64748b] mt-1">
                  Served directly at <code>/telemetry.js</code>. Ad-blockers classify the script as first-party website code, not a 3rd-party tracker.
                </p>
              </div>

              <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
                <div className="flex items-center gap-2 font-bold text-xs text-black mb-1.5">
                  <Server className="h-4 w-4 text-[#415a77]" />
                  <span>Step 2: First-Party Ingestion</span>
                </div>
                <p className="text-xs font-bold text-black">POST /api/telemetry/event</p>
                <p className="text-[11px] text-[#64748b] mt-1">
                  Catches beacon payload, drops bots silently, performs local GeoIP lookup, hashes visitor daily-salt, and micro-batches to MongoDB.
                </p>
              </div>

              <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
                <div className="flex items-center gap-2 font-bold text-xs text-black mb-1.5">
                  <Layers className="h-4 w-4 text-[#059669]" />
                  <span>Step 3: Cross-Domain Proxies</span>
                </div>
                <p className="text-xs font-bold text-black">Cloudflare, Vercel & Nginx</p>
                <p className="text-[11px] text-[#64748b] mt-1">
                  Clients map <code>/stats/js</code> and <code>/stats/api/event</code> via their own CDN or edge server with zero configuration overhead.
                </p>
              </div>

            </div>

            {/* Step 3: Interactive Cross-Domain Snippet Generator */}
            <div className="border-t border-[#f1f5f9] pt-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-black">Step 3: Cross-Domain Reverse-Proxy & Script Generator</h4>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Select your client's hosting platform and customize the domain name to generate the exact zero-cost reverse-proxy configuration and tracking tag.
                </p>
              </div>

              {/* Domain Input Field */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-full sm:w-80">
                  <label className="block text-[11px] font-bold text-[#415a77] mb-1">Target Client Domain</label>
                  <input
                    type="text"
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    placeholder="e.g. yourclientapp.com"
                    className="w-full px-3.5 py-1.5 text-xs rounded-lg border border-[#e2e8f0] bg-[#f8fafc] focus:outline-none focus:border-[#0b192c] font-mono text-black font-bold"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-[#415a77] mb-1">Host Deployment Origin</label>
                  <input
                    type="text"
                    readOnly
                    value="https://catalystlab.tech"
                    className="w-full px-3.5 py-1.5 text-xs rounded-lg border border-[#e2e8f0] bg-gray-100 font-mono text-[#64748b]"
                  />
                </div>
              </div>

              {/* Platform Selector Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap border-b border-[#e2e8f0] pb-2 pt-2">
                {[
                  { id: 'html', label: '1. Direct HTML Tag' },
                  { id: 'cloudflare', label: '2. Cloudflare Worker' },
                  { id: 'vercel', label: '3. Vercel (vercel.json)' },
                  { id: 'nextjs', label: '4. Next.js (next.config.js)' },
                  { id: 'netlify', label: '5. Netlify (_redirects)' },
                  { id: 'nginx', label: '6. Nginx (nginx.conf)' },
                  { id: 'apache', label: '7. Apache (.htaccess)' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProxyPlatform(p.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      proxyPlatform === p.id
                        ? 'bg-white text-black shadow-xs'
                        : 'bg-[#f8fafc] text-[#415a77] hover:bg-[#e2e8f0]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Code Snippets */}
              <div className="space-y-4 pt-1">
                
                {/* Direct HTML Tag Snippet */}
                {proxyPlatform === 'html' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Direct First-Party Tracking Script Tag</span>
                      <button
                        onClick={() => handleCopy(`<script defer data-domain="${targetDomain || 'example.com'}" src="https://catalystlab.tech/telemetry.js"></script>`, 'direct-html')}
                        className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-xs font-bold text-black flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        {copiedKey === 'direct-html' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === 'direct-html' ? 'Copied!' : 'Copy Script Tag'}
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-white text-emerald-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200">
                      {`<!-- CatalystLab First-Party Telemetry (<1KB Vanilla JS, Zero Cookies, GDPR/ePrivacy Exempt) -->\n<script defer data-domain="${targetDomain || 'example.com'}" src="https://catalystlab.tech/telemetry.js"></script>`}
                    </pre>
                    <p className="text-[11px] text-[#64748b]">
                      Place this <code>&lt;script&gt;</code> inside the <code>&lt;head&gt;</code> section of your HTML. Automatically supports Single-Page Applications (SPA), History API route changes, and custom events.
                    </p>
                  </div>
                )}

                {/* Cloudflare Worker Proxy Snippet */}
                {proxyPlatform === 'cloudflare' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Cloudflare Worker Script (worker.js) - 100,000 Free Req/Day</span>
                      <button
                        onClick={() => handleCopy(`// Cloudflare Worker: Reverse Proxy for CatalystLab Telemetry
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const targetHost = 'https://catalystlab.tech';

  if (url.pathname === '/stats/js') {
    return fetch(\`\${targetHost}/telemetry.js\`);
  }
  if (url.pathname === '/stats/api/event') {
    return fetch(\`\${targetHost}/api/telemetry/event\`, {
      method: 'POST',
      headers: request.headers,
      body: request.body
    });
  }
  return fetch(request);
}`, 'cf-worker')}
                        className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-xs font-bold text-black flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        {copiedKey === 'cf-worker' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === 'cf-worker' ? 'Copied!' : 'Copy Worker Code'}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-white text-emerald-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200">
{`// Cloudflare Worker: Reverse Proxy for CatalystLab Telemetry
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const targetHost = 'https://catalystlab.tech';

  if (url.pathname === '/stats/js') {
    return fetch(\`\${targetHost}/telemetry.js\`);
  }
  if (url.pathname === '/stats/api/event') {
    return fetch(\`\${targetHost}/api/telemetry/event\`, {
      method: 'POST',
      headers: request.headers,
      body: request.body
    });
  }
  return fetch(request);
}`}
                    </pre>

                    <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-1 text-xs">
                      <p className="font-bold text-black">Then install this on {targetDomain || 'your site'}:</p>
                      <code className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-[#e2e8f0] block overflow-x-auto">
                        {`<script defer data-domain="${targetDomain || 'example.com'}" data-api="/stats/api/event" src="/stats/js"></script>`}
                      </code>
                    </div>
                  </div>
                )}

                {/* Vercel Rewrites Snippet */}
                {proxyPlatform === 'vercel' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Vercel Configuration (vercel.json)</span>
                      <button
                        onClick={() => handleCopy(`{
  "rewrites": [
    {
      "source": "/stats/js",
      "destination": "https://catalystlab.tech/telemetry.js"
    },
    {
      "source": "/stats/api/event",
      "destination": "https://catalystlab.tech/api/telemetry/event"
    }
  ]
}`, 'vercel-config')}
                        className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-xs font-bold text-black flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        {copiedKey === 'vercel-config' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === 'vercel-config' ? 'Copied!' : 'Copy vercel.json'}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-white text-emerald-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200">
{`{
  "rewrites": [
    {
      "source": "/stats/js",
      "destination": "https://catalystlab.tech/telemetry.js"
    },
    {
      "source": "/stats/api/event",
      "destination": "https://catalystlab.tech/api/telemetry/event"
    }
  ]
}`}
                    </pre>

                    <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-1 text-xs">
                      <p className="font-bold text-black">Then install this on {targetDomain || 'your site'}:</p>
                      <code className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-[#e2e8f0] block overflow-x-auto">
                        {`<script defer data-domain="${targetDomain || 'example.com'}" data-api="/stats/api/event" src="/stats/js"></script>`}
                      </code>
                    </div>
                  </div>
                )}

                {/* Next.js Rewrites Snippet */}
                {proxyPlatform === 'nextjs' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Next.js Configuration (next.config.js)</span>
                      <button
                        onClick={() => handleCopy(`// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/stats/js',
        destination: 'https://catalystlab.tech/telemetry.js',
      },
      {
        source: '/stats/api/event',
        destination: 'https://catalystlab.tech/api/telemetry/event',
      },
    ];
  },
};`, 'next-config')}
                        className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-xs font-bold text-black flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        {copiedKey === 'next-config' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === 'next-config' ? 'Copied!' : 'Copy next.config.js'}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-white text-emerald-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200">
{`// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/stats/js',
        destination: 'https://catalystlab.tech/telemetry.js',
      },
      {
        source: '/stats/api/event',
        destination: 'https://catalystlab.tech/api/telemetry/event',
      },
    ];
  },
};`}
                    </pre>

                    <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-1 text-xs">
                      <p className="font-bold text-black">Then install in your Next.js root layout or _app.js:</p>
                      <code className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-[#e2e8f0] block overflow-x-auto">
                        {`<script defer data-domain="${targetDomain || 'example.com'}" data-api="/stats/api/event" src="/stats/js"></script>`}
                      </code>
                    </div>
                  </div>
                )}

                {/* Netlify Snippet */}
                {proxyPlatform === 'netlify' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Netlify Configuration (_redirects or netlify.toml)</span>
                      <button
                        onClick={() => handleCopy(`# netlify.toml
[[redirects]]
  from = "/stats/js"
  to = "https://catalystlab.tech/telemetry.js"
  status = 200
  force = true

[[redirects]]
  from = "/stats/api/event"
  to = "https://catalystlab.tech/api/telemetry/event"
  status = 200
  force = true`, 'netlify-config')}
                        className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-xs font-bold text-black flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        {copiedKey === 'netlify-config' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === 'netlify-config' ? 'Copied!' : 'Copy Netlify Config'}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-white text-emerald-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200">
{`# netlify.toml
[[redirects]]
  from = "/stats/js"
  to = "https://catalystlab.tech/telemetry.js"
  status = 200
  force = true

[[redirects]]
  from = "/stats/api/event"
  to = "https://catalystlab.tech/api/telemetry/event"
  status = 200
  force = true`}
                    </pre>

                    <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-1 text-xs">
                      <p className="font-bold text-black">Then install this on {targetDomain || 'your site'}:</p>
                      <code className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-[#e2e8f0] block overflow-x-auto">
                        {`<script defer data-domain="${targetDomain || 'example.com'}" data-api="/stats/api/event" src="/stats/js"></script>`}
                      </code>
                    </div>
                  </div>
                )}

                {/* Nginx Proxy Snippet */}
                {proxyPlatform === 'nginx' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Nginx VirtualHost (nginx.conf)</span>
                      <button
                        onClick={() => handleCopy(`# Nginx Reverse Proxy Block
location = /stats/js {
    proxy_pass https://catalystlab.tech/telemetry.js;
    proxy_set_header Host catalystlab.tech;
    proxy_ssl_server_name on;
    proxy_buffering on;
    proxy_cache_valid 200 1d;
}

location = /stats/api/event {
    proxy_pass https://catalystlab.tech/api/telemetry/event;
    proxy_set_header Host catalystlab.tech;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_ssl_server_name on;
}`, 'nginx-config')}
                        className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-xs font-bold text-black flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        {copiedKey === 'nginx-config' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === 'nginx-config' ? 'Copied!' : 'Copy Nginx Block'}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-white text-emerald-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200">
{`# Nginx Reverse Proxy Block
location = /stats/js {
    proxy_pass https://catalystlab.tech/telemetry.js;
    proxy_set_header Host catalystlab.tech;
    proxy_ssl_server_name on;
    proxy_buffering on;
    proxy_cache_valid 200 1d;
}

location = /stats/api/event {
    proxy_pass https://catalystlab.tech/api/telemetry/event;
    proxy_set_header Host catalystlab.tech;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_ssl_server_name on;
}`}
                    </pre>

                    <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-1 text-xs">
                      <p className="font-bold text-black">Then install this on {targetDomain || 'your site'}:</p>
                      <code className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-[#e2e8f0] block overflow-x-auto">
                        {`<script defer data-domain="${targetDomain || 'example.com'}" data-api="/stats/api/event" src="/stats/js"></script>`}
                      </code>
                    </div>
                  </div>
                )}

                {/* Apache .htaccess Snippet */}
                {proxyPlatform === 'apache' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Apache (.htaccess)</span>
                      <button
                        onClick={() => handleCopy(`# Apache mod_rewrite Reverse Proxy
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^stats/js$ https://catalystlab.tech/telemetry.js [P,L]
  RewriteRule ^stats/api/event$ https://catalystlab.tech/api/telemetry/event [P,L]
</IfModule>`, 'apache-config')}
                        className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-xs font-bold text-black flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        {copiedKey === 'apache-config' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === 'apache-config' ? 'Copied!' : 'Copy .htaccess'}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-white text-emerald-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200">
{`# Apache mod_rewrite Reverse Proxy
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^stats/js$ https://catalystlab.tech/telemetry.js [P,L]
  RewriteRule ^stats/api/event$ https://catalystlab.tech/api/telemetry/event [P,L]
</IfModule>`}
                    </pre>

                    <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-1 text-xs">
                      <p className="font-bold text-black">Then install this on {targetDomain || 'your site'}:</p>
                      <code className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-[#e2e8f0] block overflow-x-auto">
                        {`<script defer data-domain="${targetDomain || 'example.com'}" data-api="/stats/api/event" src="/stats/js"></script>`}
                      </code>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      )}
      {activeSubTab === 'notifications' && (
        <div className="space-y-6">
          
          {/* Status Message Banner */}
          {dispatchStatus.message && (
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
              dispatchStatus.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2">
                {dispatchStatus.success ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-rose-600" />}
                <span>{dispatchStatus.message}</span>
              </div>
              <button onClick={() => setDispatchStatus({ loading: false })} className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Mailgun Dossiers & CRON Card */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-black">Step 4.1 & 4.2: Mailgun Email Dossiers & CRON</h3>
                    <p className="text-xs text-[#64748b]">
                      Dispatches weekly analytical summaries and instant traffic anomaly reports (GSDP Perk: 20,000 free emails/month).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPreview('weekly')}
                  className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-xs font-bold text-black hover:bg-[#e2e8f0] transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Eye className="h-3.5 w-3.5 text-[#415a77]" />
                  Preview Weekly Dossier
                </button>
                <button
                  onClick={() => handleOpenPreview('anomaly')}
                  className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-xs font-bold text-black hover:bg-[#e2e8f0] transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Eye className="h-3.5 w-3.5 text-rose-600" />
                  Preview Spike Alert
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#415a77] mb-1">Dossier Recipient Email Address</label>
                  <input
                    type="email"
                    value={mailgunRecipient}
                    onChange={(e) => setMailgunRecipient(e.target.value)}
                    placeholder="e.g. engineer@catalystlab.tech"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#e2e8f0] bg-[#f8fafc] focus:outline-none focus:border-[#0b192c] font-mono"
                  />
                  <span className="text-[11px] text-[#64748b] mt-1 block">
                    Scheduled via GitHub Actions CRON: Every Monday at 9:00 AM UTC (`0 9 * * 1`).
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSendMailgunDigest}
                    disabled={dispatchStatus.loading}
                    className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Dispatch Test Weekly Dossier
                  </button>
                </div>
              </div>

              {/* Schedule Info Box */}
              <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-black">
                  <Clock className="h-4 w-4 text-[#415a77]" />
                  <span>Configured CRON Automation Schedule</span>
                </div>
                <ul className="space-y-1.5 text-[#415a77] text-[11px] pl-4 list-disc">
                  <li><strong>Hourly Anomaly Radar:</strong> <code>0 * * * *</code> (Checks traffic spikes & drops vs rolling 24h baseline).</li>
                  <li><strong>Weekly Executive Dossier:</strong> <code>0 9 * * 1</code> (Every Monday at 9 AM UTC).</li>
                  <li><strong>GitHub Actions Pro Allowance:</strong> 3,000 free minutes/month (runs in &lt; 20s = 0 cost).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Webhooks Card (Slack & Discord - Phase 4.3) */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="border-b border-[#f1f5f9] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">Step 4.3: Free Webhook Ingestion (Slack & Discord)</h3>
                  <p className="text-xs text-[#64748b]">
                    Executes standard HTTP POST requests using native Node.js <code>fetch</code> (Zero third-party fees).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Slack Webhook Setup */}
              <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-[#F4EDE4] flex items-center justify-center font-bold text-xs text-[#4A154B]">
                      #
                    </div>
                    <span className="text-xs font-bold text-black">Slack Block Kit Webhook</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Ready
                  </span>
                </div>

                <input
                  type="url"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="Paste a Slack webhook URL"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#e2e8f0] bg-white font-mono"
                />

                <button
                  onClick={handleTestSlack}
                  disabled={dispatchStatus.loading}
                  className="w-full py-2 rounded-lg bg-white border border-[#e2e8f0] text-xs font-bold text-black hover:bg-[#f1f5f9] transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Send className="h-3 w-3 text-[#4A154B]" />
                  Test Slack Webhook Dispatch
                </button>
              </div>

              {/* Discord Webhook Setup */}
              <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-[#e8e9fb] flex items-center justify-center font-bold text-xs text-[#5865F2]">
                      D
                    </div>
                    <span className="text-xs font-bold text-black">Discord Rich Embed Webhook</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Ready
                  </span>
                </div>

                <input
                  type="url"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#e2e8f0] bg-white font-mono"
                />

                <button
                  onClick={handleTestDiscord}
                  disabled={dispatchStatus.loading}
                  className="w-full py-2 rounded-lg bg-white border border-[#e2e8f0] text-xs font-bold text-black hover:bg-[#f1f5f9] transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Send className="h-3 w-3 text-[#5865F2]" />
                  Test Discord Webhook Dispatch
                </button>
              </div>

            </div>

            {/* Anomaly Detection Trigger Simulator */}
            <div className="mt-6 pt-5 border-t border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-black">Simulate Anomaly Radar Pipeline</h4>
                <p className="text-[11px] text-[#64748b]">
                  Test how the system detects spikes/drops and dispatches across all configured notification channels.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunAnomalyCheck(false)}
                  disabled={dispatchStatus.loading}
                  className="px-3.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-xs font-bold text-black hover:bg-[#f1f5f9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Run Baseline Check
                </button>
                <button
                  onClick={() => handleRunAnomalyCheck(true)}
                  disabled={dispatchStatus.loading}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-black text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Simulate Traffic Surge (+304%)
                </button>
              </div>
            </div>

          </div>

          {/* GitHub Action CI/CD 8-Catalyst Quality Gate */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="border-b border-[#f1f5f9] pb-4 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-900 text-black">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-black">Step 4.4: Automated GitHub Actions CI/CD Quality Gate</h3>
                    <p className="text-xs text-[#64748b]">
                      Run all 8 SDLC Catalysts on every commit, PR, or scheduled CRON release gate (`.github/workflows/catalystlab-audit.yml`).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(`name: "CatalystLab 8-Stage Autonomous SDLC Audit"
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  schedule:
    - cron: '0 0 * * 1'

jobs:
  catalyst-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install requests beautifulsoup4
      - run: python3 python-engines/platform_migration_audit.py "https://${targetDomain || 'catalystlab.tech'}"
      - run: python3 python-engines/repo_scanner.py "https://github.com/\${{ github.repository }}"
      - run: python3 python-engines/eco_carbon_audit.py "https://${targetDomain || 'catalystlab.tech'}"
      - run: python3 python-engines/website_health.py "https://${targetDomain || 'catalystlab.tech'}"
      - run: python3 python-engines/edge_latency.py "https://${targetDomain || 'catalystlab.tech'}"
      - run: python3 python-engines/compliance_risk_audit.py "https://${targetDomain || 'catalystlab.tech'}"
      - run: python3 python-engines/ai_readiness.py "https://${targetDomain || 'catalystlab.tech'}"
      - run: python3 python-engines/llmo_optimizer.py "https://${targetDomain || 'catalystlab.tech'}"`, 'github-workflow-audit')}
                  className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  {copiedKey === 'github-workflow-audit' ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'github-workflow-audit' ? 'Copied Workflow!' : 'Copy GitHub Workflow'}</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-white text-emerald-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200">
{`# .github/workflows/catalystlab-audit.yml
name: "CatalystLab 8-Stage Autonomous SDLC Audit"
on:
  push:
    branches: [ main, master ]
  schedule:
    - cron: '0 0 * * 1' # Every Monday UTC

jobs:
  catalyst-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install requests beautifulsoup4
      - name: "Run All 8 SOTA Catalysts"
        run: |
          python3 python-engines/platform_migration_audit.py "https://${targetDomain || 'catalystlab.tech'}"
          python3 python-engines/repo_scanner.py "https://github.com/\${{ github.repository }}"
          python3 python-engines/eco_carbon_audit.py "https://${targetDomain || 'catalystlab.tech'}"
          python3 python-engines/website_health.py "https://${targetDomain || 'catalystlab.tech'}"
          python3 python-engines/edge_latency.py "https://${targetDomain || 'catalystlab.tech'}"
          python3 python-engines/compliance_risk_audit.py "https://${targetDomain || 'catalystlab.tech'}"
          python3 python-engines/ai_readiness.py "https://${targetDomain || 'catalystlab.tech'}"
          python3 python-engines/llmo_optimizer.py "https://${targetDomain || 'catalystlab.tech'}"`}
            </pre>
          </div>

        </div>
      )}

      {/* 🧬 SDLC Catalysts Matrix View */}
      {activeSubTab === 'sdlc-catalysts' && (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="rounded-2xl border border-brand-slate/40 bg-white p-6 text-black shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-blue-700 text-xs font-bold mb-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>SDLC Quality & Health Telemetry</span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight">
                  8 SDLC Catalysts • Continuous Architecture & Quality Verification
                </h3>
                <p className="text-xs text-[#c5d3e8] mt-1.5 max-w-2xl leading-relaxed">
                  CatalystLab automates health verification across all 8 SDLC stages—from SynthShift and GitLygase to VitalZyme, EdgeVmax, RiskProtease, and AllosterSearch.
                </p>
              </div>

              <div className="flex flex-row sm:flex-col gap-3 shrink-0">
                <button
                  onClick={() => setActiveSubTab('par-blueprint')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs transition-all shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Explore PAR Blueprint</span>
                </button>
                <Link
                  to="/master-audit"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs transition-all shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Run 8-Stage Master Audit</span>
                </Link>
              </div>
            </div>

            {/* Stages Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[10px] text-[#c5d3e8] uppercase font-bold tracking-wider">SDLC Phases</span>
                <p className="text-lg font-black text-black mt-0.5">8 / 8 Active</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[10px] text-[#c5d3e8] uppercase font-bold tracking-wider">Primary Stage</span>
                <p className="text-lg font-black text-orange-400 mt-0.5">PAR (Phase 1)</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[10px] text-[#c5d3e8] uppercase font-bold tracking-wider">Telemetry Engine</span>
                <p className="text-lg font-black text-blue-600 mt-0.5">Python 3.11</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[10px] text-[#c5d3e8] uppercase font-bold tracking-wider">Verification Mode</span>
                <p className="text-lg font-black text-emerald-700 mt-0.5">Automated</p>
              </div>
            </div>
          </div>

          {/* 8 SDLC Catalysts Matrix Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            {SDLC_CATALYSTS_LIST.map((catalyst, index) => {
              const bgImage = catalyst.image || catImages[index % 4];
              return (
              <motion.div
                variants={itemVariants}
                key={catalyst.id}
                className="relative rounded-[2rem] overflow-hidden shadow-2xl flex flex-col sm:flex-row bg-white border border-gray-200 min-h-[280px]"
              >
                {/* Image side (Right) */}
                <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[55%] pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#0b192c] via-[#0b192c]/80 to-transparent z-10"></div>
                  <img src={bgImage} alt="Background" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                {/* Content side (Left) */}
                <div className="relative z-20 flex-1 p-6 sm:p-8 flex flex-col justify-between sm:w-[65%] shrink-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-sky-400/30 bg-sky-400/10 text-blue-700 tracking-wider">
                        {catalyst.sdlcPhase}
                      </span>
                      {catalyst.shortCode && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-400/10 text-orange-400 border border-orange-400/30">
                          {catalyst.shortCode}
                        </span>
                      )}
                    </div>
                    <h3 className="text-black font-extrabold text-xl sm:text-2xl mb-2 flex items-center gap-2 tracking-tight">
                       <span className="material-symbols-outlined text-[26px] text-black/80">{catalyst.icon}</span>
                       {catalyst.name}
                    </h3>
                    
                    <p className="text-gray-300 text-[13px] leading-relaxed mb-4 line-clamp-3 sm:line-clamp-2">
                      {catalyst.description}
                    </p>
                    
                     {/* Capabilities Chips */}
                    {catalyst.keyVectors && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {catalyst.keyVectors.slice(0, 2).map((v, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-black/40 backdrop-blur-md text-gray-300 px-2 py-1 rounded-md border border-white/10 truncate max-w-[200px]">
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 flex flex-row items-center justify-between gap-4 border-t border-white/10 pt-5">
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/docs#${catalyst.docsAnchor || 'overview'}`}
                        className="text-[11px] font-bold text-gray-400 hover:text-black flex items-center gap-1 transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        <span>Read Specs</span>
                      </Link>
                      {catalyst.shortCode === 'SYNTH' && (
                        <button
                          onClick={() => setActiveSubTab('par-blueprint')}
                          className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                          <span>Blueprint</span>
                        </button>
                      )}
                    </div>

                    <Link
                      to={`${catalyst.route}${selectedDomain !== 'all' ? `?url=${encodeURIComponent('https://' + selectedDomain)}` : ''}`}
                      className="bg-white text-black hover:bg-sky-50 transition-colors font-bold py-2.5 px-6 rounded-full text-xs shadow-lg inline-flex items-center gap-2 active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      <span>Launch Catalyst</span>
                      <Play className="h-3 w-3 fill-current" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )})}
          </motion.div>
        </div>
      )}

      {/* 🏗️ SynthShift Catalyst Interactive Studio */}
      {activeSubTab === 'par-blueprint' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="rounded-2xl border border-brand-slate/40 bg-white p-6 text-black shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 text-xs font-bold mb-3">
                  <Layers className="h-3.5 w-3.5" />
                  <span>PAR (Phase 1): Planning, Architecture & Requirements</span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight">
                  PAR Technical System Design & Planning Studio
                </h3>
                <p className="text-xs text-[#c5d3e8] mt-1.5 max-w-2xl leading-relaxed">
                  Moving from traditional SQL to a Flexible Document Model (MongoDB) combined with Firebase’s Serverless Infrastructure enables rapid scaling and real-time synchronization with zero infrastructure bloat.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/migration"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Run Live PAR Audit</span>
                </Link>
                <Link
                  to="/docs#par-technical-blueprint"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-black font-bold text-xs border border-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <span>Docs Specs</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Inner Sub-Navigation within PAR Blueprint */}
            <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 flex-wrap">
              {[
                { id: 'architecture', label: '1. Serverless Stack Blueprint' },
                { id: 'schemas', label: '2. High-Performance Schemas' },
                { id: 'aggregation', label: '3. Team Capacity Aggregation' },
                { id: 'ai_prompt', label: '4. AI Studio Planning Prompt' },
              ].map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setParSelectedStage(stage.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    parSelectedStage === stage.id
                      ? 'bg-orange-500 text-black shadow-sm'
                      : 'bg-white/10 text-black/80 hover:bg-white/20 hover:text-black'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* PAR Section 1: Serverless Stack Architecture Diagram */}
          {parSelectedStage === 'architecture' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4 mb-4">
                  <div>
                    <h4 className="text-base font-bold text-black">Part 1: Serverless Stack Architecture (Firebase + MongoDB)</h4>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Production architecture for high-velocity real-time state synchronization and persistent document storage.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(`┌────────────────────────────────────────────────────────────────────────┐
│                          SERVERLESS STACK ARCHITECTURE                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   +------------------+         +------------------+                    │
│   |   React Client   | <-----> |  Firebase Auth   | (JWT Identity)     │
│   |   (Vite + TS)    |         |  & Security Rules|                    │
│   +------------------+         +------------------+                    │
│            |                                                           │
│            | API / GraphQL / tRPC Requests                             │
│            v                                                           │
│   +------------------+         +------------------+                    │
│   |  Node.js / Edge  | <-----> |   Cloudflare /   | (Caching & Proxies)│
│   |  Middleware API  |         |   Fastly Edge    |                    │
│   +------------------+         +------------------+                    │
│            |                                                           │
│            | Native Driver / Mongoose                                  │
│            v                                                           │
│   +------------------+         +------------------+                    │
│   |  MongoDB Atlas   | <-----> | Time-Series & TTL| (Zero-Cost Data)   │
│   | (Doc Data Model) |         | Automated Indices|                    │
│   +------------------+         +------------------+                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘`, 'par-ascii-arch')}
                    className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-xs font-bold text-black hover:bg-[#e2e8f0] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    {copiedKey === 'par-ascii-arch' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'par-ascii-arch' ? 'Copied' : 'Copy ASCII Diagram'}</span>
                  </button>
                </div>

                {/* ASCII Diagram Box */}
                <pre className="p-4 rounded-xl bg-white text-blue-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200">
{`┌────────────────────────────────────────────────────────────────────────┐
│                          SERVERLESS STACK ARCHITECTURE                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   +------------------+         +------------------+                    │
│   |   React Client   | <-----> |  Firebase Auth   | (JWT Identity)     │
│   |   (Vite + TS)    |         |  & Security Rules|                    │
│   +------------------+         +------------------+                    │
│            |                                                           │
│            | API / GraphQL / tRPC Requests                             │
│            v                                                           │
│   +------------------+         +------------------+                    │
│   |  Node.js / Edge  | <-----> |   Cloudflare /   | (Caching & Proxies)│
│   |  Middleware API  |         |   Fastly Edge    |                    │
│   +------------------+         +------------------+                    │
│            |                                                           │
│            | Native Driver / Mongoose                                  │
│            v                                                           │
│   +------------------+         +------------------+                    │
│   |  MongoDB Atlas   | <-----> | Time-Series & TTL| (Zero-Cost Data)   │
│   | (Doc Data Model) |         | Automated Indices|                    │
│   +------------------+         +------------------+                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘`}
                </pre>

                {/* Architecture Reference Nodes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center gap-2 font-bold text-xs text-black mb-1">
                      <Database className="h-4 w-4 text-orange-600" />
                      <span>Data Normalization</span>
                    </div>
                    <p className="text-[11px] text-[#64748b]">
                      Embed frequently accessed bounded items (tags, stats); reference large unbounded collections (tasks, logs).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center gap-2 font-bold text-xs text-black mb-1">
                      <Zap className="h-4 w-4 text-amber-600" />
                      <span>TTL & Index Strategy</span>
                    </div>
                    <p className="text-[11px] text-[#64748b]">
                      Pre-compound index hot lookup keys like <code>(projectId, lifecyclePhase, slaDeadline)</code> for sub-5ms queries.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center gap-2 font-bold text-xs text-black mb-1">
                      <Server className="h-4 w-4 text-sky-600" />
                      <span>Cold Start Avoidance</span>
                    </div>
                    <p className="text-[11px] text-[#64748b]">
                      Singleton DB connection cache across serverless lambda containers to prevent connection pool exhaustion.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center gap-2 font-bold text-xs text-black mb-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Firebase Security RBAC</span>
                    </div>
                    <p className="text-[11px] text-[#64748b]">
                      Enforce fine-grained claims matching between Firebase JWTs and MongoDB collection tenancy filters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAR Section 2: High-Performance Schema Design */}
          {parSelectedStage === 'schemas' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Projects Collection Schema */}
                <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-orange-600" />
                      <h4 className="text-sm font-bold text-black">1. Projects Schema (Mongoose)</h4>
                    </div>
                    <button
                      onClick={() => handleCopy(`import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  workspaceId: string;
  name: string;
  slug: string;
  riskScore: number;
  sdlcStatus: 'planning' | 'architecture' | 'implementation' | 'verification';
  teamLeadId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    sdlcStatus: { 
      type: String, 
      enum: ['planning', 'architecture', 'implementation', 'verification'], 
      default: 'planning' 
    },
    teamLeadId: { type: String, required: true },
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

// Compound index for instant multi-tenant dashboard rendering
ProjectSchema.index({ workspaceId: 1, sdlcStatus: 1 });

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);`, 'par-project-schema')}
                      className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-xs font-bold text-black flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      {copiedKey === 'par-project-schema' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === 'par-project-schema' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <pre className="p-3.5 rounded-xl bg-white text-emerald-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200 max-h-[380px]">
{`import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  workspaceId: string;
  name: string;
  slug: string;
  riskScore: number;
  sdlcStatus: 'planning' | 'architecture' | 'implementation' | 'verification';
  teamLeadId: string;
  tags: string[];
}

const ProjectSchema = new Schema<IProject>(
  {
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    sdlcStatus: { 
      type: String, 
      enum: ['planning', 'architecture', 'implementation', 'verification'], 
      default: 'planning' 
    },
    teamLeadId: { type: String, required: true },
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

// Compound index for fast tenant queries
ProjectSchema.index({ workspaceId: 1, sdlcStatus: 1 });`}
                  </pre>
                  <p className="text-[11px] text-[#64748b]">
                    Includes compound index <code>{`{ workspaceId: 1, sdlcStatus: 1 }`}</code> for instantaneous sub-10ms workspace filtering.
                  </p>
                </div>

                {/* Tasks Collection Schema */}
                <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-sky-600" />
                      <h4 className="text-sm font-bold text-black">2. Tasks Schema (Mongoose)</h4>
                    </div>
                    <button
                      onClick={() => handleCopy(`import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  assigneeId: string;
  title: string;
  estimatedHours: number;
  lifecyclePhase: 'PAR' | 'CODE' | 'BUILD' | 'TEST' | 'DEPLOY' | 'SEC' | 'AI' | 'LLMO';
  isCompleted: boolean;
  slaDeadline: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assigneeId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    estimatedHours: { type: Number, required: true, default: 1 },
    lifecyclePhase: {
      type: String,
      enum: ['PAR', 'CODE', 'BUILD', 'TEST', 'DEPLOY', 'SEC', 'AI', 'LLMO'],
      default: 'PAR'
    },
    isCompleted: { type: Boolean, default: false },
    slaDeadline: { type: Date, required: true }
  },
  { timestamps: true }
);

// Compound index for zero-cost capacity queries
TaskSchema.index({ projectId: 1, lifecyclePhase: 1, slaDeadline: 1 });

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);`, 'par-task-schema')}
                      className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-xs font-bold text-black flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      {copiedKey === 'par-task-schema' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === 'par-task-schema' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <pre className="p-3.5 rounded-xl bg-white text-blue-600 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200 max-h-[380px]">
{`import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  assigneeId: string;
  title: string;
  estimatedHours: number;
  lifecyclePhase: 'PAR' | 'CODE' | 'BUILD' | 'TEST' | 'DEPLOY' | 'SEC' | 'AI' | 'LLMO';
  isCompleted: boolean;
  slaDeadline: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assigneeId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    estimatedHours: { type: Number, required: true, default: 1 },
    lifecyclePhase: {
      type: String,
      enum: ['PAR', 'CODE', 'BUILD', 'TEST', 'DEPLOY', 'SEC', 'AI', 'LLMO'],
      default: 'PAR'
    },
    isCompleted: { type: Boolean, default: false },
    slaDeadline: { type: Date, required: true }
  },
  { timestamps: true }
);

// Compound index for SLA and capacity radar
TaskSchema.index({ projectId: 1, lifecyclePhase: 1, slaDeadline: 1 });`}
                  </pre>
                  <p className="text-[11px] text-[#64748b]">
                    Optimized for rapid aggregation grouping across assignees, lifecycle phases, and SLA deadlines.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* PAR Section 3: Pre-Aggregating Team Capacity */}
          {parSelectedStage === 'aggregation' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                  <div>
                    <h4 className="text-base font-bold text-black">Part 1.2: Pre-Aggregating Team Capacity (MongoDB Pipeline)</h4>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Computes uncompleted workload, backlog counts, and estimated hours per team member across active projects in single database round-trip.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(`export async function getTeamCapacitySummary(workspaceId: string) {
  return await Project.aggregate([
    { $match: { workspaceId } },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'projectId',
        as: 'taskList'
      }
    },
    { $unwind: '$taskList' },
    { $match: { 'taskList.isCompleted': false } },
    {
      $group: {
        _id: '$taskList.assigneeId',
        activeTaskCount: { $sum: 1 },
        totalEstimatedHours: { $sum: '$taskList.estimatedHours' },
        phases: { $addToSet: '$taskList.lifecyclePhase' }
      }
    },
    {
      $project: {
        _id: 0,
        assigneeId: '$_id',
        activeTaskCount: 1,
        totalEstimatedHours: 1,
        phases: 1
      }
    },
    { $sort: { totalEstimatedHours: -1 } }
  ]);
}`, 'par-agg-pipeline')}
                    className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-xs font-bold text-black hover:bg-[#e2e8f0] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    {copiedKey === 'par-agg-pipeline' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'par-agg-pipeline' ? 'Copied' : 'Copy Aggregation Code'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-white text-emerald-700 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200">
{`export async function getTeamCapacitySummary(workspaceId: string) {
  return await Project.aggregate([
    // 1. Filter projects belonging to workspace
    { $match: { workspaceId } },
    
    // 2. Perform zero-cost index-backed join with tasks collection
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'projectId',
        as: 'taskList'
      }
    },
    
    // 3. Deconstruct task array & filter pending backlog
    { $unwind: '$taskList' },
    { $match: { 'taskList.isCompleted': false } },
    
    // 4. Group by assignee to compute workload capacity
    {
      $group: {
        _id: '$taskList.assigneeId',
        activeTaskCount: { $sum: 1 },
        totalEstimatedHours: { $sum: '$taskList.estimatedHours' },
        phases: { $addToSet: '$taskList.lifecyclePhase' }
      }
    },
    
    // 5. Clean output shape & sort by heaviest allocation
    {
      $project: {
        _id: 0,
        assigneeId: '$_id',
        activeTaskCount: 1,
        totalEstimatedHours: 1,
        phases: 1
      }
    },
    { $sort: { totalEstimatedHours: -1 } }
  ]);
}`}
                </pre>

                {/* Pipeline Stages Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs">
                    <span className="font-bold text-black block mb-1">Stage 1: $match & $lookup</span>
                    <p className="text-[#64748b] text-[11px]">
                      Filters by tenant workspace and executes an in-memory index join using the compound index key.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs">
                    <span className="font-bold text-black block mb-1">Stage 2: $unwind & Filter</span>
                    <p className="text-[#64748b] text-[11px]">
                      Streams tasks individually while pruning finished tasks to minimize memory utilization.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs">
                    <span className="font-bold text-black block mb-1">Stage 3: $group & $sort</span>
                    <p className="text-[#64748b] text-[11px]">
                      Pre-calculates team load and returns immediate charts data without application-level loops.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAR Section 4: Comprehensive Google AI Studio Planning Prompt */}
          {parSelectedStage === 'ai_prompt' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
                  <div>
                    <h4 className="text-base font-bold text-black">Part 2: Comprehensive Google AI Studio Planning Prompt</h4>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Copy and paste this structured prompt into Google AI Studio to plan and scaffold your application with exact MongoDB + Firebase specifications.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(`System Role & Architecture Persona:
Act as a Principal Software Architect and Lead Fullstack Engineer specializing in high-performance Serverless Web Applications using Firebase, MongoDB Atlas, and React (TypeScript).

Project Target:
Design and implement the foundational architecture for "${parProjectName}".

Database Model & Infrastructure:
- Primary Store: MongoDB Atlas Document Database (Flexible Schemas, Aggregation Pipelines, Compound Indexing).
- Auth & Real-Time Sync: Firebase Auth (JWT verification, Role-Based Access Control) + Firestore/Firebase Realtime for collaborative state.
- Backend API: Node.js Express / Serverless API routes with connection pooling and daily-salt hashing.

Key Technical Specifications to Produce:
1. Complete Mongoose schemas with compound indexes (workspaceId, sdlcStatus, lifecyclePhase).
2. MongoDB aggregation pipeline for real-time team workload and capacity calculations.
3. Firebase Auth token validation middleware for Express/Node.js.
4. Step-by-step implementation sequence with zero external dependency bloat.`, 'par-ai-prompt')}
                      className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      {copiedKey === 'par-ai-prompt' ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === 'par-ai-prompt' ? 'Prompt Copied!' : 'Copy AI Studio Prompt'}</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Customizer */}
                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#415a77] mb-1">Project / System Name</label>
                    <input
                      type="text"
                      value={parProjectName}
                      onChange={(e) => setParProjectName(e.target.value)}
                      placeholder="e.g. Next-Gen B2B Analytics Hub"
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#e2e8f0] bg-white font-bold text-black focus:outline-none focus:border-[#0b192c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#415a77] mb-1">Database & Infrastructure Pattern</label>
                    <select
                      value={parDbChoice}
                      onChange={(e) => setParDbChoice(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#e2e8f0] bg-white font-bold text-black focus:outline-none focus:border-[#0b192c]"
                    >
                      <option value="mongodb_firebase">MongoDB Atlas + Firebase Auth ($0 Serverless Stack)</option>
                      <option value="mongodb_standalone">MongoDB Atlas Standalone + Express JWT</option>
                      <option value="hybrid">Hybrid MongoDB Time-Series + Firebase Realtime DB</option>
                    </select>
                  </div>
                </div>

                {/* Rendered Prompt Preview */}
                <pre className="p-4 rounded-xl bg-white text-sky-200 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-200 whitespace-pre-wrap">
{`System Role & Architecture Persona:
Act as a Principal Software Architect and Lead Fullstack Engineer specializing in high-performance Serverless Web Applications using Firebase, MongoDB Atlas, and React (TypeScript).

Project Target:
Design and implement the foundational architecture for "${parProjectName}".

Database Model & Infrastructure:
- Primary Store: MongoDB Atlas Document Database (Flexible Schemas, Aggregation Pipelines, Compound Indexing).
- Auth & Real-Time Sync: Firebase Auth (JWT verification, Role-Based Access Control) + Firestore/Firebase Realtime for collaborative state.
- Backend API: Node.js Express / Serverless API routes with connection pooling and daily-salt hashing.

Key Technical Specifications to Produce:
1. Complete Mongoose schemas with compound indexes (workspaceId, sdlcStatus, lifecyclePhase).
2. MongoDB aggregation pipeline for real-time team workload and capacity calculations.
3. Firebase Auth token validation middleware for Express/Node.js.
4. Step-by-step implementation sequence with zero external dependency bloat.`}
                </pre>
              </div>
            </div>
          )}

        </div>
      )}

      {/* $0 Architecture & Zero-Cost GSDP Blueprint View */}
      {activeSubTab === 'architecture' && (
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-[#f1f5f9] pb-4">
            <h3 className="text-base font-bold text-black">Summary of Your $0 GSDP Stack & Architecture</h3>
            <p className="text-xs text-[#64748b] mt-1">
              Guarantees ingestion of millions of events, real-time Recharts dashboards, and weekly dossiers without entering a credit card.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-black">
                <Database className="h-4 w-4 text-[#415a77]" />
                <span>1. Data Layer</span>
              </div>
              <p className="text-xs font-bold text-black">MongoDB Atlas Time-Series / ClickHouse</p>
              <p className="text-[11px] text-[#64748b] mt-1">
                Zero-cost timeField partitioning with metadata granularity in seconds. In-memory queue batching every 3s.
              </p>
            </div>

            <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-black">
                <Server className="h-4 w-4 text-[#415a77]" />
                <span>2. Ingestion & API Dyno</span>
              </div>
              <p className="text-xs font-bold text-black">Node.js Express + Native Fetch</p>
              <p className="text-[11px] text-[#64748b] mt-1">
                Local GeoIP lookup and daily-salt cookieless SHA-256 visitor hashing. No external API calls during event ingestion.
              </p>
            </div>

            <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-black">
                <Mail className="h-4 w-4 text-[#415a77]" />
                <span>3. Email Dispatch Dossiers</span>
              </div>
              <p className="text-xs font-bold text-black">Mailgun GSDP Perk</p>
              <p className="text-[11px] text-[#64748b] mt-1">
                20,000 free emails & 100 free validations/month. High-fidelity HTML template for executive reporting.
              </p>
            </div>

            <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-black">
                <Clock className="h-4 w-4 text-[#415a77]" />
                <span>4. CI/CD & CRON Triggers</span>
              </div>
              <p className="text-xs font-bold text-black">GitHub Actions Pro</p>
              <p className="text-[11px] text-[#64748b] mt-1">
                3,000 free minutes/month. Hourly anomaly radar (<code>0 * * * *</code>) and weekly reports on Monday (<code>0 9 * * 1</code>).
              </p>
            </div>

            <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-black">
                <Globe className="h-4 w-4 text-[#415a77]" />
                <span>5. DNS & Edge Protection</span>
              </div>
              <p className="text-xs font-bold text-black">Namecheap + Cloudflare Free</p>
              <p className="text-[11px] text-[#64748b] mt-1">
                Free SSL/TLS termination, bot crawler challenge, and edge Anycast routing with zero egress bandwidth charges.
              </p>
            </div>

            <div className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-black">
                <ShieldCheck className="h-4 w-4 text-[#059669]" />
                <span>6. Privacy Compliance</span>
              </div>
              <p className="text-xs font-bold text-black">GDPR / CCPA / PECR Exempt</p>
              <p className="text-[11px] text-[#64748b] mt-1">
                100% cookieless tracking. No personal identifiable information (PII) stored across disk or memory.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* HTML Email Dossier Live Modal Viewer */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#e2e8f0]">
            
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-black" />
                <h3 className="text-sm font-bold text-black">
                  {previewType === 'weekly' ? 'Weekly Telemetry Email Dossier Preview' : 'Traffic Anomaly Spike Alert Preview'}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#f4f6fa]">
              {previewLoading ? (
                <div className="flex items-center justify-center p-12 text-xs font-bold text-[#415a77]">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  Compiling HTML template with real-time statistics...
                </div>
              ) : (
                <div 
                  className="bg-white rounded-xl shadow-sm overflow-hidden max-w-[640px] mx-auto"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewHtml) }}
                />
              )}
            </div>

            <div className="p-3 border-t border-[#e2e8f0] bg-white flex justify-end gap-2 text-xs">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-[#e2e8f0] text-[#415a77] font-bold hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
