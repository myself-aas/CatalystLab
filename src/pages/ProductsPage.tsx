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
import { ParallaxSection } from '../components/common/ParallaxSection';
import { WebhookFanoutMesh } from '../components/integrations/WebhookFanoutMesh';
import { logger } from '../lib/logger';

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
      }).catch(err => logger.error('Telemetry dispatch error:', err))
    );

    return response;
  }
};`;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-primary-foreground">
      <SEOHead
        title="Automated Plugins & Domain Monitoring Watchdog | CatalystLab"
        description="Deploy continuous telemetry agents, CI/CD quality gates, webhook dispatchers, and edge interceptors directly inside your custom domains."
        keywords={['CatalystLab domain watchdog', 'CI/CD quality gates', 'edge telemetry interceptor', 'continuous web vitals']}
        canonicalUrl="https://www.catalystlab.tech/products"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--app-card)_0%,var(--app-background)_65%,var(--app-muted)_100%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e125_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e125_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-mono text-foreground shadow-xs">
              <Radio className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
              <span className="font-semibold">Products &amp; Continuous Telemetry</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-mono text-emerald-800 font-bold shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Automated Multi-Engine Cron</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-mono text-blue-800 font-semibold shadow-xs">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span>42 Global PoPs</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground max-w-3xl leading-[1.08] font-sans">
            Automated Plugins &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Custom Domain Watchdogs
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-sans font-normal">
            Deploy continuous telemetry agents, CI/CD quality gates, webhook dispatchers, and edge interceptors directly inside your custom domains. Prevent Core Web Vitals regressions, OWASP header drift, and AI readiness drops before users notice.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a 
              href="#domain-configurator"
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-3 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-sans"
            >
              <Sliders className="h-4 w-4 text-blue-400" />
              <span>Configure Domain Monitor</span>
            </a>
            <Link
              to="/dashboard?tab=monitoring"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground hover:text-foreground hover:border-border px-5 py-3 text-xs sm:text-sm transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-sans font-semibold"
            >
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>View Monitored Domains</span>
            </Link>
            <Link
              to="/api-docs"
              className="inline-flex items-center gap-1.5 rounded-xl border border-transparent text-muted-foreground hover:text-foreground px-4 py-3 text-xs sm:text-sm font-sans font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Code2 className="h-4 w-4" />
              <span>API Docs →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Immersive Products Parallax Banner */}
      <ParallaxSection
        bgImage="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        overlayOpacity={0.88}
        height="min-h-[320px]"
        className="border-y border-border"
      >
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            Cloud Infrastructure Parallax
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-sans tracking-tight">
            Autonomous Telemetry &amp; Real-Time Watchdogs
          </h2>
          <p className="text-sm text-muted-foreground font-sans max-w-xl mx-auto leading-relaxed">
            Engineered for high-scale microservices, automated CI/CD pipelines, and rigorous web security compliance.
          </p>
        </div>
      </ParallaxSection>

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Section 1: Product Suite Catalog */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span>Integration Suite</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
                CatalystLab Plugin &amp; Watchdog Ecosystem
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl font-sans leading-relaxed">
                Choose from our pre-built plugins, serverless workers, and webhook bridges to connect any custom domain, CMS, or pipeline.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/50 p-1.5 rounded-2xl border border-border">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setSelectedCategory('monitoring')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans ${
                  selectedCategory === 'monitoring' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Domain Watchdogs
              </button>
              <button
                onClick={() => setSelectedCategory('cicd')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans ${
                  selectedCategory === 'cicd' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                CI/CD Quality Gates
              </button>
              <button
                onClick={() => setSelectedCategory('webhooks')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans ${
                  selectedCategory === 'webhooks' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
              <div className="flex flex-col justify-between rounded-3xl border border-border bg-background p-6 shadow-sm hover:shadow-md hover:border-border transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground border border-border">
                      <Radio className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border px-2.5 py-1 rounded-lg">
                      Automated Cron
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground font-sans">Custom Domain Telemetry Watchdog</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-sans">
                    Continuous synthetic monitoring on custom domains. Automatically re-evaluates Core Web Vitals, DOM tree depth, TLS certificates, and HTTP response times at hourly, 6-hour, or daily cadences.
                  </p>
                  <ul className="mt-5 space-y-2 text-xs text-muted-foreground font-sans">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Zero-code synthetic health pings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Automatic historical trend archiving</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Instant regression push notifications</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">Tier: Dev / Pro</span>
                  <a
                    href="#domain-configurator"
                    className="inline-flex items-center gap-1.5 text-xs font-bold font-sans text-foreground hover:underline"
                  >
                    <span>Configure Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Product 2: CI/CD Quality Gate */}
            {(selectedCategory === 'all' || selectedCategory === 'cicd') && (
              <div className="flex flex-col justify-between rounded-3xl border border-border bg-background p-6 shadow-sm hover:shadow-md hover:border-border transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
                      CI / CD Quality Gate
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground font-sans">GitHub &amp; GitLab Actions Quality Gate</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-sans">
                    Prevent broken PRs from hitting production. Integrate our official GitHub Action or GitLab CI step to block merges if Core Web Vitals score drops below your required SLA threshold.
                  </p>
                  <ul className="mt-5 space-y-2 text-xs text-muted-foreground font-sans">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Configurable fail thresholds (e.g. score &lt; 85)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>PR comment summaries with delta indicators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Automated JSON artifact upload</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">catalystlab/audit-action@v2</span>
                  <a
                    href="#integration-code"
                    className="inline-flex items-center gap-1.5 text-xs font-bold font-sans text-foreground hover:underline"
                  >
                    <span>View YAML</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Product 3: Cloudflare Worker */}
            {(selectedCategory === 'all' || selectedCategory === 'webhooks') && (
              <div className="flex flex-col justify-between rounded-3xl border border-border bg-background p-6 shadow-sm hover:shadow-md hover:border-border transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                      <Globe className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg">
                      Edge Telemetry
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground font-sans">Cloudflare Edge Interceptor</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-sans">
                    Lightweight Cloudflare Worker or Vercel Edge middleware that captures real user TTFB, TLS handshake duration, and edge cache hit ratios in non-blocking background threads.
                  </p>
                  <ul className="mt-5 space-y-2 text-xs text-muted-foreground font-sans">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>&lt;0.5ms execution overhead</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Non-blocking ctx.waitUntil() dispatch</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>PoP-level latency aggregation</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">Edge Middleware</span>
                  <a
                    href="#integration-code"
                    className="inline-flex items-center gap-1.5 text-xs font-bold font-sans text-foreground hover:underline"
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
        <section id="domain-configurator" className="rounded-3xl border border-border bg-background p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent border border-border text-muted-foreground px-3.5 py-1 text-xs font-mono font-bold mb-3 shadow-sm">
              <Sliders className="h-3.5 w-3.5 text-foreground" />
              <span>Interactive Config Studio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
              Configure Automated Monitoring on Your Custom Domain
            </h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed font-sans max-w-2xl">
              Select check frequency, toggle diagnostic engines, and set alert dispatch destinations to generate ready-to-deploy configuration code.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Domain Input */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Target Custom Domain or Endpoint URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    placeholder="e.g. app.mycompany.com"
                    className="w-full rounded-2xl border border-border bg-muted pl-11 pr-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-border focus:bg-background focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <p className="text-[11px] font-mono text-muted-foreground mt-2">
                  Synthetic check requests are dispatched from 42 distributed Edge PoPs globally.
                </p>
              </div>

              {/* Monitoring Cadence Frequency */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Automated Check Cadence
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                      className={`flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition-all cursor-pointer ${
                        frequency === item.id 
                          ? 'border-border bg-primary text-primary-foreground shadow-sm' 
                          : 'border-border bg-muted text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground'
                      }`}
                    >
                      <span className="text-xs font-bold font-sans">{item.label}</span>
                      <span className="text-[10px] font-mono opacity-80 mt-0.5">
                        {item.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnostic Engines Toggle */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Active Continuous Engines
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isEnabled 
                            ? 'border-border bg-primary text-primary-foreground shadow-sm' 
                            : 'border-border bg-muted text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isEnabled ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        <div className="truncate">
                          <div className={`text-xs font-bold font-sans truncate ${isEnabled ? 'text-primary-foreground' : 'text-foreground'}`}>{engine.label}</div>
                          <div className={`text-[10px] font-mono truncate ${isEnabled ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
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
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Regression Alert Channel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                  {[
                    { id: 'webhook', label: 'REST Webhook', icon: Webhook },
                    { id: 'slack', label: 'Slack', icon: Radio },
                    { id: 'email', label: 'Email Digest', icon: CheckCircle2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAlertChannel(item.id as any)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold font-sans transition-all cursor-pointer ${
                          alertChannel === item.id
                            ? 'border-border bg-primary text-primary-foreground shadow-sm'
                            : 'border-border bg-muted text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
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
                    className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-xs font-mono text-foreground focus:border-border focus:bg-background focus:outline-none transition-all shadow-sm"
                  />
                )}
              </div>

            </div>

            {/* Right Column: Code Block */}
            <div className="lg:col-span-6 flex flex-col h-full rounded-3xl border border-border bg-primary text-muted-foreground p-6 shadow-md overflow-hidden relative">
              {/* Subtle top glare */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                    <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  </div>
                  <span className="text-xs font-mono font-medium text-muted-foreground">catalystlab-config.json</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateConfigJson(), 'config-json')}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-background/5 hover:bg-background/10 text-muted-foreground hover:text-foreground px-3 py-1.5 text-xs font-sans font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <pre className="flex-1 overflow-x-auto text-[13px] font-mono leading-relaxed text-muted-foreground bg-foreground/40 p-4 rounded-xl border border-white/5 custom-scrollbar">
                {generateConfigJson()}
              </pre>

              {/* Action Buttons */}
              <div className="mt-5 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] font-mono text-muted-foreground text-center sm:text-left">
                  Ready to deploy to your background cron runner or CI/CD pipeline.
                </div>
                <Link
                  to={`/dashboard?tab=monitoring&domain=${encodeURIComponent(targetDomain)}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-background hover:bg-accent text-foreground font-sans font-bold px-5 py-2.5 text-xs transition-all shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <PlusCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Add to My Dashboard</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2b: Multi-Region Webhook Fan-Out Mesh */}
        <section id="webhook-mesh">
          <WebhookFanoutMesh />
        </section>

        {/* Section 3: Code Integration Snippets */}
        <section id="integration-code">
          <div className="mb-8">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <span>Developer Integrations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-sans">
              Ready-to-Paste Deployment Snippets
            </h2>
            <p className="text-sm text-muted-foreground mt-2 font-sans">
              Select your stack below to integrate automated telemetry in less than 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GitHub Action */}
            <div className="rounded-3xl border border-border bg-background p-6 text-foreground shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-foreground">
                    <Terminal className="h-4 w-4 text-amber-600" />
                    <span>.github/workflows/catalyst-gate.yml</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sampleGithubActionYaml, 'gh-yaml')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-xs font-sans font-medium text-muted-foreground border border-border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {copiedSnippet === 'gh-yaml' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSnippet === 'gh-yaml' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[12px] font-mono leading-relaxed text-muted-foreground bg-muted p-4 rounded-2xl border border-border custom-scrollbar">
                  {sampleGithubActionYaml}
                </pre>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground mt-4">
                Runs automatically on PR and push events to verify regression gates.
              </p>
            </div>

            {/* Cloudflare Edge Worker */}
            <div className="rounded-3xl border border-border bg-background p-6 text-foreground shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-foreground">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Cloudflare Worker / Edge Interceptor</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sampleCloudflareWorker, 'cf-worker')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-xs font-sans font-medium text-muted-foreground border border-border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {copiedSnippet === 'cf-worker' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSnippet === 'cf-worker' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[12px] font-mono leading-relaxed text-muted-foreground bg-muted p-4 rounded-2xl border border-border max-h-60 custom-scrollbar">
                  {sampleCloudflareWorker}
                </pre>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground mt-4">
                Captures real edge execution metrics with non-blocking background dispatch.
              </p>
            </div>

          </div>
        </section>

        {/* Section 4: Enterprise & SLA CTA Banner */}
        <section className="rounded-3xl border border-border bg-primary p-8 sm:p-12 text-primary-foreground shadow-md relative overflow-hidden">
          {/* subtle noise/pattern could go here */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-background via-transparent to-transparent opacity-50" />
          
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3.5 py-1 text-xs font-mono text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Enterprise Custom Domain Networks</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-foreground font-sans">
                Need Dedicated Telemetry Probes for 100+ Domains?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                We offer custom private PoPs, SOC2 Type II compliance reports, automated SAML/SSO provisioning, and dedicated Slack channels with our core telemetry engineers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                to="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-background hover:bg-accent text-foreground font-sans font-bold px-6 py-3 text-sm transition-all shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>View Enterprise Pricing</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-primary-foreground px-6 py-3 text-sm font-sans font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
