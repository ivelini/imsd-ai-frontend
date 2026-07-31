import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 640, 768, 1024, 1360, 1366, 1920]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const b = document.querySelector('.benefits');
    const firstBadge = b.querySelector('a.benefit').getBoundingClientRect();
    const sqText = document.querySelector('.search-query-blk p').getBoundingClientRect();
    const cont = document.querySelector('.container.product-container');
    const contRect = cont.getBoundingClientRect();
    const contentInner = contRect.left + parseFloat(getComputedStyle(cont).paddingLeft);
    return {
      badgeText: Math.round(firstBadge.left),
      crumbText: Math.round(sqText.left),
      contentInner: Math.round(contentInner),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  const aligned = r.badgeText === r.crumbText && r.badgeText === r.contentInner;
  console.log(w + ':', JSON.stringify(r), aligned ? 'OK' : 'MISMATCH');
  await page.close();
}
await browser.close();
