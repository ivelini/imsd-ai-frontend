import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const [path, w] of [['/product/index.html', 390], ['/catalog/index.html', 390], ['/product/index.html', 1366]]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(`http://localhost:8765${path}`, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const el = document.querySelector('.eu-label');
    const img = el.closest('.main-image, .catalog-product-image').querySelector('img');
    const er = el.getBoundingClientRect(), ir = img.getBoundingClientRect();
    return {
      pos: getComputedStyle(el).position,
      bottomAlign: Math.abs(ir.bottom - er.bottom) < 8,
      leftAlign: Math.abs(ir.left - er.left) < 8,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(path, w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
