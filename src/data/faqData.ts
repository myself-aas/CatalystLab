import { FaqCategory } from '../components/common/GlobalFaqSection';

export const MASTER_FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'engines',
    label: 'Engines & Architecture',
    description: 'Deep dive into our 8 parallel diagnostic micro-services, Python 3.11 runtimes, AST parsing, and synthetic probe orchestration.',
    iconName: 'cpu',
    items: [
      {
        question: 'How does CatalystLab run 8 diagnostic engines in parallel in under 2 seconds?',
        badge: 'Distributed Edge Mesh',
        answer: `When an audit is initiated via our web interface, CLI, or API, our orchestrator dispatches 8 isolated micro-services concurrently across our distributed edge mesh.

These 8 core engines evaluate:
• AST Bundle Hygiene & Dead-Code Weight
• OWASP Defense Headers & TLS Security Posture
• 42-PoP Multi-Region Edge TTFB Latency Radar
• Sustainable Web Carbon Footprint Modeling (Manifesto v3)
• DOM Tree Recursion & Client-Side Hydration Depth
• /llms.txt AI Search & LLM Agent Readiness Index
• Core Web Vitals (INP, LCP, CLS - Real-User CrUX & Synthetic Lab)
• Accessibility & WCAG 2.2 AA/AAA Compliance

All 8 engines execute simultaneously using asynchronous headless Chromium workers and Python 3.11 telemetry scripts, aggregating metrics and synthesizing your complete audit dossier in under 2 seconds.`,
        codeSnippet: `curl -X POST https://api.catalystlab.tech/v1/audit \\
  -H "Authorization: Bearer $CATALYSTLAB_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "engines": "all", "regions": 42}'`
      },
      {
        question: 'What specific diagnostic checks does each of the 8 engines perform?',
        badge: 'Diagnostic Scope',
        answer: `Each engine focuses on a critical pillar of modern web engineering:

1. AST Hygiene Engine: Inspects JavaScript bundle chunks, dead-code weight, legacy polyfills, and tree-shaking efficacy.
2. OWASP Defense Engine: Validates CSP, HSTS, X-Frame-Options, Permissions-Policy, and TLS 1.3 cipher suite strength.
3. 42-PoP Latency Engine: Simulates simultaneous TCP/TLS handshakes and Time-To-First-Byte across 42 global edge points of presence.
4. Sustainable Web Engine: Models grams of CO₂ emitted per pageview using the Sustainable Web Manifesto v3 formula and Green Web hosting verification.
5. DOM & Hydration Engine: Measures DOM node depth (>1,500 node threshold), layout thrashing risks, and React/Next.js/Nuxt SSR hydration bottlenecks.
6. AI Readiness (LLMO) Engine: Inspects /llms.txt manifests, robots.txt bot rules, Schema.org JSON-LD structured data, and semantic hierarchy.
7. Core Web Vitals Engine: Computes Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).
8. Accessibility Engine: Audits contrast ratios, ARIA landmarks, form accessibility, and keyboard focus traps against WCAG 2.2.`
      },
      {
        question: 'How does CatalystLab eliminate false positives during diagnostic audits?',
        badge: 'Synthetic Verification',
        answer: `Unlike simple static regex scanners, CatalystLab uses real-time dynamic synthetic verification. For instance, rather than merely verifying that a Content-Security-Policy header string exists, the OWASP Engine simulates actual script execution within an isolated sandbox to confirm that directives like 'script-src' and 'frame-ancestors' are actively enforced.

Additionally, our latency engine uses multi-sample median smoothing to discard transient network anomalies, ensuring rock-solid reproducibility.`
      },
      {
        question: 'Does running an audit place heavy load or strain on my production servers?',
        badge: 'Safe Synthetic Load',
        answer: `No. CatalystLab audits simulate single-user synthetic visits with rate-limiting and non-destructive HTTP requests. The total payload transferred is equivalent to a single end-user browsing your page. Our engines respect Retry-After headers, honour standard rate limits, and strictly avoid brute-force fuzzing or destructive penetration testing.`
      },
      {
        question: 'Can CatalystLab audit dynamic Single-Page Apps (SPAs) and modern SSR frameworks?',
        badge: 'Framework Agnostic',
        answer: `Yes. CatalystLab uses headless Chromium browser instances with full ECMAScript execution, WebAssembly support, and dynamic DOM rendering. It accurately analyzes React, Next.js (App & Pages Router), Vue, Nuxt, SvelteKit, Angular, Astro, Remix, and static HTML applications after full client-side hydration completes.`
      },
      {
        question: 'What is the difference between Lab (Synthetic) and Field (CrUX) diagnostics in the engines?',
        badge: 'Lab vs Field Data',
        answer: `• Lab Diagnostics execute in standardized headless cloud environments with fixed network throttling (e.g., 4G mobile, desktop broadband) to deliver reproducible debugging benchmarks for developers.
• Field Diagnostics aggregate anonymized real-user telemetry from the Chrome User Experience Report (CrUX), reflecting actual performance experienced by genuine users across diverse devices, browsers, and real-world network conditions.`
      },
      {
        question: 'How frequently are the diagnostic engine rules and security benchmarks updated?',
        badge: 'Weekly Rule Updates',
        answer: `Our diagnostic algorithms and compliance rules are updated weekly to match the latest W3C recommendations, OWASP Top 10 vulnerabilities, Google Search Algorithm & Core Web Vitals thresholds (such as INP metrics), and emerging AI bot discovery protocols.`
      },
      {
        question: 'Can Enterprise customers deploy custom audit engines or proprietary rules?',
        badge: 'Enterprise Extensibility',
        answer: `Yes. Enterprise tier customers can inject custom audit evaluation hooks, proprietary compliance checklists, and custom webhook callbacks. Contact our solutions architecture team to configure bespoke internal rule sets.`
      }
    ]
  },
  {
    id: 'cicd',
    label: 'CI/CD & Pipeline Automation',
    description: 'Integrate automated quality gates, PR status checks, build breaker thresholds, and CLI tools into your deployment pipelines.',
    iconName: 'git',
    items: [
      {
        question: 'How do I integrate CatalystLab into GitHub Actions or GitLab CI/CD pipelines?',
        badge: 'GitHub / GitLab / Bitbucket',
        answer: `You can integrate CatalystLab using our official GitHub Action or our cross-platform CLI tool. Simply add a step to your CI workflow file to run audits on every pull request, release tag, or merge to main.`,
        codeSnippet: `name: CatalystLab Quality Gate
on: [pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run CatalystLab 8-Engine Audit
        uses: catalystlab/audit-action@v2
        with:
          url: \${{ steps.deploy.outputs.preview_url }}
          api_key: \${{ secrets.CATALYSTLAB_API_KEY }}
          fail_on_threshold: true`
      },
      {
        question: 'How do build-breaker thresholds work to prevent performance and security regressions?',
        badge: 'Automated Build Gates',
        answer: `You can define a '.catalystlabrc.json' configuration file in your repository root specifying minimum acceptable scores. For example:
• Security Score ≥ 95/100
• Largest Contentful Paint (LCP) ≤ 2.5s
• Carbon Footprint ≤ 0.5g CO₂/page
• AI Readiness Index ≥ 80/100

If any metric falls below your configured threshold, the CLI returns exit code 1, immediately preventing flawed code from merging or deploying to production.`
      },
      {
        question: 'Does the CI/CD integration generate PR comments with visual metric diffs?',
        badge: 'Automated PR Diffs',
        answer: `Yes! When integrated with GitHub Actions or GitLab CI, our CI bot automatically posts a comprehensive markdown audit report directly into your pull request. It compares the PR preview deployment against your production baseline, highlighting delta metrics for LCP, bundle size changes, newly detected security header regressions, and AI citation scores.`
      },
      {
        question: 'Can CatalystLab audit password-protected staging and preview environments?',
        badge: 'Preview & Staging Support',
        answer: `Yes. You can pass custom HTTP headers (such as 'Authorization: Bearer <token>', 'x-preview-token', or custom cookies) via the CLI flags or CI action parameters. You can also whitelist CatalystLab's dedicated static egress IP ranges in your Cloudflare, AWS WAF, Fastly, or VPC firewall.`
      },
      {
        question: 'How does the CLI authenticate in automated headless CI environments?',
        badge: 'Secret Token Auth',
        answer: `Set the 'CATALYSTLAB_API_KEY' environment variable in your CI/CD repository secrets manager (GitHub Secrets, GitLab Variables, AWS Secrets Manager). The CLI automatically detects this key and associates audit logs with your team workspace.`,
        codeSnippet: `export CATALYSTLAB_API_KEY="cat_live_xxxxxxxxxxxx"
npx @catalystlab/cli audit https://staging.myapp.com --json > audit-report.json`
      },
      {
        question: 'Can CatalystLab trigger real-time Webhook notifications on score drops?',
        badge: 'Slack & Discord Webhooks',
        answer: `Yes. In your Workspace Settings, you can configure outgoing Webhooks for Slack, Discord, Microsoft Teams, Datadog, PagerDuty, or custom HTTP endpoints. Webhooks fire in real-time whenever an audit completes or when a critical regression is detected.`
      },
      {
        question: 'What are the CI/CD concurrency limits across different plan tiers?',
        badge: 'Plan Concurrency',
        answer: `• Community (Free): 25 CI runs/month with 1 concurrent job.
• Starter ($9/mo): 100 CI runs/month with 2 parallel jobs.
• Pro ($19/mo): 500 CI runs/month with 5 parallel jobs.
• Team ($49/mo): 2,000 CI runs/month with 15 parallel jobs.
• Enterprise Suite ($99/mo): Unlimited CI runs with dedicated high-speed parallel workers.`
      }
    ]
  },
  {
    id: 'plans',
    label: '5 Pricing Plans & Billing Calculations',
    description: 'Compare Free ($0), Starter ($9), Pro ($19), Team ($49), and Enterprise ($99) tiers, 20% annual discounts, and seat quotas.',
    iconName: 'credit-card',
    items: [
      {
        question: 'What are the 5 pricing tiers available on CatalystLab?',
        badge: '5 Tier Overview',
        answer: `CatalystLab offers 5 transparent pricing tiers tailored to every stage of engineering growth:

1. Free / Community ($0/mo): 50 compute units/day (5 Master Audits or 50 Single Engines), 25 CI runs/month. Free forever.
2. Starter ($9/mo, or $7/mo billed annually): 150 compute units/day, 100 CI runs/mo, 180-min automated probes, 5 monitored sites, 7-day free trial.
3. Pro ($19/mo, or $15/mo billed annually): 500 compute units/day, 500 CI runs/mo, 60-min automated probes, 20 monitored sites, 90-day history, 7-day free trial.
4. Team ($49/mo, or $39/mo billed annually): 1,500 compute units/day, 2,000 CI runs/mo, 15-min probes, 50 monitored sites, 10 team seats, RBAC, 7-day free trial.
5. Enterprise ($99/mo, or $79/mo billed annually): 5,000 compute units/day, unlimited CI runs, 1-min probes, unlimited endpoints, VPC air-gapped runners, 99.99% SLA, 7-day free trial.`
      },
      {
        question: 'How does the 20% annual billing discount calculation work?',
        badge: 'Save 20% Annual',
        answer: `When you toggle Annual Billing:
• Starter is billed at $7/month ($84/year) instead of $9/month — saving over 22%.
• Pro is billed at $15/month ($180/year) instead of $19/month — saving 21%.
• Team is billed at $39/month ($468/year) instead of $49/month — saving 20%.
• Enterprise is billed at $79/month ($948/year) instead of $99/month — saving 20%.`
      },
      {
        question: 'What is a Compute Unit and how are audits calculated?',
        badge: 'Unit Calculations',
        answer: `To provide transparent usage calculations:
• 1 Master Audit (which runs all 8 diagnostic engines in parallel) = 10 Compute Units.
• 1 Single Engine Audit (e.g. Health, Latency, AI Readiness, or OWASP) = 1 Compute Unit.

For example:
• Free (50 units/day) = 5 Master Audits OR 50 Single Engine Audits per day.
• Starter (150 units/day) = 15 Master Audits OR 150 Single Engine Audits per day.
• Pro (500 units/day) = 50 Master Audits OR 500 Single Engine Audits per day.
• Team (1,500 units/day) = 150 Master Audits OR 1,500 Single Engine Audits per day.
• Enterprise (5,000 units/day) = 500 Master Audits OR 5,000 Single Engine Audits per day.`
      },
      {
        question: 'Can I upgrade, downgrade, or cancel my subscription at any time?',
        badge: 'Prorated Billing',
        answer: `Yes. You can switch between any of the 5 tiers directly from your Workspace Billing page. Upgrades take effect immediately with prorated balance adjustments. Downgrades or cancellations remain active through the end of your prepaid billing period with zero cancellation fees.`
      },
      {
        question: 'Do you offer special pricing for students, educators, and early-stage startups?',
        badge: 'Startup & Student Discount',
        answer: `Yes! We offer a 50% discount on Pro and Team tiers for accredited students, educational institutions, non-profit foundations, and early-stage startups (less than $1M raised). Contact support@catalystlab.tech with verification to receive your promotional coupon code.`
      }
    ]
  },
  {
    id: 'trial',
    label: '7-Day Free Trial (No Credit Card)',
    description: 'Everything you need to know about activating our 7-day free trial with login only, zero credit card requirements, and zero risk.',
    iconName: 'zap',
    items: [
      {
        question: 'How do I activate the 7-Day Free Trial?',
        badge: 'No Credit Card Required',
        answer: `You can activate the 7-Day Free Trial on any paid plan (Starter $9, Pro $19, Team $49, or Enterprise $99) with just 1 click. Simply log in with your Google account and click 'Start 7-Day Free Trial'. You do NOT need to enter a credit card, PayPal, or payment method.`
      },
      {
        question: 'What features and quotas are unlocked during the 7-Day Free Trial?',
        badge: 'Full Feature Access',
        answer: `During your 7-day trial period, you receive 100% of the capabilities, API rate limits, automated background probes, CI/CD runners, and team seats associated with your chosen tier. There are no artificial feature locks or throttles.`
      },
      {
        question: 'What happens when my 7-Day Free Trial expires?',
        badge: 'Zero Risk Guarantee',
        answer: `When the 7 days elapse, your account automatically transitions to the permanently free Community Tier (50 compute units/day, unlimited on-demand audits). You will never be charged surprise fees because we never ask for your credit card to begin the trial. You can choose to subscribe to a paid tier at your convenience.`
      },
      {
        question: 'Can I switch between different paid plans during my active 7-Day Free Trial?',
        badge: 'Trial Tier Switching',
        answer: `Yes! You can explore and switch between Starter ($9), Pro ($19), Team ($49), and Enterprise ($99) during your trial to evaluate which plan best matches your team's operational needs and scanning volume.`
      },
      {
        question: 'Will my monitored sites, API keys, and audit history be saved after the trial?',
        badge: 'Data Preservation',
        answer: `Yes. All your configured monitored domains, generated API keys, and past audit dossiers remain safely preserved in your workspace account. Even if you continue on the Free tier, your data remains accessible.`
      }
    ]
  },
  {
    id: 'ai-readiness',
    label: 'AI Readiness & LLMO',
    description: 'Generative Engine Optimization, /llms.txt manifest validation, bot crawling permissions, and vector chunking extractability.',
    iconName: 'bot',
    items: [
      {
        question: 'What is Generative Engine Optimization (LLMO) and why is it essential?',
        badge: 'AI Search Discovery',
        answer: `LLMO evaluates how easily AI search engines and autonomous agents (such as Perplexity, OpenAI SearchGPT, Google Gemini, and Anthropic Claude) can crawl, parse, synthesize, and cite content from your web domain.

Websites with high LLMO index scores experience significantly higher citation frequency and accurate brand attribution in AI-generated answers.`
      },
      {
        question: 'What is the /llms.txt standard and how does CatalystLab audit it?',
        badge: '/llms.txt Standard',
        answer: `The '/llms.txt' specification is an emerging web standard (similar to robots.txt) located at the root of your domain. It provides structured, curated markdown links and concise summaries tailored for Large Language Models to consume without HTML bloat.

CatalystLab validates your /llms.txt syntax, verifies linked markdown endpoints, checks token density, and ensures semantic freshness.`
      },
      {
        question: 'How does CatalystLab measure semantic chunking and markdown extractability?',
        badge: 'Semantic Hierarchy',
        answer: `The AI Engine simulates how modern LLM web crawlers convert HTML pages into clean markdown chunks for RAG (Retrieval-Augmented Generation) pipelines.

It validates:
• Clean heading depth hierarchy (H1 → H2 → H3)
• High text-to-HTML markup ratio (avoiding nested <div> soup)
• Elimination of visual clutter and intrusive modal overlays
• Correct Schema.org JSON-LD structured data entities`
      },
      {
        question: 'Does CatalystLab check if my robots.txt blocks or allows AI crawlers?',
        badge: 'AI Bot Perms & Directives',
        answer: `Yes. The engine inspects your 'robots.txt' file and HTTP response headers for specific AI user-agents including 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Bytespider', and 'CCBot'. It highlights whether your site unintentionally blocks AI discovery or inadvertently exposes sensitive internal endpoints to AI scrapers.`
      },
      {
        question: 'What structured data schemas are validated by the AI Engine?',
        badge: 'Schema.org JSON-LD',
        answer: `We parse and validate JSON-LD and Microdata for standard Schema.org entities including 'Article', 'Product', 'Organization', 'TechArticle', 'FAQPage', 'BreadcrumbList', 'SoftwareApplication', and 'Event'. The engine warns if required properties (such as author, datePublished, or price) are missing.`
      },
      {
        question: 'What actionable steps can I take to improve my domain’s AI Readiness score?',
        badge: 'Optimization Checklist',
        answer: `1. Publish a compliant '/llms.txt' file at your domain root.
2. Inject rich Schema.org JSON-LD data into all informational pages.
3. Ensure high text-to-markup ratio and semantic HTML5 tags (<main>, <article>, <section>).
4. Explicitly declare AI crawler permissions in robots.txt.
5. Provide clean, permanent canonical URLs with accurate OpenGraph metadata.`
      }
    ]
  },
  {
    id: 'security',
    label: 'Security & OWASP Defense',
    description: 'Inspect HTTP defense headers, TLS cipher suites, subresource integrity (SRI), and non-invasive zero-storage synthetic probes.',
    iconName: 'shield',
    items: [
      {
        question: 'Does CatalystLab store, inspect, or log private user credentials or application data?',
        badge: 'Zero Data Storage Guarantee',
        answer: `No. CatalystLab operates strictly via non-invasive synthetic telemetry probes against public network interfaces and response headers. We never inspect user sessions, database records, private credentials, passwords, or proprietary backend codebases. Your code and user data remain 100% private and untouched.`
      },
      {
        question: 'Which OWASP defense headers does CatalystLab analyze and grade?',
        badge: 'OWASP Security Suite',
        answer: `We audit and evaluate all modern HTTP security headers, including:
• Content-Security-Policy (CSP): Directive strength, nonce/hash validation, and unsafe-inline detection
• Strict-Transport-Security (HSTS): max-age duration, includeSubDomains, and preload eligibility
• X-Frame-Options: Clickjacking defense (DENY / SAMEORIGIN)
• X-Content-Type-Options: MIME-sniffing prevention (nosniff)
• Referrer-Policy: Data leakage mitigation (strict-origin-when-cross-origin)
• Permissions-Policy: Camera, microphone, and geolocation hardware gating
• COOP & COEP: Cross-Origin-Opener and Embedder Isolation`
      },
      {
        question: 'How does the SSL/TLS protocol probe evaluate encryption strength?',
        badge: 'TLS 1.3 & Cipher Probes',
        answer: `Our security engine initiates TLS handshakes across global probe endpoints to verify:
• TLS 1.3 and TLS 1.2 protocol enforcement
• Deprecated cipher deprecation (rejection of SSLv3, TLS 1.0, and TLS 1.1)
• SSL/TLS certificate validity, expiration dates, and root CA trust chains
• OCSP Stapling support and Certificate Transparency (CT) logging`
      },
      {
        question: 'Does CatalystLab check for Subresource Integrity (SRI) on external CDN scripts?',
        badge: 'SRI Supply Chain Defense',
        answer: `Yes. The engine scans all external third-party '<script>' and '<link>' tags loaded from CDNs to verify whether cryptographic 'integrity' hashes (e.g., sha384-...) and 'crossorigin="anonymous"' attributes are present, guarding against supply-chain tampering and poisoned CDN scripts.`
      },
      {
        question: 'Can we whitelist CatalystLab probe IP addresses in our WAF or Cloudflare firewall?',
        badge: 'Static IP Whitelisting',
        answer: `Yes. We publish a cryptographically signed, updated list of static egress IPv4 and IPv6 CIDR blocks used by our global probe runners. You can add these IP blocks to AWS WAF, Cloudflare IP Access Rules, GCP Cloud Armor, or Akamai firewalls.`
      },
      {
        question: 'Is CatalystLab SOC 2 Type II and GDPR compliant?',
        badge: 'Enterprise Compliance',
        answer: `Yes. CatalystLab is SOC 2 Type II certified and complies fully with GDPR, CCPA, and ISO 27001 data privacy mandates. All in-transit audit telemetry is encrypted via TLS 1.3, and audit reports are retained strictly according to your workspace retention policies.`
      }
    ]
  },
  {
    id: 'performance',
    label: 'Performance & Edge Vitals',
    description: '42-PoP multi-region latency benchmarks, Core Web Vitals (INP/LCP/CLS), and Sustainable Web carbon footprint modeling.',
    iconName: 'zap',
    items: [
      {
        question: 'How does CatalystLab measure 42-PoP Global Latency and Time-To-First-Byte (TTFB)?',
        badge: '42 Global Edge Points',
        answer: `When you trigger an audit, our distributed mesh dispatches lightweight TCP probes simultaneously from 42 Tier-1 edge data centers across North America, Europe, Asia-Pacific, South America, the Middle East, and Africa.

We measure:
• DNS Lookup Time
• TCP Connection & TLS Handshake Latency
• Time To First Byte (TTFB)
• Edge CDN Cache Hit / Miss Ratios`
      },
      {
        question: 'How does CatalystLab measure Interaction to Next Paint (INP)?',
        badge: 'Next-Gen Core Web Vital',
        answer: `INP replaced FID as Google's official responsiveness metric. CatalystLab combines real-user CrUX field telemetry with synthetic interaction tests that dispatch simulated click, tap, and keyboard events against interactive elements, measuring JavaScript main thread blocking duration and long task delays (>50ms).`
      },
      {
        question: 'What causes DOM hydration bottlenecks and how does CatalystLab detect them?',
        badge: 'SSR / Hydration Profiling',
        answer: `In SSR frameworks like Next.js, Nuxt, and Remix, hydration bottlenecks happen when large component trees must be deserialized and attached to static HTML on the client.

Our DOM Engine measures total DOM tree depth, warns when node count exceeds 1,500 elements, flags excessive DOM re-renders, and tracks client CPU execution time during hydration.`
      },
      {
        question: 'Can I simulate mobile 4G network throttling and low-end CPU devices?',
        badge: 'Mobile 4G Emulation',
        answer: `Yes! You can toggle between Desktop (unthrottled broadband) and Mobile (simulated Moto G4 on a 4G connection: 1.6 Mbps download, 750 Kbps upload, 150ms round-trip latency, and 4x CPU slowdown) to benchmark real-world mobile user experience.`
      },
      {
        question: 'How does CatalystLab calculate the Sustainable Web carbon footprint?',
        badge: 'Manifesto v3 Carbon Formula',
        answer: `Using the Sustainable Web Manifesto v3 standard, our engine calculates total transferred wire bytes (HTML, CSS, JS, images, fonts), checks green hosting verification via the Green Web Foundation database, and computes kilowatt-hours (kWh) and grams of CO₂ emitted per pageview.`
      },
      {
        question: 'Why do CatalystLab performance scores provide deeper insights than standard Lighthouse?',
        badge: 'Multi-Engine Advantage',
        answer: `Standard Lighthouse provides a single local synthetic snapshot. CatalystLab synthesizes 8 distinct engines: 42-region global TTFB, carbon footprint modeling, hydration bottleneck detection, AST bundle weight analysis, and AI search readiness alongside standard Core Web Vitals, delivering a comprehensive production-grade diagnosis.`
      }
    ]
  },
  {
    id: 'api',
    label: 'Developer APIs & White-Label Suite',
    description: 'REST endpoints, API keys (cat_live_...), custom branded PDF reports, and outgoing webhooks.',
    iconName: 'terminal',
    items: [
      {
        question: 'How do I generate a Developer API Key and what endpoints are available?',
        badge: 'REST API v1',
        answer: `You can generate API keys directly in the API Console (/api-docs). We provide REST endpoints for on-demand audits (/api/run-engine, /api/master-audit), site monitoring (/api/monitoring), and batch status checks.`,
        codeSnippet: `curl https://api.catalystlab.tech/v1/engines/health \\
  -H "Authorization: Bearer cat_live_9f830a7d2e..." \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://stripe.com"}'`
      },
      {
        question: 'How does the White-Label reporting suite work for agencies and consultants?',
        badge: 'White-Label Branding',
        answer: `Available on Team ($49) and Enterprise ($99) plans, White-Label allows you to:
• Upload your company agency logo
• Set custom primary brand hex colors
• Remove all CatalystLab branding from generated PDF dossiers and web permalinks
• Serve client-facing reports from custom subdomains (e.g., audits.youragency.com)`
      },
      {
        question: 'What are the API rate limits and bursting allocations?',
        badge: 'API Rate Limits',
        answer: `• Starter ($9/mo): 150 units/day, 60 requests/minute burst.
• Pro ($19/mo): 500 units/day, 120 requests/minute burst.
• Team ($49/mo): 1,500 units/day, 300 requests/minute burst.
• Enterprise ($99/mo): 5,000 units/day, unthrottled dedicated concurrency.`
      },
      {
        question: 'Do you support webhook event signing for secure verification?',
        badge: 'HMAC-SHA256 Signatures',
        answer: `Yes. All outgoing webhooks include an 'X-Catalyst-Signature' header computed with HMAC-SHA256 using your webhook signing secret, allowing your backend to verify payload authenticity and prevent replay attacks.`
      }
    ]
  },
  {
    id: 'privacy',
    label: 'Privacy & Infrastructure',
    description: 'Data retention policies, private cloud runners, SOC 2 compliance, and audit deletion procedures.',
    iconName: 'lock',
    items: [
      {
        question: 'Where are CatalystLab probe runners and backend services hosted?',
        badge: 'Certified Cloud Regions',
        answer: `Our distributed probe mesh is hosted across certified Google Cloud Platform (GCP) and AWS regions in North America (US-East, US-West), Europe (Frankfurt, Dublin), and Asia-Pacific (Tokyo, Singapore), guaranteeing low probe latency and data residency compliance.`
      },
      {
        question: 'How long is audit telemetry retained in the system?',
        badge: 'Retention Policy',
        answer: `• Free Community scans are retained for 30 days.
• Starter ($9/mo) scans are retained for 60 days.
• Pro ($19/mo) scans are retained for 90 days.
• Team ($49/mo) and Enterprise ($99/mo) workspaces retain detailed historical logs for 1 year, with custom purge policies available.`
      },
      {
        question: 'Can I delete my domain’s public audit reports and historical data?',
        badge: 'Data Deletion Rights',
        answer: `Yes. You can permanently delete any audit report or your entire account history directly from your dashboard or by emailing privacy@catalystlab.tech. Deletion requests are executed within 24 hours.`
      },
      {
        question: 'Does CatalystLab inject cookies or track end-users on my audited application?',
        badge: 'Zero User Tracking',
        answer: `No. CatalystLab never installs tracking cookies, telemetry pixels, or invasive browser scripts on your website. Our diagnostic probes act strictly as external synthetic HTTP clients.`
      },
      {
        question: 'How can I prevent unauthorized parties from auditing our internal staging URL?',
        badge: 'Private Domain Shield',
        answer: `You can enable 'Private Domain Mode' in your workspace settings to restrict audit access to authenticated team members only, or protect staging URLs using HTTP Basic Authentication or custom authorization header tokens.`
      }
    ]
  }
];
