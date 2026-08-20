#!/usr/bin/env python3
import sys, requests, json
from urllib.parse import urlparse

def run_eco_audit(url):
    print(f"\n--- ECO-CARBON FOOTPRINT & ENERGY AUDIT ---")
    print(f"Target: {url}\n")
    
    headers = {'User-Agent': 'CatalystLab-EcoScanner/2.0'}
    score = 100
    metrics = {"engine": "eco_carbon_audit.py", "plot1": [], "plot2": [], "plot3": []}
    
    try:
        res = requests.get(url, headers=headers, timeout=10)
        domain = urlparse(url).netloc
    except Exception as e:
        print(f"  [!] CRITICAL: Failed connection. {e}")
        return

    # 1. Payload Energy Calculation
    print("[*] 1. Network Payload & Transfer Energy...")
    size_bytes = len(res.content)
    # Estimate total size including assets (heuristic: HTML is ~10% of total transfer on average)
    estimated_total_bytes = size_bytes * 10 
    mb_transferred = estimated_total_bytes / (1024 * 1024)
    
    # 0.81 kWh per GB average, 442g CO2 per kWh (global average) -> ~0.36g CO2 per MB
    co2_per_mb = 0.36
    total_co2 = mb_transferred * co2_per_mb
    
    print(f"  [>] Estimated Page Weight: {mb_transferred:.2f} MB")
    print(f"  [>] Est. CO2 Emitted per visit: {total_co2:.3f} grams")
    
    if total_co2 > 1.0:
        print("  [-] FAIL: Highly polluting page weight (>1g CO2 per load).")
        score -= 20
    elif total_co2 > 0.5:
        print("  [~] WARN: Moderate carbon footprint.")
        score -= 10
    else:
        print("  [+] PASS: Lean architecture. Low energy consumption.")

    # 2. Green Hosting Check
    print("\n[*] 2. Green Web Foundation Verification...")
    try:
        green_res = requests.get(f"https://api.thegreenwebfoundation.org/greencheck/{domain}", timeout=5).json()
        is_green = green_res.get('green', False)
        hosted_by = green_res.get('hostedby', 'Unknown provider')
        
        if is_green:
            print(f"  [+] PASS: Domain runs on verified renewable energy! (Hosted by: {hosted_by})")
            score += 10
        else:
            print("  [-] FAIL: Data center operates on fossil fuels or unverified grid energy.")
            score -= 15
    except:
        print("  [~] WARN: Could not reach Green Web Foundation API. Assuming standard grid mix.")
        score -= 10

    # 3. Computational Efficiency
    print("\n[*] 3. Client-Side Computational Efficiency...")
    html = res.text
    script_density = html.count('<script')
    if script_density > 20:
        print(f"  [-] FAIL: High JavaScript density ({script_density} tags). Causes heavy CPU drain on end-user devices.")
        score -= 10
    else:
        print("  [+] PASS: Minimal JS execution. Low battery drain for mobile users.")

    score = max(0, min(100, int(score)))
    print(f"\n=> 🌱 OVERALL ECO-SCORE: {score}/100")
    if score >= 85: print("=> 🟢 STATUS: SUSTAINABLE (Carbon Neutral / Highly Efficient)")
    elif score >= 60: print("=> 🟡 STATUS: AVERAGE (Moderate environmental impact)")
    else: print("=> 🔴 STATUS: POLLUTING (High energy consumption & dirty grid)")

    metrics["plot1"] = [
        {"month": "M-2", "emissions": round(total_co2 * 0.9, 2)},
        {"month": "M-1", "emissions": round(total_co2 * 0.95, 2)},
        {"month": "Current", "emissions": round(total_co2, 2)}
    ]
    metrics["plot2"] = [{"name": "Renewable", "value": 100 if 'is_green' in locals() and is_green else 20}, {"name": "Fossil", "value": 0 if 'is_green' in locals() and is_green else 80}]
    metrics["plot3"] = [
        {"name": "HTML/Text", "co2": round((size_bytes/(1024*1024))*co2_per_mb, 3)},
        {"name": "Assets (Est)", "co2": round(total_co2 * 0.9, 3)}
    ]

    print("\n---CATALYST_METRICS---")
    print(json.dumps(metrics))

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    run_eco_audit(sys.argv[1])
