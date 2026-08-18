#!/usr/bin/env python3
"""
Website Health Analysis (Core Diagnostics)
Performs a deep diagnostic scan of DOM complexity, modern resource hints, 
next-gen image formats, and general rendering bottlenecks.
"""
import sys
import requests
from bs4 import BeautifulSoup
import time

def run_health_analysis(url):
    print(f"\n--- CORE WEBSITE HEALTH ANALYSIS ---")
    print(f"Target: {url}\n")
    
    headers = {
        'User-Agent': 'CatalystLab-HealthScanner/2.0',
        'Accept-Encoding': 'gzip, deflate, br'
    }
    
    score = 100
    
    try:
        start_time = time.time()
        res = requests.get(url, headers=headers, timeout=10)
        fetch_time = (time.time() - start_time) * 1000
        soup = BeautifulSoup(res.content, 'html.parser')
    except Exception as e:
        print(f"  [!] CRITICAL: Failed to fetch URL. {e}")
        return

    print("[*] 1. Network & Payload Profiling...")
    payload_kb = len(res.content) / 1024
    print(f"  [>] HTML Payload Size: {payload_kb:.2f} KB")
    print(f"  [>] Time To First Byte (TTFB proxy): {fetch_time:.0f} ms")
    
    if payload_kb > 150:
        print("  [-] FAIL: Initial HTML payload exceeds 150KB. Risk of slow First Contentful Paint (FCP).")
        score -= 10
    else:
        print("  [+] PASS: Lean HTML payload.")
        
    if 'br' in res.headers.get('Content-Encoding', '') or 'gzip' in res.headers.get('Content-Encoding', ''):
        print(f"  [+] PASS: Compression enabled ({res.headers.get('Content-Encoding')}).")
    else:
        print("  [-] FAIL: Text compression (Brotli/Gzip) is not active. Major performance loss.")
        score -= 15

    print("\n[*] 2. Resource Hints & Preloading (Network Optimization)...")
    preloads = soup.find_all('link', rel='preload')
    dns_prefetch = soup.find_all('link', rel='dns-prefetch')
    preconnect = soup.find_all('link', rel='preconnect')
    
    total_hints = len(preloads) + len(dns_prefetch) + len(preconnect)
    if total_hints > 0:
        print(f"  [+] PASS: Found {total_hints} modern resource hints (Preload: {len(preloads)}, Preconnect: {len(preconnect)}).")
    else:
        print("  [-] FAIL: No Resource Hints detected. Browser must discover critical assets sequentially.")
        score -= 10

    print("\n[*] 3. DOM Complexity & Rendering Limits...")
    all_elements = soup.find_all()
    div_count = len(soup.find_all('div'))
    
    print(f"  [>] Total DOM Nodes: {len(all_elements)}")
    print(f"  [>] <div> Element Count: {div_count}")
    
    if len(all_elements) > 1500:
        print("  [-] FAIL: Excessive DOM size (>1500 nodes). High memory footprint and slow styling calculation.")
        score -= 15
    elif div_count > (len(all_elements) * 0.5):
        print("  [~] WARNING: 'Div Soup' detected. >50% of elements are divs. Poor semantic structure.")
        score -= 5
    else:
        print("  [+] PASS: DOM complexity is within healthy limits.")

    print("\n[*] 4. Next-Gen Asset Formatting...")
    images = soup.find_all('img')
    if not images:
        print("  [~] No images found to evaluate.")
    else:
        legacy_imgs = [img for img in images if img.get('src', '').lower().endswith(('.png', '.jpg', '.jpeg'))]
        if len(legacy_imgs) > 0:
            print(f"  [~] WARNING: Found {len(legacy_imgs)} legacy format images (PNG/JPG). Migrate to WebP/AVIF.")
            score -= 5
        else:
            print("  [+] PASS: Zero legacy images detected in source tree.")

    print(f"\n=> 🩺 OVERALL HEALTH SCORE: {score}/100")
    if score >= 90:
        print("=> 🟢 STATUS: OPTIMIZED (Enterprise Grade)")
    elif score >= 70:
        print("=> 🟡 STATUS: AVERAGE (Actionable regressions found)")
    else:
        print("=> 🔴 STATUS: POOR (Critical bottlenecks detected)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 website_health.py <url>")
        sys.exit(1)
    run_health_analysis(sys.argv[1])
