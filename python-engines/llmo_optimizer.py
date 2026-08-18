#!/usr/bin/env python3
"""
AI Search Optimization (LLMO) Workflow
Moves beyond readiness to actual Optimization for RAG/LLM indexers (Perplexity, SearchGPT).
Checks:
1. Schema.org / JSON-LD Data density (The API for AI)
2. Content-to-HTML Ratio (Noise reduction)
3. OpenGraph / Entity Tagging
"""
import sys
import json
import requests
from bs4 import BeautifulSoup
import re

def run_llmo_workflow(url):
    print(f"\n--- AI SEARCH OPTIMIZATION (LLMO) REPORT ---")
    print(f"Target: {url}\n")
    
    headers = {'User-Agent': 'CatalystLab-LLMOptimizer/1.0'}
    
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.content, 'html.parser')
    except Exception as e:
        print(f"  [!] Failed to fetch URL: {e}")
        return

    score = 0
    max_score = 4
    
    print("[*] 1. Analyzing Schema.org / JSON-LD Data (Structured Data for AI)...")
    json_ld_scripts = soup.find_all('script', type='application/ld+json')
    if json_ld_scripts:
        print(f"  [+] PASS: Found {len(json_ld_scripts)} JSON-LD structured data blocks.")
        score += 2
        for i, script in enumerate(json_ld_scripts):
            try:
                data = json.loads(script.string)
                schema_type = data.get('@type', 'Unknown Type')
                print(f"      -> Detected Schema Type: {schema_type}")
            except:
                pass
    else:
        print("  [-] FAIL: No JSON-LD schema found. AI engines struggle to classify unformatted data.")

    print("\n[*] 2. Evaluating Content-to-Boilerplate Ratio (RAG Extraction Efficiency)...")
    # Clean up scripts and styles to get raw text
    for script in soup(["script", "style", "nav", "footer"]):
        script.extract()
    
    text = soup.get_text()
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    clean_text = '\n'.join(chunk for chunk in chunks if chunk)
    
    text_length = len(clean_text)
    html_length = len(res.content)
    
    if html_length > 0:
        ratio = (text_length / html_length) * 100
        print(f"  [>] Text Length: {text_length} chars | HTML Length: {html_length} chars")
        print(f"  [>] Content-to-HTML Ratio: {ratio:.2f}%")
        if ratio > 15:
            print("  [+] PASS: High semantic density. RAG models will extract core content efficiently.")
            score += 1
        else:
            print("  [-] FAIL: Low semantic density (Too much JS/CSS/DOM noise). RAG models may hallucinate or timeout.")
            print("      -> RECOMMENDATION: Move inline CSS/JS to external files, reduce div soup.")

    print("\n[*] 3. Checking OpenGraph & Entity Tagging (Social & LLM Preview Cards)...")
    og_title = soup.find('meta', property='og:title')
    og_desc = soup.find('meta', property='og:description')
    
    if og_title and og_desc:
        print("  [+] PASS: OpenGraph entity tagging is complete. AI previews will render correctly.")
        score += 1
    else:
        print("  [-] FAIL: Missing OpenGraph tags. AI citations and summary cards will look broken.")

<<<<<<< HEAD
    print(f"\n=> [AI] LLM OPTIMIZATION SCORE: {score}/{max_score}")
    if score >= 3:
        print("=> [PASS] STATUS: OPTIMIZED. Highly likely to be cited by Perplexity/ChatGPT.")
    else:
        print("=> [FAIL] STATUS: POOR. Requires structured data and DOM cleanup to rank in AI search.")
=======
    print(f"\n=> 🧠 LLM OPTIMIZATION SCORE: {score}/{max_score}")
    if score >= 3:
        print("=> 🟢 STATUS: OPTIMIZED. Highly likely to be cited by Perplexity/ChatGPT.")
    else:
        print("=> 🔴 STATUS: POOR. Requires structured data and DOM cleanup to rank in AI search.")
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 llmo_optimizer.py <url>")
        sys.exit(1)
    run_llmo_workflow(sys.argv[1])
