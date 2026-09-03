import React from 'react';
import { Activity, Globe, Shield, Sparkles } from 'lucide-react';

const ROWS = [
  { engine: 'VitalZyme', vector: 'LCP · INP · CLS', score: 94, tone: 'ok' as const },
  { engine: 'RiskProtease', vector: 'HSTS · CSP · TLS', score: 88, tone: 'warn' as const },
  { engine: 'EdgeVmax', vector: 'TTFB · 42 PoPs', score: 96, tone: 'ok' as const },
  { engine: 'LLM-Kinase', vector: '/llms.txt · RAG', score: 81, tone: 'warn' as const },
  { engine: 'EcoHolo', vector: 'SWD carbon', score: 90, tone: 'ok' as const },
];

/**
 * Cinematic product surface for the hero — a Linear-style audit console,
 * not a screenshot. Decorative only.
 */
export const HeroAuditMock: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0c]/80 shadow-linear-card backdrop-blur-2xl"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5E6AD2]/60 to-transparent" />

      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-[#8A8F98] sm:flex">
          <span className="size-1.5 rounded-full bg-[#5E6AD2] shadow-[0_0_8px_rgba(94,106,210,0.8)]" />
          catalystlab · master-audit · stripe.com
        </div>
        <div className="font-mono text-[11px] uppercase tracking-widest text-[#6872D9]">
          Composite 92
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="border-b border-white/[0.06] p-5 lg:col-span-7 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#8A8F98]">
              Engine matrix
            </p>
            <span className="rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#6872D9]">
              Live
            </span>
          </div>
          <div className="space-y-2">
            {ROWS.map((row) => (
              <div
                key={row.engine}
                className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.03] px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-[#EDEDEF]">{row.engine}</span>
                    <span className="font-mono text-sm tabular-nums text-[#EDEDEF]">{row.score}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[#5E6AD2]"
                      style={{ width: `${row.score}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[10px] tracking-wide text-[#8A8F98]">{row.vector}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 lg:col-span-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Activity, label: 'LCP', value: '1.2s' },
              { icon: Shield, label: 'CSP', value: 'strict' },
              { icon: Globe, label: 'TTFB', value: '48ms' },
              { icon: Sparkles, label: 'llms.txt', value: 'found' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
              >
                <stat.icon className="mb-2 size-3.5 text-[#5E6AD2]" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#8A8F98]">
                  {stat.label}
                </p>
                <p className="mt-0.5 font-mono text-lg font-semibold tracking-tight text-[#EDEDEF]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-[#050506] p-3 font-mono text-[11px] leading-relaxed text-[#8A8F98]">
            <p className="text-[#6872D9]">$ catalystlab audit stripe.com</p>
            <p className="mt-1">→ resolved 42 anycast PoPs · 11ms</p>
            <p>→ 8 engines parallel · 420ms</p>
            <p>→ dossier synthesized · 190ms</p>
            <p className="mt-2 text-[#EDEDEF]">
              PASS <span className="text-[#8A8F98]">composite 92 / 100</span>
              <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-[#5E6AD2] align-middle terminal-cursor" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroAuditMock;
