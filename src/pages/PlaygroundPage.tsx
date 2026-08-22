import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RateLimitThresholdAlert } from '../components/RateLimitThresholdAlert';
import { 
  getRateLimitStatus, 
  fetchServerRateLimitStatus, 
  recordClientRequestAttempt, 
  RateLimitStatus, 
  MASTER_AUDIT_COST, 
  SINGLE_ENGINE_COST 
} from '../utils/rateLimiter';
import { getApiKeys } from '../lib/firebase';
import { ApiKey } from '../types';
import { 
  Play, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Code2, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  Server, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sliders, 
  FileJson,
  Key,
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  Sparkles,
  Globe,
  Lock,
  Search,
  Cpu,
  Bookmark,
  History,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  HelpCircle,
  Eye,
  Info,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EngineOption {
  id: string;
  name: string;
  category: string;
  cost: number;
  description: string;
  defaultUrl: string;
  defaultPayload: Record<string, any>;
}

const ENGINE_OPTIONS: EngineOption[] = [
  {
    id: 'health',
    name: 'Health & Core Web Vitals',
    category: 'Performance',
    cost: 1,
    description: 'Measures HTTP status, response codes, TTFB, DOMContentLoaded, and uptime readiness.',
    defaultUrl: 'https://example.com',
    defaultPayload: {
      engine: 'health',
      url: 'https://example.com',
      forceFresh: false
    }
  },
  {
    id: 'latency',
    name: 'Multi-PoP Latency Radar',
    category: 'Network',
    cost: 1,
    description: 'Probes response times and DNS/TLS handshake across worldwide edge points of presence.',
    defaultUrl: 'https://example.com',
    defaultPayload: {
      engine: 'latency',
      url: 'https://example.com',
      regions: ['iad', 'fra', 'sin', 'syd']
    }
  },
  {
    id: 'ssl',
    name: 'SSL/TLS Certificate Chain',
    category: 'Security',
    cost: 1,
    description: 'Inspects cipher suites, TLS 1.3 protocol negotiation, certificate validity, and issuer trust.',
    defaultUrl: 'https://example.com',
    defaultPayload: {
      engine: 'ssl',
      url: 'https://example.com'
    }
  },
  {
    id: 'security',
    name: 'HTTP Security Headers',
    category: 'Security',
    cost: 1,
    description: 'Audits CSP, HSTS, X-Frame-Options, CORS permissions, and referrer policies.',
    defaultUrl: 'https://example.com',
    defaultPayload: {
      engine: 'security',
      url: 'https://example.com'
    }
  },
  {
    id: 'dns',
    name: 'DNS Records & Auth',
    category: 'Infrastructure',
    cost: 1,
    description: 'Queries A, AAAA, MX, TXT, CNAME, SPF, DKIM, and DMARC configuration records.',
    defaultUrl: 'https://example.com',
    defaultPayload: {
      engine: 'dns',
      url: 'https://example.com'
    }
  },
  {
    id: 'seo',
    name: 'SEO & Social OpenGraph',
    category: 'SEO',
    cost: 1,
    description: 'Verifies title tags, meta descriptions, canonical URLs, robots.txt, and social media cards.',
    defaultUrl: 'https://example.com',
    defaultPayload: {
      engine: 'seo',
      url: 'https://example.com'
    }
  },
  {
    id: 'compliance',
    name: 'Privacy & Cookie Compliance',
    category: 'Compliance',
    cost: 1,
    description: 'Scans for GDPR/CCPA consent banners, privacy policies, terms of service, and cookie disclosures.',
    defaultUrl: 'https://example.com',
    defaultPayload: {
      engine: 'compliance',
      url: 'https://example.com'
    }
  },
  {
    id: 'tech',
    name: 'Tech Stack & Frameworks',
    category: 'Technology',
    cost: 1,
    description: 'Detects frontend frameworks, backend servers, CMS, analytics, and CDN infrastructure.',
    defaultUrl: 'https://example.com',
    defaultPayload: {
      engine: 'tech',
      url: 'https://example.com'
    }
  },
  {
    id: 'master',
    name: 'Master 8-Engine Deep Audit',
    category: 'Composite',
    cost: 10,
    description: 'Executes parallel execution of all 8 specialized diagnostic engines via /api/v1/audit/master.',
    defaultUrl: 'https://example.com',
    defaultPayload: {
      url: 'https://example.com',
      forceFresh: true,
      regions: ['iad', 'fra', 'sin']
    }
  }
];

interface ExecutionHistoryItem {
  id: string;
  timestamp: number;
  endpoint: string;
  engine: string;
  url: string;
  status: number;
  statusText: string;
  latencyMs: number;
  cost: number;
  payload: any;
  response: any;
}

export const PlaygroundPage: React.FC = () => {
  const { user, isAdmin, login } = useAuth();
  
  // Rate limiting & user keys state
  const [rateStatus, setRateStatus] = useState<RateLimitStatus>(() => getRateLimitStatus(user, isAdmin));
  const [userApiKeys, setUserApiKeys] = useState<ApiKey[]>([]);
  
  // Selected engine & request configuration
  const [selectedEngineId, setSelectedEngineId] = useState<string>('health');
  const [targetUrl, setTargetUrl] = useState<string>('https://example.com');
  const [builderMode, setBuilderMode] = useState<'visual' | 'json'>('visual');
  
  // Visual Builder Parameters
  const [forceFresh, setForceFresh] = useState<boolean>(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['iad', 'fra', 'sin']);
  const [timeoutMs, setTimeoutMs] = useState<number>(10000);
  const [userAgentType, setUserAgentType] = useState<'desktop' | 'mobile' | 'catalystbot'>('desktop');
  const [customBrandHeader, setCustomBrandHeader] = useState<string>('');
  
  // Raw JSON editor text
  const [rawJsonPayload, setRawJsonPayload] = useState<string>('');
  
  // Authentication setup
  const [authMode, setAuthMode] = useState<'session' | 'apiKey' | 'custom'>('session');
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [customHeaderKey, setCustomHeaderKey] = useState<string>('');
  const [customHeaderVal, setCustomHeaderVal] = useState<string>('');
  
  // Execution & Response states
  const [executing, setExecuting] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>('');
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseSizeKb, setResponseSizeKb] = useState<number | null>(null);
  
  // Response Inspector tabs
  const [inspectorTab, setInspectorTab] = useState<'visual' | 'json' | 'headers' | 'snippets'>('visual');
  const [codeSnippetLang, setCodeSnippetLang] = useState<'curl' | 'javascript' | 'python' | 'go'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  
  // History list
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([]);

  const activeEngine = ENGINE_OPTIONS.find(e => e.id === selectedEngineId) || ENGINE_OPTIONS[0];
  const isMaster = selectedEngineId === 'master';
  const endpointPath = isMaster ? '/api/v1/audit/master' : '/api/run-engine';

  // Load API keys and sync rate limits
  useEffect(() => {
    const syncStatus = async () => {
      const serverStatus = await fetchServerRateLimitStatus(user);
      if (serverStatus) {
        setRateStatus(serverStatus);
      } else {
        setRateStatus(getRateLimitStatus(user, isAdmin));
      }

      if (user?.uid) {
        try {
          const keys = await getApiKeys(user.uid);
          setUserApiKeys(keys);
          if (keys.length > 0 && !selectedApiKey) {
            setSelectedApiKey(keys[0].keyPrefix.replace('...', ''));
          }
        } catch (e) {
          console.error("Error loading keys in playground:", e);
        }
      }
    };
    syncStatus();
  }, [user, isAdmin]);

  // Update raw JSON when visual controls change
  useEffect(() => {
    if (builderMode === 'visual') {
      const payload: Record<string, any> = isMaster 
        ? {
            url: targetUrl.trim() || 'https://example.com',
            forceFresh,
            regions: selectedRegions
          }
        : {
            engine: selectedEngineId,
            url: targetUrl.trim() || 'https://example.com',
            ...(forceFresh ? { forceFresh: true } : {}),
            ...(selectedEngineId === 'latency' ? { regions: selectedRegions } : {})
          };

      setRawJsonPayload(JSON.stringify(payload, null, 2));
    }
  }, [selectedEngineId, targetUrl, forceFresh, selectedRegions, timeoutMs, userAgentType, isMaster, builderMode]);

  // When engine switches, update defaults
  const handleEngineChange = (engineId: string) => {
    setSelectedEngineId(engineId);
    const engine = ENGINE_OPTIONS.find(e => e.id === engineId);
    if (engine) {
      if (builderMode === 'json') {
        setRawJsonPayload(JSON.stringify(engine.defaultPayload, null, 2));
      }
    }
  };

  // Live Execute API Call
  const handleRunEngine = async () => {
    setExecuting(true);
    setResponseStatus(null);
    setResponsePayload(null);
    setResponseTimeMs(null);
    setResponseSizeKb(null);

    const startTime = performance.now();
    let computedCost = activeEngine.cost;

    try {
      // Build request body
      let bodyData: any = {};
      if (builderMode === 'json') {
        try {
          bodyData = JSON.parse(rawJsonPayload);
        } catch (jsonErr: any) {
          setExecuting(false);
          setResponseStatus(400);
          setResponseStatusText('Bad Request (Invalid JSON)');
          setResponsePayload({
            error: 'JSON Syntax Error: ' + jsonErr.message,
            tip: 'Check commas and quotation marks in your Request Payload Editor.'
          });
          return;
        }
      } else {
        bodyData = isMaster
          ? {
              url: targetUrl.trim() || 'https://example.com',
              forceFresh,
              regions: selectedRegions
            }
          : {
              engine: selectedEngineId,
              url: targetUrl.trim() || 'https://example.com',
              ...(forceFresh ? { forceFresh: true } : {}),
              ...(selectedEngineId === 'latency' ? { regions: selectedRegions } : {})
            };
      }

      // Headers construction
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (authMode === 'apiKey' && selectedApiKey) {
        headers['X-API-Key'] = selectedApiKey;
      }
      if (customBrandHeader.trim()) {
        headers['X-WhiteLabel-Brand'] = customBrandHeader.trim();
      }
      if (customHeaderKey.trim() && customHeaderVal.trim()) {
        headers[customHeaderKey.trim()] = customHeaderVal.trim();
      }

      const res = await fetch(endpointPath, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
      });

      const elapsed = Math.round(performance.now() - startTime);
      setResponseTimeMs(elapsed);
      setResponseStatus(res.status);
      setResponseStatusText(res.statusText || (res.status === 200 ? 'OK' : 'Error'));

      // Extract response headers
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });
      setResponseHeaders(resHeaders);

      // Parse JSON output
      const data = await res.json();
      setResponsePayload(data);

      const size = new Blob([JSON.stringify(data)]).size;
      setResponseSizeKb(Number((size / 1024).toFixed(2)));

      // Record client-side rate limit charge if authenticated
      recordClientRequestAttempt(computedCost, user, isAdmin);
      const updatedStatus = getRateLimitStatus(user, isAdmin);
      setRateStatus(updatedStatus);

      // Add to local history
      const historyItem: ExecutionHistoryItem = {
        id: `exec_${Date.now()}`,
        timestamp: Date.now(),
        endpoint: endpointPath,
        engine: activeEngine.name,
        url: bodyData.url || targetUrl,
        status: res.status,
        statusText: res.statusText || 'OK',
        latencyMs: elapsed,
        cost: computedCost,
        payload: bodyData,
        response: data
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 19)]);

    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setResponseTimeMs(elapsed);
      setResponseStatus(500);
      setResponseStatusText('Network / Execution Error');
      setResponsePayload({
        success: false,
        error: err.message || 'Failed to dispatch request to CatalystLab engine API.',
        troubleshooting: 'Ensure the dev server is active and the URL is formatted correctly.'
      });
    } finally {
      setExecuting(false);
    }
  };

  // Replay historical request
  const handleLoadFromHistory = (item: ExecutionHistoryItem) => {
    const matchedEngine = ENGINE_OPTIONS.find(e => e.name === item.engine) || ENGINE_OPTIONS[0];
    setSelectedEngineId(matchedEngine.id);
    setTargetUrl(item.url);
    setRawJsonPayload(JSON.stringify(item.payload, null, 2));
    setResponseStatus(item.status);
    setResponseStatusText(item.statusText);
    setResponseTimeMs(item.latencyMs);
    setResponsePayload(item.response);
  };

  // Generate Code Snippet
  const getCodeSnippet = () => {
    const keyHeader = authMode === 'apiKey' && selectedApiKey ? ` \\\n  -H "X-API-Key: ${selectedApiKey}"` : '';
    const bodyStr = rawJsonPayload || JSON.stringify({ engine: selectedEngineId, url: targetUrl }, null, 2);

    if (codeSnippetLang === 'curl') {
      return `curl -X POST "https://catalystlab.tech${endpointPath}" \\
  -H "Content-Type: application/json"${keyHeader} \\
  -d '${bodyStr.replace(/\n/g, '\n  ')}'`;
    }

    if (codeSnippetLang === 'javascript') {
      return `const response = await fetch('https://catalystlab.tech${endpointPath}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'${authMode === 'apiKey' && selectedApiKey ? `,\n    'X-API-Key': '${selectedApiKey}'` : ''}
  },
  body: JSON.stringify(${bodyStr.replace(/\n/g, '\n  ')})
});

const data = await response.json();
console.log('Status:', data.success);
console.log('Engine Output:', data.output);`;
    }

    if (codeSnippetLang === 'python') {
      return `import requests

url = "https://catalystlab.tech${endpointPath}"
headers = {
    "Content-Type": "application/json"${authMode === 'apiKey' && selectedApiKey ? `,\n    "X-API-Key": "${selectedApiKey}"` : ''}
}
payload = ${bodyStr.replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}

response = requests.post(url, json=payload, headers=headers)
print("Status Code:", response.status_code)
print("Telemetry:", response.json())`;
    }

    if (codeSnippetLang === 'go') {
      return `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	url := "https://catalystlab.tech${endpointPath}"
	payload := []byte(\`${bodyStr}\`)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	${authMode === 'apiKey' && selectedApiKey ? `req.Header.Set("X-API-Key", "${selectedApiKey}")` : ''}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Println("Status:", resp.Status)
}`;
    }

    return '';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      
      {/* Top Header Hero */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b192c] text-white shadow-md">
                <Terminal className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0b192c]">
                    Engine Test Playground
                  </h1>
                  <span className="rounded-md bg-[#0b192c]/5 border border-[#0b192c]/10 px-2 py-0.5 text-sm font-mono font-bold text-[#0b192c]">
                    {endpointPath}
                  </span>
                </div>
                <p className="text-sm text-[#415a77] mt-0.5">
                  Interactive REST test harness for single diagnostic engines and composite master audits.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/user-dashboard?tab=api-keys"
                className="flex items-center gap-1.5 rounded-xl border border-[#415a77]/30 bg-white px-3.5 py-2 text-sm font-semibold text-[#0b192c] hover:bg-[#f8fafc] shadow-sm transition-colors"
              >
                <Key className="h-4 w-4 text-amber-500" />
                <span>API Keys & White-Label</span>
              </Link>
              
              <Link
                to="/api-docs"
                className="flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-2 text-sm font-semibold text-[#415a77] hover:bg-[#f8fafc] transition-colors"
              >
                <FileJson className="h-4 w-4 text-blue-600" />
                <span>OpenAPI Docs</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* 1. VISUAL NOTIFICATION: RATE LIMIT THRESHOLD ALERT */}
        <RateLimitThresholdAlert 
          currentStatus={rateStatus} 
          endpointPath={endpointPath}
          showAllStates={true}
        />

        {/* Engine Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {ENGINE_OPTIONS.map((eng) => {
            const isSelected = selectedEngineId === eng.id;
            return (
              <button
                key={eng.id}
                onClick={() => handleEngineChange(eng.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'border-[#0b192c] bg-[#0b192c] text-white shadow-md'
                    : 'border-[#e2e8f0] bg-white text-[#415a77] hover:bg-[#f1f5f9] hover:border-[#cbd5e1]'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${
                  eng.id === 'master' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span>{eng.name}</span>
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#64748b]'
                }`}>
                  {eng.cost} {eng.cost === 1 ? 'unit' : 'units'}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Split: Request Builder & Response Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: REQUEST PAYLOAD BUILDER (5 Columns) */}
          <div className="lg:col-span-5 space-y-5">
            
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-4">
              
              {/* Header & Mode Switch */}
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#0b192c]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0b192c]">
                    Request Payload Builder
                  </h3>
                </div>

                <div className="flex items-center gap-1 bg-[#f1f5f9] p-0.5 rounded-lg border border-[#e2e8f0]">
                  <button
                    onClick={() => setBuilderMode('visual')}
                    className={`px-2.5 py-1 text-sm font-bold rounded-md transition-colors ${
                      builderMode === 'visual'
                        ? 'bg-white text-[#0b192c] shadow-xs'
                        : 'text-[#64748b] hover:text-[#0b192c]'
                    }`}
                  >
                    Visual Form
                  </button>
                  <button
                    onClick={() => setBuilderMode('json')}
                    className={`px-2.5 py-1 text-sm font-bold rounded-md transition-colors ${
                      builderMode === 'json'
                        ? 'bg-white text-[#0b192c] shadow-xs'
                        : 'text-[#64748b] hover:text-[#0b192c]'
                    }`}
                  >
                    Raw JSON
                  </button>
                </div>
              </div>

              {/* Endpoint Banner Info */}
              <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#0b192c]">
                    <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs font-mono text-white">POST</span>
                    <span>{endpointPath}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Cost: {activeEngine.cost} Unit
                  </span>
                </div>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  {activeEngine.description}
                </p>
              </div>

              {/* VISUAL BUILDER CONTROLS */}
              {builderMode === 'visual' ? (
                <div className="space-y-3.5">
                  
                  {/* Target URL Input */}
                  <div>
                    <label className="block text-sm font-bold text-[#0b192c] mb-1">
                      Target Domain / URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                      <input
                        type="url"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full rounded-xl border border-[#cbd5e1] pl-9 pr-3 py-2 text-sm font-mono text-[#0b192c] focus:border-[#0b192c] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Engine Parameter (if single engine) */}
                  {!isMaster && (
                    <div>
                      <label className="block text-sm font-bold text-[#0b192c] mb-1">
                        Diagnostic Engine
                      </label>
                      <select
                        value={selectedEngineId}
                        onChange={(e) => handleEngineChange(e.target.value)}
                        className="w-full rounded-xl border border-[#cbd5e1] px-3 py-2 text-sm text-[#0b192c] focus:outline-none"
                      >
                        {ENGINE_OPTIONS.filter(e => e.id !== 'master').map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name} ({opt.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Region selection for Latency / Master */}
                  {(selectedEngineId === 'latency' || isMaster) && (
                    <div>
                      <label className="block text-sm font-bold text-[#0b192c] mb-1.5">
                        Global Edge PoP Regions
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'iad', label: 'US East (IAD)' },
                          { id: 'fra', label: 'Europe (FRA)' },
                          { id: 'sin', label: 'Asia (SIN)' },
                          { id: 'syd', label: 'Sydney (SYD)' },
                          { id: 'hnd', label: 'Tokyo (HND)' },
                          { id: 'gru', label: 'Brazil (GRU)' }
                        ].map((reg) => {
                          const active = selectedRegions.includes(reg.id);
                          return (
                            <button
                              key={reg.id}
                              type="button"
                              onClick={() => {
                                setSelectedRegions(prev => 
                                  active ? prev.filter(r => r !== reg.id) : [...prev, reg.id]
                                );
                              }}
                              className={`rounded-lg border px-2 py-1.5 text-sm font-mono text-center transition-colors ${
                                active
                                  ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                                  : 'border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]'
                              }`}
                            >
                              {reg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Force Fresh Cache Bypass */}
                  <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                    <div>
                      <div className="text-sm font-bold text-[#0b192c]">Bypass Server Cache (forceFresh)</div>
                      <div className="text-xs text-[#64748b]">Forces a live DNS/HTTP probe bypass</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={forceFresh}
                      onChange={(e) => setForceFresh(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#0b192c]"
                    />
                  </div>

                  {/* White-Label Custom Header Header */}
                  <div>
                    <label className="block text-sm font-bold text-[#0b192c] mb-1">
                      White-Label Custom Brand Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Telemetry Enterprise"
                      value={customBrandHeader}
                      onChange={(e) => setCustomBrandHeader(e.target.value)}
                      className="w-full rounded-xl border border-[#cbd5e1] px-3 py-1.5 text-sm text-[#0b192c]"
                    />
                  </div>

                </div>
              ) : (
                /* RAW JSON EDITOR */
                <div>
                  <div className="flex items-center justify-between text-sm text-[#64748b] mb-1.5 font-mono">
                    <span>payload.json</span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(rawJsonPayload);
                          setRawJsonPayload(JSON.stringify(parsed, null, 2));
                        } catch {}
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Prettify JSON
                    </button>
                  </div>
                  <textarea
                    rows={9}
                    value={rawJsonPayload}
                    onChange={(e) => setRawJsonPayload(e.target.value)}
                    className="w-full rounded-xl border border-[#cbd5e1] bg-[#0b192c] p-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
                    placeholder="{\n  &quot;engine&quot;: &quot;health&quot;,\n  &quot;url&quot;: &quot;https://example.com&quot;\n}"
                  />
                </div>
              )}

              {/* AUTHENTICATION & HEADER ACCORDION */}
              <div className="border-t border-[#f1f5f9] pt-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-[#0b192c]">
                    <Key className="h-3.5 w-3.5 text-amber-500" />
                    <span>Authentication Headers</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <button
                      type="button"
                      onClick={() => setAuthMode('session')}
                      className={`px-2 py-0.5 rounded ${authMode === 'session' ? 'bg-[#0b192c] text-white font-bold' : 'text-[#64748b]'}`}
                    >
                      Session
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('apiKey')}
                      className={`px-2 py-0.5 rounded ${authMode === 'apiKey' ? 'bg-[#0b192c] text-white font-bold' : 'text-[#64748b]'}`}
                    >
                      API Key
                    </button>
                  </div>
                </div>

                {authMode === 'apiKey' ? (
                  <div>
                    {userApiKeys.length > 0 ? (
                      <select
                        value={selectedApiKey}
                        onChange={(e) => setSelectedApiKey(e.target.value)}
                        className="w-full rounded-xl border border-[#cbd5e1] px-3 py-1.5 text-sm font-mono text-[#0b192c]"
                      >
                        {userApiKeys.map((k) => (
                          <option key={k.id} value={k.keyPrefix.replace('...', '')}>
                            {k.name} ({k.keyPrefix})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-sm text-amber-900">
                        <span>No saved keys found.</span>
                        <Link to="/user-dashboard?tab=api-keys" className="font-bold underline">
                          Generate Key
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-[#64748b]">
                    Executing under active user context: <strong className="text-[#0b192c]">{user?.email || 'Anonymous Client'}</strong> ({rateStatus.tierLabel})
                  </div>
                )}
              </div>

              {/* EXECUTE BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunEngine}
                  disabled={executing || (rateStatus.remaining <= 0 && !isAdmin)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all active:scale-98 ${
                    rateStatus.remaining <= 0 && !isAdmin
                      ? 'bg-rose-600 hover:bg-rose-700 cursor-not-allowed opacity-80'
                      : 'bg-[#0b192c] hover:bg-[#152238]'
                  }`}
                >
                  {executing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-amber-300" />
                      <span>Executing Diagnostic Engine...</span>
                    </>
                  ) : rateStatus.remaining <= 0 && !isAdmin ? (
                    <>
                      <Flame className="h-4 w-4 text-amber-300" />
                      <span>Rate Limit Exceeded (0 Units Left)</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 text-emerald-400 fill-emerald-400" />
                      <span>Dispatch Request ({activeEngine.cost} Unit)</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Quick Historical Requests Log */}
            {history.length > 0 && (
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2.5 mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0b192c]">
                    <History className="h-3.5 w-3.5 text-[#415a77]" />
                    <span>Recent Session Probes ({history.length})</span>
                  </div>
                  <button
                    onClick={() => setHistory([])}
                    className="text-sm text-[#94a3b8] hover:text-[#0b192c]"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadFromHistory(item)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8fafc] border border-transparent hover:border-[#e2e8f0] cursor-pointer transition-colors text-sm"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          item.status === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.status}
                        </span>
                        <span className="font-semibold text-[#0b192c] truncate">{item.engine}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-sm text-[#64748b]">
                        <span>{item.latencyMs}ms</span>
                        <RotateCcw className="h-3 w-3 text-[#94a3b8]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: RESPONSE INSPECTOR (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm flex flex-col min-h-[580px]">
              
              {/* Response Inspector Tab Header */}
              <div className="border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Server className="h-4 w-4 text-[#415a77]" />
                    <span className="text-sm font-bold text-[#0b192c] uppercase tracking-wider">
                      Response Inspector
                    </span>
                  </div>

                  {responseStatus !== null && (
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`rounded-md px-2 py-0.5 text-sm font-mono font-bold ${
                        responseStatus === 200 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : responseStatus === 429
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {responseStatus} {responseStatusText}
                      </span>

                      {responseTimeMs !== null && (
                        <span className="flex items-center gap-1 text-sm font-mono text-[#64748b]">
                          <Clock className="h-3 w-3" />
                          {responseTimeMs} ms
                        </span>
                      )}

                      {responseSizeKb !== null && (
                        <span className="text-sm font-mono text-[#64748b]">
                          • {responseSizeKb} KB
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Inspector Views Selector */}
                <div className="flex items-center gap-1">
                  {(['visual', 'json', 'headers', 'snippets'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setInspectorTab(tab)}
                      className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors capitalize ${
                        inspectorTab === tab
                          ? 'bg-[#0b192c] text-white shadow-xs'
                          : 'text-[#64748b] hover:text-[#0b192c] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      {tab === 'snippets' ? 'SDK Snippet' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Inspector Body Area */}
              <div className="flex-1 p-5 overflow-auto">
                
                {executing ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#0b192c] border-t-transparent mb-3" />
                    <h4 className="text-base font-bold text-[#0b192c]">Dispatching Probe to CatalystLab Engines</h4>
                    <p className="text-sm text-[#64748b] mt-1 max-w-sm">
                      Executing SSL handshake, network latency, and security headers diagnostics...
                    </p>
                  </div>
                ) : !responsePayload && responseStatus === null ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Terminal className="h-12 w-12 text-[#cbd5e1] mb-3" />
                    <h4 className="text-base font-bold text-[#0b192c]">Ready for Engine Execution</h4>
                    <p className="text-sm text-[#64748b] mt-1 max-w-sm">
                      Configure your payload on the left and click <strong>Dispatch Request</strong> to inspect real-time JSON responses and telemetry.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* TAB 1: VISUAL TELEMETRY CARD */}
                    {inspectorTab === 'visual' && (
                      <div className="space-y-4">
                        
                        {/* Score & Health Header */}
                        {responsePayload?.score !== undefined || responsePayload?.output?.score !== undefined ? (
                          <div className="rounded-2xl bg-gradient-to-br from-[#0b192c] to-[#1e293b] p-5 text-white shadow-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-mono text-emerald-400 font-bold uppercase tracking-wider">
                                  Diagnostic Score
                                </span>
                                <div className="text-3xl font-black font-mono mt-0.5">
                                  {responsePayload?.score ?? responsePayload?.output?.score ?? 95}
                                  <span className="text-base font-normal text-[#94a3b8]"> / 100</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-sm font-bold text-white">
                                  {responsePayload?.engine || selectedEngineId.toUpperCase()} ENGINE
                                </div>
                                <div className="text-sm text-[#94a3b8] font-mono mt-0.5">
                                  {targetUrl}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* Rate Limit Remaining Callout in Output */}
                        {responsePayload?.rateLimit && (
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/60 p-3.5 text-sm text-emerald-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-emerald-600" />
                              <span>
                                Daily Units Remaining: <strong>{responsePayload.rateLimit.remaining} / {responsePayload.rateLimit.limit}</strong>
                              </span>
                            </div>
                            <span className="font-mono text-sm text-emerald-700">
                              Resets in {responsePayload.rateLimit.resetInSeconds}s
                            </span>
                          </div>
                        )}

                        {/* Telemetry Output Summary */}
                        <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                          <h4 className="text-sm font-bold text-[#0b192c] uppercase tracking-wider mb-2">
                            Parsed Output Summary
                          </h4>

                          {responsePayload?.output ? (
                            <div className="space-y-2 text-sm">
                              {Object.entries(responsePayload.output).map(([key, val]) => {
                                if (typeof val === 'object' && val !== null) {
                                  return (
                                    <div key={key} className="border-b border-[#e2e8f0] pb-2">
                                      <span className="font-mono font-bold text-[#0b192c]">{key}:</span>
                                      <pre className="mt-1 rounded bg-white p-2 text-sm font-mono text-[#334155] overflow-x-auto border border-[#e2e8f0]">
                                        {JSON.stringify(val, null, 2)}
                                      </pre>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={key} className="flex items-center justify-between border-b border-[#f1f5f9] pb-1">
                                    <span className="font-mono text-[#64748b]">{key}</span>
                                    <span className="font-mono font-bold text-[#0b192c]">{String(val)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <pre className="rounded bg-white p-3 text-sm font-mono text-[#334155] border border-[#e2e8f0]">
                              {JSON.stringify(responsePayload, null, 2)}
                            </pre>
                          )}
                        </div>

                      </div>
                    )}

                    {/* TAB 2: STRUCTURED JSON VIEWER */}
                    {inspectorTab === 'json' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono text-[#64748b]">
                            Content-Type: application/json
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(responsePayload, null, 2));
                              setCopiedResponse(true);
                              setTimeout(() => setCopiedResponse(false), 2000);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-[#cbd5e1] bg-white px-2.5 py-1 text-sm font-semibold text-[#0b192c] hover:bg-[#f8fafc]"
                          >
                            {copiedResponse ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-[#64748b]" />
                                <span>Copy JSON</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="rounded-xl bg-[#0b192c] p-4 text-sm font-mono text-emerald-400 overflow-x-auto border border-[#1e293b] shadow-inner max-h-[480px]">
                          <pre>{JSON.stringify(responsePayload, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: RESPONSE HEADERS */}
                    {inspectorTab === 'headers' && (
                      <div className="space-y-3">
                        <div className="text-sm font-bold text-[#0b192c] mb-2">
                          HTTP Response Headers
                        </div>
                        <div className="rounded-xl border border-[#e2e8f0] overflow-hidden">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-sm font-bold text-[#415a77]">
                              <tr>
                                <th className="px-4 py-2.5">Header Name</th>
                                <th className="px-4 py-2.5">Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9] font-mono">
                              {Object.entries(responseHeaders).length > 0 ? (
                                Object.entries(responseHeaders).map(([key, val]) => (
                                  <tr key={key} className="hover:bg-[#fafafa]">
                                    <td className="px-4 py-2 text-[#0b192c] font-semibold">{key}</td>
                                    <td className="px-4 py-2 text-[#415a77] break-all">{val}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={2} className="px-4 py-4 text-center text-[#94a3b8]">
                                    No custom headers returned.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: CLIENT CODE SNIPPETS */}
                    {inspectorTab === 'snippets' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {(['curl', 'javascript', 'python', 'go'] as const).map((lang) => (
                              <button
                                key={lang}
                                onClick={() => setCodeSnippetLang(lang)}
                                className={`px-2.5 py-1 text-sm font-bold uppercase font-mono rounded-lg transition-colors ${
                                  codeSnippetLang === lang
                                    ? 'bg-[#0b192c] text-white shadow-xs'
                                    : 'bg-[#f1f5f9] text-[#64748b] hover:text-[#0b192c]'
                                }`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(getCodeSnippet());
                              setCopiedSnippet(true);
                              setTimeout(() => setCopiedSnippet(false), 2000);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-[#cbd5e1] bg-white px-2.5 py-1 text-sm font-semibold text-[#0b192c] hover:bg-[#f8fafc]"
                          >
                            {copiedSnippet ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-[#64748b]" />
                                <span>Copy Snippet</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="rounded-xl bg-[#0b192c] p-4 text-sm font-mono text-[#f8fafc] overflow-x-auto border border-[#1e293b] shadow-inner max-h-[480px]">
                          <pre>{getCodeSnippet()}</pre>
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PlaygroundPage;
