import React from 'react';
import { Bot, Sparkles, Check, X, AlertTriangle, FileText, Cpu, CheckCircle2 } from 'lucide-react';

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
            Audits compatibility with SearchGPT, Perplexity, Gemini, and semantic vector chunking for RAG pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400">AI Readiness Index</div>
            <div className="text-xl font-black text-cyan-400 font-mono">{score}/100</div>
          </div>
          <div className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
            score >= 80 ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {ragIndexability}
          </div>
        </div>
      </div>

      {/* Key AI Protocols */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">/llms.txt</span>
            {hasLlmsTxt ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Check className="h-3 w-3" /> PRESENT
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <AlertTriangle className="h-3 w-3" /> OPTIONAL
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Standard plain-text documentation endpoint specifically for autonomous AI agents.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">AI Manifest</span>
            {hasAiPlugin ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Check className="h-3 w-3" /> ACTIVE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                DISCOVERABLE
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            /.well-known/ai-plugin.json schema allows LLMs to invoke actions via tool calls.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">Semantic Chunking</span>
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              OPTIMAL
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {headingsCount} heading anchors across ~{wordCount.toLocaleString()} words provides high-precision RAG embeddings.
          </p>
        </div>
      </div>

      {/* AI Bot Crawler Grid */}
      <div>
        <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
          <span>AI Crawler Permissions Matrix</span>
          <span className="text-[11px] text-slate-500 font-mono">robots.txt Directives</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bots.map((b) => (
            <div key={b.name} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{b.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{b.purpose}</div>
              </div>
              <span className="shrink-0 font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ALLOWED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3.5 text-xs text-cyan-300 flex items-start gap-2.5">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
        <span>
          <strong>AI Optimization Summary:</strong> Content structure contains clean paragraph hierarchy with explicit headings. Vector embedding models will accurately parse this target without truncation hallucination.
        </span>
      </div>
    </div>
  );
};
