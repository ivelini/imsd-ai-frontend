import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const input = document.querySelector('.auto-select-input');
    const models = document.querySelector('.auto-models');
    const products = document.querySelectorAll('.catalog-product').length;
    const mr = models.getBoundingClientRect();
    const first = document.querySelector('.catalog-product')?.getBoundingClientRect();
    return {
      inputValue: input?.value,
      submit: document.querySelector('.auto-select-submit')?.textContent,
      help: document.querySelectorAll('.auto-select-help a').length,
      modelsTitle: models?.querySelector('.auto-models-title')?.textContent,
      modelLinks: models?.querySelectorAll('a').length,
      modelsBeforeList: first ? mr.bottom <= first.top : true,
      products,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
