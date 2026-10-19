import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium';
import { join } from 'node:path'; import { tmpdir } from 'node:os';
import puppeteer from 'puppeteer-core';
await inflate(join('/tmp/perf/node_modules/@sparticuz/chromium/bin', 'al2023.tar.br'));
setupLambdaEnvironment(join(tmpdir(), 'al2023', 'lib'));
const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: 'shell', defaultViewport: { width: 1366, height: 900 } });
const routes = ['/', '/pricing', '/blogs', '/docs', '/compare', '/login', '/this-page-does-not-exist'];
for (const route of routes) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', r => (r.url().startsWith('http://localhost:3000') || r.url().startsWith('data:')) ? r.continue() : r.abort());
  await page.goto('http://localhost:3000' + route, { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));
  const info = await page.evaluate(() => ({
    title: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.href || null,
    robots: document.querySelector('meta[name="robots"]')?.content || null,
    h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim().slice(0, 60)),
    ldTypes: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { const j = JSON.parse(s.textContent); return j['@type'] || (Array.isArray(j['@graph']) ? j['@graph'].map(g => g['@type']).join('+') : '?'); } catch { return 'parse-error'; } }),
    words: document.body.innerText.split(/\s+/).filter(Boolean).length,
  }));
  console.log(route, JSON.stringify(info));
  await page.close();
}
await browser.close();
