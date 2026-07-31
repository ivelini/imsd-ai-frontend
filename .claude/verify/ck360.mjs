import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [320, 360, 390, 649]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const info = document.querySelector('.model-info');
    const params = info.querySelector('.model-description-params');
    const img = info.querySelector('.model-description-image');
    const pr = params.getBoundingClientRect(), ir = img.getBoundingClientRect(), fr = info.getBoundingClientRect();
    return {
      paramsW: Math.round(pr.width),
      fullWidth: pr.width >= fr.width - 2,
      imgCentered: Math.abs((ir.left + ir.width / 2) - document.documentElement.clientWidth / 2) < 4,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
