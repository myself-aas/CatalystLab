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
    <div className="min-h-screen bg-white text-black font-mono selection:bg-black selection:text-white">
      <SEOHead
        title="REST API Documentation & Telemetry Reference — CatalystLab"
        description="Comprehensive programmatic OpenAPI 3.1 specification for all 8 CatalystLab diagnostic engines, master audit orchestration, and CI/CD quality gates."
        keywords={['CatalystLab API', 'telemetry REST API', 'OpenAPI 3.1', 'web diagnostics API', 'CI/CD performance gate API']}
        canonicalUrl="https://www.catalystlab.tech/api-docs"
      />

      {/* Top Banner Hero */}
      <section className="border-b border-gray-200 bg-gray-100 pt-10 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-bold text-accent-amber-strong uppercase tracking-wider">
                  <Terminal className="h-3.5 w-3.5" />
                  REST API v2.4.0
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  OpenAPI 3.1 Spec
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-accent-emerald/40 bg-white px-2.5 py-0.5 text-xs font-bold text-accent-emerald">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Production Ready
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-black font-sans">
                REST API Documentation &amp; Telemetry Reference
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                Programmatic REST endpoints for all 8 diagnostic engines, parallel master audit orchestration, domain permalink dossiers, CI/CD quality gates, webhook dispatchers, and live telemetry sockets.
              </p>
            </div>

            {/* Quick Export CTAs */}
            <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => {
                  const el = document.getElementById('api-playground-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-black-hover border border-brand-periwinkle/30 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="h-3.5 w-3.5 text-accent-amber-strong" />
                <span>Open API Playground</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={downloadOpenApi}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-black hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <Download className="h-3.5 w-3.5 text-accent-amber-strong" />
                  <span>OpenAPI 3.1</span>
                </button>

                <button
                  onClick={downloadPostman}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-black hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <FileJson className="h-3.5 w-3.5 text-accent-amber" />
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
            <h2 className="text-lg sm:text-xl font-extrabold text-black flex items-center gap-2 font-sans">
              <Zap className="h-4 w-4 text-accent-amber-strong" />
              <span>Interactive API Playground &amp; Sandbox</span>
            </h2>
            <p className="text-xs text-gray-600 font-sans">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-black flex items-center gap-2 font-sans">
                <Layers className="h-4 w-4 text-accent-amber-strong" />
                <span>Endpoint Reference Catalog</span>
              </h2>
              <p className="text-xs text-gray-600 font-sans">
                Browse comprehensive request parameters, expected response schemas, and multi-language code snippets.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints or paths..."
                className="w-full rounded-xl border border-gray-200 bg-white py-1.5 pl-9 pr-4 text-xs font-mono text-black placeholder:text-gray-500 focus:border-gray-200 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-black text-white border border-brand-periwinkle/30 shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-white'
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
                      ? 'bg-black text-white border border-brand-periwinkle/30 shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:text-white'
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
                      ? 'border-brand-periwinkle/40 bg-white shadow-xl' 
                      : 'border-gray-200 bg-white hover:border-gray-200 shadow-sm'
                  }`}
                >
                  {/* Collapsed Header Bar */}
                  <div 
                    onClick={() => setExpandedEndpointId(isExpanded ? null : ep.id)}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-mono font-bold uppercase shadow-xs ${
                        ep.method === 'POST' ? 'bg-black border border-brand-periwinkle/30 text-white' :
                        ep.method === 'GET' ? 'bg-emerald-950/70 border border-emerald-500/40 text-accent-emerald' :
                        ep.method === 'DELETE' ? 'bg-rose-950/70 border border-rose-500/40 text-rose-400' : 
                        'bg-amber-950/70 border border-amber-500/40 text-accent-amber'
                      }`}>
                        {ep.method}
                      </span>

                      <span className="font-mono text-xs sm:text-sm font-bold text-black truncate">
                        {ep.path}
                      </span>

                      <span className="hidden md:inline-block text-xs text-gray-600 truncate">
                        — {ep.summary}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block rounded-md bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        {ep.category}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToPlayground(ep.id);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-bold text-black hover:bg-black hover:text-white transition-all shadow-xs cursor-pointer"
                        title="Test in Playground"
                      >
                        <Play className="h-3 w-3 text-accent-amber-strong" />
                        <span>Test</span>
                      </button>

                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-5 sm:p-6 space-y-5 bg-gray-100/70 rounded-b-2xl">
                      
                      {/* Description & Rate Limit info */}
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-black leading-relaxed font-sans">
                          {ep.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-gray-600 flex items-center gap-1.5">
                            <Lock className="h-3 w-3 text-accent-amber-strong" />
                            <strong className="text-black">Auth:</strong> {ep.auth}
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-gray-600 flex items-center gap-1.5">
                            <Activity className="h-3 w-3 text-accent-amber" />
                            <strong className="text-black">Rate Limit:</strong> {ep.rateLimit}
                          </div>
                          {ep.tags.map(t => (
                            <span key={t} className="rounded-lg bg-white border border-gray-200 px-2 py-1 text-[11px] font-mono text-gray-600">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Request Parameters (Path & Query) */}
                      {ep.parameters && ep.parameters.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-accent-amber-strong font-sans">
                            Request Parameters
                          </h4>
                          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                            <table className="w-full text-left text-xs font-mono">
                              <thead className="border-b border-gray-200 bg-gray-100 text-black font-bold">
                                <tr>
                                  <th className="px-3 py-2">Parameter</th>
                                  <th className="px-3 py-2">In</th>
                                  <th className="px-3 py-2">Type</th>
                                  <th className="px-3 py-2">Required</th>
                                  <th className="px-3 py-2">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-brand-slate/20 text-gray-600">
                                {ep.parameters.map((p) => (
                                  <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2 font-bold text-accent-amber-strong">{p.name}</td>
                                    <td className="px-3 py-2 text-gray-500">{p.in}</td>
                                    <td className="px-3 py-2 text-accent-emerald">{p.type}</td>
                                    <td className="px-3 py-2">
                                      {p.required ? (
                                        <span className="font-bold text-rose-400">required</span>
                                      ) : (
                                        <span className="text-gray-500">optional</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 font-sans text-xs text-black">{p.description}</td>
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
                          <h4 className="text-xs font-bold uppercase tracking-wider text-accent-amber-strong font-sans">
                            Request Body Schema ({ep.requestBody.contentType})
                          </h4>
                          <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs font-mono text-accent-amber-strong overflow-x-auto">
                            <pre>{JSON.stringify(ep.requestBody.defaultPayload, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      {/* Expected Response Schemas (200, 400, 429) */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-accent-amber-strong font-sans">
                          Response Schemas &amp; Examples
                        </h4>
                        
                        <div className="space-y-2.5">
                          {ep.responses.map((resp) => (
                            <div key={resp.status} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-3 py-1.5 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono font-bold rounded px-1.5 py-0.5 text-[10px] ${
                                    resp.status === 200 || resp.status === 201 ? 'bg-emerald-950/80 text-accent-emerald border border-emerald-500/40' :
                                    resp.status === 429 ? 'bg-amber-950/80 text-accent-amber border border-amber-500/40' : 
                                    'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                                  }`}>
                                    HTTP {resp.status}
                                  </span>
                                  <span className="font-semibold text-black text-xs font-sans">{resp.description}</span>
                                </div>
                                <button
                                  onClick={() => handleCopy(`${ep.id}-${resp.status}`, JSON.stringify(resp.example, null, 2))}
                                  className="text-accent-amber-strong hover:text-white flex items-center gap-1 text-[11px] font-mono transition-colors cursor-pointer"
                                >
                                  {copiedMap[`${ep.id}-${resp.status}`] ? <Check className="h-3 w-3 text-accent-emerald" /> : <Copy className="h-3 w-3" />}
                                  <span>{copiedMap[`${ep.id}-${resp.status}`] ? 'Copied' : 'Copy JSON'}</span>
                                </button>
                              </div>
                              <pre className="p-3 font-mono text-xs text-black bg-white/80 overflow-x-auto max-h-60">
                                <code>{JSON.stringify(resp.example, null, 2)}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Multi-Language Code Snippets */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-accent-amber-strong font-sans">
                            Client Implementation Snippet
                          </h4>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-500 font-mono">Language:</span>
                            <select
                              value={lang}
                              onChange={(e) => setActiveCodeTab(prev => ({ ...prev, [ep.id]: e.target.value as any }))}
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-black focus:border-gray-200 focus:outline-none cursor-pointer font-mono"
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
                          <pre className="rounded-xl border border-gray-200 bg-white p-3.5 font-mono text-xs text-accent-amber-strong overflow-x-auto">
                            <code>{generateCodeSnippet(ep, lang)}</code>
                          </pre>
                          <button
                            onClick={() => handleCopy(`${ep.id}-code`, generateCodeSnippet(ep, lang))}
                            className="absolute top-2.5 right-2.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-black hover:bg-gray-50 transition flex items-center gap-1 cursor-pointer font-mono"
                          >
                            {copiedMap[`${ep.id}-code`] ? <Check className="h-3 w-3 text-accent-emerald" /> : <Copy className="h-3 w-3" />}
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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-8">
          
          {/* Rate Limiting & Quota Architecture */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-3.5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-accent-amber-strong">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-black font-sans">Sliding Rate Limiter &amp; Quota Tiers</h3>
                <p className="text-xs text-gray-600 font-sans">High-precision sliding window enforcement</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              CatalystLab protects infrastructure using sliding token bucket rate limits per client IP or authenticated Firebase UID. Daily quotas reset at 00:00:00 UTC.
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between rounded-xl bg-gray-100 border border-gray-200 p-2.5">
                <span className="font-semibold text-black">Anonymous Visitor</span>
                <span className="text-accent-amber-strong">5 audits / day</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-100 border border-gray-200 p-2.5">
                <span className="font-semibold text-black">Authenticated User (Google SSO)</span>
                <span className="text-accent-amber-strong">10 audits / day</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-100 border border-gray-200 p-2.5">
                <span className="font-semibold text-black">Enterprise &amp; Superadmin</span>
                <span className="text-accent-emerald font-bold">Unlimited Scans</span>
              </div>
            </div>
          </div>

          {/* OWASP Security & Defense in Depth */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-3.5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-accent-emerald">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-black font-sans">OWASP Security &amp; Response Headers</h3>
                <p className="text-xs text-gray-600 font-sans">Enterprise telemetry security posture</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Every API gateway response enforces strict transport security, anti-sniffing, and frame ancestor validation headers.
            </p>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="rounded-lg bg-white border border-gray-200 p-2 text-accent-amber-strong text-[11px] overflow-x-auto">
                Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
              </div>
              <div className="rounded-lg bg-white border border-gray-200 p-2 text-accent-amber-strong text-[11px] overflow-x-auto">
                X-Content-Type-Options: nosniff
              </div>
              <div className="rounded-lg bg-white border border-gray-200 p-2 text-accent-amber-strong text-[11px] overflow-x-auto">
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
