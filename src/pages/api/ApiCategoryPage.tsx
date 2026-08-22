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
    return <Navigate to="/api-reference" replace />;
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
    <div className="min-h-screen bg-[#f4f6fa] text-[#0b192c]">
      {/* Category Header */}
      <div className="border-b border-[#e2e8f0] bg-white pt-10 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <Link to="/api-reference" className="hover:text-gray-900 transition-colors">
                API Reference
              </Link>
              <span>/</span>
              <span className="text-[#0b192c] font-bold">{categoryName}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#0b192c]">
                  {categoryName}
                </h1>
                <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                  Explore endpoint specifications, query schemas, and runnable code generators for {categoryName.toLowerCase()}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/api-reference"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>All Categories</span>
                </Link>
                <Link
                  to="/playground"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#152238] transition-colors shadow-sm"
                >
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Open Playground</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <ApiNavSidebar />

          {/* Endpoints List */}
          <div className="flex-1 space-y-10 min-w-0">
            {endpoints.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500">
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
                    className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24"
                  >
                    {/* Endpoint Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black uppercase ${
                            ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            ep.method === 'GET' ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                            ep.method === 'DELETE' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#0b192c]">
                            {ep.path}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-[#0b192c]">
                          {ep.summary}
                        </h2>
                      </div>

                      {/* Right Action: Playground Quick Launch */}
                      {ep.engineId && (
                        <Link
                          to={`/playground/${ep.engineId}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shrink-0 self-start lg:self-auto"
                        >
                          <Terminal className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Test in Playground</span>
                        </Link>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed">
                      {ep.description}
                    </p>

                    {/* Metadata Pill Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-mono">
                        <Key className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="truncate"><strong>Auth:</strong> {ep.auth}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-mono">
                        <Clock className="h-4 w-4 text-sky-600 shrink-0" />
                        <span className="truncate"><strong>Rate Limit:</strong> {ep.rateLimit}</span>
                      </div>
                    </div>

                    {/* Parameters Table if applicable */}
                    {ep.parameters && ep.parameters.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                          Query / Path Parameters
                        </h3>
                        <div className="overflow-x-auto rounded-2xl border border-gray-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-mono">
                              <tr>
                                <th className="p-3">Parameter</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">In</th>
                                <th className="p-3">Required</th>
                                <th className="p-3">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-mono text-gray-700">
                              {ep.parameters.map((p) => (
                                <tr key={p.name} className="hover:bg-gray-50/50">
                                  <td className="p-3 font-bold text-[#0b192c]">{p.name}</td>
                                  <td className="p-3 text-sky-700">{p.type}</td>
                                  <td className="p-3 text-gray-500">{p.in}</td>
                                  <td className="p-3">
                                    {p.required ? (
                                      <span className="text-rose-600 font-bold">Yes</span>
                                    ) : (
                                      <span className="text-gray-400">Optional</span>
                                    )}
                                  </td>
                                  <td className="p-3 font-sans text-gray-600">{p.description}</td>
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
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                            Request Body ({ep.requestBody.contentType})
                          </h3>
                          {ep.requestBody.required && (
                            <span className="text-xs font-bold text-rose-600">Required</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{ep.requestBody.description}</p>
                        <div className="rounded-2xl bg-[#0b192c] p-4 text-xs font-mono text-gray-200 overflow-x-auto border border-[#415a77]/30">
                          <pre className="text-emerald-400">
                            {JSON.stringify(ep.requestBody.defaultPayload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Code Snippet Box with Dropdown Selector (No Tabviews) */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                          Code Generator
                        </h3>

                        <div className="flex items-center gap-2">
                          <label htmlFor={`lang-${ep.id}`} className="text-xs font-semibold text-gray-600">
                            Client:
                          </label>
                          <select
                            id={`lang-${ep.id}`}
                            value={currentLang}
                            onChange={(e) => setLanguage(ep.id, e.target.value as any)}
                            className="rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-800 shadow-sm focus:border-sky-500 focus:outline-none cursor-pointer"
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
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer ml-1"
                          >
                            {copiedMap[ep.id] ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#0b192c] p-4 text-xs font-mono text-gray-200 overflow-x-auto border border-[#415a77]/30">
                        <pre className="text-sky-300 whitespace-pre leading-relaxed">
                          {snippet}
                        </pre>
                      </div>
                    </div>

                    {/* Response Schema & Example */}
                    {ep.responses && ep.responses.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                          Response Payload (Status {ep.responses[0].status})
                        </h3>
                        <p className="text-xs text-gray-600">{ep.responses[0].description}</p>
                        <div className="rounded-2xl bg-[#0b192c] p-4 text-xs font-mono text-gray-200 overflow-x-auto border border-[#415a77]/30">
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
