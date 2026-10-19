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
const INIT_LT = () => {
  window.__lt = [];
  new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(e.duration))).observe({ type: 'longtask', buffered: true });
};
const INIT_NO_MOUSE = () => {
  const orig = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    if (type === 'mousemove' && this === window) return; // A/B: drop the global mousemove handler
    return orig.call(this, type, fn, opts);
  };
};
async function mouseRun(disable) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.evaluateOnNewDocument(INIT_LT);
  if (disable) await page.evaluateOnNewDocument(INIT_NO_MOUSE);
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 60000 });
  await sleep(4000);
  const cdp = await page.createCDPSession();
  await cdp.send('Performance.enable');
  const m = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  await page.evaluate(() => { window.__lt = []; });
  const pre = await m();
  let n = 0;
  for (let i = 0; i < 6; i++) for (let x = 100; x < 1300; x += 25) { await page.mouse.move(x, 300 + (i * 40) % 400); n++; }
  await sleep(500);
  const post = await m();
  const lt = await page.evaluate(() => ({ n: window.__lt.length, ms: Math.round(window.__lt.reduce((a, b) => a + b, 0)), max: Math.round(Math.max(0, ...window.__lt)) }));
  await page.close();
  return { disabled: disable, events: n, longTasks: lt.n, longTaskMs: lt.ms, maxLongTaskMs: lt.max, scriptMs: Math.round((post.ScriptDuration - pre.ScriptDuration) * 1000), layoutMs: Math.round((post.LayoutDuration - pre.LayoutDuration) * 1000), layouts: post.LayoutCount - pre.LayoutCount, recalcStyleMs: Math.round((post.RecalcStyleDuration - pre.RecalcStyleDuration) * 1000) };
}
const ab = [];
for (const d of [false, true, false, true]) { ab.push(await mouseRun(d)); console.log(JSON.stringify(ab[ab.length - 1])); }

// Layout-shift sources and failing responses
const page = await browser.newPage();
await page.setViewport({ width: 1366, height: 900 });
await page.evaluateOnNewDocument(() => {
  window.__shifts = [];
  const describe = (node) => node ? (node.nodeName + (node.id ? '#' + node.id : '') + '.' + String(node.className || '').slice(0, 60)) : null;
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({ value: +e.value.toFixed(4), t: Math.round(e.startTime), sources: (e.sources || []).map(s => ({ node: describe(s.node) })) });
    }
  }).observe({ type: 'layout-shift', buffered: true });
});
const bad = [];
page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.request().method() + ' ' + r.url().slice(0, 140)); });
await page.goto(BASE + '/blogs', { waitUntil: 'load', timeout: 60000 });
await sleep(5000);
const shifts = await page.evaluate(() => window.__shifts);
console.log('\nBLOGS shifts:', JSON.stringify(shifts.slice(0, 8), null, 1));
console.log('BLOGS failing responses:', bad);
await page.close();
writeFileSync((process.env.RESULTS_DIR || '.') + '/diag.json', JSON.stringify({ ab, shifts, bad }, null, 2));
await browser.close();
