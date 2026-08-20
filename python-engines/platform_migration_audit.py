#!/usr/bin/env python3
import sys, requests, json, re
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def run_migration_audit(url):
    print(f"\n--- PLATFORM MIGRATION & TECH STACK AUDIT ---")
    print(f"Target: {url}\n")
    
    headers = {'User-Agent': 'CatalystLab-StackScanner/2.0'}
    score = 100
    metrics = {"engine": "platform_migration_audit.py", "plot1": [], "plot2": [], "plot3": []}
    
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.content, 'html.parser')
    except Exception as e:
        print(f"  [!] CRITICAL: Fetch failed. {e}")
        return

    # 1. Header Signatures
    print("[*] 1. HTTP Header Stack Signatures...")
    server = res.headers.get('Server', 'Unknown')
    x_powered_by = res.headers.get('X-Powered-By', 'Unknown')
    
    print(f"  [>] Server: {server}")
    if x_powered_by != 'Unknown':
        print(f"  [>] X-Powered-By: {x_powered_by}")
        
    tech_stack = set()
    if 'nginx' in server.lower(): tech_stack.add('Nginx')
    if 'apache' in server.lower(): tech_stack.add('Apache')
    if 'cloudflare' in server.lower(): tech_stack.add('Cloudflare')
    if 'vercel' in server.lower(): tech_stack.add('Vercel')
    if 'next' in x_powered_by.lower(): tech_stack.add('Next.js')
    if 'express' in x_powered_by.lower(): tech_stack.add('Express/Node')
    if 'php' in x_powered_by.lower(): tech_stack.add('PHP')

    # 2. HTML Meta/Script Signatures
    print("\n[*] 2. DOM & Script Fingerprinting...")
    html = res.text.lower()
    
    if 'wp-content' in html or 'wp-includes' in html:
        tech_stack.add('WordPress')
    if 'react' in html or 'data-reactroot' in html:
        tech_stack.add('React')
    if 'vue' in html or 'data-v-' in html:
        tech_stack.add('Vue.js')
    if 'nuxt' in html:
        tech_stack.add('Nuxt.js')
    if 'svelte' in html:
        tech_stack.add('Svelte')
    if 'shopify' in html:
        tech_stack.add('Shopify')
        
    print(f"  [+] Detected Technologies: {', '.join(tech_stack) if tech_stack else 'Static/Unknown'}")

    # 3. Migration Complexity & Lock-in
    print("\n[*] 3. Migration Risk & Lock-in Analysis...")
    if 'WordPress' in tech_stack:
        print("  [-] FAIL: CMS Monolith detected (WordPress). Migration requires database ETL and template rewrites. High Lock-in.")
        score -= 30
    elif 'Shopify' in tech_stack:
        print("  [-] FAIL: SaaS E-Commerce platform (Shopify). Deep data lock-in via proprietary APIs.")
        score -= 40
    elif 'Next.js' in tech_stack and 'Vercel' in tech_stack:
        print("  [~] WARN: Framework/Host coupling (Next.js on Vercel). Migration to raw AWS/GCP may require custom CI/CD.")
        score -= 10
    elif 'React' in tech_stack or 'Vue.js' in tech_stack:
        print("  [+] PASS: Modern SPA/SSG architecture detected. Highly portable via Docker/Static hosting.")
    else:
        print("  [+] PASS: Standard architecture. High portability.")

    score = max(0, min(100, int(score)))
    print(f"\n=> 🔄 OVERALL PORTABILITY SCORE: {score}/100")
    if score >= 85: print("=> 🟢 STATUS: CLOUD NATIVE (Highly portable, vendor-agnostic)")
    elif score >= 60: print("=> 🟡 STATUS: MODERATE LOCK-IN (Requires architectural refactoring to migrate)")
    else: print("=> 🔴 STATUS: SEVERE LOCK-IN (Monolithic or proprietary SaaS platform)")

    metrics["plot1"] = [
        {"tier": "Tier 1 (Static)", "downtime": 5, "data_gb": 10},
        {"tier": "Tier 2 (App)", "downtime": 30, "data_gb": 50},
        {"tier": "Tier 3 (CMS)", "downtime": 120, "data_gb": 200}
    ]
    metrics["plot2"] = [
        {"vendor": "AWS", "lockin": 20},
        {"vendor": "GCP", "lockin": 20},
        {"vendor": "Vercel", "lockin": 50 if 'Vercel' in tech_stack else 10},
        {"vendor": "Shopify", "lockin": 90 if 'Shopify' in tech_stack else 5}
    ]
    metrics["plot3"] = [{"name": t, "match": 100} for t in tech_stack] if tech_stack else [{"name": "Static", "match": 100}]

    print("\n---CATALYST_METRICS---")
    print(json.dumps(metrics))

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    run_migration_audit(sys.argv[1])
