import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import lighthouse from 'lighthouse';
await inflate(fileURLToPath(new URL('../bin/al2023.tar.br', import.meta.resolve('@sparticuz/chromium'))));
setupLambdaEnvironment(join(tmpdir(), 'al2023', 'lib'));
const executablePath = await chromium.executablePath();
const browser = await puppeteer.launch({ args: [...chromium.args, '--remote-debugging-port=9222'], executablePath, headless: 'shell' });
const port = 9222;
const routes = (process.env.ROUTES || '/,/pricing,/docs').split(',');
const rows = [];
for (const preset of (process.env.PRESETS||'desktop,mobile').split(',')) for (const route of routes) {
  const flags = { port, output: 'json', logLevel: 'error', onlyCategories: ['performance'] };
  const config = preset === 'desktop'
    ? { extends: 'lighthouse:default', settings: { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttlingMethod: 'simulate', throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } }
    : { extends: 'lighthouse:default', settings: { formFactor: 'mobile' } };
  const res = await lighthouse('http://localhost:3000' + route, flags, config);
  const a = res.lhr.audits; const cats = res.lhr.categories;
  const row = { preset, route, perf: Math.round(cats.performance.score * 100), FCP: a['first-contentful-paint'].displayValue, LCP: a['largest-contentful-paint'].displayValue, TBT: a['total-blocking-time'].displayValue, CLS: a['cumulative-layout-shift'].displayValue, SI: a['speed-index'].displayValue, TTI: a['interactive']?.displayValue };
  const unused = a['unused-javascript']?.details?.items?.slice(0, 4).map(i => ({ url: i.url.replace(/^.*\/assets\//, ''), wastedKB: Math.round(i.wastedBytes / 1024) })) || [];
  const cache = a['uses-long-cache-ttl']?.details?.items?.length || 0;
  const comp = a['uses-text-compression']?.details?.items?.length || 0;
  const cacheMb = a['uses-long-cache-ttl']?.displayValue || '';
  row.unusedJS = unused; row.cacheIssues = cache; row.uncompressed = comp; row.cacheNote = cacheMb; row.renderBlocking = a['render-blocking-resources']?.displayValue;
  row.mainThreadWork = a['mainthread-work-breakdown']?.displayValue; row.bootup = a['bootup-time']?.displayValue;
  rows.push(row); console.log(JSON.stringify(row));
  writeFileSync(`${process.env.RESULTS_DIR || '.'}/lh-${preset}-${route.replace(/\//g, '_') || 'root'}.json`, JSON.stringify(res.lhr, null, 1).slice(0, 4000000));
}
writeFileSync((process.env.RESULTS_DIR || '.') + '/lighthouse-summary.json', JSON.stringify(rows, null, 2));
await browser.close();
