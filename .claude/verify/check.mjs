import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
const report = await page.evaluate(() => {
  const el = document.querySelector('.catalog-with-products');
  if (!el) return { found: false };
  const r = el.getBoundingClientRect();
  return {
    left: r.left,
    right: r.right,
    vw: document.documentElement.clientWidth,
    gapLeft: r.left,
    gapRight: document.documentElement.clientWidth - r.right,
    pl: getComputedStyle(el).paddingLeft,
    pr: getComputedStyle(el).paddingRight,
  };
});
console.log(JSON.stringify(report, null, 2));
await browser.close();
