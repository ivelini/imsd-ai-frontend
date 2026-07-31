import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto-selected.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const names = [...document.querySelectorAll('.car-section-name')];
    const chip = document.querySelector('.custom-checkbox-container');
    const cs = getComputedStyle(chip);
    return {
      noIcons: names.every(n => !n.querySelector('svg')),
      names: names.map(n => n.textContent.trim()),
      chip: { border: cs.borderTopWidth + ' ' + cs.borderTopStyle, radius: cs.borderRadius, pad: cs.padding },
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
