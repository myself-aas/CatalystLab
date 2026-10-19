import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import puppeteer from 'puppeteer-core';
await inflate(fileURLToPath(new URL('../bin/al2023.tar.br', import.meta.resolve('@sparticuz/chromium'))));
setupLambdaEnvironment(join(tmpdir(), 'al2023', 'lib'));
const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: 'shell', defaultViewport: { width: 1366, height: 900 } });
const counts = {};
for (const route of ['/', '/pricing', '/docs', '/blogs', '/compare']) {
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  await page.setRequestInterception(true);
  page.on('request', r => (r.url().startsWith('http://localhost:3001') || r.url().startsWith('data:')) ? r.continue() : r.abort());
  const msgs = [];
  page.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') msgs.push(m.type() + ': ' + m.text().slice(0, 220)); });
  page.on('pageerror', e => msgs.push('pageerror: ' + e.message.slice(0, 220)));
  await page.goto('http://localhost:3001' + route, { waitUntil: 'load', timeout: 120000 }).catch(e => msgs.push('goto ' + e.message));
  await new Promise(r => setTimeout(r, 6000));
  const uniq = [...new Set(msgs)];
  counts[route] = uniq;
  console.log('==', route, 'unique warn/error:', uniq.length);
  uniq.slice(0, 10).forEach(m => console.log('   ', m));
  await page.close();
}
await browser.close();
