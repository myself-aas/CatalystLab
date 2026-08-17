def check_seo(soup, headers, final_url):
    issues = []
    score = 100

    title_tag = soup.find('title')
    if not title_tag or not title_tag.string:
        issues.append({"check": "Title tag", "status": "fail", "message": "Missing title tag."})
        score -= 20
    else:
        title = title_tag.string.strip()
        if len(title) < 10:
            issues.append({"check": "Title length", "status": "warning", "message": "Title is too short (<10 chars)."})
            score -= 5
        elif len(title) > 60:
            issues.append({"check": "Title length", "status": "warning", "message": "Title is too long (>60 chars)."})
            score -= 5

    meta_desc = soup.find('meta', attrs={'name': 'description'})
    if not meta_desc or not meta_desc.get('content'):
        issues.append({"check": "Meta description", "status": "fail", "message": "Missing meta description."})
        score -= 15
    else:
        desc = meta_desc['content'].strip()
        if len(desc) < 50:
            issues.append({"check": "Meta description length", "status": "warning", "message": "Description is too short (<50 chars)."})
            score -= 5
        elif len(desc) > 160:
            issues.append({"check": "Meta description length", "status": "warning", "message": "Description is too long (>160 chars)."})
            score -= 5

    h1_tags = soup.find_all('h1')
    if len(h1_tags) == 0:
        issues.append({"check": "H1 tag", "status": "fail", "message": "Missing H1 heading."})
        score -= 10
    elif len(h1_tags) > 1:
        issues.append({"check": "H1 count", "status": "warning", "message": f"Multiple H1 tags found ({len(h1_tags)})."})
        score -= 5

    canonical = soup.find('link', rel='canonical')
    if not canonical or not canonical.get('href'):
        issues.append({"check": "Canonical URL", "status": "warning", "message": "Missing canonical tag."})
        score -= 5

    robots_meta = soup.find('meta', attrs={'name': 'robots'})
    if robots_meta and 'noindex' in robots_meta.get('content', '').lower():
        issues.append({"check": "Robots meta", "status": "fail", "message": "Page is set to noindex."})
        score -= 20

    images = soup.find_all('img')
    images_without_alt = [img for img in images if not img.get('alt')]
    if images_without_alt:
        issues.append({"check": "Image alt attributes", "status": "warning", "message": f"{len(images_without_alt)} image(s) missing alt text."})
        score -= min(10, len(images_without_alt) * 2)

    if not soup.find('script', attrs={'type': 'application/ld+json'}):
        issues.append({"check": "Structured data", "status": "info", "message": "No JSON-LD structured data found."})

    return {"score": max(0, score), "issues": issues}


def check_security(soup, headers, final_url):
    issues = []
    score = 100

    if not final_url.startswith('https://'):
        issues.append({"check": "HTTPS", "status": "fail", "message": "Site is not using HTTPS."})
        score -= 30

    security_headers = {
        'Strict-Transport-Security': 'HSTS not set',
        'X-Content-Type-Options': 'X-Content-Type-Options not set',
        'X-Frame-Options': 'X-Frame-Options not set',
        'Content-Security-Policy': 'CSP not set'
    }
    for header, message in security_headers.items():
        if header not in headers:
            issues.append({"check": header, "status": "warning", "message": message})
            score -= 5

    if final_url.startswith('https://'):
        for img in soup.find_all('img', src=True):
            if img['src'].startswith('http://'):
                issues.append({"check": "Mixed content", "status": "fail", "message": "HTTP resource found on HTTPS page."})
                score -= 10
                break

    return {"score": max(0, score), "issues": issues}


def check_mobile(soup, headers, final_url):
    issues = []
    score = 100

    viewport = soup.find('meta', attrs={'name': 'viewport'})
    if not viewport:
        issues.append({"check": "Viewport", "status": "fail", "message": "Missing viewport meta tag."})
        score -= 30
    elif 'width=device-width' not in viewport.get('content', ''):
        issues.append({"check": "Viewport", "status": "warning", "message": "Viewport meta does not set width=device-width."})
        score -= 10

    html = str(soup)
    if '@media' not in html:
        issues.append({"check": "Responsive design", "status": "info", "message": "No CSS media queries detected (may not be responsive)."})

    for a in soup.find_all('a', style=True):
        style = a['style'].lower()
        if 'font-size' in style and 'px' in style:
            try:
                size_str = style.split('font-size:')[1].split('px')[0].strip()
                size = int(float(size_str))
            except (ValueError, IndexError):
                continue
            if size < 12:
                issues.append({"check": "Tap target size", "status": "warning", "message": "Link text too small (<12px)."})
                score -= 5
                break

    return {"score": max(0, score), "issues": issues}


def check_accessibility(soup, headers, final_url):
    issues = []
    score = 100

    images = soup.find_all('img')
    missing_alt = [img for img in images if not img.get('alt')]
    if missing_alt:
        issues.append({"check": "Image alt text", "status": "fail", "message": f"{len(missing_alt)} image(s) missing alt text."})
        score -= min(20, len(missing_alt) * 5)

    inputs = soup.find_all('input')
    missing_labels = [inp for inp in inputs if not inp.get('aria-label') and not inp.get('id')]
    if missing_labels:
        issues.append({"check": "Form labels", "status": "warning", "message": "Input fields without labels or aria-label."})
        score -= 10

    headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    if headings:
        levels = [int(h.name[1]) for h in headings]
        for i in range(1, len(levels)):
            if levels[i] > levels[i - 1] + 1:
                issues.append({"check": "Heading hierarchy", "status": "warning", "message": "Skipped heading level."})
                score -= 5
                break

    if not soup.find(attrs={"role": "main"}):
        issues.append({"check": "ARIA landmarks", "status": "info", "message": "No main landmark role found."})

    return {"score": max(0, score), "issues": issues}


def check_social(soup, headers, final_url):
    issues = []
    score = 100

    og_title = soup.find('meta', property='og:title')
    og_desc = soup.find('meta', property='og:description')
    og_image = soup.find('meta', property='og:image')
    if not og_title:
        issues.append({"check": "Open Graph title", "status": "warning", "message": "Missing og:title."})
        score -= 10
    if not og_desc:
        issues.append({"check": "Open Graph description", "status": "warning", "message": "Missing og:description."})
        score -= 10
    if not og_image:
        issues.append({"check": "Open Graph image", "status": "warning", "message": "Missing og:image."})
        score -= 10

    twitter_card = soup.find('meta', attrs={'name': 'twitter:card'})
    if not twitter_card:
        issues.append({"check": "Twitter Card", "status": "info", "message": "No Twitter Card meta tag."})

    return {"score": max(0, score), "issues": issues}


def check_performance(pagespeed_data):
    if not pagespeed_data or 'lighthouseResult' not in pagespeed_data:
        return {"score": 0, "issues": [{"check": "Performance", "status": "info", "message": "PageSpeed data not available (add PAGESPEED_API_KEY for full analysis)."}]}

    lighthouse = pagespeed_data['lighthouseResult']
    perf_score = lighthouse['categories']['performance']['score'] * 100

    issues = []
    audits = lighthouse['audits']
    metrics = {
        'First Contentful Paint': 'first-contentful-paint',
        'Largest Contentful Paint': 'largest-contentful-paint',
        'Total Blocking Time': 'total-blocking-time',
        'Cumulative Layout Shift': 'cumulative-layout-shift',
        'Speed Index': 'speed-index'
    }
    for label, audit_id in metrics.items():
        if audit_id in audits:
            display_value = audits[audit_id].get('displayValue', 'N/A')
            issues.append({"check": label, "status": "info", "message": display_value})

    return {"score": round(perf_score), "issues": issues}