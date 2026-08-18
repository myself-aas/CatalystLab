# CatalystLab Google SEO Execution Plan (`seo-google`)

## 1. Core Objectives & Google Search Alignment
- **Canonical Target Domain**: `https://www.catalystlab.tech/` (Strictly enforced)
- **Objective**: Maximize organic visibility, rich snippet appearance, and indexation across Google Search for high-intent queries related to website health auditing, OWASP security scanning, WCAG accessibility checks, and AI readiness (`/llms.txt`).
- **Target Search Intent**: Informational (technical architecture guides, SEO blogs) and Transactional (on-demand audit tools, Pro/Enterprise SaaS telemetry plans).

## 2. Technical SEO & Indexation
- **Robots.txt & XML Sitemaps**: Ensure all public utility routes (`/`, `/pricing`, `/docs`, `/about`, `/blogs`, `/compare`, `/report`, `/contact`) and blog dossiers (`/reports/:slug`, `/blogs/:slug`) are crawlable. Block sensitive system endpoints (`/api/*`, `/admin/*`).
- **Canonicalization**: Enforce self-referencing canonical tags on all dynamic report permalinks and blog posts to prevent duplicate content penalties.
- **HTTPS & HTTP/3**: Strict TLS 1.3 encryption and fast Edge CDN distribution across 12 global PoPs.

## 3. Structured Data & JSON-LD Implementation
Implement the following schema markup across the application:
- **`SoftwareApplication`**: Applied to the homepage (`/`) for CatalystLab SaaS telemetry engine.
- **`Article`**: Applied to all blog posts (`/blogs/:slug`) and audit report articles (`/reports/:slug`).
- **`BreadcrumbList`**: Applied across documentation (`/docs`), pricing (`/pricing`), and blog pages for hierarchical navigation snippets in Google search results.
- **`FAQPage`**: Applied to pricing and documentation FAQ sections to capture Google's "People Also Ask" accordion visibility.

## 4. Core Web Vitals & Page Experience Targets
- **Largest Contentful Paint (LCP)**: < 1.2s (Optimized hero images, preloaded fonts, and server-side rendering).
- **Interaction to Next Paint (INP)**: < 150ms (Optimized React event handlers and lightweight state management).
- **Cumulative Layout Shift (CLS)**: 0.00 (Reserved bounding boxes for dynamic dashboard widgets and charts).
- **Time to First Byte (TTFB)**: < 200ms (Edge caching and optimized Express/Vite server configuration).

## 5. E-E-A-T Signal Optimization
- **Experience**: Showcase real telemetry execution logs, live audit results, and open-source diagnostic python scripts.
- **Expertise**: Author bios, technical credentials, and rigorous 10-dimension evaluation methodology (`/about`).
- **Authoritativeness**: High-value backlinks from GitHub repositories, developer newsletters, and SecOps communities.
- **Trustworthiness**: Transparent pricing, 99.99% uptime SLA, verified security disclosure page (`/security`), and privacy policy (`/privacy`).
