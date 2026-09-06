import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
 Code2, 
 Terminal, 
 Copy, 
 Check, 
 ExternalLink, 
 ShieldCheck, 
 Clock, 
 Layers, 
 Key, 
 ArrowLeft,
 ChevronRight,
 Server,
 FileJson
} from 'lucide-react';
import { 
 API_ENDPOINTS, 
 API_CATEGORIES, 
 ApiEndpointSpec, 
 generateCodeSnippet 
} from '../../data/apiSpecs';
import { ApiNavSidebar, slugToCategoryMap, categorySlugMap } from '../../components/api/ApiNavSidebar';

export const ApiCategoryPage: React.FC = () => {
 const { categorySlug } = useParams<{ categorySlug: string }>();
 
 // Find the category name
 const categoryName = categorySlug ? slugToCategoryMap[categorySlug] : undefined;

 // Track code language per endpoint using state dictionary
 const [langMap, setLangMap] = useState<Record<string, 'curl' | 'javascript' | 'python' | 'go' | 'rust' | 'php'>>({});
 const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

 if (!categoryName) {
 return <Navigate to="/api-reference"replace />;
 }

 const endpoints = API_ENDPOINTS.filter(ep => ep.category === categoryName);

 const handleCopy = (id: string, text: string) => {
 navigator.clipboard.writeText(text);
 setCopiedMap(prev => ({ ...prev, [id]: true }));
 setTimeout(() => {
 setCopiedMap(prev => ({ ...prev, [id]: false }));
 }, 2000);
 };

 const getLanguage = (endpointId: string) => {
 return langMap[endpointId] || 'curl';
 };

 const setLanguage = (endpointId: string, lang: 'curl' | 'javascript' | 'python' | 'go' | 'rust' | 'php') => {
 setLangMap(prev => ({ ...prev, [endpointId]: lang }));
 };

 return (
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background text-foreground">
 {/* Category Header */}
 <div className="border-b border-border bg-background pt-10 pb-12">
 <div className="ds-page-shell">
 <div className="space-y-3">
 
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="framer-section-headline text-foreground">
 {categoryName}
 </h1>
 <p className="framer-body-text mt-1 max-w-2xl">
 Explore endpoint specifications, query schemas, and runnable code generators for {categoryName.toLowerCase()}.
 </p>
 </div>

 <div className="flex items-center gap-2">
 <Link
 to="/api-reference"
 className="ds-btn ds-btn-secondary text-xs"
 >
 <ArrowLeft className="h-3.5 w-3.5 shrink-0"/>
 <span>All Categories</span>
 </Link>
 <Link
 to="/playground"
 className="ds-btn ds-btn-primary text-xs"
 >
 <Terminal className="h-3.5 w-3.5 shrink-0 text-white"/>
 <span>Open Playground</span>
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Main Content Layout */}
 <div className="ds-page-shell lg: py-10">
 <div className="flex flex-col lg:flex-row gap-8">
 
 {/* Sidebar */}
 <ApiNavSidebar />

 {/* Endpoints List */}
 <div className="flex-1 space-y-10 min-w-0">
 {endpoints.length === 0 ? (
 <div className="ds-card p-12 text-center text-muted-foreground">
 No endpoints found in this category.
 </div>
 ) : (
 endpoints.map((ep) => {
 const currentLang = getLanguage(ep.id);
 const snippet = generateCodeSnippet(ep, currentLang);

 return (
 <article
 key={ep.id}
 id={ep.id}
 className="ds-card p-6 sm:p-8 space-y-6"
 >
 {/* Endpoint Header */}
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
 <div className="space-y-1">
 <div className="flex flex-wrap items-center gap-2.5">
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 border ${
 ep.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
 ep.method === 'GET' ? 'bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20' :
 ep.method === 'DELETE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
 }`}>
 {ep.method}
 </span>
 <span className="font-mono text-sm font-bold text-foreground">
 {ep.path}
 </span>
 </div>
 <h2 className="framer-card-title text-foreground">
 {ep.summary}
 </h2>
 </div>

 {/* Right Action: Playground Quick Launch */}
 {ep.engineId && (
 <Link
 to={`/playground/${ep.engineId}`}
 className="ds-btn ds-btn-secondary text-xs shrink-0 self-start lg:self-auto"
 >
 <Terminal className="h-3.5 w-3.5 text-emerald-400 shrink-0"/>
 <span>Test in Playground</span>
 </Link>
 )}
 </div>

 <p className="framer-body-text">
 {ep.description}
 </p>

 {/* Metadata Pill Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
 <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground font-mono">
 <Key className="h-4 w-4 text-emerald-400 shrink-0"/>
 <span className="truncate"><strong>Auth:</strong> {ep.auth}</span>
 </div>
 <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground font-mono">
 <Clock className="h-4 w-4 text-[#00D2FF] shrink-0"/>
 <span className="truncate"><strong>Rate Limit:</strong> {ep.rateLimit}</span>
 </div>
 </div>

 {/* Parameters Table if applicable */}
 {ep.parameters && ep.parameters.length > 0 && (
 <div className="space-y-3">
 <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
 Query / Path Parameters
 </h3>
 <div className="overflow-x-auto scrollbar-none touch-pan-x rounded-2xl border border-border">
 <table className="w-full text-left text-xs"aria-label="Query parameters">
 <thead className="bg-muted border-b border-border text-muted-foreground font-mono">
 <tr>
 <th className="p-3">Parameter</th>
 <th className="p-3">Type</th>
 <th className="p-3">In</th>
 <th className="p-3">Required</th>
 <th className="p-3">Description</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 font-mono text-muted-foreground">
 {ep.parameters.map((p) => (
 <tr key={p.name} className="hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
 <td className="p-3 font-bold text-foreground">{p.name}</td>
 <td className="p-3 text-sky-700">{p.type}</td>
 <td className="p-3 text-muted-foreground">{p.in}</td>
 <td className="p-3">
 {p.required ? (
 <span className="text-rose-600 font-bold">Yes</span>
 ) : (
 <span className="text-muted-foreground">Optional</span>
 )}
 </td>
 <td className="p-3 font-sans text-muted-foreground">{p.description}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Request Body Specification */}
 {ep.requestBody && (
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
 Request Body ({ep.requestBody.contentType})
 </h3>
 {ep.requestBody.required && (
 <span className="text-xs font-bold text-rose-600">Required</span>
 )}
 </div>
 <p className="text-xs text-muted-foreground">{ep.requestBody.description}</p>
 <div className="rounded-2xl bg-background p-4 text-xs font-mono text-muted-foreground overflow-x-auto scrollbar-none touch-pan-x border border-border">
 <pre className="text-emerald-400">
 {JSON.stringify(ep.requestBody.defaultPayload, null, 2)}
 </pre>
 </div>
 </div>
 )}

 {/* Code Snippet Box with Dropdown Selector (No Tabviews) */}
 <div className="space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
 Code Generator
 </h3>

 <div className="flex items-center gap-2">
 <label htmlFor={`lang-${ep.id}`} className="ds-label">
 Client:
 </label>
 <select
 id={`lang-${ep.id}`}
 value={currentLang}
 onChange={(e) => setLanguage(ep.id, e.target.value as any)}
 className="ds-select text-xs font-mono py-1 min-h-[2.25rem] w-auto"
 >
 <option value="curl">cURL (Bash)</option>
 <option value="javascript">JavaScript (Fetch)</option>
 <option value="python">Python (Requests)</option>
 <option value="go">Go (Net/HTTP)</option>
 <option value="rust">Rust (Reqwest)</option>
 <option value="php">PHP (cURL)</option>
 </select>

 <button
 onClick={() => handleCopy(ep.id, snippet)}
 className="ds-btn ds-btn-secondary text-xs"
 >
 {copiedMap[ep.id] ? (
 <>
 <Check className="h-3.5 w-3.5 text-emerald-400"/>
 <span className="text-emerald-400">Copied</span>
 </>
 ) : (
 <>
 <Copy className="h-3.5 w-3.5"/>
 <span>Copy</span>
 </>
 )}
 </button>
 </div>
 </div>

 <div className="rounded-2xl bg-black/80 p-4 text-xs font-mono text-muted-foreground overflow-x-auto scrollbar-none touch-pan-x border border-border/80">
 <pre className="text-[#00D2FF] whitespace-pre leading-relaxed">
 {snippet}
 </pre>
 </div>
 </div>

 {/* Response Schema & Example */}
 {ep.responses && ep.responses.length > 0 && (
 <div className="space-y-3">
 <h3 className="framer-micro-tag text-muted-foreground">
 Response Payload (Status {ep.responses[0].status})
 </h3>
 <p className="framer-body-text text-xs">{ep.responses[0].description}</p>
 <div className="rounded-2xl bg-black/80 p-4 text-xs font-mono text-muted-foreground overflow-x-auto scrollbar-none touch-pan-x border border-border/80">
 <pre className="text-amber-300">
 {JSON.stringify(ep.responses[0].example, null, 2)}
 </pre>
 </div>
 </div>
 )}
 </article>
 );
 })
 )}
 </div>
 </div>
 </div>
 </div>
 );
};
