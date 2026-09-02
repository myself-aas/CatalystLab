import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RateLimitThresholdAlert } from '../components/RateLimitThresholdAlert';
import { 
  getRateLimitStatus, 
  fetchServerRateLimitStatus, 
  recordClientRequestAttempt, 
  RateLimitStatus
} from '../utils/rateLimiter';
import { getApiKeys } from '../lib/firebase';
import { ApiKey } from '../types';
import { 
  Play, 
  Copy, 
  Check, 
  RefreshCw, 
  Server, 
  Clock, 
  FileJson,
  Key,
  Terminal,
  Globe,
  History,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/common/SEOHead';
import { logger } from '../lib/logger';

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
  const { user, isAdmin } = useAuth();
  
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
  const [timeoutMs] = useState<number>(10000);
  const [userAgentType] = useState<'desktop' | 'mobile' | 'catalystbot'>('desktop');
  const [customBrandHeader, setCustomBrandHeader] = useState<string>('');
  
  // Raw JSON editor text
  const [rawJsonPayload, setRawJsonPayload] = useState<string>('');
  
  // Authentication setup
  const [authMode, setAuthMode] = useState<'session' | 'apiKey' | 'custom'>('session');
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [customHeaderKey] = useState<string>('');
  const [customHeaderVal] = useState<string>('');
  
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
          logger.error("Error loading keys in playground:", e);
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
    const computedCost = activeEngine.cost;

    try {
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

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });
      setResponseHeaders(resHeaders);

      const data = await res.json();
      setResponsePayload(data);

      const size = new Blob([JSON.stringify(data)]).size;
      setResponseSizeKb(Number((size / 1024).toFixed(2)));

      recordClientRequestAttempt(computedCost, user, isAdmin);
      const updatedStatus = getRateLimitStatus(user, isAdmin);
      setRateStatus(updatedStatus);

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
logger.debug('Status:', data.success);
logger.debug('Engine Output:', data.output);`;
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
    <div className="min-h-screen bg-background pb-24 text-foreground selection:bg-primary selection:text-primary-foreground">
      <SEOHead
        title="Live REST API Playground"
        description="Interactive REST test harness for single diagnostic engines and composite master audits."
        keywords={['API playground', 'REST test harness', 'audit API', 'telemetry endpoint']}
        canonicalUrl="https://www.catalystlab.tech/playground"
      />
      
      {/* Top Header Hero */}
      <section className="relative overflow-hidden border-b border-border bg-muted px-4 py-10 sm:py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--app-card)_0%,var(--app-background)_65%,var(--app-muted)_100%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e125_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e125_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background border border-border/90 text-foreground shadow-xs backdrop-blur-md">
                <Terminal className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-sans">
                    Engine Test{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      Playground
                    </span>
                  </h1>
                  <span className="rounded-full bg-accent/80 border border-border/80 px-3 py-1 text-xs font-mono font-bold text-foreground">
                    {endpointPath}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-mono">
                  Interactive REST test harness for single diagnostic engines and composite master audits.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-3 font-mono">
              <Link
                to="/dashboard?tab=api-keys"
                className="flex items-center gap-2 rounded-xl border border-border bg-background hover:bg-muted px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all shadow-xs"
              >
                <Key className="h-3.5 w-3.5 text-amber-500" />
                <span>API Keys &amp; White-Label</span>
              </Link>
              
              <Link
                to="/api-docs"
                className="flex items-center gap-2 rounded-xl border border-border bg-background hover:bg-muted px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all shadow-xs"
              >
                <FileJson className="h-3.5 w-3.5 text-blue-600" />
                <span>OpenAPI Docs</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-5 space-y-5">

        {/* Rate Limit Alert Component */}
        <RateLimitThresholdAlert 
          currentStatus={rateStatus} 
          endpointPath={endpointPath}
          showAllStates={true}
        />

        {/* Engine Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin font-mono">
          {ENGINE_OPTIONS.map((eng) => {
            const isSelected = selectedEngineId === eng.id;
            return (
              <button
                key={eng.id}
                onClick={() => handleEngineChange(eng.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  isSelected
                    ? 'border-border bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${
                  eng.id === 'master' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <span>{eng.name}</span>
                <span className={`text-[10px] px-1 py-0.5 rounded ${
                  isSelected ? 'bg-accent text-foreground' : 'bg-accent text-muted-foreground'
                }`}>
                  {eng.cost} {eng.cost === 1 ? 'unit' : 'units'}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Split: Request Builder & Response Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* LEFT COLUMN: REQUEST PAYLOAD BUILDER */}
          <div className="lg:col-span-5 space-y-4 font-mono">
            
            <div className="rounded-2xl border border-border bg-background p-4 shadow-xl space-y-3.5">
              
              {/* Header & Mode Switch */}
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-foreground" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Request Payload Builder
                  </h3>
                </div>

                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border">
                  <button
                    onClick={() => setBuilderMode('visual')}
                    className={`px-2 py-0.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                      builderMode === 'visual'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setBuilderMode('json')}
                    className={`px-2 py-0.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                      builderMode === 'json'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Raw JSON
                  </button>
                </div>
              </div>

              {/* Endpoint Banner Info */}
              <div className="rounded-xl bg-muted border border-border p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">POST</span>
                    <span>{endpointPath}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    Cost: {activeEngine.cost} Unit
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                  {activeEngine.description}
                </p>
              </div>

              {/* VISUAL BUILDER CONTROLS */}
              {builderMode === 'visual' ? (
                <div className="space-y-3">
                  
                  {/* Target URL Input */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      Target Domain / URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="url"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full rounded-xl border border-border bg-muted pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Engine Parameter (if single engine) */}
                  {!isMaster && (
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Diagnostic Engine
                      </label>
                      <select
                        value={selectedEngineId}
                        onChange={(e) => handleEngineChange(e.target.value)}
                        className="w-full rounded-xl border border-border bg-muted px-3 py-1.5 text-xs text-foreground focus:outline-none"
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
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Global Edge PoP Regions
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
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
                              className={`rounded-lg border px-1.5 py-1 text-[11px] text-center transition-colors cursor-pointer ${
                                active
                                  ? 'border-border bg-primary text-primary-foreground font-bold'
                                  : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
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
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted p-2.5">
                    <div>
                      <div className="text-xs font-bold text-foreground">Bypass Server Cache (forceFresh)</div>
                      <div className="text-[10px] text-muted-foreground font-sans">Forces a live DNS/HTTP probe bypass</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={forceFresh}
                      onChange={(e) => setForceFresh(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border bg-background text-foreground focus:ring-0"
                    />
                  </div>

                  {/* White-Label Custom Brand Tag */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      White-Label Custom Brand Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Telemetry Enterprise"
                      value={customBrandHeader}
                      onChange={(e) => setCustomBrandHeader(e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none"
                    />
                  </div>

                </div>
              ) : (
                /* RAW JSON EDITOR */
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>payload.json</span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(rawJsonPayload);
                          setRawJsonPayload(JSON.stringify(parsed, null, 2));
                        } catch (e) { logger.error("Ignored error:", e); }
                      }}
                      className="text-foreground hover:underline cursor-pointer"
                    >
                      Prettify JSON
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={rawJsonPayload}
                    onChange={(e) => setRawJsonPayload(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted p-3 text-xs font-mono text-foreground focus:outline-none focus:border-border"
                    placeholder="{\n  &quot;engine&quot;: &quot;health&quot;,\n  &quot;url&quot;: &quot;https://example.com&quot;\n}"
                  />
                </div>
              )}

              {/* AUTHENTICATION & HEADER ACCORDION */}
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Key className="h-3 w-3 text-amber-500" />
                    <span>Auth Headers</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setAuthMode('session')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${authMode === 'session' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}
                    >
                      Session
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('apiKey')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${authMode === 'apiKey' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}
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
                        className="w-full rounded-xl border border-border bg-muted px-3 py-1.5 text-xs text-foreground"
                      >
                        {userApiKeys.map((k) => (
                          <option key={k.id} value={k.keyPrefix.replace('...', '')}>
                            {k.name} ({k.keyPrefix})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">
                        <span>No saved keys found.</span>
                        <Link to="/dashboard?tab=api-keys" className="font-bold underline">
                          Generate Key
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground">
                    Executing context: <strong className="text-foreground">{user?.email || 'Anonymous Client'}</strong> ({rateStatus.tierLabel})
                  </div>
                )}
              </div>

              {/* EXECUTE BUTTON */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleRunEngine}
                  disabled={executing || (rateStatus.remaining <= 0 && !isAdmin)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                    rateStatus.remaining <= 0 && !isAdmin
                      ? 'bg-rose-600 border border-rose-500 cursor-not-allowed opacity-80'
                      : 'bg-primary hover:bg-primary-hover border border-border'
                  }`}
                >
                  {executing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-foreground" />
                      <span>Executing Diagnostic Engine...</span>
                    </>
                  ) : rateStatus.remaining <= 0 && !isAdmin ? (
                    <>
                      <Flame className="h-3.5 w-3.5 text-amber-300" />
                      <span>Rate Limit Exceeded (0 Units Left)</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                      <span>Dispatch Request ({activeEngine.cost} Unit)</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Quick Historical Requests Log */}
            {history.length > 0 && (
              <div className="rounded-2xl border border-border bg-background p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <History className="h-3.5 w-3.5 text-foreground" />
                    <span>Recent Session Probes ({history.length})</span>
                  </div>
                  <button
                    onClick={() => setHistory([])}
                    className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-1 max-h-44 overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadFromHistory(item)}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-accent border border-transparent hover:border-border cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded ${
                          item.status === 200 ? 'bg-emerald-50 text-emerald-500 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {item.status}
                        </span>
                        <span className="font-semibold text-foreground truncate">{item.engine}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                        <span>{item.latencyMs}ms</span>
                        <RotateCcw className="h-3 w-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: RESPONSE INSPECTOR */}
          <div className="lg:col-span-7 space-y-4 font-mono">
            
            <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-xl flex flex-col min-h-[560px]">
              
              {/* Response Inspector Tab Header */}
              <div className="border-b border-border bg-muted px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-foreground" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Response Inspector
                    </span>
                  </div>

                  {responseStatus !== null && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        responseStatus === 200 
                          ? 'bg-emerald-50 text-emerald-500 border border-emerald-200'
                          : responseStatus === 429
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-amber-50 text-amber-500 border border-amber-200'
                      }`}>
                        {responseStatus} {responseStatusText}
                      </span>

                      {responseTimeMs !== null && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          {responseTimeMs}ms
                        </span>
                      )}

                      {responseSizeKb !== null && (
                        <span className="text-[10px] text-muted-foreground">
                          • {responseSizeKb}KB
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
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors capitalize cursor-pointer ${
                        inspectorTab === tab
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      {tab === 'snippets' ? 'SDK Snippet' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Inspector Body Area */}
              <div className="flex-1 p-4 overflow-auto">
                
                {executing ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-black mb-3" />
                    <h4 className="text-sm font-bold text-foreground">Dispatching Probe to CatalystLab Engines</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm font-sans">
                      Executing SSL handshake, network latency, and security headers diagnostics...
                    </p>
                  </div>
                ) : !responsePayload && responseStatus === null ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Terminal className="h-10 w-10 text-muted-foreground mb-3" />
                    <h4 className="text-sm font-bold text-foreground">Ready for Engine Execution</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm font-sans">
                      Configure your payload on the left and click <strong className="text-foreground">Dispatch Request</strong> to inspect real-time JSON responses and telemetry.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* TAB 1: VISUAL TELEMETRY CARD */}
                    {inspectorTab === 'visual' && (
                      <div className="space-y-3.5">
                        
                        {/* Score & Health Header */}
                        {responsePayload?.score !== undefined || responsePayload?.output?.score !== undefined ? (
                          <div className="rounded-xl bg-muted border border-border p-4 text-foreground shadow-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">
                                  Diagnostic Score
                                </span>
                                <div className="text-2xl font-black mt-0.5">
                                  {responsePayload?.score ?? responsePayload?.output?.score ?? 95}
                                  <span className="text-xs font-normal text-muted-foreground"> / 100</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs font-bold text-foreground">
                                  {responsePayload?.engine || selectedEngineId.toUpperCase()} ENGINE
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-xs">
                                  {targetUrl}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* Rate Limit Remaining Callout in Output */}
                        {responsePayload?.rateLimit && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-emerald-500" />
                              <span>
                                Daily Units Remaining: <strong>{responsePayload.rateLimit.remaining} / {responsePayload.rateLimit.limit}</strong>
                              </span>
                            </div>
                            <span className="text-[11px] text-emerald-500">
                              Resets in {responsePayload.rateLimit.resetInSeconds}s
                            </span>
                          </div>
                        )}

                        {/* Telemetry Output Summary */}
                        <div className="rounded-xl border border-border bg-muted p-3.5">
                          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                            Parsed Output Summary
                          </h4>

                          {responsePayload?.output ? (
                            <div className="space-y-2 text-xs">
                              {Object.entries(responsePayload.output).map(([key, val]) => {
                                if (typeof val === 'object' && val !== null) {
                                  return (
                                    <div key={key} className="border-b border-border pb-2">
                                      <span className="font-bold text-foreground">{key}:</span>
                                      <pre className="mt-1 rounded bg-background p-2 text-xs font-mono text-muted-foreground overflow-x-auto border border-border">
                                        {JSON.stringify(val, null, 2)}
                                      </pre>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={key} className="flex items-center justify-between border-b border-border pb-1">
                                    <span className="text-muted-foreground">{key}</span>
                                    <span className="font-bold text-foreground">{String(val)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <pre className="rounded bg-background p-3 text-xs font-mono text-muted-foreground border border-border">
                              {JSON.stringify(responsePayload, null, 2)}
                            </pre>
                          )}
                        </div>

                      </div>
                    )}

                    {/* TAB 2: STRUCTURED JSON VIEWER */}
                    {inspectorTab === 'json' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Content-Type: application/json
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(responsePayload, null, 2));
                              setCopiedResponse(true);
                              setTimeout(() => setCopiedResponse(false), 2000);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent cursor-pointer"
                          >
                            {copiedResponse ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-muted-foreground" />
                                <span>Copy JSON</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="rounded-xl bg-background p-3.5 text-xs font-mono text-foreground overflow-x-auto border border-border shadow-inner max-h-[440px]">
                          <pre>{JSON.stringify(responsePayload, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: RESPONSE HEADERS */}
                    {inspectorTab === 'headers' && (
                      <div className="space-y-2.5">
                        <div className="text-xs font-bold text-foreground mb-1.5">
                          HTTP Response Headers
                        </div>
                        <div className="rounded-xl border border-border overflow-x-auto bg-background">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-muted border-b border-border text-xs font-bold text-muted-foreground">
                              <tr>
                                <th className="px-3.5 py-2">Header Name</th>
                                <th className="px-3.5 py-2">Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {Object.entries(responseHeaders).length > 0 ? (
                                Object.entries(responseHeaders).map(([key, val]) => (
                                  <tr key={key} className="hover:bg-muted">
                                    <td className="px-3.5 py-1.5 text-foreground font-semibold">{key}</td>
                                    <td className="px-3.5 py-1.5 text-foreground break-all">{val}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={2} className="px-3.5 py-3 text-center text-muted-foreground">
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
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {(['curl', 'javascript', 'python', 'go'] as const).map((lang) => (
                              <button
                                key={lang}
                                onClick={() => setCodeSnippetLang(lang)}
                                className={`px-2 py-0.5 text-xs font-bold uppercase rounded transition-colors cursor-pointer ${
                                  codeSnippetLang === lang
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-muted text-muted-foreground hover:text-foreground'
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
                            className="flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent cursor-pointer"
                          >
                            {copiedSnippet ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-muted-foreground" />
                                <span>Copy Snippet</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="rounded-xl bg-background p-3.5 text-xs font-mono text-foreground overflow-x-auto border border-border shadow-inner max-h-[440px]">
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
