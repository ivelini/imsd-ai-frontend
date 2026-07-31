import { chromium } from 'playwright';
const browser = await chromium.launch();
const pages = ['/index.html', '/catalog/index.html', '/product/index.html', '/cart/index.html', '/order/index.html', '/popups/geo.html'];
let bad = 0;
for (const w of [390, 1366]) {
  for (const path of pages) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(`http://localhost:8765${path}`, { waitUntil: 'networkidle' });
    const r = await page.evaluate(() => {
      const sq = document.querySelector('.search-query-blk');
      if (!sq) return { found: false };
      const b = document.querySelector('.benefits');
      const br = b.getBoundingClientRect(), sr = sq.getBoundingClientRect();
      return {
        found: true,
        outsideHeader: sq.closest('header') === null,
        afterBadges: sr.top >= br.bottom,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    if (!r.found || !r.outsideHeader || !r.afterBadges || r.overflow) { console.log(w + path, JSON.stringify(r)); bad++; }
    await page.close();
  }
}
console.log('bad:', bad);
await browser.close();
