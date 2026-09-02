import React from 'react';
import { SearchCode, CheckCircle2, Sparkles, FileText, Globe } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const AllosterSearchDoc: React.FC = () => {
  const toc = [
    { id: 'allostersearch-overview', title: 'Phase 8: AllosterSearch Overview' },
    { id: 'rag-density', title: 'RAG Extractability & Factual Density' },
    { id: 'semantic-hierarchy', title: 'Semantic Heading Hierarchy' },
    { id: 'eeat-authority', title: 'E-E-A-T Author Authority Signals' },
  ];

  return (
    <DocsLayout
      title="8. AllosterSearch (SDLC Phase 8) — AI Search Optimization (LLMO)"
      description="Large Language Model Optimization (LLMO), factual information density, RAG chunk extraction, and author authority signals."
      canonicalPath="/docs/allostersearch"
      toc={toc}
    >
      <section id="allostersearch-overview" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-indigo-800">
          <SearchCode className="h-3.5 w-3.5" />
          <span>SDLC Phase 8: AI Search & LLMO Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b192c] tracking-tight">
          AllosterSearch: AI Search Optimization (LLMO) Engine
        </h1>
        <p className="text-base text-[#415a77] leading-relaxed">
          AllosterSearch evaluates how effectively generative search engines (Perplexity AI, OpenAI SearchGPT, Google Gemini Overviews) can cite and summarize your web content during automated question-answering and RAG workflows.
        </p>
      </section>

      {/* RAG Density */}
      <section id="rag-density" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">RAG Extractability & Factual Density</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          The engine computes text-to-HTML ratios, structured lists, definition tables, and answer-first paragraph structuring:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-[#e2e8f0] bg-background p-4 space-y-1.5">
            <strong className="text-emerald-700 font-bold block">✓ High LLM Extractability</strong>
            <p className="text-[#64748b] text-xs leading-relaxed">
              Direct answer paragraphs under H2 headings, markdown tables, explicit code snippets with typed parameters, and schema entity tags.
            </p>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-background p-4 space-y-1.5">
            <strong className="text-rose-700 font-bold block">✗ Low LLM Extractability</strong>
            <p className="text-[#64748b] text-xs leading-relaxed">
              Vague marketing fluff ("we supercharge synergies"), dynamic JavaScript-only content hydration, missing headings, and generic buzzwords.
            </p>
          </div>
        </div>
      </section>

      {/* Semantic Hierarchy */}
      <section id="semantic-hierarchy" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Semantic Heading Hierarchy Guidelines</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Large language models chunk web pages using heading tags (<code>H1 &rarr; H2 &rarr; H3</code>). Skipped heading levels (such as jumping from H1 directly to H4) disrupt semantic chunk boundaries in vector embeddings.
        </p>
      </section>

      {/* E-E-A-T Authority */}
      <section id="eeat-authority" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">E-E-A-T Author & Citation Verification</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Verifies whether articles include explicit author credentials, verifiable organization URLs, publication timestamps, and reference citations.
        </p>
      </section>
    </DocsLayout>
  );
};
export default AllosterSearchDoc;
