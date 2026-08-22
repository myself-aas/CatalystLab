import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Server, Cpu, Database, Activity, Code, ShieldCheck } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const ArchitectureDoc: React.FC = () => {
  const toc = [
    { id: 'stack-layers', title: 'Layered Architecture' },
    { id: 'ingress-gateway', title: 'Node.js Ingress Gateway' },
    { id: 'engine-workers', title: 'Python & Native AST Workers' },
    { id: 'persistence-layer', title: 'Firestore Persistence & Permalinks' },
  ];

  return (
    <DocsLayout
      title="Full-Stack Architecture"
      description="In-depth analysis of CatalystLab's high-concurrency Node.js Express server, sandboxed Python workers, AST Cheerio parsers, and Firestore cloud storage."
      canonicalPath="/docs/architecture"
      toc={toc}
    >
      <section id="stack-layers" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 text-xs font-semibold text-purple-800">
          <Layers className="h-3.5 w-3.5" />
          <span>System Design Blueprint</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b192c] tracking-tight">
          Full-Stack Application Architecture
        </h1>
        <p className="text-base text-[#415a77] leading-relaxed">
          CatalystLab is architected as a high-concurrency Node.js Express server integrated with Vite middleware, Python 3 sandboxed worker subprocesses, and Firebase Firestore cloud persistence.
        </p>

        {/* Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-6">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0b192c]">
              <Server className="h-4 w-4 text-sky-600" />
              <span>API Gateway & Ingress (Node.js)</span>
            </div>
            <p className="text-[#64748b] leading-relaxed">
              Terminates external traffic, enforces OWASP response headers (HSTS 2-year preload, strict CSP, X-Content-Type-Options: nosniff), executes token bucket rate limiting, and dispatches audit requests to engine subprocesses.
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0b192c]">
              <Cpu className="h-4 w-4 text-purple-600" />
              <span>Python & Native Engine Workers</span>
            </div>
            <p className="text-[#64748b] leading-relaxed">
              Executes dedicated audit scripts (<code>website_health.py</code>, <code>edge_latency.py</code>, <code>ai_readiness.py</code>, etc.) in sandboxed child processes with a 40-second timeout guard and automatic fallback to native Node.js Cheerio AST engines.
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0b192c]">
              <Database className="h-4 w-4 text-emerald-600" />
              <span>Cloud Persistence & Permalinks</span>
            </div>
            <p className="text-[#64748b] leading-relaxed">
              Google Cloud Firestore stores structured audit reports, site uptime monitor histories, and user profiles. Generates deterministic SEO-friendly permalink routes (e.g. <code>/reports/example-com</code>).
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0b192c]">
              <Activity className="h-4 w-4 text-pink-600" />
              <span>Client React UI & Visualization</span>
            </div>
            <p className="text-[#64748b] leading-relaxed">
              Tailwind CSS and Lucide-powered executive dashboards, real-time streaming terminal outputs, multi-region latency radar charts, and instant JSON/PDF export modules.
            </p>
          </div>
        </div>
      </section>

      {/* Ingress Gateway Section */}
      <section id="ingress-gateway" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">API Gateway & Ingress Flow</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Every HTTP request entering the platform passes through security filtering, rate limit token bucket inspection, and SSRF domain resolution before reaching backend engine workers.
        </p>

        <CodeSnippet
          title="Express Server Gateway Flow (server.ts)"
          language="typescript"
          code={`// Express route handler with security middleware & process dispatch
app.post("/api/run-engine", async (req, res) => {
  const { url, engine, visitorId, userEmail } = req.body;
  
  // 1. Validate URL & Prevent SSRF
  if (!isValidPublicUrl(url)) {
    return res.status(400).json({ error: "Invalid target URL. Must be public HTTP/HTTPS." });
  }

  // 2. Sliding Rate Limit Check
  const rateLimitStatus = checkRateLimit(visitorId, userEmail);
  if (!rateLimitStatus.allowed) {
    return res.status(429).json({ error: "Rate limit exceeded.", rateLimit: rateLimitStatus });
  }

  // 3. Dispatch to sandboxed Python engine with timeout guard
  const auditResult = await executeEngineWorker(engine, url);
  return res.json(auditResult);
});`}
        />
      </section>

      {/* Engine Workers Section */}
      <section id="engine-workers" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Python & Native AST Workers</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Diagnostic calculations run in separate non-blocking worker subprocesses. If the Python environment is constrained, the Node.js server automatically switches to native Cheerio AST and high-resolution socket modules to ensure 100% uptime with zero degradation.
        </p>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 space-y-3">
          <h3 className="font-bold text-[#0b192c] text-sm uppercase tracking-wider">Worker Failover Strategy</h3>
          <ul className="space-y-2 text-sm text-[#415a77]">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-800 text-xs font-bold shrink-0">1</span>
              <span>Primary execution attempts sandboxed Python CLI probe (<code>website_health.py</code>).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-800 text-xs font-bold shrink-0">2</span>
              <span>Subprocess is monitored by a 40,000ms hard timer with strict 5MB output buffer limits.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-800 text-xs font-bold shrink-0">3</span>
              <span>On timeout or exit error, execution gracefully shifts to built-in TypeScript AST parser.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Persistence Layer */}
      <section id="persistence-layer" className="space-y-4 border-t border-[#e2e8f0] pt-8">
        <h2 className="text-2xl font-bold text-[#0b192c]">Firestore Persistence & Permalinks</h2>
        <p className="text-sm text-[#415a77] leading-relaxed">
          Completed audits are indexed in Google Cloud Firestore collections: <code>audit_reports</code>, <code>monitored_domains</code>, and <code>user_history</code>. The system constructs deterministic slug permalinks allowing teams to share reports (e.g. <code>/reports/stripe-com</code>).
        </p>
      </section>
    </DocsLayout>
  );
};
export default ArchitectureDoc;
