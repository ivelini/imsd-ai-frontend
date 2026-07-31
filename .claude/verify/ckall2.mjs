import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto-selected.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const car = document.querySelector('.car-block');
    const sec = document.querySelector('.category-section');
    const groups = [...document.querySelectorAll('.pair-group')];
    return {
      carName: car?.querySelector('.car-name')?.textContent.trim(),
      carSections: car?.querySelectorAll('.car-section').length,
      checks: car?.querySelectorAll('input[type="checkbox"]').length,
      catHeader: sec?.querySelector('.category-section-header')?.textContent,
      catSize: sec?.querySelector('.category-section-size')?.textContent,
      groups: groups.length,
      perGroup: groups.map(g => g.querySelectorAll('.catalog-product').length),
      pairClass: groups.every(g => g.querySelector('.product-pair') !== null),
      order: car.getBoundingClientRect().bottom <= sec.getBoundingClientRect().top,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
