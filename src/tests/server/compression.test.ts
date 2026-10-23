// @vitest-environment node
/**
 * SEO audit 2026-10-23, issue 2. Express 5 serves `.js` as `text/javascript`,
 * but the gzip allowlist only listed `application/javascript`, so every
 * JavaScript bundle shipped uncompressed while HTML and CSS were compressed.
 * This pins both spellings so a future edit cannot quietly reintroduce the
 * 1.2 MB-per-first-paint regression.
 */
import { describe, expect, it } from 'vitest';
import { isCompressibleContentType } from '@server/app';

describe('gzip content-type allowlist', () => {
  it.each([
    ['text/javascript; charset=utf-8', 'JavaScript as Express 5 serves it'],
    ['application/javascript', 'JavaScript as older stacks serve it'],
    ['text/html; charset=utf-8', 'prerendered route documents'],
    ['text/css; charset=utf-8', 'built stylesheets'],
    ['application/json; charset=utf-8', 'API responses'],
    ['text/plain; charset=utf-8', 'robots.txt, llms.txt'],
    ['application/xml', 'sitemap.xml'],
    ['image/svg+xml', 'inline SVG assets']
  ])('compresses %s (%s)', (contentType) => {
    expect(isCompressibleContentType(contentType)).toBe(true);
  });

  it.each([
    ['image/png', 'raster images are already compressed'],
    ['image/jpeg', 'raster images are already compressed'],
    ['application/octet-stream', 'binary downloads'],
    ['', 'a response with no content type']
  ])('skips %s (%s)', (contentType) => {
    expect(isCompressibleContentType(contentType)).toBe(false);
  });
});
