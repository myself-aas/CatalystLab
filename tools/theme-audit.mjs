// Theme audit probe: computed styles + screenshots, light & dark.
// Run: cd video/hero-launch && LD_LIBRARY_PATH=/tmp/nsslibs node ../../tools/theme-audit.mjs
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const SHOTS = '/tmp/theme-shots';
fs.mkdirSync(SHOTS, { recursive: true });
const ROUTES = ['/', '/products', '/audit', '/ai-readiness', '/pricing', '/blogs'];
const SELECTORS = [
  'body', 'h1', 'h2', 'p', 'nav a[href]', 'footer',
  '.ds-btn-primary', '.ds-btn-secondary', '.ds-btn-buy',
  'input', '[class*="chip"]', '[class*="badge"]', '[class*="micro-tag"]',
];

function effBg(el) {
  let n = el;
  while (n && n !== document.documentElement) {
    const s = getComputedStyle(n);
    const bg = s.backgroundColor;
    const m = bg.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/);
    if (m && (m[4] === undefined || parseFloat(m[4]) > 0.02)) return bg;
    n = n.parentElement;
  }
  return getComputedStyle(document.body).backgroundColor;
}

const browser = await puppeteer.launch({
  executablePath: '/tmp/chromium',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1'],
  defaultViewport: { width: 1600, height: 1000 },
});

const probeOut = {};
for (const theme of ['light', 'dark']) {
  probeOut[theme] = {};
  for (const route of ROUTES) {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((t) => {
      localStorage.setItem('catalystlab_theme_preference', t);
    }, theme);
    await page.goto('http://127.0.0.1:3000' + route, { waitUntil: 'load', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2500));
    const name = route === '/' ? 'home' : route.replace(/\//g, '-');
    await page.screenshot({ path: `${SHOTS}/${theme}-${name}.png` });
    if (route === '/') {
      await page.evaluate(() => window.scrollTo(0, 1400));
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: `${SHOTS}/${theme}-home-mid.png` });
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise(r => setTimeout(r, 400));
    }
    if (!probeOut[theme]._styles) {
      probeOut[theme]._styles = await page.evaluate((sels) => {
        const effBg = (el) => {
          let n = el;
          while (n && n !== document.documentElement) {
            const s = getComputedStyle(n);
            const m = s.backgroundColor.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/);
            if (m && (m[4] === undefined || parseFloat(m[4]) > 0.02)) return s.backgroundColor;
            n = n.parentElement;
          }
          return getComputedStyle(document.body).backgroundColor;
        };
        const out = [];
        for (const sel of sels) {
          const el = document.querySelector(sel);
          if (!el) continue;
          const s = getComputedStyle(el);
          out.push({ sel, color: s.color, bg: effBg(el), fs: s.fontSize, fw: s.fontWeight, borderColor: s.borderColor });
        }
        return out;
      }, SELECTORS);
    }
    await page.close();
  }
}
fs.writeFileSync('/tmp/theme-probe.json', JSON.stringify(probeOut, null, 1));

// contact sheets: one per theme, 6 route tiles 800x500
for (const theme of ['light', 'dark']) {
  const tiles = ROUTES.map(r => {
    const name = r === '/' ? 'home' : r.replace(/\//g, '-');
    return `<div class="t"><img src="file://${SHOTS}/${theme}-${name}.png"><span>${theme} ${r}</span></div>`;
  }).join('');
  const page = await browser.newPage();
  await page.setViewport({ width: 2440, height: 1080 });
  await page.setContent(`<body style="margin:0;background:#888;display:grid;grid-template-columns:repeat(3,810px);gap:4px">
    ${tiles}
    <style>.t{position:relative;width:810px;height:506px;overflow:hidden}
    .t img{width:810px;height:506px;object-fit:cover;object-position:top}
    .t span{position:absolute;left:0;bottom:0;background:#000c;color:#fff;font:12px monospace;padding:2px 6px}</style></body>`);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${SHOTS}/sheet-${theme}.png` });
  await page.close();
}
await browser.close();
console.log('probe done:', fs.readdirSync(SHOTS).join(', '));
