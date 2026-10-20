import { test, expect } from '@playwright/test';

/**
 * CatalystLab Production-Server Headless Browser Smoke & Zero-CSP-Violation Suite
 * (Plan items 3.8, 9.2, 9.3, 10.4 — Blocker #5).
 */

test.describe('Release Smoke & Strict Zero-Unsafe-Inline CSP Verification', () => {
  test('renders /, /pricing, /blog, and /contact with ZERO CSP violations and strict headers', async ({ page }) => {
    const cspViolations: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && /Content Security Policy|Refused to apply inline style|Refused to execute inline script/i.test(msg.text())) {
        cspViolations.push(msg.text());
      }
    });

    await page.addInitScript(() => {
      (window as any).__cspEvents = [];
      document.addEventListener('securitypolicyviolation', (e) => {
        (window as any).__cspEvents.push(`${e.violatedDirective}: ${e.blockedURI} (${e.sample || ''})`);
      });
    });

    for (const route of ['/', '/pricing', '/blog', '/contact']) {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      expect(response?.status(), `status for ${route}`).toBe(200);

      const cspHeader = response?.headers()['content-security-policy'] || '';
      expect(cspHeader).not.toContain("'unsafe-inline'");
      expect(cspHeader).toContain("script-src 'self' 'nonce-");
      expect(cspHeader).toContain("style-src 'self' 'nonce-");

      const domViolations = await page.evaluate(() => (window as any).__cspEvents || []);
      expect(domViolations, `DOM securitypolicyviolation events on ${route}`).toEqual([]);
    }

    expect(cspViolations, 'Console CSP violation messages').toEqual([]);
  });

  test('supports full keyboard Tab focus traversal on primary navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const activeTag = await page.evaluate(() => document.activeElement?.tagName || '');
    expect(['A', 'BUTTON', 'INPUT']).toContain(activeTag);
  });

  test('returns real HTTP 404 on unknown routes and X-Robots-Tag: noindex on /admin', async ({ page }) => {
    const missing = await page.goto('/__playwright_nonexistent_route__', { waitUntil: 'domcontentloaded' });
    expect(missing?.status()).toBe(404);

    const admin = await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    expect(admin?.status()).toBe(200);
    expect(admin?.headers()['x-robots-tag']).toContain('noindex');
  });
});
