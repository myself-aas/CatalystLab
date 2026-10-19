import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium';
import { join } from 'node:path'; import { tmpdir } from 'node:os';
import puppeteer from 'puppeteer-core';
await inflate(join('/tmp/perf/node_modules/@sparticuz/chromium/bin', 'al2023.tar.br'));
setupLambdaEnvironment(join(tmpdir(), 'al2023', 'lib'));
const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: 'shell', defaultViewport: { width: 1366, height: 900 } });
const route = process.env.ROUTE || '/blogs';
const runs = Number(process.env.RUNS || 3);
const out = [];
for (let i = 0; i < runs; i++) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', r => (r.url().startsWith('http://localhost:3000') || r.url().startsWith('data:')) ? r.continue() : r.abort());
  await page.evaluateOnNewDocument(() => {
    window.__shifts = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__shifts.push({ value: +e.value.toFixed(4), t: Math.round(e.startTime),
          sources: e.sources.map(s => ({
            node: s.node ? (s.node.nodeName + '.' + (s.node.className && s.node.className.baseVal === undefined ? String(s.node.className).slice(0, 80) : '') + (s.node.id ? '#' + s.node.id : '')) : null,
            prev: s.previousRect && [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height].map(Math.round),
            cur: s.currentRect && [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height].map(Math.round) })) });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  if (process.env.VARIANT) await page.evaluateOnNewDocument((v) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = v === 'noambient' ? 'div[aria-hidden="true"].fixed.inset-0{display:none!important}' : v === 'noblobs' ? 'div[aria-hidden="true"].fixed.inset-0>div:nth-child(n+2):nth-child(-n+5){display:none!important}' : v === 'nowill' ? '.will-change-transform{will-change:auto!important}' : v === 'nowrapper' ? 'div[aria-hidden="true"].fixed.inset-0>div:nth-child(2){display:none!important}' : v === 'nogrid' ? '.linear-grid-overlay{display:none!important}' : v === 'noanim' ? '.animate-linear-blob,.animate-linear-blob-delayed,.animate-linear-blob-slow{animation:none!important}' : ''; document.head.appendChild(st); }); }, process.env.VARIANT);
  await page.goto('http://localhost:3000' + route, { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000));
  const shifts = await page.evaluate(() => window.__shifts);
  const cls = shifts.reduce((a, s) => a + s.value, 0);
  out.push({ run: i, cls: +cls.toFixed(4), shifts });
  await page.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
