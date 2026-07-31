import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const desc = document.querySelector('.model-description');
    const info = desc.querySelector('.model-info');
    const img = desc.querySelector('.model-description-image');
    const params = desc.querySelector('.model-description-params');
    const text = desc.querySelector('.model-description-text');
    const cs = getComputedStyle(desc);
    const ir = info.getBoundingClientRect(), im = img.getBoundingClientRect(),
          pr = params.getBoundingClientRect(), tr = text.getBoundingClientRect(), dr = desc.getBoundingClientRect();
    return {
      noPanel: cs.background === 'rgba(0, 0, 0, 0)' && cs.boxShadow === 'none',
      infoRow: ir.width >= 600 ? im.left < pr.left && pr.right <= ir.right : true,
      imageLeft: im.left <= pr.left,
      textFullWidth: tr.width >= dr.width - 2,
      textBelow: tr.top >= pr.bottom,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
