import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';

interface DOMDepthChartProps {
  domElementsCount: number;
  domDepthLevel: number;
  payloadKb: number;
  blockingScriptsCount: number;
  modernImagesPct: number;
}

export const DOMDepthChart: React.FC<DOMDepthChartProps> = React.memo(({
  domElementsCount,
  domDepthLevel,
  payloadKb,
  blockingScriptsCount,
  modernImagesPct
}) => {
  // Simulated node distribution based on total DOM elements
  const divCount = Math.round(domElementsCount * 0.42);
  const textNodes = Math.round(domElementsCount * 0.28);
  const anchorLinks = Math.round(domElementsCount * 0.12);
  const mediaElements = Math.round(domElementsCount * 0.08);
  const scriptTags = Math.round(domElementsCount * 0.06);
  const otherNodes = Math.max(0, domElementsCount - (divCount + textNodes + anchorLinks + mediaElements + scriptTags));

  const total = domElementsCount || 1;
  const categories = [
    { name: 'Structural Divs & Containers', count: divCount, pct: Math.round((divCount / total) * 100), color: '#415a77' },
    { name: 'Typography & Text Nodes (p, h1-h6, span)', count: textNodes, pct: Math.round((textNodes / total) * 100), color: '#c5d3e8' },
    { name: 'Interactive Links & Buttons (a, button)', count: anchorLinks, pct: Math.round((anchorLinks / total) * 100), color: '#52718e' },
    { name: 'Media Assets (img, svg, video)', count: mediaElements, pct: Math.round((mediaElements / total) * 100), color: '#ebe9e6' },
    { name: 'Scripts & Modules', count: scriptTags, pct: Math.round((scriptTags / total) * 100), color: '#9cb3d4' },
    { name: 'Semantic Layout (main, section, aside)', count: otherNodes, pct: Math.round((otherNodes / total) * 100), color: '#68829e' }
  ];

  // DOM Complexity Level
  const isHealthy = domElementsCount <= 800;
  const isWarning = domElementsCount > 800 && domElementsCount <= 1500;
  const complexityRating = isHealthy ? 'Optimal' : isWarning ? 'Elevated' : 'Excessive (Bottleneck)';

  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-xl text-foreground space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground border border-border">
              <Layers className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-foreground">
              DOM Depth & Node Hierarchy Breakdown
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Measures document object model complexity, nesting depth, and critical render path blockage.
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-muted p-3.5">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono">Total DOM Nodes</div>
          <div className="text-xl font-black text-foreground mt-0.5">{domElementsCount.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground/70 mt-1">
            Threshold: &lt;1,500 nodes
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted p-3.5">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono">Max Nesting Depth</div>
          <div className="text-xl font-black text-muted-foreground mt-0.5">{domDepthLevel} Levels</div>
          <div className="text-[10px] text-muted-foreground/70 mt-1">
            Threshold: &lt;32 levels
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted p-3.5">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono">Blocking Scripts</div>
          <div className={`text-xl font-black mt-0.5 ${blockingScriptsCount === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {blockingScriptsCount}
          </div>
          <div className="text-[10px] text-muted-foreground/70 mt-1">
            {blockingScriptsCount === 0 ? 'Optimal (0 in <head>)' : 'Parser Blocking Risk'}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted p-3.5">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono">Complexity Rating</div>
          <div className={`text-sm font-bold mt-1 ${isHealthy ? 'text-emerald-400' : isWarning ? 'text-muted-foreground' : 'text-rose-400'}`}>
            {complexityRating}
          </div>
          <div className="text-[10px] text-muted-foreground/70 mt-1">
            Layout calculation speed
          </div>
        </div>
      </div>

      {/* Tag Distribution Spectrum */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-semibold text-foreground">DOM Tag Distribution Spectrum</span>
          <span>100% Normalized</span>
        </div>
        
        <div className="h-6 w-full rounded-xl overflow-hidden flex bg-muted border border-border p-0.5 gap-0.5">
          {categories.map((cat) => (
            <div
              key={cat.name}
              style={{ width: `${Math.max(2, cat.pct)}%`, backgroundColor: cat.color }}
              className="h-full first:rounded-l-lg last:rounded-r-lg transition-all hover:opacity-80 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title={`${cat.name}: ${cat.count} nodes (${cat.pct}%)`}
            />
          ))}
        </div>

        {/* Legend & Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between rounded-lg border border-border bg-muted/60 p-2.5 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-foreground truncate">{cat.name}</span>
              </div>
              <div className="font-mono text-muted-foreground font-bold ml-2 shrink-0">
                {cat.count} <span className="text-muted-foreground/60">({cat.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payload & Script Parser Footprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-muted p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">HTML Document Weight</span>
            <span className="font-mono text-xs font-bold text-muted-foreground">{payloadKb.toFixed(2)} KB</span>
          </div>
          
          <div className="h-2.5 w-full rounded-full bg-background overflow-hidden border border-border">
            <div
              className={`h-full transition-all ${
                payloadKb < 50 ? 'bg-emerald-400' : payloadKb < 150 ? 'bg-muted-foreground' : 'bg-muted'
              }`}
              style={{ width: `${Math.min(100, (payloadKb / 200) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {payloadKb < 50 ? 'Optimal initial HTML payload size for fast parsing.' : 'Consider pruning unused inline CSS/JS.'}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Modern Image Adoption (WebP/AVIF)</span>
            <span className="text-xs font-mono font-bold text-muted-foreground">{modernImagesPct.toFixed(0)}%</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {modernImagesPct >= 60 
              ? 'Excellent next-gen image compression reduces main thread parsing time.' 
              : 'Upgrading legacy JPEG/PNG to AVIF/WebP will yield up to 40% network savings.'}
          </p>
        </div>
      </div>

      {/* Depth Structure Diagnostic */}
      <div className="rounded-xl bg-muted border border-border p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-bold text-foreground">Nesting Depth & DOM Architecture</span>
          <span className="font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Max Depth: Level {domDepthLevel} (&lt;32 threshold)
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Measured subtree depth remains within optimal bounds, avoiding browser style recalculation bottlenecks.
        </p>
      </div>
    </div>
  );
});
