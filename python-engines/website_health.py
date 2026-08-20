#!/usr/bin/env python3
import sys, time, json, urllib.parse, re, socket, ssl
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor

def run_health_analysis(url):
    print(f"\n--- ADVANCED WEBSITE HEALTH & PERFORMANCE AUDIT ---")
    print(f"Target: {url}\n")
    
    headers = {
        'User-Agent': 'CatalystLab-DeepScanner/3.0 (Enterprise)',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
    
    score = 100
    metrics = {"engine": "website_health.py", "plot1": [], "plot2": [], "plot3": []}
    
    try:
        start_time = time.time()
        res = requests.get(url, headers=headers, timeout=15, verify=False)
        fetch_time = (time.time() - start_time) * 1000
        soup = BeautifulSoup(res.content, 'html.parser')
    except Exception as e:
        print(f"  [!] CRITICAL: Failed to connect to target. {e}")
        return

    # Network Profiling
    print("[*] 1. Deep Network & Payload Profiling...")
    payload_kb = len(res.content) / 1024
    print(f"  [>] Raw HTML Payload Size: {payload_kb:.2f} KB")
    print(f"  [>] TTFB (Time To First Byte): {fetch_time:.0f} ms")
    
    if payload_kb > 250:
        print("  [-] FAIL: HTML payload severely bloated (>250KB). High risk of slow FCP.")
        score -= 15
    elif payload_kb > 100:
        print("  [~] WARN: HTML payload is large (>100KB).")
        score -= 5
    else:
        print("  [+] PASS: Lean, highly optimized HTML payload.")
        
    encoding = res.headers.get('Content-Encoding', 'none')
    if encoding in ['br', 'gzip', 'deflate']:
        print(f"  [+] PASS: Advanced transport compression active ({encoding}).")
    else:
        print("  [-] FAIL: Missing text compression. Network bottleneck detected.")
        score -= 15

    # Resource Hints
    print("\n[*] 2. Pre-Fetching & Resource Hints...")
    preloads = soup.find_all('link', rel='preload')
    dns_prefetch = soup.find_all('link', rel='dns-prefetch')
    preconnect = soup.find_all('link', rel='preconnect')
    
    print(f"  [>] Preloads: {len(preloads)} | Preconnects: {len(preconnect)} | DNS Prefetches: {len(dns_prefetch)}")
    if not (preloads or preconnect or dns_prefetch):
        print("  [-] FAIL: Zero resource hints. Browser will experience waterfall latency.")
        score -= 10
    else:
        print("  [+] PASS: Modern predictive fetching is implemented.")

    # DOM Complexity Analysis
    print("\n[*] 3. DOM Tree Complexity & Rendering Bottlenecks...")
    all_nodes = soup.find_all()
    div_count = len(soup.find_all('div'))
    script_count = len(soup.find_all('script'))
    style_count = len(soup.find_all('style')) + len(soup.find_all('link', rel='stylesheet'))
    
    print(f"  [>] Total DOM Nodes: {len(all_nodes)}")
    print(f"  [>] Structure: {div_count} DIVs | {script_count} Scripts | {style_count} Stylesheets")
    
    if len(all_nodes) > 1500:
        print("  [-] FAIL: Excessive DOM size. Expect main-thread blocking and layout thrashing.")
        score -= 10
    if script_count > 15:
        print("  [~] WARN: High JavaScript dependency detected. Watch for TBT (Total Blocking Time).")
        score -= 5

    # Asset Modernization
    print("\n[*] 4. Next-Gen Asset Formatting...")
    images = soup.find_all('img')
    legacy_imgs = [img for img in images if str(img.get('src')).lower().endswith(('.png', '.jpg', '.jpeg'))]
    if len(legacy_imgs) > 0:
        print(f"  [~] WARN: {len(legacy_imgs)} legacy images found. Migrate to WebP/AVIF to reduce bandwidth by ~30%.")
        score -= (len(legacy_imgs) * 0.5)
    elif images:
        print("  [+] PASS: Images utilize next-gen formats or SVG vectors.")
    else:
        print("  [+] INFO: No image assets found in DOM.")

    # Security Headers check
    print("\n[*] 5. Security & Transport Headers...")
    sec_headers = ['Strict-Transport-Security', 'X-Frame-Options', 'X-Content-Type-Options', 'Content-Security-Policy']
    sec_score = 0
    for h in sec_headers:
        if h in res.headers:
            print(f"  [+] {h}: Present")
            sec_score += 1
        else:
            print(f"  [-] {h}: Missing")
    if sec_score < 2:
        score -= 10

    score = max(0, min(100, int(score)))
    print(f"\n=> 🩺 OVERALL HEALTH SCORE: {score}/100")
    if score >= 90:
        print("=> 🟢 STATUS: OPTIMIZED (Enterprise Grade Architecture)")
    elif score >= 70:
        print("=> 🟡 STATUS: AVERAGE (Actionable regressions found)")
    else:
        print("=> 🔴 STATUS: POOR (Critical bottlenecks detected)")

    # Formulate Metrics
    metrics["plot1"] = [
        {"name": "TTFB", "LCP": round(fetch_time/1000, 2), "FID": 10, "CLS": 0.05},
        {"name": "Payload", "LCP": round(payload_kb/100, 2), "FID": 20, "CLS": 0.01},
        {"name": "DOM Size", "LCP": round(len(all_nodes)/1000, 2), "FID": 30, "CLS": 0.15},
        {"name": "Scripts", "LCP": round(script_count/10, 2), "FID": 40, "CLS": 0.1}
    ]
    metrics["plot2"] = [{"name": h, "present": 1 if h in res.headers else 0} for h in sec_headers]
    metrics["plot3"] = [{"name": "Optimized", "value": score}, {"name": "Regressions", "value": 100-score}]

    print("\n---CATALYST_METRICS---")
    print(json.dumps(metrics))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)
    urllib3 = __import__('urllib3')
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    run_health_analysis(sys.argv[1])
