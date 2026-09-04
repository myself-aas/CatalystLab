import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Zap, ShieldCheck, Bot, Radio, Globe, Activity, ArrowRight } from 'lucide-react';
import { Card } from '../primitives/Card';
import { CardMedia } from '../primitives/CardMedia';
import { PillCTA } from '../primitives/PillCTA';
import { CardChip } from '../primitives/CardChip';

export interface LiveTelemetryPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  activeDomain?: string;
  onAuditLaunch?: (domain: string) => void;
  className?: string;
}

/**
 * LiveTelemetryPanel — R1 Mission Card Architectural Implementation
 * Reference: R1 Mission Card (Full-bleed media, top brand wordmark + timestamp, bottom title/subtitle over soft blurred scrim, pill CTA, ~24px radius)
 */
export const LiveTelemetryPanel: React.FC<LiveTelemetryPanelProps> = ({
  activeDomain = 'catalystlab.tech',
  onAuditLaunch,
  className,
  ...props
}) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'pops' | 'vectors'>('stream');

  return (
    <Card
      variant="immersive"
      hue="vitalzyme"
      lift={false}
      className={twMerge(
        clsx(
          'relative w-full rounded-[24px] border border-white/15 bg-muted/40/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between min-h-[460px]',
          className
        )
      )}
      {...props}
    >
      {/* 1. Full-Bleed Datacenter Media Background with Scrim (R1 Anatomy) */}
      <CardMedia
        assetId="hero-datacenter-bg"
        alt="CatalystLab Global Edge Datacenter"
        scrim="immersive"
        enableDuotone
      />

      {/* 2. Top Header Row: Brand Wordmark Left + Live Timestamp Right (R1 Top Row) */}
      <div className="z-10 flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-foreground/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono font-bold text-xs sm:text-sm tracking-wider text-primary-foreground uppercase flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>CATALYSTLAB TELEMETRY OS</span>
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-primary/80 p-0.5 rounded-lg border border-border">
          {(['stream', 'pops', 'vectors'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-2.5 py-1 rounded text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer',
                activeTab === tab
                  ? 'bg-cyan-500 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-muted-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Active Target Banner */}
      <div className="z-10 px-4 sm:px-5 py-2.5 bg-foreground/30 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono text-muted-foreground">
            Target: <strong className="text-primary-foreground">{activeDomain}</strong>
          </span>
        </div>
        <CardChip variant="live" isLive label="SYNCHRONOUS AST" />
      </div>

      {/* 3. Middle Telemetry Grid */}
      <div className="z-10 p-4 sm:p-5 grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-foreground/50 border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>EDGE TTFB</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-cyan-300">18.2</span>
            <span className="text-[10px] font-mono text-muted-foreground">ms</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-foreground/50 border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>OWASP</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-emerald-300">6/6</span>
            <span className="text-[10px] font-mono text-muted-foreground">Pass</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-foreground/50 border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>LLM-RAG</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-purple-300">98%</span>
            <span className="text-[10px] font-mono text-muted-foreground">Index</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row (R1 Anatomy: Bottom-Left Title/Subtitle + Bottom-Right Pill CTA) */}
      <div className="z-10 p-4 sm:p-5 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold font-sans text-primary-foreground tracking-tight">
            Autonomous Audit Terminal
          </h3>
          <p className="text-xs text-muted-foreground font-sans">
            Continuous deep-inspection with zero agents or configuration.
          </p>
        </div>

        <div className="shrink-0">
          <PillCTA
            variant="solid"
            label="Run Full Audit"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => onAuditLaunch?.(activeDomain)}
            href={`/launch-audit?url=${encodeURIComponent(activeDomain)}`}
          />
        </div>
      </div>
    </Card>
  );
};
