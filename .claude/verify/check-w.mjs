import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const pp = document.querySelector('.product-parameters');
    const ppr = pp.getBoundingClientRect();
    const li = pp.querySelector('.parameter-item');
    const nr = li.querySelector('.parameter-name').getBoundingClientRect();
    const vr = li.querySelector('.parameter-value').getBoundingClientRect();
    const lr = li.getBoundingClientRect();
    const dots = li.querySelector('.parameter-dots').getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    return {
      paramsFullWidth: Math.abs(ppr.width - vw) <= 2,
      nameNoFixed: Math.abs(nr.width - 160) > 5,
      valueNoFixed: Math.abs(vr.width - 120) > 5,
      dotsFill: Math.abs(dots.width - (lr.width - nr.width - vr.width)) <= 2,
      nameLeft: nr.left <= lr.left + 1,
      valueRight: Math.abs(lr.right - vr.right) <= 1,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
