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
  Webhook, 
  Code2, 
  CheckCircle2, 
  Sliders, 
  PlusCircle
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const ProductsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'monitoring' | 'cicd' | 'webhooks'>('all');
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

  const sampleCloudflareWorker = `// Cloudflare Worker / Edge Interceptor
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    const response = await fetch(request);
    const duration = Date.now() - startTime;

    // Asynchronously dispatch edge telemetry payload to CatalystLab
    ctx.waitUntil(
      fetch('https://api.catalystlab.tech/api/run-engine', {
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
    <div className="min-h-screen bg-brand-navy text-brand-offwhite pb-24 selection:bg-brand-slate/40 selection:text-white">
      <SEOHead
        title="Automated Plugins & Domain Monitoring Watchdog | CatalystLab"
        description="Deploy continuous telemetry agents, CI/CD quality gates, webhook dispatchers, and edge interceptors directly inside your custom domains."
        keywords={['CatalystLab domain watchdog', 'CI/CD quality gates', 'edge telemetry interceptor', 'continuous web vitals']}
        canonicalUrl="https://www.catalystlab.tech/products"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-oxford text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-brand-slate/30">
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-slate/40 bg-surface-panel px-3 py-1 text-xs font-mono text-brand-periwinkle">
              <Radio className="h-3.5 w-3.5 text-accent-cyan animate-pulse" />
              <span>Products &amp; Continuous Telemetry</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-emerald/40 bg-emerald-950/40 px-3 py-1 text-xs font-mono text-accent-emerald font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Automated Multi-Engine Cron</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-brand-offwhite max-w-3xl leading-tight">
            Automated Plugins &amp; Custom Domain Monitoring
          </h1>
          <p className="mt-3 text-sm sm:text-base text-brand-periwinkle max-w-2xl leading-relaxed">
            Deploy continuous telemetry agents, CI/CD quality gates, webhook dispatchers, and edge interceptors directly inside your custom domains. Prevent Core Web Vitals regressions, OWASP header drift, and AI readiness drops before users notice.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a 
              href="#domain-configurator"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-slate hover:bg-brand-slate-hover text-white px-5 py-2.5 text-xs sm:text-sm font-mono font-bold transition-all shadow-md active:scale-95 border border-brand-periwinkle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            >
              <Sliders className="h-4 w-4 text-accent-cyan" />
              <span>Configure Domain Monitor</span>
            </a>
            <Link
              to="/dashboard?tab=monitoring"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-slate/40 bg-surface-panel hover:bg-surface-subtle text-brand-periwinkle hover:text-white px-5 py-2.5 text-xs sm:text-sm font-mono transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            >
              <Activity className="h-4 w-4 text-accent-cyan" />
              <span>View Monitored Domains</span>
            </Link>
            <Link
              to="/api-docs"
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-slate/30 hover:border-brand-slate text-brand-slate-light hover:text-white px-4 py-2.5 text-xs sm:text-sm font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            >
              <Code2 className="h-4 w-4" />
              <span>API Docs →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        {/* Section 1: Product Suite Catalog */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand-slate-light flex items-center gap-1.5 mb-1">
                <Layers className="h-4 w-4 text-accent-cyan" />
                <span>Integration Suite</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-offwhite tracking-tight">
                CatalystLab Plugin &amp; Watchdog Ecosystem
              </h2>
              <p className="text-xs sm:text-sm text-brand-periwinkle mt-1 max-w-xl">
                Choose from our pre-built plugins, serverless workers, and webhook bridges to connect any custom domain, CMS, or pipeline.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-surface-panel p-1.5 rounded-xl border border-brand-slate/40">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCategory === 'all' 
                    ? 'bg-brand-slate text-white shadow-sm' 
                    : 'text-brand-periwinkle hover:text-white hover:bg-surface-subtle'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setSelectedCategory('monitoring')}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCategory === 'monitoring' 
                    ? 'bg-brand-slate text-white shadow-sm' 
                    : 'text-brand-periwinkle hover:text-white hover:bg-surface-subtle'
                }`}
              >
                Domain Watchdogs
              </button>
              <button
                onClick={() => setSelectedCategory('cicd')}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCategory === 'cicd' 
                    ? 'bg-brand-slate text-white shadow-sm' 
                    : 'text-brand-periwinkle hover:text-white hover:bg-surface-subtle'
                }`}
              >
                CI/CD Quality Gates
              </button>
              <button
                onClick={() => setSelectedCategory('webhooks')}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCategory === 'webhooks' 
                    ? 'bg-brand-slate text-white shadow-sm' 
                    : 'text-brand-periwinkle hover:text-white hover:bg-surface-subtle'
                }`}
              >
                Webhooks &amp; Edge
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Product 1: Custom Domain Automated Watchdog */}
            {(selectedCategory === 'all' || selectedCategory === 'monitoring') && (
              <div className="flex flex-col justify-between rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 sm:p-6 shadow-lg hover:border-brand-slate transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-oxford text-accent-cyan border border-brand-slate/40">
                      <Radio className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-cyan-950/40 text-accent-cyan border border-cyan-500/30 px-2 py-0.5 rounded-md">
                      Automated Cron
                    </span>
                  </div>
                  <h3 className="text-base font-black text-brand-offwhite">Custom Domain Telemetry Watchdog</h3>
                  <p className="mt-1.5 text-xs text-brand-periwinkle leading-relaxed">
                    Continuous synthetic monitoring on custom domains. Automatically re-evaluates Core Web Vitals, DOM tree depth, TLS certificates, and HTTP response times at hourly, 6-hour, or daily cadences.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-brand-periwinkle">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />
                      <span>Zero-code synthetic health pings</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />
                      <span>Automatic historical trend archiving</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />
                      <span>Instant regression push notifications</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-brand-slate/30 flex items-center justify-between">
                  <span className="text-xs font-mono text-brand-slate-light">Tier: Dev / Pro</span>
                  <a
                    href="#domain-configurator"
                    className="inline-flex items-center gap-1 text-xs font-bold font-mono text-accent-cyan hover:underline"
                  >
                    <span>Configure Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Product 2: CI/CD Quality Gate */}
            {(selectedCategory === 'all' || selectedCategory === 'cicd') && (
              <div className="flex flex-col justify-between rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 sm:p-6 shadow-lg hover:border-brand-slate transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-oxford text-accent-amber border border-brand-slate/40">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-amber-950/40 text-accent-amber border border-amber-500/30 px-2 py-0.5 rounded-md">
                      CI / CD Quality Gate
                    </span>
                  </div>
                  <h3 className="text-base font-black text-brand-offwhite">GitHub &amp; GitLab Actions Quality Gate</h3>
                  <p className="mt-1.5 text-xs text-brand-periwinkle leading-relaxed">
                    Prevent broken PRs from hitting production. Integrate our official GitHub Action or GitLab CI step to block merges if Core Web Vitals score drops below your required SLA threshold.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-brand-periwinkle">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />
                      <span>Configurable fail thresholds (e.g. score &lt; 85)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />
                      <span>PR comment summaries with delta indicators</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />
                      <span>Automated JSON artifact upload</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-brand-slate/30 flex items-center justify-between">
                  <span className="text-xs font-mono text-brand-slate-light">catalystlab/audit-action@v2</span>
                  <a
                    href="#integration-code"
                    className="inline-flex items-center gap-1 text-xs font-bold font-mono text-accent-cyan hover:underline"
                  >
                    <span>View YAML</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Product 3: Cloudflare Worker */}
            {(selectedCategory === 'all' || selectedCategory === 'webhooks') && (
              <div className="flex flex-col justify-between rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 sm:p-6 shadow-lg hover:border-brand-slate transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-oxford text-accent-purple border border-brand-slate/40">
                      <Globe className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-purple-950/40 text-accent-purple border border-purple-500/30 px-2 py-0.5 rounded-md">
                      Edge Telemetry
                    </span>
                  </div>
                  <h3 className="text-base font-black text-brand-offwhite">Cloudflare Edge Interceptor</h3>
                  <p className="mt-1.5 text-xs text-brand-periwinkle leading-relaxed">
                    Lightweight Cloudflare Worker or Vercel Edge middleware that captures real user TTFB, TLS handshake duration, and edge cache hit ratios in non-blocking background threads.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-brand-periwinkle">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />
                      <span>&lt;0.5ms execution overhead</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />
                      <span>Non-blocking ctx.waitUntil() dispatch</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />
                      <span>PoP-level latency aggregation</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-brand-slate/30 flex items-center justify-between">
                  <span className="text-xs font-mono text-brand-slate-light">Edge Middleware</span>
                  <a
                    href="#integration-code"
                    className="inline-flex items-center gap-1 text-xs font-bold font-mono text-accent-cyan hover:underline"
                  >
                    <span>View Worker</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Section 2: Interactive Domain Monitoring Configurator */}
        <section id="domain-configurator" className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 sm:p-8 shadow-xl">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-oxford border border-brand-slate/40 text-brand-periwinkle px-3 py-1 text-xs font-mono mb-2">
              <Sliders className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Interactive Config Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-offwhite tracking-tight">
              Configure Automated Monitoring on Your Custom Domain
            </h2>
            <p className="text-xs sm:text-sm text-brand-periwinkle mt-1 leading-relaxed">
              Select check frequency, toggle diagnostic engines, and set alert dispatch destinations to generate ready-to-deploy configuration code.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Domain Input */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-slate-light mb-1.5">
                  Target Custom Domain or Endpoint URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 h-4 w-4 text-brand-slate-light" />
                  <input
                    type="text"
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    placeholder="e.g. app.mycompany.com"
                    className="w-full rounded-xl border border-brand-slate/40 bg-brand-oxford pl-10 pr-4 py-2.5 text-sm font-mono text-brand-offwhite placeholder-brand-slate-light focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all"
                  />
                </div>
                <p className="text-[11px] font-mono text-brand-slate-light mt-1">
                  Synthetic check requests are dispatched from 42 distributed Edge PoPs globally.
                </p>
              </div>

              {/* Monitoring Cadence Frequency */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-slate-light mb-1.5">
                  Automated Check Cadence
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: '1h', label: '1 Hour', sub: 'High Vol' },
                    { id: '6h', label: '6 Hours', sub: 'Balanced' },
                    { id: '24h', label: 'Daily', sub: 'Standard' },
                    { id: 'weekly', label: 'Weekly', sub: 'Light' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFrequency(item.id as any)}
                      className={`flex flex-col items-center justify-center rounded-xl p-2.5 border text-center transition-all cursor-pointer ${
                        frequency === item.id 
                          ? 'border-accent-cyan bg-brand-slate text-white shadow-md' 
                          : 'border-brand-slate/30 bg-brand-oxford text-brand-periwinkle hover:bg-surface-subtle'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono">{item.label}</span>
                      <span className="text-[10px] font-mono text-brand-slate-light">
                        {item.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnostic Engines Toggle */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-slate-light mb-1.5">
                  Active Continuous Engines
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'vitals', label: 'Core Vitals', icon: Activity, desc: 'DOM/TTFB' },
                    { key: 'security', label: 'OWASP SecOps', icon: ShieldCheck, desc: 'Headers & CSP' },
                    { key: 'latency', label: 'Edge Radar', icon: Globe, desc: '42 Global PoPs' },
                    { key: 'aiReadiness', label: 'AI Readiness', icon: Cpu, desc: 'llms.txt' },
                    { key: 'eco', label: 'Eco Carbon', icon: Leaf, desc: 'CO2e Model' },
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
                            ? 'border-accent-cyan/60 bg-brand-oxford text-brand-offwhite' 
                            : 'border-brand-slate/30 bg-brand-oxford/50 text-brand-slate-light hover:bg-brand-oxford'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isEnabled ? 'text-accent-cyan' : 'text-brand-slate-light'}`} />
                        <div className="truncate">
                          <div className="text-xs font-bold font-mono truncate">{engine.label}</div>
                          <div className="text-[10px] font-mono text-brand-slate-light truncate">
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
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-slate-light mb-1.5">
                  Regression Alert Channel
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  {[
                    { id: 'webhook', label: 'REST Webhook', icon: Webhook },
                    { id: 'slack', label: 'Slack Webhook', icon: Radio },
                    { id: 'email', label: 'Email Digest', icon: CheckCircle2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAlertChannel(item.id as any)}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                          alertChannel === item.id
                            ? 'border-accent-cyan bg-brand-slate text-white'
                            : 'border-brand-slate/30 bg-brand-oxford text-brand-periwinkle hover:bg-surface-subtle'
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
                    className="w-full rounded-xl border border-brand-slate/40 bg-brand-oxford px-3 py-2 text-xs font-mono text-brand-offwhite focus:border-accent-cyan focus:outline-none"
                  />
                )}
              </div>

            </div>

            {/* Right Column: Code Block */}
            <div className="lg:col-span-6 flex flex-col h-full rounded-2xl border border-brand-slate/40 bg-brand-oxford text-white p-5 shadow-inner">
              <div className="flex items-center justify-between pb-2.5 border-b border-brand-slate/30 mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
                  <span className="text-xs font-mono font-bold text-brand-periwinkle">catalystlab-config.json</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateConfigJson(), 'config-json')}
                  className="flex items-center gap-1.5 rounded-lg border border-brand-slate/40 bg-surface-panel hover:bg-surface-subtle text-brand-periwinkle hover:text-white px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  {copiedSnippet === 'config-json' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-accent-emerald" />
                      <span className="text-accent-emerald">Copied!</span>
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
              <pre className="flex-1 overflow-x-auto text-xs font-mono leading-relaxed text-brand-periwinkle bg-brand-navy p-3.5 rounded-xl border border-brand-slate/30">
                {generateConfigJson()}
              </pre>

              {/* Action Buttons */}
              <div className="mt-4 pt-3.5 border-t border-brand-slate/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-brand-slate-light text-center sm:text-left">
                  Ready to deploy to your background cron runner or CI/CD pipeline.
                </div>
                <Link
                  to={`/dashboard?tab=monitoring&domain=${encodeURIComponent(targetDomain)}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-slate hover:bg-brand-slate-hover text-white font-mono font-bold px-4 py-2 text-xs transition-all shadow-md active:scale-95 border border-brand-periwinkle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-accent-cyan" />
                  <span>Add to My Dashboard</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Section 3: Code Integration Snippets */}
        <section id="integration-code">
          <div className="mb-6">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand-slate-light flex items-center gap-1.5 mb-1">
              <Code2 className="h-4 w-4 text-accent-cyan" />
              <span>Developer Integrations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-offwhite tracking-tight">
              Ready-to-Paste Deployment Snippets
            </h2>
            <p className="text-xs sm:text-sm text-brand-periwinkle mt-1">
              Select your stack below to integrate automated telemetry in less than 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* GitHub Action */}
            <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 text-white shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-brand-offwhite">
                    <Terminal className="h-4 w-4 text-accent-amber" />
                    <span>.github/workflows/catalyst-gate.yml</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sampleGithubActionYaml, 'gh-yaml')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-oxford hover:bg-brand-navy text-xs font-mono text-brand-periwinkle border border-brand-slate/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  >
                    {copiedSnippet === 'gh-yaml' ? <Check className="h-3 w-3 text-accent-emerald" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSnippet === 'gh-yaml' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[11px] font-mono leading-relaxed text-brand-periwinkle bg-brand-navy p-3.5 rounded-xl border border-brand-slate/30">
                  {sampleGithubActionYaml}
                </pre>
              </div>
              <p className="text-[11px] font-mono text-brand-slate-light mt-3">
                Runs automatically on PR and push events to verify regression gates.
              </p>
            </div>

            {/* Cloudflare Edge Worker */}
            <div className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-5 text-white shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-brand-offwhite">
                    <Globe className="h-4 w-4 text-accent-cyan" />
                    <span>Cloudflare Worker / Edge Interceptor</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sampleCloudflareWorker, 'cf-worker')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-oxford hover:bg-brand-navy text-xs font-mono text-brand-periwinkle border border-brand-slate/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  >
                    {copiedSnippet === 'cf-worker' ? <Check className="h-3 w-3 text-accent-emerald" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSnippet === 'cf-worker' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[11px] font-mono leading-relaxed text-brand-periwinkle bg-brand-navy p-3.5 rounded-xl border border-brand-slate/30 max-h-60">
                  {sampleCloudflareWorker}
                </pre>
              </div>
              <p className="text-[11px] font-mono text-brand-slate-light mt-3">
                Captures real edge execution metrics with non-blocking background dispatch.
              </p>
            </div>

          </div>
        </section>

        {/* Section 4: Enterprise & SLA CTA Banner */}
        <section className="rounded-2xl border border-brand-slate/40 bg-surface-panel p-6 sm:p-10 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/40 bg-brand-oxford px-3 py-1 text-xs font-mono text-accent-cyan">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Enterprise Custom Domain Networks</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-offwhite">
                Need Dedicated Telemetry Probes for 100+ Domains?
              </h2>
              <p className="text-xs sm:text-sm text-brand-periwinkle leading-relaxed">
                We offer custom private PoPs, SOC2 Type II compliance reports, automated SAML/SSO provisioning, and dedicated Slack channels with our core telemetry engineers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                to="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-slate hover:bg-brand-slate-hover text-white font-mono font-bold px-5 py-3 text-xs sm:text-sm transition-all shadow-md active:scale-95 border border-brand-periwinkle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
              >
                <span>View Enterprise Pricing</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-brand-slate/40 bg-brand-oxford hover:bg-surface-subtle text-brand-periwinkle hover:text-white px-5 py-3 text-xs sm:text-sm font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
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
