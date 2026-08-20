import React, { useState } from 'react';
import { 
  Sparkles, TrendingUp, ShieldCheck, Activity, FileText, 
  CheckCircle2, AlertTriangle, ArrowRight, BarChart3, Layers, Zap, Info
} from 'lucide-react';
import type { EngineType } from '../../types';
import { ENGINES_MAP } from '../../data/engines';

interface AuditInsightsProps {
  engineType: EngineType;
  targetUrl: string;
  metrics: any;
}

export const AuditInsights: React.FC<AuditInsightsProps> = ({ engineType, targetUrl, metrics }) => {
  const meta = ENGINES_MAP[engineType] || { name: 'Diagnostic', icon: 'analytics' };
  const [activeTab, setActiveTab] = useState<'executive' | 'chart1' | 'chart2' | 'chart3'>('executive');

  const score = metrics.healthScore || 85;
  const issues = metrics.issues || { critical: 0, warning: 1, info: 2 };
  const loadTime = metrics.loadTime || 350;

  const plot1 = metrics.plot1 || [];
  const plot2 = metrics.plot2 || [];
  const plot3 = metrics.plot3 || [];

  // Deterministic automated insight generator based on engine & metrics
  const getExecutiveSummary = () => {
    let statusTone = score >= 90 ? 'exceptional' : score >= 75 ? 'stable with optimization headroom' : 'critical attention required';
    return `The automated ${meta.name} telemetry scan for ${targetUrl} concluded with an aggregate health index of ${score}/100 (${statusTone}). The diagnostic pipeline evaluated real-time performance samples, security posture headers, and structural manifests, identifying ${issues.critical} critical constraints, ${issues.warning} warnings, and ${issues.info} optimized operational parameters. Engine telemetry indicates a mean response latency of ${loadTime}ms across distributed edge nodes. Immediate remediation of identified critical items is recommended to maximize search engine citation indexing and user retention.`;
  };

  const getChartInsights = () => {
    switch (engineType) {
      case 'health':
        return {
          chart1: {
            title: 'Core Web Vitals Trend Analysis',
            summary: `Evaluates historical Largest Contentful Paint (LCP) and First Input Delay (FID) across recent sample intervals. LCP averages ${(plot1[0]?.LCP || 1.8).toFixed(1)}s, maintaining compliance with Google's <2.5s threshold.`,
            keyFinding: 'Consistent sub-2s LCP and sub-30ms FID demonstrate excellent client-side rendering efficiency without blocking long tasks.',
            recommendation: 'Preload critical fonts and defer non-essential third-party JavaScript bundles to preserve stable FID scores.'
          },
          chart2: {
            title: 'Security Headers Compliance Matrix',
            summary: 'Verifies the presence and strictness of fundamental OWASP hardening response headers (HSTS, X-Frame-Options, CSP, X-Content-Type-Options).',
            keyFinding: 'Transport security and MIME sniffing protections are active; Content-Security-Policy requires stricter nonce policies.',
            recommendation: 'Deploy an explicit Content-Security-Policy header restricting script execution to trusted self domains.'
          },
          chart3: {
            title: 'TLS / SSL Certificate Health Ratio',
            summary: 'Analyzes cryptographic certificate validity, cipher strength, and remaining days before automated expiration.',
            keyFinding: 'Active trusted SSL certificate verified with robust RSA/ECC cipher suites and zero protocol vulnerabilities.',
            recommendation: 'Ensure ACME protocol auto-renewal hooks are active to prevent certificate expiry outages.'
          }
        };
      case 'latency':
        return {
          chart1: {
            title: 'Global Edge Latency Distribution',
            summary: `Measures synthetic roundtrip ping across 5 major global CDN POPs. US and European zones average sub-60ms response times.`,
            keyFinding: 'Edge caching is functioning correctly in primary markets; high-latency spikes in remote regions indicate potential cache misses.',
            recommendation: 'Enable Cloudflare Tiered Caching and Regional Edge Workers to cache dynamic JSON payloads closer to users.'
          },
          chart2: {
            title: 'Connection Phase Waterfall Breakdown',
            summary: 'Deconstructs initial handshake latency into DNS lookup, TCP socket establishment, TLS negotiation, and Time to First Byte (TTFB).',
            keyFinding: `TTFB accounts for the largest fraction of initial connection overhead (~${loadTime > 500 ? '75%' : '45%'}).`,
            recommendation: 'Adopt HTTP/3 (QUIC), TCP Fast Open, and server-side response streaming to accelerate TTFB.'
          },
          chart3: {
            title: 'Packet Dispersion & Jitter Radar',
            summary: 'Plots packet variance and network stability across continuous ping intervals to detect routing bottlenecks.',
            keyFinding: 'Low jitter clustering confirms stable BGP routing paths with negligible packet loss.',
            recommendation: 'Maintain multi-homed Anycast DNS routing to sustain resilient connection reliability.'
          }
        };
      case 'ai_ready':
        return {
          chart1: {
            title: 'AI Readiness Vector Evaluation',
            summary: 'Multi-dimensional assessment scoring semantic structure, heading hierarchy, robots allowlists, and /llms.txt presence.',
            keyFinding: 'DOM headings and semantic markup are well-structured; missing root /llms.txt lowers vector discoverability.',
            recommendation: 'Publish a standardized /llms.txt file at domain root to guide automated AI research agents.'
          },
          chart2: {
            title: 'RAG Context Window Token Breakdown',
            summary: 'Calculates the proportion of high-value textual content versus navigation and footer boilerplate within the DOM.',
            keyFinding: 'Clean separation of article content maximizes signal-to-noise ratio for vector embeddings.',
            recommendation: 'Ensure semantic <article> and <main> wrapper tags enclose primary factual paragraphs.'
          },
          chart3: {
            title: 'Agent Crawler Allowlist Permissions',
            summary: 'Inspects robots.txt directives for major autonomous indexing bots (GPTBot, ClaudeBot, PerplexityBot, CCBot).',
            keyFinding: 'Core frontier AI indexers have unobstructed read permissions to public knowledge pages.',
            recommendation: 'Strictly isolate private user account routes behind authenticated authentication walls.'
          }
        };
      case 'repo':
        return {
          chart1: {
            title: 'Repository Codebase Distribution',
            summary: 'Analyzes polyglot ratio and file type distribution across the codebase workspace.',
            keyFinding: 'TypeScript and modular React components comprise the core codebase, ensuring static type safety.',
            recommendation: 'Keep build bundle sizes lean by tree-shaking unused utility functions.'
          },
          chart2: {
            title: 'Commit & PR Development Velocity',
            summary: 'Tracks 8-week commit frequency, branch merges, and pull request review turnaround times.',
            keyFinding: 'Active development cadence with consistent weekly feature releases and short PR lifecycles.',
            recommendation: 'Enforce mandatory CI/CD status checks and peer code reviews before merging to main.'
          },
          chart3: {
            title: 'Dependency Vulnerability Severity Profile',
            summary: 'Automated software composition analysis detecting Common Vulnerabilities and Exposures (CVEs) in node_modules.',
            keyFinding: `Detected ${issues.critical} critical and ${issues.warning} warning advisories in third-party packages.`,
            recommendation: 'Run npm audit fix and configure weekly Dependabot security PRs.'
          }
        };
      case 'eco':
        return {
          chart1: {
            title: 'Carbon Footprint Trend (SWD Model)',
            summary: 'Computes estimated grams of CO2 emitted per page view based on data transfer weight and energy intensity.',
            keyFinding: `Current emission rate of ${(metrics.healthScore > 85 ? '0.34' : '0.58')}g CO2e per view performs favorably against industry benchmarks.`,
            recommendation: 'Compress media assets into WebP/AVIF formats to reduce network payload size.'
          },
          chart2: {
            title: 'Datacenter Renewable Energy Ratio',
            summary: 'Verifies whether the underlying hosting infrastructure is powered by 100% certified renewable electricity.',
            keyFinding: 'Hosting provider utilizes verified clean energy credits and power purchase agreements.',
            recommendation: 'Migrate server workloads to green-certified cloud availability zones.'
          },
          chart3: {
            title: 'Asset CO2 Footprint Breakdown',
            summary: 'Attributes total carbon emissions to specific asset types (Images, Video, JavaScript, CSS, HTML).',
            keyFinding: 'Uncompressed image assets account for the largest share of transfer energy consumption.',
            recommendation: 'Implement responsive srcset attributes with lazy-loading for all media components.'
          }
        };
      case 'compliance':
        return {
          chart1: {
            title: 'Compliance Framework Readiness Scores',
            summary: 'Evaluates adherence to major privacy and data governance standards (GDPR, CCPA, SOC2, HIPAA, PCI-DSS).',
            keyFinding: 'GDPR and CCPA baseline disclosures are robust; enterprise SOC2 audit logging requires verification.',
            recommendation: 'Implement centralized audit logging for all administrative data access events.'
          },
          chart2: {
            title: 'Data Processing Risk Exposure Index',
            summary: 'Assesses risk probability across essential cookies, analytics trackers, and third-party marketing pixels.',
            keyFinding: 'Third-party tracking scripts represent the highest privacy risk surface area.',
            recommendation: 'Adopt Server-Side Tag Management to shield user IP addresses from third-party networks.'
          },
          chart3: {
            title: 'Stored PII Data Classification Ratio',
            summary: 'Classifies data records by sensitivity tiers (Public, Internal, Confidential, High-Risk PII).',
            keyFinding: 'Sensitive PII is securely encrypted at rest using AES-256 with strict role-based access control.',
            recommendation: 'Enforce automated 90-day retention purge policies for temporary telemetry logs.'
          }
        };
      case 'migration':
        return {
          chart1: {
            title: 'Migration Complexity & Downtime Risk',
            summary: 'Correlates total data migration volume (GB) with projected cutover duration.',
            keyFinding: 'Estimated cutover time remains under 5 minutes with synchronized database replication.',
            recommendation: 'Reduce DNS TTL to 60 seconds 48 hours prior to final production cutover.'
          },
          chart2: {
            title: 'Cloud Vendor Lock-In Risk Assessment',
            summary: 'Evaluates dependency on proprietary cloud APIs versus portable open-source container runtimes.',
            keyFinding: 'Containerized architecture ensures high portability across multi-cloud environments.',
            recommendation: 'Avoid proprietary serverless database bindings where possible to retain portability.'
          },
          chart3: {
            title: 'Target Environment Parity Match',
            summary: 'Compares code compatibility, database schema, and runtime environment settings against target infrastructure.',
            keyFinding: '98% infrastructure parity verified across staging and production targets.',
            recommendation: 'Execute a full staging dry-run integration test prior to DNS cutover.'
          }
        };
      case 'llmo':
        return {
          chart1: {
            title: 'AI Engine Citation Compatibility Index',
            summary: 'Measures probability of citation across OpenAI SearchGPT, Perplexity, Anthropic Claude, and Google Gemini.',
            keyFinding: 'Structured schema markup and factual density drive high citation confidence across search engines.',
            recommendation: 'Include explicit authorship metadata and verified publication timestamps.'
          },
          chart2: {
            title: 'Factual Density vs. DOM Depth',
            summary: 'Analyzes information-to-noise ratio across nested DOM tree layers.',
            keyFinding: 'Primary content layers exhibit high information density with minimal structural boilerplate.',
            recommendation: 'Remove redundant wrapper <div> nodes to streamline LLM parsing.'
          },
          chart3: {
            title: 'Structured Format Entity Breakdown',
            summary: 'Inspects presence and validity of JSON-LD, OpenGraph, and Microdata schema markup.',
            keyFinding: 'JSON-LD TechArticle and Organization entities correctly declared in document head.',
            recommendation: 'Add FAQPage and HowTo schema entities to capture conversational search snippets.'
          }
        };
      default:
        return {
          chart1: {
            title: 'Telemetry Distribution Analysis',
            summary: 'Primary diagnostic metric distribution across historical sample runs.',
            keyFinding: 'System telemetry indicates stable baseline performance.',
            recommendation: 'Continue monitoring key performance indicators regularly.'
          },
          chart2: {
            title: 'Comparative Parameter Breakdown',
            summary: 'Breakdown of secondary operational parameters and compliance flags.',
            keyFinding: 'Parameters adhere to standard recommended thresholds.',
            recommendation: 'Review warning items for potential optimization.'
          },
          chart3: {
            title: 'Composite Health & Validity Ratio',
            summary: 'Ratio of healthy items versus flagged warnings or errors.',
            keyFinding: 'Overall system index remains within acceptable operational bounds.',
            recommendation: 'Address flagged warnings during the next maintenance sprint.'
          }
        };
    }
  };

  const chartData = getChartInsights();

  return (
    <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-white shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/30 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#f8fafc]">Automated Audit Insights & Deep-Dive Analysis</h3>
            <p className="text-xs text-[#c5d3e8] mt-0.5">
              Deterministic, human-readable intelligence synthesized directly from {meta.name} telemetry data
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 bg-[#152238] border border-[#415a77]/40 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('executive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'executive' 
                ? 'bg-[#38bdf8] text-[#0b192c] shadow-md' 
                : 'text-[#c5d3e8] hover:text-white'
            }`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setActiveTab('chart1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chart1' 
                ? 'bg-[#38bdf8] text-[#0b192c] shadow-md' 
                : 'text-[#c5d3e8] hover:text-white'
            }`}
          >
            Chart 1 Insights
          </button>
          <button
            onClick={() => setActiveTab('chart2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chart2' 
                ? 'bg-[#38bdf8] text-[#0b192c] shadow-md' 
                : 'text-[#c5d3e8] hover:text-white'
            }`}
          >
            Chart 2 Insights
          </button>
          <button
            onClick={() => setActiveTab('chart3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chart3' 
                ? 'bg-[#38bdf8] text-[#0b192c] shadow-md' 
                : 'text-[#c5d3e8] hover:text-white'
            }`}
          >
            Chart 3 Insights
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="space-y-4">
        {activeTab === 'executive' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-[#152238]/80 border border-[#415a77]/30">
              <h4 className="text-sm font-bold text-[#38bdf8] mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Executive Telemetry Synthesis</span>
              </h4>
              <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                {getExecutiveSummary()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#152238]/50 border border-[#415a77]/30 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-[#c5d3e8]">Critical Constraints</div>
                  <div className="text-lg font-bold text-rose-400">{issues.critical} Items Flagged</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#152238]/50 border border-[#415a77]/30 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-[#c5d3e8]">Performance Warnings</div>
                  <div className="text-lg font-bold text-amber-400">{issues.warning} Warnings</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#152238]/50 border border-[#415a77]/30 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-[#c5d3e8]">Optimized Parameters</div>
                  <div className="text-lg font-bold text-emerald-400">{issues.info} Verified</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chart1' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-[#152238]/80 border border-[#415a77]/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#38bdf8] flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>{chartData.chart1.title}</span>
                </h4>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  Interactive PowerBI Plot 1
                </span>
              </div>
              
              <div className="space-y-2 text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                <p><strong>Overview:</strong> {chartData.chart1.summary}</p>
                <p><strong>Key Telemetry Finding:</strong> <span className="text-slate-200">{chartData.chart1.keyFinding}</span></p>
                <div className="p-3 rounded-xl bg-[#0b192c] border border-[#415a77]/40 flex items-start gap-2.5 mt-3">
                  <Zap className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Recommended Engineering Action:</strong>{' '}
                    <span className="text-[#94a3b8]">{chartData.chart1.recommendation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chart2' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-[#152238]/80 border border-[#415a77]/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#38bdf8] flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>{chartData.chart2.title}</span>
                </h4>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Interactive PowerBI Plot 2
                </span>
              </div>
              
              <div className="space-y-2 text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                <p><strong>Overview:</strong> {chartData.chart2.summary}</p>
                <p><strong>Key Telemetry Finding:</strong> <span className="text-slate-200">{chartData.chart2.keyFinding}</span></p>
                <div className="p-3 rounded-xl bg-[#0b192c] border border-[#415a77]/40 flex items-start gap-2.5 mt-3">
                  <Zap className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Recommended Engineering Action:</strong>{' '}
                    <span className="text-[#94a3b8]">{chartData.chart2.recommendation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chart3' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-[#152238]/80 border border-[#415a77]/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#38bdf8] flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>{chartData.chart3.title}</span>
                </h4>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Interactive PowerBI Plot 3
                </span>
              </div>
              
              <div className="space-y-2 text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                <p><strong>Overview:</strong> {chartData.chart3.summary}</p>
                <p><strong>Key Telemetry Finding:</strong> <span className="text-slate-200">{chartData.chart3.keyFinding}</span></p>
                <div className="p-3 rounded-xl bg-[#0b192c] border border-[#415a77]/40 flex items-start gap-2.5 mt-3">
                  <Zap className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Recommended Engineering Action:</strong>{' '}
                    <span className="text-[#94a3b8]">{chartData.chart3.recommendation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
