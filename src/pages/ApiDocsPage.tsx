import React, { useState } from 'react';
import { 
  Terminal, 
  Download, 
  FileJson, 
  Check, 
  Copy, 
  Search, 
  ShieldCheck, 
  Zap, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Activity, 
  Lock,
  Server
} from 'lucide-react';
import { 
  API_ENDPOINTS, 
  API_CATEGORIES, 
  generateCodeSnippet, 
  generateOpenApiSpec, 
  generatePostmanCollection 
} from '../data/apiSpecs';
import { ApiPlayground } from '../components/api/ApiPlayground';
import { SEOHead } from '../components/common/SEOHead';
import { LazyReveal } from '../components/common/LazyAnimate';

export const ApiDocsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEndpointId, setExpandedEndpointId] = useState<string | null>(API_ENDPOINTS[0]?.id || null);
  const [playgroundEndpointId, setPlaygroundEndpointId] = useState<string>(API_ENDPOINTS[0]?.id || '');
  
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, 'curl' | 'javascript' | 'python' | 'go' | 'rust' | 'php'>>({});
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  // Filter endpoints by category & search query
  const filteredEndpoints = API_ENDPOINTS.filter((ep) => {
    const matchesCategory = selectedCategory === 'All' || ep.category === selectedCategory;
    const matchesSearch = 
      ep.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedMap(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const scrollToPlayground = (endpointId: string) => {
    setPlaygroundEndpointId(endpointId);
    const element = document.getElementById('api-playground-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Download OpenAPI Spec
  const downloadOpenApi = () => {
    const spec = generateOpenApiSpec();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(spec, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'catalystlab-openapi-3.1.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Download Postman
  const downloadPostman = () => {
    const collection = generatePostmanCollection();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(collection, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'catalystlab-postman-collection.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-mono selection:bg-slate-900 selection:text-white">
      <SEOHead
        title="REST API Documentation & Telemetry Reference — CatalystLab"
        description="Comprehensive programmatic OpenAPI 3.1 specification for all 8 CatalystLab diagnostic engines, master audit orchestration, and CI/CD quality gates."
        keywords={['CatalystLab API', 'telemetry REST API', 'OpenAPI 3.1', 'web diagnostics API', 'CI/CD performance gate API']}
        canonicalUrl="https://www.catalystlab.tech/api-docs"
      />

      {/* Top Banner Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 pt-12 pb-14 sm:pt-16 sm:pb-18">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#ffffff_0%,#f8fafc_65%,#f1f5f9_100%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e125_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e125_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 backdrop-blur-md px-3.5 py-1 text-xs font-mono font-bold text-slate-900 uppercase tracking-wider shadow-xs">
                  <Terminal className="h-3.5 w-3.5 text-blue-600" />
                  REST API v2.4.0
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-mono font-semibold text-slate-700 shadow-xs">
                  OpenAPI 3.1 Spec
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono font-bold text-emerald-800 shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Production Ready
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 font-sans leading-[1.1]">
                REST API Documentation &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800">
                  Telemetry Reference
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans font-normal max-w-2xl">
                Programmatic REST endpoints for all 8 diagnostic engines, parallel master audit orchestration, domain permalink dossiers, CI/CD quality gates, webhook dispatchers, and live telemetry sockets.
              </p>
            </div>

            {/* Quick Export CTAs */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <button
                onClick={() => {
                  const el = document.getElementById('api-playground-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <Play className="h-4 w-4 text-blue-400" />
                <span>Open API Playground</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={downloadOpenApi}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-slate-700" />
                  <span>OpenAPI 3.1</span>
                </button>

                <button
                  onClick={downloadPostman}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <FileJson className="h-3.5 w-3.5 text-amber-600" />
                  <span>Postman v2.1</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        
        {/* ========================================================================= */}
        {/* SECTION 1: EMBEDDED API TEST PLAYGROUND */}
        {/* ========================================================================= */}
        <section id="api-playground-section" className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 font-sans">
              <Zap className="h-4 w-4 text-amber-600" />
              <span>Interactive API Playground &amp; Sandbox</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              Execute live HTTP requests against local or production sandboxes and inspect real response headers, timing, and schemas.
            </p>
          </div>

          <ApiPlayground 
            initialEndpointId={playgroundEndpointId}
            onSelectEndpoint={(id) => setExpandedEndpointId(id)}
          />
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: ENDPOINT CATALOGUE & INTERACTIVE SPECIFICATION EXPLORER */}
        {/* ========================================================================= */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 font-sans">
                <Layers className="h-4 w-4 text-slate-700" />
                <span>Endpoint Reference Catalog</span>
              </h2>
              <p className="text-xs text-slate-600 font-sans">
                Browse comprehensive request parameters, expected response schemas, and multi-language code snippets.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints or paths..."
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-4 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({API_ENDPOINTS.length})
            </button>

            {API_CATEGORIES.map((category) => {
              const count = API_ENDPOINTS.filter(e => e.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>

          {/* Endpoints List */}
          <div className="space-y-3">
            {filteredEndpoints.map((ep) => {
              const isExpanded = expandedEndpointId === ep.id;
              const lang = activeCodeTab[ep.id] || 'curl';

              return (
                <div
                  key={ep.id}
                  className={`rounded-2xl border transition-all ${
                    isExpanded 
                      ? 'border-slate-900 bg-white shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Collapsed Header Bar */}
                  <div 
                    onClick={() => setExpandedEndpointId(isExpanded ? null : ep.id)}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-mono font-bold uppercase shadow-xs ${
                        ep.method === 'POST' ? 'bg-slate-900 text-white' :
                        ep.method === 'GET' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' :
                        ep.method === 'DELETE' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 
                        'bg-amber-50 border border-amber-200 text-amber-800'
                      }`}>
                        {ep.method}
                      </span>

                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {ep.path}
                      </span>

                      <span className="hidden md:inline-block text-xs text-slate-600 truncate">
                        — {ep.summary}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {ep.category}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToPlayground(ep.id);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-900 hover:text-white transition-all shadow-xs cursor-pointer"
                        title="Test in Playground"
                      >
                        <Play className="h-3 w-3 text-amber-500" />
                        <span>Test</span>
                      </button>

                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 p-5 sm:p-6 space-y-5 bg-slate-50 rounded-b-2xl">
                      
                      {/* Description & Rate Limit info */}
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-sans">
                          {ep.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-600 flex items-center gap-1.5">
                            <Lock className="h-3 w-3 text-slate-700" />
                            <strong className="text-slate-900">Auth:</strong> {ep.auth}
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-600 flex items-center gap-1.5">
                            <Activity className="h-3 w-3 text-amber-600" />
                            <strong className="text-slate-900">Rate Limit:</strong> {ep.rateLimit}
                          </div>
                          {ep.tags.map(t => (
                            <span key={t} className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-mono text-slate-600">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Request Parameters (Path & Query) */}
                      {ep.parameters && ep.parameters.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
                            Request Parameters
                          </h4>
                          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs font-mono">
                              <thead className="border-b border-slate-200 bg-slate-50 text-slate-900 font-bold">
                                <tr>
                                  <th className="px-3 py-2">Parameter</th>
                                  <th className="px-3 py-2">In</th>
                                  <th className="px-3 py-2">Type</th>
                                  <th className="px-3 py-2">Required</th>
                                  <th className="px-3 py-2">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-600">
                                {ep.parameters.map((p) => (
                                  <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-3 py-2 font-bold text-slate-900">{p.name}</td>
                                    <td className="px-3 py-2 text-slate-500">{p.in}</td>
                                    <td className="px-3 py-2 text-emerald-600 font-semibold">{p.type}</td>
                                    <td className="px-3 py-2">
                                      {p.required ? (
                                        <span className="font-bold text-rose-600">required</span>
                                      ) : (
                                        <span className="text-slate-400">optional</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 font-sans text-xs text-slate-900">{p.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Request Body Specification */}
                      {ep.requestBody && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
                            Request Body Schema ({ep.requestBody.contentType})
                          </h4>
                          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-900 overflow-x-auto">
                            <pre>{JSON.stringify(ep.requestBody.defaultPayload, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      {/* Expected Response Schemas (200, 400, 429) */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
                          Response Schemas &amp; Examples
                        </h4>
                        
                        <div className="space-y-2.5">
                          {ep.responses.map((resp) => (
                            <div key={resp.status} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono font-bold rounded px-1.5 py-0.5 text-[10px] ${
                                    resp.status === 200 || resp.status === 201 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                                    resp.status === 429 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 
                                    'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    HTTP {resp.status}
                                  </span>
                                  <span className="font-semibold text-slate-900 text-xs font-sans">{resp.description}</span>
                                </div>
                                <button
                                  onClick={() => handleCopy(`${ep.id}-${resp.status}`, JSON.stringify(resp.example, null, 2))}
                                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px] font-mono transition-colors cursor-pointer"
                                >
                                  {copiedMap[`${ep.id}-${resp.status}`] ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                  <span>{copiedMap[`${ep.id}-${resp.status}`] ? 'Copied' : 'Copy JSON'}</span>
                                </button>
                              </div>
                              <pre className="p-3 font-mono text-xs text-slate-900 bg-white overflow-x-auto max-h-60">
                                <code>{JSON.stringify(resp.example, null, 2)}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Multi-Language Code Snippets */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
                            Client Implementation Snippet
                          </h4>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-mono">Language:</span>
                            <select
                              value={lang}
                              onChange={(e) => setActiveCodeTab(prev => ({ ...prev, [ep.id]: e.target.value as any }))}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer font-mono"
                            >
                              <option value="curl">cURL</option>
                              <option value="javascript">JavaScript / Node.js</option>
                              <option value="python">Python</option>
                              <option value="go">Go</option>
                              <option value="rust">Rust</option>
                              <option value="php">PHP</option>
                            </select>
                          </div>
                        </div>

                        <div className="relative">
                          <pre className="rounded-xl border border-slate-200 bg-white p-3.5 font-mono text-xs text-slate-900 overflow-x-auto">
                            <code>{generateCodeSnippet(ep, lang)}</code>
                          </pre>
                          <button
                            onClick={() => handleCopy(`${ep.id}-code`, generateCodeSnippet(ep, lang))}
                            className="absolute top-2.5 right-2.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer font-mono shadow-xs"
                          >
                            {copiedMap[`${ep.id}-code`] ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedMap[`${ep.id}-code`] ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: ARCHITECTURE, AUTHENTICATION & SECURITY HEADERS */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-8">
          
          {/* Rate Limiting & Quota Architecture */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-amber-600">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-sans">Sliding Rate Limiter &amp; Quota Tiers</h3>
                <p className="text-xs text-slate-600 font-sans">High-precision sliding window enforcement</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              CatalystLab protects infrastructure using sliding token bucket rate limits per client IP or authenticated Firebase UID. Daily quotas reset at 00:00:00 UTC.
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <span className="font-semibold text-slate-900">Anonymous Visitor</span>
                <span className="text-slate-900 font-bold">5 audits / day</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <span className="font-semibold text-slate-900">Authenticated User (Google SSO)</span>
                <span className="text-slate-900 font-bold">10 audits / day</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <span className="font-semibold text-slate-900">Enterprise &amp; Superadmin</span>
                <span className="text-emerald-700 font-bold">Unlimited Scans</span>
              </div>
            </div>
          </div>

          {/* OWASP Security & Defense in Depth */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-sans">OWASP Security &amp; Response Headers</h3>
                <p className="text-xs text-slate-600 font-sans">Enterprise telemetry security posture</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Every API gateway response enforces strict transport security, anti-sniffing, and frame ancestor validation headers.
            </p>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-slate-900 text-[11px] overflow-x-auto">
                Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-slate-900 text-[11px] overflow-x-auto">
                X-Content-Type-Options: nosniff
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-slate-900 text-[11px] overflow-x-auto">
                Referrer-Policy: strict-origin-when-cross-origin
              </div>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
};

export default ApiDocsPage;
