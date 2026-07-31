import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto-selected.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const sections = [...document.querySelectorAll('.category-section')];
    const car = document.querySelector('.car-block');
    const cr = car.getBoundingClientRect();
    return {
      headers: sections.map(s => s.querySelector('.category-section-header').textContent),
      sizes: sections.map(s => [...s.querySelectorAll('.category-section-size')].map(x => x.textContent)),
      cards: sections.map(s => s.querySelectorAll('.catalog-product').length),
      order: sections[0].getBoundingClientRect().top >= cr.bottom,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
