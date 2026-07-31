import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [1024, 1366, 1920]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const g = s => { const el = document.querySelector(s); const r = el.getBoundingClientRect(); return { left: Math.round(r.left), w: Math.round(r.width) }; };
    return {
      section: g('.catalog-section'),
      sizes: g('.model-sizes'),
      diameter: g('.model-diameter'),
      card: g('.catalog-product'),
      details: g('.catalog-product-details'),
      vw: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
