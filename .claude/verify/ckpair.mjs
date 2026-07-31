import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto-selected.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const sec = document.querySelector('.category-section');
    const cards = [...sec.querySelectorAll('.catalog-product')];
    const titles = cards.map(c => c.querySelector('.catalog-product-title').textContent.trim());
    return {
      header: sec.querySelector('.category-section-header').textContent,
      size: sec.querySelector('.category-section-size').textContent,
      cards: cards.length,
      pairs: cards.filter(c => c.classList.contains('product-pair')).length,
      firstPair: titles.slice(0, 2),
      secondPair: titles.slice(2, 4),
      afterCarBlock: sec.getBoundingClientRect().top >= document.querySelector('.car-block').getBoundingClientRect().bottom,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
