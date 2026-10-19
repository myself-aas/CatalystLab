import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium';
import { join } from 'node:path'; import { tmpdir } from 'node:os';
import puppeteer from 'puppeteer-core';
await inflate(join('/tmp/perf/node_modules/@sparticuz/chromium/bin', 'al2023.tar.br'));
setupLambdaEnvironment(join(tmpdir(), 'al2023', 'lib'));
const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: 'shell', defaultViewport: { width: 1366, height: 900 } });
const route = process.env.ROUTE || '/blogs';
for (let i = 0; i < Number(process.env.RUNS || 3); i++) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', r => (r.url().startsWith('http://localhost:3000') || r.url().startsWith('data:')) ? r.continue() : r.abort());
  await page.evaluateOnNewDocument(() => {
    window.__lcps = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const el = e.element;
        window.__lcps.push({ t: Math.round(e.startTime), size: e.size, tag: el ? el.tagName : null, cls: el ? String(el.className).slice(0, 50) : null, url: e.url ? e.url.slice(0, 70) : null, text: el ? (el.textContent || '').trim().slice(0, 30) : null });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  if (process.env.CSS) await page.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, process.env.CSS);
  if (process.env.NOSW) await page.setBypassServiceWorker(true);
  await page.goto('http://localhost:3000' + route, { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  const l = await page.evaluate(() => window.__lcps);
  console.log('run', i, JSON.stringify(l.slice(-1)));
  await page.close();
}
await browser.close();
