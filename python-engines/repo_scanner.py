#!/usr/bin/env python3
"""
Repository Health Scanner Engine (GitHub/GitLab/Bitbucket API Wrapper)
Analyzes repo hygiene: stale PRs, security status, license, and community standards.
"""
import sys
import os
import requests
from urllib.parse import urlparse

def analyze_github(owner, repo):
    print(f"[sys] Detected GitHub Repository: {owner}/{repo}")
    api_base = f"https://api.github.com/repos/{owner}/{repo}"
    headers = {'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'CatalystLab-Scanner'}
    
    token = os.environ.get('GITHUB_TOKEN')
    if token: headers['Authorization'] = f"token {token}"
        
    score, max_score = 0, 4
    
    print("[*] 1. Analyzing Base Repository Metadata...")
    res = requests.get(api_base, headers=headers, timeout=10)
    if res.status_code == 200:
        data = res.json()
        if data.get('license'):
            print(f"  [+] PASS: License found ({data['license']['name']}). Legal compliance intact.")
            score += 1
        else:
            print("  [-] FAIL: No License found. Legal risk detected.")
            
        branch = data.get('default_branch', 'main')
        if branch in ['main', 'master']:
            print(f"  [+] PASS: Default branch is '{branch}'.")
            score += 1
        else:
            print(f"  [~] WARNING: Default branch is '{branch}'. Unusual convention.")
    else:
        print(f"  [-] FAIL: Failed to fetch repo data (HTTP {res.status_code}).")
        return

    print("\n[*] 2. Analyzing Pull Request Hygiene...")
    pr_res = requests.get(f"{api_base}/pulls?state=open&per_page=100", headers=headers, timeout=10)
    if pr_res.status_code == 200:
        prs = pr_res.json()
        if len(prs) > 30:
            print(f"  [-] FAIL: High number of open PRs ({len(prs)}). Tech debt accumulating.")
        else:
            print(f"  [+] PASS: Manageable open PR count ({len(prs)}). Fluid workflow.")
            score += 1

    print("\n[*] 3. Analyzing Security Posture...")
    sec_res = requests.get(f"{api_base}/issues?labels=security,dependabot&state=open", headers=headers, timeout=10)
    if sec_res.status_code == 200:
        issues = sec_res.json()
        if len(issues) > 0:
            print(f"  [-] FAIL: Found {len(issues)} open security/dependabot issues.")
        else:
            print("  [+] PASS: No overt open dependabot/security issues detected.")
            score += 1
            
    return score, max_score

def analyze_gitlab(owner, repo):
    print(f"[sys] Detected GitLab Repository: {owner}/{repo}")
    # GitLab requires url encoding for the project path
    project_path = f"{owner}%2F{repo}"
    api_base = f"https://gitlab.com/api/v4/projects/{project_path}"
    headers = {'User-Agent': 'CatalystLab-Scanner'}
    
    token = os.environ.get('GITLAB_TOKEN')
    if token: headers['PRIVATE-TOKEN'] = token

    score, max_score = 0, 3
    
    print("[*] 1. Analyzing Base Repository Metadata...")
    res = requests.get(api_base, headers=headers, timeout=10)
    if res.status_code == 200:
        data = res.json()
        branch = data.get('default_branch', 'main')
        print(f"  [+] PASS: Default branch is '{branch}'.")
        score += 1
        
        # Checking if issues are enabled as a proxy for hygiene tracking
        if data.get('issues_enabled'):
            print("  [+] PASS: Issue tracking enabled. Good project management.")
            score += 1
        else:
            print("  [-] FAIL: Issue tracking disabled.")
    else:
        print(f"  [-] FAIL: Failed to fetch GitLab data (HTTP {res.status_code}).")
        return
        
    print("\n[*] 2. Analyzing Merge Request Hygiene...")
    mr_res = requests.get(f"{api_base}/merge_requests?state=opened&per_page=100", headers=headers, timeout=10)
    if mr_res.status_code == 200:
        mrs = mr_res.json()
        if len(mrs) > 30:
            print(f"  [-] FAIL: High number of open MRs ({len(mrs)}).")
        else:
            print(f"  [+] PASS: Manageable open MR count ({len(mrs)}).")
            score += 1
            
    return score, max_score

def analyze_bitbucket(owner, repo):
    print(f"[sys] Detected Bitbucket Repository: {owner}/{repo}")
    api_base = f"https://api.bitbucket.org/2.0/repositories/{owner}/{repo}"
    headers = {'Accept': 'application/json'}
    
    score, max_score = 0, 3
    
    print("[*] 1. Analyzing Base Repository Metadata...")
    res = requests.get(api_base, headers=headers, timeout=10)
    if res.status_code == 200:
        data = res.json()
        if 'language' in data and data['language']:
            print(f"  [+] PASS: Primary language detected ({data['language']}).")
            score += 1
        
        if data.get('has_issues'):
            print("  [+] PASS: Issue tracking is active.")
            score += 1
        else:
            print("  [-] FAIL: Issue tracking not found.")
    else:
        print(f"  [-] FAIL: Failed to fetch Bitbucket data (HTTP {res.status_code}).")
        return
        
    print("\n[*] 2. Analyzing Pull Request Hygiene...")
    pr_res = requests.get(f"{api_base}/pullrequests?state=OPEN", headers=headers, timeout=10)
    if pr_res.status_code == 200:
        prs = pr_res.json().get('values', [])
        if len(prs) > 30:
            print(f"  [-] FAIL: High number of open PRs ({len(prs)}).")
        else:
            print(f"  [+] PASS: Manageable open PR count ({len(prs)}).")
            score += 1

    return score, max_score

def run_scanner(url):
    print(f"\n--- REPOSITORY HEALTH SCANNER ---")
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    path_parts = [p for p in parsed.path.strip('/').split('/') if p]
    
    if len(path_parts) < 2:
        print("  [!] Error: Invalid repository URL. Provide owner/repo.")
        return
        
    owner, repo = path_parts[0], path_parts[1]
    
    score, max_score = 0, 1
    try:
        if 'github.com' in domain:
            result = analyze_github(owner, repo)
        elif 'gitlab.com' in domain:
            result = analyze_gitlab(owner, repo)
        elif 'bitbucket.org' in domain:
            result = analyze_bitbucket(owner, repo)
        else:
            print(f"  [!] Unsupported Git provider: {domain}")
            print("  [sys] Currently supporting: github.com, gitlab.com, bitbucket.org")
            return
            
        if result:
            score, max_score = result
            pct = (score / max_score) * 100
            print(f"\n=> 📊 HYGIENE SCORE: {pct:.0f}/100")
            if pct >= 80:
                print("=> 🟢 STATUS: EXCELLENT (Enterprise-Ready)")
            elif pct >= 50:
                print("=> 🟡 STATUS: FAIR (Needs Maintenance)")
            else:
                print("=> 🔴 STATUS: AT RISK (Significant Tech Debt)")
                
    except Exception as e:
        print(f"  [!] Network/API Exception: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 repo_scanner.py <repo_url>")
        sys.exit(1)
    run_scanner(sys.argv[1])
