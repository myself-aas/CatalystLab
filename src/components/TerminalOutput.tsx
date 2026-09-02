import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Maximize2, Minimize2, Terminal, CircleDot, Activity, ShieldCheck, ArrowDown } from 'lucide-react';
import { RiskSslGaugeChart } from './charts/RiskSslGaugeChart';

interface TerminalOutputProps {
  title?: string;
  engine?: string;
  icon?: string;
  output: string;
  loading?: boolean;
  statusText?: string;
  maxHeight?: string;
  onCopy?: () => void;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  title = 'Terminal Output',
  engine,
  icon = 'terminal',
  output,
  loading = false,
  statusText,
  maxHeight = 'max-h-72',
  onCopy
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showGauges, setShowGauges] = useState(true);
  const [displayedOutput, setDisplayedOutput] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ponytail: native interval chunks replacing heavy framer-motion typewriter libs
  useEffect(() => {
    if (!output) {
      setDisplayedOutput('');
      return;
    }
    const interval = setInterval(() => {
      setDisplayedOutput(prev => {
        if (prev.length >= output.length) {
          clearInterval(interval);
          return output;
        }
        if (!output.startsWith(prev)) {
          return output.slice(0, Math.max(3, Math.floor(output.length / 40)));
        }
        return output.slice(0, prev.length + Math.max(3, Math.floor(output.length / 40)));
      });
    }, 15);
    return () => clearInterval(interval);
  }, [output]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedOutput, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    if (isAtBottom !== autoScroll) {
      setAutoScroll(isAtBottom);
    }
  };

  const isComplianceEngine = engine === 'compliance' || engine === 'devsecops_compliance' || title.toLowerCase().includes('compliance');

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    if (loading) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
          <span>Executing</span>
        </span>
      );
    }
    if (!output) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#415a77]/30 bg-black/10 px-2 py-0.5 text-[10px] font-semibold text-[#c5d3e8]">
          <span className="h-1.5 w-1.5 rounded-full bg-black" />
          <span>Standby</span>
        </span>
      );
    }
    if (output.includes('[-] FAIL:') || output.includes('[!] CRITICAL:') || output.includes('STATUS: CRITICAL')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          <span>Needs Action</span>
        </span>
      );
    }
    if (output.includes('[~] WARNING:') || output.includes('STATUS: MODERATE')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span>Warning</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span>Optimal</span>
      </span>
    );
  };

  const formatTerminalText = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let colorClass = 'text-[#cbd5e1]';

      if (line.includes('[+] PASS:') || line.includes('STATUS: OPTIMAL') || line.includes('STATUS: EXCELLENT') || line.includes('STATUS: FULLY COMPATIBLE') || line.includes('STATUS: PRODUCTION-READY') || line.includes('STATUS: COMPLIANT')) {
        colorClass = 'text-emerald-700 font-medium';
      } else if (line.includes('[-] FAIL:') || line.includes('[!] CRITICAL:') || line.includes('[!] HIGH RISK:') || line.includes('STATUS: CRITICAL') || line.includes('STATUS: INVISIBLE') || line.includes('STATUS: HIGH LIABILITY') || line.includes('STATUS: AT RISK')) {
        colorClass = 'text-rose-400 font-bold';
      } else if (line.includes('[~] WARNING:') || line.includes('STATUS: MODERATE') || line.includes('STATUS: PARTIAL') || line.includes('STATUS: WARNING') || line.includes('STATUS: FAIR')) {
        colorClass = 'text-amber-300 font-medium';
      } else if (line.startsWith('[sys]') || line.startsWith('[*]')) {
        colorClass = 'text-[#93c5fd] font-semibold';
      } else if (line.startsWith('===') || line.startsWith('---')) {
        colorClass = 'text-[#64748b] font-bold';
      }

      return (
        <div key={idx} className={`${colorClass} leading-relaxed break-words hover:bg-gray-50/30 px-1 rounded transition-colors`}>
          {line || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-black/30 bg-white shadow-xl overflow-hidden hover:border-black/60 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-black/25 bg-black px-4 py-3 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 shadow-sm" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80 shadow-sm" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-sm text-slate-500">{icon}</span>
            <span className="text-xs font-bold text-white tracking-tight">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}

          <div className="h-3.5 w-px bg-white/20 mx-0.5" />

          {isComplianceEngine && (
            <button
              onClick={() => setShowGauges(!showGauges)}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all active:scale-95 ${
                showGauges
                  ? 'border-slate-500/50 bg-black/30 text-white'
                  : 'border-black/30 bg-black/10 text-slate-500 hover:text-white'
              }`}
              title="Toggle D3.js Risk & SSL Gauges"
            >
              <Activity className="h-3 w-3 text-slate-500" />
              <span className="hidden sm:inline">D3 Gauges</span>
            </button>
          )}

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all active:scale-95 ${
              autoScroll
                ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                : 'border-black/30 bg-black/15 text-slate-500 hover:text-white'
            }`}
            title={autoScroll ? "Auto-scroll On" : "Auto-scroll Off"}
            aria-label="Toggle Auto-scroll"
          >
            <ArrowDown className="h-3 w-3" />
            <span className="hidden sm:inline">Scroll</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1 rounded-lg border border-black/30 bg-black/15 px-2 py-1 text-[11px] font-medium text-slate-500 hover:border-black/60 hover:bg-black/30 hover:text-white disabled:opacity-40 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Copy output"
            aria-label="Copy terminal output"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-slate-500" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-black/30 bg-black/15 p-1 text-slate-500 hover:border-black/60 hover:bg-black/30 hover:text-white transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title={expanded ? "Collapse console" : "Expand console"}
            aria-label={expanded ? "Collapse console" : "Expand console"}
          >
            {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Embedded D3.js Gauges for Compliance & Risk */}
      {isComplianceEngine && showGauges && (
        <div className="border-b border-black/25 p-3 bg-slate-900">
          <RiskSslGaugeChart rawOutput={output} compact />
        </div>
      )}

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`p-4 font-mono text-xs overflow-y-auto bg-slate-900 selection:bg-black/50 ${
          expanded ? 'max-h-[620px]' : maxHeight
        }`}
      >
        {loading && !output ? (
          <div className="space-y-2.5 py-4">
            <div className="text-slate-500 flex items-center gap-2 font-medium">
              <span aria-hidden="true" className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              <span>{statusText || 'Initializing diagnostic container and dispatching telemetry trace...'}</span>
            </div>
            <div className="text-black text-[11px] animate-pulse">
              Tracing socket connections, DOM depth, and headers...
            </div>
          </div>
        ) : displayedOutput ? (
          formatTerminalText(displayedOutput)
        ) : (
          <div className="flex items-center gap-2 text-black italic py-2">
            <Terminal className="h-3.5 w-3.5 text-black" />
            <span>Awaiting target URL initialization...</span>
          </div>
        )}
      </div>
    </div>
  );
};
