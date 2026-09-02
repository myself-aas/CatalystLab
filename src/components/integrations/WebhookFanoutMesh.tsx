import React, { useState } from 'react';
import { motion } from 'motion/react';
import { EdgeMeshGlobe } from '../ui/edge-mesh-globe';
import { 
  Webhook, 
  Send, 
  CheckCircle2, 
  Radio, 
  Activity, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Bell,
  Check,
  Copy
} from 'lucide-react';

interface DestinationService {
  id: string;
  name: string;
  category: 'Incident Management' | 'ChatOps' | 'CI/CD' | 'APM';
  endpoint: string;
  status: 'active' | 'standby';
  avgLatency: string;
  tlsVersion: string;
  payloadType: string;
}

const DESTINATION_SERVICES: DestinationService[] = [
  {
    id: 'slack',
    name: 'Slack Incoming Webhook',
    category: 'ChatOps',
    endpoint: 'hooks.slack.com/services/...',
    status: 'active',
    avgLatency: '18ms',
    tlsVersion: 'TLS 1.3 0-RTT',
    payloadType: 'JSON BlockKit Digest',
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty Events v2 API',
    category: 'Incident Management',
    endpoint: 'events.pagerduty.com/v2/enqueue',
    status: 'active',
    avgLatency: '24ms',
    tlsVersion: 'TLS 1.3',
    payloadType: 'Severity Trigger (P1-P4)',
  },
  {
    id: 'github',
    name: 'GitHub Check Runs API',
    category: 'CI/CD',
    endpoint: 'api.github.com/repos/.../check-runs',
    status: 'active',
    avgLatency: '32ms',
    tlsVersion: 'TLS 1.3',
    payloadType: 'PR Blocking Status & SARIF',
  },
  {
    id: 'datadog',
    name: 'Datadog Metrics Ingest',
    category: 'APM',
    endpoint: 'api.datadoghq.com/api/v1/series',
    status: 'active',
    avgLatency: '14ms',
    tlsVersion: 'TLS 1.3 0-RTT',
    payloadType: 'DogStatsD OpenMetrics',
  },
];

export const WebhookFanoutMesh: React.FC = () => {
  const [selectedDest, setSelectedDest] = useState<string>('slack');
  const [isFiring, setIsFiring] = useState(false);
  const [lastDispatched, setLastDispatched] = useState<string | null>(null);

  const handleTestFanout = () => {
    setIsFiring(true);
    setTimeout(() => {
      setIsFiring(false);
      setLastDispatched(new Date().toLocaleTimeString());
    }, 850);
  };

  const activeService = DESTINATION_SERVICES.find((s) => s.id === selectedDest) || DESTINATION_SERVICES[0];

  return (
    <div className="rounded-3xl border border-border bg-primary text-primary-foreground p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono text-cyan-300 mb-3 backdrop-blur-md">
              <Webhook className="h-3.5 w-3.5 text-cyan-400" />
              <span>Multi-Region Incident Dispatching</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-foreground tracking-tight">
              Synchronous Webhook Fan-Out Mesh
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl font-normal">
              When a synthetic probe flags a regression, the origin PoP broadcasts asynchronous cryptographic webhooks across global APIs in sub-30ms handshakes.
            </p>
          </div>

          {/* Test Fan-out CTA */}
          <button
            type="button"
            onClick={handleTestFanout}
            disabled={isFiring}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-foreground text-xs sm:text-sm font-mono font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Send className={`h-4 w-4 ${isFiring ? 'animate-bounce' : ''}`} />
            <span>{isFiring ? 'Broadcasting Fan-Out Webhooks...' : 'Trigger Fan-Out Test'}</span>
          </button>
        </div>

        {/* 2-Column Mesh Preview: 3D Globe + Destination Targets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive 3D WebGL Globe */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
            <div className="w-full bg-primary/60 border border-border rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden">
              
              {/* Globe Status HUD */}
              <div className="w-full flex items-center justify-between border-b border-border/80 pb-3 mb-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                  <span className="font-bold uppercase tracking-wider">FAN-OUT ORIGIN: IAD (US-East)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">4 Verified Target Gateways</span>
                </div>
              </div>

              {/* 3D WebGL Globe Component (panel variant) */}
              <div className="w-full flex items-center justify-center py-2">
                <EdgeMeshGlobe
                  variant="panel"
                  interactive={true}
                  autoSpin={true}
                  showInspector={true}
                  showChips={true}
                  showControls={true}
                />
              </div>

              {/* Last Dispatched status */}
              <div className="w-full mt-2 pt-3 border-t border-border/80 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>HMAC-SHA256 Signatures Enforced</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {lastDispatched ? `Last Fan-Out: ${lastDispatched}` : 'Broadcaster: Standby'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Webhook Destination Targets */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold mb-2">
              Configured Fan-Out Gateways:
            </div>

            {DESTINATION_SERVICES.map((dest) => {
              const isSelected = selectedDest === dest.id;
              return (
                <div
                  key={dest.id}
                  onClick={() => setSelectedDest(dest.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 border-cyan-500 shadow-lg ring-1 ring-cyan-500/50 text-primary-foreground'
                      : 'bg-primary/60 border-border hover:bg-primary text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 font-bold font-sans text-sm text-primary-foreground">
                      <Webhook className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : 'text-muted-foreground'}`} />
                      <span>{dest.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-emerald-400 border border-border">
                      {dest.avgLatency}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-muted-foreground truncate mb-2">
                    {dest.endpoint}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2 border-t border-border/80">
                    <span>{dest.category}</span>
                    <span className="text-cyan-300 font-bold">{dest.tlsVersion}</span>
                  </div>
                </div>
              );
            })}

            {/* Micro Details Box */}
            <div className="p-4 rounded-2xl bg-primary/40 border border-border text-xs font-mono text-muted-foreground space-y-1.5">
              <div className="text-muted-foreground font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero-Drop Retry Policy</span>
              </div>
              <p className="text-[11px] font-sans text-muted-foreground leading-relaxed">
                Exponential backoff retry with dead-letter queue buffering guarantees 100% telemetry webhook delivery even during downstream cloud incidents.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
