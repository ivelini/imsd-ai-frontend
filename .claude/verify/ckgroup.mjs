import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto-selected.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const groups = [...document.querySelectorAll('.pair-group')];
    const first = groups[0];
    const cs = getComputedStyle(first);
    return {
      groups: groups.length,
      cardsPerGroup: groups.map(g => g.querySelectorAll('.catalog-product').length),
      border: cs.borderTopWidth + ' ' + cs.borderTopStyle,
      radius: cs.borderRadius,
      pad: cs.padding,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
