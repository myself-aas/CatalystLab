import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium';
import { join } from 'node:path'; import { tmpdir } from 'node:os';
import puppeteer from 'puppeteer-core';
await inflate(join('/tmp/perf/node_modules/@sparticuz/chromium/bin', 'al2023.tar.br'));
setupLambdaEnvironment(join(tmpdir(), 'al2023', 'lib'));
const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: 'shell', defaultViewport: { width: 1366, height: 900 } });
const out = {};
for (const route of ['/', '/pricing', '/docs', '/blogs']) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', r => (r.url().startsWith('http://localhost:3000') || r.url().startsWith('data:')) ? r.continue() : r.abort());
  await page.goto('http://localhost:3000' + route, { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  out[route] = await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().height > 0).map(e => ({ tag: e.tagName, cls: String(e.className).slice(0, 40), inShell: !!e.closest('.app-shell'), y: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height) })).slice(0, 12));
  await page.close();
}
console.log(JSON.stringify(out));
await browser.close();
