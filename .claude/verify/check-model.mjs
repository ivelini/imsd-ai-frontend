import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const filter = document.querySelector('.catalog-filter');
    const panel = document.querySelector('.catalog-panel');
    const desc = document.querySelector('.model-description');
    const list = document.querySelector('.catalog-with-products');
    const products = document.querySelectorAll('.catalog-product').length;
    const lr = list.getBoundingClientRect(), cr = document.querySelector('.container.product-container, .catalog-section').getBoundingClientRect();
    return {
      noFilter: !filter && !panel,
      hasDescription: !!desc && desc.querySelectorAll('.model-param').length === 8,
      products,
      listW: Math.round(lr.width),
      sectionW: Math.round(cr.width),
      fullWidth: lr.width >= cr.width - 1,
      title: document.title,
      crumbs: document.querySelector('.search-query').textContent,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
