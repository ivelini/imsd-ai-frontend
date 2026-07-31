import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const params = [...document.querySelectorAll('.model-param')];
    const ok = params.map(p => {
      const d = p.querySelector('.parameter-dots');
      if (!d) return { missing: true };
      const dr = d.getBoundingClientRect();
      const nr = p.querySelector('.model-param-name').getBoundingClientRect();
      const vr = p.querySelector('.model-param-value').getBoundingClientRect();
      return {
        between: dr.left >= nr.right && dr.right <= vr.left,
        border: getComputedStyle(d).borderBottomStyle,
        gapL: Math.round(dr.left - nr.right),
        gapR: Math.round(vr.left - dr.right),
      };
    });
    return { count: params.length, all: ok.every(x => !x.missing && x.between && x.border === 'dotted'), sample: ok.slice(0, 2), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
