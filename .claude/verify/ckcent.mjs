import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [649, 768, 1024, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const info = document.querySelector('.model-info');
    const img = info.querySelector('.model-description-image');
    const params = info.querySelector('.model-description-params');
    const ir = img.getBoundingClientRect(), pr = params.getBoundingClientRect(), fr = info.getBoundingClientRect();
    const pairLeft = Math.min(ir.left, pr.left), pairRight = Math.max(ir.right, pr.right);
    const pairCenter = (pairLeft + pairRight) / 2;
    const blockCenter = fr.left + fr.width / 2;
    return {
      pairCentered: Math.abs(pairCenter - blockCenter) < 6,
      pairWidth: Math.round(pairRight - pairLeft),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
