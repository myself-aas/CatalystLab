# CatalystLab Python Diagnostic Engines

This directory contains the advanced backend analytical engines that power the CatalystLab platform. 

## 📦 Products (Core Scanners)

1. **AI Readiness Inspector (`ai_readiness.py`)**
   - Implements checks for `llms.txt` and `/robots.txt` AI agent directives.
   - Evaluates semantic HTML purity for Retrieval-Augmented Generation (RAG).

2. **Eco-Carbon Footprint Audit (`eco_carbon_audit.py`)**
   - Implements the Sustainable Web Design (SWD) model.
   - Estimates CO2e based on global grid averages and payload weight.

3. **Repository Health Scanner (`repo_scanner.py`)**
   - Wraps the GitHub REST API to measure enterprise hygiene (PR velocity, Dependabot, licenses).

## 🎯 Solutions (Workflow Automations)

4. **Platform Migration Audit (`platform_migration_audit.py`)**
   - **Use Case:** "Platform Migrations & Replatforming"
   - Automates pre/post flight checks: verifies 301 vs 302 redirects, canonical tags, and meta preservation to prevent SEO loss during site launches.

5. **AI Search Optimization (`llmo_optimizer.py`)**
   - **Use Case:** "AI Search Optimization (LLMO)"
   - Moves beyond basic readiness to action. Evaluates JSON-LD/Schema.org density, OpenGraph entity tagging, and content-to-HTML ratios to ensure high citation likelihood in Perplexity and ChatGPT.

6. **Compliance Risk Audit (`compliance_risk_audit.py`)**
   - **Use Case:** "Compliance & Risk Mitigation"
   - Automates liability detection: OWASP headers (HSTS, CSP), ADA/WCAG accessibility checks (form labels, alt text coverage), and GDPR/CCPA privacy link/cookie banner presence.

## How to Run

```bash
cd python-engines
pip install -r requirements.txt

# Run a Product Engine
python3 eco_carbon_audit.py https://stripe.com

# Run a Solutions Workflow
python3 llmo_optimizer.py https://openai.com
python3 compliance_risk_audit.py https://apple.com
python3 platform_migration_audit.py https://example.com
```
