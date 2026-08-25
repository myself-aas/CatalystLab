import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal as TerminalIcon, 
  Zap, 
  ShieldCheck, 
  Leaf, 
  Gauge, 
  Play, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export type SandboxType = 'vitalzyme' | 'edgevmax' | 'riskprotease' | 'ecoholo';

interface InteractiveTelemetrySandboxProps {
  type?: SandboxType;
  title?: string;
  className?: string;
}

export const InteractiveTelemetrySandbox: React.FC<InteractiveTelemetrySandboxProps> = ({
  type = 'vitalzyme',
  title,
  className = ''
}) => {
  const [activeSandbox, setActiveSandbox] = useState<SandboxType>(type);

  // VitalZyme state
  const [lcpMs, setLcpMs] = useState(850);
  const [clsVal, setClsVal] = useState(0.02);
  const [inpMs, setInpMs] = useState(48);

  // EdgeVmax state
  const [selectedPoP, setSelectedPoP] = useState<'IAD' | 'SJC' | 'FRA' | 'NRT' | 'SIN'>('IAD');
  const [enableHttp3, setEnableHttp3] = useState(true);

  // RiskProtease state
  const [hasCsp, setHasCsp] = useState(true);
  const [hasHsts, setHasHsts] = useState(true);
  const [hasCoop, setHasCoop] = useState(true);

  // EcoHolo state
  const [pageWeightKb, setPageWeightKb] = useState(420);
  const [isGreenHost, setIsGreenHost] = useState(true);

  // Compute scores
  const getVitalZymeScore = () => {
    let score = 100;
    if (lcpMs > 2500) score -= 30;
    else if (lcpMs > 1200) score -= (lcpMs - 1200) / 40;

    if (clsVal > 0.1) score -= 25;
    else if (clsVal > 0.05) score -= (clsVal - 0.05) * 200;

    if (inpMs > 200) score -= 25;
    else if (inpMs > 80) score -= (inpMs - 80) / 6;

    return Math.max(10, Math.min(100, Math.round(score)));
  };

  const getEdgeLatency = () => {
    const base: Record<string, number> = {
      IAD: 12,
      SJC: 15,
      FRA: 14,
      NRT: 19,
      SIN: 22
    };
    const lat = base[selectedPoP] || 15;
    return enableHttp3 ? lat : lat + 24;
  };

  const getSecurityGrade = () => {
    const checks = [hasCsp, hasHsts, hasCoop].filter(Boolean).length;
    if (checks === 3) return { grade: 'A+', color: 'text-[#00FF66]', bg: 'bg-emerald-950/40 border-emerald-500/40' };
    if (checks === 2) return { grade: 'B', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/40' };
    return { grade: 'F', color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-500/40' };
  };

  const getCarbonGrams = () => {
    const kwh = (pageWeightKb / 1024) * 0.0008;
    const factor = isGreenHost ? 210 : 475;
    return ((kwh * factor)).toFixed(3);
  };

  return (
    <div className={`my-6 rounded-2xl border border-slate-800 bg-[#080D1A] overflow-hidden shadow-2xl font-mono ${className}`}>
      {/* Sandbox Header */}
      <div className="p-3.5 bg-[#0B101D] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <TerminalIcon className="h-3.5 w-3.5 text-[#00F0FF]" />
            {title || `Interactive Telemetry Sandbox [${activeSandbox.toUpperCase()}]`}
          </span>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center gap-1 bg-[#060912] p-1 rounded-xl border border-slate-800 text-[10px]">
          {(['vitalzyme', 'edgevmax', 'riskprotease', 'ecoholo'] as SandboxType[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveSandbox(st)}
              className={`px-2 py-0.5 rounded-md font-bold uppercase transition-all cursor-pointer ${
                activeSandbox === st
                  ? 'bg-[#06B6D4] text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'vitalzyme' && 'VitalZyme'}
              {st === 'edgevmax' && 'EdgeVmax'}
              {st === 'riskprotease' && 'RiskProtease'}
              {st === 'ecoholo' && 'EcoHolo'}
            </button>
          ))}
        </div>
      </div>

      {/* Sandbox Body */}
      <div className="p-5 text-xs">
        
        {/* VITALZYME SANDBOX */}
        {activeSandbox === 'vitalzyme' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Simulate Core Web Vitals payload impact:</span>
              <span className="text-[#00F0FF] font-bold">Composite Score: {getVitalZymeScore()}/100</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 bg-[#060912] p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">LCP</span>
                  <span className="text-[#00F0FF]">{lcpMs}ms</span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={4000}
                  step={50}
                  value={lcpMs}
                  onChange={(e) => setLcpMs(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#06B6D4]"
                />
                <span className="text-[10px] text-slate-500 block">&lt;1200ms: Optimal</span>
              </div>

              <div className="space-y-1.5 bg-[#060912] p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">CLS</span>
                  <span className="text-[#00FF66]">{clsVal}</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={0.3}
                  step={0.01}
                  value={clsVal}
                  onChange={(e) => setClsVal(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00FF66]"
                />
                <span className="text-[10px] text-slate-500 block">&lt;0.05: Zero shift</span>
              </div>

              <div className="space-y-1.5 bg-[#060912] p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">INP</span>
                  <span className="text-purple-400">{inpMs}ms</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={350}
                  step={5}
                  value={inpMs}
                  onChange={(e) => setInpMs(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-[10px] text-slate-500 block">&lt;80ms: Instant</span>
              </div>
            </div>
          </div>
        )}

        {/* EDGEVMAX SANDBOX */}
        {activeSandbox === 'edgevmax' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Edge Anycast TLS 1.3 &amp; HTTP/3 TTFB Simulator:</span>
              <span className="text-[#00F0FF] font-bold">Measured TTFB: {getEdgeLatency()}ms</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['IAD', 'SJC', 'FRA', 'NRT', 'SIN'] as const).map((pop) => (
                <button
                  key={pop}
                  type="button"
                  onClick={() => setSelectedPoP(pop)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                    selectedPoP === pop
                      ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#00F0FF] font-bold'
                      : 'bg-[#060912] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  PoP: {pop}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableHttp3}
                  onChange={(e) => setEnableHttp3(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-[#06B6D4] focus:ring-0"
                />
                <span>Enable HTTP/3 (QUIC 0-RTT Connection Resumption)</span>
              </label>
            </div>
          </div>
        )}

        {/* RISKPROTEASE SANDBOX */}
        {activeSandbox === 'riskprotease' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Zero-Trust Security Headers Audit:</span>
              {(() => {
                const sec = getSecurityGrade();
                return (
                  <span className={`px-2 py-0.5 rounded border font-bold ${sec.color} ${sec.bg}`}>
                    Grade: {sec.grade}
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#060912] border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCsp}
                  onChange={(e) => setHasCsp(e.target.checked)}
                  className="rounded text-[#06B6D4]"
                />
                <span>Strict CSP Nonces</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#060912] border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHsts}
                  onChange={(e) => setHasHsts(e.target.checked)}
                  className="rounded text-[#06B6D4]"
                />
                <span>HSTS Preload (2y)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#060912] border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCoop}
                  onChange={(e) => setHasCoop(e.target.checked)}
                  className="rounded text-[#06B6D4]"
                />
                <span>COOP / COEP Isolation</span>
              </label>
            </div>
          </div>
        )}

        {/* ECOHOLO SANDBOX */}
        {activeSandbox === 'ecoholo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>SWD Digital Carbon Footprint Estimator:</span>
              <span className="text-emerald-400 font-bold">{getCarbonGrams()}g CO2e / pageview</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-300">
                <span>Compressed Transfer Size:</span>
                <span className="text-emerald-400">{pageWeightKb} KB</span>
              </div>
              <input
                type="range"
                min={50}
                max={3000}
                step={50}
                value={pageWeightKb}
                onChange={(e) => setPageWeightKb(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGreenHost}
                  onChange={(e) => setIsGreenHost(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span>Green Web Foundation Certified Cloud Hosting (Zero-Carbon Grid)</span>
              </label>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
