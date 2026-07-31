import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto-selected.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const block = document.querySelector('.car-block');
    const sections = [...block.querySelectorAll('.car-section')];
    const first = document.querySelector('.catalog-product');
    return {
      carName: block.querySelector('.car-name').textContent.trim(),
      sections: sections.map(s => ({
        name: s.querySelector('.car-section-name span').textContent,
        icon: !!s.querySelector('.car-section-name svg'),
        checks: s.querySelectorAll('input[type="checkbox"]').length,
        labels: [...s.querySelectorAll('label')].map(l => l.textContent.trim()),
      })),
      beforeList: block.getBoundingClientRect().bottom <= first.getBoundingClientRect().top,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
