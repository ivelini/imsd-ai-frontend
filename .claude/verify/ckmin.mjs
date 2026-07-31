import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 649, 700, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const info = document.querySelector('.model-info');
    const img = info.querySelector('.model-description-image');
    const params = info.querySelector('.model-description-params');
    const ir = img.getBoundingClientRect(), pr = params.getBoundingClientRect(), fr = info.getBoundingClientRect();
    return {
      paramsW: Math.round(pr.width),
      minOk: pr.width >= 360 || document.documentElement.clientWidth <= 648,
      fullOnMobile: document.documentElement.clientWidth <= 648 ? pr.width >= fr.width - 2 : true,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
