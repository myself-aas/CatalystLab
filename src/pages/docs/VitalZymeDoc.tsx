import React from 'react';
import { Activity, CheckCircle2, Zap, Server, Code } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const VitalZymeDoc: React.FC = () => {
 return (
 <DocsLayout
 title="4. VitalZyme (SDLC Phase 4) — Website DOM Health & Payload"
 description="Deep recursive DOM tree inspection, wire payload size analysis, render-blocking scripts, and NGINX compression configuration."
 canonicalPath="/docs/vitalzyme"
 >
 <section id="vitalzyme-overview"className="space-y-4">
 <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-0.5 text-xs font-semibold text-primary">
 <Activity className="h-3.5 w-3.5"/>
 <span>SDLC Phase 4: DOM & Performance Engine</span>
 </div>
 <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
 VitalZyme: DOM Health & Core Web Vitals Engine
 </h1>
 <p className="text-base text-muted-foreground leading-relaxed">
 VitalZyme parses the complete HTML Abstract Syntax Tree (AST) using non-evaluating streaming parsers to quantify maximum tree depth, total element count, image dimension layout stability, synchronous render-blocking scripts, and wire transfer compression ratios.
 </p>
 </section>

 {/* DOM Traversal */}
 <section id="dom-traversal"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-foreground">DOM Tree Recursion Algorithm</h2>
 <p className="text-sm text-muted-foreground leading-relaxed">
 Calculates precise nesting depth and total node counts without browser memory leaks:
 </p>

 <CodeSnippet
 title="Recursive Tree Depth Traversal (engine/vitalzyme.ts)"
 language="typescript"
 code={`import * as cheerio from 'cheerio';

export function analyzeDomTree(html: string) {
 const $ = cheerio.load(html);
 let maxDepth = 0;
 let totalElements = 0;

 function traverse(node: unknown, currentDepth: number) {
 if (!node || node.type !== 'tag') return;
 totalElements++;
 if (currentDepth > maxDepth) maxDepth = currentDepth;

 if (node.children && node.children.length > 0) {
 for (const child of node.children) {
 traverse(child, currentDepth + 1);
 }
 }
 }

 $('html').each((_, root) => traverse(root, 1));

 const renderBlockingScripts = $('head script:not([async]):not([defer]):not([type="module"])').length;
 const missingAltImages = $('img:not([alt])').length;

 return {
 maxDepth,
 totalElements,
 renderBlockingScripts,
 missingAltImages,
 isExcessiveDepth: maxDepth > 32,
 isBloatedDom: totalElements > 1500
 };
}`}
 />
 </section>

 {/* Metrics Thresholds */}
 <section id="metrics-thresholds"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-foreground">DOM & Performance Evaluation Thresholds</h2>
 <div className="ds-card p-4">
 <table className="w-full text-left text-sm">
 <thead className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
 <tr>
 <th className="py-2.5">Metric</th>
 <th className="py-2.5">Good (Pass)</th>
 <th className="py-2.5">Needs Improvement</th>
 <th className="py-2.5">Critical (Fail)</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.06] text-foreground">
 <tr>
 <td className="py-2.5 font-semibold">DOM Tree Depth</td>
 <td className="py-2.5 font-mono text-emerald-700 font-bold">&le; 24 levels</td>
 <td className="py-2.5 font-mono text-amber-700">25 – 32 levels</td>
 <td className="py-2.5 font-mono text-rose-700 font-bold">&gt; 32 levels</td>
 </tr>
 <tr>
 <td className="py-2.5 font-semibold">Total DOM Nodes</td>
 <td className="py-2.5 font-mono text-emerald-700 font-bold">&lt; 800 nodes</td>
 <td className="py-2.5 font-mono text-amber-700">800 – 1,400 nodes</td>
 <td className="py-2.5 font-mono text-rose-700 font-bold">&gt; 1,500 nodes</td>
 </tr>
 <tr>
 <td className="py-2.5 font-semibold">Render-Blocking Head Scripts</td>
 <td className="py-2.5 font-mono text-emerald-700 font-bold">0 scripts</td>
 <td className="py-2.5 font-mono text-amber-700">1 – 2 scripts</td>
 <td className="py-2.5 font-mono text-rose-700 font-bold">&ge; 3 scripts</td>
 </tr>
 <tr>
 <td className="py-2.5 font-semibold">HTML Wire Size (Compressed)</td>
 <td className="py-2.5 font-mono text-emerald-700 font-bold">&lt; 50 KB</td>
 <td className="py-2.5 font-mono text-amber-700">50 – 120 KB</td>
 <td className="py-2.5 font-mono text-rose-700 font-bold">&gt; 150 KB</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* NGINX Recipe */}
 <section id="nginx-optimization"className="space-y-4 border-t border-border pt-8">
 <h2 className="text-2xl font-bold text-foreground">Production NGINX Compression Configuration</h2>
 <p className="text-sm text-muted-foreground leading-relaxed">
 Enable Gzip and Brotli compression to shrink HTML payloads by up to 82%:
 </p>

 <CodeSnippet
 title="/etc/nginx/conf.d/compression.conf"
 language="nginx"
 code={`# Enable Gzip and Brotli Compression
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
 text/plain
 text/css
 text/xml
 text/javascript
 application/json
 application/javascript
 application/xml+rss
 image/svg+xml;

# Brotli compression (when ngx_brotli is enabled)
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript image/svg+xml;`}
 />
 </section>
 </DocsLayout>
 );
};
export default VitalZymeDoc;
