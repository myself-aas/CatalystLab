import React, { useState } from 'react';
import { 
  Globe, 
  Server, 
  Cpu, 
  ShieldAlert, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Zap,
  Activity,
  Sliders,
  FileCheck,
  Layers
} from 'lucide-react';

interface PopNode {
  code: string;
  city: string;
  region: 'NA' | 'EU' | 'APAC' | 'SA';
  status: 'active' | 'draining' | 'degraded';
  latency: number;
  packetLoss: number;
  trafficLoad: number;
}

const INITIAL_POPS: PopNode[] = [
  { code: 'IAD', city: 'Ashburn, VA', region: 'NA', status: 'active', latency: 11.2, packetLoss: 0.0, trafficLoad: 78 },
  { code: 'SFO', city: 'San Francisco, CA', region: 'NA', status: 'active', latency: 14.8, packetLoss: 0.0, trafficLoad: 82 },
  { code: 'ORD', city: 'Chicago, IL', region: 'NA', status: 'active', latency: 18.1, packetLoss: 0.0, trafficLoad: 64 },
  { code: 'DFW', city: 'Dallas, TX', region: 'NA', status: 'active', latency: 16.4, packetLoss: 0.0, trafficLoad: 59 },
  { code: 'LHR', city: 'London, UK', region: 'EU', status: 'active', latency: 22.4, packetLoss: 0.01, trafficLoad: 91 },
  { code: 'FRA', city: 'Frankfurt, DE', region: 'EU', status: 'active', latency: 24.1, packetLoss: 0.0, trafficLoad: 85 },
  { code: 'AMS', city: 'Amsterdam, NL', region: 'EU', status: 'active', latency: 23.0, packetLoss: 0.0, trafficLoad: 72 },
  { code: 'CDG', city: 'Paris, FR', region: 'EU', status: 'active', latency: 26.3, packetLoss: 0.0, trafficLoad: 68 },
  { code: 'NRT', city: 'Tokyo, JP', region: 'APAC', status: 'active', latency: 34.2, packetLoss: 0.02, trafficLoad: 88 },
  { code: 'SIN', city: 'Singapore, SG', region: 'APAC', status: 'active', latency: 38.6, packetLoss: 0.0, trafficLoad: 76 },
  { code: 'SYD', city: 'Sydney, AU', region: 'APAC', status: 'active', latency: 45.1, packetLoss: 0.03, trafficLoad: 61 },
  { code: 'HKG', city: 'Hong Kong, HK', region: 'APAC', status: 'active', latency: 36.8, packetLoss: 0.0, trafficLoad: 84 },
  { code: 'GRU', city: 'São Paulo, BR', region: 'SA', status: 'active', latency: 68.4, packetLoss: 0.05, trafficLoad: 53 },
  { code: 'SCL', city: 'Santiago, CL', region: 'SA', status: 'active', latency: 74.2, packetLoss: 0.04, trafficLoad: 41 },
];

interface Tenant {
  id: string;
  name: string;
  domains: number;
  dailyIngestion: string;
  computeAllocation: string;
  plan: 'Enterprise Mesh' | 'Team Pro' | 'Individual Developer';
  status: 'normal' | 'throttled' | 'elevated';
}

const INITIAL_TENANTS: Tenant[] = [
  { id: 't-1', name: 'Acme Global Media', domains: 28, dailyIngestion: '142,800 req/day', computeAllocation: '8.4 vCPU / 16GB', plan: 'Enterprise Mesh', status: 'normal' },
  { id: 't-2', name: 'HyperScale Fintech', domains: 12, dailyIngestion: '98,400 req/day', computeAllocation: '4.2 vCPU / 8GB', plan: 'Enterprise Mesh', status: 'elevated' },
  { id: 't-3', name: 'Synthetix AI Lab', domains: 6, dailyIngestion: '34,200 req/day', computeAllocation: '2.0 vCPU / 4GB', plan: 'Team Pro', status: 'normal' },
  { id: 't-4', name: 'Veloce Retail Edge', domains: 19, dailyIngestion: '88,100 req/day', computeAllocation: '5.0 vCPU / 10GB', plan: 'Enterprise Mesh', status: 'normal' },
  { id: 't-5', name: 'Nexus Microservices', domains: 3, dailyIngestion: '12,400 req/day', computeAllocation: '1.0 vCPU / 2GB', plan: 'Team Pro', status: 'throttled' },
];

export const FramerAdminCockpit: React.FC<{ activeSubTab: string }> = ({ activeSubTab }) => {
  const [pops, setPops] = useState<PopNode[]>(INITIAL_POPS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'NA' | 'EU' | 'APAC' | 'SA'>('ALL');
  const [drainingNode, setDrainingNode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDrainNode = (code: string) => {
    setDrainingNode(code);
    setTimeout(() => {
      setPops(prev => prev.map(p => {
        if (p.code === code) {
          const nextStatus = p.status === 'active' ? 'draining' : 'active';
          showToast(`PoP ${code} ${nextStatus === 'draining' ? 'traffic drained; failover to secondary peer complete' : 'restored to active routing mesh'}`);
          return { ...p, status: nextStatus };
        }
        return p;
      }));
      setDrainingNode(null);
    }, 600);
  };

  const handleTenantAction = (tenantId: string, action: 'throttle' | 'elevate' | 'reset') => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const nextStatus = action === 'throttle' ? 'throttled' : action === 'elevate' ? 'elevated' : 'normal';
        showToast(`Tenant "${t.name}" quota policy set to ${nextStatus.toUpperCase()}`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const filteredPops = selectedRegion === 'ALL' ? pops : pops.filter(p => p.region === selectedRegion);

  return (
    <div className="space-y-8 font-sans">
      {/* Toast alert banner */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/30 text-[#00D2FF] text-xs font-mono flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">System Mesh ACK</span>
        </div>
      )}

      {/* MODULE 1: Global 38-PoP Edge Mesh Health Map */}
      {(activeSubTab === 'mesh' || activeSubTab === 'all') && (
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#00D2FF] mb-1">
                <Globe className="size-3.5" />
                <span>38-PoP Edge Anycast Topology · Global Ingress Mesh</span>
              </div>
              <h2 className="text-xl font-semibold text-white tracking-[-0.03em]">Global Edge Mesh Health Map</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time sub-millisecond telemetry across global Cloudflare / Fastly Anycast PoPs with automated failover draining.
              </p>
            </div>

            {/* Region filter controls */}
            <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl font-mono text-xs">
              {(['ALL', 'NA', 'EU', 'APAC', 'SA'] as const).map(reg => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedRegion === reg ? 'bg-white text-black font-semibold' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* High-density interactive node matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredPops.map((pop) => (
              <div
                key={pop.code}
                className="p-4 rounded-xl bg-surface border border-white/8 hover:border-border-strong transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{pop.code}</span>
                      <span className="text-[10px] text-muted-foreground">{pop.region}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      pop.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : pop.status === 'draining'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {pop.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mb-3">{pop.city}</div>

                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">P95 Latency:</span>
                      <span className="text-white font-medium">{pop.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Drop Rate:</span>
                      <span className={pop.packetLoss === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                        {pop.packetLoss}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ingress Load:</span>
                      <span className="text-[#00D2FF]">{pop.trafficLoad}%</span>
                    </div>
                  </div>
                </div>

                {/* Node Drain / Evacuate Failover Button */}
                <div className="pt-3 mt-3 border-t border-white/5">
                  <button
                    onClick={() => handleDrainNode(pop.code)}
                    disabled={drainingNode === pop.code}
                    className={`w-full py-1.5 px-2 rounded-lg font-mono text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      pop.status === 'draining'
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                        : 'bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-border'
                    }`}
                  >
                    <RefreshCw className={`size-3 ${drainingNode === pop.code ? 'animate-spin text-[#00D2FF]' : ''}`} />
                    <span>{pop.status === 'draining' ? 'Restore Node' : 'Drain / Evacuate'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 2: Tenant Quota & Diagnostic Capacity Management */}
      {(activeSubTab === 'tenants' || activeSubTab === 'all') && (
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                <Sliders className="size-3.5" />
                <span>Multi-Tenant Mesh Governance</span>
              </div>
              <h2 className="text-xl font-semibold text-white tracking-[-0.03em]">Tenant Quota &amp; Capacity Control</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage organization quotas, allocate compute pools, and apply real-time rate limiting overrides.
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{tenants.length} Active Organizations</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-background">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface border-b border-border text-muted-foreground uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Organization</th>
                  <th className="p-3.5">Active Domains</th>
                  <th className="p-3.5">Daily Audit Ingestion</th>
                  <th className="p-3.5">Compute Allocation</th>
                  <th className="p-3.5">Tier / Plan</th>
                  <th className="p-3.5">Quota Policy</th>
                  <th className="p-3.5 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-medium text-white">{tenant.name}</td>
                    <td className="p-3.5 text-muted-foreground">{tenant.domains} hosts</td>
                    <td className="p-3.5 text-[#00D2FF]">{tenant.dailyIngestion}</td>
                    <td className="p-3.5 text-white">{tenant.computeAllocation}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-border text-[10px]">
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                        tenant.status === 'normal' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : tenant.status === 'throttled'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTenantAction(tenant.id, 'elevate')}
                          className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[10px] cursor-pointer"
                          title="Elevate API burst limits"
                        >
                          Elevate
                        </button>
                        <button
                          onClick={() => handleTenantAction(tenant.id, 'throttle')}
                          className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[10px] cursor-pointer"
                          title="Throttle traffic"
                        >
                          Throttle
                        </button>
                        <button
                          onClick={() => handleTenantAction(tenant.id, 'reset')}
                          className="px-2 py-1 rounded bg-white/5 text-muted-foreground hover:text-white text-[10px] cursor-pointer"
                          title="Reset to default quota"
                        >
                          Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 3: Engine Health & Error Budget Telemetry */}
      {(activeSubTab === 'compute' || activeSubTab === 'all') && (
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#00F298] mb-1">
                <Cpu className="size-3.5" />
                <span>SDLC Engine Worker Pools &amp; Compute Budgets</span>
              </div>
              <h2 className="text-xl font-semibold text-white tracking-[-0.03em]">Engine Health &amp; Error Budget Telemetry</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time throughput, memory allocation, and AST parse latency across the 8 autonomous engines.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              <span>8/8 Pools Healthy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-xl bg-surface border border-white/8 space-y-1">
              <div className="text-[10px] uppercase text-muted-foreground">Audits Processed / Sec</div>
              <div className="text-2xl font-semibold text-white">412.8 <span className="text-xs text-[#00F298]">req/s</span></div>
              <div className="text-[11px] text-muted-foreground font-sans">+14% surge handling capacity</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-white/8 space-y-1">
              <div className="text-[10px] uppercase text-muted-foreground">Average AST Parse Time</div>
              <div className="text-2xl font-semibold text-white">18.4 <span className="text-xs text-[#00D2FF]">ms</span></div>
              <div className="text-[11px] text-muted-foreground font-sans">SynthShift sub-20ms AST compilation</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-white/8 space-y-1">
              <div className="text-[10px] uppercase text-muted-foreground">Worker Memory Load</div>
              <div className="text-2xl font-semibold text-white">3.4 <span className="text-xs text-white">/ 16 GB</span></div>
              <div className="text-[11px] text-emerald-400 font-sans">21.2% memory saturation (Optimal)</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-white/8 space-y-1">
              <div className="text-[10px] uppercase text-muted-foreground">Remaining Error Budget</div>
              <div className="text-2xl font-semibold text-white">99.98%</div>
              <div className="text-[11px] text-emerald-400 font-sans">0.002% P0 drop rate (SLA met)</div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: OWASP Audit & Compliance Vault */}
      {(activeSubTab === 'owasp' || activeSubTab === 'all') && (
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
                <ShieldAlert className="size-3.5" />
                <span>Cryptographic Audit Trail · Zero-Trust Verification</span>
              </div>
              <h2 className="text-xl font-semibold text-white tracking-[-0.03em]">OWASP Audit &amp; Compliance Vault</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Exportable SOC2 Type II audit packages, ISO 27001 evidence bundles, and SHA-256 verified system logs.
              </p>
            </div>

            <div className="flex items-center gap-2.5 font-mono text-xs">
              <button
                onClick={() => showToast('Dispatched SOC2 Type II Evidence Bundle download')}
                className="px-3 py-2 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-2"
              >
                <Download className="size-3.5" />
                <span>Export SOC2 Report</span>
              </button>
              <button
                onClick={() => showToast('Dispatched ISO 27001 Package verification package')}
                className="px-3 py-2 rounded-xl bg-surface border border-border text-white hover:border-border-strong transition-all cursor-pointer flex items-center gap-2"
              >
                <FileCheck className="size-3.5" />
                <span>ISO 27001 Bundle</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Cryptographically Verified Immutable System Audit Log
            </div>
            <div className="p-4 rounded-xl bg-background border border-border space-y-2 font-mono text-xs text-muted-foreground">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-emerald-400">[PASS · SHA-256 e9f4...83a1]</span>
                <span className="text-muted-foreground">2026-09-04 19:10:04 UTC</span>
              </div>
              <div className="text-white">Mutual TLS 1.3 Handshake verification verified across 38 Anycast nodes with zero cipher degradation.</div>
              <div className="text-[11px] text-muted-foreground">Issuer: DigiCert Global Root G2 · Algorithm: ECDSA P-384 · OCSP Stapling Active</div>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border space-y-2 font-mono text-xs text-muted-foreground">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[#00D2FF]">[PASS · SHA-256 c1b8...901e]</span>
                <span className="text-muted-foreground">2026-09-04 18:42:19 UTC</span>
              </div>
              <div className="text-white">Strict-Transport-Security (HSTS) max-age=63072000; includeSubDomains; preload audited across all client zones.</div>
              <div className="text-[11px] text-muted-foreground">Automated compliance with RFC 6797 and OWASP Top 10 A02:2021 Cryptographic Failures.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FramerAdminCockpit;
