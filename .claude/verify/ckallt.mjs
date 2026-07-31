import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const path of ['/catalog/index.html', '/catalog/filter-params.html', '/catalog/model.html']) {
  for (const w of [390, 1366]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(`http://localhost:8765${path}`, { waitUntil: 'networkidle' });
    const r = await page.evaluate(() => {
      const card = document.querySelector('.catalog-product');
      if (!card) return { noCards: true };
      const title = card.querySelector('.catalog-product-title');
      const info = card.querySelector('.catalog-product-info');
      const tr = title.getBoundingClientRect(), ir = info.getBoundingClientRect();
      return {
        titleW: Math.round(tr.width),
        infoW: Math.round(ir.width),
        flex: getComputedStyle(title).flex,
        stretched: tr.right >= ir.right - 2 || tr.width > 400,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    console.log(path, w + ':', JSON.stringify(r));
    await page.close();
  }
}
await browser.close();
