#!/usr/bin/env python3
import sys, requests, json, re
from bs4 import BeautifulSoup
from collections import Counter

def run_llmo_audit(url):
    print(f"\n--- LLMO (AI SEARCH) & RAG OPTIMIZATION AUDIT ---")
    print(f"Target: {url}\n")
    
    headers = {'User-Agent': 'CatalystLab-LLMOScanner/1.0'}
    score = 100
    metrics = {"engine": "llmo_optimizer.py", "plot1": [], "plot2": [], "plot3": []}
    
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.content, 'html.parser')
    except Exception as e:
        print(f"  [!] CRITICAL: Fetch failed. {e}")
        return

    # 1. Text Density & Knowledge Extraction
    print("[*] 1. Knowledge Density & Text Extraction...")
    
    text_content = soup.get_text(separator=' ', strip=True)
    words = [w.lower() for w in re.findall(r'\b\w+\b', text_content) if len(w) > 3]
    word_count = len(words)
    
    print(f"  [>] Extracted Corpus Size: {word_count} words")
    if word_count < 300:
        print("  [-] FAIL: Content is too thin (<300 words). LLMs will ignore this page for knowledge retrieval.")
        score -= 20
    elif word_count > 5000:
        print("  [+] PASS: Deep, authoritative long-form content detected.")
    else:
        print("  [+] PASS: Sufficient text depth for AI indexing.")

    # Entity simulation (Frequency based)
    stop_words = {'this', 'that', 'with', 'from', 'your', 'have', 'more', 'about', 'which', 'when'}
    filtered_words = [w for w in words if w not in stop_words and not w.isnumeric()]
    top_keywords = [k for k, v in Counter(filtered_words).most_common(5)]
    print(f"  [>] Prominent Concept Vectors: {', '.join(top_keywords)}")

    # 2. Information Hierarchy (RAG Chunking)
    print("\n[*] 2. RAG Chunking Architecture (Heading Hierarchy)...")
    h1s = soup.find_all('h1')
    h2s = soup.find_all('h2')
    h3s = soup.find_all('h3')
    
    print(f"  [>] Hierarchy: {len(h1s)} H1s | {len(h2s)} H2s | {len(h3s)} H3s")
    if len(h1s) != 1:
        print("  [-] FAIL: Missing or multiple H1 tags. Confuses AI topic assignment.")
        score -= 10
    if len(h2s) == 0:
        print("  [-] FAIL: No H2 sub-sections. RAG chunking algorithms will perform poorly.")
        score -= 15
    else:
        print("  [+] PASS: Clean hierarchy facilitates optimal vector database chunking.")

    # 3. Conversational / Q&A Formats
    print("\n[*] 3. Conversational QA Formats...")
    q_pattern = re.compile(r'\b(what|how|why|when|where|is|are|can)\b.*\?', re.IGNORECASE)
    questions = q_pattern.findall(text_content)
    
    if len(questions) > 0:
        print(f"  [+] PASS: Detected {len(questions)} question-based structures. Highly favorable for conversational AI (ChatGPT/Claude).")
    else:
        print("  [~] WARN: No direct Q&A formats detected. Consider adding FAQ sections for LLM synthesis.")
        score -= 5

    score = max(0, min(100, int(score)))
    print(f"\n=> 🧠 OVERALL LLMO SCORE: {score}/100")
    if score >= 85: print("=> 🟢 STATUS: PRIME (Highly optimized for ChatGPT, Perplexity, Claude)")
    elif score >= 60: print("=> 🟡 STATUS: COMPETITIVE (Needs structural tuning for RAG)")
    else: print("=> 🔴 STATUS: INVISIBLE (High risk of AI hallucination or omission)")

    metrics["plot1"] = [
        {"name": "OpenAI", "score": score},
        {"name": "Anthropic", "score": score - 5},
        {"name": "Google Gemini", "score": score + 2},
        {"name": "Perplexity", "score": score - 10 if len(questions) == 0 else score + 5}
    ]
    metrics["plot2"] = [{"depth": f"L{i}", "density": round(len(h)/max(1, len(all_h)), 2), "keywords": 10} 
                        for i, (h, all_h) in enumerate(zip([h1s, h2s, h3s], [h1s+h2s+h3s]*3), 1)]
    metrics["plot3"] = [
        {"name": "Text Corpus", "value": word_count},
        {"name": "HTML Overhead", "value": len(res.text) - word_count*5}
    ]

    print("\n---CATALYST_METRICS---")
    print(json.dumps(metrics))

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    run_llmo_audit(sys.argv[1])
