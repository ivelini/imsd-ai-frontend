import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const card = document.querySelector('.model-diameter .catalog-product');
    const title = card.querySelector('.catalog-product-title');
    const cr = card.getBoundingClientRect(), tr = title.getBoundingClientRect();
    return {
      titleW: Math.round(tr.width),
      cardW: Math.round(cr.width),
      fullWidth: tr.width >= cr.width - 2,
      pricesRight: Math.round(card.querySelector('.catalog-product-prices').getBoundingClientRect().right),
      cardRight: Math.round(cr.right),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
