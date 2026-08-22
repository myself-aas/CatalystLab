import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Code2, Play, ExternalLink, Key, Zap, CheckCircle2 } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const ApiReferenceDoc: React.FC = () => {
  const toc = [
    { id: 'api-overview', title: 'REST API Overview' },
    { id: 'authentication', title: 'Authentication & API Keys' },
    { id: 'run-engine', title: 'POST /api/run-engine' },
    { id: 'monitor-probe', title: 'POST /api/monitor/probe' },
    { id: 'system-health', title: 'GET /api/monitor/system-health' },
    { id: 'response-schema', title: 'Standard JSON Response Schema' },
  ];

  return (
    <DocsLayout
      title="REST API Specification & Endpoint Reference"
      description="REST API documentation, POST /api/run-engine, probe telemetry, system health, and JSON schemas."
      canonicalPath="/docs/api"
      toc={toc}
    >
      <section id="api-overview" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-0.5 text-xs font-semibold text-sky-800">
          <Terminal className="h-3.5 w-3.5" />
          <span>OpenAPI 3.1 Specification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b192c] tracking-tight">
          REST API Specification & Reference
        </h1>
        <p className="text-base text-[#415a77] leading-relaxed">
          CatalystLab provides a clean, predictable RESTful API over HTTPS. All endpoints accept and return <code>application/json</code> payloads with standardized telemetry metadata and error objects.
        </p>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            to="/api-docs"
            className="flex items-center gap-1.5 rounded-xl bg-[#0b192c] px-4 py-2 text-xs font-bold text-sky-400 hover:bg-[#152238] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Code2 className="h-4 w-4" />
            <span>Interactive API Studio</span>
          </Link>

          <Link
            to="/playground"
            className="flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-xs font-bold text-[#0b192c] hover:bg-[#f8fafc] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Play className="h-4 w-4 text-emerald-600" />
            <span>Live API Playground</span>
          </Link>
        </div>
      </section>

      {/* Authentication */}
      <section id="authentication" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Authentication & Quota Headers</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Pass your API key in the <code>Authorization: Bearer &lt;key&gt;</code> or <code>X-API-Key</code> request header:
        </p>

        <CodeSnippet
          title="cURL Authentication Example"
          language="bash"
          code={`curl -X POST https://www.catalystlab.tech/api/run-engine \\
  -H "Authorization: Bearer cat_live_9f83b271d4e680a9c1e2f3a4b5c6d7e8" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "engine": "website-health"}'`}
        />
      </section>

      {/* POST /api/run-engine */}
      <section id="run-engine" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-mono font-bold text-white uppercase">
            POST
          </span>
          <h2 className="text-2xl font-bold text-[#0b192c]">/api/run-engine</h2>
        </div>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Executes an isolated diagnostic probe against any public HTTP/HTTPS endpoint.
        </p>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 space-y-2 text-sm">
          <h3 className="font-bold text-[#0b192c] text-xs uppercase tracking-wider">Request Parameters</h3>
          <ul className="space-y-1.5 text-xs font-mono text-[#415a77]">
            <li>• <code>url</code> (string, required): Full target URL (e.g. <code>https://stripe.com</code>)</li>
            <li>• <code>engine</code> (string, required): One of <code>website-health</code>, <code>edge-latency</code>, <code>ai-readiness</code>, <code>owasp-security</code>, <code>eco-carbon</code>, <code>git-repo</code>, <code>alloster-search</code>, <code>master-suite</code></li>
            <li>• <code>visitorId</code> (string, optional): Client device identifier for sliding rate limits</li>
          </ul>
        </div>

        <CodeSnippet
          title="Example Node.js Dispatch"
          language="typescript"
          code={`const response = await fetch("https://www.catalystlab.tech/api/run-engine", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "cat_live_..."
  },
  body: JSON.stringify({
    url: "https://github.com",
    engine: "website-health"
  })
});

const data = await response.json();
console.log("Quality Score:", data.score);`}
        />
      </section>

      {/* POST /api/monitor/probe */}
      <section id="monitor-probe" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-mono font-bold text-white uppercase">
            POST
          </span>
          <h2 className="text-2xl font-bold text-[#0b192c]">/api/monitor/probe</h2>
        </div>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Retrieves instantaneous SSL certificate expiry, DNS timing, and HTTP status code for registered domains.
        </p>
      </section>

      {/* GET /api/monitor/system-health */}
      <section id="system-health" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-mono font-bold text-white uppercase">
            GET
          </span>
          <h2 className="text-2xl font-bold text-[#0b192c]">/api/monitor/system-health</h2>
        </div>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Returns gateway ingress health, active worker pool capacity, and memory consumption.
        </p>
      </section>

      {/* Response Schema */}
      <section id="response-schema" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Standard JSON Response Schema</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          All engine responses conform to the standard telemetry envelope:
        </p>

        <CodeSnippet
          title="Standard JSON Output Structure"
          language="json"
          code={`{
  "success": true,
  "engine": "website-health",
  "targetUrl": "https://example.com",
  "timestamp": "2026-08-22T09:40:00Z",
  "durationMs": 942,
  "score": 94,
  "status": "PASS",
  "metrics": {
    "domTreeDepth": 14,
    "totalDomNodes": 412,
    "renderBlockingScripts": 0,
    "wireSizeKb": 24.8,
    "compressionType": "br"
  },
  "recommendations": [
    {
      "priority": "LOW",
      "message": "Add explicit width and height attributes to 2 secondary images."
    }
  ]
}`}
        />
      </section>
    </DocsLayout>
  );
};
export default ApiReferenceDoc;
