import React from 'react';
import { Cpu, CheckCircle2, Search, FileText, Code } from 'lucide-react';
import { DocsLayout, CodeSnippet } from '../../components/docs/DocsLayout';

export const LlmKinaseDoc: React.FC = () => {
  return (
    <DocsLayout
      title="7. LLM-Kinase (SDLC Phase 7) — AI Crawler Readiness & llms.txt"
      description="Discovery and validation of /llms.txt standard manifests, AI crawler robots.txt rules, and Schema.org JSON-LD knowledge graphs."
      canonicalPath="/docs/llm-kinase"
    >
      <section id="llmkinase-overview" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 text-xs font-semibold text-purple-800">
          <Cpu className="h-3.5 w-3.5" />
          <span>SDLC Phase 7: AI Readiness Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          LLM-Kinase: AI Crawler Readiness & Manifest Engine
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          LLM-Kinase evaluates a domain's accessibility to generative AI models and Retrieval-Augmented Generation (RAG) pipelines by checking for <code>/llms.txt</code>, testing AI bot user-agent permissions in <code>robots.txt</code>, and verifying Schema.org JSON-LD structured data.
        </p>
      </section>

      {/* llms.txt Standard */}
      <section id="llms-txt-standard" className="space-y-4 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-foreground">The /llms.txt Standard Specification</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The <code>/llms.txt</code> file serves as a structured Markdown roadmap for Large Language Models to digest core API documentation, technical architectures, and developer resources:
        </p>

        <CodeSnippet
          title="/public/llms.txt Standard Manifest"
          language="markdown"
          code={`# CatalystLab Telemetry API

> CatalystLab provides high-speed non-evaluating HTTP/TLS telemetry, Core Web Vitals diagnostics, and AI search readiness audits.

## Core API Endpoints
- [/api/run-engine](/docs/api): Execute an isolated diagnostic probe against any public domain.
- [/api/monitor/probe](/docs/api): Retrieve latency and SSL telemetry for registered domains.
- [/api/monitor/system-health](/docs/api): Ingress gateway cluster telemetry and uptime.

## Diagnostic Engines
- [SynthShift](/docs/synthshift): Platform migration blueprint & MongoDB schema generator.
- [VitalZyme](/docs/vitalzyme): DOM tree depth & Core Web Vitals AST analysis.
- [EcoHolo](/docs/ecoholo): Sustainable Web Design v4 carbon emissions audit.
- [EdgeVmax](/docs/edgevmax): 12-PoP Anycast edge latency & synthetic TTFB.`}
        />
      </section>

      {/* AI Bot User-Agents */}
      <section id="crawler-user-agents" className="space-y-4 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-foreground">AI Crawler User-Agent Directives</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ensure your <code>robots.txt</code> explicitly grants indexing rights to AI search engines while protecting private API endpoints:
        </p>

        <CodeSnippet
          title="robots.txt (AI Crawler Friendly)"
          language="plaintext"
          code={`User-agent: GPTBot
Allow: /
Allow: /llms.txt
Disallow: /admin/
Disallow: /api/internal/

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /`}
        />
      </section>

      {/* JSON-LD Entity Graph */}
      <section id="json-ld-entity" className="space-y-4 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-foreground">Schema.org JSON-LD Structured Data</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Structured JSON-LD entity data allows LLMs to extract key facts without parsing ambiguous HTML:
        </p>

        <CodeSnippet
          title="TechArticle JSON-LD Schema (<script type='application/ld+json'>)"
          language="json"
          code={`{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CatalystLab",
  "operatingSystem": "Cloud / Docker",
  "applicationCategory": "DeveloperApplication",
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "CatalystLab Telemetry Team",
    "url": "https://www.catalystlab.tech"
  }
}`}
        />
      </section>
    </DocsLayout>
  );
};
export default LlmKinaseDoc;
