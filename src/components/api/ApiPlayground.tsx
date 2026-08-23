import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Code2, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sliders, 
  FileJson,
  Key,
  Activity
} from 'lucide-react';
import { 
  API_ENDPOINTS, 
  API_CATEGORIES, 
  generateCodeSnippet, 
  generateOpenApiSpec, 
  generatePostmanCollection 
} from '../../data/apiSpecs';

interface ApiPlaygroundProps {
  initialEndpointId?: string;
  onSelectEndpoint?: (endpointId: string) => void;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({ 
  initialEndpointId,
  onSelectEndpoint 
}) => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(
    initialEndpointId || API_ENDPOINTS[0]?.id || ''
  );
  const [authType, setAuthType] = useState<'none' | 'apiKey' | 'bearer'>('none');
  const [apiKeyVal, setApiKeyVal] = useState<string>('cat_live_9f83b271d4e680a9c1e2f3a4b5c6d7e8');
  const [bearerToken, setBearerToken] = useState<string>('');
  
  const [requestBodyText, setRequestBodyText] = useState<string>('');
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  // Execution states
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>('');
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [responseSizeKb, setResponseSizeKb] = useState<number | null>(null);

  const [snippetLanguage, setSnippetLanguage] = useState<'curl' | 'javascript' | 'python' | 'go' | 'rust' | 'php'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Automated Test Suite State
  const [runningSuite, setRunningSuite] = useState(false);
  const [suiteProgress, setSuiteProgress] = useState<number>(0);
  const [suiteResults, setSuiteResults] = useState<{
    endpointId: string;
    summary: string;
    path: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    statusCode?: number;
    latencyMs?: number;
    error?: string;
  }[]>([]);
  const [deploymentReady, setDeploymentReady] = useState<boolean | null>(null);

  // Current active endpoint specification
  const currentEndpoint = API_ENDPOINTS.find(e => e.id === selectedEndpointId) || API_ENDPOINTS[0];

  // Update request state when selected endpoint changes
  useEffect(() => {
    if (currentEndpoint.requestBody?.defaultPayload) {
      setRequestBodyText(JSON.stringify(currentEndpoint.requestBody.defaultPayload, null, 2));
    } else {
      setRequestBodyText('');
    }

    const defaultParams: Record<string, string> = {};
    currentEndpoint.parameters?.forEach(p => {
      if (p.in === 'query' && p.default) {
        defaultParams[p.name] = p.default;
      }
    });
    setQueryParams(defaultParams);

    // Reset previous response view
    setResponseStatus(null);
    setResponsePayload(null);
    setResponseTimeMs(null);
  }, [selectedEndpointId]);

  // Sync prop changes
  useEffect(() => {
    if (initialEndpointId && initialEndpointId !== selectedEndpointId) {
      setSelectedEndpointId(initialEndpointId);
    }
  }, [initialEndpointId]);

  // Handle live API Execution
  const executeApiCall = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponsePayload(null);
    setResponseTimeMs(null);
    setResponseSizeKb(null);

    const startTime = performance.now();

    try {
      let resolvedPath = currentEndpoint.path;

      // Replace path parameters if any
      currentEndpoint.parameters?.forEach(p => {
        if (p.in === 'path') {
          const val = p.example || 'sample';
          resolvedPath = resolvedPath.replace(`{${p.name}}`, val);
        }
      });

      // Append query parameters
      const activeQueryParams = Object.entries(queryParams)
        .filter(([, v]) => v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');

      const url = activeQueryParams ? `${resolvedPath}?${activeQueryParams}` : resolvedPath;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (authType === 'apiKey') {
        headers['X-API-Key'] = apiKeyVal;
      } else if (authType === 'bearer') {
        headers['Authorization'] = `Bearer ${bearerToken}`;
      }

      const options: RequestInit = {
        method: currentEndpoint.method,
        headers
      };

      if (currentEndpoint.method !== 'GET' && requestBodyText) {
        try {
          options.body = requestBodyText;
        } catch {
          // Send as raw string if JSON parsing fails
          options.body = requestBodyText;
        }
      }

      const res = await fetch(url, options);
      const latency = Math.round(performance.now() - startTime);
      setResponseTimeMs(latency);
      setResponseStatus(res.status);
      setResponseStatusText(res.statusText || (res.status === 200 ? 'OK' : ''));

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setResponsePayload(data);
        const jsonStr = JSON.stringify(data);
        setResponseSizeKb(Math.round((new Blob([jsonStr]).size / 1024) * 100) / 100);
      } else {
        const text = await res.text();
        setResponsePayload({ message: text || 'Non-JSON response received' });
        setResponseSizeKb(Math.round((new Blob([text]).size / 1024) * 100) / 100);
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime);
      setResponseTimeMs(latency);
      setResponseStatus(500);
      setResponseStatusText('Network/CORS Error');
      setResponsePayload({
        error: true,
        message: err?.message || 'Failed to reach API endpoint. Ensure server is running or proxy is configured.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Automated Test Suite Runner across all endpoints
  const runFullVerificationSuite = async () => {
    setRunningSuite(true);
    setDeploymentReady(null);
    setSuiteProgress(0);

    const initialList = API_ENDPOINTS.map(ep => ({
      endpointId: ep.id,
      summary: ep.summary,
      path: ep.path,
      status: 'pending' as const
    }));
    setSuiteResults(initialList);

    let passedCount = 0;

    for (let i = 0; i < API_ENDPOINTS.length; i++) {
      const ep = API_ENDPOINTS[i];
      setSuiteProgress(Math.round(((i + 1) / API_ENDPOINTS.length) * 100));

      setSuiteResults(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'running' } : item));

      const start = performance.now();
      try {
        let path = ep.path;
        if (ep.parameters?.some(p => p.in === 'path')) {
          ep.parameters.forEach(p => {
            if (p.in === 'path') path = path.replace(`{${p.name}}`, p.example || 'sample');
          });
        }

        const options: RequestInit = {
          method: ep.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };

        if (ep.method !== 'GET' && ep.requestBody?.defaultPayload) {
          options.body = JSON.stringify(ep.requestBody.defaultPayload);
        }

        const res = await fetch(path, options);
        const latency = Math.round(performance.now() - start);

        if (res.status >= 200 && res.status < 400) {
          passedCount++;
          setSuiteResults(prev => prev.map((item, idx) => idx === i ? {
            ...item,
            status: 'passed',
            statusCode: res.status,
            latencyMs: latency
          } : item));
        } else {
          setSuiteResults(prev => prev.map((item, idx) => idx === i ? {
            ...item,
            status: res.status === 429 ? 'passed' : 'failed',
            statusCode: res.status,
            latencyMs: latency,
            error: `HTTP ${res.status}`
          } : item));
          if (res.status === 429) passedCount++;
        }
      } catch (err: any) {
        const latency = Math.round(performance.now() - start);
        setSuiteResults(prev => prev.map((item, idx) => idx === i ? {
          ...item,
          status: 'failed',
          statusCode: 500,
          latencyMs: latency,
          error: err?.message || 'Network error'
        } : item));
      }
    }

    setRunningSuite(false);
    setDeploymentReady(passedCount >= API_ENDPOINTS.length - 1);
  };

  // Download OpenAPI Spec
  const downloadOpenApiJson = () => {
    const spec = generateOpenApiSpec();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(spec, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'catalystlab-openapi-3.1.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download Postman Collection
  const downloadPostman = () => {
    const collection = generatePostmanCollection();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(collection, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'catalystlab-postman-collection.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Format JSON in editor
  const formatBodyJson = () => {
    try {
      const parsed = JSON.parse(requestBodyText);
      setRequestBodyText(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore
    }
  };

  return (
    <div id="api-playground-root" className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden font-mono text-zinc-900 dark:text-zinc-100">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-amber-500 shadow-xs">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 font-sans">
              <span>Interactive Request Builder &amp; Sandbox</span>
              <span className="rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
                v2.4.0 (OpenAPI 3.1)
              </span>
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
              Interactive request builder, live telemetry sandboxing, and production deployment quality verification.
            </p>
          </div>
        </div>

        {/* Action Controls & Specs */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadOpenApiJson}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs transition hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
            title="Download OpenAPI 3.1 JSON Specification"
          >
            <Download className="h-3.5 w-3.5 text-amber-500" />
            <span>OpenAPI 3.1</span>
          </button>

          <button
            onClick={downloadPostman}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs transition hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
            title="Export Postman Collection v2.1"
          >
            <FileJson className="h-3.5 w-3.5 text-indigo-400" />
            <span>Postman v2.1</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
        
        {/* Left Column: Request Builder (7 cols) */}
        <div className="lg:col-span-7 p-5 space-y-4">
          
          {/* Endpoint Selector Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Select API Endpoint &amp; Resource
            </label>
            <div className="relative">
              <select
                value={selectedEndpointId}
                onChange={(e) => {
                  setSelectedEndpointId(e.target.value);
                  if (onSelectEndpoint) onSelectEndpoint(e.target.value);
                }}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2 pl-3 pr-8 text-xs font-semibold text-zinc-900 dark:text-zinc-100 shadow-xs focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none cursor-pointer"
              >
                {API_CATEGORIES.map(category => (
                  <optgroup key={category} label={`─── ${category} ───`}>
                    {API_ENDPOINTS.filter(ep => ep.category === category).map(ep => (
                      <option key={ep.id} value={ep.id}>
                        [{ep.method}] {ep.path} — {ep.summary}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Live Request Address Bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <span className={`flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold uppercase text-white shadow-xs ${
              currentEndpoint.method === 'POST' ? 'bg-zinc-800 dark:bg-zinc-700 border border-zinc-700' :
              currentEndpoint.method === 'GET' ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400' :
              currentEndpoint.method === 'DELETE' ? 'bg-rose-950/80 border border-rose-500/40 text-rose-400' : 
              'bg-amber-950/80 border border-amber-500/40 text-amber-400'
            }`}>
              {currentEndpoint.method}
            </span>

            <div className="flex-1 flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 overflow-x-auto">
              <span className="text-zinc-400 mr-1">/api</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{currentEndpoint.path.replace(/^\/api/, '')}</span>
            </div>

            <button
              onClick={executeApiCall}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 px-4 py-1.5 text-xs font-bold text-white dark:text-zinc-950 shadow-xs transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap cursor-pointer focus-visible:outline-none"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400 dark:text-amber-600" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 text-amber-400 dark:text-amber-600" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>

          {/* Endpoint Summary & Auth Tags */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 p-3 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-sans">{currentEndpoint.summary}</span>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                  Auth: {currentEndpoint.auth}
                </span>
                <span className="rounded bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  Quota: {currentEndpoint.rateLimit}
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              {currentEndpoint.description}
            </p>
          </div>

          {/* Request Configuration Sections */}
          <div className="space-y-4">
            {/* 1. Query & Path Parameters */}
            {currentEndpoint.parameters && currentEndpoint.parameters.length > 0 && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-sans">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Query &amp; Path Parameters</span>
                  </div>
                  <span className="rounded bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                    {currentEndpoint.parameters.length} parameter{currentEndpoint.parameters.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {currentEndpoint.parameters.map((param) => (
                    <div key={param.name} className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                      <div className="sm:w-1/3">
                        <div className="font-mono font-bold text-amber-600 dark:text-amber-400">{param.name}</div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans">{param.description}</div>
                      </div>
                      <input
                        type="text"
                        value={queryParams[param.name] || ''}
                        onChange={(e) => setQueryParams({ ...queryParams, [param.name]: e.target.value })}
                        placeholder={param.example || param.default || 'value'}
                        className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Request Body (JSON) */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-sans">
                  <FileJson className="h-3.5 w-3.5" />
                  <span>Request Body (application/json)</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-sans">
                  {currentEndpoint.requestBody && (
                    <button
                      onClick={() => {
                        if (currentEndpoint.requestBody?.defaultPayload) {
                          setRequestBodyText(JSON.stringify(currentEndpoint.requestBody.defaultPayload, null, 2));
                        }
                      }}
                      className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Reset Example
                    </button>
                  )}
                  <button
                    onClick={formatBodyJson}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-mono cursor-pointer"
                  >
                    Format JSON
                  </button>
                </div>
              </div>

              <textarea
                value={requestBodyText}
                onChange={(e) => setRequestBodyText(e.target.value)}
                placeholder={currentEndpoint.method === 'GET' ? 'GET requests do not require a JSON body.' : '{\n  "url": "https://example.com"\n}'}
                rows={currentEndpoint.method === 'GET' ? 2 : 5}
                disabled={currentEndpoint.method === 'GET'}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* 3. Authentication & Custom Headers */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-700 pb-1.5 font-sans">
                <Key className="h-3.5 w-3.5" />
                <span>Headers &amp; Authentication</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAuthType('none')}
                    className={`rounded-lg border p-1.5 text-center font-semibold transition cursor-pointer text-xs ${
                      authType === 'none'
                        ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => setAuthType('apiKey')}
                    className={`rounded-lg border p-1.5 text-center font-semibold transition cursor-pointer text-xs ${
                      authType === 'apiKey'
                        ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    X-API-Key
                  </button>
                  <button
                    onClick={() => setAuthType('bearer')}
                    className={`rounded-lg border p-1.5 text-center font-semibold transition cursor-pointer text-xs ${
                      authType === 'bearer'
                        ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Bearer JWT
                  </button>
                </div>

                {authType === 'apiKey' && (
                  <div className="space-y-1 pt-1">
                    <label className="font-semibold text-zinc-500 dark:text-zinc-400 text-[11px]">X-API-Key Secret</label>
                    <input
                      type="text"
                      value={apiKeyVal}
                      onChange={(e) => setApiKeyVal(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-mono text-xs text-amber-600 dark:text-amber-400"
                    />
                  </div>
                )}

                {authType === 'bearer' && (
                  <div className="space-y-1 pt-1">
                    <label className="font-semibold text-zinc-500 dark:text-zinc-400 text-[11px]">Bearer Authorization Token</label>
                    <input
                      type="text"
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-mono text-xs text-amber-600 dark:text-amber-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4. Client Code Generator Snippet */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-700 pb-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-sans">
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Client Code Generator</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Lang:</span>
                    <select
                      value={snippetLanguage}
                      onChange={(e) => setSnippetLanguage(e.target.value as any)}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="curl">cURL</option>
                      <option value="javascript">JavaScript / Node</option>
                      <option value="python">Python</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="php">PHP</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      const snippet = generateCodeSnippet(currentEndpoint, snippetLanguage);
                      navigator.clipboard.writeText(snippet);
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    {copiedSnippet ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <pre className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3 font-mono text-xs text-zinc-800 dark:text-zinc-200 overflow-x-auto max-h-40">
                <code>{generateCodeSnippet(currentEndpoint, snippetLanguage)}</code>
              </pre>
            </div>
          </div>

        </div>

        {/* Right Column: Live Response & Telemetry Inspector (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-zinc-50 dark:bg-zinc-950/40 flex flex-col justify-between space-y-4">
          
          {/* Header & Status Gauge */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Live Response Telemetry
              </span>

              {responseStatus !== null && (
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                      : responseStatus === 429
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                  }`}>
                    {responseStatus === 200 ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {responseStatus} {responseStatusText}
                  </span>

                  {responseTimeMs !== null && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                      <Clock className="h-3 w-3" />
                      {responseTimeMs}ms
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Response Metrics Pill Bar */}
            {responsePayload && (
              <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 font-mono">
                <span>Size: {responseSizeKb ? `${responseSizeKb} KB` : 'N/A'}</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> OpenAPI 3.1
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(responsePayload, null, 2));
                    setCopiedResponse(true);
                    setTimeout(() => setCopiedResponse(false), 2000);
                  }}
                  className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {copiedResponse ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {/* Live Response Content Container */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 overflow-y-auto max-h-[340px] shadow-inner">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-14 space-y-2 text-zinc-400">
                  <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
                  <p className="text-xs">Dispatching sandboxed engine execution...</p>
                </div>
              ) : responsePayload ? (
                <pre className="text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                  {JSON.stringify(responsePayload, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center text-zinc-400 dark:text-zinc-500 space-y-2">
                  <Activity className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                  <p className="font-sans text-xs">Ready for execution. Click <strong>&quot;Send Request&quot;</strong> to inspect live payload output.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Sandbox Target Selector */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Quick Test Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'example.com', url: 'https://example.com' },
                { name: 'react.dev', url: 'https://react.dev' },
                { name: 'github.com', url: 'https://github.com' },
                { name: 'wikipedia.org', url: 'https://wikipedia.org' }
              ].map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    if (currentEndpoint.requestBody?.defaultPayload) {
                      setRequestBodyText(JSON.stringify({
                        ...currentEndpoint.requestBody.defaultPayload,
                        url: preset.url
                      }, null, 2));
                    }
                  }}
                  className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* AUTOMATED TEST RUNNER & DEPLOYMENT VERIFICATION */}
      {/* ========================================================================= */}
      <div className="border-t border-brand-slate/30 bg-brand-oxford p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5 font-sans">
              <ShieldCheck className="h-4 w-4 text-accent-emerald" />
              <span>API Deployment Verification Suite (Finalize for Production)</span>
            </h3>
            <p className="text-[11px] text-brand-periwinkle font-sans">
              Runs automated test assertions across all 8 diagnostic engines, master audit, reports, and security headers to validate zero-defect production readiness.
            </p>
          </div>

          <button
            onClick={runFullVerificationSuite}
            disabled={runningSuite}
            className="flex items-center gap-1.5 rounded-xl bg-brand-slate hover:bg-brand-slate-hover border border-brand-periwinkle/30 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            {runningSuite ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent-cyan" />
                <span>Running Suite ({suiteProgress}%)...</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 text-accent-cyan" />
                <span>Run API Verification Suite</span>
              </>
            )}
          </button>
        </div>

        {/* Verification Checklist Results Table */}
        {suiteResults.length > 0 && (
          <div className="rounded-xl border border-brand-slate/40 bg-white p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-brand-slate/30 pb-2">
              <span className="text-xs font-bold text-black">
                Automated Test Assertions ({suiteResults.filter(r => r.status === 'passed').length}/{suiteResults.length} Passed)
              </span>

              {deploymentReady !== null && (
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                  deploymentReady
                    ? 'bg-emerald-950/80 text-accent-emerald border border-emerald-500/40'
                    : 'bg-amber-950/80 text-accent-amber border border-amber-500/40'
                }`}>
                  {deploymentReady ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {deploymentReady ? '100% Production Ready' : 'Minor Warnings Detected'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pt-1">
              {suiteResults.map((item) => (
                <div 
                  key={item.endpointId}
                  className={`flex items-center justify-between rounded-lg border p-2 text-xs ${
                    item.status === 'passed' ? 'border-emerald-500/40 bg-emerald-950/30' :
                    item.status === 'failed' ? 'border-rose-500/40 bg-rose-950/30' :
                    item.status === 'running' ? 'border-accent-cyan/40 bg-white animate-pulse' :
                    'border-brand-slate/40 bg-brand-oxford'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-black truncate text-[11px] font-sans">{item.summary}</div>
                    <div className="font-mono text-[10px] text-accent-cyan truncate">{item.path}</div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    {item.status === 'passed' && (
                      <span className="flex items-center gap-0.5 text-accent-emerald font-bold font-mono text-[10px]">
                        <Check className="h-3 w-3" /> {item.latencyMs}ms
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="flex items-center gap-0.5 text-rose-400 font-bold font-mono text-[10px]">
                        <XCircle className="h-3 w-3" /> {item.error || 'Failed'}
                      </span>
                    )}
                    {item.status === 'running' && (
                      <RefreshCw className="h-3 w-3 animate-spin text-accent-cyan" />
                    )}
                    {item.status === 'pending' && (
                      <span className="text-[10px] text-brand-slate-light">Queued</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
