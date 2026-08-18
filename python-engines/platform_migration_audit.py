#!/usr/bin/env python3
"""
Platform Migration Pre-Flight Audit
Automates the analysis of critical SEO, routing, and structural elements 
to ensure a website migration does not destroy organic traffic or functionality.
Checks:
1. HTTP Response Chains (301 vs 302 vs 404)
2. Canonical Tag Integrity
3. Meta Titles & Descriptions
4. Internal Link Health (Basic check)
"""
import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin

def run_migration_audit(url):
    print(f"\n--- PLATFORM MIGRATION RISK AUDIT ---")
    print(f"Target: {url}\n")
    
    headers = {'User-Agent': 'CatalystLab-MigrationBot/1.0'}
    session = requests.Session()
    
    risk_score = 0
    max_risk = 100
    
    print("[*] 1. Analyzing Redirection Chains & Status Codes...")
    try:
        res = session.get(url, headers=headers, allow_redirects=True, timeout=10)
        history = res.history
        
        if history:
            print(f"  [~] Redirects detected ({len(history)} hops):")
            for resp in history:
                print(f"      -> {resp.status_code}: {resp.url}")
                if resp.status_code == 302:
                    print("      [!] HIGH RISK: Found 302 (Temporary) redirect. Migrations MUST use 301 (Permanent) to preserve SEO juice.")
                    risk_score += 20
        else:
            print(f"  [+] PASS: Direct 200 OK. No redirect chains detected.")
            
        print(f"  [>] Final Destination: {res.status_code} {res.url}")
        
    except requests.exceptions.RequestException as e:
        print(f"  [!] CRITICAL: Failed to reach URL. Network error: {e}")
        return

    print("\n[*] 2. Evaluating SEO Meta Preservation...")
    soup = BeautifulSoup(res.content, 'html.parser')
    
    # Title Check
    title = soup.find('title')
    if title and title.text.strip():
        print(f"  [+] PASS: Meta Title found ({len(title.text)} chars).")
    else:
        print("  [-] FAIL: Missing Meta Title. Huge SEO risk post-migration.")
        risk_score += 15

    # Description Check
    desc = soup.find('meta', attrs={'name': 'description'})
    if desc and desc.get('content'):
        print(f"  [+] PASS: Meta Description found.")
    else:
        print("  [-] FAIL: Missing Meta Description.")
        risk_score += 10

    print("\n[*] 3. Validating Canonical Tags (Duplicate Content Prevention)...")
    canonical = soup.find('link', rel='canonical')
    if canonical and canonical.get('href'):
        can_url = canonical.get('href')
        print(f"  [+] PASS: Canonical tag exists -> {can_url}")
        if can_url != res.url:
            print("  [~] WARNING: Canonical URL differs from final destination URL. Verify this is intentional.")
            risk_score += 10
    else:
        print("  [-] FAIL: No Canonical tag found. Risk of duplicate content penalties during domain switch.")
        risk_score += 15

    print("\n[*] 4. Analyzing Internal Link Hygiene (First 50 links)...")
    links = soup.find_all('a', href=True)
    internal_links = []
    base_domain = urlparse(res.url).netloc
    
    for link in links:
        href = link['href']
        if href.startswith('/') or base_domain in href:
            internal_links.append(href)
            
    if len(internal_links) == 0:
        print("  [-] FAIL: No internal links found. Site architecture may be broken.")
        risk_score += 10
    else:
        print(f"  [+] PASS: Found {len(internal_links)} internal links for crawler traversal.")

<<<<<<< HEAD
    print(f"\n=> [METRICS] MIGRATION RISK FACTOR: {risk_score}/{max_risk}")
    if risk_score == 0:
        print("=> [PASS] STATUS: CLEAR FOR MIGRATION. Excellent structural hygiene.")
    elif risk_score < 40:
        print("=> [WARN] STATUS: PROCEED WITH CAUTION. Address warnings before DNS flip.")
    else:
        print("=> [FAIL] STATUS: HIGH RISK. Do not migrate. Fix critical SEO/structural errors first.")
=======
    print(f"\n=> 📊 MIGRATION RISK FACTOR: {risk_score}/{max_risk}")
    if risk_score == 0:
        print("=> 🟢 STATUS: CLEAR FOR MIGRATION. Excellent structural hygiene.")
    elif risk_score < 40:
        print("=> 🟡 STATUS: PROCEED WITH CAUTION. Address warnings before DNS flip.")
    else:
        print("=> 🔴 STATUS: HIGH RISK. Do not migrate. Fix critical SEO/structural errors first.")
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 platform_migration_audit.py <url>")
        sys.exit(1)
    run_migration_audit(sys.argv[1])
