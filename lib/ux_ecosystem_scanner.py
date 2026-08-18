#!/usr/bin/env python3
import sys, json, urllib.request
from html.parser import HTMLParser

class UxEcosystemParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.frameworks = set()
        self.pwa_features = set()
        self.resource_hints = set()
        self.css_frameworks = set()
        self.word_count = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        tag_lower = tag.lower()
        
        if tag_lower == 'link':
            rel = attrs_dict.get('rel', '').lower()
            if 'manifest' in rel:
                self.pwa_features.add('Web App Manifest')
            if 'apple-touch-icon' in rel:
                self.pwa_features.add('Apple Touch Icon')
            if rel in {'preconnect', 'dns-prefetch', 'preload', 'modulepreload'}:
                self.resource_hints.add(rel)
                
        if tag_lower == 'meta' and attrs_dict.get('name', '').lower() == 'theme-color':
            self.pwa_features.add('Theme Color')
            
        # JS Frameworks
        if tag_lower == 'div':
            id_val = attrs_dict.get('id', '')
            if id_val in {'root', 'app'}:
                self.frameworks.add('React/Vue (SPA)')
            elif id_val == '__next':
                self.frameworks.add('Next.js')
            elif id_val == 'svelte':
                self.frameworks.add('Svelte')
                
        if 'data-reactroot' in attrs_dict:
            self.frameworks.add('React SSR')
        if 'data-v-' in str(attrs_dict.keys()):
            self.frameworks.add('Vue.js')
        if 'ng-version' in attrs_dict:
            self.frameworks.add('Angular')
            
        # CSS Frameworks
        classes = attrs_dict.get('class', '')
        if 'flex ' in classes or 'grid ' in classes or 'text-' in classes or 'bg-' in classes:
            self.css_frameworks.add('Tailwind CSS / Utility First')
        if 'container' in classes and 'row' in classes and 'col-' in classes:
            self.css_frameworks.add('Bootstrap')
        if 'v-application' in classes:
            self.css_frameworks.add('Vuetify')

    def handle_data(self, data):
        cleaned = data.strip()
        if cleaned:
            self.word_count += len(cleaned.split())

def scan_ux_ecosystem(url):
    results = {"url": url, "overall_ux_ecosystem_score": 100, "evaluations": {}}
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; WorldClass-UxEcosystemScanner/4.0)'})
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return {"error": str(e), "overall_ux_ecosystem_score": 0}

    parser = UxEcosystemParser()
    try: parser.feed(html)
    except: pass

    # 1. PWA & Mobile Optimization
    s1_issues, s1_score = [], 100
    if len(parser.pwa_features) >= 2:
        s1_issues.append({"check": "PWA Readiness", "status": "pass", "message": f"World-class PWA features detected: {', '.join(parser.pwa_features)}."})
    else:
        s1_issues.append({"check": "PWA Readiness", "status": "warning", "message": "Missing key PWA features (manifest, theme-color, touch icons)."})
        s1_score -= 20
    results["evaluations"]["pwa_mobile"] = {"title": "1. PWA & Mobile Architecture", "score": max(0, s1_score), "issues": s1_issues}

    # 2. Tech Stack & Framework Integration
    s2_issues, s2_score = [], 100
    stacks = list(parser.frameworks) + list(parser.css_frameworks)
    if stacks:
        s2_issues.append({"check": "Modern Stack Signature", "status": "pass", "message": f"State-of-the-art tech stack detected: {', '.join(stacks)}."})
    else:
        s2_issues.append({"check": "Modern Stack Signature", "status": "info", "message": "No recognizable modern SPA or CSS framework detected. Pure HTML/CSS assumed."})
        s2_score -= 10
    results["evaluations"]["tech_stack"] = {"title": "2. Framework Ecosystem", "score": max(0, s2_score), "issues": s2_issues}

    # 3. Resource & Preload Engineering
    s3_issues, s3_score = [], 100
    if len(parser.resource_hints) > 0:
        s3_issues.append({"check": "Resource Hints", "status": "pass", "message": f"Advanced resource prioritization active ({', '.join(parser.resource_hints)}). Excellent for Core Web Vitals."})
    else:
        s3_issues.append({"check": "Resource Hints", "status": "warning", "message": "No resource hints (preconnect, preload) found. Critical for optimizing LCP and network latency."})
        s3_score -= 20
    results["evaluations"]["resource_engineering"] = {"title": "3. Resource & Preload Engineering", "score": max(0, s3_score), "issues": s3_issues}

    scores = [s['score'] for s in results["evaluations"].values()]
    results["overall_ux_ecosystem_score"] = round(sum(scores) / len(scores), 1)
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "URL required"}))
        sys.exit(1)
    print(json.dumps(scan_ux_ecosystem(sys.argv[1]), indent=2))
