import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.catalog-product')].slice(0, 3);
    return cards.map(card => {
      const label = card.querySelector('.eu-label');
      const img = card.querySelector('.catalog-product-image img');
      const br = label.getBoundingClientRect();
      const ir = img.getBoundingClientRect();
      const items = [...label.querySelectorAll('i')].map(i => ({ cls: i.className, text: i.textContent.trim() }));
      return {
        items,
        pos: { bottom: Math.round(ir.bottom - br.bottom), left: Math.round(br.left - ir.left) },
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
