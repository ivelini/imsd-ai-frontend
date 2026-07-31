import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const pp = document.querySelector('.product-parameters');
    return { w: Math.round(pp.getBoundingClientRect().width), vw: document.documentElement.clientWidth, cs: getComputedStyle(pp).maxWidth };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
