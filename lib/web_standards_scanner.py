#!/usr/bin/env python3
import sys, json, urllib.request
from html.parser import HTMLParser

class WebStandardsParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.depth = 0
        self.max_depth = 0
        self.obsolete_tags = 0
        self.inline_styles = 0
        self.img_no_dims = 0
        self.has_doctype = False

    def handle_decl(self, decl):
        if 'html' in decl.lower():
            self.has_doctype = True

    def handle_starttag(self, tag, attrs):
        self.depth += 1
        if self.depth > self.max_depth:
            self.max_depth = self.depth
            
        attrs_dict = dict(attrs)
        obsolete = {'applet', 'bgsound', 'dir', 'frame', 'frameset', 'noframes', 'isindex', 'keygen', 'listing', 'menuitem', 'multicol', 'nextid', 'param', 'spacer', 'strike', 'tt', 'xmp', 'center', 'font', 'marquee', 'blink'}
        if tag.lower() in obsolete:
            self.obsolete_tags += 1
            
        if 'style' in attrs_dict:
            self.inline_styles += 1
            
        if tag.lower() == 'img':
            if not attrs_dict.get('width') or not attrs_dict.get('height'):
                self.img_no_dims += 1

    def handle_endtag(self, tag):
        self.depth -= 1

def scan_web_standards(url):
    results = {"url": url, "overall_web_standards_score": 100, "specifications": {}}
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; WorldClass-WebStandardsScanner/4.0)'})
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8', errors='ignore')
            resp_headers = {k.lower(): v for k, v in response.headers.items()}
    except Exception as e:
        return {"error": str(e), "overall_web_standards_score": 0}

    parser = WebStandardsParser()
    try: parser.feed(html)
    except: pass

    # 1. HTML Living Standard
    s1_issues, s1_score = [], 100
    if not parser.has_doctype:
        s1_issues.append({"check": "HTML5 DOCTYPE", "status": "fail", "message": "Missing standard HTML5 DOCTYPE (<!DOCTYPE html>). Critical for standards mode."})
        s1_score -= 30
    else:
        s1_issues.append({"check": "HTML5 DOCTYPE", "status": "pass", "message": "Valid HTML5 DOCTYPE declared."})
        
    if parser.obsolete_tags > 0:
        s1_issues.append({"check": "Obsolete Elements", "status": "warning", "message": f"Found {parser.obsolete_tags} obsolete HTML elements. Use modern semantic alternatives."})
        s1_score -= min(40, parser.obsolete_tags * 10)
    results["specifications"]["html_living_standard"] = {"title": "1. Core HTML Specifications", "score": max(0, s1_score), "issues": s1_issues}

    # 2. DOM Architecture
    s2_issues, s2_score = [], 100
    if parser.max_depth > 32:
        s2_issues.append({"check": "DOM Depth Limit", "status": "warning", "message": f"Extreme DOM depth detected ({parser.max_depth} levels). Recommended max is 32 for optimal paint performance."})
        s2_score -= min(30, (parser.max_depth - 32) * 2)
    else:
        s2_issues.append({"check": "DOM Depth Limit", "status": "pass", "message": f"Healthy DOM tree depth ({parser.max_depth} levels)."})
        
    if parser.img_no_dims > 0:
        s2_issues.append({"check": "Layout Shift Prevention", "status": "warning", "message": f"{parser.img_no_dims} images missing explicit width/height, risking Cumulative Layout Shifts."})
        s2_score -= min(30, parser.img_no_dims * 5)
    results["specifications"]["dom_architecture"] = {"title": "2. Advanced DOM Architecture", "score": max(0, s2_score), "issues": s2_issues}

    # 3. SecOps & Modern Headers
    s3_issues, s3_score = [], 100
    sec_headers = [
        ('strict-transport-security', 'HSTS'),
        ('x-content-type-options', 'X-Content-Type-Options'),
        ('cross-origin-opener-policy', 'COOP'),
        ('cross-origin-embedder-policy', 'COEP')
    ]
    missing = []
    for hdr, name in sec_headers:
        if hdr not in resp_headers:
            missing.append(name)
    if missing:
        s3_issues.append({"check": "Modern SecOps Headers", "status": "warning", "message": f"Missing advanced security headers: {', '.join(missing)}."})
        s3_score -= min(40, len(missing) * 10)
    else:
        s3_issues.append({"check": "Modern SecOps Headers", "status": "pass", "message": "State-of-the-art SecOps headers implemented."})
        
    if 'server' in resp_headers:
        s3_issues.append({"check": "Server Masking", "status": "info", "message": f"Exposes Server header ({resp_headers['server']}). Best practice is to mask infrastructure."})
        s3_score -= 5
    results["specifications"]["secops"] = {"title": "3. Infrastructure & SecOps Standards", "score": max(0, s3_score), "issues": s3_issues}

    scores = [s['score'] for s in results["specifications"].values()]
    results["overall_web_standards_score"] = round(sum(scores) / len(scores), 1)
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "URL argument required"}))
        sys.exit(1)
    print(json.dumps(scan_web_standards(sys.argv[1]), indent=2))
