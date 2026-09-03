import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Terminal,
  Activity,
  ArrowDown,
  Pause,
  Play,
  Search,
  RotateCw,
  SlidersHorizontal,
  ShieldCheck,
  Cpu,
  Globe2,
  Sparkles,
  Layers,
  Leaf
} from 'lucide-react';
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
  maxHeight = 'max-h-80',
  onCopy
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showGauges, setShowGauges] = useState(true);
  const [displayedOutput, setDisplayedOutput] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeLevelFilter, setActiveLevelFilter] = useState<'ALL' | 'PASS' | 'WARN' | 'FAIL' | 'EXEC' | 'INFO'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Typewriter streaming effect
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
          return output.slice(0, Math.max(4, Math.floor(output.length / 30)));
        }
        return output.slice(0, prev.length + Math.max(4, Math.floor(output.length / 30)));
      });
    }, 12);
    return () => clearInterval(interval);
  }, [output]);

  // Auto-scroll logic respecting pause-on-hover
  useEffect(() => {
    if (autoScroll && !isHovered && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedOutput, autoScroll, isHovered]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 35;
    if (isAtBottom !== autoScroll && !isHovered) {
      setAutoScroll(isAtBottom);
    }
  };

  const isComplianceEngine =
    engine === 'compliance' ||
    engine === 'devsecops_compliance' ||
    title.toLowerCase().includes('compliance');

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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Executing</span>
        </span>
      );
    }
    if (!output) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-muted0" />
          <span>Standby</span>
        </span>
      );
    }
    if (output.includes('[-] FAIL:') || output.includes('[!] CRITICAL:') || output.includes('STATUS: CRITICAL') || output.includes('[ERROR]')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          <span>Needs Action</span>
        </span>
      );
    }
    if (output.includes('[~] WARNING:') || output.includes('STATUS: MODERATE') || output.includes('[WARN]')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span>Warning</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span>Optimal</span>
      </span>
    );
  };

  const getHeaderIcon = () => {
    switch (icon) {
      case 'terminal':
      case 'code':
        return <Terminal className="h-4 w-4 text-cyan-400" />;
      case 'security':
      case 'shield':
        return <ShieldCheck className="h-4 w-4 text-amber-400" />;
      case 'speed':
      case 'activity':
        return <Activity className="h-4 w-4 text-emerald-400" />;
      case 'globe':
        return <Globe2 className="h-4 w-4 text-blue-400" />;
      case 'sparkles':
      case 'psychology':
        return <Sparkles className="h-4 w-4 text-cyan-300" />;
      case 'eco':
      case 'leaf':
        return <Leaf className="h-4 w-4 text-lime-400" />;
      case 'cpu':
        return <Cpu className="h-4 w-4 text-rose-400" />;
      default:
        return <Terminal className="h-4 w-4 text-cyan-400" />;
    }
  };

  const parsedLines = useMemo(() => {
    if (!displayedOutput) return [];
    return displayedOutput.split('\n');
  }, [displayedOutput]);

  const filteredLines = useMemo(() => {
    return parsedLines.filter(line => {
      if (filterQuery && !line.toLowerCase().includes(filterQuery.toLowerCase())) {
        return false;
      }
      if (activeLevelFilter === 'ALL') return true;
      if (activeLevelFilter === 'PASS') {
        return (
          line.includes('[+] PASS:') ||
          line.includes('[PASS]') ||
          line.includes('STATUS: OPTIMAL') ||
          line.includes('STATUS: COMPLIANT') ||
          line.includes('STATUS: PRODUCTION-READY') ||
          line.includes('STATUS: EXCELLENT')
        );
      }
      if (activeLevelFilter === 'FAIL') {
        return (
          line.includes('[-] FAIL:') ||
          line.includes('[FAIL]') ||
          line.includes('[!] CRITICAL:') ||
          line.includes('[ERROR]') ||
          line.includes('STATUS: CRITICAL') ||
          line.includes('STATUS: AT RISK') ||
          line.includes('STATUS: HIGH LIABILITY')
        );
      }
      if (activeLevelFilter === 'WARN') {
        return (
          line.includes('[~] WARNING:') ||
          line.includes('[WARN]') ||
          line.includes('STATUS: MODERATE') ||
          line.includes('STATUS: FAIR') ||
          line.includes('STATUS: PARTIAL')
        );
      }
      if (activeLevelFilter === 'EXEC') {
        return (
          line.includes('[EXEC]') ||
          line.includes('[EXECUTING]') ||
          line.includes('[ENGINE_START]') ||
          line.includes('[DISPATCH]') ||
          line.includes('[INIT]')
        );
      }
      if (activeLevelFilter === 'INFO') {
        return (
          line.includes('[INFO]') ||
          line.startsWith('[sys]') ||
          line.startsWith('[*]') ||
          line.includes('[LOG]')
        );
      }
      return true;
    });
  }, [parsedLines, filterQuery, activeLevelFilter]);

  const renderLine = (line: string, idx: number) => {
    let colorClass = 'text-muted-foreground';
    let badge = null;

    if (
      line.includes('[+] PASS:') ||
      line.includes('[PASS]') ||
      line.includes('STATUS: OPTIMAL') ||
      line.includes('STATUS: EXCELLENT') ||
      line.includes('STATUS: FULLY COMPATIBLE') ||
      line.includes('STATUS: PRODUCTION-READY') ||
      line.includes('STATUS: COMPLIANT')
    ) {
      colorClass = 'text-emerald-400 font-medium';
      badge = (
        <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono font-bold mr-2 select-none">
          PASS
        </span>
      );
    } else if (
      line.includes('[-] FAIL:') ||
      line.includes('[FAIL]') ||
      line.includes('[!] CRITICAL:') ||
      line.includes('[!] HIGH RISK:') ||
      line.includes('[ERROR]') ||
      line.includes('STATUS: CRITICAL') ||
      line.includes('STATUS: INVISIBLE') ||
      line.includes('STATUS: HIGH LIABILITY') ||
      line.includes('STATUS: AT RISK')
    ) {
      colorClass = 'text-rose-400 font-bold';
      badge = (
        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 border border-rose-500/40 text-[10px] text-rose-400 font-mono font-bold mr-2 select-none">
          FAIL
        </span>
      );
    } else if (
      line.includes('[~] WARNING:') ||
      line.includes('[WARN]') ||
      line.includes('STATUS: MODERATE') ||
      line.includes('STATUS: PARTIAL') ||
      line.includes('STATUS: WARNING') ||
      line.includes('STATUS: FAIR')
    ) {
      colorClass = 'text-amber-300 font-medium';
      badge = (
        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-300 font-mono font-bold mr-2 select-none">
          WARN
        </span>
      );
    } else if (
      line.includes('[EXEC]') ||
      line.includes('[EXECUTING]') ||
      line.includes('[ENGINE_START]') ||
      line.includes('[ENGINE_DISPATCH]') ||
      line.includes('[QUEUE_INIT]') ||
      line.includes('[MASTER_INIT]')
    ) {
      colorClass = 'text-purple-400 font-medium';
      badge = (
        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-500/40 text-[10px] text-purple-300 font-mono font-bold mr-2 select-none">
          EXEC
        </span>
      );
    } else if (line.startsWith('[sys]') || line.startsWith('[*]') || line.includes('[INFO]')) {
      colorClass = 'text-cyan-300 font-medium';
      badge = (
        <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono font-bold mr-2 select-none">
          INFO
        </span>
      );
    } else if (line.startsWith('===') || line.startsWith('---')) {
      colorClass = 'text-muted-foreground font-bold';
    }

    return (
      <div
        key={idx}
        className={`${colorClass} leading-relaxed break-words hover:bg-primary-hover/50 px-1 py-0.5 rounded transition-colors flex items-baseline font-mono text-xs`}
      >
        <span className="text-muted-foreground select-none text-[10px] w-8 shrink-0 text-right pr-2">
          {idx + 1}
        </span>
        {badge}
        <span className="flex-1">{line || '\u00A0'}</span>
      </div>
    );
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      className="flex flex-col rounded-xl border border-border bg-[#090D16] shadow-2xl overflow-hidden transition-all duration-300 group focus-within:ring-1 focus-within:ring-cyan-500/50 relative"
    >
      {/* Terminal Bar Chrome */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/90 bg-[#111726]/95 px-4 py-3 select-none backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 shadow-sm" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80 shadow-sm" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shadow-sm" />
          </div>
          <div className="h-3.5 w-px bg-muted mx-0.5" />
          <div className="flex items-center gap-2">
            {getHeaderIcon()}
            <span className="text-xs font-mono font-bold text-foreground tracking-tight">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {getStatusBadge()}

          <div className="h-3.5 w-px bg-muted mx-0.5 hidden sm:block" />

          {/* D3 Gauges Toggle */}
          {isComplianceEngine && (
            <button
              onClick={() => setShowGauges(!showGauges)}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-mono font-medium transition-all active:scale-95 ${
                showGauges
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                  : 'border-border bg-primary text-muted-foreground hover:text-muted-foreground'
              }`}
              title="Toggle D3.js Risk & SSL Gauges"
            >
              <Activity className="h-3 w-3 text-cyan-400" />
              <span className="hidden sm:inline">D3 Gauges</span>
            </button>
          )}

          {/* Auto-Scroll Toggle with Hover Pause Feedback */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-mono font-medium transition-all active:scale-95 ${
              autoScroll
                ? isHovered
                  ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                  : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                : 'border-border bg-primary text-muted-foreground hover:text-muted-foreground'
            }`}
            title={autoScroll ? 'Auto-scroll is Active (Pause on hover)' : 'Auto-scroll is Paused'}
            aria-label="Toggle Auto-scroll"
          >
            {autoScroll ? (
              isHovered ? (
                <>
                  <Pause className="h-3 w-3 text-amber-400" />
                  <span className="hidden sm:inline text-amber-300">Paused (Hover)</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-3 w-3 text-cyan-400" />
                  <span className="hidden sm:inline">Auto-Scroll</span>
                </>
              )
            ) : (
              <>
                <Play className="h-3 w-3 text-muted-foreground" />
                <span className="hidden sm:inline">Locked</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1 rounded-lg border border-border bg-primary/90 px-2 py-1 text-[11px] font-mono font-medium text-muted-foreground hover:border-border hover:bg-primary-hover hover:text-primary-foreground disabled:opacity-40 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
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
                <Copy className="h-3 w-3 text-muted-foreground" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Expand / Minimize */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-border bg-primary/90 p-1 text-muted-foreground hover:border-border hover:bg-primary-hover hover:text-primary-foreground transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            title={expanded ? 'Collapse console' : 'Expand console'}
            aria-label={expanded ? 'Collapse console' : 'Expand console'}
          >
            {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Embedded D3.js Gauges for Compliance & Risk */}
      {isComplianceEngine && showGauges && (
        <div className="border-b border-border/80 p-3 bg-foreground/60 z-20">
          <RiskSslGaugeChart rawOutput={output} compact />
        </div>
      )}

      {/* Filter and Search Bar for High-Density Cockpit */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 border-b border-border/80 bg-foreground/80 text-xs font-mono z-20">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-3 w-3 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter logs by keyword or status..."
            className="w-full bg-transparent text-[11px] text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Filter terminal logs"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="text-[10px] text-muted-foreground hover:text-muted-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Level Badges */}
        <div className="flex items-center gap-1">
          {(['ALL', 'PASS', 'WARN', 'FAIL', 'EXEC', 'INFO'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevelFilter(level)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                activeLevelFilter === level
                  ? 'bg-muted text-cyan-300 font-bold border border-border'
                  : 'text-muted-foreground hover:text-muted-foreground'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Body with Simulated Scanlines & Pause on Hover */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Simulated CRT Cockpit Scanline Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-25"
        />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-label={title}
          className={`p-4 font-mono text-xs overflow-y-auto bg-[#090D16] selection:bg-cyan-500/30 selection:text-primary-foreground relative z-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent ${
            expanded ? 'max-h-[640px]' : maxHeight
          }`}
        >
          {loading && !output ? (
            <div className="space-y-2.5 py-6">
              <div className="text-cyan-400 flex items-center gap-2 font-medium">
                <RotateCw className="h-4 w-4 animate-spin text-cyan-400" />
                <span>{statusText || 'Initializing diagnostic container and dispatching telemetry trace...'}</span>
              </div>
              <div className="text-muted-foreground text-[11px] animate-pulse pl-6">
                Tracing socket connections, DOM depth, and headers...
              </div>
            </div>
          ) : filteredLines.length > 0 ? (
            <div className="space-y-0.5">
              {filteredLines.map((line, idx) => renderLine(line, idx))}
            </div>
          ) : displayedOutput ? (
            <div className="text-muted-foreground text-xs py-4 text-center">
              No log events match filter "{filterQuery}"
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground italic py-4">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Awaiting target URL initialization...</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#111726]/80 border-t border-border/80 text-[10px] font-mono text-muted-foreground z-20 select-none">
        <div className="flex items-center gap-2">
          <span>{filteredLines.length} lines</span>
          {filterQuery && <span className="text-cyan-400">(filtered)</span>}
          <span>•</span>
          <span className="text-emerald-400">Stream Live</span>
        </div>

        <div className="flex items-center gap-2">
          {isHovered && autoScroll && (
            <span className="text-amber-400 font-medium">Hover active: auto-scroll held</span>
          )}
          {!autoScroll && (
            <button
              onClick={() => setAutoScroll(true)}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Resume scroll</span>
              <ArrowDown className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
