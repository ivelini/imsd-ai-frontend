import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [320, 390, 640, 768]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const b = document.querySelector('.benefits');
    const benefits = [...b.querySelectorAll('.benefit')].map(el => {
      const rect = el.getBoundingClientRect();
      // центр пары svg+span
      const svg = el.querySelector('svg').getBoundingClientRect();
      const span = el.querySelector('span').getBoundingClientRect();
      const contentCenter = (Math.min(svg.left, span.left) + Math.max(svg.right, span.right)) / 2;
      const ownCenter = rect.left + rect.width / 2;
      return {
        w: Math.round(rect.width),
        centered: Math.abs(contentCenter - ownCenter) < 2,
      };
    });
    const cont = document.querySelector('.container.product-container');
    return {
      benefits,
      gap: Math.abs(b.getBoundingClientRect().left - cont.getBoundingClientRect().left),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
