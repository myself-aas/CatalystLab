import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowRight,
  Server,
  Activity,
  Cpu,
  Key,
  BookOpen
} from 'lucide-react';
import { 
  API_ENDPOINTS, 
  API_CATEGORIES, 
  generateCodeSnippet, 
  generateOpenApiSpec, 
  generatePostmanCollection 
} from '../../data/apiSpecs';
import { ApiNavSidebar, categorySlugMap } from '../../components/api/ApiNavSidebar';

export const ApiOverviewPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'javascript' | 'python' | 'go' | 'rust' | 'php'>('curl');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sampleEndpoint = API_ENDPOINTS[0];
  const quickstartCode = generateCodeSnippet(sampleEndpoint, selectedLanguage);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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

  const filteredEndpoints = API_ENDPOINTS.filter(ep => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ep.summary.toLowerCase().includes(query) ||
      ep.path.toLowerCase().includes(query) ||
      ep.category.toLowerCase().includes(query) ||
      ep.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Banner Hero */}
      <div className="border-b border-border bg-background pt-12 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-mono font-semibold text-sky-800">
                <Code2 className="h-3.5 w-3.5" />
                <span>REST API v1.0 • OpenAPI 3.1 Compliant</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                CatalystLab API Reference
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Automate real-time web audits, performance telemetry, security validation, and AI search readiness directly from your backend services, CI/CD pipelines, and developer workflows.
              </p>
            </div>

            {/* Actions: Spec Downloads */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={downloadOpenApi}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted hover:border-gray-400 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>OpenAPI 3.1 (JSON)</span>
              </button>
              <button
                onClick={downloadPostman}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted hover:border-gray-400 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FileJson className="h-4 w-4 text-amber-600" />
                <span>Postman Collection</span>
              </button>
              <Link
                to="/playground"
                className="inline-flex items-center gap-2 rounded-xl bg-background px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Open Playground</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <ApiNavSidebar />

          {/* Right Main Body */}
          <div className="flex-1 space-y-10 min-w-0">
            
            {/* Quickstart Card */}
            <section className="rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <span>Quickstart Guide</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Execute your first diagnostic scan in seconds using your preferred language or cURL.
                  </p>
                </div>

                {/* Dropdown Language Selector (No Tabview) */}
                <div className="flex items-center gap-2">
                  <label htmlFor="quickstart-lang-select" className="text-xs font-semibold text-muted-foreground">
                    Language:
                  </label>
                  <select
                    id="quickstart-lang-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as any)}
                    className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground shadow-sm focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="curl">cURL (Bash)</option>
                    <option value="javascript">JavaScript (Fetch)</option>
                    <option value="python">Python (Requests)</option>
                    <option value="go">Go (Net/HTTP)</option>
                    <option value="rust">Rust (Reqwest)</option>
                    <option value="php">PHP (cURL)</option>
                  </select>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="relative rounded-2xl bg-background p-4 text-xs font-mono text-muted-foreground overflow-x-auto shadow-inner border border-border">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold">
                    POST /api/run-engine ({selectedLanguage.toUpperCase()})
                  </span>
                  <button
                    onClick={() => handleCopy('quickstart', quickstartCode)}
                    className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {copiedKey === 'quickstart' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Snippet</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-foreground whitespace-pre leading-relaxed">
                  {quickstartCode}
                </pre>
              </div>
            </section>

            {/* Authentication & Base URL Specifications */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-border bg-background p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
                    <Server className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Base URL</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  All REST API endpoints are hosted securely with HTTPS encryption across global Anycast edge nodes:
                </p>
                <div className="p-3 rounded-xl bg-muted border border-border font-mono text-xs font-bold text-foreground flex items-center justify-between">
                  <span>https://api.catalystlab.io/v1</span>
                  <button
                    onClick={() => handleCopy('baseurl', 'https://api.catalystlab.io/v1')}
                    className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Copy Base URL"
                  >
                    {copiedKey === 'baseurl' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-background p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Key className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Authentication</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pass your API key in request headers for authenticated rate limits & cloud persistence:
                </p>
                <div className="p-3 rounded-xl bg-muted border border-border font-mono text-xs text-muted-foreground space-y-1">
                  <div><strong>Authorization:</strong> Bearer &lt;YOUR_API_KEY&gt;</div>
                  <div><strong>X-API-Key:</strong> &lt;YOUR_API_KEY&gt;</div>
                </div>
              </div>
            </section>

            {/* Categories Directory Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Browse by Category</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Explore dedicated documentation pages for each API cluster</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {API_CATEGORIES.map((cat) => {
                  const slug = categorySlugMap[cat] || 'engines';
                  const endpointsInCat = API_ENDPOINTS.filter(e => e.category === cat);

                  return (
                    <Link
                      key={cat}
                      to={`/api-reference/category/${slug}`}
                      className="group rounded-2xl border border-border bg-background p-5 shadow-sm hover:shadow-md hover:border-border transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
                            {endpointsInCat.length} Endpoints
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        </div>
                        <h3 className="text-base font-bold text-foreground group-hover:text-sky-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {cat}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {endpointsInCat[0]?.description || 'API endpoints for ' + cat}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-semibold text-sky-700">
                        <span>View Documentation</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Search & All Endpoints Index */}
            <section className="rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">All Available Endpoints</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Direct links to dedicated endpoint reference specifications</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search endpoints..."
                    className="w-full rounded-xl border border-border pl-9 pr-4 py-2 text-xs font-medium text-foreground placeholder-gray-400 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredEndpoints.map((ep) => {
                  const catSlug = categorySlugMap[ep.category] || 'engines';
                  return (
                    <div
                      key={ep.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-muted/50 p-4 hover:bg-background hover:border-border hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black uppercase shrink-0 ${
                          ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          ep.method === 'GET' ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                          ep.method === 'DELETE' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {ep.method}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground truncate">
                              {ep.path}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent text-muted-foreground shrink-0">
                              {ep.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {ep.summary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Link
                          to={`/api-reference/category/${catSlug}#${ep.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span>Spec</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                        {ep.engineId && (
                          <Link
                            to={`/playground/${ep.engineId}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-background px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Terminal className="h-3 w-3 text-emerald-400" />
                            <span>Test Live</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
