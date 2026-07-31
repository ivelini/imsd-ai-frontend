import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const out = [];
    for (const g of document.querySelectorAll('.model-diameter')) {
      const cards = [...g.querySelectorAll('.catalog-product')];
      for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i].getBoundingClientRect(), b = cards[i + 1].getBoundingClientRect();
        out.push({ group: g.querySelector('.model-diameter-title').textContent, gap: Math.round(b.top - a.bottom) });
      }
    }
    return out;
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
