import React, { useState } from 'react';
import { Copy, Check, Terminal, Maximize2, Minimize2 } from 'lucide-react';

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
  icon = '⚡',
  output,
  loading = false,
  statusText,
  maxHeight = 'max-h-72',
  onCopy
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTerminalText = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let colorClass = 'text-slate-300';

      if (line.includes('[+] PASS:') || line.includes('🟢 STATUS:') || line.includes('STATUS: EXCELLENT')) {
        colorClass = 'text-emerald-400 font-medium';
      } else if (line.includes('[-] FAIL:') || line.includes('[!] CRITICAL:') || line.includes('[!] HIGH RISK:') || line.includes('🔴 STATUS:') || line.includes('STATUS: AT RISK')) {
        colorClass = 'text-rose-400 font-bold';
      } else if (line.includes('[~] WARNING:') || line.includes('🟡 STATUS:') || line.includes('STATUS: FAIR')) {
        colorClass = 'text-amber-400 font-medium';
      } else if (line.startsWith('[sys]') || line.startsWith('[*]')) {
        colorClass = 'text-cyan-400';
      } else if (line.startsWith('===') || line.startsWith('---')) {
        colorClass = 'text-slate-500 font-bold';
      }

      return (
        <div key={idx} className={`${colorClass} leading-relaxed break-words`}>
          {line || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1.5">
            <span>{icon}</span>
            <span>{title}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <span className="flex items-center gap-1.5 text-xs text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="hidden sm:inline">Executing...</span>
            </span>
          )}

          <button
            onClick={handleCopy}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Copy output"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        className={`p-4 font-mono text-xs overflow-y-auto bg-slate-950/95 selection:bg-cyan-500/20 ${
          expanded ? 'max-h-[600px]' : maxHeight
        }`}
      >
        {loading && !output ? (
          <div className="space-y-2 py-4">
            <div className="text-cyan-400 flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              <span>{statusText || 'Initializing diagnostic container and dispatching telemetry trace...'}</span>
            </div>
            <div className="text-slate-600 animate-pulse">Tracing socket connections, DOM depth, and headers...</div>
          </div>
        ) : output ? (
          formatTerminalText(output)
        ) : (
          <div className="text-slate-600 italic">Awaiting target initialization...</div>
        )}
      </div>
    </div>
  );
};
