import { EngineInput } from "../../components/common/EngineInput";
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Play, 
  Terminal, 
  RotateCw, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Code2, 
  ShieldCheck, 
  Clock, 
  Server, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Key,
  Globe,
  Sliders,
  FileJson,
  Zap,
  Activity
} from 'lucide-react';
import { PlaygroundNavSidebar, PLAYGROUND_ENGINES } from '../../components/playground/PlaygroundNavSidebar';
import { ENGINES_MAP } from '../../data/engines';
import { 
  getRateLimitStatus, 
  recordClientRequestAttempt, 
  RateLimitStatus,
  SINGLE_ENGINE_COST,
  MASTER_AUDIT_COST,
  getVisitorDeviceId
} from '../../utils/rateLimiter';
import { getApiKeys } from '../../lib/firebase';
import { ApiKey } from '../../types';
import { RateLimitThresholdAlert } from '../../components/RateLimitThresholdAlert';

export const EnginePlaygroundPage: React.FC = () => {
  const { engineId } = useParams<{ engineId: string }>();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();

  const activeEngineConfig = PLAYGROUND_ENGINES.find(e => e.id === engineId);

  // If engineId is not valid, fallback to 'master'
  if (!activeEngineConfig) {
    return <Navigate to="/playground/master" replace />;
  }

  const initialUrl = searchParams.get('url') || 'https://example.com';
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [jsonResponse, setJsonResponse] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rate Limiter
  const [rateStatus, setRateStatus] = useState<RateLimitStatus>(() => getRateLimitStatus(user, isAdmin));
  const [rateLimitAlertOpen, setRateLimitAlertOpen] = useState(false);

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');

  // Code Generator language selector (No tabview!)
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'python' | 'go'>('curl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getApiKeys(user.uid).then(keys => {
        setApiKeys(keys);
        if (keys.length > 0) {
          setSelectedApiKey(keys[0].secretKey || keys[0].keyPrefix);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    // Reset outputs when switching engines
    setOutput('');
    setJsonResponse(null);
    setStatusCode(null);
    setResponseTimeMs(null);
    setErrorMsg(null);
  }, [engineId]);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    // Check rate limits
    const currentRate = getRateLimitStatus(user, isAdmin);
    const requiredCost = activeEngineConfig.cost;

    if (!currentRate.isUnlimited && currentRate.remaining < requiredCost) {
      setRateLimitAlertOpen(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setOutput(`[INFO] Initializing CatalystLab Python runtime for engine: ${activeEngineConfig.id}...\n[INFO] Target: ${targetUrl}\n[INFO] Dispatching sandboxed execution worker...`);
    setJsonResponse(null);
    setStatusCode(null);
    setResponseTimeMs(null);

    const startTime = performance.now();

    try {
      // Execute request
      const endpointPath = activeEngineConfig.id === 'master' ? '/api/run-master-audit' : '/api/run-engine';
      const payload = activeEngineConfig.id === 'master' 
        ? { url: targetUrl.trim() }
        : { url: targetUrl.trim(), engine: activeEngineConfig.id };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (selectedApiKey) {
        headers['X-API-Key'] = selectedApiKey;
      }

      const res = await fetch(endpointPath, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const endTime = performance.now();
      setResponseTimeMs(Math.round(endTime - startTime));
      setStatusCode(res.status);

      const data = await res.json();
      setJsonResponse(data);

      if (data.output) {
        setOutput(data.output);
      } else if (data.message) {
        setOutput(`[RESPONSE] ${data.message}\n` + JSON.stringify(data, null, 2));
      } else {
        setOutput(JSON.stringify(data, null, 2));
      }

      // Record client rate attempt
      recordClientRequestAttempt(requiredCost, user, isAdmin);
      setRateStatus(getRateLimitStatus(user, isAdmin));
    } catch (err: unknown) {
      console.error('Playground execution error:', err);
      setErrorMsg(err.message || 'Execution failed. Please check network connectivity.');
      setOutput(prev => `${prev}\n[ERROR] Execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate runnable code snippets based on selected language
  const generateSnippet = () => {
    const baseUrl = 'https://api.catalystlab.io/v1';
    const path = activeEngineConfig.id === 'master' ? '/api/run-master-audit' : '/api/run-engine';
    const bodyObj = activeEngineConfig.id === 'master'
      ? { url: targetUrl }
      : { url: targetUrl, engine: activeEngineConfig.id };

    if (codeLanguage === 'curl') {
      return `curl -X POST "${baseUrl}${path}" \\
  -H "Content-Type: application/json"${selectedApiKey ? ` \\\n  -H "X-API-Key: ${selectedApiKey}"` : ''} \\
  -d '${JSON.stringify(bodyObj)}'`;
    }

    if (codeLanguage === 'javascript') {
      return `const response = await fetch("${baseUrl}${path}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",${selectedApiKey ? `\n    "X-API-Key": "${selectedApiKey}",` : ''}
  },
  body: JSON.stringify(${JSON.stringify(bodyObj, null, 2)})
});

const data = await response.json();
console.log(data);`;
    }

    if (codeLanguage === 'python') {
      return `import requests

url = "${baseUrl}${path}"
headers = {
    "Content-Type": "application/json",${selectedApiKey ? `\n    "X-API-Key": "${selectedApiKey}",` : ''}
}
payload = ${JSON.stringify(bodyObj, null, 4)}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code)
print(response.json())`;
    }

    if (codeLanguage === 'go') {
      return `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "${baseUrl}${path}"
	payload, _ := json.Marshal(map[string]string{
		"url": "${targetUrl}",${activeEngineConfig.id !== 'master' ? `\n		"engine": "${activeEngineConfig.id}",` : ''}
	})

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")${selectedApiKey ? `\n	req.Header.Set("X-API-Key", "${selectedApiKey}")` : ''}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;
    }

    return '';
  };

  const codeSnippet = generateSnippet();

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#0b192c]">
      {/* Rate Limit Modal Alert */}
      {rateLimitAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0b192c]">Rate Limit Exceeded</h3>
              <button onClick={() => setRateLimitAlertOpen(false)} className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">✕</button>
            </div>
            <RateLimitThresholdAlert currentStatus={rateStatus} />
            <div className="flex justify-end">
              <button
                onClick={() => setRateLimitAlertOpen(false)}
                className="rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="border-b border-[#e2e8f0] bg-white pt-10 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <Link to="/playground" className="hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                Playground
              </Link>
              <span>/</span>
              <span className="text-[#0b192c] font-bold">{activeEngineConfig.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#0b192c]">
                    {activeEngineConfig.name} Console
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-100 text-sky-800">
                    {activeEngineConfig.category}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Execute sandboxed live scans, stream logs, inspect raw telemetry JSON, and export production cURL commands.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/playground"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>All Consoles</span>
                </Link>
                <Link
                  to="/api-reference/category/engines"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 border border-sky-200 px-3.5 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Code2 className="h-3.5 w-3.5 text-sky-600" />
                  <span>API Docs</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <PlaygroundNavSidebar />

          {/* Execution Body */}
          <div className="flex-1 space-y-8 min-w-0">
            
            {/* Target Configuration Card */}
            <section className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-[#415a77]" />
                  <h2 className="text-lg font-bold text-[#0b192c]">Request Parameters</h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
                  <span>Quota Cost:</span>
                  <strong className="text-[#0b192c] bg-gray-100 px-2 py-0.5 rounded">
                    {activeEngineConfig.cost} scan credit
                  </strong>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-gray-500">
                    Remaining Quota: <strong className="text-gray-900">{rateStatus.isUnlimited ? "Unlimited" : rateStatus.remaining}</strong> scans
                  </div>
                  <div className="w-full sm:w-1/3">
                    {apiKeys.length > 0 ? (
                      <select
                        value={selectedApiKey}
                        onChange={(e) => setSelectedApiKey(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs font-mono text-gray-800 focus:border-sky-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">Visitor Session (No Key)</option>
                        {apiKeys.map((k) => {
                          const keyString = k.secretKey || k.keyPrefix;
                          return (
                            <option key={k.id} value={keyString}>
                              {k.name} ({keyString.slice(0, 10)}...)
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-[11px] text-gray-500 flex items-center justify-between">
                        <span>No saved API keys</span>
                        <Link to="/dashboard" className="text-sky-700 font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                          Create
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <EngineInput 
                  value={targetUrl}
                  onChange={setTargetUrl}
                  onSubmit={handleRunTest}
                  isLoading={loading}
                  buttonText="Send Request"
                  loadingText="Executing Microagent..."
                  placeholder="@catalystlab-search: (https://"
                />
              </div>
            </section>

            {/* Execution Telemetry & Terminal Output */}
            <section className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <Terminal className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h2 className="text-lg font-bold text-[#0b192c]">Live Execution Console</h2>
                    <p className="text-[11px] text-gray-500 font-mono">
                      Runtime: Python 3.11 Container • Sandboxed VM
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  {statusCode !== null && (
                    <span className={`px-2.5 py-1 rounded-lg font-bold ${
                      statusCode >= 200 && statusCode < 300 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      Status: {statusCode}
                    </span>
                  )}
                  {responseTimeMs !== null && (
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 font-bold">
                      {responseTimeMs} ms
                    </span>
                  )}
                </div>
              </div>

              {/* Terminal View */}
              <div className="rounded-2xl bg-[#0b192c] p-4 text-xs font-mono text-gray-200 overflow-x-auto min-h-[160px] border border-[#415a77]/30 shadow-inner">
                {loading && (
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing pipeline stages...</span>
                  </div>
                )}
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                  {output || '[INFO] Ready to execute. Enter parameters above and click "Send Request".'}
                </pre>
              </div>
            </section>

            {/* Structured JSON Response Inspector */}
            {jsonResponse && (
              <section className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-[#0b192c]">Parsed JSON Response Payload</h2>
                  </div>

                  <button
                    onClick={() => handleCopy('json', JSON.stringify(jsonResponse, null, 2))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    {copiedKey === 'json' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-2xl bg-[#0b192c] p-4 text-xs font-mono text-gray-200 overflow-x-auto border border-[#415a77]/30 max-h-[400px]">
                  <pre className="text-sky-300 leading-relaxed">
                    {JSON.stringify(jsonResponse, null, 2)}
                  </pre>
                </div>
              </section>
            )}

            {/* Copyable cURL & SDK Snippet Generator (Language dropdown, NO TABVIEW!) */}
            <section className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-[#415a77]" />
                  <h2 className="text-lg font-bold text-[#0b192c]">Code Export</h2>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="code-lang-select" className="text-xs font-semibold text-gray-600">
                    Format:
                  </label>
                  <select
                    id="code-lang-select"
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value as any)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-800 shadow-sm focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="curl">cURL (CLI)</option>
                    <option value="javascript">JavaScript (Fetch)</option>
                    <option value="python">Python (Requests)</option>
                    <option value="go">Go (HTTP)</option>
                  </select>

                  <button
                    onClick={() => handleCopy('code', codeSnippet)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    {copiedKey === 'code' ? (
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
                <pre className="text-amber-300 whitespace-pre leading-relaxed">
                  {codeSnippet}
                </pre>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
