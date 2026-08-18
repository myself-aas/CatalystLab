#!/usr/bin/env python3
"""
Eco-Carbon Footprint Audit Engine
Implements the Sustainable Web Design (SWD) model to estimate the carbon footprint of a web page.
Formula: 
- Energy per GB: 0.81 kWh/GB
- Carbon intensity: 442 g CO2/kWh (global grid average)
- Network vs Data Center vs Device split estimations.
"""
import sys
import requests
from bs4 import BeautifulSoup

# SWD Constants
KWH_PER_GB = 0.81
CO2_PER_KWH = 442 # grams
PERCENT_NEW_VISITS = 0.75 # Assuming 75% new, 25% returning (cached)
PERCENT_RETURN_VISITS = 0.25
DATA_CACHE_RATIO = 0.02 # Returning visitors only load ~2% of data

def calculate_carbon(url):
    print(f"\n--- ECO-CARBON FOOTPRINT AUDIT ---")
    print(f"Target: {url}\n")
    
    headers = {
        'User-Agent': 'CatalystLab-Eco-Auditor/1.0',
        'Accept-Encoding': 'gzip, deflate, br'
    }
    
    print("[*] 1. Fetching page and measuring initial payload weight...")
    try:
        res = requests.get(url, headers=headers, stream=True, timeout=10)
        
        # Calculate HTML payload size
        html_bytes = len(res.content)
        
        # Parse for assets to estimate full page weight (Simplified proxy method without headless browser)
        soup = BeautifulSoup(res.content, 'html.parser')
        images = soup.find_all('img')
        scripts = soup.find_all('script', src=True)
        stylesheets = soup.find_all('link', rel='stylesheet')
        
        print(f"  [>] Found: {len(images)} Images, {len(scripts)} Scripts, {len(stylesheets)} CSS files.")
        
        # Rough estimation proxy since we are not loading the full network waterfall in python requests
        # Average sizes: Image (500kb), Script (100kb), CSS (30kb)
        est_img_bytes = len(images) * 500 * 1024
        est_script_bytes = len(scripts) * 100 * 1024
        est_css_bytes = len(stylesheets) * 30 * 1024
        
        total_est_bytes = html_bytes + est_img_bytes + est_script_bytes + est_css_bytes
        total_gb = total_est_bytes / (1024 ** 3)
        total_mb = total_est_bytes / (1024 ** 2)
        
        print(f"\n[*] 2. Calculating Energy & Carbon Metrics (Sustainable Web Design Model)...")
        print(f"  [>] Estimated Total Page Weight: {total_mb:.2f} MB")
        
        # Energy Calculation (Total GB * kWh/GB)
        energy_kwh = total_gb * KWH_PER_GB
        
        # Carbon Calculation for a single view (First time vs Returning)
        carbon_first_view = (energy_kwh * CO2_PER_KWH)
        carbon_return_view = (energy_kwh * DATA_CACHE_RATIO * CO2_PER_KWH)
        
        # Average carbon per view based on 75/25 split
        avg_carbon_per_view = (carbon_first_view * PERCENT_NEW_VISITS) + (carbon_return_view * PERCENT_RETURN_VISITS)
        
        # Extrapolate for 10,000 monthly views
        monthly_views = 10000
        monthly_carbon_kg = (avg_carbon_per_view * monthly_views) / 1000
        
        print(f"\n=> 🌍 ECO-METRICS RESULTS:")
        print(f"  - Emissions per Visit: {avg_carbon_per_view:.4f} grams CO2e")
        print(f"  - Monthly Emissions (10k views): {monthly_carbon_kg:.2f} kg CO2e")
        
        # Eco-Rating Logic
        if avg_carbon_per_view < 0.5:
            rating, color = "A+", "Excellent"
        elif avg_carbon_per_view < 1.0:
            rating, color = "A", "Good"
        elif avg_carbon_per_view < 1.5:
            rating, color = "B", "Fair"
        elif avg_carbon_per_view < 2.5:
            rating, color = "C", "Poor"
        else:
            rating, color = "F", "Failing (Heavy Emitter)"
            
        print(f"\n=> 🎖️ CATALYST ECO-RATING: [{rating}] - {color}")
        
    except Exception as e:
        print(f"  [!] Error calculating eco footprint: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 eco_carbon_audit.py <url>")
        sys.exit(1)
    calculate_carbon(sys.argv[1])
