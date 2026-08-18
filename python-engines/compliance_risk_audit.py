#!/usr/bin/env python3
"""
Compliance & Risk Mitigation Workflow
Automates the detection of legal, privacy, and security liabilities.
Checks:
1. OWASP Security Headers (HSTS, CSP, X-Frame-Options)
2. GDPR/CCPA Privacy Policy & Cookie Banner presence
3. WCAG Accessibility Basics (Alt text coverage, form labels)
"""
import sys
import requests
from bs4 import BeautifulSoup
import re

def run_compliance_audit(url):
    print(f"\n--- COMPLIANCE & RISK MITIGATION AUDIT ---")
    print(f"Target: {url}\n")
    
    headers = {'User-Agent': 'CatalystLab-ComplianceScanner/1.0'}
    
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.content, 'html.parser')
    except Exception as e:
        print(f"  [!] Failed to fetch URL: {e}")
        return

    risk_count = 0
    
    print("[*] 1. Auditing OWASP Security Headers (InfoSec Compliance)...")
    res_headers = res.headers
    
    sec_headers = {
        'Strict-Transport-Security': 'HSTS prevents downgrade attacks.',
        'Content-Security-Policy': 'CSP prevents Cross-Site Scripting (XSS).',
        'X-Frame-Options': 'Prevents Clickjacking.'
    }
    
    for h, desc in sec_headers.items():
        if h in res_headers:
            print(f"  [+] PASS: {h} is present.")
        else:
            print(f"  [-] FAIL: Missing {h}. {desc}")
            risk_count += 1

    print("\n[*] 2. Auditing Privacy & Consent (GDPR/CCPA Risk)...")
    # Search for privacy policy link
    links = soup.find_all('a', href=True)
    privacy_found = False
    for link in links:
        if re.search(r'privacy|policy|legal|terms', link.text, re.IGNORECASE):
            privacy_found = True
            break
            
    if privacy_found:
        print("  [+] PASS: Detected links to Privacy Policy / Legal terms.")
    else:
        print("  [-] FAIL: No visible link to a Privacy Policy found. Major GDPR/CCPA risk.")
        risk_count += 1
        
    # Search for cookie consent mechanisms (heuristics based on class/id names)
    cookie_banner = soup.find(lambda tag: tag.has_attr('id') and 'cookie' in tag['id'].lower()) or \
                    soup.find(lambda tag: tag.has_attr('class') and any('cookie' in c.lower() for c in tag.get('class', []))) or \
                    soup.find(lambda tag: tag.has_attr('id') and 'consent' in tag['id'].lower())
                    
    if cookie_banner:
        print("  [+] PASS: Possible Cookie Consent / CMP banner detected in DOM.")
    else:
        print("  [~] WARNING: No obvious Cookie Consent HTML detected. Ensure a CMP script is loading asynchronously.")

    print("\n[*] 3. Auditing WCAG Accessibility (ADA Legal Risk)...")
    images = soup.find_all('img')
    if not images:
        print("  [~] No images found to test.")
    else:
        missing_alt = [img for img in images if not img.has_attr('alt') or img['alt'].strip() == '']
        if missing_alt:
            percent_missing = (len(missing_alt) / len(images)) * 100
            print(f"  [-] FAIL: {len(missing_alt)}/{len(images)} images ({percent_missing:.1f}%) are missing 'alt' text.")
            print("      -> ADA compliance failure. Screen readers cannot describe these images.")
            risk_count += 1
        else:
            print(f"  [+] PASS: 100% Image Alt Text coverage ({len(images)} images).")
            
    # Basic Form Label Check
    forms = soup.find_all('form')
    if forms:
        inputs = soup.find_all('input')
        unlabeled = 0
        for inp in inputs:
            # Skip hidden inputs or buttons
            if inp.get('type') in ['hidden', 'submit', 'button']:
                continue
            # Check if it has an aria-label or an associated <label>
            if not inp.get('aria-label') and not soup.find('label', attrs={'for': inp.get('id')}):
                unlabeled += 1
        if unlabeled > 0:
            print(f"  [-] FAIL: Found {unlabeled} form inputs missing <label> tags or aria-labels.")
            risk_count += 1
        else:
            print(f"  [+] PASS: Form inputs are correctly labeled for screen readers.")
            
    print(f"\n=> ⚖️ TOTAL IDENTIFIED LIABILITIES: {risk_count}")
    if risk_count == 0:
        print("=> 🟢 STATUS: COMPLIANT. Low legal and security risk.")
    elif risk_count <= 2:
        print("=> 🟡 STATUS: WARNING. Address missing headers or alt text to prevent audit failures.")
    else:
        print("=> 🔴 STATUS: HIGH LIABILITY. Immediate remediation required to prevent fines or breaches.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 compliance_risk_audit.py <url>")
        sys.exit(1)
    run_compliance_audit(sys.argv[1])
