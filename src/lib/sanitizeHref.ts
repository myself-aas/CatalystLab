/**
 * Allow only http(s), mailto, in-app paths, and fragment links.
 * Rejects javascript:, data:, vbscript:, protocol-relative, and
 * `http:javascript:`-style scheme smuggling.
 */
export function sanitizeHref(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const href = raw.trim();
  if (!href) return null;
  const lower = href.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return null;
  }
  if (href.startsWith('//') || href.startsWith('\\\\')) return null;
  if (href.startsWith('/') || href.startsWith('#')) return href;

  const schemeMatch = href.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) return null;
  const scheme = schemeMatch[1].toLowerCase();
  if (scheme === 'mailto') {
    return href;
  }
  if (scheme !== 'http' && scheme !== 'https') return null;
  try {
    const parsed = new URL(href);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (!parsed.hostname) return null;
    if (/[<>\"'`\\s]/.test(parsed.hostname)) return null;
    return href;
  } catch {
    return null;
  }
}
