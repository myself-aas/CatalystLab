import React from 'react';
import { Gauge, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const ScoringMatrixDoc: React.FC = () => {
 return (
 <DocsLayout
 title="Scoring Formula & Weights Calculus"
 description="Mathematical calculation of the 0–100 Master Quality Score composite index and evaluation vector weights."
 canonicalPath="/docs/scoring-matrix"
 >
 <section id="scoring-formula"className="space-y-4">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 py-0.5 text-xs font-semibold text-amber-800">
 <Gauge className="h-3.5 w-3.5"/>
 <span>Objective Telemetry Index</span>
 </div>
 <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
 Mathematical Scoring Calculus & Weights
 </h1>
 <p className="text-base text-muted-foreground leading-relaxed">
 The Master Quality Score is an objective, deterministic 0–100 composite index calculated through weighted sub-engine scores and penalty deductions across 6 primary vectors.
 </p>

 {/* Master Formula Box */}
 <div className="ds-card p-5 font-mono text-sm space-y-2">
 <div className="text-primary font-bold">// Master Composite Score Formula:</div>
 <div className="bg-background p-3.5 rounded-lg border border-border text-sm font-semibold text-foreground leading-relaxed">
 Score = (0.20 &times; Health) + (0.20 &times; Latency) + (0.15 &times; AI_Ready) + (0.15 &times; Security) + (0.15 &times; Accessibility) + (0.15 &times; Eco) - Penalties
 </div>
 </div>
 </section>

 {/* Vector Weight Breakdown */}
 <section id="weight-breakdown"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-foreground">Evaluation Vector Weights</h2>
 <div className="ds-card p-4">
 <table className="w-full text-left text-sm">
 <thead className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
 <tr>
 <th className="py-2.5">Evaluation Vector</th>
 <th className="py-2.5">Optimal Target</th>
 <th className="py-2.5">Weight</th>
 <th className="py-2.5">Direct Impact</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.06] text-foreground">
 <tr>
 <td className="py-2.5 font-semibold">DOM Health & Depth</td>
 <td className="py-2.5 text-muted-foreground">&le; 32 levels, &lt; 800 nodes</td>
 <td className="py-2.5 font-mono font-bold">20%</td>
 <td className="py-2.5 text-emerald-700 font-medium">Core Web Vitals INP/CLS</td>
 </tr>
 <tr>
 <td className="py-2.5 font-semibold">Global TTFB Latency</td>
 <td className="py-2.5 text-muted-foreground">&lt; 350 ms across 12 PoPs</td>
 <td className="py-2.5 font-mono font-bold">20%</td>
 <td className="py-2.5 text-emerald-700 font-medium">Server Latency & LCP</td>
 </tr>
 <tr>
 <td className="py-2.5 font-semibold">AI Search Readiness</td>
 <td className="py-2.5 text-muted-foreground">llms.txt + JSON-LD Schemas</td>
 <td className="py-2.5 font-mono font-bold">15%</td>
 <td className="py-2.5 text-primary font-medium">Perplexity/GPT Citation</td>
 </tr>
 <tr>
 <td className="py-2.5 font-semibold">OWASP SecOps & SSL</td>
 <td className="py-2.5 text-muted-foreground">HSTS, CSP, X-Frame, TLS 1.3</td>
 <td className="py-2.5 font-mono font-bold">15%</td>
 <td className="py-2.5 text-rose-700 font-medium">Zero-Trust Security</td>
 </tr>
 <tr>
 <td className="py-2.5 font-semibold">WCAG 2.2 Accessibility</td>
 <td className="py-2.5 text-muted-foreground">AA Contrast & ARIA Labels</td>
 <td className="py-2.5 font-mono font-bold">15%</td>
 <td className="py-2.5 text-amber-700 font-medium">Legal Compliance</td>
 </tr>
 <tr>
 <td className="py-2.5 font-semibold">Eco Carbon Emissions</td>
 <td className="py-2.5 text-muted-foreground">&lt; 0.25g CO2 / Page Load</td>
 <td className="py-2.5 font-mono font-bold">15%</td>
 <td className="py-2.5 text-emerald-700 font-medium">ESG Sustainability</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* Penalties & Deductions */}
 <section id="penalties-deductions"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-foreground">Penalty Deduction Table</h2>
 <p className="text-sm text-muted-foreground leading-relaxed">
 Critical architectural errors trigger instant score deductions regardless of individual vector scores:
 </p>

 <div className="ds-card p-4">
 <table className="w-full text-left text-sm">
 <thead className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
 <tr>
 <th className="py-2">Critical Violation</th>
 <th className="py-2">Penalty Deduction</th>
 <th className="py-2">Remediation Urgency</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.06] text-foreground">
 <tr>
 <td className="py-2 font-semibold text-rose-700">Missing SSL / Insecure HTTP</td>
 <td className="py-2 font-mono font-bold text-rose-700">-25 pts</td>
 <td className="py-2 font-bold text-rose-700">Immediate Blocker</td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-amber-700">Robots.txt Blocking All AI Crawlers</td>
 <td className="py-2 font-mono font-bold text-amber-700">-15 pts</td>
 <td className="py-2 text-amber-700">High Risk (Search De-indexing)</td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-amber-700">Uncompressed Wire Payload &gt; 300KB</td>
 <td className="py-2 font-mono font-bold text-amber-700">-10 pts</td>
 <td className="py-2 text-muted-foreground">Medium (Bandwidth waste)</td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-amber-700">Synchronous Render-Blocking Head Scripts</td>
 <td className="py-2 font-mono font-bold text-amber-700">-10 pts</td>
 <td className="py-2 text-muted-foreground">Medium (LCP degradation)</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* Grade Classification Tiers */}
 <section id="grade-tiers"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-foreground">Grade Classification Tiers</h2>
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
 <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
 <div className="text-2xl font-black text-emerald-700">90 – 100</div>
 <div className="font-bold text-foreground mt-1">Grade A (Pristine)</div>
 <p className="text-xs text-muted-foreground mt-1">Production Ready & Elite</p>
 </div>

 <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 text-center">
 <div className="text-2xl font-black text-primary">75 – 89</div>
 <div className="font-bold text-foreground mt-1">Grade B (Good)</div>
 <p className="text-xs text-muted-foreground mt-1">Minor Optimizations</p>
 </div>

 <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-center">
 <div className="text-2xl font-black text-amber-700">60 – 74</div>
 <div className="font-bold text-foreground mt-1">Grade C (Moderate)</div>
 <p className="text-xs text-muted-foreground mt-1">Latency or DOM Bottlenecks</p>
 </div>

 <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-center">
 <div className="text-2xl font-black text-rose-700">&lt; 60</div>
 <div className="font-bold text-foreground mt-1">Grade F (Deficient)</div>
 <p className="text-xs text-muted-foreground mt-1">Critical Security & INP Issues</p>
 </div>
 </div>
 </section>
 </DocsLayout>
 );
};
export default ScoringMatrixDoc;
