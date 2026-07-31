import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const li = document.querySelector('.parameter-item');
  const nr = li.querySelector('.parameter-name').getBoundingClientRect();
  const dr = li.querySelector('.parameter-dots').getBoundingClientRect();
  const vr = li.querySelector('.parameter-value').getBoundingClientRect();
  return {
    gapLeft: Math.round(dr.left - nr.right),
    gapRight: Math.round(vr.left - dr.right),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
});
console.log(JSON.stringify(r));
await browser.close();
