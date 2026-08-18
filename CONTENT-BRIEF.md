# Content Brief: Website Health Audit Tool

- **Target Domain**: `https://www.catalystlab.tech/` (Canonical Production Domain)
- **Target Page**: `https://www.catalystlab.tech/health` & Homepage Hub (`/`)

---

## 1. Search Intent
- **Intent Type**: Commercial & Informational (Developers, DevOps engineers, and technical founders evaluating website health, DOM depth, Core Web Vitals, and OWASP security scanners).
- **SERP Format Rewarded**: High-authority guide paired with an interactive on-demand testing tool, comparison tables, actionable CLI commands, and code snippet remediation.
- **Target Audience**: Senior Frontend Engineers, DevOps Leads, Engineering Directors, and Technical SEO Managers. Knowledge level: Intermediate to Advanced.

---

## 2. Competitor Analysis

| # | Competitor / Tool | Key H2 Sections | Est. Words | Score (out of 40) | Main Competitive Gap |
|---|---|---|:---:|:---:|---|
| 1 | Google PageSpeed Insights | Performance Metrics, Opportunities, Diagnostics | ~800 | 28/40 | Zero server security headers, no WCAG accessibility advice, no AI search (`/llms.txt`) radar. |
| 2 | GTmetrix | Performance Score, Structure, Waterfall, History | ~1,200 | 30/40 | Paywalled multi-region testing, lacks DOM tree nesting depth analysis, no carbon emission telemetry. |
| 3 | SecurityHeaders.com | Headers Summary, Missing Headers, Raw Response | ~600 | 25/40 | Only inspects HTTP headers without correlating DOM vulnerabilities or frontend render blocking. |
| 4 | WAVE Web Accessibility | Summary, Details, Documentation, Standards | ~900 | 27/40 | Isolated to WCAG evaluation; no correlation to page load TTFB or Edge CDN latency. |
| 5 | WebPageTest | Filmstrip, Web Vitals, Content Breakdown | ~1,600 | 33/40 | Complex UI, steep learning curve, no automated GitHub Action quality gate for pull requests. |

---

## 3. Content Gaps & Opportunities
- **Topic Gaps**: None of the top 5 competitors analyze `/llms.txt` and LLM crawler indexability alongside DOM nesting depth and OWASP security headers.
- **Depth Gaps**: Existing tools show raw errors without providing drop-in framework configuration fixes (e.g. Next.js `middleware.ts`, Nginx `nginx.conf`, or Express helmet policies).
- **Quality Gaps**: Legacy tools run single-threaded tests from one location; CatalystLab benchmarks edge TTFB across 12 worldwide PoPs simultaneously.

---

## 4. Winning Outline

**H1:** Complete Website Health Audit Tool & 8-Engine Telemetry Guide
**URL Slug:** `/health`
**Target Word Count:** ~2,200 words (Competitor avg: ~1,020 words)

### Outline Structure & Keyword Breakdown

#### H2: What is a Multi-Dimensional Website Health Audit? (FS target)
- **Word Count**: ~300 words
- **Format**: Definition box + 8-pillar checklist
- **Keyword Guidance**: Primary keyword in H2. Mention "website health audit tool" in the first 50 words.
- *Writing Note*: Define website health across DOM structure, security headers, edge latency, accessibility, and AI readiness.

#### H2: 8 Critical Dimensions Measured by CatalystLab
- **Word Count**: ~700 words
- **Format**: Structured breakdown with metrics table
- **Keyword Guidance**: Use secondary keyword "website performance metrics" and "OWASP security audit".
- **H3**: 1. DOM Tree Nesting Depth & Render-Blocking Payloads
- **H3**: 2. Global Edge TTFB Across 12 Worldwide PoPs
- **H3**: 3. AI Search Engine Readiness & `/llms.txt` Verification
- **H3**: 4. OWASP Top 10 Security Headers (CSP, HSTS, X-Frame)
- **H3**: 5. WCAG 2.2 AA Automated Accessibility Standards
- **H3**: 6. Eco-Carbon Footprint & Green Hosting Verification
- **H3**: 7. Public Repository & Git Hygiene Scanning
- **H3**: 8. Framework Migration & Re-platforming Risk

#### H2: How to Run an Instant Health Audit (Step-by-Step)
- **Word Count**: ~350 words
- **Format**: Numbered procedure with interactive terminal embed and cURL command
- **Keyword Guidance**: Secondary keyword "run website health audit".
- *Writing Note*: Include cURL command for terminal users and interactive web input at `https://www.catalystlab.tech/`.

#### H2: Automated CI/CD Quality Gates with GitHub Actions
- **Word Count**: ~450 words
- **Format**: YAML code block + step-by-step workflow explanation
- **Keyword Guidance**: Secondary keyword "automated website health testing CI/CD".
- *Writing Note*: Provide copy-paste GitHub Action workflow targeting `https://www.catalystlab.tech/api/run-engine`.

#### H2: Frequently Asked Questions (FAQ) (FS target)
- **Word Count**: ~400 words
- **Format**: Accordion FAQ list with JSON-LD schema integration
- **H3**: How often should engineering teams run a website health audit?
- **H3**: What is the difference between Lighthouse and CatalystLab?
- **H3**: Why does DOM nesting depth matter for INP (Interaction to Next Paint)?
- **H3**: How does `/llms.txt` help my site rank in AI search engines?

---

## 5. Recommended Meta Tags

**Title**
Website Health Audit Tool: 8-Engine Telemetry | CatalystLab (58 chars)

**Meta Description**
Audit DOM depth, OWASP security headers, 12-PoP edge latency, and AI readiness in seconds. Run a free multi-engine website health scan now. (146 chars)

---

## 6. Unique Angle & Information Gain
Unlike conventional tools that produce isolated performance scores or isolated security grades, this piece presents an integrated **Unified Web Health Index**. It provides proprietary telemetry formulas, terminal execution logs, and automated GitHub Actions scripts that allow developers to convert diagnostic results into automated CI/CD deployment blockers.

---

## 7. E-E-A-T Requirements
- **Author Credentials**: By CatalystLab Core Infrastructure Team (veteran DevOps and distributed systems engineers).
- **Technical Precision**: Real HTTP/3 response headers, exact DOM tree traversal algorithms, and WCAG 2.2 Level AA compliance criteria.
- **Verification**: Verifiable open-source Python telemetry engines and live status timestamps.
- **Security & Privacy**: Clear links to Security Disclosures (`/security`) and Privacy Policy (`/privacy`).

---

## 8. Internal Linking Opportunities
1. **Link 1**: [Global Edge Latency Radar](https://www.catalystlab.tech/latency) – Anchor: "benchmark multi-region edge TTFB"
2. **Link 2**: [AI Search Readiness Inspector](https://www.catalystlab.tech/ai-readiness) – Anchor: "validate /llms.txt for AI search engines"
3. **Link 3**: [OWASP Compliance & Risk Scanner](https://www.catalystlab.tech/compliance) – Anchor: "OWASP Top 10 security headers audit"
4. **Link 4**: [Pro & Enterprise Telemetry Pricing](https://www.catalystlab.tech/pricing) – Anchor: "automated 60-minute health probes"
5. **Link 5**: [Developer API Documentation](https://www.catalystlab.tech/docs) – Anchor: "programmatic telemetry REST API"
