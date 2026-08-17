from http.server import BaseHTTPRequestHandler
import json, os, requests
from datetime import datetime, timedelta
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from supabase import create_client
import sys, pathlib

sys.path.append(str(pathlib.Path(__file__).parent.parent))
from lib.checks import check_seo, check_security, check_mobile, check_accessibility, check_social, check_performance

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
CACHE_HOURS = 6
RATE_LIMIT_PER_DAY = 20

WEIGHTS = {"performance": 0.25, "seo": 0.25, "security": 0.20,
           "mobile": 0.15, "accessibility": 0.10, "social": 0.05}


def validate_url(url):
    try:
        r = urlparse(url)
        return r.scheme in ("http", "https") and bool(r.netloc)
    except Exception:
        return False


def normalize_url(url):
    return url if url.startswith(("http://", "https://")) else "https://" + url


def check_rate_limit(ip):
    since = (datetime.utcnow() - timedelta(days=1)).isoformat()
    resp = supabase.table("rate_limits").select("id").eq("ip", ip).gte("created_at", since).execute()
    if len(resp.data) >= RATE_LIMIT_PER_DAY:
        return False
    supabase.table("rate_limits").insert({"ip": ip}).execute()
    return True


def get_cached(url):
    since = (datetime.utcnow() - timedelta(hours=CACHE_HOURS)).isoformat()
    resp = (supabase.table("reports").select("id, report_data").eq("url", url)
            .gte("created_at", since).order("created_at", desc=True).limit(1).execute())
    if not resp.data:
        return None
    report = resp.data[0]["report_data"]
    report["id"] = resp.data[0]["id"]
    return report


def fetch_html(url):
    headers = {"User-Agent": "Mozilla/5.0 (compatible; CatalystScoreBot/1.0; +https://catalystlab.tech)"}
    resp = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
    return resp.status_code, resp.text, resp.headers, resp.url


def get_pagespeed_data(url):
    api_key = os.environ.get("PAGESPEED_API_KEY")
    if not api_key:
        return {}
    try:
        resp = requests.get(
            "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
            params={"url": url, "key": api_key, "strategy": "mobile",
                    "category": ["performance", "seo", "accessibility", "best-practices"]},
            timeout=8,
        )
        return resp.json() if resp.status_code == 200 else {}
    except requests.exceptions.RequestException:
        return {}


def get_grade(score):
    for t, g in [(90, "A"), (80, "B"), (70, "C"), (60, "D")]:
        if score >= t:
            return g
    return "F"


def analyze(url, ip):
    if not validate_url(url):
        return {"error": "Invalid URL"}, 400
    normalized = normalize_url(url)

    if not check_rate_limit(ip):
        return {"error": "Rate limit exceeded. Try again tomorrow."}, 429

    cached = get_cached(normalized)
    if cached:
        return cached, 200

    try:
        status_code, html, headers, final_url = fetch_html(normalized)
    except requests.RequestException:
        return {"error": "Could not fetch URL (timeout, DNS error, or blocked)"}, 400

    soup = BeautifulSoup(html, "lxml")
    results = {
        "seo": check_seo(soup, headers, final_url),
        "security": check_security(soup, headers, final_url),
        "mobile": check_mobile(soup, headers, final_url),
        "accessibility": check_accessibility(soup, headers, final_url),
        "social": check_social(soup, headers, final_url),
        "performance": check_performance(get_pagespeed_data(normalized)),
    }
    overall = round(sum(WEIGHTS[c] * results[c]["score"] for c in WEIGHTS), 1)
    report = {
        "url": normalized, "final_url": final_url, "status_code": status_code,
        "overall_score": overall, "grade": get_grade(overall),
        "categories": results, "timestamp": datetime.utcnow().isoformat(),
    }
    try:
        insert_resp = supabase.table("reports").insert({
            "url": normalized, "overall_score": overall,
            "grade": get_grade(overall), "report_data": report,
        }).execute()
        if insert_resp.data:
            report["id"] = insert_resp.data[0]["id"]
    except Exception:
        pass
    return report, 200


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            body = {}
        ip = self.headers.get("x-forwarded-for", "unknown").split(",")[0].strip()

        if "url" not in body:
            result, status = {"error": "URL is required"}, 400
        else:
            result, status = analyze(body["url"], ip)

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()