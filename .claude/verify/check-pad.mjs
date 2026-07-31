import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 648, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const btn = document.querySelector('.catalog-product:nth-child(1) .buy-now');
    const br = btn.getBoundingClientRect();
    const p = btn.querySelector('p').getBoundingClientRect();
    const img = btn.querySelector('img').getBoundingClientRect();
    const cs = getComputedStyle(btn);
    return {
      btnW: Math.round(br.width),
      padL: cs.paddingLeft, padR: cs.paddingRight,
      textLeftGap: Math.round(p.left - br.left),
      iconRightGap: Math.round(br.right - img.right),
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
