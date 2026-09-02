import React, { useState } from 'react';
import { motion } from 'motion/react';
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card } from '../cards/primitives/Card';

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

  const chartData = [
    { name: 'Target', score: activeSelected.targetScore, fill: '#4f46e5' },
    { name: 'Benchmark', score: activeSelected.benchmarkScore, fill: '#94a3b8' },
  ];

  return (
    <Card
      id={cardId}
      variant="surface"
      className={`border-border shadow-sm ${className}`}
    >
      {/* Header Comparison Banner - Refined Light Theme */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-sans font-bold tracking-widest text-indigo-600 uppercase">
                COMPARATIVE TELEMETRY MATRIX
              </span>
              <h3 className="text-base font-bold text-foreground">
                Head-to-Head Vector Benchmark
              </h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
            <span>{wins}/{activeVectors.length} Vectors Ahead</span>
          </span>
        </div>
      </div>

      {/* Vector List & Interactive Chart */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vector List */}
        <div className="space-y-2">
          {activeVectors.map((vec) => {
            const Icon = vec.icon;
            const isSelected = vec.id === selectedVectorId;

            return (
              <button
                key={vec.id}
                onClick={() => setSelectedVectorId(vec.id)}
                className={`w-full p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-indigo-200 bg-indigo-50 shadow-sm'
                    : 'border-border hover:border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-sans font-semibold ${isSelected ? 'text-indigo-900' : 'text-muted-foreground'}`}>
                      {vec.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-sans font-bold text-emerald-700">
                    {vec.deltaText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recharts Visualization */}
        <div className="bg-muted rounded-xl p-4 border border-border flex flex-col">
          <span className="text-xs font-sans font-bold text-muted-foreground mb-4">
            Vector Score Comparison
          </span>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={false} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-background border border-border text-xs text-muted-foreground">
            <span className="font-sans font-bold text-foreground">Vector Insight:</span>{' '}
            {activeSelected.description}
          </div>
        </div>
      </div>
    </Card>
  );
};


export default BenchmarkCard;
