import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const card = document.querySelector('.catalog-product');
  const imgBox = card.querySelector('.catalog-product-image');
  const img = imgBox.querySelector('img');
  const label = imgBox.querySelector('.eu-label');
  const ir = img.getBoundingClientRect(), lr = label.getBoundingClientRect(), br = imgBox.getBoundingClientRect();
  const cs = getComputedStyle(imgBox), ims = getComputedStyle(img), ls = getComputedStyle(label);
  return {
    imgBox: { display: cs.display, flexDir: cs.flexDirection, height: Math.round(br.height), pos: cs.position },
    img: { h: Math.round(ir.height), w: Math.round(ir.width), marginBottom: ims.marginBottom, display: ims.display },
    label: { top: Math.round(lr.top), imgBottom: Math.round(ir.bottom), gap: Math.round(lr.top - ir.bottom), marginTop: ls.marginTop },
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
