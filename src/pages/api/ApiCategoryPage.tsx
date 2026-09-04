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
 <div className="min-h-screen bg-background text-foreground">
 {/* Category Header */}
 <div className="border-b border-border bg-background pt-10 pb-12">
 <div className="ds-page-shell: lg:">
 <div className="space-y-3">
 
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl sm:text-4xl font-black text-foreground">
 {categoryName}
 </h1>
 <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
 Explore endpoint specifications, query schemas, and runnable code generators for {categoryName.toLowerCase()}.
 </p>
 </div>

 <div className="flex items-center gap-2">
 <Link
 to="/api-reference"
 className="ds-card items-center gap-1.5 text-xs font-semibold text-muted-foreground ds-card-interactive p-4"
 >
 <ArrowLeft className="h-3.5 w-3.5"/>
 <span>All Categories</span>
 </Link>
 <Link
 to="/playground"
 className="inline-flex items-center gap-1.5 rounded-xl bg-background .5 px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-muted transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
 >
 <Terminal className="h-3.5 w-3.5 text-emerald-400"/>
 <span>Open Playground</span>
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Main Content Layout */}
 <div className="ds-page-shell: lg: py-10">
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
 <span className={`.5 py-1 rounded-lg text-xs font-mono font-black uppercase ${
 ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
 ep.method === 'GET' ? 'bg-sky-100 text-sky-800 border border-sky-300' :
 ep.method === 'DELETE' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
 'bg-amber-100 text-amber-800 border border-amber-300'
 }`}>
 {ep.method}
 </span>
 <span className="font-mono text-sm font-bold text-foreground">
 {ep.path}
 </span>
 </div>
 <h2 className="text-lg font-bold text-foreground">
 {ep.summary}
 </h2>
 </div>

 {/* Right Action: Playground Quick Launch */}
 {ep.engineId && (
 <Link
 to={`/playground/${ep.engineId}`}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 .5 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shrink-0 self-start lg:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
 >
 <Terminal className="h-3.5 w-3.5 text-emerald-600"/>
 <span>Test in Playground</span>
 </Link>
 )}
 </div>

 <p className="text-sm text-muted-foreground leading-relaxed">
 {ep.description}
 </p>

 {/* Metadata Pill Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
 <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border text-muted-foreground font-mono">
 <Key className="h-4 w-4 text-emerald-600 shrink-0"/>
 <span className="truncate"><strong>Auth:</strong> {ep.auth}</span>
 </div>
 <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border text-muted-foreground font-mono">
 <Clock className="h-4 w-4 text-sky-600 shrink-0"/>
 <span className="truncate"><strong>Rate Limit:</strong> {ep.rateLimit}</span>
 </div>
 </div>

 {/* Parameters Table if applicable */}
 {ep.parameters && ep.parameters.length > 0 && (
 <div className="space-y-3">
 <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
 Query / Path Parameters
 </h3>
 <div className="overflow-x-auto rounded-2xl border border-border">
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
 <div className="rounded-2xl bg-background p-4 text-xs font-mono text-muted-foreground overflow-x-auto border border-border">
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
 <label htmlFor={`lang-${ep.id}`} className="text-xs font-semibold text-muted-foreground">
 Client:
 </label>
 <select
 id={`lang-${ep.id}`}
 value={currentLang}
 onChange={(e) => setLanguage(ep.id, e.target.value as any)}
 className="ds-card text-xs font-bold p-4"
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
 className="ds-card items-center gap-1.5 text-xs font-semibold text-muted-foreground ds-card-interactive p-4"
 >
 {copiedMap[ep.id] ? (
 <>
 <Check className="h-3.5 w-3.5 text-emerald-600"/>
 <span className="text-emerald-600">Copied</span>
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

 <div className="rounded-2xl bg-background p-4 text-xs font-mono text-muted-foreground overflow-x-auto border border-border">
 <pre className="text-sky-300 whitespace-pre leading-relaxed">
 {snippet}
 </pre>
 </div>
 </div>

 {/* Response Schema & Example */}
 {ep.responses && ep.responses.length > 0 && (
 <div className="space-y-3">
 <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
 Response Payload (Status {ep.responses[0].status})
 </h3>
 <p className="text-xs text-muted-foreground">{ep.responses[0].description}</p>
 <div className="rounded-2xl bg-background p-4 text-xs font-mono text-muted-foreground overflow-x-auto border border-border">
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
