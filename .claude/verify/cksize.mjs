import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const chips = [...document.querySelectorAll('.seo-size-link')];
    const first = chips[0];
    const cs = first ? getComputedStyle(first) : null;
    return {
      count: chips.length,
      chipStyle: cs ? { border: cs.borderTopWidth + ' ' + cs.borderTopStyle, radius: cs.borderRadius, pad: cs.padding } : null,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
