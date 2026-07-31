import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.auto-select-row')];
    return {
      rows: rows.map(r => ({
        title: r.querySelector('.auto-select-row-title').textContent,
        chips: r.querySelectorAll('.auto-select-chip').length,
        active: r.querySelector('.auto-select-chip_active')?.textContent,
      })),
      noForm: !document.querySelector('.auto-select-input, .auto-select-submit'),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
