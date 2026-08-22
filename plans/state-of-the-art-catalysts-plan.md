# Plan: State-of-the-Art 8-Catalyst SDLC & Telemetry Platform Upgrade

**Branch**: `feat/sota-catalysts-pipeline`  
**Status**: Proposed / Active  
**Design Reference**: Plausible Analytics (`plausible.io`) Lightweight Ingestion, Zero-Cookie Tracking, Custom Domain Proxies & Real-Time Aggregation

---

## 1. Goal

Transform all 8 CatalystLab SDLC Catalysts into state-of-the-art, industry-leading automated audit and real-time telemetry engines by synthesizing competitor capabilities (Snyk, SonarQube, Lighthouse, Plausible, CO2.js, Datadog RUM, Sentry, SecurityHeaders, Perplexity AI), resolving real-world developer pain points from developer forums (Reddit, StackOverflow, Quora, GitHub Discussions), upgrading the Python telemetry engines, and integrating a unified Plausible-style tracking, GitHub Action CI/CD, and custom-domain proxy pipeline into the User Dashboard.

---

## 2. Competitive Intelligence & Community Pain Points

| Catalyst | Top Competitors | Forum & Community Pain Points (Reddit, Quora, GitHub) | State-of-the-Art Solution in CatalystLab |
| :--- | :--- | :--- | :--- |
| **1. PAR Catalyst** (*Planning, Architecture & Requirements*) | Cloudamize, CAST Highlight, AWS Migration Hub | *"Migrations fail because of hidden circular dependencies, vendor lock-in, and unpredictable egress/compute costs without a clear step-by-step transition ledger."* | Automated legacy tech stack scanner, serverless MongoDB + Firebase migration roadmap, zero-cost blueprint generator, risk scoring. |
| **2. Code Quality & Repo** (*Static SecOps & Git Hygiene*) | Snyk Code, SonarQube, GitGuardian, TruffleHog | *"Developers hate slow CI gates, high false-positive noise on secret scanning, and cryptic warnings without automated autofix diffs."* | Multi-pattern high-entropy secret detection, git commit velocity/orphan branch scanner, SAST vulnerability rule matrix, zero-dependency Python execution. |
| **3. Build & Eco Efficiency** (*Carbon Model & Green Web*) | Website Carbon, EcoPing, Eco-Index, CO2.js | *"Carbon scores are often arbitrary formulas that don't account for green hosting certifications, CDN caching efficiency, or modern payload compression (Brotli/AVIF)."* | Sustainable Web Design (SWD v4) methodology, Green Web Foundation API lookup, payload byte breakdown, clean energy grid intensity factor. |
| **4. Testing & Core Web Vitals** (*DOM & Performance*) | Google PageSpeed, WebPageTest, SpeedCurve | *"Lab data (Lighthouse) diverges wildly from Real User Monitoring (RUM). INP is hard to debug without DOM subtree node inspection."* | Hybrid Synthetic + RUM pipeline via Plausible-style lightweight snippet, DOM depth/complexity tree analyzer, INP/LCP/CLS real-world benchmarking. |
| **5. Release & Edge Latency** (*12 Global PoPs Radar*) | Cloudflare Radar, KeyCDN Speed Test, Fastly | *"Single-region testing gives false confidence; DNS resolution issues and slow TLS 1.3 handshakes on regional edge nodes remain invisible until users complain."* | 12 global simulated edge PoPs (US, EU, APAC, LATAM, MEA), DNS lookup breakdown, TCP connect + TLS handshake latency, HTTP/3 QUIC validation. |
| **6. DevSecOps & Compliance** (*OWASP & Security Headers*) | SecurityHeaders.com, Mozilla Observatory, Snyk | *"CSP policies break inline scripts and third-party widgets; developers struggle to write strict CSP with nonces or hashes without breaking production."* | Comprehensive CSP syntax and directive validator, OWASP Top 10 header auditor, HSTS preload compliance, WCAG 2.2 AA accessibility contrast scanner. |
| **7. Operations & AI Readiness** (*llms.txt & Crawler Bot Audit*) | Cloudflare AI Crawler Protection, OpenAI Bot Docs | *"AI crawlers (GPTBot, ClaudeBot, PerplexityBot) either scrape entire sites causing bandwidth spikes or get blocked completely with no structured `llms.txt` alternative."* | `llms.txt` and `llms-full.txt` standard specification validator, AI crawler user-agent permission analyzer, markdown-readability parser, token efficiency metric. |
| **8. Evolution & LLMO Search** (*Generative Search Engine Opt*) | Peec AI, Authoritas, Semrush AI Search | *"Nobody knows why their brand is cited or ignored in ChatGPT/Perplexity search answers; schema markup is often broken or missing entity disambiguation."* | Schema.org JSON-LD graph entity extractor, LLM citation probability model, semantic entity clarity index, prompt-readiness score. |

---

## 3. Plausible-Style Pipeline Architecture

Following the design principles of **Plausible Analytics (`plausible.io`)**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         PLAUSIBLE-STYLE PIPELINE                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [User Website / Web App]                                                │
│         │                                                                │
│         ├─► <script defer data-domain="app.com"                          │
│         │          src="https://catalystlab.io/js/catalyst.js"></script> │
│         │   (Ultra-lightweight <1.2KB, Zero-Cookie, No PII)             │
│         │                                                                │
│         ▼                                                                │
│  [Custom Domain Proxy (Optional)]                                        │
│     ├── Cloudflare Worker / Vercel Edge / Nginx / Next.js Rewrite       │
│     └── Eliminates Ad-blocker loss, 100% 1st-party telemetry             │
│         │                                                                │
│         ▼                                                                │
│  [CatalystLab Ingest API (/api/telemetry/event)]                         │
│     ├── Daily Salted Hash (Zero PII persistence)                         │
│     ├── Real-time Ingestion Router                                       │
│     └── Event Dispatcher to 8 Catalyst Processors                        │
│         │                                                                │
│         ├──────────────────────────┬─────────────────────────────┐       │
│         ▼                          ▼                             ▼       │
│  [Python 3.11 Engines]     [Live SSE / WS Stream]     [Alerts & Webhooks]│
│  - PAR Migration Model     - Real-Time Active Users   - Slack, Discord   │
│  - Static Code Scanner     - Live INP/LCP Metrics     - GitHub PR Status │
│  - Eco Carbon Model (SWD)  - Error/Vulnerability Logs - Email Summaries  │
│  - LLMO Entity Graph       - Geo-Map Ingestion                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Vertical Implementation Slices

### Slice 1: Plausible-Style Telemetry Ingestion Pipeline & Client Script Extensions
- **Actor**: Web developer / site owner.
- **Trigger**: Script embedded on target domain or custom proxy triggered.
- **Observable Outcome**: Instant zero-cookie telemetry ingestion `<1.2KB` sending pageviews, Core Web Vitals (LCP, INP, CLS), and security violation reports to `/api/telemetry/event`.
- **Production Path**: `public/js/catalyst.js` -> `/api/telemetry/event` (Express + Firestore) -> Dashboard Real-Time View.
- **Class**: Behavior change.
- **Delivery**: Trunk-based PR.

### Slice 2: PAR Catalyst (Phase 1) State-of-the-Art Upgrade
- **Actor**: Lead Software Architect / Engineering Manager.
- **Trigger**: Run PAR audit on legacy site or repository URL.
- **Observable Outcome**: Comprehensive migration risk score, database transformation blueprint (SQL to MongoDB Atlas), dependency risk matrix, and estimated cloud TCO savings.
- **Production Path**: `python-engines/platform_migration_audit.py` -> `/api/engines/par` -> PAR Interactive Studio UI.
- **Class**: Behavior change.
- **Delivery**: Trunk-based PR.

### Slice 3: Code Quality & Repo Catalyst (Phase 2) State-of-the-Art Upgrade
- **Actor**: DevSecOps Engineer / Fullstack Developer.
- **Trigger**: Run Repo Scanner on GitHub/GitLab URL or local codebase.
- **Observable Outcome**: Shannon entropy secret scanning (AWS, Stripe, OpenAI, GitHub tokens), git commit churn analysis, orphan branch detector, and actionable remediation diffs.
- **Production Path**: `python-engines/repo_scanner.py` -> `/api/engines/repo-scanner` -> Code Quality UI.
- **Class**: Behavior change.
- **Delivery**: Trunk-based PR.

### Slice 4: Build & Eco Efficiency Catalyst (Phase 3) State-of-the-Art Upgrade
- **Actor**: Sustainability Officer / Frontend Lead.
- **Trigger**: Run Eco Carbon Audit on target URL.
- **Observable Outcome**: SWD v4 carbon calculation per visit (grams CO2e), Green Web Foundation hosting check, asset weight waterfall (JS, CSS, Media, Fonts), and renewable energy rating (A+ to F).
- **Production Path**: `python-engines/eco_carbon_audit.py` -> `/api/engines/eco-carbon` -> Eco Audit UI.
- **Class**: Behavior change.
- **Delivery**: Trunk-based PR.

### Slice 5: Testing & Core Web Vitals Catalyst (Phase 4) State-of-the-Art Upgrade
- **Actor**: QA Engineer / Performance Lead.
- **Trigger**: Run Website Health Audit or view real-time RUM feed.
- **Observable Outcome**: DOM tree depth and node count breakdown, INP interaction bottlenecks, LCP element identification, CLS shift clusters, and TTFB server response benchmark.
- **Production Path**: `python-engines/website_health.py` -> `/api/engines/health` -> Website Health UI.
- **Class**: Behavior change.
- **Delivery**: Trunk-based PR.

### Slice 6: Release & Edge Latency Catalyst (Phase 5) State-of-the-Art Upgrade
- **Actor**: Site Reliability Engineer (SRE) / Infrastructure Lead.
- **Trigger**: Run Edge Latency Audit on domain.
- **Observable Outcome**: Global 12 PoPs TTFB radar, DNS resolution times, TLS 1.3 handshake benchmarks, HTTP/2 & HTTP/3 QUIC protocol verification, and CDN provider detection.
- **Production Path**: `python-engines/edge_latency.py` -> `/api/engines/latency` -> Edge Latency UI.
- **Class**: Behavior change.
- **Delivery**: Trunk-based PR.

### Slice 7: DevSecOps & Compliance Catalyst (Phase 6) State-of-the-Art Upgrade
- **Actor**: Security & Compliance Auditor.
- **Trigger**: Run Compliance & Security Audit on URL.
- **Observable Outcome**: OWASP Top 10 header analysis (CSP, HSTS, X-Frame-Options, Permissions-Policy), Cookie security flags (Secure, HttpOnly, SameSite), and WCAG 2.2 AA contrast compliance check.
- **Production Path**: `python-engines/compliance_risk_audit.py` -> `/api/engines/compliance` -> DevSecOps UI.
- **Class**: Behavior change.
- **Delivery**: Trunk-based PR.

### Slice 8: Operations & AI Readiness Catalyst (Phase 7) State-of-the-Art Upgrade
- **Actor**: AI Integrations Engineer / Technical Product Owner.
- **Trigger**: Run AI Readiness Audit on URL.
- **Observable Outcome**: `/llms.txt` and `/llms-full.txt` verification, robots.txt crawler access matrix (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), markdown payload clean ratio, and token density.
- **Production Path**: `python-engines/ai_readiness.py` -> `/api/engines/ai-readiness` -> AI Readiness UI.
- **Class**: Behavior change.
- **Delivery**: Trunk-based PR.

### Slice 9: Evolution & LLMO Search Catalyst (Phase 8) State-of-the-Art Upgrade
- **Actor**: Growth Engineer / Modern SEO Specialist.
- **Trigger**: Run LLMO Optimizer Audit on domain.
- **Observable Outcome**: Schema.org JSON-LD entity graph validation, generative search citeability score, semantic content structure score, and brand entity disambiguation radar.
- **Production Path**: `python-engines/llmo_optimizer.py` -> `/api/engines/llmo` -> LLMO Optimizer UI.
- **Class**: Behavior change.
- **Delivery**: Trunk-based PR.

### Slice 10: Real-Time Dashboard Integration, Webhooks & GitHub Action
- **Actor**: Any authenticated user / developer.
- **Trigger**: Configure GitHub workflow, webhook alerts, or custom proxy.
- **Observable Outcome**: Automated CI/CD audit runner via GitHub Action, Slack/Discord/Email notifications on metric regressions or SLA breaches, and real-time live visitor & telemetry visualizer.
- **Production Path**: `.github/workflows/catalystlab-audit.yml` -> Dashboard Webhook Settings -> Real-Time Telemetry Component.
- **Class**: Behavior change.
- **Delivery**: Trunk-based PR.

---

## 5. Pre-PR Quality Gate & Verification

1. All Python scripts executable directly via CLI (`python3 python-engines/<script>.py <url> --json`) with standardized JSON envelope output.
2. Server API routes proxying Python engines with input validation and fallback mocks if Python subprocess is unavailable.
3. TypeScript compiler (`npm run lint` / `tsc --noEmit`) and Vite build (`npm run build`) passing with zero errors.
4. UI components responsive across mobile, tablet, and desktop viewports with WCAG AA compliance.
