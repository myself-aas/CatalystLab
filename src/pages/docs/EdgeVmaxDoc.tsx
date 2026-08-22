import React from 'react';
import { Globe, CheckCircle2, Zap, Server, ShieldCheck } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const EdgeVmaxDoc: React.FC = () => {
  const toc = [
    { id: 'edgevmax-overview', title: 'Phase 5: EdgeVmax Overview' },
    { id: 'pops-matrix', title: '12 Global Anycast PoPs' },
    { id: 'ttfb-measurements', title: 'TTFB Breakdown & Synthetic Timing' },
    { id: 'edge-cache-worker', title: 'Cloudflare Edge Worker Cache Recipe' },
  ];

  return (
    <DocsLayout
      title="5. EdgeVmax (SDLC Phase 5) — Global Edge Latency & Anycast"
      description="Multi-region Time to First Byte (TTFB) synthetic measurements across 12 Anycast global points of presence and Cloudflare Worker caching."
      canonicalPath="/docs/edgevmax"
      toc={toc}
    >
      <section id="edgevmax-overview" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-3 py-0.5 text-xs font-semibold text-pink-800">
          <Globe className="h-3.5 w-3.5" />
          <span>SDLC Phase 5: Global Latency Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b192c] tracking-tight">
          EdgeVmax: Global Anycast Latency & TTFB Radar
        </h1>
        <p className="text-base text-[#415a77] leading-relaxed">
          EdgeVmax executes high-precision multi-region synthetic network timing probes to quantify DNS resolution, TCP handshake, TLS 1.3 session negotiation, and Time to First Byte (TTFB) across 12 global points of presence.
        </p>
      </section>

      {/* 12 PoPs */}
      <section id="pops-matrix" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">12 Global Evaluation Points of Presence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-3.5 space-y-1">
            <strong className="text-sky-700 font-bold block">North America</strong>
            <ul className="text-xs text-[#64748b] space-y-0.5">
              <li>• us-east (Ashburn, VA)</li>
              <li>• us-central (Iowa)</li>
              <li>• us-west (Oregon)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-3.5 space-y-1">
            <strong className="text-emerald-700 font-bold block">Europe & UK</strong>
            <ul className="text-xs text-[#64748b] space-y-0.5">
              <li>• europe-west (Frankfurt, DE)</li>
              <li>• europe-north (London, UK)</li>
              <li>• europe-south (Zurich, CH)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-3.5 space-y-1">
            <strong className="text-purple-700 font-bold block">Asia-Pacific & LATAM</strong>
            <ul className="text-xs text-[#64748b] space-y-0.5">
              <li>• asia-east (Tokyo, JP)</li>
              <li>• asia-south (Singapore, SG)</li>
              <li>• sa-east (São Paulo, BR)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* TTFB Breakdown */}
      <section id="ttfb-measurements" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Synthetic TTFB Timing Breakdown</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          The engine computes socket timing phases to pinpoint whether latency originates in DNS, TLS negotiation, or slow backend database processing:
        </p>

        <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Connection Phase</th>
                <th className="py-2.5 px-3">Target Latency</th>
                <th className="py-2.5 px-3">Root Cause if Slow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b192c]">
              <tr>
                <td className="py-2 px-3 font-semibold">DNS Lookup</td>
                <td className="py-2 px-3 font-mono text-emerald-700 font-bold">&lt; 25 ms</td>
                <td className="py-2 px-3 text-[#64748b]">Uncached nameserver or slow recursive resolver</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">TCP Handshake</td>
                <td className="py-2 px-3 font-mono text-emerald-700 font-bold">&lt; 40 ms</td>
                <td className="py-2 px-3 text-[#64748b]">Physical distance to origin server (No Anycast)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">TLS 1.3 Negotiation</td>
                <td className="py-2 px-3 font-mono text-emerald-700 font-bold">&lt; 50 ms</td>
                <td className="py-2 px-3 text-[#64748b]">Legacy TLS 1.2 or missing 0-RTT session resumption</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Server TTFB (Processing)</td>
                <td className="py-2 px-3 font-mono text-emerald-700 font-bold">&lt; 150 ms</td>
                <td className="py-2 px-3 text-[#64748b]">Uncached SSR responses or slow database queries</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Cloudflare Edge Worker Recipe */}
      <section id="edge-cache-worker" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Cloudflare Edge Worker Cache Recipe</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Deploy an edge cache worker to serve static HTML under 30ms globally:
        </p>

        <CodeSnippet
          title="worker.ts (Cloudflare Workers)"
          language="typescript"
          code={`export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);
    if (!response) {
      response = await fetch(request);
      
      if (response.status === 200) {
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
        headers.set('Server-Timing', 'edge;dur=4.2;desc="Cloudflare PoP Cache"');
        
        response = new Response(response.body, { ...response, headers });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
    }
    return response;
  }
};`}
        />
      </section>
    </DocsLayout>
  );
};
export default EdgeVmaxDoc;
