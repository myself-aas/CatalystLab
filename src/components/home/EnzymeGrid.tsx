import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  Layers,
  Activity,
  ShieldCheck,
  Cpu,
  Search,
  Leaf,
  Terminal,
  FileCode,
  Globe,
} from 'lucide-react';
import { ENGINES_MAP } from '../../data/engines';
import { SectionHeader } from './SectionHeader';
import { onSpotlightMouseMove } from '../../hooks/useSpotlight';
import { CopyButton } from '../ui/CopyButton';

const EASE = [0.16, 1, 0.3, 1] as const;

export const EnzymeGrid: React.FC = () => {
  const [synthTab, setSynthTab] = useState<'payload' | 'diff' | 'schema'>('diff');
  const [cliTab, setCliTab] = useState<'claude' | 'framer'>('claude');

  return (
    <section id="engines" className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <SectionHeader
          eyebrow={
            <>
              <Layers className="size-3.5 text-[#0066FF]" />
              <span>Autonomous engines</span>
            </>
          }
          title="A lab, not a lighthouse."
          description="Each catalyst maps to a phase of the SDLC — migration, hygiene, carbon, vitals, edge, security, AI readiness, and generative search."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          {/* Card 1: SynthShift & Schema Validation (8 Cols, Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0, ease: EASE }}
            className="md:col-span-8 md:row-span-2 group relative flex h-full"
          >
            <div
              onMouseMove={onSpotlightMouseMove}
              className="relative flex h-full w-full min-h-[380px] flex-col justify-between p-5 sm:p-7 bg-surface border border-border rounded-2xl md:rounded-3xl hover:-translate-y-[2px] hover:border-border-strong transition-[transform,border-color] duration-200 ease-out"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'var(--glow-card-subsurface)' }}
              />

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[#8A2BE2] border-[#8A2BE2]/30 bg-[#8A2BE2]/10">
                    SS-01
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">
                    AST Diff & Schema Engine
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="framer-card-title text-white">
                    SynthShift &amp; Schema Validation
                  </h3>
                  <Link
                    to={ENGINES_MAP.migration.route}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Inspect
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
                <p className="mt-1 framer-body-text">
                  Translates deprecated runtime payloads into zero-overhead modern schemas via AST diff patches.
                </p>

                {/* Interactive AST / Schema Visualizer */}
                <div className="mt-5 overflow-hidden rounded-xl border border-border bg-background">
                  {/* Tabs Bar */}
                  <div className="flex items-center justify-between border-b border-border bg-white/5 px-3 py-2 text-xs font-mono">
                    <div className="flex gap-2">
                      {(['payload', 'diff', 'schema'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setSynthTab(tab)}
                          className={`rounded-md px-2.5 py-1 transition-all ${
                            synthTab === tab
                              ? 'bg-white/15 text-white shadow-sm'
                              : 'text-muted-foreground hover:text-muted-foreground'
                          }`}
                        >
                          {tab === 'payload' && 'Payload'}
                          {tab === 'diff' && 'AST Diff'}
                          {tab === 'schema' && 'Output Schema'}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-[#8A2BE2] font-mono">AST · v3.2.0</span>
                  </div>

                  {/* Tab Contents */}
                  <div className="p-4 font-mono text-xs overflow-x-auto no-scrollbar">
                    {synthTab === 'payload' && (
                      <pre className="text-muted-foreground leading-relaxed">
{`{
  "deprecatedModule": "legacy-auth-v1",
  "astTarget": "RFC-7519",
  "handshakeTime": 142
}`}
                      </pre>
                    )}
                    {synthTab === 'diff' && (
                      <div className="flex flex-col gap-1 leading-relaxed">
                        <div className="text-red-400/90 font-mono">
                          - import &#123; createLegacySession &#125; from '@auth/legacy';
                        </div>
                        <div className="text-emerald-400 font-mono">
                          + import &#123; createEdgeSession, verifyDPoP &#125; from '@catalyst/auth';
                        </div>
                        <div className="text-red-400/90 font-mono">
                          - const session = await createLegacySession(req.cookies);
                        </div>
                        <div className="text-emerald-400 font-mono">
                          + const session = await createEdgeSession(req.headers, &#123; zeroRoundTrip: true &#125;);
                        </div>
                        <div className="mt-2 text-[11px] text-[#8A2BE2] opacity-80">
                          ✓ AST diff verified · 0 runtime overhead · 100% type-safe
                        </div>
                      </div>
                    )}
                    {synthTab === 'schema' && (
                      <pre className="text-emerald-400 leading-relaxed">
{`export interface EdgeSessionPayload {
  readonly sub: string;
  readonly iss: 'https://catalystlab.tech';
  readonly zeroRoundTrip: true;
}`}
                      </pre>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-widest text-[#8A2BE2]">
                  Bytecode Transformation
                </span>
                <span className="font-mono text-emerald-400">100% AST Parity</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: VitalZyme (4 Cols) - Core Web Vitals Radial Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.06, ease: EASE }}
            className="md:col-span-4 group relative flex h-full"
          >
            <div
              onMouseMove={onSpotlightMouseMove}
              className="relative flex h-full w-full min-h-[250px] flex-col justify-between p-5 sm:p-7 bg-surface border border-border rounded-2xl md:rounded-3xl hover:-translate-y-[2px] hover:border-border-strong transition-[transform,border-color] duration-200 ease-out"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'var(--glow-card-subsurface)' }}
              />

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[#00F298] border-[#00F298]/30 bg-[#00F298]/10">
                    VZ-02
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CWV 99.9%
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="framer-card-title text-white">
                    VitalZyme
                  </h3>
                  <Link
                    to={ENGINES_MAP.health.route}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Inspect
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
                <p className="mt-1 framer-body-text">
                  Microsecond-precision Core Web Vitals diagnostic engine.
                </p>

                {/* Micro Gauge Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: 'LCP', val: '1.06s', badge: 'Fast' },
                    { label: 'INP', val: '42ms', badge: 'Optimal' },
                    { label: 'CLS', val: '0.00', badge: 'Zero' },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden"
                    >
                      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00F298]" />
                      <span className="text-white font-mono text-sm font-semibold">{m.val}</span>
                      <span className="text-muted-foreground text-[10px] font-mono mt-0.5">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-widest text-[#00F298]">
                  DOM Telemetry
                </span>
                <span className="font-mono text-emerald-400">P95 Sub-1.2s</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: EdgeKinase & Mesh Network (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
            className="md:col-span-4 group relative flex h-full"
          >
            <div
              onMouseMove={onSpotlightMouseMove}
              className="relative flex h-full w-full min-h-[250px] flex-col justify-between p-5 sm:p-7 bg-surface border border-border rounded-2xl md:rounded-3xl hover:-translate-y-[2px] hover:border-border-strong transition-[transform,border-color] duration-200 ease-out"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'var(--glow-card-subsurface)' }}
              />

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[#00D2FF] border-[#00D2FF]/30 bg-[#00D2FF]/10">
                    EK-03
                  </span>
                  <span className="text-[10px] bg-[#00D2FF]/10 text-[#00D2FF] px-2 py-0.5 rounded-full border border-[#00D2FF]/20 font-mono">
                    38 PoPs Active
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="framer-card-title text-white">
                    EdgeKinase &amp; Mesh
                  </h3>
                  <Link
                    to={ENGINES_MAP.latency.route}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Inspect
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
                <p className="mt-1 framer-body-text">
                  Global 38-PoP edge handshake and zero-RTT packet telemetry.
                </p>

                {/* 38-PoP Latency Ping Matrix */}
                <div className="mt-4 flex flex-col gap-2 rounded-xl bg-white/5 p-3 border border-white/5">
                  {[
                    { reg: 'IAD (US-East)', lat: '12ms', width: '25%' },
                    { reg: 'LHR (London)', lat: '24ms', width: '45%' },
                    { reg: 'NRT (Tokyo)', lat: '42ms', width: '70%' },
                  ].map((p) => (
                    <div key={p.reg} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground text-[11px]">{p.reg}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00D2FF] rounded-full" style={{ width: p.width }} />
                        </div>
                        <span className="text-white text-[11px] w-8 text-right font-medium">{p.lat}</span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] text-[#00D2FF] font-mono">
                    <span className="flex items-center gap-1">
                      <Activity className="size-3" /> HTTP/3 QUIC
                    </span>
                    <span>0-RTT Handshake</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-widest text-[#00D2FF]">
                  Edge Telemetry
                </span>
                <span className="font-mono text-[#00D2FF]">P95 18ms</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: RiskProtease & OWASP (8 Cols) - CLI Terminal / Sniffer */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
            className="md:col-span-8 group relative flex h-full"
          >
            <div
              onMouseMove={onSpotlightMouseMove}
              className="relative flex h-full w-full min-h-[300px] flex-col justify-between p-5 sm:p-7 bg-surface border border-border rounded-2xl md:rounded-3xl hover:-translate-y-[2px] hover:border-border-strong transition-[transform,border-color] duration-200 ease-out"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'var(--glow-card-subsurface)' }}
              />

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[#FF9900] border-[#FF9900]/30 bg-[#FF9900]/10">
                    RP-04
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">
                    Transport &amp; Header Security
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="framer-card-title text-white">
                    RiskProtease &amp; OWASP
                  </h3>
                  <Link
                    to={ENGINES_MAP.compliance.route}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Inspect
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
                <p className="mt-1 framer-body-text">
                  Zero-overhead passive transport packet sniffer evaluating CSP nonces, HSTS preload, and OWASP compliance.
                </p>

                {/* Realistic macOS Terminal Bar with Claude Code / Framer CLI Tabs */}
                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
                  <div className="flex items-center justify-between border-b border-border bg-surface px-3.5 py-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
                      <div className="size-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                      <div className="size-2.5 rounded-full bg-green-500/30 border border-green-500/50" />
                      <div className="ml-2 flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => setCliTab('claude')}
                          className={`px-2 py-0.5 rounded transition-colors ${
                            cliTab === 'claude' ? 'bg-white/15 text-white' : 'hover:text-white'
                          }`}
                        >
                          Claude Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setCliTab('framer')}
                          className={`px-2 py-0.5 rounded transition-colors ${
                            cliTab === 'framer' ? 'bg-white/15 text-white' : 'hover:text-white'
                          }`}
                        >
                          Framer CLI
                        </button>
                      </div>
                    </div>
                    <CopyButton
                      text="npx @catalystlab/cli inspect --owasp"
                      variant="terminal"
                      label="Copy CLI"
                      copiedLabel="Copied!"
                    />
                  </div>

                  <div className="p-3.5 font-mono text-xs overflow-x-auto no-scrollbar flex flex-col gap-1.5 text-[#00D2FF]">
                    <div>
                      <span className="text-muted-foreground">&gt;</span> Strict-Transport-Security:{' '}
                      <span className="text-emerald-400 font-semibold">max-age=63072000; includeSubDomains (OK)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">&gt;</span> X-Frame-Options:{' '}
                      <span className="text-emerald-400 font-semibold">DENY (OK)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">&gt;</span> Content-Security-Policy:{' '}
                      <span className="text-[#FF9900]">Strict Nonce Enforced (Pass with 0 warnings)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-widest text-[#FF9900]">
                  OWASP A05:2021
                </span>
                <span className="font-mono text-emerald-400">A+ Grade Transport</span>
              </div>
            </div>
          </motion.div>

          {/* Card 5: EcoHolo (4 Cols) - Carbon/Transfer Budget */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.24, ease: EASE }}
            className="md:col-span-4 group relative flex h-full"
          >
            <div
              onMouseMove={onSpotlightMouseMove}
              className="relative flex h-full w-full min-h-[250px] flex-col justify-between p-5 sm:p-7 bg-surface border border-border rounded-2xl md:rounded-3xl hover:-translate-y-[2px] hover:border-border-strong transition-[transform,border-color] duration-200 ease-out"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'var(--glow-card-subsurface)' }}
              />

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                    EH-05
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                    Eco Grade A
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="framer-card-title text-white">
                    EcoHolo
                  </h3>
                  <Link
                    to={ENGINES_MAP.eco.route}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Inspect
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
                <p className="mt-1 framer-body-text">
                  Edge transfer byte budget and CO2e emissions calculator.
                </p>

                {/* Carbon Radial Gauge Preview */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full border-2 border-emerald-400/60 border-t-emerald-400 flex items-center justify-center">
                      <Leaf className="size-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white font-mono">0.12g CO2e</div>
                      <div className="text-[10px] text-muted-foreground font-mono">per edge hit</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                    Top 15%
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-widest text-emerald-400">
                  Transfer Budget
                </span>
                <span className="font-mono text-emerald-400">42 KB wire size</span>
              </div>
            </div>
          </motion.div>

          {/* Card 6: LLM-Kinase (4 Cols) - AEO / AI Manifest Schema */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
            className="md:col-span-4 group relative flex h-full"
          >
            <div
              onMouseMove={onSpotlightMouseMove}
              className="relative flex h-full w-full min-h-[250px] flex-col justify-between p-5 sm:p-7 bg-surface border border-border rounded-2xl md:rounded-3xl hover:-translate-y-[2px] hover:border-border-strong transition-[transform,border-color] duration-200 ease-out"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'var(--glow-card-subsurface)' }}
              />

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[#0066FF] border-[#0066FF]/30 bg-[#0066FF]/10">
                    LK-06
                  </span>
                  <span className="text-[10px] bg-[#0066FF]/10 text-[#0066FF] px-2 py-0.5 rounded-full border border-[#0066FF]/20 font-mono">
                    /llms.txt Active
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="framer-card-title text-white">
                    LLM-Kinase
                  </h3>
                  <Link
                    to={ENGINES_MAP.ai_ready.route}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Inspect
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
                <p className="mt-1 framer-body-text">
                  AEO &amp; AI manifest schema auditor for Gemini, ChatGPT, and Claude.
                </p>

                {/* AI Manifest Schema Preview */}
                <div className="mt-4 rounded-xl bg-white/5 p-3 border border-white/5 font-mono text-[11px] text-muted-foreground">
                  <div className="flex items-center justify-between text-[#0066FF] mb-1.5">
                    <span className="flex items-center gap-1">
                      <Cpu className="size-3" /> /llms.txt Parser
                    </span>
                    <span className="text-emerald-400">Valid</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div>GPTBot &amp; ClaudeBot: <span className="text-emerald-400">Allowed</span></div>
                    <div>RAG Semantic Density: <span className="text-white font-semibold">0.96</span></div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-widest text-[#0066FF]">
                  AI Discoverability
                </span>
                <span className="font-mono text-emerald-400">Structured Data OK</span>
              </div>
            </div>
          </motion.div>

          {/* Card 7: AllosterSearch (4 Cols) - Sub-50ms Discoverability */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.36, ease: EASE }}
            className="md:col-span-4 group relative flex h-full"
          >
            <div
              onMouseMove={onSpotlightMouseMove}
              className="relative flex h-full w-full min-h-[250px] flex-col justify-between p-5 sm:p-7 bg-surface border border-border rounded-2xl md:rounded-3xl hover:-translate-y-[2px] hover:border-border-strong transition-[transform,border-color] duration-200 ease-out"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'var(--glow-card-subsurface)' }}
              />

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[#00D2FF] border-[#00D2FF]/30 bg-[#00D2FF]/10">
                    AS-07
                  </span>
                  <span className="text-[10px] bg-[#00D2FF]/10 text-[#00D2FF] px-2 py-0.5 rounded-full border border-[#00D2FF]/20 font-mono">
                    Sub-50ms Index
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="framer-card-title text-white">
                    AllosterSearch
                  </h3>
                  <Link
                    to={ENGINES_MAP.llmo.route}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Inspect
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
                <p className="mt-1 framer-body-text">
                  Sub-50ms search index crawling &amp; semantic token retrieval rate.
                </p>

                {/* Sub-50ms Discoverability Index */}
                <div className="mt-4 rounded-xl bg-white/5 p-3 border border-white/5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1 text-[#00D2FF]">
                      <Search className="size-3" /> Search Index Rate
                    </span>
                    <span className="text-white font-semibold">34ms P95</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00D2FF] rounded-full w-[88%]" />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                    <span>Vector similarity</span>
                    <span className="text-emerald-400">98.2% accuracy</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-widest text-[#00D2FF]">
                  Generative Search
                </span>
                <span className="font-mono text-emerald-400">Indexed &amp; Ready</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EnzymeGrid;
