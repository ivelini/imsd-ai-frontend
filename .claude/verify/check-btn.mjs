import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 648, 768]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const btn = document.querySelector('.catalog-product:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) .buy-now');
    const cs = getComputedStyle(btn);
    const p = btn.querySelector('p');
    const img = btn.querySelector('img');
    return {
      text: btn.textContent.trim(),
      pVisible: p && getComputedStyle(p).display !== 'none',
      imgVisible: img && getComputedStyle(img).display !== 'none',
      w: cs.width, h: cs.height,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
