import os
import glob

replacements = {
    "PAR (Planning, Architecture & Requirements)": "SynthShift",
    "PAR Catalyst": "SynthShift",
    "Code Quality & Repo Hygiene": "GitLygase",
    "Code Quality & Repo": "GitLygase",
    "Build & Asset Efficiency": "EcoHolo",
    "Build & Eco Efficiency": "EcoHolo",
    "Testing & Core Web Vitals": "VitalZyme",
    "Release & Edge Latency": "EdgeVmax",
    "Release & Edge Delivery": "EdgeVmax",
    "DevSecOps & Compliance": "RiskProtease",
    "Operations & AI Readiness": "LLM-Kinase",
    "Evolution & LLMO Search": "AllosterSearch",
    "Evolution & LLMO": "AllosterSearch"
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

