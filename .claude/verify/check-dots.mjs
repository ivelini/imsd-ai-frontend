import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.parameter-item')];
    const dots = items.map(li => {
      const d = li.querySelector('.parameter-dots');
      if (!d) return { missing: true };
      const dr = d.getBoundingClientRect();
      const nr = li.querySelector('.parameter-name').getBoundingClientRect();
      const vr = li.querySelector('.parameter-value, .p-badge').getBoundingClientRect();
      const lr = li.getBoundingClientRect();
      return {
        between: dr.left >= nr.right && dr.right <= vr.left,
        bottomAligned: Math.abs(dr.bottom - lr.bottom) <= 6,
        border: getComputedStyle(d).borderBottomStyle,
      };
    });
    return { ok: dots.every(x => !x.missing && x.between && x.bottomAligned && x.border === 'dotted'), dots: dots.slice(0, 3), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
