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
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background text-foreground">
 {/* Top Banner Hero */}
 <div className="border-b border-border bg-background pt-12 pb-14">
 <div className="ds-page-shell">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
 <div className="space-y-4 max-w-2xl">
 <div className="inline-flex items-center gap-2 rounded-full border border-[#00D2FF]/20 bg-[#00D2FF]/10 px-3 py-1 framer-micro-tag text-[#00D2FF]">
 <Code2 className="h-3.5 w-3.5"/>
 <span>REST API v1.0 • OpenAPI 3.1 Compliant</span>
 </div>
 <h1 className="framer-section-headline text-foreground">
 CatalystLab API Reference
 </h1>
 <p className="framer-body-text">
 Automate real-time web audits, performance telemetry, security validation, and AI search readiness directly from your backend services, CI/CD pipelines, and developer workflows.
 </p>
 </div>

 {/* Actions: Spec Downloads */}
 <div className="flex flex-wrap items-center gap-3">
 <button
 onClick={downloadOpenApi}
 className="ds-btn ds-btn-secondary text-xs"
 >
 <Download className="h-4 w-4 shrink-0 text-muted-foreground"/>
 <span>OpenAPI 3.1 (JSON)</span>
 </button>
 <button
 onClick={downloadPostman}
 className="ds-btn ds-btn-secondary text-xs"
 >
 <FileJson className="h-4 w-4 shrink-0 text-amber-400"/>
 <span>Postman Collection</span>
 </button>
 <Link
 to="/playground"
 className="ds-btn ds-btn-primary text-xs"
 >
 <Terminal className="h-4 w-4 shrink-0 text-emerald-400"/>
 <span>Open Playground</span>
 </Link>
 </div>
 </div>
 </div>
 </div>

 {/* Main Content Layout */}
 <div className="ds-page-shell lg: py-10">
 <div className="flex flex-col lg:flex-row gap-8">
 
 {/* Left Sidebar */}
 <ApiNavSidebar />

 {/* Right Main Body */}
 <div className="flex-1 space-y-10 min-w-0">
 
 {/* Quickstart Card */}
 <section className="ds-card p-6 sm:p-8 space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
 <div>
 <h2 className="framer-card-title text-foreground flex items-center gap-2">
 <Zap className="h-5 w-5 text-amber-400 shrink-0"/>
 <span>Quickstart Guide</span>
 </h2>
 <p className="framer-body-text text-xs mt-1">
 Execute your first diagnostic scan in seconds using your preferred language or cURL.
 </p>
 </div>

 {/* Dropdown Language Selector (No Tabview) */}
 <div className="flex items-center gap-2">
 <label htmlFor="quickstart-lang-select" className="ds-label">
 Language:
 </label>
 <select
 id="quickstart-lang-select"
 value={selectedLanguage}
 onChange={(e) => setSelectedLanguage(e.target.value as any)}
 className="ds-select text-xs font-mono py-1 min-h-[2.25rem] w-auto"
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
 <div className="relative rounded-2xl bg-black/80 p-4 text-xs font-mono text-muted-foreground overflow-x-auto scrollbar-none touch-pan-x shadow-inner border border-border/80">
 <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
 <span className="framer-micro-tag text-muted-foreground">
 POST /api/run-engine ({selectedLanguage.toUpperCase()})
 </span>
 <button
 onClick={() => handleCopy('quickstart', quickstartCode)}
 className="flex items-center gap-1 framer-micro-tag font-bold text-[#0066FF] hover:text-[#00D2FF] cursor-pointer"
 >
 {copiedKey === 'quickstart' ? (
 <>
 <Check className="h-3.5 w-3.5 text-emerald-400"/>
 <span className="text-emerald-400">Copied</span>
 </>
 ) : (
 <>
 <Copy className="h-3.5 w-3.5"/>
 <span>Copy Snippet</span>
 </>
 )}
 </button>
 </div>
 <pre className="text-foreground whitespace-pre leading-relaxed font-mono">
 {quickstartCode}
 </pre>
 </div>
 </section>

 {/* Authentication & Base URL Specifications */}
 <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="ds-card p-6 space-y-3">
 <div className="flex items-center gap-2.5">
 <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
 <Server className="h-5 w-5"/>
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
 {copiedKey === 'baseurl' ? <Check className="h-3.5 w-3.5 text-emerald-600"/> : <Copy className="h-3.5 w-3.5"/>}
 </button>
 </div>
 </div>

 <div className="ds-card p-6 space-y-3">
 <div className="flex items-center gap-2.5">
 <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
 <Key className="h-5 w-5"/>
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
 <h2 className="framer-section-headline text-foreground">Browse by Category</h2>
 <p className="framer-body-text text-xs mt-1">Explore dedicated documentation pages for each API cluster</p>
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
 className="ds-card group p-5 flex flex-col ds-card-interactive"
 >
 <div>
 <div className="flex items-center justify-between mb-3">
 <span className="framer-micro-tag text-muted-foreground">
 {endpointsInCat.length} Endpoints
 </span>
 <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all"/>
 </div>
 <h3 className="framer-card-title text-foreground group-hover:text-[#0066FF] transition-colors">
 {cat}
 </h3>
 <p className="framer-body-text text-xs mt-1 line-clamp-2">
 {endpointsInCat[0]?.description || 'API endpoints for ' + cat}
 </p>
 </div>
 <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-semibold text-[#0066FF]">
 <span>View Documentation</span>
 <ArrowRight className="h-3.5 w-3.5 shrink-0"/>
 </div>
 </Link>
 );
 })}
 </div>
 </section>

 {/* Search & All Endpoints Index */}
 <section className="ds-card p-6 sm:p-8 space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="framer-section-headline text-foreground">All Available Endpoints</h2>
 <p className="framer-body-text text-xs mt-1">Direct links to dedicated endpoint reference specifications</p>
 </div>
 
 {/* Search Bar */}
 <div className="relative w-full sm:w-72">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search endpoints..."
 className="ds-input pl-9 text-xs"
 />
 </div>
 </div>

 <div className="space-y-3">
 {filteredEndpoints.map((ep) => {
 const catSlug = categorySlugMap[ep.category] || 'engines';
 return (
 <div
 key={ep.id}
 className="ds-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 ds-card-interactive"
 >
 <div className="flex items-start sm:items-center gap-3 min-w-0">
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 border ${
 ep.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
 ep.method === 'GET' ? 'bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20' :
 ep.method === 'DELETE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
 }`}>
 {ep.method}
 </span>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <span className="font-mono text-xs font-bold text-foreground truncate">
 {ep.path}
 </span>
 <span className="framer-micro-tag px-2 py-0.5 rounded bg-white/5 text-muted-foreground shrink-0">
 {ep.category}
 </span>
 </div>
 <p className="framer-body-text text-xs mt-0.5 truncate">
 {ep.summary}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
 <Link
 to={`/api-reference/category/${catSlug}#${ep.id}`}
 className="ds-btn ds-btn-secondary text-xs"
 >
 <span>Spec</span>
 <ChevronRight className="h-3.5 w-3.5 shrink-0"/>
 </Link>
 {ep.engineId && (
 <Link
 to={`/playground/${ep.engineId}`}
 className="ds-btn ds-btn-primary text-xs"
 >
 <Terminal className="h-3 w-3 shrink-0 text-white"/>
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
