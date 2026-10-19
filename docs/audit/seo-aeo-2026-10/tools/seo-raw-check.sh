#!/usr/bin/env bash
# Raw-HTML SEO/AEO check (no JavaScript executed). Usage: seo-raw-check.sh [BASE_URL]
# Prints one line per route: status | title | canonical | robots | ld+json blocks | visible words without JS.
BASE="${1:-http://localhost:3000}"
ROUTES="/ /pricing /blogs /docs /compare /login /admin /dashboard /this-page-does-not-exist /blogs.html"
for p in $ROUTES; do
  tmp=$(mktemp)
  code=$(curl -s -o "$tmp" -w "%{http_code}" "$BASE$p")
  title=$(grep -o "<title>[^<]*</title>" "$tmp" | head -1)
  canon=$(grep -o 'rel="canonical" href="[^"]*"' "$tmp" | head -1)
  robots=$(grep -o 'name="robots" content="[^"]*"' "$tmp" | head -1)
  ld=$(grep -c "ld+json" "$tmp")
  words=$(sed 's/<script[^>]*>.*<\/script>//g' "$tmp" | sed 's/<[^>]*>/ /g' | wc -w)
  echo "$p | $code | $title | $canon | $robots | ld+json=$ld | words=$words"
  rm -f "$tmp"
done
echo "== robots.txt $(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$BASE/robots.txt")"
echo "== sitemap.xml $(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$BASE/sitemap.xml")"
echo "== og-image.png $(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$BASE/og-image.png")"
echo "== llms.txt $(curl -s -o /dev/null -w '%{http_code}' "$BASE/llms.txt") llms-full.txt $(curl -s -o /dev/null -w '%{http_code}' "$BASE/llms-full.txt")"
echo "== gzip on / : $(curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w '%{content_type} enc=%header{content-encoding}' "$BASE/")"
