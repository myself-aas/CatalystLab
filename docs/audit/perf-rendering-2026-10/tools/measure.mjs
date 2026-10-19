import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE || 'http://localhost:3000';
const ROUTES = (process.env.ROUTES || '/,/pricing,/docs,/compare,/blogs,/contact,/login').split(',');
const OUT = process.env.OUT || (process.env.RESULTS_DIR || '.') + '/interaction.json';

await inflate(fileURLToPath(new URL('../bin/al2023.tar.br', import.meta.resolve('@sparticuz/chromium'))));
setupLambdaEnvironment(join(tmpdir(), 'al2023', 'lib'));
const executablePath = await chromium.executablePath();
const browser = await puppeteer.launch({
  args: [...chromium.args, '--remote-debugging-port=9222'],
  executablePath, headless: 'shell',
  defaultViewport: { width: 1366, height: 900 },
});

const INIT = () => {
  window.__lt = [];
  window.__lcp = 0; window.__cls = 0; window.__fcp = 0;
  new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(e.duration))).observe({ type: 'longtask', buffered: true });
  new PerformanceObserver(l => l.getEntries().forEach(e => { window.__lcp = e.startTime; })).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.name === 'first-contentful-paint') window.__fcp = e.startTime; })).observe({ type: 'paint', buffered: true });
};

const results = [];
for (const route of ROUTES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.evaluateOnNewDocument(INIT);
  const errors = [];
  const reqs = { total: 0, js: 0, jsBytes: 0, css: 0, cssBytes: 0, font: 0, img: 0, imgBytes: 0, api: 0, hosts: new Set() };
  page.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); });
  page.on('response', r => {
    const u = r.url(); const ct = (r.headers()['content-type'] || ''); const len = +(r.headers()['content-length'] || 0);
    reqs.total++; try { reqs.hosts.add(new URL(u).host); } catch {}
    if (u.includes('/api/')) reqs.api++;
    if (ct.includes('javascript')) { reqs.js++; reqs.jsBytes += len; }
    else if (ct.includes('text/css')) { reqs.css++; reqs.cssBytes += len; }
    else if (/font|woff/.test(ct) || /\.woff2?/.test(u)) reqs.font++;
    else if (ct.startsWith('image/')) { reqs.img++; reqs.imgBytes += len; }
  });
  page.on('requestfailed', r => errors.push('requestfailed: ' + r.url().slice(0, 120)));

  const t0 = Date.now();
  let status = 0;
  try {
    const resp = await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 });
    status = resp?.status() ?? 0;
  } catch (e) { errors.push('goto: ' + e.message.slice(0, 120)); }
  await new Promise(r => setTimeout(r, 4000));
  const loadMs = Date.now() - t0;

  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    return { domContentLoaded: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), ttfb: Math.round(n.responseStart) };
  });
  const paint = await page.evaluate(() => ({
    fcp: Math.round(window.__fcp), lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(3),
    longTasksLoad: window.__lt.length, longTaskMsLoad: Math.round(window.__lt.reduce((a, b) => a + b, 0)),
    maxLongTaskLoad: Math.round(Math.max(0, ...window.__lt)),
    domNodes: document.getElementsByTagName('*').length,
    groupCards: document.querySelectorAll('.group').length,
    h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 80),
    title: document.title,
  }));

  // Interaction: mouse movement burst (the global mousemove handler in App.tsx)
  const cdp = await page.createCDPSession();
  await cdp.send('Performance.enable');
  const metricsOf = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const pre = await metricsOf();
  await page.evaluate(() => { window.__lt = []; });
  for (let i = 0; i < 6; i++) {
    for (let x = 100; x < 1300; x += 25) { await page.mouse.move(x, 300 + (i * 40) % 400); }
  }
  await new Promise(r => setTimeout(r, 500));
  const post = await metricsOf();
  const moveLT = await page.evaluate(() => ({ n: window.__lt.length, ms: Math.round(window.__lt.reduce((a, b) => a + b, 0)), max: Math.round(Math.max(0, ...window.__lt)) }));
  const moveEvents = 6 * Math.ceil((1300 - 100) / 25);
  const d = (k) => +((post[k] - pre[k]) * 1000).toFixed(1);
  const mouse = { events: moveEvents, layoutCount: post.LayoutCount - pre.LayoutCount, layoutMs: d('LayoutDuration'), recalcStyleMs: d('RecalcStyleDuration'), scriptMs: d('ScriptDuration'), longTasks: moveLT.n, longTaskMs: moveLT.ms, maxLongTask: moveLT.max };

  // Interaction: scroll burst with frame sampling
  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    const tick = (now) => { window.__frames.push(now - last); last = now; if (window.__frames.length < 400) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  for (let i = 0; i < 25; i++) { await page.mouse.wheel({ deltaY: 120 }); await new Promise(r => setTimeout(r, 30)); }
  await new Promise(r => setTimeout(r, 800));
  const frames = await page.evaluate(() => window.__frames.slice(1));
  const sorted = [...frames].sort((a, b) => a - b);
  const pct = (p) => Math.round(sorted[Math.floor(sorted.length * p)] || 0);
  const scroll = { frames: frames.length, p50: pct(0.5), p95: pct(0.95), jankFrames: frames.filter(f => f > 50).length };

  const res = { route, status, loadMs, nav, ...paint, requests: { ...reqs, hosts: [...reqs.hosts] }, mouse, scroll, errors: [...new Set(errors)].slice(0, 12), errorCount: errors.length };
  results.push(res);
  console.log(JSON.stringify({ route, status, lcp: paint.lcp, fcp: paint.fcp, cls: paint.cls, ltLoadMs: paint.longTaskMsLoad, maxLT: paint.maxLongTaskLoad, dom: paint.domNodes, groups: paint.groupCards, jsKB: Math.round(reqs.jsBytes / 1024), js: reqs.js, mouse: { layouts: mouse.layoutCount, layoutMs: mouse.layoutMs, scriptMs: mouse.scriptMs, ltMs: mouse.longTaskMs }, scroll, errs: errors.length }));
  await page.close();
}
writeFileSync(OUT, JSON.stringify(results, null, 2));
await browser.close();
console.log('wrote', OUT);
