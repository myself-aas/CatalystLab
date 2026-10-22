// Full-page plate with lazy sections mounted: scroll through first, then shoot.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/tmp/chromium', args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--hide-scrollbars'], env:{...process.env, LD_LIBRARY_PATH:'/tmp/nsslibs'} });
const p = await b.newPage();
await p.setViewport({width:1920,height:1080,deviceScaleFactor:1});
await p.setRequestInterception(true);
p.on('request', r => (r.url().startsWith('http://localhost:3000')||r.url().startsWith('data:')||r.url().startsWith('blob:')) ? r.continue() : r.abort());
await p.goto('http://localhost:3000/', { waitUntil:'load', timeout:90000 });
await new Promise(r=>setTimeout(r,3000));
await p.evaluate(async () => {
  const step = 500;
  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 120));
  }
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 1200));
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 800));
});
await p.screenshot({ path:'assets/captures/home-full.png', fullPage:true });
console.log('full recaptured');
await b.close();
