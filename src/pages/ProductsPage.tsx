import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  Layers, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Globe, 
  Cpu, 
  Leaf, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  ExternalLink, 
  Zap, 
  Bell, 
  Webhook, 
  Code2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Sliders,
  Settings,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'monitoring' | 'cicd' | 'webhooks' | 'cms'>('all');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Interactive Domain Monitoring Config State
  const [targetDomain, setTargetDomain] = useState('app.yourdomain.com');
  const [frequency, setFrequency] = useState<'1h' | '6h' | '24h' | 'weekly'>('6h');
  const [alertChannel, setAlertChannel] = useState<'webhook' | 'slack' | 'email'>('webhook');
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourdomain.com/webhooks/catalystlab');
  const [selectedEngines, setSelectedEngines] = useState({
    vitals: true,
    security: true,
    latency: true,
    aiReadiness: true,
    eco: false,
    repo: false
  });
  const [configGenerated, setConfigGenerated] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const toggleEngine = (key: keyof typeof selectedEngines) => {
    setSelectedEngines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateConfigJson = () => {
    return JSON.stringify({
      domain: targetDomain,
      frequency: frequency,
      alertChannel: alertChannel,
      webhookUrl: alertChannel === 'webhook' ? webhookUrl : undefined,
      engines: Object.entries(selectedEngines)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name),
      thresholds: {
        minScore: 85,
        maxTtfbMs: 600,
        maxDomDepth: 32,
        requireOwaspHeaders: true,
        notifyOnDegradeOnly: true
      }
    }, null, 2);
  };

  const sampleGithubActionYaml = `name: CatalystLab Quality Gate
on: [pull_request, push]

jobs:
  telemetry-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run CatalystLab Automated Domain Audit
        uses: catalystlab/audit-action@v2
        with:
          target_url: 'https://${targetDomain}'
          api_key: \${{ secrets.CATALYSTLAB_API_KEY }}
          fail_on_score_below: '85'
          engines: 'vitals,security,latency,aiReadiness'
          output_report: './catalyst-report.json'`;

  const sampleNodeSnippet = `// catalystlab-domain-monitor.js
import { CatalystDomainWatchdog } from '@catalystlab/sdk';

const watchdog = new CatalystDomainWatchdog({
  apiKey: process.env.CATALYSTLAB_API_KEY,
  domain: '${targetDomain}',
  frequency: '${frequency}',
  onAnomaly: async (alert) => {
    console.error(\`⚠️ Health degradation on \${alert.domain}: \${alert.reason}\`);
    // Send payload to incident management
    await fetch('${webhookUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  }
});

watchdog.start();`;

  const sampleCloudflareWorker = `// Cloudflare Worker / Edge Interceptor
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    const response = await fetch(request);
    const duration = Date.now() - startTime;

    // Asynchronously dispatch edge telemetry payload to CatalystLab
    ctx.waitUntil(
      fetch('https://ais-dev-flpb7z7bc52gvq3n5tpxj7-551448044893.asia-southeast1.run.app/api/run-engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${env.CATALYSTLAB_API_KEY}\`
        },
        body: JSON.stringify({
          engine: 'latency',
          url: request.url,
          edgeDurationMs: duration,
          edgePoP: request.cf?.colo || 'UNKNOWN',
          status: response.status
        })
      }).catch(err => console.error('Telemetry dispatch error:', err))
    );

    return response;
  }
};`;

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#0b192c]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0b192c] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#415a77]/40 shadow-xl">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#c5d3e8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#415a77]/60 bg-[#152238] px-3 py-1 text-xs font-mono text-[#c5d3e8]">
              <Radio className="h-3.5 w-3.5 text-[#38bdf8] animate-pulse" />
              <span>Products &amp; Continuous Telemetry</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Automated Multi-Engine Cron</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Automated Plugins &amp; Custom Domain Monitoring
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#c5d3e8] max-w-2xl leading-relaxed">
            Deploy continuous telemetry agents, CI/CD quality gates, webhook dispatchers, and edge interceptors directly inside your custom domains. Prevent Core Web Vitals regressions, OWASP header drift, and AI readiness drops before users notice.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a 
              href="#domain-configurator"
              className="inline-flex items-center gap-2 rounded-xl bg-[#c5d3e8] hover:bg-white text-[#0b192c] px-5 py-3 text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <Sliders className="h-4 w-4 text-[#0b192c]" />
              <span>Configure Domain Monitor</span>
            </a>
            <Link
              to="/dashboard?tab=monitoring"
              className="inline-flex items-center gap-2 rounded-xl border border-[#415a77]/80 bg-[#152238] hover:bg-[#1f314f] text-white px-5 py-3 text-sm font-semibold transition-all shadow-sm"
            >
              <Activity className="h-4 w-4 text-[#38bdf8]" />
              <span>View Monitored Domains in Dashboard</span>
            </Link>
            <Link
              to="/api-docs"
              className="inline-flex items-center gap-2 rounded-xl border border-[#415a77]/40 hover:border-[#415a77] text-[#c5d3e8] hover:text-white px-4 py-3 text-sm font-mono transition-all"
            >
              <Code2 className="h-4 w-4" />
              <span>API Integration Docs →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Section 1: Product Suite Catalog */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#415a77] flex items-center gap-1.5 mb-1">
                <Layers className="h-4 w-4 text-[#0b192c]" />
                <span>Integration Suite</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b192c] tracking-tight">
                CatalystLab Plugin &amp; Watchdog Ecosystem
              </h2>
              <p className="text-sm text-gray-600 mt-1 max-w-xl">
                Choose from our pre-built plugins, serverless workers, and webhook bridges to connect any custom domain, CMS, or pipeline.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-gray-200/70 p-1.5 rounded-xl border border-gray-300/80">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === 'all' 
                    ? 'bg-[#0b192c] text-white shadow-sm' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setSelectedCategory('monitoring')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === 'monitoring' 
                    ? 'bg-[#0b192c] text-white shadow-sm' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                Domain Watchdogs
              </button>
              <button
                onClick={() => setSelectedCategory('cicd')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === 'cicd' 
                    ? 'bg-[#0b192c] text-white shadow-sm' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                CI/CD Quality Gates
              </button>
              <button
                onClick={() => setSelectedCategory('webhooks')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === 'webhooks' 
                    ? 'bg-[#0b192c] text-white shadow-sm' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                Webhooks &amp; Edge
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Product 1: Custom Domain Automated Watchdog */}
            {(selectedCategory === 'all' || selectedCategory === 'monitoring') && (
              <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-[#415a77]/50">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b192c] border border-sky-100">
                      <Radio className="h-6 w-6 text-[#38bdf8]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                      Automated Cron
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b192c]">Custom Domain Telemetry Watchdog</h3>
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                    Continuous synthetic monitoring on custom domains. Automatically re-evaluates Core Web Vitals, DOM tree depth, TLS certificates, and HTTP response times at hourly, 6-hour, or daily cadences.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-gray-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Zero-code synthetic health pings</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Automatic historical trend archiving</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Instant regression push notifications</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">Tier: Developer / Pro</span>
                  <a
                    href="#domain-configurator"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0b192c] hover:text-[#415a77]"
                  >
                    <span>Configure Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Product 2: GitHub & GitLab Actions Quality Gate */}
            {(selectedCategory === 'all' || selectedCategory === 'cicd') && (
              <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-[#415a77]/50">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                      <Terminal className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                      CI/CD Plugin
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b192c]">CI/CD Automated Quality Gate</h3>
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                    Block regressions before they reach production. Embed CatalystLab audit rules in your GitHub Actions, GitLab CI, or Bitbucket pipelines with configurable score thresholds and PR comments.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-gray-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>PR comment summaries with diff scores</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Custom exit codes on score degradation</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Export JSON / Markdown / PDF artifacts</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">Action: @catalystlab/action</span>
                  <a
                    href="#integration-code"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0b192c] hover:text-[#415a77]"
                  >
                    <span>View YAML</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Product 3: Vercel, Netlify & Webhook Integrator */}
            {(selectedCategory === 'all' || selectedCategory === 'webhooks') && (
              <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-[#415a77]/50">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                      <Webhook className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      Webhook Bridge
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b192c]">Deployment Webhook Interceptor</h3>
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                    Trigger full 8-engine evaluations upon new deployment URLs. Plug directly into Vercel Deployment Webhooks, Netlify deploy-succeeded events, or AWS CloudFront invalidation hooks.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-gray-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Instant audit of preview and production URLs</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>HMAC SHA-256 webhook signature validation</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Automatic Slack/Discord webhook alerts</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">Format: REST / JSON</span>
                  <Link
                    to="/api-docs"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0b192c] hover:text-[#415a77]"
                  >
                    <span>Read API Specs</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Product 4: Cloudflare & Edge Worker Plugin */}
            {(selectedCategory === 'all' || selectedCategory === 'webhooks') && (
              <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-[#415a77]/50">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                      <Globe className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      Edge Telemetry
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b192c]">Edge Worker Telemetry Interceptor</h3>
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                    Lightweight zero-overhead edge code snippet for Cloudflare Workers, Fastly Compute@Edge, and Vercel Edge Middleware. Streams real-user latency and cache status to CatalystLab.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-gray-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Sub-millisecond non-blocking dispatch (`ctx.waitUntil`)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>PoP geographical latency profiling</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Real TLS handshake &amp; TTFB metrics</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">Size: &lt; 1KB bundled</span>
                  <a
                    href="#integration-code"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0b192c] hover:text-[#415a77]"
                  >
                    <span>View Worker Code</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Product 5: Slack, Discord & PagerDuty Alerts */}
            {(selectedCategory === 'all' || selectedCategory === 'monitoring') && (
              <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-[#415a77]/50">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Bell className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Alert Dispatcher
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b192c]">Incident &amp; Anomaly Alerting</h3>
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                    Receive rich message cards in your team Slack channel or Discord server whenever an automated re-audit detects a sudden DOM explosion, SSL expiry approaching, or failing security headers.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-gray-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Rich interactive Slack Block Kit cards</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Direct permalinks to comprehensive dossier reports</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Adjustable noise threshold &amp; cooldown timers</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">Channels: Slack, Discord, PagerDuty</span>
                  <a
                    href="#domain-configurator"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0b192c] hover:text-[#415a77]"
                  >
                    <span>Setup Alerts</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Product 6: Node.js & Python SDK Watchdog */}
            {(selectedCategory === 'all' || selectedCategory === 'monitoring' || selectedCategory === 'cicd') && (
              <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-[#415a77]/50">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <Code2 className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      SDK / Library
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b192c]">@catalystlab/sdk</h3>
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                    Official TypeScript and Python SDKs for programmatic domain registration, cron scheduling, and on-the-fly telemetry analysis within your backend infrastructure.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-gray-700">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Full TypeScript type definitions included</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Async stream client for multi-domain batching</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Automatic retries and exponential backoff</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">npm i @catalystlab/sdk</span>
                  <Link
                    to="/playground"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0b192c] hover:text-[#415a77]"
                  >
                    <span>Test in Playground</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Section 2: Interactive Domain Monitoring Configurator */}
        <section id="domain-configurator" className="rounded-3xl border border-[#415a77]/30 bg-white p-6 sm:p-10 shadow-lg">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0b192c] text-white px-3 py-1 text-xs font-mono mb-2">
              <Sliders className="h-3.5 w-3.5 text-[#38bdf8]" />
              <span>Interactive Config Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b192c] tracking-tight">
              Configure Automated Monitoring on Your Custom Domain
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select check frequency, toggle diagnostic engines, and set alert dispatch destinations to generate ready-to-deploy configuration code.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Domain Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Target Custom Domain or Endpoint URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    placeholder="e.g. app.mycompany.com"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-2.5 text-sm font-mono text-gray-900 focus:border-[#0b192c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b192c]/20 transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Synthetic check requests are dispatched from 12 distributed Edge PoPs globally.
                </p>
              </div>

              {/* Monitoring Cadence Frequency */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Automated Check Cadence
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: '1h', label: '1 Hour', sub: 'High Volume' },
                    { id: '6h', label: '6 Hours', sub: 'Balanced' },
                    { id: '24h', label: 'Daily', sub: 'Standard' },
                    { id: 'weekly', label: 'Weekly', sub: 'Low Overhead' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFrequency(item.id as any)}
                      className={`flex flex-col items-center justify-center rounded-xl p-2.5 border text-center transition-all cursor-pointer ${
                        frequency === item.id 
                          ? 'border-[#0b192c] bg-[#0b192c] text-white shadow-sm' 
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className={`text-[10px] ${frequency === item.id ? 'text-[#c5d3e8]' : 'text-gray-500'}`}>
                        {item.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnostic Engines Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Active Continuous Engines
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'vitals', label: 'Core Vitals', icon: Activity, desc: 'DOM/TTFB' },
                    { key: 'security', label: 'OWASP SecOps', icon: ShieldCheck, desc: 'Headers & CSP' },
                    { key: 'latency', label: 'Edge Radar', icon: Globe, desc: '12 Global PoPs' },
                    { key: 'aiReadiness', label: 'AI Readiness', icon: Cpu, desc: 'llms.txt & Bots' },
                    { key: 'eco', label: 'Eco Carbon', icon: Leaf, desc: 'SWD CO2e Model' },
                    { key: 'repo', label: 'Git Hygiene', icon: Terminal, desc: 'SecOps Audit' },
                  ].map((engine) => {
                    const Icon = engine.icon;
                    const isEnabled = selectedEngines[engine.key as keyof typeof selectedEngines];
                    return (
                      <button
                        key={engine.key}
                        type="button"
                        onClick={() => toggleEngine(engine.key as any)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isEnabled 
                            ? 'border-[#415a77] bg-[#152238] text-white' 
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isEnabled ? 'text-[#38bdf8]' : 'text-gray-400'}`} />
                        <div className="truncate">
                          <div className="text-xs font-bold truncate">{engine.label}</div>
                          <div className={`text-[10px] truncate ${isEnabled ? 'text-[#c5d3e8]' : 'text-gray-500'}`}>
                            {engine.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alert Destination */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Regression Alert Channel
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { id: 'webhook', label: 'REST Webhook', icon: Webhook },
                    { id: 'slack', label: 'Slack Webhook', icon: Bell },
                    { id: 'email', label: 'Email Digest', icon: CheckCircle2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAlertChannel(item.id as any)}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          alertChannel === item.id
                            ? 'border-[#0b192c] bg-[#0b192c] text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {alertChannel === 'webhook' && (
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://api.yourdomain.com/webhooks/catalystlab"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-900 focus:border-[#0b192c] focus:bg-white focus:outline-none"
                  />
                )}
              </div>

            </div>

            {/* Right Column: Live Output & Code Block */}
            <div className="lg:col-span-6 flex flex-col h-full rounded-2xl border border-gray-800 bg-[#0b192c] text-white p-5 sm:p-6 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-[#415a77]/40 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#c5d3e8]">catalystlab-config.json</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateConfigJson(), 'config-json')}
                  className="flex items-center gap-1.5 rounded-lg border border-[#415a77]/60 bg-[#152238] hover:bg-[#1f314f] text-[#f8fafc] px-3 py-1 text-xs font-mono transition-all cursor-pointer"
                >
                  {copiedSnippet === 'config-json' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Config</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code display */}
              <pre className="flex-1 overflow-x-auto text-xs font-mono leading-relaxed text-[#c5d3e8] bg-[#070e17] p-4 rounded-xl border border-[#415a77]/30">
                {generateConfigJson()}
              </pre>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-[#415a77]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-[#8ea8c3] text-center sm:text-left">
                  Ready to deploy to your background cron runner or CI/CD pipeline.
                </div>
                <Link
                  to={`/dashboard?tab=monitoring&domain=${encodeURIComponent(targetDomain)}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#38bdf8] hover:bg-[#0284c7] text-[#0b192c] font-bold px-4 py-2 text-xs transition-all shadow-md active:scale-95"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-[#0b192c]" />
                  <span>Add to My Dashboard</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Section 3: Code Integration Snippets */}
        <section id="integration-code">
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#415a77] flex items-center gap-1.5 mb-1">
              <Code2 className="h-4 w-4 text-[#0b192c]" />
              <span>Developer Integrations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b192c] tracking-tight">
              Ready-to-Paste Deployment Snippets
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select your stack below to integrate automated telemetry in less than 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GitHub Action */}
            <div className="rounded-2xl border border-gray-800 bg-[#0b192c] p-6 text-white shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Terminal className="h-4 w-4 text-orange-400" />
                    <span>.github/workflows/catalyst-gate.yml</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sampleGithubActionYaml, 'gh-yaml')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#152238] hover:bg-[#1f314f] text-xs font-mono text-[#c5d3e8] border border-[#415a77]/40 cursor-pointer"
                  >
                    {copiedSnippet === 'gh-yaml' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSnippet === 'gh-yaml' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[11px] font-mono leading-relaxed text-[#c5d3e8] bg-[#070e17] p-3.5 rounded-xl border border-[#415a77]/30">
                  {sampleGithubActionYaml}
                </pre>
              </div>
              <p className="text-[11px] text-[#8ea8c3] mt-3">
                Runs automatically on PR and push events to verify regression gates.
              </p>
            </div>

            {/* Cloudflare Edge Worker */}
            <div className="rounded-2xl border border-gray-800 bg-[#0b192c] p-6 text-white shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Globe className="h-4 w-4 text-[#38bdf8]" />
                    <span>Cloudflare Worker / Edge Interceptor</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sampleCloudflareWorker, 'cf-worker')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#152238] hover:bg-[#1f314f] text-xs font-mono text-[#c5d3e8] border border-[#415a77]/40 cursor-pointer"
                  >
                    {copiedSnippet === 'cf-worker' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSnippet === 'cf-worker' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[11px] font-mono leading-relaxed text-[#c5d3e8] bg-[#070e17] p-3.5 rounded-xl border border-[#415a77]/30 max-h-64">
                  {sampleCloudflareWorker}
                </pre>
              </div>
              <p className="text-[11px] text-[#8ea8c3] mt-3">
                Captures real edge execution metrics with non-blocking background dispatch.
              </p>
            </div>

          </div>
        </section>

        {/* Section 4: Enterprise & SLA CTA Banner */}
        <section className="rounded-3xl border border-[#415a77]/40 bg-gradient-to-br from-[#0b192c] via-[#0d1b2a] to-[#152238] p-8 sm:p-12 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-3 py-1 text-xs font-mono text-[#38bdf8]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Enterprise Custom Domain Networks</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Need Dedicated Telemetry Probes for 100+ Domains?
              </h2>
              <p className="text-sm text-[#c5d3e8] leading-relaxed">
                We offer custom private PoPs, SOC2 Type II compliance reports, automated SAML/SSO provisioning, and dedicated Slack channels with our core telemetry engineers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                to="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-gray-100 text-[#0b192c] font-bold px-6 py-3.5 text-sm transition-all shadow-md active:scale-95"
              >
                <span>View Enterprise Pricing</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#415a77] bg-[#152238] hover:bg-[#1f314f] text-[#c5d3e8] hover:text-white px-5 py-3.5 text-sm font-semibold transition-all"
              >
                <span>Contact Engineering</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ProductsPage;
