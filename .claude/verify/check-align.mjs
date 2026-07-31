import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1024, 1366, 1920]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const g = s => { const el = document.querySelector(s); const r = el.getBoundingClientRect(); return { left: Math.round(r.left), w: Math.round(r.width), margin: getComputedStyle(el).margin }; };
    return {
      benefits: g('.benefits'),
      breadcrumbs: g('.search-query-blk'),
      content: g('.container.product-container'),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
