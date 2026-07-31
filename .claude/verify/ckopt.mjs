import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto-selected.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const opt = document.querySelector('.auto-options');
    const found = document.querySelector('.auto-found');
    const fr = found.getBoundingClientRect();
    const first = document.querySelector('.catalog-product').getBoundingClientRect();
    return {
      title: document.querySelector('h2').textContent,
      groups: [...opt.querySelectorAll('.auto-options-group')].map(g => ({
        title: g.querySelector('.auto-options-group-title').textContent,
        checks: g.querySelectorAll('input[type="checkbox"]').length,
        checked: g.querySelectorAll('input:checked').length,
      })),
      submit: opt.querySelector('.auto-select-submit')?.textContent,
      reset: !!opt.querySelector('.auto-options-reset'),
      found: found.textContent,
      foundBeforeList: fr.bottom <= first.top,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
