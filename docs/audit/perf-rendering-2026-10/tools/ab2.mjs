import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
const BASE = 'http://localhost:3000';
await inflate(fileURLToPath(new URL('../bin/al2023.tar.br', import.meta.resolve('@sparticuz/chromium'))));
setupLambdaEnvironment(join(tmpdir(), 'al2023', 'lib'));
const executablePath = await chromium.executablePath();
const browser = await puppeteer.launch({ args: [...chromium.args, '--remote-debugging-port=9222'], executablePath, headless: 'shell', defaultViewport: { width: 1366, height: 900 } });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const VARIANTS = {
  baseline: '',
  noBackdropBlur: '[class*="backdrop-blur"]{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
  noAmbientLayer: 'div[aria-hidden="true"].fixed.inset-0{display:none!important}',
  noBlobAnim: '.animate-linear-blob,.animate-linear-blob-delayed,.animate-linear-blob-slow{animation:none!important}',
};
const CLS_INIT = () => {
  window.__cls = 0; window.__shifts = 0;
  new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) { window.__cls += e.value; window.__shifts++; } })).observe({ type: 'layout-shift', buffered: true });
};
async function run(route, variant, css) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.evaluateOnNewDocument(CLS_INIT);
  if (css) await page.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = c; document.head.appendChild(s); }); }, css);
  // block external hosts so timing is not dominated by sandbox-blocked requests
  await page.setRequestInterception(true);
  page.on('request', r => (r.url().startsWith(BASE) || r.url().startsWith('data:')) ? r.continue() : r.abort());
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 });
  await sleep(4000);
  const cls = await page.evaluate(() => ({ cls: +window.__cls.toFixed(3), n: window.__shifts }));
  // scroll measurement, 3 reps
  const reps = [];
  for (let rep = 0; rep < 3; rep++) {
    await page.evaluate(() => { window.scrollTo(0, 0); window.__frames = []; let last = performance.now(); const tick = (now) => { window.__frames.push(now - last); last = now; if (window.__frames.length < 500) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    for (let i = 0; i < 25; i++) { await page.mouse.wheel({ deltaY: 120 }); await sleep(30); }
    await sleep(900);
    const f = (await page.evaluate(() => window.__frames.slice(1))).sort((a, b) => a - b);
    reps.push({ p50: Math.round(f[Math.floor(f.length * 0.5)]), p95: Math.round(f[Math.floor(f.length * 0.95)]), jank: f.filter(x => x > 50).length, frames: f.length });
  }
  await page.close();
  const med = (k) => reps.map(r => r[k]).sort((a, b) => a - b)[1];
  return { route, variant, ...cls, scrollP50: med('p50'), scrollP95: med('p95'), jankFrames: med('jank') };
}
const out = [];
for (const route of ['/blogs', '/']) for (const [v, css] of Object.entries(VARIANTS)) {
  const r = await run(route, v, css); out.push(r); console.log(JSON.stringify(r));
}
writeFileSync((process.env.RESULTS_DIR || '.') + '/ab2.json', JSON.stringify(out, null, 2));
await browser.close();
