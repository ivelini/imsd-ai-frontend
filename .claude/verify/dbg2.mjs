import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 768, height: 900 } });
await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const b = document.querySelector('.benefits');
  const sq = document.querySelector('.search-query-blk');
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    const rect = el.getBoundingClientRect();
    if (rect.right > document.documentElement.clientWidth + 1 && el.offsetParent !== null) {
      out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 40), right: Math.round(rect.right) });
    }
  }
  return {
    bPad: getComputedStyle(b).padding, bBox: getComputedStyle(b).boxSizing, bWidth: getComputedStyle(b).width,
    sqPad: getComputedStyle(sq).padding, sqBox: getComputedStyle(sq).boxSizing, sqWidth: getComputedStyle(sq).width,
    offenders: out.slice(0, 5),
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
