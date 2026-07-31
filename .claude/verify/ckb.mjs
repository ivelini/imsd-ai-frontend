import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const h = document.querySelector('header');
    const b = document.querySelector('.benefits');
    const sq = document.querySelector('.search-query-blk');
    const c = document.querySelector('.container.product-container');
    const hr = h.getBoundingClientRect(), br = b.getBoundingClientRect(), sr = sq.getBoundingClientRect(), cr = c.getBoundingClientRect();
    return {
      outsideHeader: sq.closest('header') === null,
      order: br.top < sr.top && sr.top < cr.top,
      texts: sq.textContent.trim().slice(0, 50),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
