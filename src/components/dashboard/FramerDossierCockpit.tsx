import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  GitBranch, 
  GitPullRequest, 
  CheckCircle2, 
  ArrowUpRight, 
  Terminal, 
  Zap, 
  FileCode2, 
  Layers, 
  Clock, 
  RotateCw, 
  Check, 
  AlertTriangle, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';

interface FramerDossierCockpitProps {
  targetDomain?: string;
  onRefreshScan?: () => void;
  isScanning?: boolean;
}

export const FramerDossierCockpit: React.FC<FramerDossierCockpitProps> = ({
  targetDomain = 'acme.corp',
  onRefreshScan,
  isScanning = false,
}) => {
  const [activeEngineTab, setActiveEngineTab] = useState<'synthshift' | 'vitalzyme' | 'edgekinase' | 'riskprotease'>('synthshift');
  const [diffMode, setDiffMode] = useState<'split' | 'unified'>('split');
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [prDeployStatus, setPrDeployStatus] = useState<'idle' | 'deploying' | 'deployed'>('idle');
  const [deployedPrNumber, setDeployedPrNumber] = useState<number | null>(null);

  const handleDeployPR = () => {
    setPrDeployStatus('deploying');
    setTimeout(() => {
      setPrDeployStatus('deployed');
      setDeployedPrNumber(Math.floor(Math.random() * 400) + 120);
    }, 1800);
  };

  return (
    <div className="space-y-6 text-white font-sans">
      {/* 4.2 A: Top KPI Strip (4 Modular Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Core Web Vitals Pass Rate */}
        <div className="p-5 rounded-2xl bg-surface border border-border relative overflow-hidden group hover:border-border-strong transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Activity className="size-3.5 text-[#00F298]" />
              CWV Pass Rate
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Pass
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold tracking-[-0.03em] text-white">99.9%</span>
            <div className="flex items-center text-xs text-[#00F298]">
              <ArrowUpRight className="size-3 mr-0.5" />
              <span>+0.4%</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>LCP <strong className="text-white">1.06s</strong></span>
            <span>INP <strong className="text-white">38ms</strong></span>
            <span>CLS <strong className="text-white">0.002</strong></span>
          </div>
        </div>

        {/* Metric 2: OWASP Transport Shield */}
        <div className="p-5 rounded-2xl bg-surface border border-border relative overflow-hidden group hover:border-border-strong transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#0066FF]" />
              OWASP Transport
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Grade A+
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold tracking-[-0.03em] text-white">Grade A+</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="size-3" /> TLS 1.3 Preload
            </span>
            <span>0 Unencrypted</span>
          </div>
        </div>

        {/* Metric 3: AI Discoverability Index */}
        <div className="p-5 rounded-2xl bg-surface border border-border relative overflow-hidden group hover:border-border-strong transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Cpu className="size-3.5 text-[#8A2BE2]" />
              AI Discoverability
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              AEO Index
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold tracking-[-0.03em] text-white">98/100</span>
            <span className="text-xs text-purple-400 font-mono">LLM Kinase</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>llms.txt <strong className="text-emerald-400">Valid</strong></span>
            <span>Schema <strong className="text-emerald-400">JSON-LD</strong></span>
          </div>
        </div>

        {/* Metric 4: Active Edge Mesh P95 */}
        <div className="p-5 rounded-2xl bg-surface border border-border relative overflow-hidden group hover:border-border-strong transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-[#00D2FF]" />
              Edge Mesh P95
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              38 PoPs
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold tracking-[-0.03em] text-white">18.4ms</span>
            <span className="text-xs text-cyan-400 font-mono">Fastly/CF</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Global Handshake</span>
            <span className="text-emerald-400 font-medium">0% Drops</span>
          </div>
        </div>
      </div>

      {/* 4.2 B: The 8 Autonomous Engines Real-Time Telemetry Matrix */}
      <div className="p-6 rounded-2xl bg-surface border border-border relative overflow-hidden">
        {/* Header with Engine Switcher Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Autonomous Diagnostic Engines
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white border border-border">
                8 Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live AST schema parsing, sub-millisecond waterfall telemetry, and mesh ingress inspection.
            </p>
          </div>

          {/* Engine Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-background border border-border">
            <button
              onClick={() => setActiveEngineTab('synthshift')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeEngineTab === 'synthshift'
                  ? 'bg-surface text-white shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              SynthShift (AST Diff)
            </button>
            <button
              onClick={() => setActiveEngineTab('vitalzyme')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeEngineTab === 'vitalzyme'
                  ? 'bg-surface text-white shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              VitalZyme (CWV Waterfall)
            </button>
            <button
              onClick={() => setActiveEngineTab('edgekinase')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeEngineTab === 'edgekinase'
                  ? 'bg-surface text-white shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              EdgeKinase (Ping Sparkline)
            </button>
            <button
              onClick={() => setActiveEngineTab('riskprotease')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeEngineTab === 'riskprotease'
                  ? 'bg-surface text-white shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              RiskProtease (OWASP Log)
            </button>
          </div>
        </div>

        {/* Tab 1: SynthShift AST Split-Pane Code Visualizer */}
        {activeEngineTab === 'synthshift' && (
          <div className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <FileCode2 className="size-4 text-[#8A2BE2]" />
                <span className="text-white font-medium">AST Code Visualizer: index.html DOM Schema</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px]">
                  +24 lines / -18 lines
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDiffMode('split')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
                    diffMode === 'split' ? 'bg-white/15 text-white' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setDiffMode('unified')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
                    diffMode === 'unified' ? 'bg-white/15 text-white' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  Unified Diff
                </button>
              </div>
            </div>

            {diffMode === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 font-mono text-xs">
                {/* Left: Broken/Unoptimized DOM */}
                <div className="rounded-xl border border-rose-500/20 bg-background p-4 space-y-2 overflow-x-auto">
                  <div className="flex items-center justify-between text-[11px] text-rose-400 pb-2 border-b border-rose-500/20">
                    <span>- Source DOM (Render-Blocking)</span>
                    <span className="text-rose-500">Unoptimized</span>
                  </div>
                  <pre className="text-muted-foreground leading-relaxed text-[11px]">
                    <span className="text-rose-400/80 line-through block">
                      &lt;link rel=&quot;stylesheet&quot; href=&quot;/styles/global.css&quot;&gt;
                    </span>
                    <span className="text-rose-400/80 line-through block">
                      &lt;script src=&quot;/scripts/analytics.js&quot;&gt;&lt;/script&gt;
                    </span>
                    <span className="text-rose-400/80 line-through block">
                      &lt;script src=&quot;/scripts/heavy-vendor.js&quot;&gt;&lt;/script&gt;
                    </span>
                    <span className="text-muted-foreground block">
                      &lt;meta name=&quot;viewport&quot; content=&quot;width=device-width&quot;&gt;
                    </span>
                    <span className="text-rose-400/80 line-through block">
                      &lt;!-- Missing preconnect for assets.acme.corp --&gt;
                    </span>
                  </pre>
                </div>

                {/* Right: Optimized AST Patch */}
                <div className="rounded-xl border border-emerald-500/20 bg-background p-4 space-y-2 overflow-x-auto">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 pb-2 border-b border-emerald-500/20">
                    <span>+ SynthShift Optimized AST</span>
                    <span className="text-emerald-400">Patch Ready</span>
                  </div>
                  <pre className="text-muted-foreground leading-relaxed text-[11px]">
                    <span className="text-emerald-400 block">
                      &lt;link rel=&quot;preload&quot; href=&quot;/styles/critical.css&quot; as=&quot;style&quot;&gt;
                    </span>
                    <span className="text-emerald-400 block">
                      &lt;link rel=&quot;preconnect&quot; href=&quot;https://assets.acme.corp&quot; crossorigin&gt;
                    </span>
                    <span className="text-emerald-400 block">
                      &lt;script src=&quot;/scripts/analytics.js&quot; defer fetchpriority=&quot;low&quot;&gt;&lt;/script&gt;
                    </span>
                    <span className="text-emerald-400 block">
                      &lt;script type=&quot;module&quot; src=&quot;/scripts/vendor.mjs&quot; async&gt;&lt;/script&gt;
                    </span>
                    <span className="text-emerald-400 block">
                      &lt;script type=&quot;application/ld+json&quot;&gt;&#123;&quot;@context&quot;:&quot;https://schema.org&quot;&#125;&lt;/script&gt;
                    </span>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-background p-4 font-mono text-[11px] overflow-x-auto">
                <div className="text-muted-foreground pb-2 border-b border-border mb-2">
                  --- a/index.html (Source)<br />
                  +++ b/index.html (SynthShift AST Synthesized)
                </div>
                <div className="text-rose-400">- &lt;link rel=&quot;stylesheet&quot; href=&quot;/styles/global.css&quot;&gt;</div>
                <div className="text-rose-400">- &lt;script src=&quot;/scripts/analytics.js&quot;&gt;&lt;/script&gt;</div>
                <div className="text-rose-400">- &lt;script src=&quot;/scripts/heavy-vendor.js&quot;&gt;&lt;/script&gt;</div>
                <div className="text-emerald-400">+ &lt;link rel=&quot;preload&quot; href=&quot;/styles/critical.css&quot; as=&quot;style&quot;&gt;</div>
                <div className="text-emerald-400">+ &lt;link rel=&quot;preconnect&quot; href=&quot;https://assets.acme.corp&quot; crossorigin&gt;</div>
                <div className="text-emerald-400">+ &lt;script src=&quot;/scripts/analytics.js&quot; defer fetchpriority=&quot;low&quot;&gt;&lt;/script&gt;</div>
                <div className="text-emerald-400">+ &lt;script type=&quot;module&quot; src=&quot;/scripts/vendor.mjs&quot; async&gt;&lt;/script&gt;</div>
                <div className="text-emerald-400">+ &lt;script type=&quot;application/ld+json&quot;&gt;&#123;&quot;@context&quot;: &quot;https://schema.org&quot;&#125;&lt;/script&gt;</div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: VitalZyme Waterfall Telemetry */}
        {activeEngineTab === 'vitalzyme' && (
          <div className="pt-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-[#00F298]" />
                <span className="text-white font-medium">Sub-Millisecond Loading Timeline</span>
              </div>
              <span>Total Session: 1,060ms</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* DNS Lookup */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">1. DNS Resolution (EdgeKinase Anycast)</span>
                  <span className="text-white">12.4ms</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '4%' }} />
                </div>
              </div>

              {/* TCP & TLS 1.3 */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">2. TLS 1.3 Handshake (CHACHA20)</span>
                  <span className="text-white">22.8ms</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '8%' }} />
                </div>
              </div>

              {/* TTFB */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">3. Time to First Byte (TTFB)</span>
                  <span className="text-emerald-400">142.1ms (Pass)</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              {/* FCP */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">4. First Contentful Paint (FCP)</span>
                  <span className="text-emerald-400">580.0ms (Optimal)</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

              {/* LCP */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">5. Largest Contentful Paint (LCP)</span>
                  <span className="text-[#00F298]">1,060.0ms (P95 Target Met)</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-[#00F298] rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: EdgeKinase Ping Sparklines */}
        {activeEngineTab === 'edgekinase' && (
          <div className="pt-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-[#00D2FF]" />
                <span className="text-white font-medium">38-PoP Global Mesh Ping Telemetry</span>
              </div>
              <span className="text-emerald-400">100% Health Status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-background border border-border">
                <div className="flex justify-between text-muted-foreground text-[11px] mb-1">
                  <span>North America (IAD, SFO)</span>
                  <span className="text-cyan-400">14ms</span>
                </div>
                <div className="text-lg font-semibold text-white">P95: 14.2ms</div>
                <div className="text-[10px] text-emerald-400 mt-1">16 PoPs Active</div>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border">
                <div className="flex justify-between text-muted-foreground text-[11px] mb-1">
                  <span>Europe (LHR, FRA, AMS)</span>
                  <span className="text-cyan-400">19ms</span>
                </div>
                <div className="text-lg font-semibold text-white">P95: 19.1ms</div>
                <div className="text-[10px] text-emerald-400 mt-1">12 PoPs Active</div>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border">
                <div className="flex justify-between text-muted-foreground text-[11px] mb-1">
                  <span>Asia-Pacific (NRT, SIN, SYD)</span>
                  <span className="text-cyan-400">32ms</span>
                </div>
                <div className="text-lg font-semibold text-white">P95: 32.6ms</div>
                <div className="text-[10px] text-emerald-400 mt-1">8 PoPs Active</div>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border">
                <div className="flex justify-between text-muted-foreground text-[11px] mb-1">
                  <span>South America (GRU, SCL)</span>
                  <span className="text-cyan-400">44ms</span>
                </div>
                <div className="text-lg font-semibold text-white">P95: 44.0ms</div>
                <div className="text-[10px] text-emerald-400 mt-1">2 PoPs Active</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: RiskProtease Security Events */}
        {activeEngineTab === 'riskprotease' && (
          <div className="pt-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#FF9900]" />
                <span className="text-white font-medium">OWASP Transport Security Audit Log</span>
              </div>
              <span className="text-emerald-400">0 Critical Vulnerabilities</span>
            </div>

            <div className="divide-y divide-white/5 border border-border rounded-xl bg-background font-mono text-xs overflow-hidden">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                    PASS
                  </span>
                  <span className="text-white">TLS 1.3 Cipher Suite Enforced (CHACHA20-POLY1305)</span>
                </div>
                <span className="text-muted-foreground text-[11px]">RFC 8446</span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                    PASS
                  </span>
                  <span className="text-white">HSTS Preload Directive with max-age=31536000</span>
                </div>
                <span className="text-muted-foreground text-[11px]">RFC 6797</span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                    PASS
                  </span>
                  <span className="text-white">Content-Security-Policy (default-src &apos;self&apos;)</span>
                </div>
                <span className="text-muted-foreground text-[11px]">W3C CSP3</span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                    INFO
                  </span>
                  <span className="text-muted-foreground">Permissions-Policy refined for camera=(), microphone=()</span>
                </div>
                <span className="text-muted-foreground text-[11px]">W3C Perms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4.2 C: One-Click GitHub PR Patch Engine (GHLyase) */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-surface to-surface border border-border relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <GitPullRequest className="size-4 text-[#0066FF]" />
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Automated Patch Ready for {targetDomain}
              </span>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-white">
              Branch: <span className="font-mono text-[#00D2FF]">catalyst/patch-cwv-vitalzyme-v24</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Eliminates render-blocking CSS and defers non-critical JS chunks to recover 420ms on mobile LCP. Tested against AST regression suites.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowDiffModal(!showDiffModal)}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-surface border border-border hover:border-border-strong text-white text-xs font-medium transition-all cursor-pointer"
            >
              {showDiffModal ? 'Hide Unified Diff' : 'Review Unified Diff'}
            </button>

            {prDeployStatus === 'deployed' ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                <span>PR #{deployedPrNumber} Created on GitHub</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDeployPR}
                disabled={prDeployStatus === 'deploying'}
                className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-[0_0_18px_rgba(255,255,255,0.3)] flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {prDeployStatus === 'deploying' ? (
                  <>
                    <RotateCw className="size-3.5 animate-spin text-black" />
                    <span>Triggering GitHub Webhook...</span>
                  </>
                ) : (
                  <>
                    <span>Deploy PR to GitHub &rarr;</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Unified Diff Preview Drawer */}
        {showDiffModal && (
          <div className="mt-5 pt-4 border-t border-border animate-fadeIn">
            <div className="p-4 rounded-xl bg-background border border-border font-mono text-xs overflow-x-auto">
              <div className="text-muted-foreground pb-2 border-b border-border mb-2">
                diff --git a/index.html b/index.html<br />
                index 4b825dc..a71ef09 100644<br />
                --- a/index.html<br />
                +++ b/index.html
              </div>
              <div className="text-muted-foreground">@@ -14,6 +14,8 @@</div>
              <div className="text-rose-400">-    &lt;link rel=&quot;stylesheet&quot; href=&quot;/assets/app.css&quot;&gt;</div>
              <div className="text-rose-400">-    &lt;script src=&quot;/assets/analytics.js&quot;&gt;&lt;/script&gt;</div>
              <div className="text-emerald-400">+    &lt;link rel=&quot;preload&quot; href=&quot;/assets/app.css&quot; as=&quot;style&quot; onload=&quot;this.rel=&apos;stylesheet&apos;&quot;&gt;</div>
              <div className="text-emerald-400">+    &lt;script src=&quot;/assets/analytics.js&quot; defer fetchpriority=&quot;low&quot;&gt;&lt;/script&gt;</div>
              <div className="text-emerald-400">+    &lt;link rel=&quot;preconnect&quot; href=&quot;https://cdn.catalystlab.tech&quot; crossorigin&gt;</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FramerDossierCockpit;
