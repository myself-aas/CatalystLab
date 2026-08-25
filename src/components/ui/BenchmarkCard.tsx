import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Trophy,
  Zap,
  ShieldCheck,
  Leaf,
  Bot,
  Gauge,
  Layers,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

export interface BenchmarkVector {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  targetValue: string | number;
  targetScore: number; // 0 - 100
  targetUnit?: string;
  benchmarkValue: string | number;
  benchmarkScore: number; // 0 - 100
  benchmarkUnit?: string;
  deltaText: string;
  deltaDirection: 'positive' | 'negative' | 'neutral';
  verdict: 'WIN' | 'PARITY' | 'LOSS';
  description: string;
}

export interface BenchmarkCardProps {
  targetDomain: string;
  targetScore?: number;
  benchmarkDomain: string;
  benchmarkScore?: number;
  vectors?: BenchmarkVector[];
  className?: string;
  id?: string;
}

export const BenchmarkCard: React.FC<BenchmarkCardProps> = ({
  targetDomain = 'your-domain.com',
  targetScore = 92,
  benchmarkDomain = 'Industry P90 Benchmark',
  benchmarkScore = 74,
  vectors,
  className = '',
  id,
}) => {
  const [selectedVectorId, setSelectedVectorId] = useState<string>('ttfb');

  const cardId = id || `benchmark-card-${targetDomain.replace(/[^a-z0-9]/gi, '-')}`;

  const defaultVectors: BenchmarkVector[] = [
    {
      id: 'ttfb',
      name: 'TTFB Latency (VitalZyme)',
      icon: Zap,
      targetValue: 48,
      targetScore: 95,
      targetUnit: 'ms',
      benchmarkValue: 185,
      benchmarkScore: 68,
      benchmarkUnit: 'ms',
      deltaText: '74% Faster Edge Handshake',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'Initial HTML server response time measured across multi-region edge points of presence.',
    },
    {
      id: 'lcp',
      name: 'Largest Contentful Paint',
      icon: Gauge,
      targetValue: 1.1,
      targetScore: 92,
      targetUnit: 's',
      benchmarkValue: 2.8,
      benchmarkScore: 62,
      benchmarkUnit: 's',
      deltaText: '60% Faster Hero Paint',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'Render timing for the primary viewport hero asset and critical hydration cascade.',
    },
    {
      id: 'ai_ready',
      name: 'AI RAG Readiness (LLM-Kinase)',
      icon: Bot,
      targetValue: 96,
      targetScore: 96,
      targetUnit: '/100',
      benchmarkValue: 54,
      benchmarkScore: 54,
      benchmarkUnit: '/100',
      deltaText: '+42pt Context Extraction',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'Presence of /llms.txt, JSON-LD Schema.org graphs, and GPTBot/ClaudeBot crawler policies.',
    },
    {
      id: 'security',
      name: 'OWASP Headers (Compliasome)',
      icon: ShieldCheck,
      targetValue: '6/6',
      targetScore: 100,
      targetUnit: 'Pass',
      benchmarkValue: '2/6',
      benchmarkScore: 40,
      benchmarkUnit: 'Pass',
      deltaText: 'Hardened Zero-Trust Perimeter',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'Audit of Strict-Transport-Security, Content-Security-Policy, and Referrer-Policy headers.',
    },
    {
      id: 'carbon',
      name: 'Eco Carbon (EcoLactase)',
      icon: Leaf,
      targetValue: 0.14,
      targetScore: 94,
      targetUnit: 'g CO2',
      benchmarkValue: 0.58,
      benchmarkScore: 60,
      benchmarkUnit: 'g CO2',
      deltaText: '75% Lower Emissions',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'Sustainable Web Design (SWD v4) calculation per pageview with green CDN verification.',
    },
    {
      id: 'ast',
      name: 'DOM Hydration AST (Migratase)',
      icon: Layers,
      targetValue: 420,
      targetScore: 90,
      targetUnit: 'nodes',
      benchmarkValue: 2450,
      benchmarkScore: 50,
      benchmarkUnit: 'nodes',
      deltaText: '82% Lighter DOM Tree',
      deltaDirection: 'positive',
      verdict: 'WIN',
      description: 'Cyclomatic nesting depth, hydration memory overhead, and total DOM element count.',
    },
  ];

  const activeVectors = vectors || defaultVectors;
  const activeSelected = activeVectors.find((v) => v.id === selectedVectorId) || activeVectors[0];

  const wins = activeVectors.filter((v) => v.verdict === 'WIN').length;

  return (
    <div
      id={cardId}
      className={`rounded-xl border border-slate-800 bg-[#0B101B]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden font-sans ${className}`}
    >
      {/* Header Comparison Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0D1424] to-[#0A0F1D] border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4]">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-semibold tracking-wider text-[#06B6D4] uppercase">
                COMPARATIVE TELEMETRY MATRIX
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Head-to-Head Vector Benchmark
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#10B981]/15 text-[#00FF66] border border-[#10B981]/30">
              <Trophy className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>
                {wins}/{activeVectors.length} Vectors Ahead
              </span>
            </span>
          </div>
        </div>

        {/* Side-by-Side Domain Badges */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Target Domain Card */}
          <div className="p-3 rounded-lg bg-[#070B13] border border-[#06B6D4]/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono text-[#06B6D4] font-bold">
                [TARGET SITE]
              </span>
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm font-mono font-bold text-slate-100 truncate mt-1">
              {targetDomain}
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-mono font-extrabold text-[#00FF66]">
                {targetScore}
              </span>
              <span className="text-[10px] font-mono text-slate-500">/100 Composite</span>
            </div>
          </div>

          {/* Benchmark Domain Card */}
          <div className="p-3 rounded-lg bg-[#070B13] border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono text-slate-400 font-medium">
                [BENCHMARK]
              </span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            <p className="text-xs sm:text-sm font-mono font-semibold text-slate-300 truncate mt-1">
              {benchmarkDomain}
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-mono font-extrabold text-slate-400">
                {benchmarkScore}
              </span>
              <span className="text-[10px] font-mono text-slate-500">/100 Composite</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vector List / Mobile Tabs */}
      <div className="p-4 sm:p-5 space-y-3">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
          Telemetry Vector Deltas:
        </span>

        <div className="space-y-2">
          {activeVectors.map((vec) => {
            const Icon = vec.icon;
            const isSelected = vec.id === selectedVectorId;

            return (
              <div
                key={vec.id}
                id={`${cardId}-row-${vec.id}`}
                onClick={() => setSelectedVectorId(vec.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#06B6D4]/80 bg-[#070B14] shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'border-slate-800/80 bg-[#080D17]/70 hover:border-slate-700 hover:bg-[#0A101C]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded ${
                        isSelected
                          ? 'bg-[#06B6D4]/20 text-[#00F0FF]'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-mono font-semibold text-slate-200 truncate">
                      {vec.name}
                    </span>
                  </div>

                  {/* Delta Pill */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#10B981]/15 text-[#00FF66] border border-[#10B981]/30">
                      <TrendingUp className="w-3 h-3 text-[#00FF66]" />
                      <span>{vec.deltaText}</span>
                    </span>
                  </div>
                </div>

                {/* Comparative Mini Gauges */}
                <div className="mt-2.5 grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/40 text-xs font-mono">
                  <div>
                    <div className="flex items-baseline justify-between text-slate-300">
                      <span className="text-[10px] text-slate-500">Target</span>
                      <span className="font-bold text-[#00FF66]">
                        {vec.targetValue}
                        {vec.targetUnit && ` ${vec.targetUnit}`}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${vec.targetScore}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#06B6D4] to-[#00FF66] rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between text-slate-400">
                      <span className="text-[10px] text-slate-500">Benchmark</span>
                      <span className="font-medium text-slate-400">
                        {vec.benchmarkValue}
                        {vec.benchmarkUnit && ` ${vec.benchmarkUnit}`}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${vec.benchmarkScore}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-slate-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Vector Deep Dive Note */}
        {activeSelected && (
          <div className="mt-3 p-3 rounded-lg bg-[#070A12] border border-slate-800/80 text-xs font-sans text-slate-400">
            <span className="font-mono font-bold text-slate-300">
              Vector Insight:
            </span>{' '}
            {activeSelected.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchmarkCard;
