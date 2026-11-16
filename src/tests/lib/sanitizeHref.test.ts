import { describe, it, expect } from 'vitest';
import { sanitizeHref } from '@/lib/sanitizeHref';

describe('sanitizeHref', () => {
  it('keeps ordinary https links, including hosts containing "s"', () => {
    for (const href of [
      'https://example.com/page',
      'https://docs.github.com/en',
      'https://www.catalystlab.tech/pricing',
      'http://status.example.org',
      'https://sub.domain.co.uk/path?q=1#frag',
    ]) {
      expect(sanitizeHref(href)).toBe(href);
    }
  });

  it('keeps in-app paths, fragments and mailto links', () => {
    expect(sanitizeHref('/docs/security')).toBe('/docs/security');
    expect(sanitizeHref('#section-2')).toBe('#section-2');
    expect(sanitizeHref('mailto:security@example.com')).toBe('mailto:security@example.com');
  });

  it('rejects script, data and vbscript schemes in any case', () => {
    expect(sanitizeHref('javascript:alert(1)')).toBeNull();
    expect(sanitizeHref('JavaScript:alert(1)')).toBeNull();
    expect(sanitizeHref('data:text/html,<b>x</b>')).toBeNull();
    expect(sanitizeHref('vbscript:msgbox(1)')).toBeNull();
  });

  it('rejects protocol-relative, unknown-scheme and scheme-less links', () => {
    expect(sanitizeHref('//evil.example.com')).toBeNull();
    expect(sanitizeHref('ftp://example.com/file')).toBeNull();
    expect(sanitizeHref('example.com')).toBeNull();
    expect(sanitizeHref('')).toBeNull();
  });
});
