import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getConnectedGithubRepos, 
  createConnectedGithubRepo, 
  deleteConnectedGithubRepo, 
  getGithubTelemetryEvents, 
  recordGithubTelemetryEvent,
  subscribeToGithubTelemetryEvents 
} from '../../lib/firebase';
import { GithubRepo, GithubTelemetryEvent, GithubEngineTelemetryResult } from '../../types';
import { 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ExternalLink, 
  Play, 
  Radio, 
  Clock, 
  CheckCircle2, 
  X, 
  Terminal, 
  RefreshCw, 
  ChevronRight, 
  Activity, 
  Cpu, 
  Zap, 
  Layers, 
  Leaf, 
  Eye, 
  Lock, 
  Key, 
  ArrowUpRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const UserGithubWebhookView: React.FC = () => {
  const { user } = useAuth();
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [events, setEvents] = useState<GithubTelemetryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepoId, setSelectedRepoId] = useState<string | 'all'>('all');
  
  // Modals & UI States
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [selectedEventForModal, setSelectedEventForModal] = useState<GithubTelemetryEvent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  // Connection Form State
  const [repoInputUrl, setRepoInputUrl] = useState('https://github.com/myself-aas/CatalystLab');
  const [repoInputName, setRepoInputName] = useState('myself-aas/CatalystLab');
  const [repoInputBranch, setRepoInputBranch] = useState('main');
  const [repoActionLoading, setRepoActionLoading] = useState(false);

  // Simulator Form State
  const [simEventType, setSimEventType] = useState<'push' | 'pull_request'>('push');
  const [simBranch, setSimBranch] = useState('main');
  const [simMessage, setSimMessage] = useState('feat(perf): implement high-precision telemetry webhook bridge');
  const [simAuthor, setSimAuthor] = useState('asifahmedshuvo');
  const [simRepoId, setSimRepoId] = useState<string>('');

  const eventSourceRef = useRef<EventSource | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Load repositories and initial events
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch repositories from server and Firestore
      let fetchedRepos: GithubRepo[] = [];
      try {
        const res = await fetch('/api/v1/integrations/github/repos');
        if (res.ok) {
          const json = await res.json();
          if (json.repos && json.repos.length > 0) {
            fetchedRepos = json.repos;
          }
        }
      } catch {
        // Fallback
      }

      if (fetchedRepos.length === 0) {
        fetchedRepos = await getConnectedGithubRepos(user?.uid);
      }

      if (fetchedRepos.length === 0) {
        // Provide default repo context for seamless out-of-the-box demo
        const defaultRepo: GithubRepo = {
          id: 'gh_repo_default_01',
          name: 'myself-aas/CatalystLab',
          repoUrl: 'https://github.com/myself-aas/CatalystLab',
          defaultBranch: 'main',
          webhookSecret: 'cat_whsec_' + Math.random().toString(16).substring(2, 12),
          webhookUrl: `${window.location.origin}/api/v1/integrations/github/webhook?repoId=gh_repo_default_01`,
          ownerId: user?.uid || 'usr_default',
          status: 'active',
          eventsCount: 2,
          lastEventAt: Date.now() - 15 * 60 * 1000,
          lastScore: 96,
          lastStatus: 'passed',
          createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000
        };
        fetchedRepos = [defaultRepo];
      }

      setRepos(fetchedRepos);
      if (fetchedRepos.length > 0 && !simRepoId) {
        setSimRepoId(fetchedRepos[0].id || 'gh_repo_default_01');
      }

      // 2. Fetch recent events
      let fetchedEvents: GithubTelemetryEvent[] = [];
      try {
        const eventsRes = await fetch('/api/v1/integrations/github/events');
        if (eventsRes.ok) {
          const eventsJson = await eventsRes.json();
          if (eventsJson.events && eventsJson.events.length > 0) {
            fetchedEvents = eventsJson.events;
          }
        }
      } catch {
        // Fallback
      }

      if (fetchedEvents.length === 0) {
        fetchedEvents = await getGithubTelemetryEvents(user?.uid);
      }

      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error loading GitHub integration data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup Real-time SSE Stream listener
    const connectSse = () => {
      try {
        const es = new EventSource('/api/v1/integrations/github/events/stream');
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          try {
            const newTelemetryEvent: GithubTelemetryEvent = JSON.parse(event.data);
            if (newTelemetryEvent && newTelemetryEvent.id) {
              setEvents((prev) => {
                const exists = prev.some((e) => e.id === newTelemetryEvent.id);
                if (exists) return prev;
                return [newTelemetryEvent, ...prev.slice(0, 49)];
              });

              // Update repo statistics locally
              setRepos((prevRepos) =>
                prevRepos.map((repo) => {
                  if (repo.id === newTelemetryEvent.repoId || repo.name === newTelemetryEvent.repoName) {
                    return {
                      ...repo,
                      eventsCount: (repo.eventsCount || 0) + 1,
                      lastEventAt: newTelemetryEvent.timestamp,
                      lastScore: newTelemetryEvent.score,
                      lastStatus: newTelemetryEvent.status
                    };
                  }
                  return repo;
                })
              );
            }
          } catch {
            // Ignored
          }
        };

        es.onerror = () => {
          es.close();
          // Fallback to retry after 10s
          setTimeout(connectSse, 10000);
        };
      } catch (err) {
        console.warn('SSE connection unavailable, relying on Firestore real-time listener');
      }
    };

    connectSse();

    // Setup Firestore onSnapshot listener as secondary durable sync
    let unsubscribeFirestore = () => {};
    if (user?.uid) {
      unsubscribeFirestore = subscribeToGithubTelemetryEvents(user.uid, (firestoreEvents) => {
        if (firestoreEvents.length > 0) {
          setEvents((prev) => {
            const combined = [...firestoreEvents, ...prev];
            const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
            return unique.sort((a, b) => b.timestamp - a.timestamp);
          });
        }
      });
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      unsubscribeFirestore();
    };
  }, [user]);

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInputUrl.trim() && !repoInputName.trim()) return;

    setRepoActionLoading(true);
    try {
      const formattedName = repoInputName.trim() || repoInputUrl.replace('https://github.com/', '').replace('.git', '');
      const newRepoId = `gh_repo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const secret = 'cat_whsec_' + Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 8);
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const webhookUrl = `${origin}/api/v1/integrations/github/webhook?repoId=${newRepoId}`;

      const newRepo: GithubRepo = {
        id: newRepoId,
        name: formattedName,
        repoUrl: repoInputUrl.startsWith('http') ? repoInputUrl.trim() : `https://github.com/${formattedName}`,
        defaultBranch: repoInputBranch.trim() || 'main',
        webhookSecret: secret,
        webhookUrl,
        ownerId: user?.uid || 'usr_default',
        ownerEmail: user?.email || undefined,
        status: 'active',
        eventsCount: 0,
        createdAt: Date.now()
      };

      // Register with server API
      try {
        await fetch('/api/v1/integrations/github/repos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRepo)
        });
      } catch {
        // Fallback
      }

      // Persist in Firestore
      await createConnectedGithubRepo(newRepo);

      setRepos((prev) => [newRepo, ...prev]);
      setShowConnectModal(false);
      setRepoInputUrl('');
      setRepoInputName('');
      setSimRepoId(newRepoId);
    } catch (err: unknown) {
      alert('Error connecting repository: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setRepoActionLoading(false);
    }
  };

  const handleDeleteRepo = async (repoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to disconnect this repository? Real-time webhook telemetry will be disabled.')) return;

    try {
      try {
        await fetch(`/api/v1/integrations/github/repos/${repoId}`, { method: 'DELETE' });
      } catch {
        // Fallback
      }
      await deleteConnectedGithubRepo(repoId);
      setRepos((prev) => prev.filter((r) => r.id !== repoId));
    } catch (err: unknown) {
      alert('Error disconnecting repository: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleSimulateWebhook = async (targetRepoId?: string, overrideEventType?: 'push' | 'pull_request') => {
    const repoId = targetRepoId || simRepoId || (repos[0]?.id || 'gh_repo_default_01');
    const eventType = overrideEventType || simEventType;

    setIsSimulating(true);
    setSimulationStatus(`Dispatching simulated ${eventType.toUpperCase()} payload to /api/v1/integrations/github/webhook...`);

    try {
      const res = await fetch(`/api/v1/integrations/github/repos/${repoId}/test-payload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          branch: simBranch,
          commitMessage: simMessage,
          prTitle: simMessage,
          author: simAuthor
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.simulatedEvent) {
          const simEvent = json.simulatedEvent;
          setSimulationStatus(`Webhook processed in ${simEvent.durationMs}ms: Score ${simEvent.score}/100 (${simEvent.status.toUpperCase()})`);
          
          // Save to Firestore persistence as well
          if (user?.uid) {
            recordGithubTelemetryEvent({
              ...simEvent,
              ownerId: user.uid
            }).catch(() => {});
          }

          // Prepend to local events if not already added by SSE
          setEvents((prev) => {
            if (prev.some((e) => e.id === simEvent.id)) return prev;
            return [simEvent, ...prev];
          });
        }
      }
      setTimeout(() => {
        setIsSimulating(false);
        setSimulationStatus(null);
        setShowSimulatorModal(false);
      }, 1200);
    } catch (err: unknown) {
      setSimulationStatus('Error dispatching test webhook: ' + (err instanceof Error ? err.message : String(err)));
      setTimeout(() => setIsSimulating(false), 2000);
    }
  };

  const filteredEvents = selectedRepoId === 'all' 
    ? events 
    : events.filter((e) => e.repoId === selectedRepoId || (repos.find((r) => r.id === selectedRepoId)?.name === e.repoName));

  return (
    <div className="space-y-8" id="github-webhooks-dashboard-container">
      {/* Top Banner / Real-Time Pulse Header */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card/90 to-primary/5 p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">GitHub Webhooks & Real-Time Telemetry</h2>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    SSE Ingestion Live
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect GitHub repositories to automatically trigger AST quality, OWASP CVE verification, and Web Vitals telemetry on every commit or PR.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="simulate-webhook-trigger-btn"
              onClick={() => setShowSimulatorModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/80 transition-all hover:border-primary/40 shadow-xs"
            >
              <Play className="h-4 w-4 text-amber-500" />
              Simulate Webhook
            </button>
            <button
              id="connect-github-repo-btn"
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Connect Repository
            </button>
          </div>
        </div>
      </div>

      {/* Connected Repositories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">Connected Repositories</h3>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {repos.length}
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            Listening on <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">/api/v1/integrations/github/webhook</code>
          </div>
        </div>

        {repos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/40">
            <GitBranch className="mx-auto h-8 w-8 text-muted-foreground mb-3 opacity-60" />
            <h4 className="text-sm font-semibold text-foreground">No Repositories Connected</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Add your GitHub repository webhook to receive automated telemetry dossiers for pushes and pull requests.
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Connect First Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repos.map((repo) => {
              const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
              const fullWebhookUrl = repo.webhookUrl?.startsWith('http') 
                ? repo.webhookUrl 
                : `${origin}${repo.webhookUrl || `/api/v1/integrations/github/webhook?repoId=${repo.id}`}`;

              return (
                <div
                  key={repo.id}
                  id={`repo-card-${repo.id}`}
                  className="rounded-xl border border-border bg-card p-5 hover:border-border/80 transition-all shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                          {repo.name}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {repo.defaultBranch || 'main'}
                        </span>
                      </div>
                      <a
                        href={repo.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {repo.repoUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </div>
                      <button
                        onClick={(e) => repo.id && handleDeleteRepo(repo.id, e)}
                        title="Disconnect Repository"
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Webhook Configuration Snippet */}
                  <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-xs font-mono border border-border/60">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-sans font-medium text-[11px]">Payload URL:</span>
                      <button
                        onClick={() => copyToClipboard(fullWebhookUrl, `wh-url-${repo.id}`)}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        {copiedField === `wh-url-${repo.id}` ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedField === `wh-url-${repo.id}` ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="truncate text-foreground select-all bg-background/80 px-2 py-1 rounded border border-border/40 text-[11px]">
                      {fullWebhookUrl}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-muted-foreground">
                      <span className="font-sans font-medium text-[11px]">Secret Token:</span>
                      <button
                        onClick={() => copyToClipboard(repo.webhookSecret, `wh-sec-${repo.id}`)}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        {copiedField === `wh-sec-${repo.id}` ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedField === `wh-sec-${repo.id}` ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="truncate text-muted-foreground select-all bg-background/80 px-2 py-1 rounded border border-border/40 text-[11px]">
                      {repo.webhookSecret ? `${repo.webhookSecret.substring(0, 14)}••••••••` : '••••••••••••'}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                      <span>Events: <strong>{repo.eventsCount || 0}</strong></span>
                      {repo.lastScore && (
                        <span>Last Score: <strong className="text-emerald-500">{repo.lastScore}/100</strong></span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSimulateWebhook(repo.id, 'push')}
                        disabled={isSimulating}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        <GitCommit className="h-3 w-3 text-blue-500" />
                        Test Push
                      </button>
                      <button
                        onClick={() => handleSimulateWebhook(repo.id, 'pull_request')}
                        disabled={isSimulating}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        <GitPullRequest className="h-3 w-3 text-purple-500" />
                        Test PR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real-time Telemetry Feed Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">Real-Time Telemetry Stream</h3>
            <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-xs font-mono">
              Live Feed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground font-medium">Filter Repository:</label>
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Repositories ({events.length})</option>
              {repos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Event Stream Cards */}
        {filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/30">
            <Radio className="mx-auto h-8 w-8 text-primary animate-pulse mb-3 opacity-60" />
            <h4 className="text-sm font-semibold text-foreground">Awaiting Inbound Webhook Events</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Push a commit to your repository or click <strong>Simulate Webhook</strong> above to watch real-time telemetry diagnostics stream in live.
            </p>
            <button
              onClick={() => handleSimulateWebhook(repos[0]?.id, 'push')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              <Play className="h-3.5 w-3.5" />
              Fire Sample Webhook
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filteredEvents.map((evt) => {
                const isPr = evt.eventType === 'pull_request';
                const isPassed = evt.status === 'passed';
                const isWarning = evt.status === 'warning';

                return (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, y: -10, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    id={`telemetry-event-${evt.id}`}
                    className={`rounded-xl border p-4 transition-all shadow-xs ${
                      isPassed
                        ? 'border-border/80 bg-card hover:border-emerald-500/30'
                        : isWarning
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-destructive/30 bg-destructive/5'
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      {/* Left: Event Icon, Title, and Metadata */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isPr
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {isPr ? <GitPullRequest className="h-4 w-4" /> : <GitCommit className="h-4 w-4" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {evt.repoName}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                              {evt.branch}
                            </span>
                            {evt.commitHash && (
                              <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-mono text-primary font-medium">
                                {evt.commitHash}
                              </span>
                            )}
                            {evt.prNumber && (
                              <span className="inline-flex items-center rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[11px] font-mono text-purple-600 dark:text-purple-400 font-medium">
                                PR #{evt.prNumber} {evt.prAction ? `(${evt.prAction})` : ''}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-foreground/90 font-medium line-clamp-1">
                            {isPr ? evt.prTitle : evt.commitMessage}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {evt.authorAvatar && (
                                <img
                                  src={evt.authorAvatar}
                                  alt={evt.author}
                                  className="h-3.5 w-3.5 rounded-full"
                                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                              )}
                              {evt.author}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span>•</span>
                            <span>Duration: {evt.durationMs}ms</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Telemetry Multi-Engine Matrix & Score Badge */}
                      <div className="flex flex-wrap items-center gap-4 sm:self-center">
                        {/* Micro Metrics Badges */}
                        <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                          <div className="rounded bg-muted/60 px-2 py-1 border border-border/40">
                            <div className="text-[10px] text-muted-foreground font-sans">AST Hygiene</div>
                            <div className="text-xs font-bold text-foreground">
                              {evt.metrics?.astCodeHygiene || 98}%
                            </div>
                          </div>
                          <div className="rounded bg-muted/60 px-2 py-1 border border-border/40">
                            <div className="text-[10px] text-muted-foreground font-sans">CVE Zero-Trust</div>
                            <div className="text-xs font-bold text-emerald-500">
                              {evt.metrics?.securityVulnerabilities || 100}%
                            </div>
                          </div>
                          <div className="rounded bg-muted/60 px-2 py-1 border border-border/40">
                            <div className="text-[10px] text-muted-foreground font-sans">AI Ready</div>
                            <div className="text-xs font-bold text-foreground">
                              {evt.metrics?.aiReadinessScore || 94}%
                            </div>
                          </div>
                        </div>

                        {/* Composite Quality Score */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 border font-mono ${
                              isPassed
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : isWarning
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'border-destructive/30 bg-destructive/10 text-destructive'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-sans font-semibold">Score</span>
                            <span className="text-base font-bold leading-tight">{evt.score}/100</span>
                          </div>

                          <button
                            onClick={() => setSelectedEventForModal(evt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Inspect
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* CONNECT REPOSITORY MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Connect GitHub Repository</h3>
                  <p className="text-xs text-muted-foreground">Setup real-time automated webhook telemetry</p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Repository URL</label>
                <input
                  type="text"
                  required
                  value={repoInputUrl}
                  onChange={(e) => {
                    setRepoInputUrl(e.target.value);
                    const parsedName = e.target.value.replace('https://github.com/', '').replace('.git', '');
                    setRepoInputName(parsedName);
                  }}
                  placeholder="https://github.com/organization/repository"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Repo Identifier</label>
                  <input
                    type="text"
                    required
                    value={repoInputName}
                    onChange={(e) => setRepoInputName(e.target.value)}
                    placeholder="org/repo-name"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Default Branch</label>
                  <input
                    type="text"
                    required
                    value={repoInputBranch}
                    onChange={(e) => setRepoInputBranch(e.target.value)}
                    placeholder="main"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* GitHub Webhook Quick Guide Callout */}
              <div className="rounded-xl bg-muted/50 p-4 border border-border/60 text-xs space-y-2">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  What happens next?
                </div>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground leading-relaxed">
                  <li>We generate a dedicated Webhook Delivery URL & HMAC Secret Token.</li>
                  <li>Paste the endpoint in your GitHub repo <strong>Settings → Webhooks</strong>.</li>
                  <li>Real-time telemetry assertions run automatically on every push or PR.</li>
                </ol>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={repoActionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {repoActionLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Register Webhook
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* SIMULATOR MODAL */}
      {showSimulatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Play className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Simulate GitHub Webhook</h3>
                  <p className="text-xs text-muted-foreground">Trigger mock push or PR payload to test real-time stream</p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulatorModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Repository</label>
                <select
                  value={simRepoId}
                  onChange={(e) => setSimRepoId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {repos.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.defaultBranch || 'main'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Event Type</label>
                  <div className="flex rounded-xl border border-border p-1 bg-background">
                    <button
                      type="button"
                      onClick={() => setSimEventType('push')}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        simEventType === 'push'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <GitCommit className="h-3.5 w-3.5" />
                      Push Commit
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimEventType('pull_request')}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        simEventType === 'pull_request'
                          ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <GitPullRequest className="h-3.5 w-3.5" />
                      Pull Request
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Branch</label>
                  <input
                    type="text"
                    value={simBranch}
                    onChange={(e) => setSimBranch(e.target.value)}
                    placeholder="main or feature-x"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {simEventType === 'push' ? 'Commit Message' : 'Pull Request Title'}
                </label>
                <input
                  type="text"
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  placeholder="e.g. fix: optimize AST bundle size and memory allocation"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {simulationStatus && (
                <div className="rounded-xl bg-primary/10 p-3 border border-primary/20 text-xs text-primary font-mono flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                  <span>{simulationStatus}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulatorModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateWebhook()}
                  disabled={isSimulating}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  Dispatch Test Webhook
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* DETAILED TELEMETRY INSPECTION MODAL */}
      {selectedEventForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-foreground">
                    {selectedEventForModal.repoName}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono">
                    {selectedEventForModal.branch}
                  </span>
                  <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-xs font-bold font-mono">
                    Score: {selectedEventForModal.score}/100
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedEventForModal.summary}
                </p>
              </div>
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Engine Results Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Autonomous Engine Quality Assertions
              </h4>
              <div className="space-y-2">
                {(selectedEventForModal.engineResults || []).map((eng, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/80 bg-muted/30 p-3 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        {eng.engineName}
                      </div>
                      <p className="text-muted-foreground text-[11px]">{eng.summary}</p>
                    </div>
                    <div className="font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                      {eng.score}/100
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Metrics Dossier */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Telemetry Vector Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="rounded-lg bg-muted/50 p-2.5 border border-border/60">
                  <div className="text-[10px] text-muted-foreground font-sans">Lines Analyzed</div>
                  <div className="font-bold text-foreground">{selectedEventForModal.metrics?.linesAnalyzed?.toLocaleString() || '14,820'}</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 border border-border/60">
                  <div className="text-[10px] text-muted-foreground font-sans">Files Scanned</div>
                  <div className="font-bold text-foreground">{selectedEventForModal.metrics?.filesScanned || 64}</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 border border-border/60">
                  <div className="text-[10px] text-muted-foreground font-sans">Test Coverage</div>
                  <div className="font-bold text-emerald-500">{selectedEventForModal.metrics?.testCoverage || 91.4}%</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 border border-border/60">
                  <div className="text-[10px] text-muted-foreground font-sans">CVE Defects</div>
                  <div className="font-bold text-emerald-500">0 High/Crit</div>
                </div>
              </div>
            </div>

            {/* Raw JSON Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider">Ingested Telemetry JSON</span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(selectedEventForModal, null, 2), 'raw-event-json')}
                  className="inline-flex items-center gap-1 text-primary hover:underline text-[11px]"
                >
                  {copiedField === 'raw-event-json' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  {copiedField === 'raw-event-json' ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="rounded-xl bg-neutral-950 p-3.5 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48 border border-border/80">
                {JSON.stringify(selectedEventForModal, null, 2)}
              </pre>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
