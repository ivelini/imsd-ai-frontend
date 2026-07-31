import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [640, 768, 1024, 1360]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const inner = s => { const el = document.querySelector(s); const r = el.getBoundingClientRect(); return { left: Math.round(r.left), w: Math.round(r.width), padL: getComputedStyle(el).paddingLeft }; };
    const b = document.querySelector('.benefits');
    const firstBadge = b.querySelector('a.benefit').getBoundingClientRect();
    const sq = document.querySelector('.search-query-blk');
    const sqText = sq.querySelector('p').getBoundingClientRect();
    const cont = document.querySelector('.container.product-container');
    const contRect = cont.getBoundingClientRect();
    return {
      badgeText: Math.round(firstBadge.left),
      badgePad: getComputedStyle(b).paddingLeft,
      crumbText: Math.round(sqText.left),
      crumbPad: getComputedStyle(sq).paddingLeft,
      contentInner: Math.round(contRect.left) + parseFloat(getComputedStyle(cont).paddingLeft),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
