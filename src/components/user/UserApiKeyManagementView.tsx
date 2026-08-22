import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getApiKeys, 
  createApiKey, 
  rotateApiKey, 
  revokeApiKey, 
  deleteApiKey 
} from '../../lib/firebase';
import { ApiKey, ApiKeyScope, ApiKeyEnvironment, WhiteLabelConfig } from '../../types';
import { 
  Key, 
  Plus, 
  RotateCw, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Globe, 
  Code2, 
  CheckCircle2, 
  X,
  Layers,
  Send,
  Zap,
  Tag,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ALL_SCOPES: { id: ApiKeyScope; label: string; description: string }[] = [
  { id: 'execute:engines', label: 'Execute Single Engines', description: 'Run individual diagnostic engines via /api/run-engine' },
  { id: 'execute:master-audit', label: 'Execute Master Audits', description: 'Trigger composite 8-engine evaluations via /api/v1/audit/master' },
  { id: 'read:reports', label: 'Read Reports & Dossiers', description: 'Retrieve permanent telemetry dossiers and exports' },
  { id: 'read:monitoring', label: 'Read Uptime & Probes', description: 'Access automated multi-PoP latency and health probes' },
  { id: 'manage:webhooks', label: 'Webhook Dispatch', description: 'Trigger automated CI/CD notifications and alerts' }
];

export const UserApiKeyManagementView: React.FC = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [revealedSecretKey, setRevealedSecretKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState<string>('');
  
  // Rotating/Revoking states
  const [keyToRotate, setKeyToRotate] = useState<ApiKey | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for creation
  const [formName, setFormName] = useState('');
  const [formEnvironment, setFormEnvironment] = useState<ApiKeyEnvironment>('production');
  const [formScopes, setFormScopes] = useState<ApiKeyScope[]>(['execute:engines', 'execute:master-audit', 'read:reports']);
  const [formExpirationDays, setFormExpirationDays] = useState<number | 0>(90); // 0 = never
  const [formOrgName, setFormOrgName] = useState('');
  const [formBrandHeader, setFormBrandHeader] = useState('');
  const [formWebhookUrl, setFormWebhookUrl] = useState('');

  // Code sample preview state
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showMaskedSecret, setShowMaskedSecret] = useState(false);
  const [selectedSnippetKey, setSelectedSnippetKey] = useState<ApiKey | null>(null);
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'python' | 'go'>('curl');
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);

  const loadKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApiKeys(user?.uid);
      setKeys(data);
      if (data.length > 0 && !selectedSnippetKey) {
        setSelectedSnippetKey(data[0]);
      }
    } catch (err: unknown) {
      console.error("Error loading API keys:", err);
      setError("Failed to load API keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [user]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setActionLoading(true);
    try {
      const whiteLabelConfig: WhiteLabelConfig = {};
      if (formOrgName.trim()) whiteLabelConfig.organizationName = formOrgName.trim();
      if (formBrandHeader.trim()) whiteLabelConfig.brandHeaderName = formBrandHeader.trim();
      if (formWebhookUrl.trim()) whiteLabelConfig.customWebhookUrl = formWebhookUrl.trim();

      const result = await createApiKey({
        name: formName.trim(),
        environment: formEnvironment,
        scopes: formScopes,
        expiresInDays: formExpirationDays === 0 ? undefined : formExpirationDays,
        whiteLabelConfig
      });

      setNewKeyName(result.apiKey.name);
      setRevealedSecretKey(result.secretKey);
      setShowCreateModal(false);
      setShowSecretModal(true);

      // Reset form
      setFormName('');
      setFormOrgName('');
      setFormBrandHeader('');
      setFormWebhookUrl('');
      setFormScopes(['execute:engines', 'execute:master-audit', 'read:reports']);

      await loadKeys();
    } catch (err: unknown) {
      alert("Error generating API key: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRotateConfirm = async () => {
    if (!keyToRotate) return;
    setActionLoading(true);
    try {
      const result = await rotateApiKey(keyToRotate.id);
      setNewKeyName(keyToRotate.name + ' (Rotated)');
      setRevealedSecretKey(result.newSecretKey);
      setKeyToRotate(null);
      setShowSecretModal(true);
      await loadKeys();
    } catch (err: unknown) {
      alert("Error rotating API key: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!keyToRevoke) return;
    setActionLoading(true);
    try {
      await revokeApiKey(keyToRevoke.id);
      setKeyToRevoke(null);
      await loadKeys();
    } catch (err: unknown) {
      alert("Error revoking key: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!keyToDelete) return;
    setActionLoading(true);
    try {
      await deleteApiKey(keyToDelete.id);
      setKeyToDelete(null);
      await loadKeys();
    } catch (err: unknown) {
      alert("Error deleting key: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, keyId?: string) => {
    navigator.clipboard.writeText(text);
    if (keyId) {
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const toggleScope = (scopeId: ApiKeyScope) => {
    setFormScopes(prev => 
      prev.includes(scopeId) ? prev.filter(s => s !== scopeId) : [...prev, scopeId]
    );
  };

  const activeKeyForSnippet = selectedSnippetKey || keys[0];
  const sampleKeyStr = activeKeyForSnippet?.keyPrefix.replace('...', '') || 'cat_live_sample_token_secret_hex';

  const generateSnippet = () => {
    if (codeLanguage === 'curl') {
      return `curl -X POST "https://catalystlab.tech/api/run-engine" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${sampleKeyStr}" \\
  -d '{
    "engine": "health",
    "url": "https://example.com"
  }'`;
    }
    if (codeLanguage === 'javascript') {
      return `const response = await fetch('https://catalystlab.tech/api/run-engine', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': '${sampleKeyStr}'
  },
  body: JSON.stringify({
    engine: 'health',
    url: 'https://example.com'
  })
});

const data = await response.json();
console.log('Engine Telemetry:', data.output);`;
    }
    if (codeLanguage === 'python') {
      return `import requests

url = "https://catalystlab.tech/api/run-engine"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "${sampleKeyStr}"
}
payload = {
    "engine": "health",
    "url": "https://example.com"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Score:", data.get("rateLimit"))
print("Output:", data.get("output"))`;
    }
    if (codeLanguage === 'go') {
      return `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	url := "https://catalystlab.tech/api/run-engine"
	payload, _ := json.Marshal(map[string]string{
		"engine": "health",
		"url":    "https://example.com",
	})

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", "${sampleKeyStr}")

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
    <div className="space-y-8" id="user-api-key-management-section">
      {/* Top Header & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b192c] text-white shadow-sm">
              <Key className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0b192c]">
                Developer API Keys & White-Label Access
              </h2>
              <p className="text-xs text-[#415a77]">
                Generate secret API credentials to automate CI/CD quality gates, webhook notifications, or white-labeled SaaS telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/playground"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#415a77]/30 bg-white px-3.5 py-2 text-xs font-semibold text-[#0b192c] hover:bg-[#f8fafc] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Terminal className="h-4 w-4 text-blue-600" />
            <span>Open API Playground</span>
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-all active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Plus className="h-4 w-4 text-amber-300" />
            <span>Generate New API Key</span>
          </button>
        </div>
      </div>

      {/* Pro API Tier Information Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4.5">
          <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
            <Zap className="h-4 w-4 text-emerald-600" />
            <span>500 Compute Units / Day</span>
          </div>
          <p className="mt-1.5 text-xs text-emerald-800 leading-relaxed">
            API keys operate on the Pro compute tier, supporting up to 50 Master Audits or 500 individual engine scans every 24 hours.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-50/50 p-4.5">
          <div className="flex items-center gap-2.5 text-blue-900 font-bold text-sm">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span>White-Label Branding</span>
          </div>
          <p className="mt-1.5 text-xs text-blue-800 leading-relaxed">
            Include your organization name, custom telemetry response headers (<code className="text-[11px] font-mono font-semibold">X-WhiteLabel-Brand</code>), and custom webhook endpoints.
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-50/50 p-4.5">
          <div className="flex items-center gap-2.5 text-indigo-900 font-bold text-sm">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>Zero-Downtime Key Rotation</span>
          </div>
          <p className="mt-1.5 text-xs text-indigo-800 leading-relaxed">
            Seamlessly rotate credentials without breaking staging or production pipelines. Revoke compromised keys with 1-click.
          </p>
        </div>
      </div>

      {/* Active API Keys Table / Card Section */}
      <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
        <div className="border-b border-[#e2e8f0] bg-[#f8fafc] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-[#415a77]" />
            <span className="text-xs font-bold text-[#0b192c] uppercase tracking-wider">
              Configured API Keys ({keys.length})
            </span>
          </div>
          <span className="text-xs text-[#64748b]">
            Header: <code className="font-mono text-[#0b192c] font-semibold">X-API-Key: cat_live_...</code>
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#64748b]">
            <RotateCw className="h-6 w-6 animate-spin mx-auto text-[#415a77] mb-2" />
            <span>Loading API key credentials...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center">
            <Key className="h-10 w-10 text-[#94a3b8] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#0b192c]">No API Keys Generated Yet</h3>
            <p className="text-xs text-[#64748b] mt-1 max-w-sm mx-auto">
              Create an API key to run headless audits from your CI/CD pipelines, terminal scripts, or external dashboards.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Plus className="h-4 w-4 text-amber-300" />
              <span>Create First Key</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9] overflow-x-auto">
            {keys.map((apiKey) => {
              const isRevoked = apiKey.status === 'revoked';
              const isExpired = apiKey.expiresAt && apiKey.expiresAt < Date.now();
              const isSnippetSelected = selectedSnippetKey?.id === apiKey.id;

              return (
                <div 
                  key={apiKey.id}
                  className={`p-5 transition-colors ${isSnippetSelected ? 'bg-blue-50/30' : 'hover:bg-[#fafafa]'}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Key Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-sm text-[#0b192c]">
                          {apiKey.name}
                        </span>

                        {/* Environment Tag */}
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                          apiKey.environment === 'production' 
                            ? 'border-purple-300 bg-purple-50 text-purple-700' 
                            : apiKey.environment === 'staging'
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-slate-300 bg-slate-50 text-slate-700'
                        }`}>
                          {apiKey.environment}
                        </span>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          isRevoked
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : isExpired
                            ? 'border-amber-300 bg-amber-50 text-amber-700'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        }`}>
                          {isRevoked ? (
                            <>
                              <ShieldAlert className="h-3 w-3" />
                              <span>Revoked</span>
                            </>
                          ) : isExpired ? (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>Expired</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3 w-3" />
                              <span>Active</span>
                            </>
                          )}
                        </span>

                        {/* White-Label Tag if configured */}
                        {apiKey.whiteLabelConfig?.organizationName && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#0b192c]/5 text-[#0b192c] border border-[#0b192c]/20 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-blue-600" />
                            <span>{apiKey.whiteLabelConfig.organizationName}</span>
                          </span>
                        )}
                      </div>

                      {/* Key Prefix & Copy Box */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-lg bg-[#f1f5f9] px-2.5 py-1 font-mono text-xs text-[#334155] border border-[#e2e8f0]">
                          <Key className="h-3 w-3 text-[#64748b]" />
                          <span>{apiKey.keyPrefix}</span>
                          <button
                            onClick={() => copyToClipboard(apiKey.keyPrefix.replace('...', ''), apiKey.id)}
                            className="text-[#64748b] hover:text-[#0b192c] transition-colors ml-1 p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            title="Copy Key Prefix"
                          >
                            {copiedKeyId === apiKey.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="text-[11px] text-[#64748b]">
                          Limit: <strong className="text-[#0b192c] font-mono">{apiKey.dailyComputeLimit || 500} units/day</strong>
                        </div>
                      </div>

                      {/* Scopes Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-[#64748b] mr-1">Scopes:</span>
                        {apiKey.scopes?.map((scope) => (
                          <span 
                            key={scope}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700 border border-slate-200"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>

                      {/* Timestamps */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#94a3b8] pt-1">
                        <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                        {apiKey.lastRotatedAt && (
                          <span>• Rotated: {new Date(apiKey.lastRotatedAt).toLocaleDateString()}</span>
                        )}
                        {apiKey.expiresAt ? (
                          <span>• Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</span>
                        ) : (
                          <span>• Never Expires</span>
                        )}
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedSnippetKey(apiKey)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          isSnippetSelected 
                            ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                            : 'border-[#cbd5e1] bg-white text-[#334155] hover:bg-[#f1f5f9]'
                        }`}
                        title="View Code Snippets for this Key"
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        <span>Code Snippet</span>
                      </button>

                      {!isRevoked && (
                        <button
                          onClick={() => setKeyToRotate(apiKey)}
                          className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                          title="Rotate this API Key with zero downtime"
                        >
                          <RotateCw className="h-3.5 w-3.5 text-amber-600" />
                          <span>Rotate</span>
                        </button>
                      )}

                      {!isRevoked ? (
                        <button
                          onClick={() => setKeyToRevoke(apiKey)}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                          title="Revoke this API Key immediately"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                          <span>Revoke</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setKeyToDelete(apiKey)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                          title="Delete key record"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-slate-500" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Integration Code Generator Box */}
      {keys.length > 0 && (
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-[#0b192c]">
                  Integration Snippet for {activeKeyForSnippet?.name || 'Selected Key'}
                </h3>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Copy pre-formatted code to call CatalystLab engine endpoints directly from your code.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['curl', 'javascript', 'python', 'go'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeLanguage(lang)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase font-mono transition-colors ${
                    codeLanguage === lang 
                      ? 'bg-[#0b192c] text-white shadow-sm'
                      : 'bg-[#f1f5f9] text-[#64748b] hover:text-[#0b192c]'
                  }`}
                >
                  {lang}
                </button>
              ))}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateSnippet());
                  setCopiedCodeSnippet(true);
                  setTimeout(() => setCopiedCodeSnippet(false), 2000);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-[#cbd5e1] bg-white px-3 py-1 text-xs font-semibold text-[#0b192c] hover:bg-[#f8fafc] shadow-sm ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {copiedCodeSnippet ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#64748b]" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[#0b192c] p-4 text-xs font-mono text-[#f8fafc] overflow-x-auto shadow-inner border border-[#1e293b]">
            <pre>{generateSnippet()}</pre>
          </div>
        </div>
      )}

      {/* MODAL: CREATE API KEY */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#e2e8f0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0b192c] text-white">
                  <Key className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0b192c]">Generate Developer API Key</h3>
                  <p className="text-xs text-[#64748b]">Includes 500 Compute Units / Day and White-Label Support</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#94a3b8] hover:text-[#0b192c] p-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              {/* Key Name */}
              <div>
                <label className="block text-xs font-bold text-[#0b192c] mb-1">
                  Key Name / Purpose <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production CI/CD Pipeline Gate"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs text-[#0b192c] focus:border-[#0b192c] focus:outline-none focus:ring-1 focus:ring-[#0b192c]"
                />
              </div>

              {/* Environment & Expiration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b192c] mb-1">
                    Environment
                  </label>
                  <select
                    value={formEnvironment}
                    onChange={(e) => setFormEnvironment(e.target.value as ApiKeyEnvironment)}
                    className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs text-[#0b192c] focus:border-[#0b192c] focus:outline-none"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b192c] mb-1">
                    Expiration Period
                  </label>
                  <select
                    value={formExpirationDays}
                    onChange={(e) => setFormExpirationDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs text-[#0b192c] focus:border-[#0b192c] focus:outline-none"
                  >
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days (Recommended)</option>
                    <option value={365}>1 Year</option>
                    <option value={0}>Never Expires</option>
                  </select>
                </div>
              </div>

              {/* Scope Permissions */}
              <div>
                <label className="block text-xs font-bold text-[#0b192c] mb-1.5">
                  Permissions & Scopes
                </label>
                <div className="space-y-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                  {ALL_SCOPES.map((scope) => {
                    const isChecked = formScopes.includes(scope.id);
                    return (
                      <label 
                        key={scope.id} 
                        className="flex items-start gap-2.5 cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleScope(scope.id)}
                          className="mt-0.5 rounded border-slate-300 text-[#0b192c] focus:ring-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#0b192c] font-mono">{scope.id}</span>
                          <p className="text-[11px] text-[#64748b]">{scope.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* White-Label Customization Toggle */}
              <div className="border-t border-[#e2e8f0] pt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-[#0b192c]">
                    White-Label Configuration (Optional)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#415a77] mb-1">
                      Organization / Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Telemetry Core"
                      value={formOrgName}
                      onChange={(e) => setFormOrgName(e.target.value)}
                      className="w-full rounded-lg border border-[#cbd5e1] px-3 py-1.5 text-xs text-[#0b192c]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#415a77] mb-1">
                      Custom Header Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. X-Acme-Telemetry"
                      value={formBrandHeader}
                      onChange={(e) => setFormBrandHeader(e.target.value)}
                      className="w-full rounded-lg border border-[#cbd5e1] px-3 py-1.5 text-xs text-[#0b192c]"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-[#415a77] mb-1">
                    Async Webhook Dispatch URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://api.yourdomain.com/webhooks/audit-complete"
                    value={formWebhookUrl}
                    onChange={(e) => setFormWebhookUrl(e.target.value)}
                    className="w-full rounded-lg border border-[#cbd5e1] px-3 py-1.5 text-xs text-[#0b192c]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-[#cbd5e1] px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0b192c] px-5 py-2 text-xs font-bold text-white hover:bg-[#152238] shadow-md disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  {actionLoading ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 text-amber-300" />
                      <span>Generate Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ONE-TIME SECRET KEY REVEAL */}
      {showSecretModal && revealedSecretKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#e2e8f0]">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0b192c]">
                API Key Generated Successfully
              </h3>
              <p className="text-xs text-[#64748b] mt-1">
                Save this key now. For your security, it will <strong>never be shown again</strong>.
              </p>
            </div>

            {/* Secret Key Display Box */}
            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50/80 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1.5">
                <span>Secret API Key for: <strong>{newKeyName}</strong></span>
                <button
                  type="button"
                  onClick={() => setShowMaskedSecret(!showMaskedSecret)}
                  className="text-amber-800 hover:text-amber-950 flex items-center gap-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  {showMaskedSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showMaskedSecret ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-white p-3 font-mono text-xs text-[#0b192c] border border-amber-200 shadow-inner">
                <div className="flex-1 break-all">
                  {showMaskedSecret ? revealedSecretKey : revealedSecretKey.substring(0, 14) + '••••••••••••••••••••••••••••'}
                </div>
                <button
                  onClick={() => copyToClipboard(revealedSecretKey)}
                  className="flex items-center gap-1 rounded-lg bg-[#0b192c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#152238] transition-colors shrink-0 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  {copiedSecret ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-amber-300" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Warning Callout */}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Do not commit this key into public repositories or expose it in client-side bundles. Store it securely in your CI/CD secrets manager.
              </span>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowSecretModal(false);
                  setRevealedSecretKey(null);
                }}
                className="rounded-xl bg-[#0b192c] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                I have safely stored my key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ROTATE CONFIRMATION */}
      {keyToRotate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#e2e8f0]">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 border border-amber-300">
                <RotateCw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0b192c]">Rotate API Key</h3>
                <p className="text-xs text-[#64748b]">Generate a new secret for {keyToRotate.name}</p>
              </div>
            </div>

            <p className="text-xs text-[#415a77] leading-relaxed">
              Rotating this API key will generate a new secret token and update the verification signature. Any legacy integrations using the old secret must be updated with the new token.
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setKeyToRotate(null)}
                className="rounded-xl border border-[#cbd5e1] px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRotateConfirm}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {actionLoading ? <RotateCw className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
                <span>Confirm Rotation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVOKE CONFIRMATION */}
      {keyToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#e2e8f0]">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 border border-rose-300">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0b192c]">Revoke API Key</h3>
                <p className="text-xs text-[#64748b]">Immediately deactivate {keyToRevoke.name}</p>
              </div>
            </div>

            <p className="text-xs text-[#415a77] leading-relaxed">
              Are you sure you want to revoke this key? All active API calls, CI/CD pipelines, and automated probes using this key will immediately return <strong>HTTP 401 Unauthorized</strong>.
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setKeyToRevoke(null)}
                className="rounded-xl border border-[#cbd5e1] px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConfirm}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {actionLoading ? <RotateCw className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                <span>Revoke Key Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {keyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#e2e8f0]">
            <div className="flex items-center gap-3 text-slate-700 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-300">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0b192c]">Delete Key Record</h3>
                <p className="text-xs text-[#64748b]">Remove key entry permanently</p>
              </div>
            </div>

            <p className="text-xs text-[#415a77] leading-relaxed">
              Are you sure you want to delete <strong>{keyToDelete.name}</strong> from your records? This action cannot be undone.
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setKeyToDelete(null)}
                className="rounded-xl border border-[#cbd5e1] px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {actionLoading ? <RotateCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserApiKeyManagementView;
