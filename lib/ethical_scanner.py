#!/usr/bin/env python3
import sys, json, urllib.request
from html.parser import HTMLParser

class EthicalParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.trackers = 0
        self.third_party_fonts = 0
        self.dark_patterns = 0
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        tag_lower = tag.lower()
        if tag_lower == 'script':
            src = attrs_dict.get('src', '').lower()
            id_attr = attrs_dict.get('id', '').lower()
            sigs = ['analytics', 'gtm', 'pixel', 'hotjar', 'mixpanel', 'segment', 'amplitude', 'clarity']
            if any(sig in src or sig in id_attr for sig in sigs):
                self.trackers += 1
        elif tag_lower == 'link':
            href = attrs_dict.get('href', '').lower()
            if 'fonts.googleapis.com' in href or 'fonts.gstatic.com' in href:
                self.third_party_fonts += 1
        elif tag_lower == 'input':
            style = attrs_dict.get('style', '').lower()
            if 'opacity: 0' in style or 'opacity:0' in style or 'display: none' in style or 'display:none' in style:
                pass

def scan_ethical_principles(url):
    results = {"url": url, "overall_ethical_score": 100, "principles": {}}
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; WorldClass-EthicalScanner/4.0)'})
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read()
            html_text = html.decode('utf-8', errors='ignore')
            final_url = response.url
            resp_headers = {k.lower(): v for k, v in response.headers.items()}
    except Exception as e:
        return {"error": str(e), "overall_ethical_score": 0}

    parser = EthicalParser()
    try: parser.feed(html_text)
    except: pass

    # Privacy
    p1_issues, p1_score = [], 100
    if parser.trackers > 0:
        p1_issues.append({"check": "Aggressive Tracking", "status": "warning", "message": f"Found {parser.trackers} third-party telemetry/tracking scripts. Consider minimal data collection."})
        p1_score -= min(40, parser.trackers * 10)
    else:
        p1_issues.append({"check": "Aggressive Tracking", "status": "pass", "message": "No invasive third-party trackers detected. Great for user privacy."})
        
    if parser.third_party_fonts > 0:
        p1_issues.append({"check": "Third-Party Fonts (GDPR)", "status": "info", "message": "Third-party fonts detected. Consider self-hosting to prevent IP leakage (GDPR compliance)."})
        p1_score -= 5
        
    results["principles"]["privacy"] = {"title": "Privacy & Autonomy", "score": max(0, p1_score), "issues": p1_issues}

    # Security
    p2_issues, p2_score = [], 100
    if not final_url.startswith('https://'):
        p2_issues.append({"check": "HTTPS Encryption", "status": "fail", "message": "Insecure connection. HTTPS is mandatory for user safety."})
        p2_score -= 50
    else:
        p2_issues.append({"check": "HTTPS Encryption", "status": "pass", "message": "State-of-the-art secure TLS connection active."})
        
    if 'permissions-policy' not in resp_headers:
        p2_issues.append({"check": "Permissions-Policy", "status": "info", "message": "Add Permissions-Policy to explicitly declare and restrict API capabilities (e.g., camera, microphone)."})
        p2_score -= 5
    results["principles"]["security"] = {"title": "Security & Safety", "score": max(0, p2_score), "issues": p2_issues}
    
    # Sustainability
    p3_issues, p3_score = [], 100
    html_size_kb = len(html) / 1024.0
    co2_estimate = html_size_kb * 0.5 / 1024 # Very rough estimate: 0.5g CO2 per MB transferred
    
    if html_size_kb > 2000:
        p3_issues.append({"check": "Carbon Footprint", "status": "fail", "message": f"Massive payload ({html_size_kb:.1f}KB). Est. ~{co2_estimate:.2f}g CO2 per view. Severely impacts web sustainability."})
        p3_score -= 30
    elif html_size_kb > 500:
        p3_issues.append({"check": "Carbon Footprint", "status": "warning", "message": f"Large payload ({html_size_kb:.1f}KB). Est. ~{co2_estimate:.2f}g CO2 per view. Optimization recommended."})
        p3_score -= 10
    else:
        p3_issues.append({"check": "Carbon Footprint", "status": "pass", "message": f"Highly efficient payload ({html_size_kb:.1f}KB). Est. ~{co2_estimate:.3f}g CO2 per view. Excellent sustainability."})
        
    results["principles"]["sustainability"] = {"title": "Web Sustainability", "score": max(0, p3_score), "issues": p3_issues}

    scores = [s['score'] for s in results["principles"].values()]
    results["overall_ethical_score"] = round(sum(scores) / len(scores), 1) if scores else 100
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "URL required"}))
        sys.exit(1)
    print(json.dumps(scan_ethical_principles(sys.argv[1]), indent=2))
