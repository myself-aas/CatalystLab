import React from 'react';
import { Link } from 'react-router-dom';
import { Info, ArrowRight } from 'lucide-react';
import { DocsLayout } from '../../components/docs/DocsLayout';
import { ENGINES_MAP } from '../../data/engines';

const PRINCIPLES = [
  {
    title: 'Sub-second determinism',
    body: 'Every audit returns within 800 ms to 2.5 s with no cold boot, so it can sit inside a CI gate.',
  },
  {
    title: 'Zero-trust targeting',
    body: 'SSRF mitigation, memory caps, and process timeouts protect the platform from a hostile target.',
  },
  {
    title: 'One output schema',
    body: 'All eight engines emit the same JSON shape: a 0–100 score, pass/fail status, and remediation notes.',
  },
  {
    title: 'Durable permalinks',
    body: 'A saved audit gets a permanent URL (/reports/<domain>), so a reading can be shared or cited.',
  },
];

export const SystemOverviewDoc: React.FC = () => {
 return (
 <DocsLayout
 title="System Overview & Philosophy"
 description="How CatalystLab measures a domain without executing its scripts: streaming TLS probes, AST parsing, and eight engines writing one telemetry schema."
 canonicalPath="/docs"
 >
 <section id="overview-philosophy" className="space-y-4">
 <h1 className="text-4xl font-display font-medium text-foreground sm:text-5xl">
 System overview
 </h1>
 <p className="text-base leading-relaxed text-foreground-muted">
 CatalystLab measures a site the way a lab measures a sample: eight engines each
 run one assay against a domain and write the reading into a single telemetry
 schema. The engines cover Core Web Vitals, edge latency, transport security and
 OWASP headers, repository hygiene, carbon, platform migration, AI crawlability,
 and AI search visibility.
 </p>
 </section>

 <section id="zero-eval-model" className="space-y-3">
 <h2 className="text-2xl font-display font-medium text-foreground">
 Nothing on your site is executed
 </h2>
 <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-5">
 <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true" />
 <div className="space-y-2 text-sm leading-relaxed text-foreground">
 <p>
 CatalystLab does not load the target page in a headless browser. A headless
 cluster executes unvetted client-side JavaScript, which brings crypto-mining
 and memory-exhaustion risk into the scanning infrastructure and makes a
 reading depend on which browser version ran it.
 </p>
 <p>
 Instead the engines use non-evaluating streaming HTTP and TLS socket timing
 probes, AST HTML parsing, and DNS anycast measurements. The same URL therefore
 produces the same reading, and the platform never holds a page&apos;s payload.
 </p>
 </div>
 </div>
 </section>

 <section className="space-y-4 ds-section">
 <h2 className="text-2xl font-display font-medium text-foreground">Four principles</h2>
 <dl className="grid grid-cols-1 gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
 {PRINCIPLES.map((principle) => (
 <div key={principle.title} className="space-y-1 border-t border-border pt-3">
 <dt className="font-semibold text-foreground">{principle.title}</dt>
 <dd className="leading-relaxed text-foreground-muted">{principle.body}</dd>
 </div>
 ))}
 </dl>
 </section>

 <section id="engines-summary" className="space-y-4">
 <h2 className="text-2xl font-display font-medium text-foreground">The eight engines</h2>
 <p className="text-sm text-foreground-muted">
 Each engine maps to a stage of the software lifecycle and answers a different
 question about the same domain.
 </p>

 <div className="ds-card overflow-x-auto p-4">
 <table className="w-full text-left text-sm">
 <thead className="border-b border-border font-semibold text-foreground-muted">
 <tr>
 <th scope="col" className="py-2.5">Engine</th>
 <th scope="col" className="py-2.5">What it measures</th>
 <th scope="col" className="py-2.5 text-right">Docs</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border text-foreground">
 {Object.values(ENGINES_MAP).map((engine) => (
 <tr key={engine.id}>
 <th scope="row" className="py-2.5 pr-4 text-left font-semibold text-foreground">
 {engine.catalystName || engine.name}
 </th>
 <td className="py-2.5 pr-4 text-foreground-muted">
 {engine.lifecycleFocus || engine.description}
 </td>
 <td className="py-2.5 text-right">
 <Link
 to={engine.route}
 className="text-sm font-medium text-info hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
 >
 Read docs
 </Link>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 <section id="next-steps" className="space-y-3">
 <h2 className="text-2xl font-display font-medium text-foreground">Where to go next</h2>
 <ul className="space-y-2 text-sm">
 {[
 { to: '/docs/architecture', label: 'Architecture', note: 'ingress, workers, and storage' },
 { to: '/docs/api', label: 'REST API', note: 'parameters and response schema' },
 { to: '/docs/cicd', label: 'CI/CD gates', note: 'fail a build on a regression' },
 { to: '/docs/scoring-matrix', label: 'Scoring matrix', note: 'how the composite score is weighted' },
 ].map((item) => (
 <li key={item.to}>
 <Link to={item.to} className="group inline-flex items-center gap-2 text-info hover:underline">
 <span className="font-medium">{item.label}</span>
 <span className="text-foreground-muted">— {item.note}</span>
 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
 </Link>
 </li>
 ))}
 </ul>
 </section>
 </DocsLayout>
 );
};
export default SystemOverviewDoc;
