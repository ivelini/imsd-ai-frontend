import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const b = document.querySelector('.benefits');
    const h = document.querySelector('header');
    const c = document.querySelector('.container.product-container');
    const br = b.getBoundingClientRect(), hr = h.getBoundingClientRect(), cr = c.getBoundingClientRect();
    return {
      count: b.querySelectorAll('.benefit').length,
      afterHeader: br.top >= hr.bottom,
      beforeContent: br.bottom <= cr.top,
      colors: [...b.querySelectorAll('.benefit')].map(el => getComputedStyle(el).backgroundColor),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
