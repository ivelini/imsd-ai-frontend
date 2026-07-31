import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const b = document.querySelector('.benefits');
    const c = document.querySelector('.container.product-container');
    const br = b.getBoundingClientRect(), cr = c.getBoundingClientRect();
    return {
      gapToContent: Math.round(cr.top - br.bottom),
      icons: [...b.querySelectorAll('.benefit svg path')].map(p => p.getAttribute('d').slice(0, 20)),
      texts: [...b.querySelectorAll('.benefit span')].map(s => s.textContent),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
