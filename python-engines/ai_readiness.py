#!/usr/bin/env python3
"""
AI Readiness Inspector V2 (Developer & AI Tools)
Analyzes how well a website is optimized for autonomous AI agents, LLM indexers, 
and vector embeddings (RAG systems). Checks llms.txt, AI plugin manifests, and chunking limits.
"""
import sys
import requests
from bs4 import BeautifulSoup

def check_ai_readiness(url):
    print(f"\n--- AI READINESS INSPECTOR V2 ---")
    print(f"Target: {url}\n")
    
    headers = {'User-Agent': 'CatalystLab-AI-Scanner/2.0'}
    
    if not url.startswith('http'):
        url = 'https://' + url
    
    base_url = '/'.join(url.split('/')[:3])
    score = 100
    
    print("[*] 1. Discovering LLM specific endpoints...")
    
    # 1. Check llms.txt
    try:
        res_llms = requests.get(f"{base_url}/llms.txt", headers=headers, timeout=5)
        if res_llms.status_code == 200:
            print("  [+] PASS: /llms.txt found. Explicit LLM instructions provided.")
        else:
            print(f"  [-] FAIL: /llms.txt missing (HTTP {res_llms.status_code}). Agents must guess content structure.")
            score -= 15
    except:
        print("  [-] FAIL: Connection error checking /llms.txt")
        score -= 15
        
    # 2. Check OpenAI plugin manifest
    try:
        res_plugin = requests.get(f"{base_url}/.well-known/ai-plugin.json", headers=headers, timeout=5)
        if res_plugin.status_code == 200:
            print("  [+] PASS: /.well-known/ai-plugin.json found. App acts as an AI tool/agent.")
        else:
            print("  [~] WARNING: /.well-known/ai-plugin.json missing (Optional, but limits ecosystem discoverability).")
    except:
        pass

    print("\n[*] 2. Checking robots.txt for AI Bot Directives...")
    try:
        res_robots = requests.get(f"{base_url}/robots.txt", headers=headers, timeout=5)
        if res_robots.status_code == 200:
            robots_txt = res_robots.text.lower()
            if 'gptbot' in robots_txt or 'ccbot' in robots_txt or 'anthropic-ai' in robots_txt or 'claude' in robots_txt:
                print("  [+] PASS: Found specific rules for AI crawlers (GPTBot, CCBot, Anthropic, etc).")
            else:
                print("  [~] WARNING: No specific rules for AI crawlers found in robots.txt.")
                score -= 5
        else:
            print("  [-] FAIL: robots.txt not found.")
            score -= 10
    except:
        print("  [-] FAIL: Could not fetch robots.txt")
        score -= 10

    print("\n[*] 3. Evaluating DOM Semantic Purity & Chunking...")
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.content, 'html.parser')
        
        # Remove scripts and styles
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
            
        text = soup.get_text(separator=' ')
        word_count = len(text.split())
        
        print(f"  [>] Extracted Text: ~{word_count} words.")
        
        if word_count < 100:
            print("  [-] FAIL: Extremely low semantic content. Vectors will lack context.")
            score -= 20
        elif word_count > 10000:
            print("  [~] WARNING: High text density on single page (>10k words). Requires strong chunking logic by the RAG bot.")
            score -= 10
        else:
            print("  [+] PASS: Ideal content density for vector embedding models.")
            
        headings = soup.find_all(['h1', 'h2', 'h3'])
        if len(headings) > 0:
            print(f"  [+] PASS: Document structured with {len(headings)} heading tags (Critical for LLM semantic chunking).")
        else:
            print("  [-] FAIL: No headings found. LLMs cannot determine hierarchy.")
            score -= 15
            
    except Exception as e:
        print(f"  [!] CRITICAL: Failed to parse DOM for semantic analysis. {e}")
        score -= 30

<<<<<<< HEAD
    print(f"\n=> [AI] AI READINESS SCORE: {score}/100")
    if score >= 85:
        print("=> [PASS] STATUS: FULLY COMPATIBLE (SearchGPT/Perplexity optimized)")
    elif score >= 60:
        print("=> [WARN] STATUS: PARTIAL (Usable, but missing explicit AI directives)")
    else:
        print("=> [FAIL] STATUS: INVISIBLE (High risk of hallucination or being ignored by AI agents)")
=======
    print(f"\n=> 🧠 AI READINESS SCORE: {score}/100")
    if score >= 85:
        print("=> 🟢 STATUS: FULLY COMPATIBLE (SearchGPT/Perplexity optimized)")
    elif score >= 60:
        print("=> 🟡 STATUS: PARTIAL (Usable, but missing explicit AI directives)")
    else:
        print("=> 🔴 STATUS: INVISIBLE (High risk of hallucination or being ignored by AI agents)")
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 ai_readiness.py <url>")
        sys.exit(1)
    check_ai_readiness(sys.argv[1])
