import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Trash2, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  HelpCircle,
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TerminalLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'json';
  content: string;
  timestamp: string;
}

const COMMAND_RESPONSES: Record<string, string> = {
  'help': `CatalystLab CLI • Unified Synthetic Telemetry Engine v2.4.0

AVAILABLE COMMANDS:
  catalyst audit <domain>           Run full 8-vector synthetic audit
  catalyst run --engine <name>      Run isolated engine probe (vitalzyme|edgevmax|riskprotease|llmkinase|gitlygase|ecoholo|synthshift|allostersearch)
  catalyst test --region <pop>      Probe edge latency across 42 global PoPs (e.g. --region global)
  catalyst diff --git               Execute GitLygase AST repository hygiene scan
  catalyst inspect <engine>         Inspect security headers, CSP nonces, or /llms.txt
  catalyst export --format json     Dump machine-readable telemetry JSON payload
  catalyst cron --schedule          Register automated edge monitoring cron
  clear                             Clear terminal output buffer
  version                           Show installed CLI engine build hash`,

  'version': `@catalystlab/cli v2.4.0 (x86_64-linux-gnu, node-v20.18, commit #e7e0b9d)`,

  'catalyst audit': `{
  "status": "success",
  "target": "catalystlab.tech",
  "score": 97,
  "executionTimeMs": 342,
  "edgePoP": "IAD (US-East)",
  "engines": {
    "vitalzyme": { "lcp": "840ms", "cls": 0.012, "inp": "42ms", "score": 98 },
    "edgevmax": { "meanTtfb": "18.4ms", "popsProbed": 42, "score": 99 },
    "riskprotease": { "csp": "strict-nonce", "hsts": "enforced", "score": 96 },
    "llmkinase": { "llmsTxt": "valid", "markdownQuality": "98.4%", "score": 94 },
    "ecoholo": { "co2PerView": "0.12g", "greenHosting": true, "score": 97 }
  }
}`,

  'catalyst run --engine vitalzyme': `[VitalZyme] Initializing headless Chrome CDP protocol...
[VitalZyme] Navigating with zero client-script eval...
[VitalZyme] Largest Contentful Paint (LCP): 840ms [OPTIMAL]
[VitalZyme] Cumulative Layout Shift (CLS): 0.012 [OPTIMAL]
[VitalZyme] Interaction to Next Paint (INP): 42ms [OPTIMAL]
[VitalZyme] Total Blocking Time (TBT): 65ms [OPTIMAL]
>> Overall Core Web Vitals Score: 98/100 (Passes Google CrUX threshold)`,

  'catalyst run --engine edgevmax': `[EdgeVmax] Spawning TLS 1.3 socket probes to 42 Anycast PoPs...
  ├─ IAD (US-East): 12.4ms (0-RTT Session Resumed)
  ├─ SJC (US-West): 15.2ms
  ├─ FRA (EU-Central): 14.1ms
  ├─ LHR (UK-London): 16.8ms
  ├─ NRT (Tokyo): 18.6ms
  └─ SIN (Singapore): 22.1ms
>> Mean Edge TTFB: 18.4ms | Zero-Packet Drop Verified [99/100]`,

  'catalyst inspect riskprotease': `[RiskProtease] Analyzing HTTP Response Headers...
  ✔ Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m'; object-src 'none'
  ✔ Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  ✔ X-Frame-Options: DENY
  ✔ Cross-Origin-Opener-Policy: same-origin
  ✔ Referrer-Policy: strict-origin-when-cross-origin
>> Security Rating: A+ (Zero-Trust Sandbox Compliant)`,

  'catalyst diff --git': `[GitLygase] Scanning AST tree for licensing and package hygiene...
  ✔ SPDX License Audit: 100% Permissive (MIT / Apache-2.0)
  ✔ CVE Dependency Scan: 0 Critical, 0 High Vulnerabilities
  ✔ Unused Dead Code Exports: 1.8% (Within <5% gate)
  ✔ Lockfile SHA-512 Integrity: Bit-identical verified
>> CI/CD Gate Status: PASSED (Merge Block lifted)`,

  'catalyst export --format json': `{
  "schema": "https://catalystlab.tech/schemas/v2/telemetry.json",
  "generatedAt": "2026-08-25T09:14:02.120Z",
  "auditId": "aud_98f41e0a82b",
  "passGate": true,
  "confidence": 0.998
}`,
};

interface CLISimulatorProps {
  initialCommand?: string;
  className?: string;
  onExecuteCommand?: (cmd: string) => void;
}

export const CLISimulator: React.FC<CLISimulatorProps> = ({ 
  initialCommand, 
  className = '',
  onExecuteCommand
}) => {
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      type: 'output',
      content: `CatalystLab Interactive CLI Terminal Simulator [Version 2.4.0]\nType 'help' for command syntax or click any preset below.`,
      timestamp: '09:14:00',
    },
    {
      id: 'init-2',
      type: 'json',
      content: `$ catalyst test --region global\n${COMMAND_RESPONSES['catalyst run --engine edgevmax']}`,
      timestamp: '09:14:01',
    }
  ]);

  const [inputVal, setInputVal] = useState(initialCommand || '');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    const timeStr = new Date().toLocaleTimeString();
    
    // Add command input to logs
    const newLogs: TerminalLog[] = [
      ...logs,
      {
        id: `input-${Date.now()}`,
        type: 'input',
        content: `$ ${cmd}`,
        timestamp: timeStr,
      }
    ];

    setHistory(prev => [cmd, ...prev]);
    setHistoryIndex(-1);
    setInputVal('');
    setIsExecuting(true);

    if (onExecuteCommand) {
      onExecuteCommand(cmd);
    }

    if (cmd.toLowerCase() === 'clear') {
      setLogs([]);
      setIsExecuting(false);
      return;
    }

    setTimeout(() => {
      let output = '';
      let logType: TerminalLog['type'] = 'output';

      const matchedKey = Object.keys(COMMAND_RESPONSES).find(k => 
        cmd.toLowerCase().startsWith(k.toLowerCase())
      );

      if (matchedKey) {
        output = COMMAND_RESPONSES[matchedKey];
        if (output.startsWith('{')) {
          logType = 'json';
        }
      } else {
        output = `Command not recognized: "${cmd}". Type 'help' for available CLI commands.`;
        logType = 'error';
      }

      setLogs([
        ...newLogs,
        {
          id: `out-${Date.now()}`,
          type: logType,
          content: output,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setIsExecuting(false);
    }, 280);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = Math.min(history.length - 1, historyIndex + 1);
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const copyTerminalOutput = () => {
    const text = logs.map(l => l.content).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col h-full bg-[#060912] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs ${className}`}>
      {/* Terminal Title Bar */}
      <div className="p-3 bg-[#0B101D] border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 border border-rose-600/50" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80 border border-amber-500/50" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 border border-emerald-600/50" />
          </div>
          <span className="text-slate-300 font-bold ml-1 flex items-center gap-1.5">
            <TerminalIcon className="h-3.5 w-3.5 text-[#00F0FF]" />
            CLI Simulator &bull; zsh / catalyst
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyTerminalOutput}
            className="p-1 rounded-md bg-[#0E1526] border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Copy terminal session"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#00FF66]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setLogs([])}
            className="p-1 rounded-md bg-[#0E1526] border border-slate-800 text-slate-400 hover:text-[#FF0055] transition-colors cursor-pointer"
            title="Clear terminal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Command Shortcuts */}
      <div className="px-3 py-2 bg-[#080D1A] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
        <span className="text-slate-500 text-[10px] shrink-0 font-bold">PRESETS:</span>
        {[
          'catalyst run --engine vitalzyme',
          'catalyst run --engine edgevmax',
          'catalyst inspect riskprotease',
          'catalyst diff --git',
          'catalyst audit',
        ].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleCommand(preset)}
            className="px-2 py-0.5 rounded bg-[#0B101D] border border-slate-800 text-slate-300 hover:text-[#00F0FF] hover:border-[#06B6D4]/40 transition-colors shrink-0 cursor-pointer"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Terminal Output Stream */}
      <div 
        onClick={() => inputRef.current?.focus()}
        className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[280px] max-h-[500px] select-text cursor-text"
      >
        {logs.map((log) => (
          <div key={log.id} className="leading-relaxed">
            {log.type === 'input' && (
              <div className="flex items-start gap-2 text-[#00F0FF] font-bold">
                <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-cyan-400" />
                <span className="text-white">{log.content.replace(/^\$\s*/, '')}</span>
              </div>
            )}

            {log.type === 'output' && (
              <pre className="text-slate-300 whitespace-pre-wrap font-mono text-[11px] pl-5">
                {log.content}
              </pre>
            )}

            {log.type === 'json' && (
              <div className="pl-5 my-1">
                <pre className="p-2.5 rounded-lg bg-[#080D1A] border border-slate-800/80 text-emerald-400 whitespace-pre-wrap font-mono text-[11px] overflow-x-auto">
                  {log.content}
                </pre>
              </div>
            )}

            {log.type === 'error' && (
              <div className="text-rose-400 pl-5 font-mono text-[11px]">
                {log.content}
              </div>
            )}
          </div>
        ))}

        {isExecuting && (
          <div className="flex items-center gap-2 text-slate-400 pl-5 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00F0FF]" />
            <span>Executing probe via daemon...</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Command Input Prompt */}
      <div className="p-3 bg-[#080D1A] border-t border-slate-800 flex items-center gap-2">
        <span aria-hidden="true" className="text-[#00F0FF] font-bold select-none">&gt;_</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type 'help' or command (e.g. catalyst audit)..."
          className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs placeholder:text-slate-600"
          aria-label="Interactive CLI command prompt"
        />
        <button
          type="button"
          onClick={() => handleCommand(inputVal)}
          disabled={!inputVal.trim()}
          aria-label="Execute command"
          className="p-1.5 rounded-lg bg-[#06B6D4] text-slate-950 hover:bg-[#00F0FF] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Run command (Enter)"
        >
          <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
