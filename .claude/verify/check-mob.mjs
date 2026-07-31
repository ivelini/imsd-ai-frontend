import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 648, 649]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const fc = document.querySelector('.catalog-product:nth-child(2) > div:nth-child(2) > div:nth-child(2)');
    if (!fc) return { found: false };
    const cs = getComputedStyle(fc);
    const kids = [...fc.children].map(el => ({ cls: el.className, order: getComputedStyle(el).order }));
    const pa = fc.querySelector('.catalog-product-purchase-actions');
    return {
      found: true,
      display: cs.display, direction: cs.flexDirection, gap: cs.gap, alignItems: cs.alignItems,
      kids,
      paOrder: getComputedStyle(pa).order,
      paIsLast: fc.lastElementChild === pa,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
