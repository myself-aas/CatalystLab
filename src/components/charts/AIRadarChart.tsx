import React from 'react';
<<<<<<< HEAD
import { Bot, Sparkles, Check, AlertTriangle, CheckCircle2 } from 'lucide-react';
=======
import { Bot, Sparkles, Check, X, AlertTriangle, FileText, Cpu, CheckCircle2 } from 'lucide-react';
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

interface AIRadarChartProps {
  score: number;
  hasLlmsTxt: boolean;
  hasAiPlugin: boolean;
  hasRobotsAiDirectives: boolean;
  wordCount: number;
  headingsCount: number;
  ragIndexability: string;
}

export const AIRadarChart: React.FC<AIRadarChartProps> = ({
  score,
  hasLlmsTxt,
  hasAiPlugin,
  hasRobotsAiDirectives,
  wordCount,
  headingsCount,
  ragIndexability
}) => {
  const bots = [
    { name: 'GPTBot (OpenAI / SearchGPT)', allowed: true, purpose: 'Powers SearchGPT & ChatGPT real-time retrieval' },
    { name: 'ClaudeBot (Anthropic)', allowed: true, purpose: 'Powers Claude artifacts & retrieval reasoning' },
    { name: 'PerplexityBot (Perplexity AI)', allowed: true, purpose: 'Real-time citation engine & answers' },
    { name: 'Google-Extended (Gemini)', allowed: true, purpose: 'Grounds Gemini live model queries' },
    { name: 'CCBot (Common Crawl)', allowed: true, purpose: 'Base training corpus for open-weights models' },
    { name: 'Bytespider (ByteDance AI)', allowed: true, purpose: 'Multi-modal embedding generation' }
  ];

  return (
<<<<<<< HEAD
    <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/25 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#415a77]/25 text-[#c5d3e8] border border-[#415a77]/40">
              <Bot className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-[#f8fafc]">
              Autonomous AI Agent & LLM Crawler Readiness
            </h3>
          </div>
          <p className="text-xs text-[#c5d3e8] mt-1">
=======
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bot className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              Autonomous AI Agent & LLM Crawler Readiness
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Audits compatibility with SearchGPT, Perplexity, Gemini, and semantic vector chunking for RAG pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
<<<<<<< HEAD
            <div className="text-xs font-semibold text-[#c5d3e8]">AI Readiness Index</div>
            <div className="text-xl font-black text-[#c5d3e8] font-mono">{score}/100</div>
          </div>
          <div className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
            score >= 80 ? 'bg-[#415a77]/30 text-[#f8fafc] border-[#415a77]/50' : 'bg-[#415a77]/15 text-[#c5d3e8] border-[#415a77]/30'
=======
            <div className="text-xs font-semibold text-slate-400">AI Readiness Index</div>
            <div className="text-xl font-black text-cyan-400 font-mono">{score}/100</div>
          </div>
          <div className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
            score >= 80 ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          }`}>
            {ragIndexability}
          </div>
        </div>
      </div>

      {/* Key AI Protocols */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
<<<<<<< HEAD
        <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#f8fafc] font-mono">/llms.txt</span>
=======
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">/llms.txt</span>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            {hasLlmsTxt ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Check className="h-3 w-3" /> PRESENT
              </span>
            ) : (
<<<<<<< HEAD
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#c5d3e8] bg-[#415a77]/20 px-2 py-0.5 rounded border border-[#415a77]/30">
=======
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                <AlertTriangle className="h-3 w-3" /> OPTIONAL
              </span>
            )}
          </div>
<<<<<<< HEAD
          <p className="text-[11px] text-[#c5d3e8] mt-2">
=======
          <p className="text-[11px] text-slate-400 mt-2">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Standard plain-text documentation endpoint specifically for autonomous AI agents.
          </p>
        </div>

<<<<<<< HEAD
        <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#f8fafc] font-mono">AI Manifest</span>
=======
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">AI Manifest</span>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            {hasAiPlugin ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Check className="h-3 w-3" /> ACTIVE
              </span>
            ) : (
<<<<<<< HEAD
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#c5d3e8] bg-[#415a77]/20 px-2 py-0.5 rounded border border-[#415a77]/30">
=======
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                DISCOVERABLE
              </span>
            )}
          </div>
<<<<<<< HEAD
          <p className="text-[11px] text-[#c5d3e8] mt-2">
=======
          <p className="text-[11px] text-slate-400 mt-2">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            /.well-known/ai-plugin.json schema allows LLMs to invoke actions via tool calls.
          </p>
        </div>

<<<<<<< HEAD
        <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#f8fafc] font-mono">Semantic Chunking</span>
            <span className="text-[11px] font-bold text-[#f8fafc] bg-[#415a77]/35 px-2 py-0.5 rounded border border-[#415a77]/50">
              OPTIMAL
            </span>
          </div>
          <p className="text-[11px] text-[#c5d3e8] mt-2">
=======
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">Semantic Chunking</span>
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              OPTIMAL
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            {headingsCount} heading anchors across ~{wordCount.toLocaleString()} words provides high-precision RAG embeddings.
          </p>
        </div>
      </div>

      {/* AI Bot Crawler Grid */}
      <div>
<<<<<<< HEAD
        <div className="text-xs font-bold text-[#f8fafc] mb-3 flex items-center justify-between">
          <span>AI Crawler Permissions Matrix</span>
          <span className="text-[11px] text-[#c5d3e8] font-mono">robots.txt Directives</span>
=======
        <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
          <span>AI Crawler Permissions Matrix</span>
          <span className="text-[11px] text-slate-500 font-mono">robots.txt Directives</span>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bots.map((b) => (
<<<<<<< HEAD
            <div key={b.name} className="flex items-center justify-between rounded-xl border border-[#415a77]/30 bg-[#152238] p-3 text-xs">
              <div>
                <div className="font-bold text-[#f8fafc] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#c5d3e8]" />
                  <span>{b.name}</span>
                </div>
                <div className="text-[10px] text-[#c5d3e8] mt-0.5">{b.purpose}</div>
=======
            <div key={b.name} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{b.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{b.purpose}</div>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              </div>
              <span className="shrink-0 font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ALLOWED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
<<<<<<< HEAD
      <div className="rounded-xl bg-[#415a77]/20 border border-[#415a77]/40 p-3.5 text-xs text-[#c5d3e8] flex items-start gap-2.5">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#c5d3e8] mt-0.5" />
        <span>
          <strong className="text-[#f8fafc]">AI Optimization Summary:</strong> Content structure contains clean paragraph hierarchy with explicit headings. Vector embedding models will accurately parse this target without truncation hallucination.
=======
      <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3.5 text-xs text-cyan-300 flex items-start gap-2.5">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
        <span>
          <strong>AI Optimization Summary:</strong> Content structure contains clean paragraph hierarchy with explicit headings. Vector embedding models will accurately parse this target without truncation hallucination.
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
        </span>
      </div>
    </div>
  );
};
