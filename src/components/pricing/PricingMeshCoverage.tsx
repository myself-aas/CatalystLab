import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EdgeMeshGlobe } from '../ui/edge-mesh-globe';
import type { PlanTier } from '../../store/useTelemetryHUDStore';

type SpecTier = PlanTier | 'starter';
import { 
  Globe2, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Server, 
  ArrowRight, 
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TierSpec {
  id: SpecTier;
  label: string;
  name: string;
  price: string;
  nodeCount: number;
  sla: string;
  latency: string;
  regions: string;
  description: string;
}

const TIER_SPECS: TierSpec[] = [
  {
    id: 'free',
    label: 'Community / Free',
    name: 'Free Starter',
    price: '$0',
    nodeCount: 6,
    sla: 'Best Effort',
    latency: '< 45ms TTFB',
    regions: 'US-East, US-West, EU-Central, AP-South, AP-East, SA-East',
    description: 'Core 6 global transit gateways for open-source and individual developer health checks.',
  },
  {
    id: 'starter',
    label: 'Starter ($9)',
    name: 'Starter Tier',
    price: '$9/mo',
    nodeCount: 10,
    sla: '99.9% SLA',
    latency: '< 35ms TTFB',
    regions: 'North America + Western Europe + Major Asian Gateways',
    description: 'Expanded 10-node mesh with automated 6-hour cron synthetic probe dispatching.',
  },
  {
    id: 'pro',
    label: 'Pro ($19)',
    name: 'Pro Professional',
    price: '$19/mo',
    nodeCount: 14,
    sla: '99.95% SLA',
    latency: '< 25ms TTFB',
    regions: 'Full North America, Europe, Asia-Pacific Tier-1 Clouds',
    description: '14 Tier-1 Anycast PoPs with sub-25ms response SLA and custom HTTP/3 QUIC validation.',
  },
  {
    id: 'team',
    label: 'Team ($49)',
    name: 'Team Scale',
    price: '$49/mo',
    nodeCount: 26,
    sla: '99.99% SLA',
    latency: '< 18ms TTFB',
    regions: 'Multi-continent Tier-1 & Tier-2 edge nodes with BGP Anycast routing',
    description: '26 redundant PoPs for multi-developer teams with webhook incident fan-out.',
  },
  {
    id: 'enterprise',
    label: 'Enterprise ($99)',
    name: 'Global Enterprise',
    price: '$99/mo',
    nodeCount: 42,
    sla: '99.999% SLA',
    latency: '< 12ms TTFB',
    regions: 'Entire 42-node global mesh including LATAM, Africa & Middle East',
    description: 'Complete 42-node global mesh with dedicated BGP routing and real-time packet loss isolation.',
  },
];

interface PricingMeshCoverageProps {
  onSelectPlan?: (tier: PlanTier) => void;
}

export const PricingMeshCoverage: React.FC<PricingMeshCoverageProps> = ({ onSelectPlan }) => {
  const [selectedTier, setSelectedTier] = useState<SpecTier>('pro');

  const currentSpec = TIER_SPECS.find((t) => t.id === selectedTier) || TIER_SPECS[2];

  return (
    <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-950 text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono text-cyan-300 mb-3 backdrop-blur-md">
              <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Coverage-Driven Scalability</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Global Anycast PoP Mesh by Plan Tier
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-normal">
              Switch plans to see synthetic probe nodes dynamically activate across continents. Higher tiers unlock deeper edge presence for sub-15ms regional routing.
            </p>
          </div>

          {/* Tier Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
            {TIER_SPECS.map((spec) => {
              const isSelected = selectedTier === spec.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => {
                    setSelectedTier(spec.id);
                    const planTier: PlanTier = spec.id === 'starter' ? 'pro' : spec.id;
                    if (onSelectPlan) onSelectPlan(planTier);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{spec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Mesh Preview: 3D Globe + Tier Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive 3D WebGL Globe with Plan Tier filtering */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
            <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden">
              
              {/* Globe Status HUD */}
              <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Server className="h-4 w-4 text-cyan-400 animate-pulse" />
                  <span className="font-bold uppercase tracking-wider">{currentSpec.name} ANYCAST MESH</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{currentSpec.nodeCount} / 42 Nodes Active</span>
                </div>
              </div>

              {/* 3D WebGL Globe Component */}
              <div className="w-full flex items-center justify-center py-2">
                <EdgeMeshGlobe
                  variant="panel"
                  planTier={selectedTier === 'starter' ? 'pro' : selectedTier}
                  interactive={true}
                  autoSpin={true}
                  showInspector={true}
                  showChips={true}
                  showControls={true}
                />
              </div>

              {/* Bottom coverage notes */}
              <div className="w-full mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span>Sub-20ms Handshake SLA</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  HTTP/3 QUIC 0-RTT Active
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tier Metrics & SLA Guarantee Details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl space-y-5 font-mono text-xs">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-[11px] text-cyan-400 uppercase tracking-wider font-bold">Selected Subscription Level</div>
                  <div className="text-2xl font-black text-white font-sans mt-0.5">{currentSpec.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">{currentSpec.price}</div>
                  <div className="text-[10px] text-slate-500">{currentSpec.nodeCount} Nodes Deployed</div>
                </div>
              </div>

              <p className="text-sm font-sans text-slate-300 leading-relaxed">
                {currentSpec.description}
              </p>

              {/* Quick Spec Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">ANYCAST LATENCY</div>
                  <div className="text-base font-bold text-cyan-300 mt-0.5">{currentSpec.latency}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">UPTIME SLA</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{currentSpec.sla}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 text-[11px] font-bold">CONTINENTAL ROUTING FOOTPRINT:</div>
                <div className="text-slate-300 text-xs leading-relaxed font-sans">{currentSpec.regions}</div>
              </div>

              {/* CTA Action */}
              <div className="pt-2">
                <Link
                  to={selectedTier === 'free' ? '/launch-audit' : `/login?tier=${selectedTier}`}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 text-sm"
                >
                  <span>{selectedTier === 'free' ? 'Run Free 6-Node Scan' : `Start 7-Day ${currentSpec.name} Trial`}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
