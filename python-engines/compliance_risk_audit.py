#!/usr/bin/env python3
import sys, requests, json, re
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def run_compliance_audit(url):
    print(f"\n--- GLOBAL COMPLIANCE & RISK AUDIT (GDPR/CCPA/SOC2) ---")
    print(f"Target: {url}\n")
    
    headers = {'User-Agent': 'CatalystLab-ComplianceScanner/2.0'}
    score = 100
    metrics = {"engine": "compliance_risk_audit.py", "plot1": [], "plot2": [], "plot3": []}
    
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.content, 'html.parser')
    except Exception as e:
        print(f"  [!] CRITICAL: Failed connection. {e}")
        return

    # 1. Cookie Consent & Trackers
    print("[*] 1. CMP (Consent Management Platform) & Trackers...")
    html_content = str(soup).lower()
    cmps = {'OneTrust': 'onetrust', 'Cookiebot': 'cookiebot', 'TrustArc': 'trustarc', 'Osano': 'osano'}
    found_cmp = [name for name, sig in cmps.items() if sig in html_content]
    
    if found_cmp:
        print(f"  [+] PASS: Detected Enterprise CMP: {', '.join(found_cmp)}")
    else:
        print("  [-] FAIL: No standard Consent Management Platform detected. High GDPR risk if using cookies.")
        score -= 20

    # Detect known third-party trackers
    trackers = {'Google Analytics': 'google-analytics.com', 'Meta Pixel': 'connect.facebook.net', 'Hotjar': 'hotjar.com', 'TikTok': 'tiktok.com'}
    found_trackers = [name for name, sig in trackers.items() if sig in html_content]
    if found_trackers:
        print(f"  [~] WARN: Third-party trackers detected: {', '.join(found_trackers)}. Ensure active consent blocking.")
        score -= (len(found_trackers) * 5)
    else:
        print("  [+] PASS: No major third-party tracking scripts found in initial DOM.")

    # 2. Legal Disclosures
    print("\n[*] 2. Privacy & Legal Disclosures...")
    links = soup.find_all('a', href=True)
    privacy_found = any('privacy' in a.text.lower() or 'privacy' in a['href'].lower() for a in links)
    terms_found = any('terms' in a.text.lower() or 'terms' in a['href'].lower() for a in links)
    
    if privacy_found:
        print("  [+] PASS: Privacy Policy link detected.")
    else:
        print("  [-] FAIL: No visible Privacy Policy link found on homepage. Violation of CCPA/GDPR transparency.")
        score -= 15
        
    if terms_found:
        print("  [+] PASS: Terms of Service/Use link detected.")
    else:
        print("  [~] WARN: No Terms of Service link found.")
        score -= 5

    # 3. Form & PII Security
    print("\n[*] 3. PII Collection Security...")
    forms = soup.find_all('form')
    if forms:
        print(f"  [>] Detected {len(forms)} data collection forms.")
        insecure_forms = 0
        for form in forms:
            action = form.get('action', '')
            if action and not action.startswith('https') and not action.startswith('/'):
                insecure_forms += 1
        if insecure_forms > 0:
            print(f"  [-] FAIL: {insecure_forms} forms post to insecure HTTP endpoints. Massive PII breach risk.")
            score -= 30
        else:
            print("  [+] PASS: Form endpoints utilize secure transport.")
    else:
        print("  [+] INFO: No data collection forms found on this page.")

    # 4. Security Headers
    print("\n[*] 4. Data Privacy Headers...")
    headers_to_check = {
        'Referrer-Policy': 'Prevents leaking internal URLs to external sites.',
        'Permissions-Policy': 'Restricts browser API access (camera, mic, geo).'
    }
    for h, desc in headers_to_check.items():
        if h in res.headers:
            print(f"  [+] {h}: Configured")
        else:
            print(f"  [-] {h}: Missing. {desc}")
            score -= 5

    score = max(0, min(100, int(score)))
    print(f"\n=> 🛡️ OVERALL COMPLIANCE SCORE: {score}/100")
    if score >= 85: print("=> 🟢 STATUS: LOW RISK (Strong privacy posture)")
    elif score >= 60: print("=> 🟡 STATUS: MEDIUM RISK (Audit required for trackers & headers)")
    else: print("=> 🔴 STATUS: HIGH RISK (Critical compliance violations detected)")

    metrics["plot1"] = [
        {"subject": "GDPR", "A": score, "fullMark": 100},
        {"subject": "CCPA", "A": score - 5 if not privacy_found else score, "fullMark": 100},
        {"subject": "Security", "A": score, "fullMark": 100}
    ]
    metrics["plot2"] = [{"category": t, "risk": 80} for t in found_trackers] if found_trackers else [{"category": "None", "risk": 0}]
    metrics["plot3"] = [{"name": "Compliant", "value": score}, {"name": "Risk Exposure", "value": 100-score}]

    print("\n---CATALYST_METRICS---")
    print(json.dumps(metrics))

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    run_compliance_audit(sys.argv[1])
