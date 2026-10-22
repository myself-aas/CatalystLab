import React from 'react';
import { Link } from 'react-router-dom';
import { ApiPlayground } from '../components/api/ApiPlayground';
import { SEOHead } from '../components/common/SEOHead';

const QUICKSTART = `curl -X POST https://www.catalystlab.tech/api/v1/engines/health/scan \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $CATALYSTLAB_API_KEY" \\
  -d '{"url":"https://example.com"}'`;

export const ApiDocsPage: React.FC = () => {
 return (
 <div className="min-h-screen ds-page-top bg-background text-foreground">
 <SEOHead
 title="API Documentation - CatalystLab"
 description="Call CatalystLab engines from your CI pipeline: authenticate with an API key, scan a URL, and read the telemetry JSON."
 />

 <div className="ds-page-shell ds-section">
 <header className="max-w-3xl space-y-3">
 <h1 className="framer-hero-title text-foreground">CatalystLab API</h1>
 <p className="framer-body-text">
 Run any of the eight engines from a script or a pipeline and get the same
 JSON telemetry the app reads. One scan costs one unit from your daily
 allowance.
 </p>
 </header>

 <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
 <div className="space-y-4">
 <h2 className="framer-card-title text-foreground">First request</h2>
 <ol className="space-y-3 text-sm text-muted-foreground">
 <li>
 <span className="font-medium text-foreground">1. Create an API key.</span>{' '}
 Sign in, then open{' '}
 <Link to="/dashboard?tab=api-keys" className="text-info underline underline-offset-4">Dashboard → API keys</Link>.
 </li>
 <li>
 <span className="font-medium text-foreground">2. Send the key</span> as{' '}
 <code className="font-mono text-xs">Authorization: Bearer &lt;key&gt;</code> or{' '}
 <code className="font-mono text-xs">X-API-Key</code>.
 </li>
 <li>
 <span className="font-medium text-foreground">3. POST a URL</span> to{' '}
 <code className="font-mono text-xs">/api/v1/engines/&lt;engine&gt;/scan</code>. Engine ids are{' '}
 <code className="font-mono text-xs">health</code>, <code className="font-mono text-xs">latency</code>,{' '}
 <code className="font-mono text-xs">ai_ready</code>, <code className="font-mono text-xs">repo</code>,{' '}
 <code className="font-mono text-xs">eco</code>, <code className="font-mono text-xs">compliance</code>,{' '}
 <code className="font-mono text-xs">migration</code>, and <code className="font-mono text-xs">llmo</code>.
 </li>
 </ol>

 <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs leading-relaxed text-foreground">
 <code>{QUICKSTART}</code>
 </pre>

 <p className="text-sm text-muted-foreground">
 Full parameter list, response schema, and error codes live in the{' '}
 <Link to="/docs/api" className="text-info underline underline-offset-4">REST API reference</Link>.
 </p>
 </div>

 <div className="space-y-4">
 <h2 className="framer-card-title text-foreground">Try it now</h2>
 <ApiPlayground />
 </div>
 </section>
 </div>
 </div>
 );
};

export default ApiDocsPage;
