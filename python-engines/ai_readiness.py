#!/usr/bin/env python3
import sys, requests, json, urllib.parse, re
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def run_ai_readiness(url):
    print(f"\n--- ADVANCED AI READINESS & LLM OPTIMIZATION AUDIT ---")
    print(f"Target: {url}\n")
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CatalystLab-AI'}
    score = 100
    metrics = {"engine": "ai_readiness.py", "plot1": [], "plot2": [], "plot3": []}
    
    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"
    
    # 1. Robots.txt Analysis
    print("[*] 1. AI Crawler Accessibility (robots.txt)...")
    try:
        rob_res = requests.get(f"{base_url}/robots.txt", headers=headers, timeout=5)
        robots_txt = rob_res.text.lower() if rob_res.status_code == 200 else ""
        crawlers = {
            'GPTBot': 'gptbot' in robots_txt,
            'CCBot (Anthropic/OpenAI)': 'ccbot' in robots_txt,
            'Claude-Web': 'claude' in robots_txt,
            'Google-Extended': 'google-extended' in robots_txt,
            'Perplexity': 'perplexity' in robots_txt
        }
        blocked = []
        for name, present in crawlers.items():
            if present and re.search(rf'user-agent:\s*{name.split()[0].lower()}\s*disallow:\s*/', robots_txt):
                print(f"  [-] {name}: BLOCKED (Explicitly disallowed)")
                blocked.append(name)
                score -= 10
            else:
                print(f"  [+] {name}: ALLOWED")
        if not robots_txt:
            print("  [~] No robots.txt found. Defaulting to fully open.")
    except:
        print("  [!] Failed to evaluate robots.txt.")
        score -= 5

    # 2. llms.txt standard
    print("\n[*] 2. Next-Gen /llms.txt Standard...")
    try:
        llm_res = requests.get(f"{base_url}/llms.txt", headers=headers, timeout=5)
        if llm_res.status_code == 200:
            print("  [+] PASS: Native llms.txt mapping found! High AI synergy.")
            score += 10
        else:
            print("  [-] FAIL: Missing /llms.txt. Missing opportunity for explicit LLM context steering.")
            score -= 10
    except:
        pass

    # 3. HTML Semantics & Metadata
    print("\n[*] 3. Semantic Vector Density & Schema.org...")
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.content, 'html.parser')
        
        # Schema.org JSON-LD
        json_ld = soup.find_all('script', type='application/ld+json')
        if json_ld:
            print(f"  [+] PASS: Found {len(json_ld)} JSON-LD schema graphs. Excellent for knowledge graphs.")
        else:
            print("  [-] FAIL: No JSON-LD structured data detected. RAG retrieval may hallucinate context.")
            score -= 15
            
        # Semantic Tags
        semantics = ['article', 'main', 'section', 'nav', 'aside', 'header', 'footer']
        found_sem = [tag for tag in semantics if soup.find(tag)]
        print(f"  [>] Semantic Tags Present: {', '.join(found_sem) if found_sem else 'None'}")
        
        if len(found_sem) < 3:
            print("  [-] FAIL: Poor semantic structure (div soup). LLMs struggle to parse content hierarchy.")
            score -= 15
        else:
            print("  [+] PASS: Rich HTML5 semantic tree detected.")
            
        # Metadata
        og_title = soup.find('meta', property='og:title')
        if og_title:
            print("  [+] PASS: OpenGraph metadata is well-formed.")
        else:
            print("  [~] WARN: Missing core OpenGraph tags.")
            score -= 5
            
    except Exception as e:
        print(f"  [!] Failed to parse target. {e}")

    score = max(0, min(100, int(score)))
    print(f"\n=> 🧠 OVERALL AI READINESS SCORE: {score}/100")
    if score >= 90: print("=> 🟢 STATUS: PRIME (Highly visible to AI engines & RAG pipelines)")
    elif score >= 70: print("=> 🟡 STATUS: MODERATE (Requires semantic & structured data tuning)")
    else: print("=> 🔴 STATUS: INVISIBLE (High risk of AI hallucinations or omission)")

    # Metrics
    metrics["plot1"] = [
        {"subject": "JSON-LD", "A": len(json_ld)*20 if 'json_ld' in locals() else 0, "fullMark": 100},
        {"subject": "Semantics", "A": len(found_sem)*15 if 'found_sem' in locals() else 0, "fullMark": 100},
        {"subject": "Robots", "A": score, "fullMark": 100},
        {"subject": "LLMs.txt", "A": 100 if ('llm_res' in locals() and llm_res.status_code==200) else 0, "fullMark": 100}
    ]
    metrics["plot2"] = [
        {"name": "Content", "tokens": len(soup.get_text())//4 if 'soup' in locals() else 0},
        {"name": "Code", "tokens": len(str(soup))//4 if 'soup' in locals() else 0}
    ]
    metrics["plot3"] = [{"name": c, "allowed": 0 if c in blocked else 100} for c in crawlers.keys()] if 'crawlers' in locals() else []

    print("\n---CATALYST_METRICS---")
    print(json.dumps(metrics))

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    run_ai_readiness(sys.argv[1])
