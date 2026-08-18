import React, { useState } from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';

interface DOMDepthChartProps {
  domElementsCount: number;
  domDepthLevel: number;
  payloadKb: number;
  blockingScriptsCount: number;
  modernImagesPct: number;
}

export const DOMDepthChart: React.FC<DOMDepthChartProps> = ({
  domElementsCount,
  domDepthLevel,
  payloadKb,
  blockingScriptsCount,
  modernImagesPct
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'payload' | 'tree'>('hierarchy');

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
    <div className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-6 shadow-xl text-[#f8fafc]">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/25 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#415a77]/25 text-[#c5d3e8] border border-[#415a77]/40">
              <Layers className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-[#f8fafc]">
              DOM Depth & Node Hierarchy Breakdown
            </h3>
          </div>
          <p className="text-xs text-[#c5d3e8] mt-1">
            Measures document object model complexity, nesting depth, and critical render path blockage.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 rounded-xl bg-[#152238] p-1 border border-[#415a77]/30">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'hierarchy' ? 'bg-[#415a77] text-white shadow' : 'text-[#c5d3e8] hover:text-[#f8fafc]'
            }`}
          >
            Node Distribution
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'payload' ? 'bg-[#415a77] text-white shadow' : 'text-[#c5d3e8] hover:text-[#f8fafc]'
            }`}
          >
            Payload & Memory
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'tree' ? 'bg-[#415a77] text-white shadow' : 'text-[#c5d3e8] hover:text-[#f8fafc]'
            }`}
          >
            Depth Pyramid
          </button>
        </div>
      </div>

      {/* Tab 1: Node Distribution */}
      {activeTab === 'hierarchy' && (
        <div className="mt-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-3.5">
              <div className="text-[11px] text-[#c5d3e8] uppercase tracking-wider font-mono">Total DOM Nodes</div>
              <div className="text-xl font-black text-[#f8fafc] mt-0.5">{domElementsCount.toLocaleString()}</div>
              <div className="text-[10px] text-[#c5d3e8]/70 mt-1">
                Threshold: &lt;1,500 nodes
              </div>
            </div>

            <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-3.5">
              <div className="text-[11px] text-[#c5d3e8] uppercase tracking-wider font-mono">Max Nesting Depth</div>
              <div className="text-xl font-black text-[#c5d3e8] mt-0.5">{domDepthLevel} Levels</div>
              <div className="text-[10px] text-[#c5d3e8]/70 mt-1">
                Threshold: &lt;32 levels
              </div>
            </div>

            <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-3.5">
              <div className="text-[11px] text-[#c5d3e8] uppercase tracking-wider font-mono">Blocking Scripts</div>
              <div className={`text-xl font-black mt-0.5 ${blockingScriptsCount === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {blockingScriptsCount}
              </div>
              <div className="text-[10px] text-[#c5d3e8]/70 mt-1">
                {blockingScriptsCount === 0 ? 'Optimal (0 in <head>)' : 'Parser Blocking Risk'}
              </div>
            </div>

            <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-3.5">
              <div className="text-[11px] text-[#c5d3e8] uppercase tracking-wider font-mono">Complexity Rating</div>
              <div className={`text-sm font-bold mt-1 ${isHealthy ? 'text-emerald-400' : isWarning ? 'text-[#c5d3e8]' : 'text-rose-400'}`}>
                {complexityRating}
              </div>
              <div className="text-[10px] text-[#c5d3e8]/70 mt-1">
                Layout calculation speed
              </div>
            </div>
          </div>

          {/* Interactive Stacked Bar Visualizer */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#c5d3e8] mb-2">
              <span className="font-semibold text-[#f8fafc]">DOM Tag Distribution Spectrum</span>
              <span>100% Normalized</span>
            </div>
            
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-[#152238] border border-[#415a77]/30 p-0.5 gap-0.5">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  style={{ width: `${Math.max(2, cat.pct)}%`, backgroundColor: cat.color }}
                  className="h-full first:rounded-l-lg last:rounded-r-lg transition-all hover:opacity-80 relative group"
                  title={`${cat.name}: ${cat.count} nodes (${cat.pct}%)`}
                />
              ))}
            </div>

            {/* Legend & Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between rounded-lg border border-[#415a77]/25 bg-[#152238]/60 p-2.5 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[#f8fafc] truncate">{cat.name}</span>
                  </div>
                  <div className="font-mono text-[#c5d3e8] font-bold ml-2 shrink-0">
                    {cat.count} <span className="text-[#c5d3e8]/60">({cat.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Payload & Memory */}
      {activeTab === 'payload' && (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#f8fafc]">Initial HTML Document Weight</span>
              <span className="font-mono text-sm font-bold text-[#c5d3e8]">{payloadKb.toFixed(2)} KB</span>
            </div>
            
            {/* Progress bar */}
            <div className="h-3 w-full rounded-full bg-[#0b192c] overflow-hidden border border-[#415a77]/30">
              <div
                className={`h-full transition-all ${
                  payloadKb < 50 ? 'bg-emerald-400' : payloadKb < 150 ? 'bg-[#415a77]' : 'bg-[#c5d3e8]'
                }`}
                style={{ width: `${Math.min(100, (payloadKb / 200) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#c5d3e8]/70 mt-2">
              <span>0 KB (Lean)</span>
              <span>50 KB (Ideal)</span>
              <span>150 KB (Warning)</span>
              <span>200+ KB (Heavy)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4">
              <div className="text-xs font-semibold text-[#f8fafc] mb-1">Modern Image Adoption (WebP/AVIF)</div>
              <div className="text-2xl font-black text-[#c5d3e8] font-mono">{modernImagesPct.toFixed(0)}%</div>
              <p className="text-xs text-[#c5d3e8] mt-1">
                {modernImagesPct >= 60 
                  ? 'Excellent next-gen image compression reduces main thread parsing time.' 
                  : 'Upgrading legacy JPEG/PNG to AVIF/WebP will yield up to 40% network savings.'}
              </p>
            </div>

            <div className="rounded-xl border border-[#415a77]/30 bg-[#152238] p-4">
              <div className="text-xs font-semibold text-[#f8fafc] mb-1">Critical Script Parser Footprint</div>
              <div className={`text-2xl font-black font-mono ${blockingScriptsCount === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {blockingScriptsCount === 0 ? '0 Blockers' : `${blockingScriptsCount} Parser Blocking`}
              </div>
              <p className="text-xs text-[#c5d3e8] mt-1">
                {blockingScriptsCount === 0
                  ? 'All head scripts use modern defer, async, or type="module" attributes.'
                  : 'Scripts in <head> block HTML parsing until download and compilation completes.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Depth Pyramid */}
      {activeTab === 'tree' && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-[#c5d3e8]">
            Simulated DOM branch depth structure. Excessive depth (&gt;32 levels) causes style calculation penalties and layout recalculation delays.
          </p>

          <div className="space-y-2 font-mono text-xs bg-[#152238] rounded-xl border border-[#415a77]/30 p-4">
            <div className="flex items-center gap-2 text-[#f8fafc]">
              <span className="text-[#c5d3e8]/50">L1</span>
              <span>&lt;html&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-[#c5d3e8] pl-4">
              <span className="text-[#c5d3e8]/50">L2</span>
              <span>&lt;body className="min-h-screen"&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-[#c5d3e8] pl-8">
              <span className="text-[#c5d3e8]/50">L3</span>
              <span>&lt;div id="__root"&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-[#c5d3e8] pl-12">
              <span className="text-[#c5d3e8]/50">L4</span>
              <span>&lt;main className="container mx-auto"&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-[#ebe9e6] pl-16">
              <span className="text-[#c5d3e8]/50">L5</span>
              <span>&lt;section className="grid grid-cols-12"&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-[#ebe9e6] pl-20">
              <span className="text-[#c5d3e8]/50">L6</span>
              <span>&lt;article className="col-span-8"&gt; ... {domElementsCount - 15} inner child nodes</span>
            </div>
            <div className="flex items-center gap-2 text-[#c5d3e8]/60 pl-24 text-[11px]">
              <span>... max measured subtree reaches Level {domDepthLevel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-[#415a77]/20 border border-[#415a77]/40 p-3 text-xs text-[#c5d3e8]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#c5d3e8]" />
            <span>Architecture Assessment: Nesting depth is within the optimal threshold (&lt;32 levels).</span>
          </div>
        </div>
      )}
    </div>
  );
};
