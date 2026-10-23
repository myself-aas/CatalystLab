/**
 * Slug & Domain Utilities for CatalystLab Benchmark Dossiers
 * Maps domains to clean article slug paths:
 * e.g., "https://stripe.com" -> "stripe-com"
 * e.g., "https://news.ycombinator.com" -> "news-ycombinator-com"
 * e.g., "https://catalystlab.tech" -> "catalystlab-tech"
 */

export function urlToDomainSlug(inputUrl: string): string {
  if (!inputUrl) return 'domain-com';
  let clean = inputUrl.trim().toLowerCase();
  
  // Remove protocol
  clean = clean.replace(/^[a-z]+:\/\//, '');
  
  // Remove path, query params, hashes, trailing slashes
  clean = clean.split('/')[0];
  clean = clean.split('?')[0];
  clean = clean.split('#')[0];
  
  // Remove www.
  clean = clean.replace(/^www\./, '');
  
  // Replace dots, underscores, colons with hyphens
  clean = clean.replace(/[^a-z0-9]/g, '-');
  
  // Consolidate multiple dashes
  clean = clean.replace(/-+/g, '-');
  
  // Trim leading / trailing dashes
  clean = clean.replace(/^-|-$/g, '');
  
  return clean || 'domain-com';
}

export function extractDomainFromUrl(inputUrl: string): string {
  if (!inputUrl) return 'Unknown Domain';
  try {
    let raw = inputUrl.trim();
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      raw = 'https://' + raw;
    }
    const parsed = new URL(raw);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    const slug = urlToDomainSlug(inputUrl);
    return slugToDisplayDomain(slug);
  }
}

/**
 * TLDs the slug format recognises. `slugToDisplayDomain` maps `stripe-com` back
 * to `stripe.com` by looking at the last dash-separated token, so a slug whose
 * last token is not on this list does not describe a domain.
 */
export const KNOWN_SLUG_TLDS: readonly string[] = [
  'com', 'org', 'net', 'tech', 'io', 'ai', 'dev', 'app', 'co', 'edu',
  'gov', 'mil', 'uk', 'ca', 'de', 'fr', 'jp', 'au', 'in', 'xyz', 'info', 'biz', 'cloud', 'run'
];

/**
 * True when a report slug can name a domain. `/reports/:slug` is a generated
 * page family with no enumerated list, so without this guard every string a
 * bot invents becomes a 200 (programmatic-seo skill: noindex thin variations,
 * and never publish a page for a value the data cannot fill).
 */
export function isDomainSlug(slug: string): boolean {
  if (!slug || slug.length > 253) return false;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/i.test(slug)) return false;
  const parts = slug.split('-');
  if (parts.length < 2) return false;
  return KNOWN_SLUG_TLDS.includes(parts[parts.length - 1].toLowerCase());
}

export function slugToDisplayDomain(slug: string): string {
  if (!slug) return 'Target Domain';
  // Common TLDs lookup to reconstruct standard domain format
  const parts = slug.split('-');
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    if (KNOWN_SLUG_TLDS.includes(lastPart)) {
      const prefix = parts.slice(0, -1).join('-');
      return `${prefix}.${lastPart}`;
    }
  }
  return slug.replace(/-/g, '.');
}
