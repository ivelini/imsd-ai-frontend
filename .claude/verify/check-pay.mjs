import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const pi = document.querySelector('.payment-info');
    const opts = [...pi.querySelectorAll('.payment-option')];
    const rects = opts.map(o => o.getBoundingClientRect());
    return {
      count: opts.length,
      direction: getComputedStyle(pi).flexDirection,
      stacked: rects.length === 2 && rects[1].top > rects[0].bottom,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
