import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, Pause, Trash2, Copy, Check, Filter, ArrowDown } from 'lucide-react';

export interface TerminalLogEntry {
  id: string;
  engineId?: string;
  message: string;
  level: 'info' | 'success' | 'warn' | 'error';
  timestamp: string;
}

interface LiveTerminalStreamProps {
  logs: TerminalLogEntry[];
  isStreaming?: boolean;
  onClearLogs?: () => void;
  title?: string;
}

export const LiveTerminalStream: React.FC<LiveTerminalStreamProps> = ({
  logs,
  isStreaming = false,
  onClearLogs,
  title = 'Live Telemetry SSE Execution Stream',
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'error' | 'warn' | 'success'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter(l => {
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    if (filterQuery && !l.message.toLowerCase().includes(filterQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-[#090D16] shadow-2xl overflow-hidden flex flex-col font-mono">
      {/* Terminal Bar Chrome */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#111726]/90 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#10B981]/80 inline-block" />
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#06B6D4]" />
            <span className="text-xs font-semibold text-slate-200">{title}</span>
          </div>
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
              LIVE SSE
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[10px]">
            {(['all', 'error', 'warn', 'success'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2 py-0.5 rounded capitalize transition-colors ${
                  levelFilter === lvl
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Auto-Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border transition-colors ${
              autoScroll
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
            title={autoScroll ? 'Pause Auto-Scroll' : 'Resume Auto-Scroll'}
          >
            {autoScroll ? <Pause className="w-3 h-3 text-[#06B6D4]" /> : <Play className="w-3 h-3" />}
            <span className="text-[10px] hidden sm:inline">{autoScroll ? 'Auto-Scroll ON' : 'Paused'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Copy Terminal Output"
          >
            {copied ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
            <span className="text-[10px] hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Clear Logs */}
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="p-1 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-[#EF4444] transition-colors"
              title="Clear Terminal Output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter search line */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-black/40 border-b border-slate-800/60 text-xs">
        <Filter className="w-3 h-3 text-slate-500" />
        <input
          type="text"
          value={filterQuery}
          onChange={e => setFilterQuery(e.target.value)}
          placeholder="Filter logs by engine, status, or keyword..."
          className="bg-transparent border-none text-slate-200 text-[11px] placeholder:text-slate-600 focus:outline-none w-full"
        />
        {filterQuery && (
          <button
            onClick={() => setFilterQuery('')}
            className="text-[10px] text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Terminal Viewport */}
      <div
        ref={scrollRef}
        className="p-4 overflow-y-auto max-h-[380px] min-h-[220px] space-y-1.5 text-xs select-text scrollbar-thin scrollbar-thumb-slate-800"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600 space-y-2">
            <Terminal className="w-8 h-8 opacity-40" />
            <p className="text-[11px]">No active execution logs to display.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 leading-relaxed hover:bg-slate-900/40 px-1 py-0.5 rounded transition-colors group"
            >
              <span className="text-slate-600 text-[10px] select-none flex-shrink-0 pt-0.5">
                {log.timestamp}
              </span>
              {log.engineId && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-[#06B6D4] border border-slate-700/50 flex-shrink-0">
                  {log.engineId}
                </span>
              )}
              <span
                className={`break-all ${
                  log.level === 'error'
                    ? 'text-[#EF4444] font-semibold'
                    : log.level === 'warn'
                    ? 'text-[#F59E0B]'
                    : log.level === 'success'
                    ? 'text-[#10B981]'
                    : 'text-slate-300'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Terminal Status Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#111726]/60 border-t border-slate-800 text-[10px] text-slate-500">
        <div className="flex items-center gap-3">
          <span>{filteredLogs.length} events streamed</span>
          <span>•</span>
          <span className="text-emerald-400">Standard Web ReadableStream 200 OK</span>
        </div>
        {!autoScroll && (
          <button
            onClick={() => setAutoScroll(true)}
            className="flex items-center gap-1 text-[#06B6D4] hover:underline"
          >
            <span>Jump to live</span>
            <ArrowDown className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
