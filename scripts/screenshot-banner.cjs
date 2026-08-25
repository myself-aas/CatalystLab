const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 700 },
    deviceScaleFactor: 2
  });
  await page.goto('http://localhost:8765/assets/banners/hero-banner.html', {
    waitUntil: 'networkidle'
  });
  await page.screenshot({
    path: path.resolve(__dirname, 'assets/banners/hero-banner.png'),
    clip: { x: 0, y: 0, width: 1920, height: 700 }
  });
  await browser.close();
  console.log('Saved hero banner screenshot.');
})();
