import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto-selected.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const sections = [...document.querySelectorAll('.category-section')];
    return {
      sections: sections.map(s => ({
        size: s.querySelector('.category-section-size').textContent,
        cards: s.querySelectorAll('.catalog-product').length,
        pairs: s.querySelectorAll('.pair-group').length,
      })),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
