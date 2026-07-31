import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 647, 648, 649, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const info = document.querySelector('.model-info');
    const img = info.querySelector('.model-description-image img');
    const params = info.querySelector('.model-description-params');
    const ir = img.getBoundingClientRect(), pr = params.getBoundingClientRect(), fr = info.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const isMobile = vw <= 648;
    return {
      imgW: Math.round(ir.width),
      centered: isMobile ? Math.abs((ir.left + ir.width / 2) - vw / 2) < 4 : ir.left < pr.left,
      paramsFull: isMobile ? pr.width >= fr.width - 2 : pr.right <= fr.right,
      verticallyCentered: Math.abs((ir.top + ir.height / 2) - (pr.top + pr.height / 2)) < 8,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
