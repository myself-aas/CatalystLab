#!/usr/bin/env python3
import sys, json, urllib.request
from html.parser import HTMLParser
from urllib.parse import urlparse, urljoin

class AIReadinessParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.semantic_tags = 0
        self.total_tags = 0
        self.json_ld = 0
        self.api_hooks = 0
        self.microdata = 0

    def handle_starttag(self, tag, attrs):
        self.total_tags += 1
        tag_lower = tag.lower()
        attrs_dict = dict(attrs)
        
        if tag_lower in {'article', 'main', 'section', 'header', 'footer', 'nav', 'aside', 'summary', 'details'}:
            self.semantic_tags += 1
            
        if tag_lower == 'script' and attrs_dict.get('type') == 'application/ld+json':
            self.json_ld += 1
            
        if 'itemscope' in attrs_dict or 'itemprop' in attrs_dict:
            self.microdata += 1
            
        if tag_lower == 'a':
            href = attrs_dict.get('href', '').lower()
            if '/api/' in href or 'graphql' in href or 'swagger' in href or 'openapi' in href:
                self.api_hooks += 1
        elif tag_lower == 'link':
            rel = attrs_dict.get('rel', '').lower()
            if 'search' in rel or 'api' in rel or 'alternate' in rel:
                self.api_hooks += 1

def scan_ai_readiness(url):
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    results = {"url": url, "overall_ai_readiness_score": 100, "evaluations": {}}
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; WorldClass-AIReadinessScanner/4.0)'})
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return {"error": str(e), "overall_ai_readiness_score": 0}

    parser = AIReadinessParser()
    try: parser.feed(html)
    except: pass

    # External AI Resources
    llms_found, mcp_found, robots_ai_friendly = False, False, True
    
    # llms.txt
    try:
        if urllib.request.urlopen(urllib.request.Request(urljoin(base, '/llms.txt'), headers={'User-Agent': 'WorldClass-AIReadinessScanner'}), timeout=3).status == 200:
            llms_found = True
    except: pass
    
    # ai-plugin.json
    try:
        if urllib.request.urlopen(urllib.request.Request(urljoin(base, '/.well-known/ai-plugin.json'), headers={'User-Agent': 'WorldClass-AIReadinessScanner'}), timeout=3).status == 200:
            mcp_found = True
    except: pass
    
    # robots.txt
    try:
        with urllib.request.urlopen(urllib.request.Request(urljoin(base, '/robots.txt'), headers={'User-Agent': 'WorldClass-AIReadinessScanner'}), timeout=3) as rb:
            rbtxt = rb.read().decode('utf-8').lower()
            if 'user-agent: gptbot\ndisallow: /' in rbtxt or 'user-agent: anthropic-ai\ndisallow: /' in rbtxt or 'user-agent: ccbot\ndisallow: /' in rbtxt:
                robots_ai_friendly = False
    except: pass

    # 1. AI Discoverability & Directives
    s1_issues, s1_score = [], 100
    if llms_found:
        s1_issues.append({"check": "llms.txt Presence", "status": "pass", "message": "World-class AI context provider (/llms.txt) found."})
    else:
        s1_issues.append({"check": "llms.txt Presence", "status": "warning", "message": "Missing /llms.txt. Adding this file dramatically improves LLM agent understanding."})
        s1_score -= 20
        
    if not robots_ai_friendly:
        s1_issues.append({"check": "AI Crawler Policies", "status": "warning", "message": "Robots.txt explicitly blocks major AI crawlers, preventing model grounding and search indexing."})
        s1_score -= 15
    else:
        s1_issues.append({"check": "AI Crawler Policies", "status": "pass", "message": "Robots.txt is friendly to AI agents and web indexers."})
    results["evaluations"]["agent_discovery"] = {"title": "1. AI Discoverability & Directives", "score": max(0, s1_score), "issues": s1_issues}

    # 2. Semantic Context & Density
    s2_issues, s2_score = [], 100
    semantic_ratio = (parser.semantic_tags / parser.total_tags) if parser.total_tags > 0 else 0
    if semantic_ratio > 0.05:
        s2_issues.append({"check": "Semantic HTML Density", "status": "pass", "message": f"High semantic density ({parser.semantic_tags} tags). Excellent for LLM context parsing."})
    else:
        s2_issues.append({"check": "Semantic HTML Density", "status": "warning", "message": f"Low semantic density. Relying on div soup hinders AI scraping engines."})
        s2_score -= 20
        
    if parser.json_ld > 0 or parser.microdata > 0:
        s2_issues.append({"check": "Structured Data", "status": "pass", "message": f"Found {parser.json_ld} JSON-LD blocks and {parser.microdata} microdata hooks."})
    else:
        s2_issues.append({"check": "Structured Data", "status": "fail", "message": "No structured data (JSON-LD or Microdata). Essential for AI knowledge graphs."})
        s2_score -= 25
    results["evaluations"]["semantic_context"] = {"title": "2. Semantic Context & Data Graphs", "score": max(0, s2_score), "issues": s2_issues}

    # 3. Model Context Protocol (MCP) & APIs
    s3_issues, s3_score = [], 100
    if mcp_found:
        s3_issues.append({"check": "MCP Manifest", "status": "pass", "message": "Advanced MCP (ai-plugin.json) manifest discovered."})
    else:
        s3_issues.append({"check": "MCP Manifest", "status": "info", "message": "No ai-plugin.json found. Required for deep LLM tool-use integration."})
        s3_score -= 15
        
    if parser.api_hooks > 0:
        s3_issues.append({"check": "API Orchestration", "status": "pass", "message": f"Found {parser.api_hooks} orchestration endpoints (OpenAPI, Swagger, GraphQL)."})
    else:
        s3_issues.append({"check": "API Orchestration", "status": "warning", "message": "No explicit API hooks detected for autonomous agent tooling."})
        s3_score -= 15
    results["evaluations"]["mcp_apis"] = {"title": "3. MCP & Autonomous API Hooks", "score": max(0, s3_score), "issues": s3_issues}

    scores = [s['score'] for s in results["evaluations"].values()]
    results["overall_ai_readiness_score"] = round(sum(scores) / len(scores), 1)
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "URL required"}))
        sys.exit(1)
    print(json.dumps(scan_ai_readiness(sys.argv[1]), indent=2))
