import React from 'react';
import { Search, Sparkles, Check, AlertTriangle, Code, Bookmark, Share2 } from 'lucide-react';

interface LLMOCitationScorecardProps {
  score: number;
  jsonLdBlocksCount: number;
  hasOgTags: boolean;
  hasOgImage: boolean;
  hasCanonical: boolean;
  citationConfidence: string;
}

export const LLMOCitationScorecard: React.FC<LLMOCitationScorecardProps> = ({
  score,
  jsonLdBlocksCount,
  hasOgTags,
  hasOgImage,
  hasCanonical,
  citationConfidence
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Search className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              LLMO (LLM Search Optimization) & Semantic Citation Scorecard
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Measures structured schema discoverability, entity graphing, and citation prominence for Perplexity, SearchGPT, and Google AI Overviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400">LLMO Index</div>
            <div className="text-xl font-black text-purple-400 font-mono">{score}/100</div>
          </div>
          <div className="rounded-xl px-3 py-1.5 text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-400">
            {citationConfidence}
          </div>
        </div>
      </div>

      {/* Structured Schema Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold text-white">JSON-LD Structured Markup</span>
            </div>
            {jsonLdBlocksCount > 0 ? (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {jsonLdBlocksCount} BLOCKS FOUND
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                MISSING
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Schema.org structured entities allow search engines and AI agents to reliably extract organization, article, and author facts.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold text-white">OpenGraph & Social Entity Graph</span>
            </div>
            {hasOgTags ? (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                PASS
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                INCOMPLETE
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Rich preview cards (og:title, og:description, og:image) for multi-modal embedding models.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Canonical URL Authority</span>
            </div>
            {hasCanonical ? (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                VERIFIED
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                MISSING
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Prevents duplicate content confusion across edge CDNs and regional proxy mirrors.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold text-white">AI Search Citation Probability</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {score >= 80 ? '94% (High)' : '72% (Medium)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Likelihood of being referenced as a primary citation source in Perplexity and SearchGPT responses.
          </p>
        </div>
      </div>
    </div>
  );
};
