import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [1024, 1200, 1360, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const card = document.querySelector('.catalog-product');
    const fc = card.querySelector('.catalog-product-flex-container');
    const loc = fc.querySelector('.catalog-product-location-info');
    const vis = el => el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0;
    return {
      locationVisible: vis(loc),
      generalVisible: vis(fc.querySelector('.catalog-product-general-info')),
      buyVisible: vis(fc.querySelector('.catalog-product-purchase-actions')),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
