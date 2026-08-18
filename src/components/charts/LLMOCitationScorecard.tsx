import React from 'react';
<<<<<<< HEAD
import { Search, Sparkles, Code, Bookmark, Share2 } from 'lucide-react';
=======
import { Search, Sparkles, Check, AlertTriangle, Code, Bookmark, Share2 } from 'lucide-react';
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

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
<<<<<<< HEAD
    <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-6 shadow-xl space-y-6 text-[#f8fafc]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/25 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#415a77]/25 text-[#c5d3e8] border border-[#415a77]/40">
              <Search className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-[#f8fafc]">
              LLMO (LLM Search Optimization) & Semantic Citation Scorecard
            </h3>
          </div>
          <p className="text-xs text-[#c5d3e8] mt-1">
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Measures structured schema discoverability, entity graphing, and citation prominence for Perplexity, SearchGPT, and Google AI Overviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
<<<<<<< HEAD
            <div className="text-xs font-semibold text-[#c5d3e8]">LLMO Index</div>
            <div className="text-xl font-black text-[#c5d3e8] font-mono">{score}/100</div>
          </div>
          <div className="rounded-xl px-3 py-1.5 text-xs font-bold border border-[#415a77]/40 bg-[#415a77]/25 text-[#c5d3e8]">
=======
            <div className="text-xs font-semibold text-slate-400">LLMO Index</div>
            <div className="text-xl font-black text-purple-400 font-mono">{score}/100</div>
          </div>
          <div className="rounded-xl px-3 py-1.5 text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-400">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            {citationConfidence}
          </div>
        </div>
      </div>

      {/* Structured Schema Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
<<<<<<< HEAD
        <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-[#c5d3e8]" />
              <span className="text-xs font-bold text-[#f8fafc]">JSON-LD Structured Markup</span>
            </div>
            {jsonLdBlocksCount > 0 ? (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                {jsonLdBlocksCount} BLOCKS FOUND
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold text-[#c5d3e8]/70 bg-[#415a77]/20 px-2 py-0.5 rounded border border-[#415a77]/30">
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                MISSING
              </span>
            )}
          </div>
<<<<<<< HEAD
          <p className="text-[11px] text-[#c5d3e8] mt-2">
=======
          <p className="text-[11px] text-slate-400 mt-2">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Schema.org structured entities allow search engines and AI agents to reliably extract organization, article, and author facts.
          </p>
        </div>

<<<<<<< HEAD
        <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#c5d3e8]" />
              <span className="text-xs font-bold text-[#f8fafc]">OpenGraph & Social Entity Graph</span>
            </div>
            {hasOgTags ? (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                PASS
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                INCOMPLETE
              </span>
            )}
          </div>
<<<<<<< HEAD
          <p className="text-[11px] text-[#c5d3e8] mt-2">
=======
          <p className="text-[11px] text-slate-400 mt-2">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Rich preview cards (og:title, og:description, og:image) for multi-modal embedding models.
          </p>
        </div>

<<<<<<< HEAD
        <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-[#c5d3e8]" />
              <span className="text-xs font-bold text-[#f8fafc]">Canonical URL Authority</span>
            </div>
            {hasCanonical ? (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                VERIFIED
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold text-[#c5d3e8]/70 bg-[#415a77]/20 px-2 py-0.5 rounded border border-[#415a77]/30">
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                MISSING
              </span>
            )}
          </div>
<<<<<<< HEAD
          <p className="text-[11px] text-[#c5d3e8] mt-2">
=======
          <p className="text-[11px] text-slate-400 mt-2">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Prevents duplicate content confusion across edge CDNs and regional proxy mirrors.
          </p>
        </div>

<<<<<<< HEAD
        <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#c5d3e8]" />
              <span className="text-xs font-bold text-[#f8fafc]">AI Search Citation Probability</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#c5d3e8] bg-[#415a77]/25 px-2 py-0.5 rounded border border-[#415a77]/40">
              {score >= 80 ? '94% (High)' : '72% (Medium)'}
            </span>
          </div>
          <p className="text-[11px] text-[#c5d3e8] mt-2">
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Likelihood of being referenced as a primary citation source in Perplexity and SearchGPT responses.
          </p>
        </div>
      </div>
    </div>
  );
};
