import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Code2, 
  Terminal, 
  Download, 
  FileJson, 
  Check, 
  Copy, 
  Search, 
  ShieldCheck, 
  Zap, 
  Layers, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Server, 
  Activity, 
  Cpu, 
  Flame, 
  Key, 
  Database,
  ArrowRight
} from 'lucide-react';
import { 
  API_ENDPOINTS, 
  API_CATEGORIES, 
  ApiEndpointSpec, 
  generateCodeSnippet, 
  generateOpenApiSpec, 
  generatePostmanCollection 
} from '../data/apiSpecs';
import { ApiPlayground } from '../components/api/ApiPlayground';

export const ApiDocsPage: React.FC = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEndpointId, setExpandedEndpointId] = useState<string | null>(API_ENDPOINTS[0].id);
  const [playgroundEndpointId, setPlaygroundEndpointId] = useState<string>(API_ENDPOINTS[0].id);
  
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
    <div className="min-h-screen bg-[#f4f6fa] text-[#0b192c]">
      {/* Top Banner Hero */}
      <div className="border-b border-[#e2e8f0] bg-white pt-12 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b192c] px-3 py-1 text-sm font-bold text-[#38bdf8]">
                  <Terminal className="h-3.5 w-3.5" />
                  REST API v2.4.0
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e2e8f0] px-3 py-1 text-sm font-semibold text-[#415a77]">
                  OpenAPI 3.1 Specification
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Zero-Mock Production Verified
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#0b192c] sm:text-4xl">
                CatalystLab API Documentation & Telemetry Reference
              </h1>
              <p className="text-base text-[#415a77] leading-relaxed">
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
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0b192c] px-5 py-2.5 text-sm font-bold text-[#38bdf8] shadow-md transition hover:bg-[#152238]"
              >
                <Play className="h-4 w-4" />
                <span>Open API Playground</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={downloadOpenApi}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-sm font-bold text-[#0b192c] shadow-sm hover:bg-[#f8fafc] transition"
                >
                  <Download className="h-3.5 w-3.5 text-[#3b82f6]" />
                  <span>OpenAPI Spec</span>
                </button>

                <button
                  onClick={downloadPostman}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-sm font-bold text-[#0b192c] shadow-sm hover:bg-[#f8fafc] transition"
                >
                  <FileJson className="h-3.5 w-3.5 text-[#f97316]" />
                  <span>Postman v2.1</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        
        {/* ========================================================================= */}
        {/* SECTION 1: EMBEDDED API TEST PLAYGROUND */}
        {/* ========================================================================= */}
        <section id="api-playground-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#0b192c] flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#38bdf8]" />
                Interactive API Playground & Verification Sandbox
              </h2>
              <p className="text-sm text-[#415a77]">
                Execute live HTTP requests against local or production sandboxes and inspect real response headers, timing, and schemas.
              </p>
            </div>
          </div>

          <ApiPlayground 
            initialEndpointId={playgroundEndpointId}
            onSelectEndpoint={(id) => setExpandedEndpointId(id)}
          />
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: ENDPOINT CATALOGUE & INTERACTIVE SPECIFICATION EXPLORER */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#0b192c] flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#3b82f6]" />
                Complete Endpoint Reference Catalog
              </h2>
              <p className="text-sm text-[#415a77]">
                Browse comprehensive request parameters, expected response schemas, and multi-language code snippets.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints, tags, or paths..."
                className="w-full rounded-xl border border-[#cbd5e1] bg-white py-2 pl-9 pr-4 text-sm font-semibold text-[#0b192c] shadow-sm focus:border-[#38bdf8] focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                selectedCategory === 'All'
                  ? 'bg-[#0b192c] text-white shadow-sm'
                  : 'bg-white border border-[#e2e8f0] text-[#415a77] hover:bg-[#f8fafc]'
              }`}
            >
              All Endpoints ({API_ENDPOINTS.length})
            </button>

            {API_CATEGORIES.map((category) => {
              const count = API_ENDPOINTS.filter(e => e.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                    selectedCategory === category
                      ? 'bg-[#0b192c] text-white shadow-sm'
                      : 'bg-white border border-[#e2e8f0] text-[#415a77] hover:bg-[#f8fafc]'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>

          {/* Endpoints List */}
          <div className="space-y-4">
            {filteredEndpoints.map((ep) => {
              const isExpanded = expandedEndpointId === ep.id;
              const lang = activeCodeTab[ep.id] || 'curl';

              return (
                <div
                  key={ep.id}
                  className={`rounded-2xl border transition-all ${
                    isExpanded 
                      ? 'border-[#0b192c]/40 bg-white shadow-lg ring-1 ring-[#0b192c]/10' 
                      : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1] shadow-sm'
                  }`}
                >
                  {/* Collapsed Header Bar */}
                  <div 
                    onClick={() => setExpandedEndpointId(isExpanded ? null : ep.id)}
                    className="flex flex-wrap items-center justify-between gap-4 p-5 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`rounded-lg px-2.5 py-1 text-sm font-mono font-bold uppercase text-white shadow-sm ${
                        ep.method === 'POST' ? 'bg-[#3b82f6]' :
                        ep.method === 'GET' ? 'bg-[#10b981]' :
                        ep.method === 'DELETE' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'
                      }`}>
                        {ep.method}
                      </span>

                      <span className="font-mono text-base font-bold text-[#0b192c] truncate">
                        {ep.path}
                      </span>

                      <span className="hidden md:inline-block text-sm text-[#64748b] truncate">
                        — {ep.summary}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-block rounded-md bg-[#f1f5f9] px-2.5 py-1 text-sm font-semibold text-[#415a77]">
                        {ep.category}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToPlayground(ep.id);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1 text-sm font-bold text-[#0b192c] hover:bg-[#0b192c] hover:text-[#38bdf8] transition shadow-sm"
                        title="Test in Playground"
                      >
                        <Play className="h-3 w-3" />
                        <span>Test</span>
                      </button>

                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-[#64748b]" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-[#64748b]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-t border-[#e2e8f0] p-6 space-y-6 bg-[#f8fafc]/50 rounded-b-2xl">
                      
                      {/* Description & Rate Limit info */}
                      <div className="space-y-2">
                        <p className="text-base text-[#0b192c] leading-relaxed">
                          {ep.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 text-sm">
                          <div className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[#415a77]">
                            <strong className="text-[#0b192c]">Authentication:</strong> {ep.auth}
                          </div>
                          <div className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[#415a77]">
                            <strong className="text-[#0b192c]">Rate Limiting:</strong> {ep.rateLimit}
                          </div>
                          {ep.tags.map(t => (
                            <span key={t} className="rounded-lg bg-[#e2e8f0]/60 px-2.5 py-1.5 text-sm font-mono text-[#415a77]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Request Parameters (Path & Query) */}
                      {ep.parameters && ep.parameters.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-[#415a77]">
                            Request Parameters
                          </h4>
                          <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
                            <table className="w-full text-left text-sm">
                              <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77]">
                                <tr>
                                  <th className="px-4 py-2 font-bold">Parameter</th>
                                  <th className="px-4 py-2 font-bold">In</th>
                                  <th className="px-4 py-2 font-bold">Type</th>
                                  <th className="px-4 py-2 font-bold">Required</th>
                                  <th className="px-4 py-2 font-bold">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#e2e8f0]">
                                {ep.parameters.map((p) => (
                                  <tr key={p.name}>
                                    <td className="px-4 py-2.5 font-mono font-bold text-[#0b192c]">{p.name}</td>
                                    <td className="px-4 py-2.5 font-mono text-[#64748b]">{p.in}</td>
                                    <td className="px-4 py-2.5 font-mono text-[#3b82f6]">{p.type}</td>
                                    <td className="px-4 py-2.5">
                                      {p.required ? (
                                        <span className="font-bold text-red-600">required</span>
                                      ) : (
                                        <span className="text-[#94a3b8]">optional</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5 text-[#415a77]">{p.description}</td>
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
                          <h4 className="text-sm font-bold uppercase tracking-wider text-[#415a77]">
                            Request Body Schema ({ep.requestBody.contentType})
                          </h4>
                          <div className="rounded-xl border border-[#cbd5e1] bg-[#0b192c] p-4 text-sm font-mono text-[#38bdf8]">
                            <pre>{JSON.stringify(ep.requestBody.defaultPayload, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      {/* Expected Response Schemas (200, 400, 429) */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[#415a77]">
                          Response Schemas & Examples
                        </h4>
                        
                        <div className="space-y-3">
                          {ep.responses.map((resp) => (
                            <div key={resp.status} className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden">
                              <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono font-bold rounded-md px-2 py-0.5 ${
                                    resp.status === 200 || resp.status === 201 ? 'bg-green-100 text-green-800' :
                                    resp.status === 429 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    HTTP {resp.status}
                                  </span>
                                  <span className="font-semibold text-[#0b192c]">{resp.description}</span>
                                </div>
                                <button
                                  onClick={() => handleCopy(`${ep.id}-${resp.status}`, JSON.stringify(resp.example, null, 2))}
                                  className="text-[#3b82f6] hover:underline flex items-center gap-1 text-sm"
                                >
                                  {copiedMap[`${ep.id}-${resp.status}`] ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                  <span>{copiedMap[`${ep.id}-${resp.status}`] ? 'Copied' : 'Copy JSON'}</span>
                                </button>
                              </div>
                              <pre className="p-4 font-mono text-sm text-[#0b192c] bg-white overflow-x-auto max-h-64">
                                <code>{JSON.stringify(resp.example, null, 2)}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Multi-Language Code Snippets */}
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-[#415a77]">
                            Client Implementation Snippet
                          </h4>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748b] font-medium">Format:</span>
                            <select
                              value={lang}
                              onChange={(e) => setActiveCodeTab(prev => ({ ...prev, [ep.id]: e.target.value as any }))}
                              className="rounded-lg border border-[#cbd5e1] bg-white px-2.5 py-1 text-xs font-semibold text-[#0b192c] focus:border-[#38bdf8] focus:outline-none"
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
                          <pre className="rounded-xl border border-[#cbd5e1] bg-[#0b192c] p-4 font-mono text-sm text-[#38bdf8] overflow-x-auto selection:bg-[#38bdf8]/30">
                            <code>{generateCodeSnippet(ep, lang)}</code>
                          </pre>
                          <button
                            onClick={() => handleCopy(`${ep.id}-code`, generateCodeSnippet(ep, lang))}
                            className="absolute top-3 right-3 rounded-lg border border-[#415a77]/40 bg-[#152238] px-2.5 py-1 text-sm text-[#38bdf8] hover:bg-[#1f314d] transition flex items-center gap-1"
                          >
                            {copiedMap[`${ep.id}-code`] ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
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
        {/* SECTION 3: ARCHITECTURE, AUTHENTICATION & CI/CD GATING GUIDES */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#e2e8f0] pt-10">
          
          {/* Rate Limiting & Quota Architecture */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#3b82f6]">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0b192c]">Sliding Rate Limiter & Quota Tiers</h3>
                <p className="text-sm text-[#415a77]">High-precision sliding window enforcement</p>
              </div>
            </div>

            <p className="text-sm text-[#415a77] leading-relaxed">
              CatalystLab protects infrastructure using sliding token bucket rate limits per client IP or authenticated Firebase UID. Daily quotas reset at 00:00:00 UTC.
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-[#f8fafc] p-2.5 font-mono">
                <span className="font-semibold text-[#0b192c]">Anonymous Visitor</span>
                <span className="text-[#3b82f6]">5 audits / day</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#f8fafc] p-2.5 font-mono">
                <span className="font-semibold text-[#0b192c]">Authenticated User (Google SSO)</span>
                <span className="text-[#3b82f6]">10 audits / day</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#f8fafc] p-2.5 font-mono">
                <span className="font-semibold text-[#0b192c]">Enterprise & Superadmin</span>
                <span className="text-green-600 font-bold">Unlimited Scans</span>
              </div>
            </div>
          </div>

          {/* OWASP Security & Defense in Depth */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#10b981]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0b192c]">OWASP Security & Response Headers</h3>
                <p className="text-sm text-[#415a77]">Enterprise telemetry security posture</p>
              </div>
            </div>

            <p className="text-sm text-[#415a77] leading-relaxed">
              Every API gateway response enforces strict transport security, anti-sniffing, and frame ancestor validation headers.
            </p>

            <div className="space-y-2 text-sm font-mono">
              <div className="rounded-lg bg-[#0b192c] p-2 text-[#38bdf8]">
                Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
              </div>
              <div className="rounded-lg bg-[#0b192c] p-2 text-[#38bdf8]">
                X-Content-Type-Options: nosniff
              </div>
              <div className="rounded-lg bg-[#0b192c] p-2 text-[#38bdf8]">
                Referrer-Policy: strict-origin-when-cross-origin
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};

export default ApiDocsPage;
