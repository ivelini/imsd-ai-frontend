import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const sel = document.querySelector('.auto-select');
    if (!sel) return { found: false };
    const list = document.querySelector('.catalog-with-products, .model-sizes, .catalog-product');
    const sr = sel.getBoundingClientRect();
    const lr = list ? list.getBoundingClientRect() : null;
    return {
      found: true,
      title: sel.querySelector('.auto-select-title').textContent,
      selects: sel.querySelectorAll('select').length,
      submit: sel.querySelector('.auto-select-submit')?.textContent,
      helpLinks: sel.querySelectorAll('.auto-select-help a').length,
      beforeList: lr ? sr.bottom <= lr.top : true,
      products: document.querySelectorAll('.catalog-product').length,
      pagination: !!document.querySelector('.pagination'),
      seo: !!document.querySelector('.seo-content'),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
