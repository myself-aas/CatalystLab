// Captures real UI plates from the live dev server for the hero-launch film.
// Bypasses `hyperframes capture` (its access-protection classifier misfires on
// localhost SPAs). External requests are aborted instantly so blocked hosts
// (googleapis/firebase/unsplash/...) never hang the load.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const OUT = 'assets/captures';
fs.mkdirSync(OUT, { recursive: true });

const BASE_ARGS = [
  '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
  '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb',
  '--disable-extensions', '--no-first-run', '--mute-audio',
  '--font-render-hinting=none',
];

async function launch(args) {
  return puppeteer.launch({
    executablePath: '/tmp/chromium',
    args,
    env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nsslibs' + (process.env.LD_LIBRARY_PATH ? ':' + process.env.LD_LIBRARY_PATH : '') },
    timeout: 60000,
  });
}

let browser;
try {
  browser = await launch(BASE_ARGS);
} catch (e) {
  console.log('plain launch failed, retrying with single-process:', String(e.message).split('\n')[0]);
  browser = await launch([...BASE_ARGS, '--single-process', '--no-zygote']);
}
console.log('browser up');

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
await page.setRequestInterception(true);
page.on('request', (req) => {
  const u = req.url();
  if (u.startsWith('http://localhost:3000') || u.startsWith('data:') || u.startsWith('blob:')) req.continue();
  else req.abort();
});
page.on('pageerror', (e) => console.log('  pageerror:', String(e.message).split('\n')[0].slice(0, 120)));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(urlPath, name, opts = {}) {
  const t0 = Date.now();
  try {
    await page.goto('http://localhost:3000' + urlPath, { waitUntil: 'load', timeout: 90000 });
  } catch (e) {
    console.log(name, 'goto warn:', String(e.message).split('\n')[0]);
  }
  await sleep(4000); // settle: react mount, on-load animation, aborted-request error boundaries
  try { await page.evaluate(() => document.fonts.ready); } catch { /* noop */ }
  console.log(name, 'url=', page.url(), 'title=', JSON.stringify(await page.title().catch(() => '')));

  await page.screenshot({ path: path.join(OUT, name + '.png') });

  if (opts.selector) {
    const el = await page.$(opts.selector);
    if (el) { await el.screenshot({ path: path.join(OUT, name + '-el.png') }); console.log(name, 'element shot:', opts.selector); }
    else console.log(name, 'SELECTOR MISSING:', opts.selector);
  }
  if (opts.full) {
    try {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 }); // stay under the 16384px texture cap
      await sleep(600);
      await page.screenshot({ path: path.join(OUT, name + '-full.png'), fullPage: true });
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
      await sleep(600);
    } catch (e) { console.log(name, 'full warn:', String(e.message).split('\n')[0]); }
  }
  console.log(name, 'DONE', Date.now() - t0, 'ms');
}

await shoot('/', 'home', { full: true, selector: '#audit-form' });
await shoot('/products', 'products');
await shoot('/audit', 'audit');
await shoot('/ai-readiness', 'ai-readiness');
await shoot('/user-dashboard', 'dashboard');

await browser.close();
console.log('ALL_DONE');
