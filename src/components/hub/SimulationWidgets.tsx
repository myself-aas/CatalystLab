import React from 'react';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, Cpu, GitBranch, Terminal, Globe, Search, Leaf } from 'lucide-react';

export const PerfWidget = () => (
  <div className="flex flex-col gap-4 w-full h-full relative p-4">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-mono text-muted-foreground uppercase">Core Web Vitals</span>
      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">PASSING</span>
    </div>
    <div className="grid grid-cols-3 gap-2 flex-1 mt-2">
      {[
        { label: 'LCP', val: '1.06s', color: 'bg-[#00F298]' },
        { label: 'INP', val: '42ms', color: 'bg-[#00F298]' },
        { label: 'CLS', val: '0.00', color: 'bg-[#00F298]' }
      ].map(m => (
        <div key={m.label} className="bg-white/5 rounded-lg flex flex-col items-center justify-center gap-1 border border-white/5 relative overflow-hidden">
          <div className={`absolute bottom-0 left-0 right-0 h-1 opacity-50 ${m.color}`} />
          <span className="text-white font-mono text-sm">{m.val}</span>
          <span className="text-muted-foreground text-[10px] font-mono">{m.label}</span>
        </div>
      ))}
    </div>
    <div className="h-10 mt-auto bg-black rounded-lg border border-border flex items-center px-3 overflow-hidden relative">
      <motion.div 
        className="absolute inset-y-0 left-0 bg-[#00F298]/20" 
        animate={{ width: ['0%', '100%'] }} 
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <span className="text-[10px] font-mono text-emerald-400 relative z-10">DOM Tree Depth: 14 nodes</span>
    </div>
  </div>
);

export const LatencyWidget = () => (
  <div className="flex flex-col gap-3 w-full h-full relative p-4">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-mono text-muted-foreground uppercase">Edge PoP Matrix</span>
      <span className="text-[10px] bg-[#00D2FF]/10 text-[#00D2FF] px-2 py-0.5 rounded-full border border-[#00D2FF]/20">ACTIVE</span>
    </div>
    <div className="flex-1 flex flex-col gap-2 mt-2">
      {[
        { reg: 'IAD (US-East)', lat: '12ms' },
        { reg: 'LHR (London)', lat: '24ms' },
        { reg: 'NRT (Tokyo)', lat: '45ms' }
      ].map(r => (
        <div key={r.reg} className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">{r.reg}</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
               <motion.div className="h-full bg-[#00D2FF]" initial={{width: 0}} animate={{width: '60%'}} transition={{duration: 1}} />
            </div>
            <span className="text-white w-8 text-right">{r.lat}</span>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-auto flex items-center justify-center gap-2 text-[10px] font-mono text-[#00D2FF] border border-[#00D2FF]/20 bg-[#00D2FF]/5 py-1.5 rounded-md">
      <Activity className="size-3" /> HTTP/3 QUIC Negotiated
    </div>
  </div>
);

export const EcoWidget = () => (
  <div className="flex flex-col items-center justify-center gap-4 w-full h-full p-4 relative">
    <div className="absolute top-4 left-4 right-4 flex justify-between">
       <span className="text-[11px] font-mono text-muted-foreground uppercase">Carbon Budget</span>
    </div>
    <div className="relative size-24 mt-4">
      <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-white/10"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <motion.path
          className="text-emerald-400"
          strokeDasharray="100, 100"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 15 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold text-white">0.12g</span>
        <span className="text-[9px] font-mono text-muted-foreground">CO2e</span>
      </div>
    </div>
    <div className="text-[10px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 rounded-full mt-2">
      Cleaner than 85% of pages
    </div>
  </div>
);

export const SecurityWidget = () => (
  <div className="flex flex-col w-full h-full p-0 font-mono text-xs overflow-hidden relative border border-white/5 rounded-lg bg-black">
    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-border text-muted-foreground">
      <ShieldCheck className="size-3" /> OWASP Sniffer
    </div>
    <div className="p-3 flex flex-col gap-1.5 text-[#00D2FF]">
      <div><span className="text-muted-foreground">&gt;</span> Checking Strict-Transport-Security... <span className="text-emerald-400">OK</span></div>
      <div><span className="text-muted-foreground">&gt;</span> Checking X-Frame-Options... <span className="text-emerald-400">DENY</span></div>
      <div><span className="text-muted-foreground">&gt;</span> Checking Content-Security-Policy...</div>
      <div className="pl-4 text-[#FF9900]">WARN: 'unsafe-inline' detected</div>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: [0, 1, 0] }} 
        transition={{ repeat: Infinity, duration: 1 }}
        className="mt-2 w-2 h-3 bg-white"
      />
    </div>
  </div>
);

export const AiWidget = () => (
  <div className="flex flex-col w-full h-full p-4 relative font-mono text-xs">
    <div className="flex items-center justify-between mb-4">
      <span className="text-muted-foreground uppercase text-[11px]">/llms.txt Parser</span>
      <Cpu className="size-3 text-[#8A2BE2]" />
    </div>
    <div className="bg-black border border-border rounded p-3 flex-1 overflow-hidden relative">
      <pre className="text-[#8A2BE2] leading-relaxed">
{`{
  "crawler": "GPTBot",
  "status": "allowed",
  "rag_density": 0.94,
  "schema": "TechArticle"
}`}
      </pre>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
    </div>
  </div>
);

export const MigrationWidget = () => (
  <div className="flex flex-col w-full h-full relative p-0 overflow-hidden rounded-lg border border-white/5 bg-background">
    <div className="flex gap-4 px-4 py-2 text-[10px] font-mono border-b border-border bg-white/5">
       <span className="text-white border-b-2 border-white pb-1">Payload</span>
       <span className="text-muted-foreground">AST Diff</span>
    </div>
    <div className="p-4 flex-1 text-xs font-mono text-muted-foreground flex flex-col gap-1">
      <div><span className="text-red-400">- import React from 'react';</span></div>
      <div><span className="text-emerald-400">+ import {'{'} useState {'}'} from 'react';</span></div>
      <div className="mt-2 text-[#0066FF] opacity-50">Computing structural patch...</div>
    </div>
  </div>
);

export const RepoWidget = () => (
  <div className="flex flex-col w-full h-full p-4 relative">
    <div className="flex items-center gap-2 mb-4 text-muted-foreground font-mono text-[11px] uppercase">
      <GitBranch className="size-3" /> Commit Tree
    </div>
    <div className="flex flex-col gap-3 relative pl-4 border-l border-border ml-2">
      <div className="relative">
        <div className="absolute -left-[21px] top-1 size-2 rounded-full bg-emerald-400 ring-2 ring-black" />
        <p className="text-xs text-white">CI/CD Pipeline Passing</p>
        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">7a9f8b2 • 2m ago</p>
      </div>
      <div className="relative opacity-50">
        <div className="absolute -left-[21px] top-1 size-2 rounded-full bg-[#0066FF] ring-2 ring-black" />
        <p className="text-xs text-white">Dependency Audit</p>
        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">b43a1c9 • 1h ago</p>
      </div>
    </div>
  </div>
);

export const LlmoWidget = () => (
  <div className="flex flex-col items-center justify-center gap-4 w-full h-full p-4 relative">
     <div className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground font-mono text-[11px] uppercase">
      <Search className="size-3" /> Discoverability
    </div>
    <div className="text-4xl font-semibold text-white tracking-tight mt-6">
      98<span className="text-lg text-muted-foreground">/100</span>
    </div>
    <div className="text-[10px] font-mono text-purple-400 border border-purple-500/20 bg-purple-500/5 px-3 py-1 rounded-full">
      Highly optimized for RAG
    </div>
  </div>
);
