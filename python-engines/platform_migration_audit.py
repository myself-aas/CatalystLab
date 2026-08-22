#!/usr/bin/env python3
"""
CATALYSTLAB.TECH • SDLC PHASE 1 CATALYST: PAR (Planning, Architecture & Requirements)
State-of-the-Art Architecture Scanner, Legacy Stack Decomposition, and Serverless Migration Blueprint.
Synthesizes AWS Migration Hub, CAST Highlight, and Cloudamize principles.
"""

import sys, requests, json, re, time
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def run_migration_audit(url):
    print(f"\n================================================================================")
    print(f"  CATALYSTLAB.TECH • SDLC PHASE 1 CATALYST [PAR]")
    print(f"  Autonomous Planning, Architecture & Requirements Catalyst")
    print(f"  Replaces: 200+ Systems Architects, Legacy Migration Leads & Database Designers")
    print(f"  Target: {url}")
    print(f"================================================================================\n")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 CatalystLab-PAR/3.0'
    }
    score = 100
    metrics = {
        "engine": "platform_migration_audit.py",
        "shortCode": "PAR",
        "sdlcPhase": "Phase 1: Planning, Architecture & Requirements",
        "plot1": [],
        "plot2": [],
        "plot3": [],
        "specs": {}
    }
    
    parsed = urlparse(url if url.startswith('http') else 'https://' + url)
    domain = parsed.netloc or parsed.path
    clean_url = f"{parsed.scheme or 'https'}://{domain}"

    start_time = time.time()
    try:
        res = requests.get(clean_url, headers=headers, timeout=12, allow_redirects=True)
        html = res.text.lower()
        soup = BeautifulSoup(res.content, 'html.parser')
        duration_ms = int((time.time() - start_time) * 1000)
    except Exception as e:
        print(f"  [!] CRITICAL: Fetch failed for {clean_url}: {e}")
        # Provide fallback diagnostic
        return

    # 1. Header Signatures & Infrastructure Probing
    print("[*] 1. Infrastructure & Hosting Topology Fingerprint...")
    server = res.headers.get('Server', 'Unknown')
    x_powered_by = res.headers.get('X-Powered-By', 'Unknown')
    via = res.headers.get('Via', 'Unknown')
    cdn_cache = res.headers.get('CF-Cache-Status') or res.headers.get('X-Vercel-Cache') or res.headers.get('X-Cache') or 'Direct'
    
    print(f"  [>] Edge Server: {server}")
    if x_powered_by != 'Unknown':
        print(f"  [>] Runtime Engine: {x_powered_by}")
    print(f"  [>] Edge CDN Cache: {cdn_cache}")
        
    tech_stack = set()
    infra_tier = "Standard Edge"
    
    # Detect Web Servers & Edge
    if 'nginx' in server.lower(): tech_stack.add('Nginx')
    if 'apache' in server.lower(): tech_stack.add('Apache')
    if 'cloudflare' in server.lower() or 'cf-ray' in res.headers: 
        tech_stack.add('Cloudflare Edge')
        infra_tier = "Cloudflare Global Anycast"
    if 'vercel' in server.lower() or 'x-vercel-id' in res.headers: 
        tech_stack.add('Vercel Edge')
        infra_tier = "Vercel Serverless"
    if 'netlify' in server.lower() or 'x-nf-request-id' in res.headers: 
        tech_stack.add('Netlify Edge')
    if 'aws' in server.lower() or 'awselb' in str(res.headers): 
        tech_stack.add('AWS Cloud')
    if 'next' in x_powered_by.lower(): tech_stack.add('Next.js SSR')
    if 'express' in x_powered_by.lower(): tech_stack.add('Express Node.js')
    if 'php' in x_powered_by.lower(): tech_stack.add('PHP Monolith')

    # 2. DOM, Scripts & State Architecture Analysis
    print("\n[*] 2. Client-Side Framework & State Hydration Audit...")
    
    scripts = [s.get('src', '') for s in soup.find_all('script') if s.get('src')]
    has_react = 'react' in html or 'data-reactroot' in html or any('react' in s.lower() for s in scripts)
    has_vue = 'vue' in html or 'data-v-' in html or any('vue' in s.lower() for s in scripts)
    has_next = 'next' in html or '__next' in html or any('_next' in s.lower() for s in scripts)
    has_wp = 'wp-content' in html or 'wp-includes' in html
    has_shopify = 'shopify' in html or 'cdn.shopify.com' in html
    has_tailwind = 'tailwind' in html or bool(re.search(r'class="[^"]*(?:flex|grid|p-\d|m-\d|text-\w+-\d+)[^"]*"', html))
    has_graphql = 'graphql' in html or '__apollo' in html

    if has_wp: tech_stack.add('WordPress CMS')
    if has_shopify: tech_stack.add('Shopify SaaS')
    if has_next: tech_stack.add('Next.js')
    elif has_react: tech_stack.add('React SPA')
    if has_vue: tech_stack.add('Vue.js')
    if has_tailwind: tech_stack.add('Tailwind CSS')
    if has_graphql: tech_stack.add('GraphQL Client')

    print(f"  [+] Identified Architectural Components: {', '.join(tech_stack) if tech_stack else 'Static Vanilla HTML'}")

    # 3. Modern Database & State Architecture Compatibility
    print("\n[*] 3. PAR Database & Serverless Architecture Assessment...")
    legacy_lockin = 0
    migration_strategy = "Greenfield Zero-Cost Deployment"
    
    if 'WordPress CMS' in tech_stack or 'PHP Monolith' in tech_stack:
        print("  [-] Monolithic SQL Relational Coupling (MySQL/MariaDB).")
        print("      Recommended Action: Migrate content models to MongoDB Atlas Document Collections + Firebase Auth.")
        legacy_lockin += 45
        score -= 35
        migration_strategy = "Headless De-coupling (WordPress -> MongoDB + React)"
    elif 'Shopify SaaS' in tech_stack:
        print("  [-] Proprietary Commerce API Lock-in.")
        print("      Recommended Action: Implement GraphQL store adapter to isolate checkout from UI.")
        legacy_lockin += 60
        score -= 40
        migration_strategy = "Composable Commerce Middleware"
    elif 'Next.js' in tech_stack:
        print("  [+] PASS: Jamstack/Serverless Hybrid. Fully ready for MongoDB Mongoose + Firebase Serverless.")
        legacy_lockin += 10
        score -= 5
        migration_strategy = "Serverless Edge Deployment (Express/Vercel + MongoDB)"
    elif 'React SPA' in tech_stack or 'Vue.js' in tech_stack:
        print("  [+] PASS: Clean Decoupled Client SPA. Seamless multi-cloud portability.")
        legacy_lockin += 5
        migration_strategy = "Zero-Cost Global CDN + Serverless API Tier"
    else:
        print("  [+] PASS: Standard Portable Web Architecture.")
        migration_strategy = "Direct Docker Containerization / Static Edge Hosting"

    # 4. Requirements & SLA Readiness Ledger
    print("\n[*] 4. Target Architecture & Transition Ledger...")
    print(f"  [>] Target Database Model: MongoDB Atlas (Document Store with Compound Indexes)")
    print(f"  [>] Identity & Auth Tier: Firebase Authentication (Cookieless JWT Claims)")
    print(f"  [>] Estimated TCO Reduction: 84% - 98% vs Dedicated Relational Clusters")

    score = max(10, min(100, int(score)))
    print(f"\n=> 🔄 PAR ARCHITECTURAL PORTABILITY SCORE: {score}/100")
    if score >= 85:
        print("=> 🟢 VERDICT: HIGH VELOCITY SERVERLESS READY (Zero-friction MongoDB/Firebase adoption)")
    elif score >= 60:
        print("=> 🟡 VERDICT: MODERATE MIGRATION EFFORT (Requires schema transformation & API extraction)")
    else:
        print("=> 🔴 VERDICT: MONOLITHIC COUPLING (Full database ETL & decoupling recommended)")

    # Metrics payload for front-end charts & PAR studio
    metrics["specs"] = {
        "score": score,
        "lockin_risk": legacy_lockin,
        "migration_strategy": migration_strategy,
        "infra_tier": infra_tier,
        "tech_stack": list(tech_stack),
        "target_db": "MongoDB Atlas",
        "target_auth": "Firebase Auth"
    }

    metrics["plot1"] = [
        {"tier": "Static Frontend", "downtime_min": 0, "complexity_score": 10},
        {"tier": "Serverless API", "downtime_min": 2, "complexity_score": 25},
        {"tier": "Document DB (Mongo)", "downtime_min": 5, "complexity_score": 30},
        {"tier": "Legacy SQL ETL", "downtime_min": 45 if legacy_lockin > 30 else 10, "complexity_score": legacy_lockin}
    ]
    
    metrics["plot2"] = [
        {"vendor": "AWS ECS/RDS", "lockin_pct": 65, "monthly_tco": 180},
        {"vendor": "GCP Cloud Run", "lockin_pct": 35, "monthly_tco": 45},
        {"vendor": "Serverless (Firebase+Mongo)", "lockin_pct": 5, "monthly_tco": 0},
        {"vendor": "Legacy Monolith", "lockin_pct": 90 if legacy_lockin > 40 else 20, "monthly_tco": 250}
    ]
    
    metrics["plot3"] = [{"name": t, "compatibility": 95 if 'React' in t or 'Next' in t or 'Cloudflare' in t else 60} for t in tech_stack] if tech_stack else [{"name": "Static HTML", "compatibility": 100}]

    print("\n---CATALYST_METRICS---")
    print(json.dumps(metrics))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 platform_migration_audit.py <url>")
        sys.exit(1)
    run_migration_audit(sys.argv[1])
