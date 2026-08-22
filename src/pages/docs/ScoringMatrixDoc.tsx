import React from 'react';
import { Gauge, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const ScoringMatrixDoc: React.FC = () => {
  const toc = [
    { id: 'scoring-formula', title: 'Master Scoring Formula' },
    { id: 'weight-breakdown', title: 'Vector Weight Breakdown' },
    { id: 'penalties-deductions', title: 'Deterministic Penalty System' },
    { id: 'grade-tiers', title: 'Grade Classification Tiers' },
  ];

  return (
    <DocsLayout
      title="Scoring Formula & Weights Calculus"
      description="Mathematical calculation of the 0–100 Master Quality Score composite index and evaluation vector weights."
      canonicalPath="/docs/scoring-matrix"
      toc={toc}
    >
      <section id="scoring-formula" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-800">
          <Gauge className="h-3.5 w-3.5" />
          <span>Objective Telemetry Index</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b192c] tracking-tight">
          Mathematical Scoring Calculus & Weights
        </h1>
        <p className="text-base text-[#415a77] leading-relaxed">
          The Master Quality Score is an objective, deterministic 0–100 composite index calculated through weighted sub-engine scores and penalty deductions across 6 primary vectors.
        </p>

        {/* Master Formula Box */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 font-mono text-sm text-[#0b192c] space-y-2 mt-4">
          <div className="text-sky-700 font-bold">// Master Composite Score Formula:</div>
          <div className="bg-[#f8fafc] p-3.5 rounded-lg border border-[#e2e8f0] text-sm font-semibold text-[#0b192c] leading-relaxed">
            Score = (0.20 &times; Health) + (0.20 &times; Latency) + (0.15 &times; AI_Ready) + (0.15 &times; Security) + (0.15 &times; Accessibility) + (0.15 &times; Eco) - Penalties
          </div>
        </div>
      </section>

      {/* Vector Weight Breakdown */}
      <section id="weight-breakdown" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Evaluation Vector Weights</h2>
        <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Evaluation Vector</th>
                <th className="py-2.5 px-3">Optimal Target</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Direct Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
              <tr>
                <td className="py-2.5 px-3 font-semibold">DOM Health & Depth</td>
                <td className="py-2.5 px-3 text-[#415a77]">&le; 32 levels, &lt; 800 nodes</td>
                <td className="py-2.5 px-3 font-mono font-bold">20%</td>
                <td className="py-2.5 px-3 text-emerald-700 font-medium">Core Web Vitals INP/CLS</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Global TTFB Latency</td>
                <td className="py-2.5 px-3 text-[#415a77]">&lt; 350 ms across 12 PoPs</td>
                <td className="py-2.5 px-3 font-mono font-bold">20%</td>
                <td className="py-2.5 px-3 text-emerald-700 font-medium">Server Latency & LCP</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">AI Search Readiness</td>
                <td className="py-2.5 px-3 text-[#415a77]">llms.txt + JSON-LD Schemas</td>
                <td className="py-2.5 px-3 font-mono font-bold">15%</td>
                <td className="py-2.5 px-3 text-sky-700 font-medium">Perplexity/GPT Citation</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">OWASP SecOps & SSL</td>
                <td className="py-2.5 px-3 text-[#415a77]">HSTS, CSP, X-Frame, TLS 1.3</td>
                <td className="py-2.5 px-3 font-mono font-bold">15%</td>
                <td className="py-2.5 px-3 text-rose-700 font-medium">Zero-Trust Security</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">WCAG 2.2 Accessibility</td>
                <td className="py-2.5 px-3 text-[#415a77]">AA Contrast & ARIA Labels</td>
                <td className="py-2.5 px-3 font-mono font-bold">15%</td>
                <td className="py-2.5 px-3 text-amber-700 font-medium">Legal Compliance</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Eco Carbon Emissions</td>
                <td className="py-2.5 px-3 text-[#415a77]">&lt; 0.25g CO2 / Page Load</td>
                <td className="py-2.5 px-3 font-mono font-bold">15%</td>
                <td className="py-2.5 px-3 text-emerald-700 font-medium">ESG Sustainability</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Penalties & Deductions */}
      <section id="penalties-deductions" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Penalty Deduction Table</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Critical architectural errors trigger instant score deductions regardless of individual vector scores:
        </p>

        <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
              <tr>
                <th className="py-2 px-3">Critical Violation</th>
                <th className="py-2 px-3">Penalty Deduction</th>
                <th className="py-2 px-3">Remediation Urgency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
              <tr>
                <td className="py-2 px-3 font-semibold text-rose-700">Missing SSL / Insecure HTTP</td>
                <td className="py-2 px-3 font-mono font-bold text-rose-700">-25 pts</td>
                <td className="py-2 px-3 font-bold text-rose-700">Immediate Blocker</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-700">Robots.txt Blocking All AI Crawlers</td>
                <td className="py-2 px-3 font-mono font-bold text-amber-700">-15 pts</td>
                <td className="py-2 px-3 text-amber-700">High Risk (Search De-indexing)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-700">Uncompressed Wire Payload &gt; 300KB</td>
                <td className="py-2 px-3 font-mono font-bold text-amber-700">-10 pts</td>
                <td className="py-2 px-3 text-[#64748b]">Medium (Bandwidth waste)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-700">Synchronous Render-Blocking Head Scripts</td>
                <td className="py-2 px-3 font-mono font-bold text-amber-700">-10 pts</td>
                <td className="py-2 px-3 text-[#64748b]">Medium (LCP degradation)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Grade Classification Tiers */}
      <section id="grade-tiers" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Grade Classification Tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
            <div className="text-2xl font-black text-emerald-700">90 – 100</div>
            <div className="font-bold text-[#0b192c] mt-1">Grade A (Pristine)</div>
            <p className="text-xs text-[#64748b] mt-1">Production Ready & Elite</p>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 text-center">
            <div className="text-2xl font-black text-sky-700">75 – 89</div>
            <div className="font-bold text-[#0b192c] mt-1">Grade B (Good)</div>
            <p className="text-xs text-[#64748b] mt-1">Minor Optimizations</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-center">
            <div className="text-2xl font-black text-amber-700">60 – 74</div>
            <div className="font-bold text-[#0b192c] mt-1">Grade C (Moderate)</div>
            <p className="text-xs text-[#64748b] mt-1">Latency or DOM Bottlenecks</p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-center">
            <div className="text-2xl font-black text-rose-700">&lt; 60</div>
            <div className="font-bold text-[#0b192c] mt-1">Grade F (Deficient)</div>
            <p className="text-xs text-[#64748b] mt-1">Critical Security & INP Issues</p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
};
export default ScoringMatrixDoc;
