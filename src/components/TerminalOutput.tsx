import React, { useState } from 'react';
import { Copy, Check, Maximize2, Minimize2, Terminal, CircleDot } from 'lucide-react';

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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
          <span>Executing</span>
        </span>
      );
    }
    if (!output) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-2 py-0.5 text-[10px] font-semibold text-[#c5d3e8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#415a77]" />
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
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
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
        colorClass = 'text-emerald-400 font-medium';
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
        <div key={idx} className={`${colorClass} leading-relaxed break-words hover:bg-[#152238]/30 px-1 rounded transition-colors`}>
          {line || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-[#415a77]/30 bg-[#0b192c] shadow-xl overflow-hidden hover:border-[#415a77]/60 transition-all duration-300 group">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-[#415a77]/25 bg-[#091524] px-4 py-3 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 shadow-sm" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80 shadow-sm" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-[#93c5fd]">{icon}</span>
            <span className="text-xs font-bold text-[#f8fafc] tracking-tight">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}

          <div className="h-3.5 w-px bg-[#415a77]/30 mx-0.5" />

          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1 rounded-lg border border-[#415a77]/30 bg-[#152238]/70 px-2 py-1 text-[11px] font-medium text-[#c5d3e8] hover:border-[#415a77]/60 hover:bg-[#1e2f4a] hover:text-[#f8fafc] disabled:opacity-40 transition-all active:scale-95"
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
                <Copy className="h-3 w-3 text-[#c5d3e8]" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-[#415a77]/30 bg-[#152238]/70 p-1 text-[#c5d3e8] hover:border-[#415a77]/60 hover:bg-[#1e2f4a] hover:text-[#f8fafc] transition-all active:scale-95"
            title={expanded ? "Collapse console" : "Expand console"}
            aria-label={expanded ? "Collapse console" : "Expand console"}
          >
            {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        className={`p-4 font-mono text-xs overflow-y-auto bg-[#050d18] selection:bg-[#415a77]/50 ${
          expanded ? 'max-h-[620px]' : maxHeight
        }`}
      >
        {loading && !output ? (
          <div className="space-y-2.5 py-4">
            <div className="text-[#93c5fd] flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              <span>{statusText || 'Initializing diagnostic container and dispatching telemetry trace...'}</span>
            </div>
            <div className="text-[#415a77] text-[11px] animate-pulse">
              Tracing socket connections, DOM depth, and headers...
            </div>
          </div>
        ) : output ? (
          formatTerminalText(output)
        ) : (
          <div className="flex items-center gap-2 text-[#415a77] italic py-2">
            <Terminal className="h-3.5 w-3.5 text-[#415a77]" />
            <span>Awaiting target URL initialization...</span>
          </div>
        )}
      </div>
    </div>
  );
};
