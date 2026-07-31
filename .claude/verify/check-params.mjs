import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.parameter-item')];
    const res = items.map(li => {
      const lr = li.getBoundingClientRect();
      const name = li.querySelector('.parameter-name').getBoundingClientRect();
      const val = li.querySelector('.parameter-value, .p-badge').getBoundingClientRect();
      return {
        nameLeft: Math.round(name.left - lr.left) <= 1,
        valueRight: Math.abs(lr.right - val.right) <= 1,
      };
    });
    return { allAligned: res.every(x => x.nameLeft && x.valueRight), res, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
